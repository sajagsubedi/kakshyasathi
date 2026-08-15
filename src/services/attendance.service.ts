import connectDb from '@/lib/connectDB';
import StudentAttendanceModel from '@/models/studentAttendance.model';
import TeacherPresenceModel from '@/models/teacherPresence.model';
import UserModel, { UserRole } from '@/models/user.model';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors';
import { formatDate } from '@/lib/serialize';
import { getCurrentAndNextPeriod } from '@/services/timetable.service';

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function recordStudentScan(username: string, sectionId: string) {
  await connectDb();

  const student = await UserModel.findOne({
    username: username.trim().toLowerCase(),
    userRole: UserRole.STUDENT,
  });

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  if (student.sectionId?.toString() !== sectionId) {
    throw new ValidationError('Student does not belong to this section');
  }

  const today = startOfDay();
  const existing = await StudentAttendanceModel.findOne({
    studentId: student._id,
    date: today,
  });

  if (existing) {
    throw new ConflictError('Attendance already recorded for today');
  }

  const record = await StudentAttendanceModel.create({
    studentId: student._id,
    sectionId: student.sectionId,
    date: today,
    status: 'PRESENT',
    scannedAt: new Date(),
  });

  return {
    id: record._id.toString(),
    studentId: student._id.toString(),
    sectionId: sectionId,
    date: formatDate(today),
    status: record.status,
    scannedAt: record.scannedAt?.toISOString() ?? '',
  };
}

export async function recordTeacherScan(username: string, sectionId: string) {
  await connectDb();

  const teacher = await UserModel.findOne({
    username: username.trim().toLowerCase(),
    userRole: UserRole.TEACHER,
  });

  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  const today = startOfDay();
  const { current } = await getCurrentAndNextPeriod(sectionId);

  if (!current) {
    throw new ValidationError('No active period');
  }

  const existing = await TeacherPresenceModel.findOne({
    teacherId: teacher._id,
    sectionId,
    date: today,
    periodId: current.periodId,
  });

  if (existing) {
    throw new ConflictError('Presence already recorded for this period');
  }

  const record = await TeacherPresenceModel.create({
    teacherId: teacher._id,
    sectionId,
    date: today,
    periodId: current.periodId,
    enteredAt: new Date(),
  });

  return {
    id: record._id.toString(),
    teacherId: teacher._id.toString(),
    sectionId,
    date: formatDate(today),
    periodId: current.periodId,
    enteredAt: record.enteredAt.toISOString(),
  };
}

export async function getSectionAttendance(sectionId: string, date = new Date()) {
  await connectDb();
  const today = startOfDay(date);

  const records = await StudentAttendanceModel.find({
    sectionId,
    date: today,
  }).populate('studentId');

  return records.map((r) => ({
    id: r._id.toString(),
    studentId: r.studentId._id?.toString?.() ?? r.studentId.toString(),
    sectionId: r.sectionId.toString(),
    date: formatDate(r.date),
    status: r.status,
    scannedAt: r.scannedAt?.toISOString() ?? '',
  }));
}

export async function getStudentAttendance(studentId: string) {
  await connectDb();
  const records = await StudentAttendanceModel.find({ studentId }).sort({
    date: -1,
  });

  return records.map((r) => ({
    id: r._id.toString(),
    studentId: r.studentId.toString(),
    sectionId: r.sectionId.toString(),
    date: formatDate(r.date),
    status: r.status,
    scannedAt: r.scannedAt?.toISOString() ?? '',
  }));
}

export async function getTeacherPresence(teacherId: string) {
  await connectDb();
  const records = await TeacherPresenceModel.find({ teacherId }).sort({
    date: -1,
    enteredAt: -1,
  });

  return records.map((r) => ({
    id: r._id.toString(),
    teacherId: r.teacherId.toString(),
    sectionId: r.sectionId.toString(),
    date: formatDate(r.date),
    periodId: r.periodId.toString(),
    enteredAt: r.enteredAt.toISOString(),
    exitedAt: r.exitedAt?.toISOString(),
  }));
}

export async function getAttendanceSummary(sectionId: string, date = new Date()) {
  await connectDb();
  const today = startOfDay(date);

  const [totalStudents, records] = await Promise.all([
    UserModel.countDocuments({ sectionId, userRole: UserRole.STUDENT }),
    StudentAttendanceModel.find({ sectionId, date: today }),
  ]);

  const present = records.filter((r) => r.status === 'PRESENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const absent = Math.max(0, totalStudents - present - late);

  return { present, absent, late, total: totalStudents };
}
