import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireSmartboard } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SmartBoardModel from "@/models/SmartBoard.model";
import ClassroomModel from "@/models/Classroom.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import AttendanceSessionModel from "@/models/AttendanceSession.model";
import StudentModel from "@/models/Student.model";
import ScanEventModel from "@/models/ScanEvent.model";

export const GET = withHandler(async (req: NextRequest) => {
  const session = await requireSmartboard();
  await connectDb();

  const smartboard = await SmartBoardModel.findById(session.user._id).populate("classroom");
  if (!smartboard) {
    throw new Error("Smart board not found");
  }

  const classroom = await ClassroomModel.findById(smartboard.classroom._id).populate("section");
  if (!classroom) {
    throw new Error("Classroom not found");
  }

  const sectionId = classroom.section._id;

  // Get today's attendance sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendanceSessions = await AttendanceSessionModel.find({
    section: sectionId,
    date: { $gte: today, $lt: tomorrow },
  });

  if (attendanceSessions.length === 0) {
    return ApiResponse([], "No attendance sessions today");
  }

  const sessionIds = attendanceSessions.map((s) => s._id);

  // Get attendance records for today's sessions
  const attendanceRecords = await StudentAttendanceModel.find({
    attendanceSession: { $in: sessionIds },
  })
    .populate("student")
    .populate("scanEvent")
    .sort({ markedAt: -1 })
    .limit(50)
    .lean();

  const formattedAttendance = attendanceRecords.map((record: any) => ({
    id: record._id.toString(),
    studentId: record.student?._id?.toString() || "unknown",
    status: record.status === "present" ? "PRESENT" : "LATE",
    scannedAt: record.scanEvent?.scannedAt?.toISOString() || record.markedAt.toISOString(),
  }));

  return ApiResponse(
    formattedAttendance,
    "Attendance data fetched successfully"
  );
});