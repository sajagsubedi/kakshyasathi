import connectDb from '@/lib/connectDB';
import NoticeModel from '@/models/notice.model';
import { Types } from 'mongoose';

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function serializeNotice(notice: {
  _id: { toString(): string };
  title: string;
  content: string;
  createdBy: { toString(): string };
  targetType: string;
  targetSections: { map(fn: (id: { toString(): string }) => string): string[] };
  priority: string;
  status: string;
  createdAt: Date;
  expiresAt?: Date;
}) {
  return {
    id: notice._id.toString(),
    title: notice.title,
    content: notice.content,
    createdBy: notice.createdBy.toString(),
    targetType: notice.targetType as 'ALL' | 'SELECTED_SECTIONS',
    targetSections: notice.targetSections.map((id) => id.toString()),
    priority: notice.priority as 'LOW' | 'MEDIUM' | 'HIGH',
    status: notice.status as 'ACTIVE' | 'EXPIRED' | 'DRAFT',
    createdAt: notice.createdAt.toISOString(),
    expiresAt: notice.expiresAt?.toISOString(),
  };
}

export async function getNoticesForSection(sectionId?: string) {
  await connectDb();

  const notices = await NoticeModel.find({ status: 'ACTIVE' }).sort({
    createdAt: -1,
  });

  const filtered = notices.filter((n) => {
    if (n.targetType === 'ALL') return true;
    if (!sectionId) return false;
    return n.targetSections.some((id) => id.toString() === sectionId);
  });

  return filtered.map(serializeNotice);
}

export async function getAllNotices() {
  await connectDb();
  const notices = await NoticeModel.find().sort({ createdAt: -1 });
  return notices.map(serializeNotice);
}

export async function createNotice(data: {
  title: string;
  content: string;
  createdBy: string;
  targetType: 'ALL' | 'SELECTED_SECTIONS';
  targetSections?: string[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  expiresAt?: string;
}) {
  await connectDb();

  const notice = await NoticeModel.create({
    title: data.title,
    content: data.content,
    createdBy: data.createdBy,
    targetType: data.targetType,
    targetSections:
      data.targetType === 'SELECTED_SECTIONS'
        ? (data.targetSections ?? []).map((id) => new Types.ObjectId(id))
        : [],
    priority: data.priority ?? 'MEDIUM',
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    status: 'ACTIVE',
  });

  return serializeNotice(notice);
}

export async function getNoticesForTeacher(teacherId: string, sectionIds: string[]) {
  await connectDb();
  const notices = await NoticeModel.find({ status: 'ACTIVE' }).sort({
    createdAt: -1,
  });

  return notices
    .filter((n) => {
      if (n.targetType === 'ALL') return true;
      return n.targetSections.some((id) =>
        sectionIds.includes(id.toString()),
      );
    })
    .map(serializeNotice);
}

export async function getNoticesForStudent(sectionId: string) {
  return getNoticesForSection(sectionId);
}
