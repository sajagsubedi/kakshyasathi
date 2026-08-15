import { withHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/permissions';
import { success } from '@/lib/response';
import { getLookupMaps } from '@/services/admin.service';

export const GET = withHandler(async () => {
  await requireAuth();
  const lookup = await getLookupMaps();
  return success(lookup);
});
