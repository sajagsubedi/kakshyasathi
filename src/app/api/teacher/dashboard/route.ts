import { withHandler } from "@/lib/api/ApiHandler";
import { requireTeacher } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherModel from "@/models/Teacher.model";
import TimetableModel from "@/models/Timetable.model";
import PeriodModel from "@/models/Period.model";
import TeacherPresenceModel from "@/models/TeacherPresence.model";
import NoticeModel from "@/models/Notice.model";
import SectionModel from "@/models/Section.model";
import StudentModel from "@/models/Student.model";
import { DayOfWeek, NoticeTargetType } from "@/types";

const dayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  await connectDb();

  const userId = session.user._id;
  const teacher = await TeacherModel.findOne({ user: userId }).lean();
  if (!teacher) {
    return ApiResponse(
      { sections: [], timetable: [], todaySchedule: [], presence: [], notices: [] },
      "Teacher profile not found",
    );
  }

  const assignedSectionIds = (teacher.assignedSections ?? []).map((s) => String(s));
  const dayIdx = new Date().getDay();

  const [timetable, presence, notices, assignedSections] = await Promise.all([
    TimetableModel.find({ teacher: teacher._id })
      .populate("subject", "name code")
      .populate({
        path: "section",
        populate: { path: "class", select: "name grade academicYear" },
      })
      .populate("classroom", "roomNumber")
      .sort({ dayOfWeek: 1, periodNumber: 1 })
      .lean(),
    TeacherPresenceModel.find({ teacher: teacher._id })
      .populate("classroom", "roomNumber")
      .sort({ entryTime: -1 })
      .limit(20)
      .lean(),
    NoticeModel.find({
      $or: [
        { targetType: NoticeTargetType.all },
        ...(assignedSectionIds.length > 0
          ? [{ targetSections: { $in: assignedSectionIds } }]
          : []),
      ],
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean(),
    SectionModel.find({ _id: { $in: assignedSectionIds } })
      .populate({
        path: "class",
        populate: { path: "academicYear", select: "label isActive" },
      })
      .lean(),
  ]);

  const globalPeriods = await PeriodModel.find({}).lean();
  const globalPeriodMap = new Map<number, { startTime: string; endTime: string }>();
  globalPeriods.forEach((p) => {
    if (!globalPeriodMap.has(p.periodNumber)) {
      globalPeriodMap.set(p.periodNumber, {
        startTime: p.startTime,
        endTime: p.endTime,
      });
    }
  });

  const studentCounts = await StudentModel.aggregate([
    { $match: { section: { $in: assignedSections.map((s) => s._id) } } },
    { $group: { _id: "$section", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(studentCounts.map((c) => [String(c._id), c.count]));

  const formattedSections = assignedSections.map((s) => {
    const cls = s.class as unknown as {
      _id?: unknown;
      name?: string;
      grade?: number;
      academicYear?: { label?: string } | string;
    } | undefined;

    const academicYearLabel =
      typeof cls?.academicYear === "object" && cls?.academicYear !== null
        ? cls.academicYear.label ?? ""
        : String(cls?.academicYear ?? "");

    return {
      id: String(s._id),
      name: s.name,
      className: cls?.name ?? "",
      grade: cls?.grade,
      academicYear: academicYearLabel,
      studentCount: countMap.get(String(s._id)) ?? 0,
    };
  });

  const sectionNameMap = new Map<string, string>();
  assignedSections.forEach((s) => {
    const cls = s.class as unknown as { name?: string } | undefined;
    sectionNameMap.set(String(s._id), cls?.name ? `${cls.name} - ${s.name}` : `Section ${s.name}`);
  });

  const formattedTimetable = timetable.map((t) => {
    const secObj = t.section as unknown as { _id?: unknown; name?: string; class?: { name?: string; grade?: number } } | undefined;
    const subObj = t.subject as unknown as { _id?: unknown; name?: string; code?: string } | undefined;
    const roomObj = t.classroom as unknown as { _id?: unknown; roomNumber?: string } | undefined;
    const fallback = globalPeriodMap.get(t.periodNumber);
    const dayStr = String(t.dayOfWeek).toLowerCase();
    const dayNum = dayMap[dayStr] ?? 0;
    const isCustomTiming = Boolean(t.customStartTime && t.customEndTime);

    return {
      id: String(t._id),
      sectionId: String(secObj?._id || t.section),
      sectionName: secObj?.class?.name ? `${secObj.class.name} - Section ${secObj.name}` : `Section ${secObj?.name || '—'}`,
      className: secObj?.class?.name,
      dayOfWeek: dayNum,
      periodNumber: t.periodNumber,
      subjectId: String(subObj?._id || t.subject),
      subjectName: subObj?.name ?? "Unknown Subject",
      subjectCode: subObj?.code ?? "",
      teacherId: String(teacher._id),
      teacherName: session.user.name,
      classroomId: roomObj?._id ? String(roomObj._id) : undefined,
      roomNumber: roomObj?.roomNumber ?? "",
      customStartTime: t.customStartTime,
      customEndTime: t.customEndTime,
      startTime: t.customStartTime || fallback?.startTime || "",
      endTime: t.customEndTime || fallback?.endTime || "",
      isCustomTiming,
    };
  });

  const todaySchedule = formattedTimetable
    .filter((t) => t.dayOfWeek === dayIdx)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  return ApiResponse(
    {
      sections: formattedSections,
      timetable: formattedTimetable,
      todaySchedule,
      presence: presence.map((p) => {
        const roomObj = p.classroom as unknown as { roomNumber?: string } | undefined;
        const matchingEntry = timetable.find((t) => t.periodNumber === p.periodNumber);
        const matchingSec = matchingEntry?.section as unknown as { name?: string; class?: { name?: string } } | undefined;
        const sectionLabel = matchingSec?.class?.name ? `${matchingSec.class.name} - ${matchingSec.name}` : undefined;

        return {
          id: String(p._id),
          date: p.date ? new Date(p.date).toISOString().split("T")[0] : "",
          sectionId: String(matchingEntry?.section?._id || matchingEntry?.section || ""),
          sectionName: sectionLabel,
          periodNumber: p.periodNumber,
          roomNumber: roomObj?.roomNumber,
          enteredAt: p.entryTime ? new Date(p.entryTime).toISOString() : "",
          exitedAt: p.exitTime ? new Date(p.exitTime).toISOString() : undefined,
        };
      }),
      notices: notices.map((n) => ({
        id: String(n._id),
        title: n.title,
        content: n.body,
        targetType: n.targetType,
        targetSections: (n.targetSections ?? []).map(String),
        priority: "MEDIUM",
        createdAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : new Date().toISOString(),
      })),
    },
    "Teacher dashboard fetched successfully",
  );
});
