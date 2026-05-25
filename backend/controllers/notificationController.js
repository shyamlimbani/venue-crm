import Notification from '../models/Notification.js';
import Booking from '../models/Booking.js';
import { MODULE_LABELS } from '../config/modules.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateReminders = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const upcoming = await Booking.find({
      date: { $gte: tomorrow, $lte: tomorrowEnd },
      status: 'active',
    });

    for (const booking of upcoming) {
      const exists = await Notification.findOne({
        booking: booking._id,
        type: 'booking',
        title: 'Upcoming Booking Reminder',
      });
      if (!exists) {
        await Notification.create({
          title: 'Upcoming Booking Reminder',
          message: `${booking.customerName} - ${MODULE_LABELS[booking.module]} tomorrow`,
          type: 'booking',
          module: booking.module,
          booking: booking._id,
          priority: 'high',
        });
      }
    }

    const pending = await Booking.find({
      status: 'active',
      remainingAmount: { $gt: 0 },
      paymentStatus: { $ne: 'Paid' },
    }).limit(20);

    for (const booking of pending) {
      const exists = await Notification.findOne({
        booking: booking._id,
        type: 'payment',
        title: 'Pending Payment Alert',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });
      if (!exists) {
        await Notification.create({
          title: 'Pending Payment Alert',
          message: `₹${booking.remainingAmount} pending from ${booking.customerName}`,
          type: 'payment',
          module: booking.module,
          booking: booking._id,
          priority: 'high',
        });
      }
    }

    res.json({ success: true, message: 'Reminders generated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
