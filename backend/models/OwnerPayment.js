import mongoose from 'mongoose';

const ownerPaymentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true, default: Date.now },
    method: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'], required: true },
    notes: { type: String, default: '' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('OwnerPayment', ownerPaymentSchema);
