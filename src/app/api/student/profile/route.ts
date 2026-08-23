import { withHandler } from "@/lib/api/ApiHandler";
import { requireStudent } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import StudentModel from "@/models/Student.model";

export const GET = withHandler(async () => {
  const session = await requireStudent();
  await connectDb();

  const student = await StudentModel.findOne({ user: session.user._id })
    .populate({
      path: "section",
      populate: { path: "class", select: "name grade" },
    })
    .lean();

  if (!student) {
    return ApiResponse(null, "Student profile not found");
  }

  return ApiResponse(
    {
      id: String(student._id),
      fullName: session.user.name,
      username: session.user.username,
      email: session.user.email,
      sectionId: String(student.section),
      sectionName: (student.section as { name?: string })?.name ?? "",
      className:
        (student.section as { class?: { name?: string } })?.class?.name ?? "",
      rollNumber: student.rollNumber,
      symbolNumber: student.symbolNumber,
      enrollmentYear: student.enrollmentYear,
      guardianContact: student.guardianContact ?? "",
    },
    "Student profile fetched successfully",
  );
});
