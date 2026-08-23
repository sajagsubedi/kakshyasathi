import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import ClassModel from "@/models/Class.model";
import SectionModel from "@/models/Section.model";
import ClassroomModel from "@/models/Classroom.model";
import StudentModel from "@/models/Student.model";
import TimetableModel from "@/models/Timetable.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import TeacherModel from "@/models/Teacher.model";
import PeriodModel from "@/models/Period.model";
import { parseObjectId } from "@/lib/api/parseId";
import { AttendanceStatus } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const dayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const GET = withHandler(async (_req, context: RouteContext) => {
  await requireAdmin();
  await connectDb();
  const { id } = await context.params;
  parseObjectId(id);

  const cls = await ClassModel.findById(id)
    .populate("academicYear", "label isActive")
    .lean();
  if (!cls) throw new Error("Class not found");

  const academicYearId =
    typeof cls.academicYear === "object" && cls.academicYear !== null
      ? (cls.academicYear as { _id: unknown })._id
      : cls.academicYear;

  const academicYearLabel =
    typeof cls.academicYear === "object" && cls.academicYear !== null
      ? (cls.academicYear as { label?: string })?.label ?? ""
      : String(cls.academicYear || "");

  const sections = await SectionModel.find({ class: id }).lean();
  const sectionIds = sections.map((s) => s._id);

  const [classrooms, students, timetable, assignedTeachers, globalPeriods] =
    await Promise.all([
      ClassroomModel.find({ section: { $in: sectionIds } }).lean(),
      StudentModel.find({ section: { $in: sectionIds } })
        .populate("user", "name username email phone gender")
        .sort({ rollNumber: 1 })
        .lean(),
      TimetableModel.find({ section: { $in: sectionIds } })
        .populate("subject", "name code")
        .populate({
          path: "teacher",
          populate: { path: "user", select: "name username" },
        })
        .populate("classroom", "roomNumber")
        .lean(),
      TeacherModel.find({ assignedSections: { $in: sectionIds } })
        .populate("user", "name username email")
        .populate("subjects", "name code")
        .lean(),
      academicYearId
        ? PeriodModel.find({ academicYear: academicYearId }).lean()
        : Promise.resolve([]),
    ]);

  const globalPeriodMap = new Map<number, { startTime: string; endTime: string }>();
  globalPeriods.forEach((p) => {
    globalPeriodMap.set(p.periodNumber, {
      startTime: p.startTime,
      endTime: p.endTime,
    });
  });

  const studentDocIds = students.map((s) => s._id);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [attendanceTodayPresent, attendanceTodayLate, totalAttendance, totalPresentCount, totalLateCount, recentAttendance] =
    await Promise.all([
      StudentAttendanceModel.countDocuments({
        student: { $in: studentDocIds },
        status: AttendanceStatus.present,
        markedAt: { $gte: todayStart, $lte: todayEnd },
      }),
      StudentAttendanceModel.countDocuments({
        student: { $in: studentDocIds },
        status: AttendanceStatus.late,
        markedAt: { $gte: todayStart, $lte: todayEnd },
      }),
      StudentAttendanceModel.countDocuments({
        student: { $in: studentDocIds },
      }),
      StudentAttendanceModel.countDocuments({
        student: { $in: studentDocIds },
        status: AttendanceStatus.present,
      }),
      StudentAttendanceModel.countDocuments({
        student: { $in: studentDocIds },
        status: AttendanceStatus.late,
      }),
      StudentAttendanceModel.find({
        student: { $in: studentDocIds },
      })
        .populate({
          path: "attendanceSession",
          select: "date periodNumber section classroom",
        })
        .populate({
          path: "student",
          populate: { path: "user", select: "name username" },
        })
        .sort({ markedAt: -1 })
        .limit(20)
        .lean(),
    ]);

  const totalAttendedToday = attendanceTodayPresent + attendanceTodayLate;
  const attendanceTodayAbsent = Math.max(students.length - totalAttendedToday, 0);

  const successfulAttendanceCount = totalPresentCount + totalLateCount;
  const overallRate = totalAttendance > 0
    ? Math.round((successfulAttendanceCount / totalAttendance) * 100)
    : 0;

  const sectionMap = new Map<string, string>();
  sections.forEach((s) => {
    sectionMap.set(String(s._id), s.name);
  });

  return ApiResponse(
    {
      class: {
        _id: String(cls._id),
        name: cls.name,
        grade: cls.grade,
        academicYear: academicYearLabel,
      },
      sections: sections.map((s) => {
        const roomDoc = classrooms.find(
          (c) => String(c.section) === String(s._id),
        );
        return {
          id: String(s._id),
          _id: String(s._id),
          name: s.name,
          academicYear: academicYearLabel,
          studentCount: students.filter(
            (st) => String(st.section) === String(s._id),
          ).length,
          classroom: roomDoc
            ? {
                _id: String(roomDoc._id),
                roomNumber: roomDoc.roomNumber,
              }
            : null,
        };
      }),
      students: students.map((s) => {
        const userObj = s.user as unknown as {
          _id?: unknown;
          name?: string;
          username?: string;
          email?: string;
          phone?: string;
          gender?: string;
        } | undefined;

        return {
          id: userObj?._id ? String(userObj._id) : String(s._id),
          studentId: String(s._id),
          userId: userObj?._id ? String(userObj._id) : "",
          fullName: userObj?.name ?? "Unknown",
          username: userObj?.username ?? "",
          email: userObj?.email ?? "",
          phone: userObj?.phone ?? "",
          gender: userObj?.gender ?? "",
          sectionId: String(s.section),
          sectionName: sectionMap.get(String(s.section)) ?? "",
          rollNumber: s.rollNumber,
          symbolNumber: s.symbolNumber,
          enrollmentYear: s.enrollmentYear,
        };
      }),
      attendance: {
        today: {
          present: attendanceTodayPresent,
          absent: attendanceTodayAbsent,
          late: attendanceTodayLate,
        },
        overall: {
          rate: overallRate,
          total: totalAttendance,
          present: totalPresentCount,
          absent: totalAttendance - successfulAttendanceCount,
          late: totalLateCount,
        },
        recent: recentAttendance.map((a) => {
          const studentDoc = a.student as unknown as {
            _id?: unknown;
            rollNumber?: string;
            user?: { name?: string; username?: string; _id?: unknown };
          } | undefined;

          const sessionDoc = a.attendanceSession as unknown as {
            date?: Date;
            periodNumber?: number;
            section?: unknown;
          } | undefined;

          const secId = String(sessionDoc?.section ?? "");

          return {
            id: String(a._id),
            date: sessionDoc?.date ?? a.markedAt,
            status: a.status,
            studentId: String(studentDoc?._id || a.student),
            userId: studentDoc?.user?._id ? String(studentDoc.user._id) : undefined,
            studentName: studentDoc?.user?.name ?? "Unknown",
            username: studentDoc?.user?.username ?? "",
            rollNumber: studentDoc?.rollNumber ?? "",
            scannedAt: a.markedAt,
            sectionId: secId,
            sectionName: sectionMap.get(secId) ?? "",
            periodNumber: sessionDoc?.periodNumber,
          };
        }),
      },
      timetable: timetable.map((t) => {
        const periodFallback = globalPeriodMap.get(t.periodNumber);
        const dayStr = String(t.dayOfWeek).toLowerCase();
        const dayNum = dayMap[dayStr] ?? 0;

        const subjectObj = t.subject as unknown as { _id?: unknown; name?: string; code?: string } | undefined;
        const teacherObj = t.teacher as unknown as { _id?: unknown; user?: { name?: string; username?: string } } | undefined;
        const classroomObj = t.classroom as unknown as { _id?: unknown; roomNumber?: string } | undefined;
        const secId = String(t.section);

        return {
          id: String(t._id),
          dayOfWeek: dayNum,
          dayOfWeekName: dayStr,
          periodNumber: t.periodNumber,
          sectionId: secId,
          sectionName: sectionMap.get(secId) ?? "",
          subjectId: String(subjectObj?._id || t.subject),
          subjectName: subjectObj?.name ?? "",
          subjectCode: subjectObj?.code ?? "",
          teacherId: String(teacherObj?._id || t.teacher),
          teacherName: teacherObj?.user?.name ?? "",
          classroomId: classroomObj?._id ? String(classroomObj._id) : undefined,
          roomNumber: classroomObj?.roomNumber ?? "",
          startTime: t.customStartTime || periodFallback?.startTime || "",
          endTime: t.customEndTime || periodFallback?.endTime || "",
          customStartTime: t.customStartTime,
          customEndTime: t.customEndTime,
          isCustomTiming: Boolean(t.customStartTime && t.customEndTime),
        };
      }),
      teacherCount: assignedTeachers.length,
      teachers: assignedTeachers.map((t) => {
        const userObj = t.user as unknown as {
          _id?: unknown;
          name?: string;
          username?: string;
        } | undefined;
        const subs = (t.subjects as unknown as Array<{ name: string }>) || [];
        return {
          _id: String(t._id),
          name: userObj?.name ?? "Teacher",
          username: userObj?.username ?? "",
          subjects: subs.map((s) => s.name),
          assignedSections: (t.assignedSections || []).map((s) => String(s)),
        };
      }),
    },
    "Class details fetched successfully",
  );
});
