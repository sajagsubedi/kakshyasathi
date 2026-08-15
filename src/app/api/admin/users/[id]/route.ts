import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import { NotFoundError } from '@/lib/errors';
import connectDb from '@/lib/connectDB';
import UserModel from '@/models/user.model';
import StudentAttendanceModel from '@/models/studentAttendance.model';
import TeacherPresenceModel from '@/models/teacherPresence.model';
import { serializeUser } from '@/services/admin.service';

export const GET = withHandler(
  async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    await requireAdmin();
    await connectDb();

    const params = await context.params;
    const userId = params.id;

    const user = await UserModel.findById(userId).populate('sectionId classId');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const attendance: { total: number; present: number; absent: number; late: number; records: unknown[] } = {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      records: [],
    };

    const presence: { total: number; records: unknown[] } = {
      total: 0,
      records: [],
    };

    if (user.userRole === 'STUDENT') {
      const records = await StudentAttendanceModel.find({ studentId: userId })
        .populate('sectionId')
        .sort({ date: -1 })
        .limit(60);

      attendance.total = records.length;
      attendance.present = records.filter((r) => r.status === 'PRESENT').length;
      attendance.absent = records.filter((r) => r.status === 'ABSENT').length;
      attendance.late = records.filter((r) => r.status === 'LATE').length;
      attendance.records = records.map((r) => ({
        id: r._id.toString(),
        sectionId: r.sectionId?._id?.toString?.() ?? r.sectionId?.toString?.() ?? '',
        date: r.date.toISOString().split('T')[0],
        status: r.status,
        scannedAt: r.scannedAt?.toISOString() ?? null,
      }));
    } else if (user.userRole === 'TEACHER') {
      const records = await TeacherPresenceModel.find({ teacherId: userId })
        .populate('sectionId')
        .sort({ date: -1, periodId: 1 })
        .limit(60);

      presence.total = records.length;
      presence.records = records.map((r) => ({
        id: r._id.toString(),
        sectionId: r.sectionId?._id?.toString?.() ?? r.sectionId?.toString?.() ?? '',
        date: r.date.toISOString().split('T')[0],
        periodId: r.periodId.toString(),
        enteredAt: r.enteredAt?.toISOString() ?? null,
        exitedAt: r.exitedAt?.toISOString() ?? null,
      }));
    }

    return success({
      user: await serializeUser(user),
      attendance,
      presence,
    });
  },
);
