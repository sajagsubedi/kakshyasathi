import { NextRequest } from 'next/server';

import { withHandler } from '@/lib/api-handler';
import { requireSmartBoard } from '@/lib/permissions';
import { success } from '@/lib/response';
import { recordStudentScan, recordTeacherScan } from '@/services/attendance.service';

export const POST = withHandler(async (req: NextRequest) => {
  const session = await requireSmartBoard();
  const sectionId = session.user.sectionId;
  if (!sectionId) throw new Error('Smart board section not configured');

  const body = await req.json();
  const { barcode, role } = body;

  if (role === 'TEACHER') {
    const result = await recordTeacherScan(barcode, sectionId);
    return success(result);
  }

  const result = await recordStudentScan(barcode, sectionId);
  return success(result);
});
