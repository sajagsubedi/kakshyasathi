import { withHandler } from '@/lib/api-handler';
import { requireTeacher } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import TimetableModel from '@/models/timetable.model';
import { getNoticesForTeacher } from '@/services/notice.service';

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  await connectDb();

  const sectionIds = await TimetableModel.find({
    teacherId: session.user._id,
  }).distinct('sectionId');

  const notices = await getNoticesForTeacher(
    session.user._id,
    sectionIds.map((id) => id.toString()),
  );

  return success(notices);
});
