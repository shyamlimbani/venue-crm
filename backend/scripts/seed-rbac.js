import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/venue-crm';

const ALL_MODULES = ['cricket', 'shooting', 'marriage', 'banquet'];
const ALL_PERMISSIONS = ['manage_bookings', 'manage_payments', 'view_reports', 'manage_customers'];

const users = [
  // 1 Super Admin
  {
    name: 'Super Admin',
    email: 'admin@venuecrm.com',
    password: 'password123',
    role: 'admin',
    mobile: '9999999999',
    permissions: ALL_PERMISSIONS,
    assignedModules: ALL_MODULES,
  },
  // 4 Owners
  {
    name: 'Jay Bhai',
    email: 'owner1@venuecrm.com',
    password: 'password123',
    role: 'owner',
    mobile: '8888888881',
    phone: '8888888881',
    permissions: ALL_PERMISSIONS,
    assignedModules: ALL_MODULES,
    ownershipPercentage: 40,
    address: '123 Business Avenue, Block A',
    bio: 'Founder and Lead Partner. Managing overall corporate strategy.',
    joinDate: new Date('2024-01-15'),
  },
  {
    name: 'Aayam Bhai',
    email: 'owner2@venuecrm.com',
    password: 'password123',
    role: 'owner',
    mobile: '8888888882',
    phone: '8888888882',
    permissions: ALL_PERMISSIONS,
    assignedModules: ALL_MODULES,
    ownershipPercentage: 25,
    address: '456 Creative Lane, Studio District',
    bio: 'Creative Director and Co-Owner. Overseeing Studio and Media bookings.',
    joinDate: new Date('2024-03-20'),
  },
  {
    name: 'Owner Three',
    email: 'owner3@venuecrm.com',
    password: 'password123',
    role: 'owner',
    mobile: '8888888883',
    phone: '8888888883',
    permissions: ALL_PERMISSIONS,
    assignedModules: ALL_MODULES,
    ownershipPercentage: 20,
    address: '789 Grand Plaza, Banquet Area',
    bio: 'Partner overseeing banquet operations and events.',
    joinDate: new Date('2024-05-10'),
  },
  {
    name: 'Owner Four',
    email: 'owner4@venuecrm.com',
    password: 'password123',
    role: 'owner',
    mobile: '8888888884',
    phone: '8888888884',
    permissions: ALL_PERMISSIONS,
    assignedModules: ALL_MODULES,
    ownershipPercentage: 15,
    address: '101 Sports Complex, Ground Floor',
    bio: 'Partner supporting sports venue development.',
    joinDate: new Date('2024-07-01'),
  },
  // 5 Staff Managers
  {
    name: 'Cricket Manager',
    email: 'cricket@venuecrm.com',
    password: 'password123',
    role: 'staff',
    mobile: '7777777771',
    permissions: ['manage_bookings'],
    assignedModules: ['cricket'],
  },
  {
    name: 'Studio Manager',
    email: 'studio@venuecrm.com',
    password: 'password123',
    role: 'staff',
    mobile: '7777777772',
    permissions: ['manage_bookings'],
    assignedModules: ['shooting'],
  },
  {
    name: 'Banquet Manager',
    email: 'banquet@venuecrm.com',
    password: 'password123',
    role: 'staff',
    mobile: '7777777773',
    permissions: ['manage_bookings'],
    assignedModules: ['banquet', 'marriage'],
  },
  {
    name: 'Booking Manager',
    email: 'bookings@venuecrm.com',
    password: 'password123',
    role: 'staff',
    mobile: '7777777774',
    permissions: ['manage_bookings'],
    assignedModules: ALL_MODULES,
  },
  {
    name: 'Payments Manager',
    email: 'payments@venuecrm.com',
    password: 'password123',
    role: 'staff',
    mobile: '7777777775',
    permissions: ['manage_payments'],
    assignedModules: ALL_MODULES,
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    for (const u of users) {
      await User.create(u);
    }
    
    console.log('RBAC Seeding completed successfully!');
    console.log('------------------------------------------------');
    console.log(`Created: 1 Admin, 4 Owners, 5 Staff`);
    console.log('Default Password for all: password123');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
}

seed();
