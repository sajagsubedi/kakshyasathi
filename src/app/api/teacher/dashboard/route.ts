import { withHandler } from "@/lib/api/ApiHandler";
import { requireTeacher } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherModel from "@/models/Teacher.model";
import TimetableModel from "@/models/Timetable.model";
import TeacherPresenceModel from "@/models/TeacherPresence.model";
import NoticeModel from "@/models/Notice.model";
import SectionModel from "@/models/Section.model";
import { DayOfWeek, NoticeTargetType } from "@/types";

const timetablePopulate = [
  { path: "section", populate: { path: "class", select: "name grade" } },
  { path: "subject", select: "name code" },
  { path: "classroom", select: "roomNumber" },
];

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  await connectDb();

  const userId = session.user._id;
  const teacher = await TeacherModel.findOne({ user: userId }).lean();
  if (!teacher) {
    return ApiResponse(
      { sections: [], timetable: [], presence: [], notices: [] },
      "Teacher profile not found",
    );
  }

  const dayIdx = new Date().getDay();
  const dayOfWeekMap: Record<number, DayOfWeek> = {
    0: DayOfWeek.sunday,
    1: DayOfWeek.monday,
    2: DayOfWeek.tuesday,
    3: DayOfWeek.wednesday,
    4: DayOfWeek.thursday,
    5: DayOfWeek.friday,
    6: DayOfWeek.saturday,
  };
  const todayDay = dayOfWeekMap[dayIdx];

  const [timetable, presence, notices, assignedSections] = await Promise.all([
    TimetableModel.find({ teacher: teacher._id })
      .populate(timetablePopulate)
      .sort({ dayOfWeek: 1, periodNumber: 1 })
      .lean(),
    TeacherPresenceModel.find({ teacher: teacher._id })
      .populate("classroom", "roomNumber")
      .sort({ entryTime: -1 })
      .limit(20)
      .lean(),
    NoticeModel.find({
      $or: [{ targetType: NoticeTargetType.all }],
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean(),
    SectionModel.find({ _id: { $in: teacher.assignedSections ?? [] } })
      .populate("class", "name grade")
      .lean(),
  ]);

  const todaySchedule = timetable.filter((t) => t.dayOfWeek === todayDay);

  return ApiResponse(
    {
      sections: assignedSections.map((s) => ({
        id: String(s._id),
        name: s.name,
        academicYear: (s.class as { academicYear?: string })?.academicYear ?? "",
        className: (s.class as { name?: string })?.name ?? "",
      })),
      timetable: timetable.map((t) => ({
        id: String(t._id),
        sectionId: String(t.section),
        dayOfWeek: dayOfWeekToNumber(t.dayOfWeek),
        periodNumber: t.periodNumber,
        subjectId: String(t.subject),
        classroomId: String(t.classroom),
        customStartTime: t.customStartTime,
        customEndTime: t.customEndTime,
      })),
      todaySchedule: todaySchedule.map((t) => ({
        id: String(t._id),
        sectionId: String(t.section),
        periodNumber: t.periodNumber,
        subjectId: String(t.subject),
      })),
      presence: presence.map((p) => ({
        id: String(p._id),
        date: p.date,
        sectionId: String(timetable.find((t) => t.periodNumber === p.periodNumber)?.section ?? ""),
        periodNumber: p.periodNumber,
        enteredAt: p.entryTime,
        exitedAt: p.exitTime,
      })),
      notices: notices.map((n) => ({
        id: String(n._id),
        title: n.title,
        content: n.body,
        targetType: n.targetType,
        targetSections: (n.targetSections ?? []).map(String),
        priority: "MEDIUM",
        createdAt: n.publishedAt,
      })),
    },
    "Teacher dashboard fetched successfully",
  );
});

function dayOfWeekToNumber(day: string): number {
  const map: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return map[day] ?? 0;
}
