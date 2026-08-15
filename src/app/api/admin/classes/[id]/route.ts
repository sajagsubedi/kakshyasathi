import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import { NotFoundError } from '@/lib/errors';
import connectDb from '@/lib/connectDB';
import ClassModel from '@/models/class.model';
import SectionModel from '@/models/section.model';
import UserModel, { UserRole } from '@/models/user.model';
import StudentAttendanceModel from '@/models/studentAttendance.model';
import TimetableModel from '@/models/timetable.model';
import { serializeUser } from '@/services/admin.service';

export const GET = withHandler(
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    await requireAdmin();
    await connectDb();

    const params = await context.params;
    const classId = params.id;

    const cls = await ClassModel.findById(classId);
    if (!cls) {
      throw new NotFoundError('Class not found');
    }

    const sections = await SectionModel.find({ classId }).sort({ name: 1 });
    const sectionIds = sections.map((s) => s._id);

    const [studentsRaw, teachersRaw, attendanceRaw, timetableRaw] = await Promise.all([
      UserModel.find({ sectionId: { $in: sectionIds }, userRole: UserRole.STUDENT })
        .populate('sectionId')
        .sort({ fullName: 1 }),
      UserModel.find({ userRole: UserRole.TEACHER }),
      StudentAttendanceModel.find({ sectionId: { $in: sectionIds } }).sort({ date: -1 }).limit(100),
      TimetableModel.find({ sectionId: { $in: sectionIds } }).populate('subjectId teacherId periodId'),
    ]);

    const students = await Promise.all(studentsRaw.map(serializeUser));

    const sectionMap = new Map(
      sections.map((s) => [
        s._id.toString(),
        {
          id: s._id.toString(),
          classId: s.classId.toString(),
          name: s.name,
          academicYear: s.academicYear,
          studentCount: students.filter((u) => u.sectionId === s._id.toString()).length,
        },
      ]),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceToday = attendanceRaw.filter(
      (a) => new Date(a.date).getTime() === today.getTime(),
    );
    const presentToday = attendanceToday.filter((a) => a.status === 'PRESENT').length;
    const absentToday = attendanceToday.filter((a) => a.status === 'ABSENT').length;
    const lateToday = attendanceToday.filter((a) => a.status === 'LATE').length;

    const totalPresent = attendanceRaw.filter((a) => a.status === 'PRESENT').length;
    const totalAbsent = attendanceRaw.filter((a) => a.status === 'ABSENT').length;
    const attendanceRate = attendanceRaw.length > 0
      ? Math.round((totalPresent / attendanceRaw.length) * 100)
      : 0;

    const timetable = timetableRaw.map((t) => {
      const tt: Record<string, unknown> = {
        id: t._id.toString(),
        sectionId: t.sectionId.toString(),
        dayOfWeek: t.dayOfWeek,
      };
      const anyT = t as unknown as Record<string, any>;
      tt.periodId = anyT.periodId?._id?.toString?.() ?? t.periodId?.toString?.() ?? '';
      tt.periodNumber = anyT.periodId?.periodNumber ?? null;
      tt.startTime = anyT.periodId?.startTime ?? null;
      tt.endTime = anyT.periodId?.endTime ?? null;
      tt.subjectId = anyT.subjectId?._id?.toString?.() ?? t.subjectId?.toString?.() ?? '';
      tt.subjectName = anyT.subjectId?.name ?? 'Unknown';
      tt.teacherId = anyT.teacherId?._id?.toString?.() ?? t.teacherId?.toString?.() ?? '';
      tt.teacherName = anyT.teacherId?.fullName ?? 'Unassigned';
      return tt;
    });

    return success({
      class: {
        id: cls._id.toString(),
        name: cls.name,
        grade: cls.grade,
        academicYear: cls.academicYear,
      },
      sections: Array.from(sectionMap.values()),
      students,
      teacherCount: teachersRaw.length,
      attendance: {
        totalRecords: attendanceRaw.length,
        today: { present: presentToday, absent: absentToday, late: lateToday },
        overall: { present: totalPresent, absent: totalAbsent, rate: attendanceRate },
        recent: attendanceRaw.slice(0, 20).map((r) => ({
          id: r._id.toString(),
          studentId: r.studentId.toString(),
          sectionId: r.sectionId.toString(),
          date: r.date.toISOString().split('T')[0],
          status: r.status,
          scannedAt: r.scannedAt?.toISOString() ?? null,
        })),
      },
      timetable,
    });
  },
);
