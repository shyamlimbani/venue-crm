import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import { MODULES, MODULE_LABELS } from '../config/modules.js';

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const monthRange = () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export const getDashboardStats = async (req, res) => {
  try {
    const { start: todayStart, end: todayEnd } = todayRange();
    const { start: monthStart, end: monthEnd } = monthRange();

    const todayBookings = await Booking.find({
      date: { $gte: todayStart, $lte: todayEnd },
      status: 'active',
    }).sort({ timeSlot: 1 });

    const monthBookings = await Booking.find({
      date: { $gte: monthStart, $lte: monthEnd },
      status: 'active',
    });

    const monthlyRevenue = monthBookings.reduce((sum, b) => sum + b.advanceAmount, 0);
    const pendingPayments = await Booking.aggregate([
      { $match: { status: 'active', remainingAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$remainingAmount' }, count: { $sum: 1 } } },
    ]);

    const upcomingEvents = await Booking.find({
      date: { $gt: todayEnd },
      status: 'active',
    })
      .sort({ date: 1 })
      .limit(10);

    const recentActivity = await Booking.find({ status: 'active' })
      .sort({ updatedAt: -1 })
      .limit(8);

    const moduleStats = await Promise.all(
      Object.values(MODULES).map(async (module) => {
        const total = await Booking.countDocuments({ module, status: 'active' });
        const today = await Booking.countDocuments({
          module,
          status: 'active',
          date: { $gte: todayStart, $lte: todayEnd },
        });
        const todayList = await Booking.find({
          module,
          status: 'active',
          date: { $gte: todayStart, $lte: todayEnd },
        }).select('timeSlot paymentStatus customerName');

        let todayStatus = 'No bookings today';
        if (today > 0) {
          const paid = todayList.filter((b) => b.paymentStatus === 'Paid').length;
          todayStatus = `${today} booking(s) · ${paid} paid`;
        }

        return {
          module,
          label: MODULE_LABELS[module],
          totalBookings: total,
          todayCount: today,
          todayStatus,
        };
      })
    );

    const notifications = await Notification.find({ isRead: false })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        todayBookings,
        todayCount: todayBookings.length,
        monthlyRevenue,
        pendingAmount: pendingPayments[0]?.total || 0,
        pendingCount: pendingPayments[0]?.count || 0,
        upcomingEvents,
        recentActivity,
        moduleStats,
        notifications,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
