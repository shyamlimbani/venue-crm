import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    notes: { type: String, default: '' },
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customerSchema.index({ mobile: 1 });

export default mongoose.model('Customer', customerSchema);
