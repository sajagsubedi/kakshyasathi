import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SubjectModel from "@/models/Subject.model";
import { getPagination } from "@/lib/api/pagination";

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams);
  const search = searchParams.get("search");

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    SubjectModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    SubjectModel.countDocuments(filter),
  ]);

  return ApiResponse(
    { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    "Subjects fetched successfully",
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { name, code } = body;

  if (!name?.trim()) throw new Error("Name is required");
  if (!code?.trim()) throw new Error("Code is required");

  const existing = await SubjectModel.findOne({
    $or: [{ code: code.trim().toUpperCase() }, { name: name.trim() }],
  });
  if (existing)
    throw new Error("Subject with this name or code already exists");

  const doc = await SubjectModel.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
  });

  return ApiResponse(doc, "Subject created successfully", 201);
});
