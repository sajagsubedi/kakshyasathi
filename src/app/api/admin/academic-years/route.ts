import { NextRequest } from "next/server";

import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";

import AcademicYearModel from "@/models/AcademicYear.model";

export const GET = withHandler(async () => {
  await requireAdmin();
  await connectDb();

  const academicYears = await AcademicYearModel.find({})
    .sort({ startDate: -1 })
    .lean();

  return ApiResponse(academicYears, "Academic years fetched successfully", 200);
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();

  const { label, startDate, endDate } = body;

  if (!label || !startDate || !endDate) {
    throw new Error("label, startDate and endDate are required");
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (
    Number.isNaN(parsedStartDate.getTime()) ||
    Number.isNaN(parsedEndDate.getTime())
  ) {
    throw new Error("Invalid date");
  }

  if (parsedStartDate >= parsedEndDate) {
    throw new Error("Start date must be before end date");
  }

  const existingAcademicYear = await AcademicYearModel.findOne({
    label,
  });

  if (existingAcademicYear) {
    throw new Error("Academic year with this label already exists");
  }

  const academicYear = await AcademicYearModel.create({
    label,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    isActive: false,
  });

  return ApiResponse(academicYear, "Academic year created successfully", 201);
});
