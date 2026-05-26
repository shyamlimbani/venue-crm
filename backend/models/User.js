import mongoose from 'mongoose';


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'owner', 'staff'], default: 'staff' },
    permissions: [{ type: String }],
    assignedModules: [{ type: String }],
    profileImage: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    ownershipPercentage: { type: Number, default: 0, min: 0, max: 100 },
    bio: { type: String, default: '' },
    joinDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);



export default mongoose.model('User', userSchema);
