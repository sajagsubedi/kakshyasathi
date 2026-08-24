import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireSmartboard } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SmartBoardModel from "@/models/SmartBoard.model";
import ClassroomModel from "@/models/Classroom.model";
import NoticeModel from "@/models/Notice.model";
import { NoticeTargetType } from "@/types";

export const GET = withHandler(async (req: NextRequest) => {
  const session = await requireSmartboard();
  await connectDb();

  const smartboard = await SmartBoardModel.findById(session.user._id).populate("classroom");
  if (!smartboard) {
    throw new Error("Smart board not found");
  }

  const classroom = await ClassroomModel.findById(smartboard.classroom._id).populate("section");
  if (!classroom) {
    throw new Error("Classroom not found");
  }

  const sectionId = classroom.section._id;

  // Get notices targeting all sections or this specific section
  const notices = await NoticeModel.find({
    $or: [
      { targetType: NoticeTargetType.all },
      { 
        targetType: NoticeTargetType.sections,
        targetSections: { $in: [sectionId] }
      }
    ]
  })
    .populate("author", "name")
    .sort({ publishedAt: -1 })
    .limit(20)
    .lean();

  const formattedNotices = notices.map((notice: any) => ({
    id: notice._id.toString(),
    title: notice.title,
    content: notice.body,
    targetType: notice.targetType,
    targetSections: notice.targetSections?.map((id: any) => id.toString()) || [],
    priority: notice.priority || "normal",
    createdAt: notice.createdAt.toISOString(),
  }));

  return ApiResponse(
    formattedNotices,
    "Notices fetched successfully"
  );
});