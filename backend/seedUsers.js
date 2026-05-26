import mongoose from 'mongoose';


// MongoDB Connection URI
const MONGO_URI = 'mongodb+srv://shyam:shyam1234@cluster0.7ptqrf7.mongodb.net/venue_crm?retryWrites=true&w=majority&authSource=admin';

// User Schema Definition
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    assignedModules: [{ type: String }],
  },
  { timestamps: true }
);

// Removed hash password before saving

const User = mongoose.model('User', userSchema);

const seedUsers = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    // 2. Delete old users
    console.log('Deleting old users...');
    await User.deleteMany({});

    // 3. Define the users to insert
    const usersToCreate = [
      {
        name: 'Owner One',
        email: 'owner1@venuecrm.com',
        password: 'owner123',
        role: 'owner',
        assignedModules: ['all'],
      },
      {
        name: 'Owner Two',
        email: 'owner2@venuecrm.com',
        password: 'owner123',
        role: 'owner',
        assignedModules: ['all'],
      },
      {
        name: 'Owner Three',
        email: 'owner3@venuecrm.com',
        password: 'owner123',
        role: 'owner',
        assignedModules: ['all'],
      },
      {
        name: 'Owner Four',
        email: 'owner4@venuecrm.com',
        password: 'owner123',
        role: 'owner',
        assignedModules: ['all'],
      },
      {
        name: 'Studio Staff',
        email: 'studio@venuecrm.com',
        password: 'studio123',
        role: 'staff',
        assignedModules: ['shooting-studio'],
      },
    ];

    console.log('Inserting new users...');
    
    // We use a loop with User.create instead of insertMany 
    // to ensure the pre('save') hook runs and hashes the passwords
    for (const userData of usersToCreate) {
      await User.create(userData);
    }

    // 4. Show success message
    console.log('Users Seeded Successfully ✅');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();
