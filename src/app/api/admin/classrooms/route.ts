import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import ClassroomModel from "@/models/Classroom.model";
import { getPagination } from "@/lib/api/pagination";

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams);
  const search = searchParams.get("search");

  const filter: Record<string, unknown> = {};
  if (search) filter.roomNumber = { $regex: search, $options: "i" };

  const [items, total] = await Promise.all([
    ClassroomModel.find(filter)
      .populate("section", "name")
      .sort({ roomNumber: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ClassroomModel.countDocuments(filter),
  ]);

  return ApiResponse(
    { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    "Classrooms fetched successfully",
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { roomNumber, section } = body;

  if (!roomNumber?.trim()) throw new Error("Room number is required");

  const existing = await ClassroomModel.findOne({
    roomNumber: roomNumber.trim(),
  });
  if (existing)
    throw new Error("Classroom with this room number already exists");

  const doc = await ClassroomModel.create({
    roomNumber: roomNumber.trim(),
    section: section || undefined,
  });

  return ApiResponse(doc, "Classroom created successfully", 201);
});
