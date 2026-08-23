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

export const PATCH = withHandler(async (_req, context: RouteContext) => {
  await requireAdmin();
  console.log("Till here")
  await connectDb();

  const { id } = await context.params;

  const academicYear = await AcademicYearModel.findById(id);

  if (!academicYear) {
    throw new Error("Academic year not found");
  }

  if (academicYear.isActive) {
    return ApiResponse(academicYear, "Academic year is already active");
  }

  /*
   * There should only be one active
   * academic year.
   */

  await AcademicYearModel.updateMany(
    {
      _id: { $ne: id },
      isActive: true,
    },
    {
      $set: {
        isActive: false,
      },
    },
  );

  academicYear.isActive = true;

  await academicYear.save();

  return ApiResponse(academicYear, "Academic year activated successfully");
});
