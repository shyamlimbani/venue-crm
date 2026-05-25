import '../config/env.js';
import { validateEnv } from '../config/env.js';
import User from '../models/User.js';
import connectDB, { disconnectDB } from '../config/db.js';

const seedUsers = async () => {
  if (!validateEnv()) {
    process.exit(1);
  }

  try {
    await connectDB();

    const users = [
      { name: 'Admin User', email: 'admin@venuecrm.com', password: 'admin123', role: 'admin' },
      { name: 'Staff User', email: 'staff@venuecrm.com', password: 'staff123', role: 'staff' },
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`Created ${u.role}: ${u.email}`);
      } else {
        console.log(`Exists: ${u.email}`);
      }
    }

    console.log('\nDefault credentials:');
    console.log('Admin: admin@venuecrm.com / admin123');
    console.log('Staff: staff@venuecrm.com / staff123');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedUsers();
