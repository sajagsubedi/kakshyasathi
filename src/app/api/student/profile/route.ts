import { withHandler } from '@/lib/api-handler';
import { requireStudent } from '@/lib/permissions';
import { success } from '@/lib/response';
import connectDb from '@/lib/connectDB';
import UserModel from '@/models/user.model';
import { serializeUser } from '@/services/admin.service';

export const GET = withHandler(async () => {
  const session = await requireStudent();
  await connectDb();
  const user = await UserModel.findById(session.user._id);
  return success(await serializeUser(user!));
});
