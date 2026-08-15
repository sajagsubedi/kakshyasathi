import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import SmartBoardModel from '@/models/smartboard.model';
import { serializeSmartBoard } from '@/services/smartboard.service';
import { ConflictError } from '@/lib/errors';

export const GET = withHandler(async () => {
  await requireAdmin();
  await connectDb();
  const boards = await SmartBoardModel.find();
  return success(await Promise.all(boards.map(serializeSmartBoard)));
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();
  const body = await req.json();

  const existing = await SmartBoardModel.findOne({
    deviceId: body.deviceId?.trim().toUpperCase(),
  });
  if (existing) throw new ConflictError('Device ID already exists');

  const board = await SmartBoardModel.create({
    deviceId: body.deviceId.trim().toUpperCase(),
    name: body.name,
    sectionId: body.sectionId,
    password: body.password,
    status: 'OFFLINE',
  });

  return success(await serializeSmartBoard(board), 201);
});
