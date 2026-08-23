import { withHandler } from "@/lib/api/ApiHandler";
import { requireStudent } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import StudentModel from "@/models/Student.model";
import TimetableModel from "@/models/Timetable.model";

const timetablePopulate = [
  { path: "subject", select: "name code" },
  { path: "teacher", populate: { path: "user", select: "name username" } },
];

export const GET = withHandler(async () => {
  const session = await requireStudent();
  await connectDb();

  const student = await StudentModel.findOne({ user: session.user._id }).lean();
  if (!student) {
    return ApiResponse([], "Student profile not found");
  }

  const timetable = await TimetableModel.find({ section: student.section })
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
      dayOfWeek: dayMap[t.dayOfWeek] ?? 0,
      periodNumber: t.periodNumber,
      subjectId: String(t.subject),
      teacherId: String(t.teacher),
      customStartTime: t.customStartTime,
      customEndTime: t.customEndTime,
    })),
    "Student timetable fetched successfully",
  );
});
