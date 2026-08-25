import { withHandler } from "@/lib/api/ApiHandler";
import { requireTeacher } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherModel from "@/models/Teacher.model";
import TimetableModel from "@/models/Timetable.model";
import PeriodModel from "@/models/Period.model";
import AcademicYearModel from "@/models/AcademicYear.model";
import { DayOfWeek } from "@/types";

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

  const teacher = await TeacherModel.findOne({ user: session.user._id }).lean();
  if (!teacher) {
    return ApiResponse([], "Teacher profile not found");
  }

  // Get active academic year for weekly off days
  const activeYear = await AcademicYearModel.findOne({ isActive: true });
  const weeklyOffDays = activeYear?.weeklyOffDays || [DayOfWeek.sunday];

  const [timetable, globalPeriods] = await Promise.all([
    TimetableModel.find({ 
      teacher: teacher._id,
      dayOfWeek: { $nin: weeklyOffDays },
    })
      .populate("subject", "name code")
      .populate({
        path: "section",
        populate: { path: "class", select: "name grade" },
      })
      .populate("classroom", "roomNumber")
      .sort({ dayOfWeek: 1, periodNumber: 1 })
      .lean(),
    PeriodModel.find({}).lean(),
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

  return ApiResponse(
    timetable.map((t) => {
      const secObj = t.section as unknown as { _id?: unknown; name?: string; class?: { name?: string; grade?: number } } | undefined;
      const subObj = t.subject as unknown as { _id?: unknown; name?: string; code?: string } | undefined;
      const roomObj = t.classroom as unknown as { _id?: unknown; roomNumber?: string } | undefined;
      const fallback = globalPeriodMap.get(t.periodNumber);
      const isCustomTiming = Boolean(t.customStartTime && t.customEndTime);
      const dayStr = String(t.dayOfWeek).toLowerCase();

      return {
        id: String(t._id),
        sectionId: String(secObj?._id || t.section),
        sectionName: secObj?.class?.name ? `${secObj.class.name} - Section ${secObj.name}` : `Section ${secObj?.name || '—'}`,
        className: secObj?.class?.name,
        dayOfWeek: dayMap[dayStr] ?? 0,
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
    }),
    "Teacher timetable fetched successfully",
  );
});
