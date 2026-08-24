import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireSmartboard } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SmartBoardModel from "@/models/SmartBoard.model";
import ClassroomModel from "@/models/Classroom.model";
import StudentModel from "@/models/Student.model";
import TeacherModel from "@/models/Teacher.model";
import ScanEventModel from "@/models/ScanEvent.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import AttendanceSessionModel from "@/models/AttendanceSession.model";
import TeacherPresenceModel from "@/models/TeacherPresence.model";
import { PersonType, ScanEventStatus, AttendanceStatus } from "@/types";

export const POST = withHandler(async (req: NextRequest) => {
  const session = await requireSmartboard();
  await connectDb();

  const body = await req.json();
  const { barcode } = body;

  if (!barcode) {
    throw new Error("Barcode is required");
  }

  const smartboard = await SmartBoardModel.findById(session.user._id).populate("classroom");
  if (!smartboard) {
    throw new Error("Smart board not found");
  }

  const classroom = await ClassroomModel.findById(smartboard.classroom._id).populate("section");
  if (!classroom) {
    throw new Error("Classroom not found");
  }

  const sectionId = classroom.section._id;
  const classroomId = classroom._id;

  // Determine if it's a student or teacher based on barcode prefix
  const personType = barcode.startsWith("STU-") ? PersonType.student : PersonType.teacher;
  const cardCode = barcode;

  // Find the person
  let person: any = null;
  if (personType === PersonType.student) {
    person = await StudentModel.findOne({ symbolNumber: cardCode }).populate("user");
  } else {
    // For teachers, find by symbol number first, then try user lookup
    person = await TeacherModel.findOne({ symbolNumber: cardCode }).populate("user");
    if (!person) {
      // Try to find teacher by matching user username
      const UserModel = (await import("@/models/User.model")).default;
      const user = await UserModel.findOne({ username: cardCode });
      if (user) {
        person = await TeacherModel.findOne({ user: user._id }).populate("user");
      }
    }
  }

  if (!person) {
    return ApiResponse(
      { success: false, message: "Person not found" },
      "Person not found",
      404
    );
  }

  // Get current time and determine current period
  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Get current attendance session
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let result: any = { success: true, personType, personName: person.user?.name || "Unknown" };

  if (personType === PersonType.student) {
    // Student attendance flow
    const attendanceSession = await AttendanceSessionModel.findOne({
      section: sectionId,
      classroom: classroomId,
      date: { $gte: today, $lt: tomorrow },
    }).sort({ periodNumber: -1 }); // Get the latest session

    if (!attendanceSession) {
      return ApiResponse(
        { ...result, success: false, message: "No active attendance session" },
      "No active attendance session",
      400
      );
    }

    // Check for duplicate attendance
    const existingAttendance = await StudentAttendanceModel.findOne({
      attendanceSession: attendanceSession._id,
      student: person._id,
    });

    if (existingAttendance) {
      return ApiResponse(
        { ...result, success: false, message: "Already marked present", status: "duplicate" },
      "Already marked present",
      400
      );
    }

    // Create scan event
    const scanEvent = await ScanEventModel.create({
      terminal: smartboard._id, // Using smartboard as terminal for scanning
      cardCode,
      scannedAt: now,
      receivedAt: now,
      sequenceNumber: Date.now(),
      personType,
      person: person._id,
      status: ScanEventStatus.processed,
    });

    // Create attendance record
    await StudentAttendanceModel.create({
      attendanceSession: attendanceSession._id,
      student: person._id,
      scanEvent: scanEvent._id,
      markedAt: now,
      status: AttendanceStatus.present,
    });

    result.message = "Attendance marked successfully";
    result.status = "present";

  } else {
    // Teacher presence flow
    // Find current period for teacher presence
    const attendanceSession = await AttendanceSessionModel.findOne({
      section: sectionId,
      classroom: classroomId,
      date: { $gte: today, $lt: tomorrow },
    }).sort({ periodNumber: -1 });

    if (!attendanceSession) {
      return ApiResponse(
        { ...result, success: false, message: "No active period" },
      "No active period",
      400
      );
    }

    // Check if teacher already has an entry for this period
    const existingPresence = await TeacherPresenceModel.findOne({
      teacher: person._id,
      classroom: classroomId,
      date: today,
      periodNumber: attendanceSession.periodNumber,
    });

    if (existingPresence) {
      if (!existingPresence.exitTime) {
        // Record exit
        existingPresence.exitTime = now;
        existingPresence.exitScanEvent = null; // Would set if we had the scan event
        await existingPresence.save();
        result.message = "Exit recorded successfully";
        result.action = "exit";
      } else {
        return ApiResponse(
          { ...result, success: false, message: "Already recorded entry and exit", status: "duplicate" },
          "Already recorded entry and exit",
          400
        );
      }
    } else {
      // Record entry
      const scanEvent = await ScanEventModel.create({
        terminal: smartboard._id,
        cardCode,
        scannedAt: now,
        receivedAt: now,
        sequenceNumber: Date.now(),
        personType,
        person: person._id,
        status: ScanEventStatus.processed,
      });

      await TeacherPresenceModel.create({
        teacher: person._id,
        classroom: classroomId,
        date: today,
        periodNumber: attendanceSession.periodNumber,
        entryScanEvent: scanEvent._id,
        entryTime: now,
      });

      result.message = "Entry recorded successfully";
      result.action = "entry";
    }
  }

  return ApiResponse(result, "Scan processed successfully");
});