import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/permissions';
import { success } from '@/lib/response';
import { getAllNotices, createNotice } from '@/services/notice.service';

export const GET = withHandler(async () => {
  await requireAdmin();
  const notices = await getAllNotices();
  return success(notices);
});

export const POST = withHandler(async (req: NextRequest) => {
  const session = await requireAdmin();
  const body = await req.json();

  const notice = await createNotice({
    ...body,
    createdBy: session.user._id,
  });

  return success(notice, 201);
});
