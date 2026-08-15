import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import ClassModel from '@/models/class.model';

export const GET = withHandler(async () => {
  await requireAdmin();
  await connectDb();
  const classes = await ClassModel.find().sort({ grade: 1 });
  return success(
    classes.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      grade: c.grade,
      academicYear: c.academicYear,
    })),
  );
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();
  const body = await req.json();
  const cls = await ClassModel.create(body);
  return success(
    {
      id: cls._id.toString(),
      name: cls.name,
      grade: cls.grade,
      academicYear: cls.academicYear,
    },
    201,
  );
});
