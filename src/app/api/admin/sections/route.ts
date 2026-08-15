import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import SectionModel from '@/models/section.model';

export const GET = withHandler(async () => {
  await requireAdmin();
  await connectDb();
  const sections = await SectionModel.find().populate('classId');
  return success(
    sections.map((s) => ({
      id: s._id.toString(),
      classId: (s.classId as { _id?: { toString(): string } })?._id?.toString?.() ??
        s.classId.toString(),
      name: s.name,
      academicYear: s.academicYear,
    })),
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();
  const body = await req.json();
  const section = await SectionModel.create(body);
  return success(
    {
      id: section._id.toString(),
      classId: section.classId.toString(),
      name: section.name,
      academicYear: section.academicYear,
    },
    201,
  );
});
