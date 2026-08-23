import { withHandler } from "@/lib/api/ApiHandler";
import { requireStudent } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import StudentModel from "@/models/Student.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";

export const GET = withHandler(async () => {
  const session = await requireStudent();
  await connectDb();

  const student = await StudentModel.findOne({ user: session.user._id }).lean();
  if (!student) {
    return ApiResponse([], "Student profile not found");
  }

  const attendance = await StudentAttendanceModel.find({ student: student._id })
    .populate({
      path: "attendanceSession",
      select: "date periodNumber section",
    })
    .sort({ markedAt: -1 })
    .lean();

  return ApiResponse(
    attendance.map((a) => ({
      id: String(a._id),
      date: (a.attendanceSession as { date: Date }).date,
      status: a.status.toUpperCase(),
      scannedAt: a.markedAt,
    })),
    "Student attendance fetched successfully",
  );
});
