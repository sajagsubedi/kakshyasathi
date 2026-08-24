import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireSmartboard } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SmartBoardModel from "@/models/SmartBoard.model";
import ClassroomModel from "@/models/Classroom.model";
import TimetableModel from "@/models/Timetable.model";
import SubstitutionModel from "@/models/Substitution.model";
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

  const sectionId = classroom.section._id;

  // Get active academic year
  const activeYear = await AcademicYearModel.findOne({ isActive: true });
  if (!activeYear) {
    throw new Error("No active academic year found");
  }

  // Get global timetable for timing
  const globalPeriods = await PeriodModel.find({ academicYear: activeYear._id }).sort({ periodNumber: 1 });

  // Get all timetable entries for this section
  const timetableEntries = await TimetableModel.find({
    section: sectionId,
  })
    .populate("subject")
    .populate("teacher")
    .populate("classroom")
    .sort({ dayOfWeek: 1, periodNumber: 1 });

  // Get today's substitutions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const substitutions = await SubstitutionModel.find({
    section: sectionId,
    date: today,
  }).populate("originalTeacher substituteTeacher");

  // Helper function to get period timing
  const getPeriodTiming = (entry: any) => {
    if (entry.customStartTime && entry.customEndTime) {
      return {
        startTime: entry.customStartTime,
        endTime: entry.customEndTime,
        isCustomTiming: true,
      };
    }
    const globalPeriod = globalPeriods.find((p) => p.periodNumber === entry.periodNumber);
    return {
      startTime: globalPeriod?.startTime || "00:00",
      endTime: globalPeriod?.endTime || "00:00",
      isCustomTiming: false,
    };
  };

  // Format timetable entries
  const formattedTimetable = timetableEntries.map((entry: any) => {
    const timing = getPeriodTiming(entry);
    
    // Check for substitution
    const substitution = substitutions.find(
      (s) => s.periodNumber === entry.periodNumber
    );

    let teacherName = entry.teacher?.name || "Unknown";
    let teacherId = entry.teacher?._id?.toString();

    if (substitution) {
      teacherName = substitution.substituteTeacher?.name || teacherName;
      teacherId = substitution.substituteTeacher?._id?.toString();
    }

    return {
      id: entry._id.toString(),
      dayOfWeek: entry.dayOfWeek,
      periodNumber: entry.periodNumber,
      periodId: globalPeriods.find((p) => p.periodNumber === entry.periodNumber)?._id?.toString(),
      subjectId: entry.subject?._id?.toString(),
      subjectName: entry.subject?.name,
      subjectCode: entry.subject?.code,
      teacherId,
      teacherName,
      sectionId: sectionId.toString(),
      className: classroom.section?.class?.name,
      classroomId: entry.classroom?._id?.toString(),
      roomNumber: entry.classroom?.roomNumber,
      startTime: timing.startTime,
      endTime: timing.endTime,
      customStartTime: timing.isCustomTiming ? timing.startTime : undefined,
      customEndTime: timing.isCustomTiming ? timing.endTime : undefined,
      isCustomTiming: timing.isCustomTiming,
    };
  });

  return ApiResponse(
    formattedTimetable,
    "Timetable fetched successfully"
  );
});