import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import AttendanceTerminalModel from "@/models/AttendanceTerminal.model";
import { parseObjectId } from "@/lib/api/parseId";
import { DeviceStatus } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const doc = await AttendanceTerminalModel.findById(id)
      .populate("classroom", "roomNumber")
      .lean();
    if (!doc) throw new Error("Attendance terminal not found");
    return ApiResponse(doc, "Attendance terminal fetched successfully");
  },
);

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const doc = await AttendanceTerminalModel.findById(id);
    if (!doc) throw new Error("Attendance terminal not found");

    if (body.terminalCode !== undefined) {
      const terminalCode = body.terminalCode.trim().toUpperCase();
      if (!terminalCode) throw new Error("Terminal code cannot be empty");
      const duplicate = await AttendanceTerminalModel.findOne({
        terminalCode,
        _id: { $ne: id },
      });
      if (duplicate) throw new Error("Terminal code already exists");
      doc.terminalCode = terminalCode;
    }

    if (body.classroom !== undefined) {
      parseObjectId(body.classroom, "classroom");
      const taken = await AttendanceTerminalModel.findOne({
        classroom: body.classroom,
        _id: { $ne: id },
      });
      if (taken) {
        throw new Error("This classroom already has an attendance terminal");
      }
      doc.classroom = body.classroom;
    }

    if (body.status !== undefined) {
      if (!Object.values(DeviceStatus).includes(body.status)) {
        throw new Error("Invalid device status");
      }
      doc.status = body.status;
    }

    if (body.deviceKey !== undefined) {
      const deviceKey = body.deviceKey.trim();
      if (!deviceKey) throw new Error("Device key cannot be empty");
      const duplicate = await AttendanceTerminalModel.findOne({
        deviceKey,
        _id: { $ne: id },
      });
      if (duplicate) throw new Error("Device key already exists");
      doc.deviceKey = deviceKey;
    }

    await doc.save();
    const populated = await AttendanceTerminalModel.findById(id)
      .populate("classroom", "roomNumber")
      .lean();
    return ApiResponse(populated, "Attendance terminal updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const deleted = await AttendanceTerminalModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Attendance terminal not found");
    return ApiResponse(null, "Attendance terminal deleted successfully");
  },
);
