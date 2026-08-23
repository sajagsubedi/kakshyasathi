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
      populate: {
        path: "class",
        populate: { path: "academicYear", select: "label isActive" },
      },
    })
    .lean();

  if (!student) {
    return ApiResponse(null, "Student profile not found");
  }

  const sec = student.section as unknown as {
    _id?: unknown;
    name?: string;
    class?: {
      _id?: unknown;
      name?: string;
      grade?: number;
      academicYear?: { _id?: unknown; label?: string } | string;
    };
  } | undefined;

  const academicYearLabel =
    typeof sec?.class?.academicYear === "object" && sec?.class?.academicYear !== null
      ? sec.class.academicYear.label ?? ""
      : String(sec?.class?.academicYear ?? "");

  return ApiResponse(
    {
      id: String(student._id),
      fullName: session.user.name,
      username: session.user.username,
      email: session.user.email,
      sectionId: sec?._id ? String(sec._id) : String(student.section),
      sectionName: sec?.name ?? "",
      className: sec?.class?.name ?? "",
      grade: sec?.class?.grade,
      academicYear: academicYearLabel,
      rollNumber: student.rollNumber,
      symbolNumber: student.symbolNumber,
      enrollmentYear: student.enrollmentYear,
      guardianContact: student.guardianContact ?? "",
    },
    "Student profile fetched successfully",
  );
});
