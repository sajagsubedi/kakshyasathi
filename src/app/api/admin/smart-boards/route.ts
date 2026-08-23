import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SmartBoardModel from "@/models/SmartBoard.model";
import ClassroomModel from "@/models/Classroom.model";
import { getPagination } from "@/lib/api/pagination";
import { parseObjectId } from "@/lib/api/parseId";
import { generateDeviceKey } from "@/lib/api/deviceKey";
import { DeviceStatus } from "@/types";

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams);
  const search = searchParams.get("search");
  const classroom = searchParams.get("classroom");
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = {};
  if (classroom) {
    parseObjectId(classroom, "classroom");
    filter.classroom = classroom;
  }
  if (status && Object.values(DeviceStatus).includes(status as DeviceStatus)) {
    filter.status = status;
  }
  if (search) {
    filter.deviceKey = { $regex: search, $options: "i" };
  }

  const [items, total] = await Promise.all([
    SmartBoardModel.find(filter)
      .populate({
        path: "classroom",
        populate: {
          path: "section",
          populate: { path: "class", select: "name grade" },
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SmartBoardModel.countDocuments(filter),
  ]);

  return ApiResponse(
    { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    "Smart boards fetched successfully",
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { classroom, deviceKey, status } = body;

  if (!classroom) throw new Error("Classroom is required");
  parseObjectId(classroom, "classroom");

  const classroomExists = await ClassroomModel.findById(classroom);
  if (!classroomExists) throw new Error("Classroom not found");

  const existingBoard = await SmartBoardModel.findOne({ classroom });
  if (existingBoard) {
    throw new Error("This classroom already has a smart board");
  }

  const key = (deviceKey?.trim() || generateDeviceKey()) as string;
  const duplicateKey = await SmartBoardModel.findOne({ deviceKey: key });
  if (duplicateKey) throw new Error("Device key already exists");

  const doc = await SmartBoardModel.create({
    classroom,
    deviceKey: key,
    status:
      status && Object.values(DeviceStatus).includes(status)
        ? status
        : DeviceStatus.offline,
  });

  const populated = await SmartBoardModel.findById(doc._id)
    .populate("classroom", "roomNumber")
    .lean();

  return ApiResponse(populated, "Smart board registered successfully", 201);
});
