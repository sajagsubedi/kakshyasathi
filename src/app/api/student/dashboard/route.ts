import { withHandler } from "@/lib/api/ApiHandler";
import { requireStudent } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import StudentModel from "@/models/Student.model";
import SectionModel from "@/models/Section.model";
import TimetableModel from "@/models/Timetable.model";
import PeriodModel from "@/models/Period.model";
import SubstitutionModel from "@/models/Substitution.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import NoticeModel from "@/models/Notice.model";
import { DayOfWeek, NoticeTargetType } from "@/types";

const dayNamesList: DayOfWeek[] = [
  DayOfWeek.sunday,
  DayOfWeek.monday,
  DayOfWeek.tuesday,
  DayOfWeek.wednesday,
  DayOfWeek.thursday,
  DayOfWeek.friday,
  DayOfWeek.saturday,
];

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
  const session = await requireStudent();
  await connectDb();

  const student = await StudentModel.findOne({ user: session.user._id })
    .populate({
      path: "section",
      populate: {
        path: "class",
        populate: { path: "academicYear", select: "label isActive" },
      },
    })
    .lean();

  if (!student || !student.section) {
    return ApiResponse(
      { profile: null, attendance: [], timetable: [], todaySchedule: [], notices: [] },
      "Student profile not found",
    );
  }

  const sec = student.section as unknown as {
    _id?: unknown;
    name?: string;
    class?: {
      _id?: unknown;
      name?: string;
      grade?: number;
      academicYear?: { _id?: unknown; label?: string } | string;
    };
  } | undefined;

  const academicYearId =
    typeof sec?.class?.academicYear === "object" && sec?.class?.academicYear !== null
      ? sec.class.academicYear._id
      : sec?.class?.academicYear;

  const academicYearLabel =
    typeof sec?.class?.academicYear === "object" && sec?.class?.academicYear !== null
      ? sec.class.academicYear.label ?? ""
      : String(sec?.class?.academicYear ?? "");

  const sectionId = student.section;
  const now = new Date();
  const dayIdx = now.getDay();
  const currentDayName = dayNamesList[dayIdx] || DayOfWeek.sunday;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [timetable, globalPeriods, todaySubstitutions, attendance, notices] = await Promise.all([
    TimetableModel.find({ section: sectionId })
      .populate("subject", "name code")
      .populate({
        path: "teacher",
        populate: { path: "user", select: "name username" },
      })
      .populate("classroom", "roomNumber")
      .sort({ dayOfWeek: 1, periodNumber: 1 })
      .lean(),
    academicYearId
      ? PeriodModel.find({ academicYear: academicYearId }).lean()
      : Promise.resolve([]),
    SubstitutionModel.find({
      section: sectionId,
      date: { $gte: todayStart, $lte: todayEnd },
    })
      .populate({
        path: "originalTeacher",
        populate: { path: "user", select: "name username" },
      })
      .populate({
        path: "substituteTeacher",
        populate: { path: "user", select: "name username" },
      })
      .lean(),
    StudentAttendanceModel.find({ student: student._id })
      .populate({
        path: "attendanceSession",
        select: "date periodNumber section",
      })
      .sort({ markedAt: -1 })
      .limit(50)
      .lean(),
    NoticeModel.find({
      $or: [
        { targetType: NoticeTargetType.all },
        { targetSections: { $in: [sectionId] } },
      ],
    })
      .sort({ publishedAt: -1 })
      .lean(),
  ]);

  const globalPeriodMap = new Map<number, { startTime: string; endTime: string }>();
  globalPeriods.forEach((p) => {
    globalPeriodMap.set(p.periodNumber, {
      startTime: p.startTime,
      endTime: p.endTime,
    });
  });

  const subMap = new Map<number, unknown>();
  todaySubstitutions.forEach((s) => {
    subMap.set(s.periodNumber, s);
  });

  const formattedTimetable = timetable.map((t) => {
    const subjectObj = t.subject as unknown as { _id?: unknown; name?: string; code?: string } | undefined;
    const teacherObj = t.teacher as unknown as { _id?: unknown; user?: { name?: string; username?: string } } | undefined;
    const classroomObj = t.classroom as unknown as { _id?: unknown; roomNumber?: string } | undefined;
    const fallback = globalPeriodMap.get(t.periodNumber);
    const isCustomTiming = Boolean(t.customStartTime && t.customEndTime);
    const dayStr = String(t.dayOfWeek).toLowerCase();

    return {
      id: String(t._id),
      dayOfWeek: dayMap[dayStr] ?? 0,
      periodNumber: t.periodNumber,
      subjectId: String(subjectObj?._id || t.subject),
      subjectName: subjectObj?.name ?? "Unknown Subject",
      subjectCode: subjectObj?.code ?? "",
      teacherId: String(teacherObj?._id || t.teacher),
      teacherName: teacherObj?.user?.name ?? "Unassigned",
      classroomId: classroomObj?._id ? String(classroomObj._id) : undefined,
      roomNumber: classroomObj?.roomNumber ?? "",
      customStartTime: t.customStartTime,
      customEndTime: t.customEndTime,
      startTime: t.customStartTime || fallback?.startTime || "",
      endTime: t.customEndTime || fallback?.endTime || "",
      isCustomTiming,
    };
  });

  const todaySchedule = formattedTimetable
    .filter((t) => t.dayOfWeek === dayIdx)
    .sort((a, b) => a.periodNumber - b.periodNumber)
    .map((entry) => {
      const sub = subMap.get(entry.periodNumber) as
        | {
            substituteTeacher?: { user?: { name?: string } };
            originalTeacher?: { user?: { name?: string } };
          }
        | undefined;

      return {
        ...entry,
        teacherName: sub?.substituteTeacher?.user?.name
          ? `${sub.substituteTeacher.user.name} (Sub)`
          : entry.teacherName,
        isSubstitution: Boolean(sub),
        substituteTeacherName: sub?.substituteTeacher?.user?.name,
        originalTeacherName: sub?.originalTeacher?.user?.name,
      };
    });

  return ApiResponse(
    {
      profile: {
        id: String(student._id),
        fullName: session.user.name,
        username: session.user.username,
        email: session.user.email,
        sectionId: sec?._id ? String(sec._id) : String(sectionId),
        sectionName: sec?.name ?? "",
        className: sec?.class?.name ?? "",
        grade: sec?.class?.grade,
        academicYear: academicYearLabel,
        rollNumber: student.rollNumber,
        symbolNumber: student.symbolNumber,
        enrollmentYear: student.enrollmentYear,
        guardianContact: student.guardianContact ?? "",
      },
      attendance: attendance.map((a) => {
        const sessionObj = a.attendanceSession as unknown as {
          date?: Date;
          periodNumber?: number;
        } | undefined;

        return {
          id: String(a._id),
          date: sessionObj?.date
            ? new Date(sessionObj.date).toISOString().split("T")[0]
            : new Date(a.markedAt).toISOString().split("T")[0],
          status: String(a.status || "").toUpperCase(),
          periodNumber: sessionObj?.periodNumber,
          scannedAt: a.markedAt ? new Date(a.markedAt).toISOString() : undefined,
        };
      }),
      timetable: formattedTimetable,
      todaySchedule,
      notices: notices.map((n) => ({
        id: String(n._id),
        title: n.title,
        content: n.body,
        priority: "MEDIUM",
        createdAt: n.publishedAt,
      })),
    },
    "Student dashboard fetched successfully",
  );
});
