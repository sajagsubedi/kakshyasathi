import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import ClassModel from "@/models/Class.model";
import { getPagination } from "@/lib/api/pagination";

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);

  const { page, limit, skip } = getPagination(searchParams);

  const academicYear = searchParams.get("academicYear");
  const search = searchParams.get("search");

  const filter: Record<string, unknown> = {};

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  const [items, total] = await Promise.all([
    ClassModel.find(filter)
      .populate("academicYear", "_id label")
      .sort({ grade: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    ClassModel.countDocuments(filter),
  ]);

  return ApiResponse(
    {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    "Classes fetched successfully",
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { name, grade, academicYear } = body;

  if (!name?.trim()) throw new Error("Name is required");
  if (typeof grade !== "number" || grade < 1)
    throw new Error("Valid grade is required");
  if (!academicYear?.trim()) throw new Error("Academic year is required");

  const existing = await ClassModel.findOne({
    name: name.trim(),
    academicYear,
  });
  if (existing)
    throw new Error(
      "Class with this name already exists for this academic year",
    );

  const doc = await ClassModel.create({
    name: name.trim(),
    grade,
    academicYear: academicYear.trim(),
  });

  return ApiResponse(doc, "Class created successfully", 201);
});
