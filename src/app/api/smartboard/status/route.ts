import { withHandler } from '@/lib/api-handler';
import { requireSmartBoard } from '@/lib/permissions';
import { success } from '@/lib/response';
import { updateSmartBoardHeartbeat } from '@/services/smartboard.service';

export const POST = withHandler(async () => {
  const session = await requireSmartBoard();
  if (session.user.deviceId) {
    await updateSmartBoardHeartbeat(session.user.deviceId);
  }
  return success({ ok: true });
});
