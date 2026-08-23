import { withHandler } from "@/lib/api/ApiHandler";
import { requireTeacher } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherModel from "@/models/Teacher.model";
import NoticeModel from "@/models/Notice.model";
import { NoticeTargetType } from "@/types";

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  await connectDb();

  const teacher = await TeacherModel.findOne({ user: session.user._id }).lean();
  const assignedSections = (teacher?.assignedSections ?? []).map(String);

  const filter = {
    $or: [
      { targetType: NoticeTargetType.all },
      ...(assignedSections.length > 0
        ? [{ targetSections: { $in: assignedSections } }]
        : []),
    ],
  };

  const notices = await NoticeModel.find(filter)
    .sort({ publishedAt: -1 })
    .lean();

  return ApiResponse(
    notices.map((n) => ({
      id: String(n._id),
      title: n.title,
      content: n.body,
      targetType: n.targetType,
      targetSections: (n.targetSections ?? []).map(String),
      priority: "MEDIUM",
      createdAt: n.publishedAt,
    })),
    "Teacher notices fetched successfully",
  );
});
