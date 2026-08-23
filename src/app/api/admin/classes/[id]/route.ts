import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import ClassModel from "@/models/Class.model";
import SectionModel from "@/models/Section.model";
import { parseObjectId } from "@/lib/api/parseId";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const doc = await ClassModel.findById(id).lean();
    if (!doc) throw new Error("Class not found");

    return ApiResponse(doc, "Class fetched successfully");
  },
);

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const doc = await ClassModel.findById(id);
    if (!doc) throw new Error("Class not found");

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) throw new Error("Name cannot be empty");
      const duplicate = await ClassModel.findOne({
        name,
        academicYear: doc.academicYear,
        _id: { $ne: id },
      });
      if (duplicate) throw new Error("Class with this name already exists");
      doc.name = name;
    }
    if (body.grade !== undefined) {
      if (typeof body.grade !== "number" || body.grade < 1)
        throw new Error("Invalid grade");
      doc.grade = body.grade;
    }
    if (body.academicYear !== undefined) {
      if (!body.academicYear.trim())
        throw new Error("Academic year cannot be empty");
      doc.academicYear = body.academicYear.trim();
    }

    await doc.save();
    return ApiResponse(doc, "Class updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const sectionsCount = await SectionModel.countDocuments({ class: id });
    if (sectionsCount > 0) {
      throw new Error(
        "Cannot delete class that has sections. Delete sections first.",
      );
    }

    const deleted = await ClassModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Class not found");

    return ApiResponse(null, "Class deleted successfully");
  },
);
