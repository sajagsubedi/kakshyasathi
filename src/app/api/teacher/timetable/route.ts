import { withHandler } from '@/lib/api-handler';
import { requireTeacher } from '@/lib/permissions';
import { success } from '@/lib/response';
import { getTeacherTimetable } from '@/services/timetable.service';

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  const timetable = await getTeacherTimetable(session.user._id);
  return success(timetable);
});
