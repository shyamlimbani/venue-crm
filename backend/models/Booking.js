import mongoose from 'mongoose';
import { MODULES, PAYMENT_STATUS } from '../config/modules.js';

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    mobile: { type: String, required: true },
    module: {
      type: String,
      enum: Object.values(MODULES),
      required: true,
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    bookingType: { type: String, default: '' },
    shootCategory: { type: String, default: '' },
    guestCount: { type: Number, default: 0 },
    decorationNotes: { type: String, default: '' },
    eventNotes: { type: String, default: '' },
    totalAmount: { type: Number, required: true, min: 0 },
    advanceAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

bookingSchema.index({ module: 1, date: 1, timeSlot: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ customer: 1 });

export default mongoose.model('Booking', bookingSchema);
