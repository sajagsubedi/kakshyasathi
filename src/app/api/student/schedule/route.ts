import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireStudent } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import StudentModel from "@/models/Student.model";
import TimetableModel from "@/models/Timetable.model";
import SubstitutionModel from "@/models/Substitution.model";
import PeriodModel from "@/models/Period.model";
import AcademicYearModel from "@/models/AcademicYear.model";
import HolidayModel from "@/models/Holiday.model";
import { DayOfWeek, SlotType } from "@/types";

export const GET = withHandler(async (req: NextRequest) => {
  const session = await requireStudent();
  await connectDb();

  const student = await StudentModel.findById(session.user._id).populate("section");
  if (!student) {
    throw new Error("Student not found");
  }

  const sectionId = student.section._id;

  // Get active academic year
  const activeYear = await AcademicYearModel.findOne({ isActive: true });
  if (!activeYear) {
    throw new Error("No active academic year found");
  }

  // Get today's day of week
  const today = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayDay = days[today.getDay()] as DayOfWeek;

  // Check if today is a holiday
  const todayDate = today.toISOString().split('T')[0];
  const holiday = await HolidayModel.findOne({
    academicYear: activeYear._id,
    date: today,
  });

  if (holiday) {
    return ApiResponse(
      {
        isHoliday: true,
        holidayTitle: holiday.title,
        isWeeklyOff: false,
        schedule: [],
      },
      "Today is a holiday"
    );
  }

  // Check if today is a weekly off day
  const weeklyOffDays = activeYear.weeklyOffDays || [DayOfWeek.sunday];
  if (weeklyOffDays.includes(todayDay)) {
    return ApiResponse(
      {
        isHoliday: false,
        isWeeklyOff: true,
        weeklyOffDay: todayDay,
        schedule: [],
      },
      "Today is a weekly off day"
    );
  }

  // Get global timetable for timing
  const globalPeriods = await PeriodModel.find({ 
    academicYear: activeYear._id,
    slotType: SlotType.period
  }).sort({ order: 1 });

  // Get today's timetable entries
  const timetableEntries = await TimetableModel.find({
    section: sectionId,
    dayOfWeek: todayDay,
  })
    .populate("subject")
    .populate({
      path: "teacher",
      populate: { path: "user" }
    })
    .populate("classroom")
    .sort({ periodNumber: 1 });

  // Get today's substitutions
  today.setHours(0, 0, 0, 0);
  const substitutions = await SubstitutionModel.find({
    section: sectionId,
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
  const schedule = timetableEntries.map((entry: any) => {
    const timing = getPeriodTiming(entry);
    
    // Check for substitution
    const substitution = substitutions.find(
      (s) => s.periodNumber === entry.periodNumber
    );

    let teacherName = (entry.teacher as any)?.user?.name || "Unknown";
    let teacherId = entry.teacher?._id?.toString();
    let isSubstitute = false;

    if (substitution) {
      teacherName = (substitution.substituteTeacher as any)?.user?.name || teacherName;
      teacherId = substitution.substituteTeacher?._id?.toString();
      isSubstitute = true;
    }

    return {
      id: entry._id.toString(),
      periodNumber: entry.periodNumber,
      periodId: globalPeriods.find((p) => p.periodNumber === entry.periodNumber)?._id?.toString(),
      subjectId: entry.subject?._id?.toString(),
      subjectName: entry.subject?.name,
      subjectCode: entry.subject?.code,
      teacherId,
      teacherName,
      isSubstitute,
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
    {
      isHoliday: false,
      isWeeklyOff: false,
      dayOfWeek: todayDay,
      date: todayDate,
      schedule,
    },
    "Today's schedule fetched successfully"
  );
});
