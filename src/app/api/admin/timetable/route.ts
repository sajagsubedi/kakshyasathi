import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import PeriodModel from '@/models/period.model';
import TimetableModel from '@/models/timetable.model';
import { ConflictError } from '@/lib/errors';

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const sectionId = req.nextUrl.searchParams.get('sectionId');
  const type = req.nextUrl.searchParams.get('type');

  if (type === 'periods') {
    const periods = await PeriodModel.find().sort({ periodNumber: 1 });
    return success(
      periods.map((p) => ({
        id: p._id.toString(),
        periodNumber: p.periodNumber,
        startTime: p.startTime,
        endTime: p.endTime,
      })),
    );
  }

  const filter = sectionId ? { sectionId } : {};
  const entries = await TimetableModel.find(filter).sort({
    sectionId: 1,
    dayOfWeek: 1,
    periodId: 1,
  });

  return success(
    entries.map((e) => ({
      id: e._id.toString(),
      sectionId: e.sectionId.toString(),
      dayOfWeek: e.dayOfWeek,
      periodId: e.periodId.toString(),
      subjectId: e.subjectId.toString(),
      teacherId: e.teacherId.toString(),
    })),
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();
  const body = await req.json();

  if (body.type === 'period') {
    const period = await PeriodModel.create({
      periodNumber: body.periodNumber,
      startTime: body.startTime,
      endTime: body.endTime,
    });
    return success(
      {
        id: period._id.toString(),
        periodNumber: period.periodNumber,
        startTime: period.startTime,
        endTime: period.endTime,
      },
      201,
    );
  }

  try {
    const entry = await TimetableModel.create({
      sectionId: body.sectionId,
      dayOfWeek: body.dayOfWeek,
      periodId: body.periodId,
      subjectId: body.subjectId,
      teacherId: body.teacherId,
    });

    return success(
      {
        id: entry._id.toString(),
        sectionId: entry.sectionId.toString(),
        dayOfWeek: entry.dayOfWeek,
        periodId: entry.periodId.toString(),
        subjectId: entry.subjectId.toString(),
        teacherId: entry.teacherId.toString(),
      },
      201,
    );
  } catch {
    throw new ConflictError('Timetable entry already exists for this slot');
  }
});
