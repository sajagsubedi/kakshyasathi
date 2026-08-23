import { withHandler } from "@/lib/api/ApiHandler";
import { requireStudent } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import StudentModel from "@/models/Student.model";
import NoticeModel from "@/models/Notice.model";
import { NoticeTargetType } from "@/types";

export const GET = withHandler(async () => {
  const session = await requireStudent();
  await connectDb();

  const student = await StudentModel.findOne({ user: session.user._id }).lean();
  if (!student) {
    return ApiResponse([], "Student profile not found");
  }

  const sectionId = student.section;
  const filter = {
    $or: [
      { targetType: NoticeTargetType.all },
      { targetSections: { $in: [sectionId] } },
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
      priority: "MEDIUM",
      createdAt: n.publishedAt,
    })),
    "Student notices fetched successfully",
  );
});
