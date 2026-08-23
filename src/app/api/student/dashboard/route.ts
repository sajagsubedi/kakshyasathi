import { withHandler } from "@/lib/api/ApiHandler";
import { requireStudent } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import StudentModel from "@/models/Student.model";
import TimetableModel from "@/models/Timetable.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import NoticeModel from "@/models/Notice.model";
import { DayOfWeek, NoticeTargetType } from "@/types";

const timetablePopulate = [
  { path: "subject", select: "name code" },
  { path: "teacher", populate: { path: "user", select: "name username" } },
];

export const GET = withHandler(async () => {
  const session = await requireStudent();
  await connectDb();

  const student = await StudentModel.findOne({ user: session.user._id })
    .populate("section", "name")
    .lean();

  if (!student) {
    return ApiResponse(
      { profile: null, attendance: [], timetable: [], notices: [] },
      "Student profile not found",
    );
  }

  const sectionId = student.section;
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

  const [timetable, attendance, notices] = await Promise.all([
    TimetableModel.find({ section: sectionId })
      .populate(timetablePopulate)
      .sort({ dayOfWeek: 1, periodNumber: 1 })
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

  const todaySchedule = timetable.filter((t) => t.dayOfWeek === todayDay);

  return ApiResponse(
    {
      profile: {
        id: String(student._id),
        fullName: session.user.name,
        username: session.user.username,
        sectionId: String(sectionId),
        rollNumber: student.rollNumber,
        symbolNumber: student.symbolNumber,
      },
      attendance: attendance.map((a) => ({
        id: String(a._id),
        date: (a.attendanceSession as { date: Date }).date,
        status: a.status.toUpperCase(),
        scannedAt: a.markedAt,
      })),
      timetable: timetable.map((t) => ({
        id: String(t._id),
        dayOfWeek: dayOfWeekToNumber(t.dayOfWeek),
        periodNumber: t.periodNumber,
        subjectId: String(t.subject),
        teacherId: String(t.teacher),
      })),
      todaySchedule: todaySchedule.map((t) => ({
        id: String(t._id),
        periodNumber: t.periodNumber,
        subjectId: String(t.subject),
        teacherId: String(t.teacher),
      })),
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
