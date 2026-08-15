import connectDb from '@/lib/connectDB';
import UserModel, { UserRole } from '@/models/user.model';
import ClassModel from '@/models/class.model';
import SectionModel from '@/models/section.model';
import SubjectModel from '@/models/subject.model';
import SmartBoardModel from '@/models/smartboard.model';
import PeriodModel from '@/models/period.model';
import TimetableModel from '@/models/timetable.model';
import SubstitutionModel from '@/models/substitution.model';
import PeriodOverrideModel from '@/models/periodOverride.model';
import StudentAttendanceModel from '@/models/studentAttendance.model';
import NoticeModel from '@/models/notice.model';
import { formatDate } from '@/lib/serialize';
import type { DashboardStats } from '@/types';

export async function serializeUser(user: {
  _id: { toString(): string };
  username: string;
  fullName: string;
  userRole: string;
  phone?: string;
  rollNumber?: string;
  classId?: { toString(): string };
  sectionId?: { toString(): string };
  profilePicture?: { url: string };
  createdAt?: Date;
}) {
  return {
    id: user._id.toString(),
    username: user.username,
    fullName: user.fullName,
    role: user.userRole as 'ADMIN' | 'TEACHER' | 'STUDENT',
    phone: user.phone,
    rollNumber: user.rollNumber,
    classId: user.classId?.toString?.() ?? user.classId?.toString(),
    sectionId: user.sectionId?.toString?.() ?? user.sectionId?.toString(),
    profilePicture: user.profilePicture?.url,
    createdAt: user.createdAt?.toISOString(),
  };
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  await connectDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    students,
    teachers,
    classes,
    sections,
    presentToday,
    absentToday,
    lateToday,
    activeBoards,
    totalBoards,
    activeNotices,
    substitutionsToday,
  ] = await Promise.all([
    UserModel.countDocuments({ userRole: UserRole.STUDENT }),
    UserModel.countDocuments({ userRole: UserRole.TEACHER }),
    ClassModel.countDocuments(),
    SectionModel.countDocuments(),
    StudentAttendanceModel.countDocuments({ date: today, status: 'PRESENT' }),
    StudentAttendanceModel.countDocuments({ date: today, status: 'ABSENT' }),
    StudentAttendanceModel.countDocuments({ date: today, status: 'LATE' }),
    SmartBoardModel.countDocuments({ status: 'ONLINE' }),
    SmartBoardModel.countDocuments(),
    NoticeModel.countDocuments({ status: 'ACTIVE' }),
    SubstitutionModel.countDocuments({ date: today }),
  ]);

  const attendanceRate =
    students > 0 ? Math.round((presentToday / students) * 100) : 0;

  return {
    students,
    teachers,
    classes,
    sections,
    presentToday,
    absentToday,
    lateToday,
    attendanceRate,
    activeBoards,
    totalBoards,
    activeNotices,
    substitutionsToday,
  };
}

export async function getLookupMaps() {
  await connectDb();

  const [users, sections, classes, subjects, periods] = await Promise.all([
    UserModel.find(),
    SectionModel.find().populate('classId'),
    ClassModel.find(),
    SubjectModel.find(),
    PeriodModel.find().sort({ periodNumber: 1 }),
  ]);

  const sectionMap = new Map<string, string>();
  for (const section of sections) {
    const cls = section.classId as { name?: string } | null;
    sectionMap.set(
      section._id.toString(),
      cls?.name ? `${cls.name} - ${section.name}` : section.name,
    );
  }

  const userMap = new Map(users.map((u) => [u._id.toString(), u.fullName]));
  const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s.name]));
  const periodMap = new Map(
    periods.map((p) => [p._id.toString(), p]),
  );

  return {
    getSectionName: (id: string) => sectionMap.get(id) ?? 'Unknown',
    getTeacherName: (id: string) => userMap.get(id) ?? 'Unassigned',
    getSubjectName: (id: string) => subjectMap.get(id) ?? 'Free',
    getPeriod: (id: string) => {
      const p = periodMap.get(id);
      if (!p) return undefined;
      return {
        id: p._id.toString(),
        periodNumber: p.periodNumber,
        startTime: p.startTime,
        endTime: p.endTime,
      };
    },
    users: users.map((u) => serializeUser(u)),
    sections: sections.map((s) => ({
      id: s._id.toString(),
      classId: (s.classId as { _id?: { toString(): string } })?._id?.toString?.() ??
        s.classId.toString(),
      name: s.name,
      academicYear: s.academicYear,
    })),
    classes: classes.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      grade: c.grade,
      academicYear: c.academicYear,
    })),
    subjects: subjects.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      code: s.code,
    })),
    periods: periods.map((p) => ({
      id: p._id.toString(),
      periodNumber: p.periodNumber,
      startTime: p.startTime,
      endTime: p.endTime,
    })),
  };
}

export { formatDate, TimetableModel, SubstitutionModel, PeriodOverrideModel };
