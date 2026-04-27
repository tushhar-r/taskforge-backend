import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://admin:password@127.0.0.1:27017/taskforge?authSource=admin';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const Role = mongoose.connection.db?.collection('roles');
    const User = mongoose.connection.db?.collection('users');

    const adminRole = await Role?.findOne({ name: 'admin' });
    if (!adminRole) {
      console.error('Admin role not found');
      process.exit(1);
    }

    const res = await User?.updateOne(
      { email: 'tushar2643@gmail.com' },
      { $set: { roleId: adminRole._id } }
    );

    console.log('Update result:', res);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
