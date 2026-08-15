import { withHandler } from '@/lib/api-handler';
import { requireSmartBoard } from '@/lib/permissions';
import { success } from '@/lib/response';
import { getSectionAttendance } from '@/services/attendance.service';

export const GET = withHandler(async () => {
  const session = await requireSmartBoard();
  const sectionId = session.user.sectionId;
  if (!sectionId) throw new Error('Smart board section not configured');

  const attendance = await getSectionAttendance(sectionId);
  return success(attendance);
});
