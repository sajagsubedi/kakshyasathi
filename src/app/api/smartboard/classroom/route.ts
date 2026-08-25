import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireSmartboard } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SmartBoardModel from "@/models/SmartBoard.model";
import ClassroomModel from "@/models/Classroom.model";
import SectionModel from "@/models/Section.model";
import TimetableModel from "@/models/Timetable.model";
import SubstitutionModel from "@/models/Substitution.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import AttendanceSessionModel from "@/models/AttendanceSession.model";
import StudentModel from "@/models/Student.model";
import PeriodModel from "@/models/Period.model";
import AcademicYearModel from "@/models/AcademicYear.model";
import { DayOfWeek } from "@/types";

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

  const section = await SectionModel.findById(classroom.section._id).populate("class");
  if (!section) {
    throw new Error("Section not found");
  }

  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = dayNames[now.getDay()] as DayOfWeek;
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

  // Get today's timetable for this section
  const timetableEntries = await TimetableModel.find({
    section: section._id,
    dayOfWeek: currentDay,
  })
    .populate("subject")
    .populate({
      path: "teacher",
      populate: { path: "user" }
    })
    .populate("classroom")
    .sort({ periodNumber: 1 });

  // Get active academic year
  const activeYear = await AcademicYearModel.findOne({ isActive: true });
  if (!activeYear) {
    throw new Error("No active academic year found");
  }

  // Get global timetable for timing fallback
  const globalPeriods = await PeriodModel.find({ academicYear: activeYear._id }).sort({ order: 1 });

  // Get today's substitutions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const substitutions = await SubstitutionModel.find({
    section: section._id,
    date: today,
  }).populate({
    path: "originalTeacher",
    populate: { path: "user" }
  }).populate({
    path: "substituteTeacher",
    populate: { path: "user" }
  });

  // Helper function to get period timing
  const getPeriodTiming = (entry: any) => {
    if (entry.customStartTime && entry.customEndTime) {
      return {
        startTime: entry.customStartTime,
        endTime: entry.customEndTime,
      };
    }
    const globalPeriod = globalPeriods.find((p) => p.slotType === "period" && p.periodNumber === entry.periodNumber);
    return {
      startTime: globalPeriod?.startTime || "00:00",
      endTime: globalPeriod?.endTime || "00:00",
    };
  };

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Find current and next period
  let currentPeriod: any = null;
  let nextPeriod: any = null;

  for (const entry of timetableEntries) {
    const timing = getPeriodTiming(entry);
    const startMinutes = timeToMinutes(timing.startTime);
    const endMinutes = timeToMinutes(timing.endTime);

    // Check if this is the current period
    if (currentTime >= startMinutes && currentTime < endMinutes) {
      // Check for substitution
      const substitution = substitutions.find(
        (s) => s.periodNumber === entry.periodNumber
      );

      let teacherName = (entry.teacher as any)?.user?.name || "Unknown";
      let isSubstitute = false;

      if (substitution) {
        teacherName = (substitution.substituteTeacher as any)?.user?.name || teacherName;
        isSubstitute = true;
      }

      currentPeriod = {
        periodNumber: entry.periodNumber,
        subjectName: (entry.subject as any)?.name || "Unknown",
        teacherName,
        isSubstitute,
        startTime: timing.startTime,
        endTime: timing.endTime,
      };
    }

    // Check if this is the next period
    if (!nextPeriod && startMinutes > currentTime) {
      const substitution = substitutions.find(
        (s) => s.periodNumber === entry.periodNumber
      );

      let teacherName = (entry.teacher as any)?.user?.name || "Unknown";

      if (substitution) {
        teacherName = (substitution.substituteTeacher as any)?.user?.name || teacherName;
      }

      nextPeriod = {
        periodNumber: entry.periodNumber,
        subjectName: (entry.subject as any)?.name || "Unknown",
        teacherName,
        startTime: timing.startTime,
        endTime: timing.endTime,
      };
    }
  }

  // Get attendance summary for today
  const todayAttendanceSessions = await AttendanceSessionModel.find({
    section: section._id,
    date: today,
  });

  const totalStudents = await StudentModel.countDocuments({ section: section._id });
  let presentCount = 0;

  if (todayAttendanceSessions.length > 0) {
    const sessionIds = todayAttendanceSessions.map((s) => s._id);
    const attendanceRecords = await StudentAttendanceModel.find({
      attendanceSession: { $in: sessionIds },
    }).distinct("student");

    presentCount = attendanceRecords.length;
  }

  const attendanceSummary = {
    present: presentCount,
    total: totalStudents,
  };

  return ApiResponse(
    {
      sectionName: `${(section as any).class?.name || ""} - ${section.name}`,
      currentPeriod,
      nextPeriod,
      attendanceSummary,
    },
    "Classroom data fetched successfully"
  );
});