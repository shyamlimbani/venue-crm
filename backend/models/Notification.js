import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking', 'payment', 'event', 'system'],
      default: 'system',
    },
    module: { type: String, default: '' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    isRead: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
