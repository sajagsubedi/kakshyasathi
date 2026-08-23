import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import ClassModel from "@/models/Class.model";
import AcademicYearModel from "@/models/AcademicYear.model";
import SectionModel from "@/models/Section.model";
import StudentModel from "@/models/Student.model";
import TimetableModel from "@/models/Timetable.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import TeacherModel from "@/models/Teacher.model";
import { parseObjectId } from "@/lib/api/parseId";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withHandler(async (_req, context: RouteContext) => {
  await requireAdmin();
  await connectDb();
  const { id } = await context.params;
  parseObjectId(id);

  const cls = await ClassModel.findById(id)
    .populate("academicYear", "label")
    .lean();
  if (!cls) throw new Error("Class not found");

  const sections = await SectionModel.find({ class: id }).lean();
  const sectionIds = sections.map((s) => s._id);

  const [students, timetable, teacherCount] = await Promise.all([
    StudentModel.find({ section: { $in: sectionIds } })
      .populate("user", "name username email phone")
      .lean(),
    TimetableModel.find({ section: { $in: sectionIds } })
      .populate("subject", "name code")
      .populate({ path: "teacher", populate: { path: "user", select: "name username" } })
      .lean(),
    TeacherModel.countDocuments({
      assignedSections: { $in: sectionIds },
    }),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [attendanceToday, totalAttendance, presentCount, recentAttendance] =
    await Promise.all([
      StudentAttendanceModel.countDocuments({
        student: { $in: students.map((s) => s._id) },
        markedAt: { $gte: todayStart, $lte: todayEnd },
      }),
      StudentAttendanceModel.countDocuments({
        student: { $in: students.map((s) => s._id) },
      }),
      StudentAttendanceModel.countDocuments({
        student: { $in: students.map((s) => s._id) },
        status: "present",
      }),
      StudentAttendanceModel.find({
        student: { $in: students.map((s) => s._id) },
      })
        .populate({ path: "attendanceSession", select: "date periodNumber section" })
        .sort({ markedAt: -1 })
        .limit(10)
        .lean(),
    ]);

  const absentCount = totalAttendance - presentCount;
  const rate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  const dayMap: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
  };

  const academicYearLabel =
    typeof cls.academicYear === "string"
      ? cls.academicYear
      : (cls.academicYear as { label?: string })?.label ?? "";

  return ApiResponse(
    {
      class: {
        _id: String(cls._id),
        name: cls.name,
        grade: cls.grade,
        academicYear: academicYearLabel,
      },
      sections: sections.map((s) => ({
        id: String(s._id),
        name: s.name,
        academicYear: academicYearLabel,
        studentCount: students.filter(
          (st) => String(st.section) === String(s._id),
        ).length,
      })),
      students: students.map((s) => ({
        id: String((s.user as { _id: string })._id),
        fullName: (s.user as { name: string }).name,
        username: (s.user as { username: string }).username,
        email: (s.user as { email?: string })?.email ?? "",
        phone: (s.user as { phone?: string })?.phone ?? "",
        sectionId: String(s.section),
        rollNumber: s.rollNumber,
      })),
      attendance: {
        today: {
          present: attendanceToday,
          absent: Math.max(students.length - attendanceToday, 0),
          late: 0,
        },
        overall: { rate },
        recent: recentAttendance.map((a) => ({
          id: String(a._id),
          date: (a.attendanceSession as { date: Date }).date,
          status: a.status,
          studentId: String(a.student),
          scannedAt: a.markedAt,
          sectionId: String(
            (a.attendanceSession as { section?: string }).section ?? "",
          ),
        })),
      },
      timetable: timetable.map((t) => ({
        id: String(t._id),
        dayOfWeek: dayMap[t.dayOfWeek] ?? 0,
        periodNumber: t.periodNumber,
        sectionId: String(t.section),
        subjectId: String(t.subject),
        subjectName: (t.subject as { name?: string })?.name ?? "",
        teacherId: String(t.teacher),
        teacherName:
          (t.teacher as { user?: { name?: string } })?.user?.name ?? "",
        startTime: t.customStartTime ?? "",
        endTime: t.customEndTime ?? "",
      })),
      teacherCount,
    },
    "Class details fetched successfully",
  );
});
