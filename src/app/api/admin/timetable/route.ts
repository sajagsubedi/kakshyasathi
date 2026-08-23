import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TimetableModel from "@/models/Timetable.model";
import SectionModel from "@/models/Section.model";
import SubjectModel from "@/models/Subject.model";
import TeacherModel from "@/models/Teacher.model";
import ClassroomModel from "@/models/Classroom.model";
import { parseObjectId } from "@/lib/api/parseId";
import { parseTime } from "@/lib/api/time";
import { DayOfWeek } from "@/types";

const timetablePopulate = [
  { path: "section", populate: { path: "class", select: "name grade" } },
  { path: "subject", select: "name code" },
  { path: "teacher", populate: { path: "user", select: "name username" } },
  { path: "classroom", select: "roomNumber" },
];

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");
  const dayOfWeek = searchParams.get("dayOfWeek");

  const filter: Record<string, unknown> = {};
  if (section) {
    parseObjectId(section, "section");
    filter.section = section;
  }
  if (dayOfWeek) {
    if (!Object.values(DayOfWeek).includes(dayOfWeek as DayOfWeek)) {
      throw new Error("Invalid day of week");
    }
    filter.dayOfWeek = dayOfWeek;
  }

  const items = await TimetableModel.find(filter)
    .populate(timetablePopulate)
    .sort({ dayOfWeek: 1, periodNumber: 1 })
    .lean();

  return ApiResponse(items, "Timetable fetched successfully");
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const {
    section,
    dayOfWeek,
    periodNumber,
    subject,
    teacher,
    classroom,
    customStartTime,
    customEndTime,
  } = body;

  if (!section) throw new Error("Section is required");
  if (!dayOfWeek || !Object.values(DayOfWeek).includes(dayOfWeek)) {
    throw new Error("Valid day of week is required");
  }
  if (typeof periodNumber !== "number" || periodNumber < 1) {
    throw new Error("Valid period number is required");
  }
  if (!subject) throw new Error("Subject is required");
  if (!teacher) throw new Error("Teacher is required");
  if (!classroom) throw new Error("Classroom is required");

  parseObjectId(section, "section");
  parseObjectId(subject, "subject");
  parseObjectId(teacher, "teacher");
  parseObjectId(classroom, "classroom");

  const [sectionExists, subjectExists, teacherExists, classroomExists] =
    await Promise.all([
      SectionModel.findById(section),
      SubjectModel.findById(subject),
      TeacherModel.findById(teacher),
      ClassroomModel.findById(classroom),
    ]);

  if (!sectionExists) throw new Error("Section not found");
  if (!subjectExists) throw new Error("Subject not found");
  if (!teacherExists) throw new Error("Teacher not found");
  if (!classroomExists) throw new Error("Classroom not found");

  const existing = await TimetableModel.findOne({
    section,
    dayOfWeek,
    periodNumber,
  });
  if (existing) {
    throw new Error("This section already has an entry for that day and period");
  }

  const payload: Record<string, unknown> = {
    section,
    dayOfWeek,
    periodNumber,
    subject,
    teacher,
    classroom,
  };

  if (customStartTime) {
    payload.customStartTime = parseTime(customStartTime, "Custom start time");
  }
  if (customEndTime) {
    payload.customEndTime = parseTime(customEndTime, "Custom end time");
  }
  if (payload.customStartTime && payload.customEndTime) {
    if (String(payload.customStartTime) >= String(payload.customEndTime)) {
      throw new Error("Custom start time must be before custom end time");
    }
  }

  const doc = await TimetableModel.create(payload);
  const populated = await TimetableModel.findById(doc._id)
    .populate(timetablePopulate)
    .lean();

  return ApiResponse(populated, "Timetable entry created successfully", 201);
});
