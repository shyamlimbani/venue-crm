import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { MODULE_LABELS } from '../config/modules.js';
import { checkDuplicateBooking } from '../utils/calendarHelper.js';
import { calcPaymentStatus, calcRemaining } from '../utils/paymentHelper.js';

const upsertCustomer = async (name, mobile, totalAmount, advanceAmount) => {
  let customer = await Customer.findOne({ mobile });
  if (!customer) {
    customer = await Customer.create({ name, mobile });
  } else if (name && customer.name !== name) {
    customer.name = name;
  }
  customer.totalBookings += 1;
  customer.totalSpent += advanceAmount;
  customer.pendingAmount += calcRemaining(totalAmount, advanceAmount);
  await customer.save();
  return customer;
};

const syncCustomerStats = async (customerId) => {
  const bookings = await Booking.find({ customer: customerId, status: 'active' });
  const customer = await Customer.findById(customerId);
  if (!customer) return;

  customer.totalBookings = bookings.length;
  customer.pendingAmount = bookings.reduce((sum, b) => sum + b.remainingAmount, 0);
  customer.totalSpent = bookings.reduce((sum, b) => sum + b.advanceAmount, 0);
  await customer.save();
};

export const createBooking = async (req, res) => {
  try {
    const {
      customerName,
      mobile,
      module,
      date,
      timeSlot,
      bookingType,
      shootCategory,
      guestCount,
      decorationNotes,
      eventNotes,
      totalAmount,
      advanceAmount,
      notes,
    } = req.body;

    const isDuplicate = await checkDuplicateBooking(module, date, timeSlot);
    if (isDuplicate) {
      return res.status(409).json({ success: false, message: 'This slot is already booked' });
    }

    const remaining = calcRemaining(Number(totalAmount), Number(advanceAmount || 0));
    const paymentStatus = calcPaymentStatus(Number(totalAmount), Number(advanceAmount || 0));
    const customer = await upsertCustomer(customerName, mobile, totalAmount, advanceAmount || 0);

    const booking = await Booking.create({
      customer: customer._id,
      customerName,
      mobile,
      module,
      date: new Date(date),
      timeSlot,
      bookingType: bookingType || '',
      shootCategory: shootCategory || '',
      guestCount: guestCount || 0,
      decorationNotes: decorationNotes || '',
      eventNotes: eventNotes || '',
      totalAmount,
      advanceAmount: advanceAmount || 0,
      remainingAmount: remaining,
      paymentStatus,
      notes: notes || '',
      createdBy: req.user._id,
    });

    if (advanceAmount > 0) {
      await Payment.create({
        booking: booking._id,
        customer: customer._id,
        amount: advanceAmount,
        type: 'advance',
        recordedBy: req.user._id,
      });
    }

    await Notification.create({
      title: 'New Booking',
      message: `${customerName} booked ${MODULE_LABELS[module]} on ${new Date(date).toLocaleDateString()}`,
      type: 'booking',
      module,
      booking: booking._id,
      priority: 'medium',
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const { date, timeSlot, module } = { ...booking.toObject(), ...req.body };
    if (req.body.date || req.body.timeSlot || req.body.module) {
      const isDuplicate = await checkDuplicateBooking(
        module || booking.module,
        date || booking.date,
        timeSlot || booking.timeSlot,
        booking._id
      );
      if (isDuplicate) {
        return res.status(409).json({ success: false, message: 'This slot is already booked' });
      }
    }

    const total = req.body.totalAmount ?? booking.totalAmount;
    const advance = req.body.advanceAmount ?? booking.advanceAmount;
    req.body.remainingAmount = calcRemaining(total, advance);
    req.body.paymentStatus = calcPaymentStatus(total, advance);

    if (req.body.customerName || req.body.mobile) {
      const customer = await Customer.findById(booking.customer);
      if (customer) {
        if (req.body.customerName) customer.name = req.body.customerName;
        if (req.body.mobile) customer.mobile = req.body.mobile;
        await customer.save();
      }
    }

    Object.assign(booking, req.body);
    if (req.body.date) booking.date = new Date(req.body.date);
    await booking.save();
    await syncCustomerStats(booking.customer);

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = 'cancelled';
    await booking.save();
    await syncCustomerStats(booking.customer);

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('customer', 'name mobile email notes');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingsByDate = async (req, res) => {
  try {
    const { date, module } = req.query;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const filter = { date: { $gte: start, $lte: end }, status: 'active' };
    if (module) filter.module = module;

    const bookings = await Booking.find(filter).sort({ timeSlot: 1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingsByModule = async (req, res) => {
  try {
    const { module } = req.params;
    const { status = 'active', limit = 50 } = req.query;
    const bookings = await Booking.find({ module, status })
      .sort({ date: -1 })
      .limit(Number(limit));
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const amount = booking.remainingAmount;
    booking.advanceAmount = booking.totalAmount;
    booking.remainingAmount = 0;
    booking.paymentStatus = 'Paid';
    await booking.save();

    await Payment.create({
      booking: booking._id,
      customer: booking.customer,
      amount,
      type: 'full',
      recordedBy: req.user._id,
    });

    await syncCustomerStats(booking.customer);

    await Notification.create({
      title: 'Payment Received',
      message: `Full payment received from ${booking.customerName}`,
      type: 'payment',
      module: booking.module,
      booking: booking._id,
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const payAmount = Math.min(Number(amount), booking.remainingAmount);
    booking.advanceAmount += payAmount;
    booking.remainingAmount = calcRemaining(booking.totalAmount, booking.advanceAmount);
    booking.paymentStatus = calcPaymentStatus(booking.totalAmount, booking.advanceAmount);
    await booking.save();

    await Payment.create({
      booking: booking._id,
      customer: booking.customer,
      amount: payAmount,
      type: booking.paymentStatus === 'Paid' ? 'full' : 'partial',
      recordedBy: req.user._id,
    });

    await syncCustomerStats(booking.customer);
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
