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
    attendance.map((a) => {
      const sessionObj = a.attendanceSession as unknown as {
        date?: Date;
        periodNumber?: number;
      } | undefined;

      const recordDate = sessionObj?.date
        ? new Date(sessionObj.date).toISOString().split("T")[0]
        : new Date(a.markedAt).toISOString().split("T")[0];

      return {
        id: String(a._id),
        date: recordDate,
        status: String(a.status || "").toUpperCase(),
        periodNumber: sessionObj?.periodNumber,
        scannedAt: a.markedAt ? new Date(a.markedAt).toISOString() : undefined,
      };
    }),
    "Student attendance fetched successfully",
  );
});
