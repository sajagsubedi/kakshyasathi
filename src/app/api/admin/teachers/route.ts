import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherModel from "@/models/Teacher.model";
import { getPagination } from "@/lib/api/pagination";

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams);

  const [items, total] = await Promise.all([
    TeacherModel.find({})
      .populate("user", "name username email gender")
      .populate("subjects", "name code")
      .populate({
        path: "assignedSections",
        populate: { path: "class", select: "name grade" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TeacherModel.countDocuments(),
  ]);

  return ApiResponse(
    { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    "Teachers fetched successfully",
  );
});
