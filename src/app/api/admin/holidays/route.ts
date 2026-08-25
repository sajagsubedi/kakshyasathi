import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import HolidayModel from "@/models/Holiday.model";
import AcademicYearModel from "@/models/AcademicYear.model";
import { parseObjectId } from "@/lib/api/parseId";

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
    return ApiResponse([], "Holidays fetched successfully");
  }

  const items = await HolidayModel.find({ academicYear })
    .populate("academicYear", "label isActive")
    .sort({ date: 1 })
    .lean();

  return ApiResponse(items, "Holidays fetched successfully");
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { academicYear, date, title, type } = body;

  if (!academicYear) throw new Error("Academic year is required");
  parseObjectId(academicYear, "academicYear");

  const year = await AcademicYearModel.findById(academicYear);
  if (!year) throw new Error("Academic year not found");

  if (!date) throw new Error("Date is required");
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date");
  }

  if (!title) throw new Error("Title is required");

  const existing = await HolidayModel.findOne({ academicYear, date: parsedDate });
  if (existing) {
    throw new Error("A holiday already exists for this date in the academic year");
  }

  const doc = await HolidayModel.create({
    academicYear,
    date: parsedDate,
    title,
    type: type || "holiday",
  });

  return ApiResponse(doc, "Holiday created successfully", 201);
});