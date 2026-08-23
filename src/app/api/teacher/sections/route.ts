import { withHandler } from "@/lib/api/ApiHandler";
import { requireTeacher } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherModel from "@/models/Teacher.model";
import SectionModel from "@/models/Section.model";
import StudentModel from "@/models/Student.model";

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  await connectDb();

  const teacher = await TeacherModel.findOne({ user: session.user._id }).lean();
  if (!teacher) {
    return ApiResponse([], "Teacher profile not found");
  }

  const assignedSections = (teacher.assignedSections ?? []).map(String);
  const sections = await SectionModel.find({ _id: { $in: assignedSections } })
    .populate("class", "name grade academicYear")
    .lean();

  const sectionIds = sections.map((s) => s._id);
  const studentCounts = await StudentModel.aggregate([
    { $match: { section: { $in: sectionIds } } },
    { $group: { _id: "$section", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(studentCounts.map((c) => [String(c._id), c.count]));

  return ApiResponse(
    sections.map((s) => ({
      id: String(s._id),
      name: s.name,
      academicYear: (s.class as { academicYear?: string })?.academicYear ?? "",
      className: (s.class as { name?: string })?.name ?? "",
      studentCount: countMap.get(String(s._id)) ?? 0,
    })),
    "Teacher sections fetched successfully",
  );
});
