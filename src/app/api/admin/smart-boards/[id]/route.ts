import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SmartBoardModel from "@/models/SmartBoard.model";
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

    const doc = await SmartBoardModel.findById(id)
      .populate("classroom", "roomNumber")
      .lean();
    if (!doc) throw new Error("Smart board not found");
    return ApiResponse(doc, "Smart board fetched successfully");
  },
);

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const doc = await SmartBoardModel.findById(id);
    if (!doc) throw new Error("Smart board not found");

    if (body.classroom !== undefined) {
      parseObjectId(body.classroom, "classroom");
      const taken = await SmartBoardModel.findOne({
        classroom: body.classroom,
        _id: { $ne: id },
      });
      if (taken) throw new Error("This classroom already has a smart board");
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
      const duplicate = await SmartBoardModel.findOne({
        deviceKey,
        _id: { $ne: id },
      });
      if (duplicate) throw new Error("Device key already exists");
      doc.deviceKey = deviceKey;
    }

    await doc.save();
    const populated = await SmartBoardModel.findById(id)
      .populate("classroom", "roomNumber")
      .lean();
    return ApiResponse(populated, "Smart board updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const deleted = await SmartBoardModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Smart board not found");
    return ApiResponse(null, "Smart board deleted successfully");
  },
);
