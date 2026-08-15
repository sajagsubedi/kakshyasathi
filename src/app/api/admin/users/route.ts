import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import UserModel, { UserRole } from '@/models/user.model';
import SectionModel from '@/models/section.model';
import { serializeUser } from '@/services/admin.service';
import { ConflictError, ValidationError } from '@/lib/errors';
import { Types } from 'mongoose';

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const role = req.nextUrl.searchParams.get('role');
  const normalizedRole = role && role !== 'ALL' ? (role as UserRole) : undefined;
  const filter = normalizedRole ? { userRole: normalizedRole } : {};

  const users = await UserModel.find(filter).populate('sectionId classId').sort({ createdAt: -1 });
  return success(await Promise.all(users.map(serializeUser)));
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();

  if (!body.fullName || !body.fullName.trim()) {
    throw new ValidationError('Full name is required');
  }
  if (body.fullName.trim().length < 2) {
    throw new ValidationError('Full name must be at least 2 characters');
  }
  if (!body.username || !body.username.trim()) {
    throw new ValidationError('Username is required');
  }
  if (body.username.trim().length < 3) {
    throw new ValidationError('Username must be at least 3 characters');
  }
  if (!body.password || body.password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }
  if (!body.userRole || !Object.values(UserRole).includes(body.userRole)) {
    throw new ValidationError('Valid user role is required');
  }

  const username = body.username.trim().toLowerCase();
  const existing = await UserModel.findOne({ username });

  if (existing) {
    throw new ConflictError('Username already exists');
  }

  let classId = body.classId || undefined;
  const sectionId = body.sectionId || undefined;

  if (sectionId && !classId) {
    const section = await SectionModel.findById(sectionId);
    if (section) {
      classId = section.classId?.toString();
    }
  }

  if (body.userRole === UserRole.STUDENT && !sectionId) {
    throw new ValidationError('Student must be assigned to a section');
  }

  const objClassId = classId ? new Types.ObjectId(classId) : undefined;
  const objSectionId = sectionId ? new Types.ObjectId(sectionId) : undefined;

  const createData: Record<string, any> = {
    fullName: body.fullName.trim(),
    username,
    password: body.password,
    userRole: body.userRole,
    classId: objClassId,
    sectionId: objSectionId,
  };

  // Only include optional fields if they are provided
  if (body.phone) createData.phone = body.phone;
  if (body.rollNumber) createData.rollNumber = body.rollNumber;
  if (body.email) createData.email = body.email;
  if (body.dateOfBirth) createData.dateOfBirth = body.dateOfBirth;
  if (body.gender) createData.gender = body.gender;
  if (body.address) createData.address = body.address;
  if (body.guardianName) createData.guardianName = body.guardianName;
  if (body.guardianPhone) createData.guardianPhone = body.guardianPhone;
  if (body.emergencyContact) createData.emergencyContact = body.emergencyContact;
  if (body.admissionDate) createData.admissionDate = body.admissionDate;

  const user = await UserModel.create(createData);

  await user.populate('sectionId classId');
  return success(await serializeUser(user), 201);
});
