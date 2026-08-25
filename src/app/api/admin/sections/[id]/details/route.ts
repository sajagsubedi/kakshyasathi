import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SectionModel from "@/models/Section.model";
import ClassModel from "@/models/Class.model";
import ClassroomModel from "@/models/Classroom.model";
import SmartBoardModel from "@/models/SmartBoard.model";
import AttendanceTerminalModel from "@/models/AttendanceTerminal.model";
import StudentModel from "@/models/Student.model";
import TimetableModel from "@/models/Timetable.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import TeacherModel from "@/models/Teacher.model";
import PeriodModel from "@/models/Period.model";
import SubstitutionModel from "@/models/Substitution.model";
import { parseObjectId } from "@/lib/api/parseId";
import { AttendanceStatus, DayOfWeek } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

export const GET = withHandler(async (_req, context: RouteContext) => {
  await requireAdmin();
  await connectDb();
  const { id } = await context.params;
  parseObjectId(id);

  const section = await SectionModel.findById(id)
    .populate({
      path: "class",
      populate: { path: "academicYear", select: "label isActive" },
    })
    .lean();

  if (!section) throw new Error("Section not found");

  const cls = section.class as unknown as {
    _id: unknown;
    name: string;
    grade: number;
    academicYear: { _id: unknown; label?: string } | string;
  };

  const academicYearId =
    typeof cls.academicYear === "object" && cls.academicYear !== null
      ? cls.academicYear._id
      : cls.academicYear;

  const academicYearLabel =
    typeof cls.academicYear === "object" && cls.academicYear !== null
      ? cls.academicYear.label ?? ""
      : String(cls.academicYear || "");

  // 1. Physical Classroom & Hardware Devices
  const classroom = await ClassroomModel.findOne({ section: id }).lean();

  const [smartBoard, terminal] = classroom
    ? await Promise.all([
        SmartBoardModel.findOne({ classroom: classroom._id }).lean(),
        AttendanceTerminalModel.findOne({ classroom: classroom._id }).lean(),
      ])
    : [null, null];

  // 2. Students in this Section
  const students = await StudentModel.find({ section: id })
    .populate("user", "name username email phone gender")
    .sort({ rollNumber: 1 })
    .lean();

  const studentDocIds = students.map((s) => s._id);

  // 3. Timetable & Global Periods
  const [timetableEntries, globalPeriods] = await Promise.all([
    TimetableModel.find({ section: id })
      .populate("subject", "name code")
      .populate({
        path: "teacher",
        populate: { path: "user", select: "name username" },
      })
      .populate("classroom", "roomNumber")
      .lean(),
    academicYearId
      ? PeriodModel.find({ academicYear: academicYearId }).lean()
      : Promise.resolve([]),
  ]);

  const globalPeriodMap = new Map<number, { startTime: string; endTime: string }>();
  globalPeriods.forEach((p) => {
    if (p.slotType === "period" && p.periodNumber && !globalPeriodMap.has(p.periodNumber)) {
      globalPeriodMap.set(p.periodNumber, {
        startTime: p.startTime,
        endTime: p.endTime,
      });
    }
  });

  // 4. Assigned Teachers & Subject Teachers
  const assignedTeachers = await TeacherModel.find({ assignedSections: id })
    .populate("user", "name username email phone gender")
    .populate("subjects", "name code")
    .lean();

  // 5. Today's Date Window & Substitutions
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const currentDayOfWeekName = dayNamesList[now.getDay()] || DayOfWeek.sunday;

  const todaySubstitutions = await SubstitutionModel.find({
    section: id,
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
    .lean();

  const subMap = new Map<number, unknown>();
  todaySubstitutions.forEach((sub) => {
    subMap.set(sub.periodNumber, sub);
  });

  // 6. Attendance Statistics
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

  // 7. Format Timetable entries
  const formattedTimetable = timetableEntries.map((t) => {
    const periodFallback = globalPeriodMap.get(t.periodNumber);
    const dayStr = String(t.dayOfWeek).toLowerCase();
    const dayNum = dayMap[dayStr] ?? 0;
    const hasCustomTiming = Boolean(t.customStartTime && t.customEndTime);

    const subjectObj = t.subject as unknown as { _id?: unknown; name?: string; code?: string } | undefined;
    const teacherObj = t.teacher as unknown as { _id?: unknown; user?: { name?: string; username?: string } } | undefined;
    const classroomObj = t.classroom as unknown as { _id?: unknown; roomNumber?: string } | undefined;

    return {
      id: String(t._id),
      dayOfWeek: dayStr,
      dayOfWeekNumber: dayNum,
      periodNumber: t.periodNumber,
      subjectId: String(subjectObj?._id || t.subject),
      subjectName: subjectObj?.name ?? "Unknown Subject",
      subjectCode: subjectObj?.code ?? "",
      teacherId: String(teacherObj?._id || t.teacher),
      teacherName: teacherObj?.user?.name ?? "Unassigned",
      classroomId: classroomObj?._id ? String(classroomObj._id) : undefined,
      roomNumber: classroomObj?.roomNumber ?? (classroom ? classroom.roomNumber : ""),
      customStartTime: t.customStartTime,
      customEndTime: t.customEndTime,
      startTime: t.customStartTime || periodFallback?.startTime || "",
      endTime: t.customEndTime || periodFallback?.endTime || "",
      isCustomTiming: hasCustomTiming,
    };
  });

  // 8. Format Today's Schedule
  const todayTimetable = formattedTimetable
    .filter((t) => t.dayOfWeek === currentDayOfWeekName.toLowerCase())
    .sort((a, b) => a.periodNumber - b.periodNumber)
    .map((entry) => {
      const sub = subMap.get(entry.periodNumber) as
        | {
            substituteTeacher?: { user?: { name?: string } };
            originalTeacher?: { user?: { name?: string } };
          }
        | undefined;

      return {
        id: entry.id,
        periodNumber: entry.periodNumber,
        subjectName: entry.subjectName,
        subjectCode: entry.subjectCode,
        teacherName: sub?.substituteTeacher?.user?.name
          ? `${sub.substituteTeacher.user.name} (Sub)`
          : entry.teacherName,
        substituteTeacherName: sub?.substituteTeacher?.user?.name,
        originalTeacherName: sub?.originalTeacher?.user?.name,
        roomNumber: entry.roomNumber,
        startTime: entry.startTime,
        endTime: entry.endTime,
        isCustomTiming: entry.isCustomTiming,
      };
    });

  return ApiResponse(
    {
      section: {
        _id: String(section._id),
        name: section.name,
        class: {
          _id: String(cls._id),
          name: cls.name,
          grade: cls.grade,
          academicYear: academicYearLabel,
        },
      },
      classroom: classroom
        ? {
            _id: String(classroom._id),
            roomNumber: classroom.roomNumber,
          }
        : null,
      smartBoard: smartBoard
        ? {
            _id: String(smartBoard._id),
            deviceKey: smartBoard.deviceKey,
            status: smartBoard.status,
            lastSeenAt: smartBoard.lastSeenAt,
          }
        : null,
      terminal: terminal
        ? {
            _id: String(terminal._id),
            terminalCode: terminal.terminalCode,
            deviceKey: terminal.deviceKey,
            status: terminal.status,
            lastSeenAt: terminal.lastSeenAt,
            lastSyncedSequence: terminal.lastSyncedSequence,
          }
        : null,
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
          _id: String(s._id),
          id: userObj?._id ? String(userObj._id) : String(s._id),
          userId: userObj?._id ? String(userObj._id) : "",
          fullName: userObj?.name ?? "Unknown",
          username: userObj?.username ?? "",
          email: userObj?.email ?? "",
          phone: userObj?.phone ?? "",
          gender: userObj?.gender ?? "",
          rollNumber: s.rollNumber,
          symbolNumber: s.symbolNumber,
          enrollmentYear: s.enrollmentYear,
          guardianContact: s.guardianContact,
        };
      }),
      teachers: assignedTeachers.map((t) => {
        const userObj = t.user as unknown as {
          _id?: unknown;
          name?: string;
          username?: string;
          email?: string;
        } | undefined;

        const subs = (t.subjects as unknown as Array<{ _id: unknown; name: string; code: string }>) || [];

        return {
          _id: String(t._id),
          userId: userObj?._id ? String(userObj._id) : "",
          fullName: userObj?.name ?? "Unknown Teacher",
          username: userObj?.username ?? "",
          email: userObj?.email ?? "",
          subjects: subs.map((sub) => ({
            _id: String(sub._id),
            name: sub.name,
            code: sub.code,
          })),
        };
      }),
      timetable: formattedTimetable,
      todaySchedule: todayTimetable,
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
          } | undefined;

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
            periodNumber: sessionDoc?.periodNumber,
          };
        }),
      },
    },
    "Section details fetched successfully",
  );
});
