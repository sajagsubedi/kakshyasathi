import { withHandler } from '@/lib/api-handler';
import { requireStudent } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import UserModel from '@/models/user.model';
import { getNoticesForStudent } from '@/services/notice.service';
import { NotFoundError } from '@/lib/errors';

export const GET = withHandler(async () => {
  const session = await requireStudent();
  await connectDb();

  const student = await UserModel.findById(session.user._id);
  if (!student?.sectionId) throw new NotFoundError('Student section not assigned');

  const notices = await getNoticesForStudent(student.sectionId.toString());
  return success(notices);
});
