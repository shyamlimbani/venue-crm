import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import { MODULES, MODULE_LABELS } from '../config/modules.js';

export const getMonthlyRevenue = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const monthly = [];

    for (let m = 1; m <= 12; m++) {
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59, 999);
      const bookings = await Booking.find({
        status: 'active',
        date: { $gte: start, $lte: end },
      });
      const revenue = bookings.reduce((sum, b) => sum + b.advanceAmount, 0);
      const totalBookings = bookings.length;
      monthly.push({ month: m, revenue, totalBookings });
    }

    res.json({ success: true, data: { year, monthly } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModuleRevenue = async (req, res) => {
  try {
    const { start, end } = req.query;
    const dateFilter = {};
    if (start && end) {
      dateFilter.date = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const moduleRevenue = await Promise.all(
      Object.values(MODULES).map(async (module) => {
        const bookings = await Booking.find({ module, status: 'active', ...dateFilter });
        return {
          module,
          label: MODULE_LABELS[module],
          revenue: bookings.reduce((s, b) => s + b.advanceAmount, 0),
          totalAmount: bookings.reduce((s, b) => s + b.totalAmount, 0),
          pending: bookings.reduce((s, b) => s + b.remainingAmount, 0),
          count: bookings.length,
        };
      })
    );

    res.json({ success: true, data: moduleRevenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingAnalytics = async (req, res) => {
  try {
    const total = await Booking.countDocuments({ status: 'active' });
    const cancelled = await Booking.countDocuments({ status: 'cancelled' });
    const paid = await Booking.countDocuments({ status: 'active', paymentStatus: 'Paid' });
    const partial = await Booking.countDocuments({ status: 'active', paymentStatus: 'Partial' });
    const pending = await Booking.countDocuments({ status: 'active', paymentStatus: 'Pending' });

    const byModule = await Promise.all(
      Object.values(MODULES).map(async (module) => ({
        module,
        label: MODULE_LABELS[module],
        count: await Booking.countDocuments({ module, status: 'active' }),
      }))
    );

    res.json({
      success: true,
      data: { total, cancelled, paid, partial, pending, byModule },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingPayments = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: 'active',
      remainingAmount: { $gt: 0 },
    })
      .sort({ date: 1 })
      .populate('customer', 'name mobile');

    const totalPending = bookings.reduce((s, b) => s + b.remainingAmount, 0);
    res.json({ success: true, data: { bookings, totalPending, count: bookings.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('booking', 'customerName module date')
      .populate('customer', 'name mobile');
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
