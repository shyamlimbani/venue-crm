import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import Expense from '../models/Expense.js';
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
      fromDate: { $lte: todayEnd },
      toDate: { $gte: todayStart },
      status: 'active',
    }).sort({ timeSlot: 1 });

    const monthBookings = await Booking.find({
      fromDate: { $lte: monthEnd },
      toDate: { $gte: monthStart },
      status: 'active',
    });

    const monthlyRevenue = monthBookings.reduce((sum, b) => sum + b.advanceAmount, 0);
    const pendingPayments = await Booking.aggregate([
      { $match: { status: 'active', remainingAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$remainingAmount' }, count: { $sum: 1 } } },
    ]);

    const upcomingEvents = await Booking.find({
      fromDate: { $gt: todayEnd },
      status: 'active',
    })
      .sort({ fromDate: 1 })
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
          fromDate: { $lte: todayEnd },
          toDate: { $gte: todayStart },
        });
        const todayList = await Booking.find({
          module,
          status: 'active',
          fromDate: { $lte: todayEnd },
          toDate: { $gte: todayStart },
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

    const todayExpenses = await Expense.aggregate([
      { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const monthExpenses = await Expense.aggregate([
      { $match: { date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

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
        expenses: {
          today: todayExpenses[0]?.total || 0,
          month: monthExpenses[0]?.total || 0
        }
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
