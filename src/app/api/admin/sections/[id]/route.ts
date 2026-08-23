import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SectionModel from "@/models/Section.model";
import StudentModel from "@/models/Student.model";
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

    const doc = await SectionModel.findById(id)
      .populate("class", "name grade academicYear")
      .lean();
    if (!doc) throw new Error("Section not found");

    return ApiResponse(doc, "Section fetched successfully");
  },
);

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const doc = await SectionModel.findById(id);
    if (!doc) throw new Error("Section not found");

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) throw new Error("Name cannot be empty");
      const duplicate = await SectionModel.findOne({
        class: doc.class,
        name,
        _id: { $ne: id },
      });
      if (duplicate)
        throw new Error("Section with this name already exists in this class");
      doc.name = name;
    }

    await doc.save();
    const populated = await SectionModel.findById(id)
      .populate("class", "name grade academicYear")
      .lean();

    return ApiResponse(populated, "Section updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const studentsCount = await StudentModel.countDocuments({ section: id });
    if (studentsCount > 0) {
      throw new Error(
        "Cannot delete section that has students. Reassign or remove students first.",
      );
    }

    const deleted = await SectionModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Section not found");

    return ApiResponse(null, "Section deleted successfully");
  },
);
