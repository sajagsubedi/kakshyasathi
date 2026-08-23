import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SectionModel from "@/models/Section.model";
import SubjectModel from "@/models/Subject.model";
import TeacherModel from "@/models/Teacher.model";
import PeriodModel from "@/models/Period.model";

export const GET = withHandler(async () => {
  await requireAdmin();
  await connectDb();

  const [sections, subjects, teachers, periods] = await Promise.all([
    SectionModel.find({})
      .populate({ path: "class", select: "name grade" })
      .lean(),
    SubjectModel.find({}).lean(),
    TeacherModel.find({})
      .populate("user", "name username")
      .lean(),
    PeriodModel.find({}).sort({ periodNumber: 1 }).lean(),
  ]);

  const getSectionName = (id: string) => {
    const s = sections.find((x) => String(x._id) === id);
    if (!s) return "Unknown";
    const cls = s.class as { name?: string };
    return cls?.name ? `${cls.name} - ${s.name}` : s.name;
  };

  const getTeacherName = (id: string) => {
    const t = teachers.find((x) => String(x._id) === id);
    return (t?.user as { name?: string })?.name ?? "Unassigned";
  };

  const getSubjectName = (id: string) => {
    const s = subjects.find((x) => String(x._id) === id);
    return s?.name ?? "Free";
  };

  const getPeriod = (id: string) =>
    periods.find((p) => String(p._id) === id) as
      | { _id: string; periodNumber: number; startTime: string; endTime: string }
      | undefined;

  return ApiResponse(
    {
      sections: sections.map((s) => ({
        _id: String(s._id),
        name: s.name,
        class: s.class,
      })),
      subjects: subjects.map((s) => ({
        _id: String(s._id),
        name: s.name,
        code: s.code,
      })),
      teachers: teachers.map((t) => ({
        _id: String(t._id),
        user: t.user,
      })),
      periods: periods.map((p) => ({
        _id: String(p._id),
        periodNumber: p.periodNumber,
        startTime: p.startTime,
        endTime: p.endTime,
      })),
      getSectionName,
      getTeacherName,
      getSubjectName,
      getPeriod,
    },
    "Lookup fetched successfully",
  );
});
