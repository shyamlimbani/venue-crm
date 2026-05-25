import Customer from '../models/Customer.js';
import Booking from '../models/Booking.js';

export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const customers = await Customer.find(filter).sort({ updatedAt: -1 });
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const bookings = await Booking.find({ customer: customer._id })
      .sort({ date: -1 });

    const pendingBookings = bookings.filter(
      (b) => b.status === 'active' && b.remainingAmount > 0
    );

    res.json({
      success: true,
      data: {
        customer,
        bookings,
        pendingBookings,
        bookingHistory: bookings.filter((b) => b.status !== 'cancelled'),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const existing = await Customer.findOne({ mobile: req.body.mobile });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Customer with this mobile already exists' });
    }
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
