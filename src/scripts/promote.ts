import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI?.replace('mongo', '127.0.0.1') || 'mongodb://admin:password@127.0.0.1:27017/taskforge?authSource=admin';

async function promote() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx ts-node src/scripts/promote.ts <email>');
    process.exit(1);
  }

  console.log(`\n⬆️  Promoting ${email} to Admin...\n`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to Database');

    const Role = mongoose.connection.db?.collection('roles');
    const User = mongoose.connection.db?.collection('users');

    const adminRole = await Role?.findOne({ name: 'admin' });
    if (!adminRole) {
      console.error('❌ Admin role not found. Please run the migration script first.');
      process.exit(1);
    }

    const result = await User?.updateOne(
      { email: email.toLowerCase() },
      { $set: { roleId: adminRole._id } }
    );

    if (result?.matchedCount === 0) {
      console.error(`❌ User not found: ${email}`);
    } else {
      console.log(`✅ ${email} has been promoted to Admin successfully!`);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

promote();
