import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import StudentAttendanceModel from '@/models/studentAttendance.model';
import UserModel, { UserRole } from '@/models/user.model';
import { formatDate } from '@/lib/serialize';

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const sectionId = req.nextUrl.searchParams.get('sectionId');
  const dateParam = req.nextUrl.searchParams.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();
  date.setHours(0, 0, 0, 0);

  const filter: Record<string, unknown> = { date };
  if (sectionId) filter.sectionId = sectionId;

  const records = await StudentAttendanceModel.find(filter).sort({
    scannedAt: -1,
  });

  const sectionStudents = sectionId
    ? await UserModel.find({ sectionId, userRole: UserRole.STUDENT })
    : await UserModel.find({ userRole: UserRole.STUDENT });

  const recordedIds = new Set(records.map((r) => r.studentId.toString()));

  const absentRecords = sectionStudents
    .filter((s) => !recordedIds.has(s._id.toString()))
    .map((s) => ({
      id: `absent-${s._id.toString()}`,
      studentId: s._id.toString(),
      sectionId: s.sectionId?.toString() ?? '',
      date: formatDate(date),
      status: 'ABSENT' as const,
      scannedAt: '',
    }));

  const presentRecords = records.map((r) => ({
    id: r._id.toString(),
    studentId: r.studentId.toString(),
    sectionId: r.sectionId.toString(),
    date: formatDate(r.date),
    status: r.status,
    scannedAt: r.scannedAt?.toISOString() ?? '',
  }));

  return success([...presentRecords, ...absentRecords]);
});
