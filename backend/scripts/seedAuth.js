import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const MONGO_URI = 'mongodb+srv://shyam:shyam1234@cluster0.7ptqrf7.mongodb.net/venue_crm?retryWrites=true&w=majority&authSource=admin';

const seedUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    console.log('Deleting old users...');
    await User.deleteMany({});

    const usersToCreate = [
      {
        name: 'Super Admin',
        email: 'admin@venuecrm.com',
        password: 'admin123',
        role: 'admin',
        assignedModules: ['all'],
      },
      {
        name: 'CRM Owner',
        email: 'owner@venuecrm.com',
        password: 'owner123',
        role: 'owner',
        assignedModules: ['all'],
      },
      {
        name: 'Studio Staff',
        email: 'studio@venuecrm.com',
        password: 'staff123',
        role: 'staff',
        assignedModules: ['shooting-studio'],
      },
    ];

    console.log('Inserting new users...');
    
    for (const userData of usersToCreate) {
      await User.create(userData);
    }

    console.log('Users Seeded Successfully ✅');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
