import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import NoticeModel from "@/models/Notice.model";
import SectionModel from "@/models/Section.model";
import { getPagination } from "@/lib/api/pagination";
import { parseObjectId } from "@/lib/api/parseId";
import { NoticeTargetType } from "@/types";

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams);
  const search = searchParams.get("search");

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { body: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    NoticeModel.find(filter)
      .populate("author", "name username")
      .populate({
        path: "targetSections",
        populate: { path: "class", select: "name grade" },
      })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    NoticeModel.countDocuments(filter),
  ]);

  return ApiResponse(
    { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    "Notices fetched successfully",
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  const session = await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { title, noticeBody, targetType, targetSections, publishedAt } = body;

  if (!title?.trim()) throw new Error("Title is required");
  if (!noticeBody?.trim()) throw new Error("Notice body is required");
  if (!targetType || !Object.values(NoticeTargetType).includes(targetType)) {
    throw new Error("Valid target type is required");
  }

  let sections: string[] = [];
  if (targetType === NoticeTargetType.sections) {
    if (!Array.isArray(targetSections) || targetSections.length === 0) {
      throw new Error("Select at least one section");
    }
    sections = targetSections;
    for (const id of sections) parseObjectId(id, "section");
    const count = await SectionModel.countDocuments({ _id: { $in: sections } });
    if (count !== sections.length) throw new Error("One or more sections were not found");
  }

  const published = publishedAt ? new Date(publishedAt) : new Date();
  if (Number.isNaN(published.getTime())) throw new Error("Invalid published date");

  const doc = await NoticeModel.create({
    title: title.trim(),
    body: noticeBody.trim(),
    author: session.user._id,
    targetType,
    targetSections: targetType === NoticeTargetType.all ? [] : sections,
    publishedAt: published,
  });

  const populated = await NoticeModel.findById(doc._id)
    .populate("author", "name username")
    .populate("targetSections", "name")
    .lean();

  return ApiResponse(populated, "Notice created successfully", 201);
});
