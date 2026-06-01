import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return bcrypt.compare(enteredPassword, this.password);
  }
  return enteredPassword === this.password;
};

export default mongoose.model('User', userSchema);
