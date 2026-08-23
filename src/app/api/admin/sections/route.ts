import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SectionModel from "@/models/Section.model";
import ClassModel from "@/models/Class.model";
import { getPagination } from "@/lib/api/pagination";
import { parseObjectId } from "@/lib/api/parseId";

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams);
  const classId = searchParams.get("class");

  const filter: Record<string, unknown> = {};
  if (classId) {
    parseObjectId(classId, "class");
    filter.class = classId;
  }

  const [items, total] = await Promise.all([
    SectionModel.find(filter)
      .populate("class", "name grade academicYear")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SectionModel.countDocuments(filter),
  ]);

  return ApiResponse(
    { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    "Sections fetched successfully",
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { class: classId, name } = body;

  if (!classId) throw new Error("Class is required");
  if (!name?.trim()) throw new Error("Section name is required");

  parseObjectId(classId, "class");
  const classExists = await ClassModel.findById(classId);
  if (!classExists) throw new Error("Class not found");

  const existing = await SectionModel.findOne({
    class: classId,
    name: name.trim(),
  });
  if (existing)
    throw new Error("Section with this name already exists in this class");

  const doc = await SectionModel.create({
    class: classId,
    name: name.trim(),
  });

  const populated = await SectionModel.findById(doc._id)
    .populate("class", "name grade academicYear")
    .lean();

  return ApiResponse(populated, "Section created successfully", 201);
});
