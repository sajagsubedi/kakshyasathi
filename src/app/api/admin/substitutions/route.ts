import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import SubstitutionModel from '@/models/substitution.model';
import { formatDate } from '@/lib/serialize';
import { ConflictError } from '@/lib/errors';

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const dateParam = req.nextUrl.searchParams.get('date');
  const filter: Record<string, unknown> = {};

  if (dateParam) {
    const date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);
    filter.date = date;
  }

  const subs = await SubstitutionModel.find(filter).sort({ date: -1 });
  return success(
    subs.map((s) => ({
      id: s._id.toString(),
      sectionId: s.sectionId.toString(),
      date: formatDate(s.date),
      periodId: s.periodId.toString(),
      regularTeacherId: s.regularTeacherId.toString(),
      substituteTeacherId: s.substituteTeacherId.toString(),
    })),
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();
  const body = await req.json();

  const date = new Date(body.date);
  date.setHours(0, 0, 0, 0);

  try {
    const sub = await SubstitutionModel.create({
      sectionId: body.sectionId,
      date,
      periodId: body.periodId,
      regularTeacherId: body.regularTeacherId,
      substituteTeacherId: body.substituteTeacherId,
    });

    return success(
      {
        id: sub._id.toString(),
        sectionId: sub.sectionId.toString(),
        date: formatDate(sub.date),
        periodId: sub.periodId.toString(),
        regularTeacherId: sub.regularTeacherId.toString(),
        substituteTeacherId: sub.substituteTeacherId.toString(),
      },
      201,
    );
  } catch {
    throw new ConflictError('Substitution already exists for this slot');
  }
});
