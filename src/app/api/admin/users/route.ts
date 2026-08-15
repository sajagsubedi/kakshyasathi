import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import UserModel, { UserRole } from '@/models/user.model';
import { serializeUser } from '@/services/admin.service';
import { ConflictError } from '@/lib/errors';

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const role = req.nextUrl.searchParams.get('role');
  const normalizedRole = role && role !== 'ALL' ? (role as UserRole) : undefined;
  const filter = normalizedRole ? { userRole: normalizedRole } : {};

  const users = await UserModel.find(filter).sort({ createdAt: -1 });
  return success(await Promise.all(users.map(serializeUser)));
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const existing = await UserModel.findOne({
    username: body.username?.trim().toLowerCase(),
  });

  if (existing) {
    throw new ConflictError('Username already exists');
  }

  const user = await UserModel.create({
    fullName: body.fullName,
    username: body.username.trim().toLowerCase(),
    password: body.password,
    userRole: body.userRole ?? UserRole.STUDENT,
    phone: body.phone,
    rollNumber: body.rollNumber,
    classId: body.classId || undefined,
    sectionId: body.sectionId || undefined,
  });

  return success(await serializeUser(user), 201);
});
