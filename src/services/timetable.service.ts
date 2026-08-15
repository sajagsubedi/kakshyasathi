import connectDb from '@/lib/connectDB';
import ClassModel from '@/models/class.model';
import SectionModel from '@/models/section.model';
import SubjectModel from '@/models/subject.model';
import PeriodModel from '@/models/period.model';
import TimetableModel from '@/models/timetable.model';
import SubstitutionModel from '@/models/substitution.model';
import PeriodOverrideModel from '@/models/periodOverride.model';
import UserModel from '@/models/user.model';
import { formatDate } from '@/lib/serialize';
import type { EffectivePeriod } from '@/types';

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h! * 60 + m!;
}

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getSectionDisplayName(sectionId: string): Promise<string> {
  await connectDb();
  const section = await SectionModel.findById(sectionId).populate('classId');
  if (!section) return 'Unknown';
  const cls = section.classId as { name?: string } | null;
  return cls?.name ? `${cls.name} - ${section.name}` : `Section ${section.name}`;
}

export async function resolveEffectivePeriods(
  sectionId: string,
  date = new Date(),
): Promise<EffectivePeriod[]> {
  await connectDb();

  const dayOfWeek = date.getDay();
  const dateOnly = startOfDay(date);

  const [periods, entries, substitutions, overrides] = await Promise.all([
    PeriodModel.find().sort({ periodNumber: 1 }),
    TimetableModel.find({ sectionId, dayOfWeek })
      .populate('subjectId')
      .populate('teacherId'),
    SubstitutionModel.find({ sectionId, date: dateOnly }),
    PeriodOverrideModel.find({ sectionId, date: dateOnly }),
  ]);

  const subMap = new Map(
    substitutions.map((s) => [s.periodId.toString(), s]),
  );
  const overrideMap = new Map(
    overrides.map((o) => [o.periodId.toString(), o]),
  );
  const entryMap = new Map(
    entries.map((e) => [e.periodId.toString(), e]),
  );

  const substituteIds = substitutions.map((s) => s.substituteTeacherId);
  const substituteTeachers = substituteIds.length
    ? await UserModel.find({ _id: { $in: substituteIds } })
    : [];
  const substituteNameMap = new Map(
    substituteTeachers.map((t) => [t._id.toString(), t.fullName]),
  );

  return periods.map((period) => {
    const entry = entryMap.get(period._id.toString());
    const sub = subMap.get(period._id.toString());
    const override = overrideMap.get(period._id.toString());

    const subject = entry?.subjectId as { _id?: { toString(): string }; name?: string } | null;
    const teacher = entry?.teacherId as { _id?: { toString(): string }; fullName?: string } | null;

    let teacherId = teacher?._id?.toString() ?? '';
    let teacherName = teacher?.fullName ?? 'Unassigned';
    let isSubstitute = false;

    if (sub) {
      teacherId = sub.substituteTeacherId.toString();
      teacherName = substituteNameMap.get(teacherId) ?? 'Substitute';
      isSubstitute = true;
    }

    return {
      periodId: period._id.toString(),
      periodNumber: period.periodNumber,
      subjectId: subject?._id?.toString() ?? '',
      subjectName: subject?.name ?? 'Free',
      teacherId,
      teacherName,
      isSubstitute,
      startTime: override?.startTime ?? period.startTime,
      endTime: override?.endTime ?? period.endTime,
    };
  });
}

export async function getCurrentAndNextPeriod(
  sectionId: string,
  date = new Date(),
): Promise<{ current?: EffectivePeriod; next?: EffectivePeriod }> {
  const periods = await resolveEffectivePeriods(sectionId, date);
  const now = getNowMinutes();

  let current: EffectivePeriod | undefined;
  let next: EffectivePeriod | undefined;

  for (const period of periods) {
    const start = parseTime(period.startTime);
    const end = parseTime(period.endTime);
    if (now >= start && now < end) {
      current = period;
    } else if (now < start && !next) {
      next = period;
    }
  }

  return { current, next };
}

export async function serializeTimetableEntry(entry: {
  _id: { toString(): string };
  sectionId: { toString(): string };
  dayOfWeek: number;
  periodId: { toString(): string };
  subjectId: { toString(): string };
  teacherId: { toString(): string };
}) {
  return {
    id: entry._id.toString(),
    sectionId: entry.sectionId.toString(),
    dayOfWeek: entry.dayOfWeek,
    periodId: entry.periodId.toString(),
    subjectId: entry.subjectId.toString(),
    teacherId: entry.teacherId.toString(),
  };
}

export async function getTeacherTimetable(teacherId: string) {
  await connectDb();
  const entries = await TimetableModel.find({ teacherId }).sort({
    dayOfWeek: 1,
    periodId: 1,
  });
  return entries.map((e) => ({
    id: e._id.toString(),
    sectionId: e.sectionId.toString(),
    dayOfWeek: e.dayOfWeek,
    periodId: e.periodId.toString(),
    subjectId: e.subjectId.toString(),
    teacherId: e.teacherId.toString(),
  }));
}

export async function getSectionTimetable(sectionId: string) {
  await connectDb();
  const entries = await TimetableModel.find({ sectionId }).sort({
    dayOfWeek: 1,
    periodId: 1,
  });
  return entries.map((e) => ({
    id: e._id.toString(),
    sectionId: e.sectionId.toString(),
    dayOfWeek: e.dayOfWeek,
    periodId: e.periodId.toString(),
    subjectId: e.subjectId.toString(),
    teacherId: e.teacherId.toString(),
  }));
}

export { formatDate, ClassModel, SectionModel, SubjectModel, PeriodModel, TimetableModel };
