import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import PeriodModel from "@/models/Period.model";
import AcademicYearModel from "@/models/AcademicYear.model";
import { parseObjectId } from "@/lib/api/parseId";
import { assertTimeRange, parseTime } from "@/lib/api/time";

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  let academicYear = searchParams.get("academicYear");

  if (!academicYear) {
    const active = await AcademicYearModel.findOne({ isActive: true }).lean();
    academicYear = active?._id.toString() ?? null;
  } else {
    parseObjectId(academicYear, "academicYear");
  }

  if (!academicYear) {
    return ApiResponse([], "Periods fetched successfully");
  }

  const items = await PeriodModel.find({ academicYear })
    .populate("academicYear", "label isActive")
    .sort({ periodNumber: 1 })
    .lean();

  return ApiResponse(items, "Periods fetched successfully");
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { academicYear, periodNumber, startTime, endTime } = body;

  if (!academicYear) throw new Error("Academic year is required");
  parseObjectId(academicYear, "academicYear");

  const year = await AcademicYearModel.findById(academicYear);
  if (!year) throw new Error("Academic year not found");

  if (typeof periodNumber !== "number" || periodNumber < 1) {
    throw new Error("Valid period number is required");
  }

  const start = parseTime(startTime, "Start time");
  const end = parseTime(endTime, "End time");
  assertTimeRange(start, end);

  const existing = await PeriodModel.findOne({ academicYear, periodNumber });
  if (existing) {
    throw new Error("This period number already exists for the academic year");
  }

  const doc = await PeriodModel.create({
    academicYear,
    periodNumber,
    startTime: start,
    endTime: end,
  });

  return ApiResponse(doc, "Period created successfully", 201);
});
