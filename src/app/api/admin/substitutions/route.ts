import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SubstitutionModel from "@/models/Substitution.model";
import SectionModel from "@/models/Section.model";
import TeacherModel from "@/models/Teacher.model";
import { getPagination } from "@/lib/api/pagination";
import { parseObjectId } from "@/lib/api/parseId";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

const populate = [
  { path: "section", populate: { path: "class", select: "name grade" } },
  {
    path: "originalTeacher",
    populate: { path: "user", select: "name username" },
  },
  {
    path: "substituteTeacher",
    populate: { path: "user", select: "name username" },
  },
];

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams);
  const section = searchParams.get("section");
  const date = searchParams.get("date");

  const filter: Record<string, unknown> = {};
  if (section) {
    parseObjectId(section, "section");
    filter.section = section;
  }
  if (date) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) throw new Error("Invalid date");
    filter.date = { $gte: startOfDay(parsed), $lte: endOfDay(parsed) };
  }

  const [items, total] = await Promise.all([
    SubstitutionModel.find(filter)
      .populate(populate)
      .sort({ date: -1, periodNumber: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SubstitutionModel.countDocuments(filter),
  ]);

  return ApiResponse(
    { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    "Substitutions fetched successfully",
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const {
    section,
    periodNumber,
    date,
    originalTeacher,
    substituteTeacher,
  } = body;

  if (!section) throw new Error("Section is required");
  if (typeof periodNumber !== "number" || periodNumber < 1) {
    throw new Error("Valid period number is required");
  }
  if (!date) throw new Error("Date is required");
  if (!originalTeacher) throw new Error("Original teacher is required");
  if (!substituteTeacher) throw new Error("Substitute teacher is required");
  if (originalTeacher === substituteTeacher) {
    throw new Error("Substitute teacher must be different from the original teacher");
  }

  parseObjectId(section, "section");
  parseObjectId(originalTeacher, "originalTeacher");
  parseObjectId(substituteTeacher, "substituteTeacher");

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) throw new Error("Invalid date");

  const [sectionExists, originalExists, substituteExists] = await Promise.all([
    SectionModel.findById(section),
    TeacherModel.findById(originalTeacher),
    TeacherModel.findById(substituteTeacher),
  ]);
  if (!sectionExists) throw new Error("Section not found");
  if (!originalExists) throw new Error("Original teacher not found");
  if (!substituteExists) throw new Error("Substitute teacher not found");

  const existing = await SubstitutionModel.findOne({
    section,
    periodNumber,
    date: { $gte: startOfDay(parsedDate), $lte: endOfDay(parsedDate) },
  });
  if (existing) {
    throw new Error("A substitution already exists for this section, date, and period");
  }

  const doc = await SubstitutionModel.create({
    section,
    periodNumber,
    date: startOfDay(parsedDate),
    originalTeacher,
    substituteTeacher,
  });

  const populated = await SubstitutionModel.findById(doc._id)
    .populate(populate)
    .lean();

  return ApiResponse(populated, "Substitution created successfully", 201);
});
