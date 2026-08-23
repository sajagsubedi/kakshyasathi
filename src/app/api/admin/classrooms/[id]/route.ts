import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import ClassroomModel from "@/models/Classroom.model";
import SmartBoardModel from "@/models/SmartBoard.model";
import AttendanceTerminalModel from "@/models/AttendanceTerminal.model";
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

    const doc = await ClassroomModel.findById(id)
      .populate("section", "name")
      .lean();
    if (!doc) throw new Error("Classroom not found");
    return ApiResponse(doc, "Classroom fetched successfully");
  },
);

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const doc = await ClassroomModel.findById(id);
    if (!doc) throw new Error("Classroom not found");

    if (body.roomNumber !== undefined) {
      const roomNumber = body.roomNumber.trim();
      if (!roomNumber) throw new Error("Room number cannot be empty");
      const duplicate = await ClassroomModel.findOne({
        roomNumber,
        _id: { $ne: id },
      });
      if (duplicate)
        throw new Error("Classroom with this room number already exists");
      doc.roomNumber = roomNumber;
    }
    if (body.section !== undefined) {
      doc.section = body.section || undefined;
    }

    await doc.save();
    return ApiResponse(doc, "Classroom updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const [sbCount, atCount] = await Promise.all([
      SmartBoardModel.countDocuments({ classroom: id }),
      AttendanceTerminalModel.countDocuments({ classroom: id }),
    ]);
    if (sbCount > 0 || atCount > 0) {
      throw new Error(
        "Cannot delete classroom that has devices. Remove devices first.",
      );
    }

    const deleted = await ClassroomModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Classroom not found");
    return ApiResponse(null, "Classroom deleted successfully");
  },
);
