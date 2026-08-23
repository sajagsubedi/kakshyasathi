import { withHandler } from "@/lib/api/ApiHandler";
import { requireAuth } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import SectionModel from "@/models/Section.model";
import SubjectModel from "@/models/Subject.model";
import TeacherModel from "@/models/Teacher.model";
import PeriodModel from "@/models/Period.model";
import UserModel from "@/models/User.model";
import StudentModel from "@/models/Student.model";
import { UserRole } from "@/types";

export const GET = withHandler(async () => {
  const session = await requireAuth();
  await connectDb();

  const role = session.user.role as UserRole;
  const userId = session.user._id;

  const [sections, subjects, periods] = await Promise.all([
    SectionModel.find({})
      .populate({ path: "class", select: "name grade" })
      .lean(),
    SubjectModel.find({}).lean(),
    PeriodModel.find({}).sort({ periodNumber: 1 }).lean(),
  ]);

  const sectionMap = new Map(
    sections.map((s) => [
      String(s._id),
      {
        _id: String(s._id),
        name: s.name,
        class: s.class as { _id: string; name: string; grade?: number },
      },
    ]),
  );

  const subjectMap = new Map(
    subjects.map((s) => [String(s._id), { _id: String(s._id), name: s.name, code: s.code }]),
  );

  const periodMap = new Map(
    periods.map((p) => [
      String(p._id),
      { _id: String(p._id), periodNumber: p.periodNumber, startTime: p.startTime, endTime: p.endTime },
    ]),
  );

  const teachers = await TeacherModel.find({})
    .populate("user", "name username")
    .lean();
  const teacherMap = new Map(
    teachers.map((t) => [
      String(t._id),
      { _id: String(t._id), user: t.user as { _id: string; name: string; username: string } },
    ]),
  );

  const getSectionName = (id: string) => {
    const s = sectionMap.get(id);
    if (!s) return id;
    return s.class?.name ? `${s.class.name} - ${s.name}` : s.name;
  };
  const getSubjectName = (id: string) => subjectMap.get(id)?.name ?? id;
  const getTeacherName = (id: string) => teacherMap.get(id)?.user?.name ?? "Unassigned";
  const getPeriod = (id: string) => periodMap.get(id);

  let users: Array<{
    id: string;
    fullName: string;
    username: string;
    role: string;
    sectionId?: string;
  }> = [];

  if (role === UserRole.teacher) {
    const teacher = teachers.find((t) => String(t.user?._id ?? "") === userId);
    const assignedSectionIds = (teacher?.assignedSections ?? []).map(String);
    const studentsInSections = await StudentModel.find({
      section: { $in: assignedSectionIds },
    })
      .populate("user", "name username")
      .lean();
    users = studentsInSections.map((s) => ({
      id: String((s.user as { _id: string })._id),
      fullName: (s.user as { name: string }).name,
      username: (s.user as { username: string }).username,
      role: "student",
      sectionId: String(s.section),
    }));
  }

  return ApiResponse(
    {
      sections: Array.from(sectionMap.values()),
      subjects: Array.from(subjectMap.values()),
      periods: Array.from(periodMap.values()),
      teachers: Array.from(teacherMap.values()),
      users,
      getSectionName,
      getSubjectName,
      getTeacherName,
      getPeriod,
    },
    "Lookup fetched successfully",
  );
});
