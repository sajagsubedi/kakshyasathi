import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SubjectModel from "@/models/Subject.model";
import TimetableModel from "@/models/Timetable.model";
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

    const doc = await SubjectModel.findById(id).lean();
    if (!doc) throw new Error("Subject not found");
    return ApiResponse(doc, "Subject fetched successfully");
  },
);

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const doc = await SubjectModel.findById(id);
    if (!doc) throw new Error("Subject not found");

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) throw new Error("Name cannot be empty");
      const duplicate = await SubjectModel.findOne({ name, _id: { $ne: id } });
      if (duplicate) throw new Error("Subject with this name already exists");
      doc.name = name;
    }
    if (body.code !== undefined) {
      const code = body.code.trim().toUpperCase();
      if (!code) throw new Error("Code cannot be empty");
      const duplicate = await SubjectModel.findOne({ code, _id: { $ne: id } });
      if (duplicate) throw new Error("Subject with this code already exists");
      doc.code = code;
    }

    await doc.save();
    return ApiResponse(doc, "Subject updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const used = await TimetableModel.countDocuments({ subject: id });
    if (used > 0) {
      throw new Error(
        "Cannot delete subject that is used in a timetable. Remove those entries first.",
      );
    }

    const deleted = await SubjectModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Subject not found");
    return ApiResponse(null, "Subject deleted successfully");
  },
);
