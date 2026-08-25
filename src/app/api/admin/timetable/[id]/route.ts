import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TimetableModel from "@/models/Timetable.model";
import AcademicYearModel from "@/models/AcademicYear.model";
import ClassroomModel from "@/models/Classroom.model";
import { parseObjectId } from "@/lib/api/parseId";
import { parseTime } from "@/lib/api/time";
import { DayOfWeek } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const timetablePopulate = [
  { path: "section", populate: { path: "class", select: "name grade" } },
  { path: "subject", select: "name code" },
  { path: "teacher", populate: { path: "user", select: "name username" } },
  { path: "classroom", select: "roomNumber" },
];

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const doc = await TimetableModel.findById(id);
    if (!doc) throw new Error("Timetable entry not found");

    if (body.dayOfWeek !== undefined) {
      if (!Object.values(DayOfWeek).includes(body.dayOfWeek)) {
        throw new Error("Invalid day of week");
      }
      
      // Check if the new day is a holiday
      const activeAcademicYear = await AcademicYearModel.findOne({ isActive: true });
      if (activeAcademicYear && activeAcademicYear.weeklyOffDays) {
        if (activeAcademicYear.weeklyOffDays.includes(body.dayOfWeek)) {
          throw new Error(`Cannot update timetable entry to ${body.dayOfWeek} as it's a holiday in the active academic year`);
        }
      }
      
      doc.dayOfWeek = body.dayOfWeek;
    }
    if (body.periodNumber !== undefined) {
      if (typeof body.periodNumber !== "number" || body.periodNumber < 1) {
        throw new Error("Invalid period number");
      }
      doc.periodNumber = body.periodNumber;
    }
    if (body.subject !== undefined) {
      parseObjectId(body.subject, "subject");
      doc.subject = body.subject;
    }
    if (body.teacher !== undefined) {
      parseObjectId(body.teacher, "teacher");
      doc.teacher = body.teacher;
    }
    // Auto-calculate classroom from section
    const classroom = await ClassroomModel.findOne({ section: doc.section });
    if (!classroom) throw new Error("Classroom not found for this section");
    doc.classroom = classroom._id;
    if (body.customStartTime !== undefined) {
      doc.customStartTime = body.customStartTime
        ? parseTime(body.customStartTime, "Custom start time")
        : undefined;
    }
    if (body.customEndTime !== undefined) {
      doc.customEndTime = body.customEndTime
        ? parseTime(body.customEndTime, "Custom end time")
        : undefined;
    }

    if (doc.customStartTime && doc.customEndTime) {
      if (doc.customStartTime >= doc.customEndTime) {
        throw new Error("Custom start time must be before custom end time");
      }
    }

    const duplicate = await TimetableModel.findOne({
      section: doc.section,
      dayOfWeek: doc.dayOfWeek,
      periodNumber: doc.periodNumber,
      _id: { $ne: id },
    });
    if (duplicate) {
      throw new Error("This section already has an entry for that day and period");
    }

    await doc.save();
    const populated = await TimetableModel.findById(id)
      .populate(timetablePopulate)
      .lean();
    return ApiResponse(populated, "Timetable entry updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const deleted = await TimetableModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Timetable entry not found");
    return ApiResponse(null, "Timetable entry deleted successfully");
  },
);
