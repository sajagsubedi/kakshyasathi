import { withHandler } from "@/lib/api/ApiHandler";
import { requireStudent } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import StudentModel from "@/models/Student.model";
import SectionModel from "@/models/Section.model";
import TimetableModel from "@/models/Timetable.model";
import PeriodModel from "@/models/Period.model";

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

  const student = await StudentModel.findOne({ user: session.user._id }).lean();
  if (!student || !student.section) {
    return ApiResponse([], "Student profile or section not found");
  }

  const section = await SectionModel.findById(student.section)
    .populate("class", "academicYear")
    .lean();

  const cls = section?.class as unknown as { academicYear?: unknown } | undefined;
  const academicYearId = cls?.academicYear;

  const [timetable, globalPeriods] = await Promise.all([
    TimetableModel.find({ section: student.section })
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
  ]);

  const globalPeriodMap = new Map<number, { startTime: string; endTime: string }>();
  globalPeriods.forEach((p) => {
    globalPeriodMap.set(p.periodNumber, {
      startTime: p.startTime,
      endTime: p.endTime,
    });
  });

  return ApiResponse(
    timetable.map((t) => {
      const subjectObj = t.subject as unknown as { _id?: unknown; name?: string; code?: string } | undefined;
      const teacherObj = t.teacher as unknown as { _id?: unknown; user?: { name?: string; username?: string } } | undefined;
      const classroomObj = t.classroom as unknown as { _id?: unknown; roomNumber?: string } | undefined;
      const fallback = globalPeriodMap.get(t.periodNumber);
      const isCustomTiming = Boolean(t.customStartTime && t.customEndTime);

      return {
        id: String(t._id),
        dayOfWeek: dayMap[String(t.dayOfWeek).toLowerCase()] ?? 0,
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
    }),
    "Student timetable fetched successfully",
  );
});
