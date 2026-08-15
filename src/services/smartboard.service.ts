import connectDb from '@/lib/connectDB';
import SmartBoardModel from '@/models/smartboard.model';
import { getCurrentAndNextPeriod, getSectionDisplayName } from '@/services/timetable.service';
import { getAttendanceSummary } from '@/services/attendance.service';
import { formatDate } from '@/lib/serialize';

export async function authenticateSmartBoard(deviceId: string, password: string) {
  await connectDb();

  const board = await SmartBoardModel.findOne({
    deviceId: deviceId.trim().toUpperCase(),
  });

  if (!board || !(await board.isPasswordCorrect(password))) {
    return null;
  }

  board.status = 'ONLINE';
  board.lastSeenAt = new Date();
  await board.save();

  return {
    id: board._id.toString(),
    deviceId: board.deviceId,
    name: board.name,
    sectionId: board.sectionId.toString(),
  };
}

export async function getClassroomStatus(sectionId: string) {
  await connectDb();

  const [sectionName, { current, next }, attendanceSummary] = await Promise.all([
    getSectionDisplayName(sectionId),
    getCurrentAndNextPeriod(sectionId),
    getAttendanceSummary(sectionId),
  ]);

  return {
    sectionId,
    sectionName,
    date: formatDate(new Date()),
    currentPeriod: current,
    nextPeriod: next,
    attendanceSummary,
  };
}

export async function serializeSmartBoard(board: {
  _id: { toString(): string };
  deviceId: string;
  name: string;
  sectionId: { toString(): string };
  status: string;
  lastSeenAt?: Date;
}) {
  return {
    id: board._id.toString(),
    deviceId: board.deviceId,
    name: board.name,
    sectionId: board.sectionId.toString(),
    status: board.status as 'ONLINE' | 'OFFLINE',
    lastSeenAt: board.lastSeenAt?.toISOString(),
  };
}

export async function listSmartBoards() {
  await connectDb();
  const boards = await SmartBoardModel.find();
  return Promise.all(boards.map(serializeSmartBoard));
}

export async function updateSmartBoardHeartbeat(deviceId: string) {
  await connectDb();
  await SmartBoardModel.findOneAndUpdate(
    { deviceId: deviceId.toUpperCase() },
    { status: 'ONLINE', lastSeenAt: new Date() },
  );
}
