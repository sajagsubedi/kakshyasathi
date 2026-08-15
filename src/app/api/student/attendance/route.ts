import { withHandler } from '@/lib/api-handler';
import { requireStudent } from '@/lib/permissions';
import { success } from '@/lib/response';
import { getStudentAttendance } from '@/services/attendance.service';

export const GET = withHandler(async () => {
  const session = await requireStudent();
  const attendance = await getStudentAttendance(session.user._id);
  return success(attendance);
});
