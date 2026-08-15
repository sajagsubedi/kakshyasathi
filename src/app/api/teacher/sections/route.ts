import { withHandler } from '@/lib/api-handler';
import { requireTeacher } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import TimetableModel from '@/models/timetable.model';
import SectionModel from '@/models/section.model';

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  await connectDb();

  const entries = await TimetableModel.find({
    teacherId: session.user._id,
  }).distinct('sectionId');

  const sections = await SectionModel.find({
    _id: { $in: entries },
  }).populate('classId');

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
