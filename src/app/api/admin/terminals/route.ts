import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import AttendanceTerminalModel from "@/models/AttendanceTerminal.model";
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
    filter.terminalCode = { $regex: search, $options: "i" };
  }

  const [items, total] = await Promise.all([
    AttendanceTerminalModel.find(filter)
      .populate({
        path: "classroom",
        populate: {
          path: "section",
          populate: { path: "class", select: "name grade" },
        },
      })
      .sort({ terminalCode: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AttendanceTerminalModel.countDocuments(filter),
  ]);

  return ApiResponse(
    { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    "Attendance terminals fetched successfully",
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { terminalCode, classroom, deviceKey, status } = body;

  if (!terminalCode?.trim()) throw new Error("Terminal code is required");
  if (!classroom) throw new Error("Classroom is required");
  parseObjectId(classroom, "classroom");

  const classroomExists = await ClassroomModel.findById(classroom);
  if (!classroomExists) throw new Error("Classroom not found");

  const existingTerminal = await AttendanceTerminalModel.findOne({
    classroom,
  });
  if (existingTerminal) {
    throw new Error("This classroom already has an attendance terminal");
  }

  const code = terminalCode.trim().toUpperCase();
  const duplicateCode = await AttendanceTerminalModel.findOne({
    terminalCode: code,
  });
  if (duplicateCode) throw new Error("Terminal code already exists");

  const key = (deviceKey?.trim() || generateDeviceKey()) as string;
  const duplicateKey = await AttendanceTerminalModel.findOne({ deviceKey: key });
  if (duplicateKey) throw new Error("Device key already exists");

  const doc = await AttendanceTerminalModel.create({
    terminalCode: code,
    classroom,
    deviceKey: key,
    status:
      status && Object.values(DeviceStatus).includes(status)
        ? status
        : DeviceStatus.offline,
    lastSyncedSequence: 0,
  });

  const populated = await AttendanceTerminalModel.findById(doc._id)
    .populate("classroom", "roomNumber")
    .lean();

  return ApiResponse(
    populated,
    "Attendance terminal registered successfully",
    201,
  );
});
