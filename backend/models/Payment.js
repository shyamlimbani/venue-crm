import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['advance', 'partial', 'full'], default: 'partial' },
    method: { type: String, default: 'cash' },
    notes: { type: String, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
