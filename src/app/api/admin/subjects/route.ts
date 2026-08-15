import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import SubjectModel from '@/models/subject.model';
import { ConflictError } from '@/lib/errors';

export const GET = withHandler(async () => {
  await requireAdmin();
  await connectDb();
  const subjects = await SubjectModel.find().sort({ name: 1 });
  return success(
    subjects.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      code: s.code,
    })),
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();
  const body = await req.json();
  const existing = await SubjectModel.findOne({ code: body.code?.toUpperCase() });
  if (existing) throw new ConflictError('Subject code already exists');

  const subject = await SubjectModel.create({
    name: body.name,
    code: body.code.toUpperCase(),
  });

  return success(
    { id: subject._id.toString(), name: subject.name, code: subject.code },
    201,
  );
});
