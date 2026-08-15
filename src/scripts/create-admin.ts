import connectDb from '@/lib/connectDB';
import UserModel, { UserRole } from '@/models/user.model';

async function createAdmin() {
  await connectDb();

  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@12345';
  const fullName = process.env.ADMIN_FULLNAME ?? 'System Admin';

  const existing = await UserModel.findOne({ username: username.toLowerCase() });
  if (existing) {
    console.log(`Admin user "${username}" already exists.`);
    process.exit(0);
  }

  await UserModel.create({
    username: username.toLowerCase(),
    password,
    fullName,
    userRole: UserRole.ADMIN,
  });

  console.log(`Admin user "${username}" created successfully.`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
