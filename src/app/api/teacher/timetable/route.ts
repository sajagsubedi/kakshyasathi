import { withHandler } from "@/lib/api/ApiHandler";
import { requireTeacher } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherModel from "@/models/Teacher.model";
import TimetableModel from "@/models/Timetable.model";
import { DayOfWeek } from "@/types";

const timetablePopulate = [
  { path: "section", populate: { path: "class", select: "name grade" } },
  { path: "subject", select: "name code" },
  { path: "classroom", select: "roomNumber" },
];

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  await connectDb();

  const teacher = await TeacherModel.findOne({ user: session.user._id }).lean();
  if (!teacher) {
    return ApiResponse([], "Teacher profile not found");
  }

  const timetable = await TimetableModel.find({ teacher: teacher._id })
    .populate(timetablePopulate)
    .sort({ dayOfWeek: 1, periodNumber: 1 })
    .lean();

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  return ApiResponse(
    timetable.map((t) => ({
      id: String(t._id),
      sectionId: String(t.section),
      dayOfWeek: dayMap[t.dayOfWeek] ?? 0,
      periodNumber: t.periodNumber,
      subjectId: String(t.subject),
      classroomId: String(t.classroom),
      customStartTime: t.customStartTime,
      customEndTime: t.customEndTime,
    })),
    "Teacher timetable fetched successfully",
  );
});
