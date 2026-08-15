import connectDb from '@/lib/connectDB';
import UserModel from '@/models/user.model';

async function fixIndexes() {
  try {
    await connectDb();

    // Drop the unique index on email if it exists
    try {
      await UserModel.collection.dropIndex('email_1');
      console.log('Dropped email_1 unique index');
    } catch (err: any) {
      if (err.code === 27) {
        console.log('Index email_1 does not exist');
      } else {
        console.error('Error dropping index:', err.message);
      }
    }

    console.log('Database indexes fixed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();
