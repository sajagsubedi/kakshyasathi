import { withHandler } from '@/lib/api-handler';
import { requireTeacher } from '@/lib/permissions';
import { success } from '@/lib/response';
import { getTeacherPresence } from '@/services/attendance.service';

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  const presence = await getTeacherPresence(session.user._id);
  return success(presence);
});
