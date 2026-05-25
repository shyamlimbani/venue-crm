import User from '../models/User.js';

const DEFAULT_ADMIN = {
  name: 'Admin User',
  email: 'admin@venuecrm.com',
  password: 'admin123',
  role: 'admin',
};

const DEFAULT_STAFF = {
  name: 'Staff User',
  email: 'staff@venuecrm.com',
  password: 'staff123',
  role: 'staff',
};

export const ensureDefaultUsers = async () => {
  for (const u of [DEFAULT_ADMIN, DEFAULT_STAFF]) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`   Seeded ${u.role}: ${u.email}`);
    }
  }
};
