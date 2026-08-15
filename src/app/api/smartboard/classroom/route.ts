import { withHandler } from '@/lib/api-handler';
import { requireSmartBoard } from '@/lib/permissions';
import { success } from '@/lib/response';
import { getClassroomStatus } from '@/services/smartboard.service';

export const GET = withHandler(async () => {
  const session = await requireSmartBoard();
  const sectionId = session.user.sectionId;
  if (!sectionId) throw new Error('Smart board section not configured');

  const status = await getClassroomStatus(sectionId);
  return success(status);
});
