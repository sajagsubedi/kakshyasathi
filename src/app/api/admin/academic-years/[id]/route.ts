import { NextRequest } from "next/server";

import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";

import AcademicYearModel from "@/models/AcademicYear.model";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();

    const { id } = await context.params;

    const academicYear = await AcademicYearModel.findById(id).lean();

    if (!academicYear) {
      throw new Error("Academic year not found");
    }

    return ApiResponse(academicYear, "Academic year fetched successfully");
  },
);

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();

    const { id } = await context.params;

    const body = await req.json();

    const { label, startDate, endDate } = body;

    const academicYear = await AcademicYearModel.findById(id);

    if (!academicYear) {
      throw new Error("Academic year not found");
    }

    if (label !== undefined) {
      const duplicate = await AcademicYearModel.findOne({
        label,
        _id: { $ne: id },
      });

      if (duplicate) {
        throw new Error("Academic year with this label already exists");
      }

      academicYear.label = label;
    }

    if (startDate !== undefined) {
      const parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        throw new Error("Invalid start date");
      }

      academicYear.startDate = parsedStartDate;
    }

    if (endDate !== undefined) {
      const parsedEndDate = new Date(endDate);

      if (Number.isNaN(parsedEndDate.getTime())) {
        throw new Error("Invalid end date");
      }

      academicYear.endDate = parsedEndDate;
    }

    if (academicYear.startDate >= academicYear.endDate) {
      throw new Error("Start date must be before end date");
    }

    await academicYear.save();

    return ApiResponse(academicYear, "Academic year updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();

    const { id } = await context.params;

    const academicYear = await AcademicYearModel.findById(id);

    if (!academicYear) {
      throw new Error("Academic year not found");
    }

    if (academicYear.isActive) {
      throw new Error("Active academic year cannot be deleted");
    }

    await AcademicYearModel.findByIdAndDelete(id);

    return ApiResponse(null, "Academic year deleted successfully");
  },
);
