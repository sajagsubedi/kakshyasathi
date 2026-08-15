import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import { getAdminDashboardStats } from '@/services/admin.service';

export const GET = withHandler(async () => {
  await requireAdmin();
  const stats = await getAdminDashboardStats();
  return success(stats);
});
