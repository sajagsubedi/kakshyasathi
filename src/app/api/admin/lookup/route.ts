import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import { getLookupMaps } from '@/services/admin.service';

export const GET = withHandler(async () => {
  await requireAdmin();
  const lookup = await getLookupMaps();
  return success(lookup);
});
