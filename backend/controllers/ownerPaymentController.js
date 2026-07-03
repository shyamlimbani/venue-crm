import OwnerPayment from '../models/OwnerPayment.js';
import User from '../models/User.js';

export const addOwnerPayment = async (req, res) => {
  try {
    const { ownerId, amount, date, method, notes } = req.body;

    // Check if user exists and is an owner
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const payment = await OwnerPayment.create({
      owner: ownerId,
      amount: numAmount,
      date: date || Date.now(),
      method: method || 'Cash',
      notes: notes || '',
      addedBy: req.user._id,
    });

    // Update the owner's totalPaid
    owner.totalPaid = (owner.totalPaid || 0) + numAmount;
    await owner.save();

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOwnerPayments = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins or the owner themselves can view payments
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these payments' });
    }

    const payments = await OwnerPayment.find({ owner: id })
      .populate('addedBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOwnerPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, method, notes } = req.body;

    const payment = await OwnerPayment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const amountDiff = numAmount - payment.amount;

    payment.amount = numAmount;
    payment.date = date || payment.date;
    payment.method = method || payment.method;
    payment.notes = notes !== undefined ? notes : payment.notes;

    await payment.save();

    // Update the owner's totalPaid
    if (amountDiff !== 0) {
      const owner = await User.findById(payment.owner);
      if (owner) {
        owner.totalPaid = (owner.totalPaid || 0) + amountDiff;
        await owner.save();
      }
    }

    const updatedPayment = await OwnerPayment.findById(id).populate('addedBy', 'name');

    res.json({ success: true, data: updatedPayment, message: 'Payment updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOwnerPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await OwnerPayment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const amountToDeduct = payment.amount;
    const ownerId = payment.owner;

    await payment.deleteOne();

    // Update the owner's totalPaid
    const owner = await User.findById(ownerId);
    if (owner) {
      owner.totalPaid = Math.max(0, (owner.totalPaid || 0) - amountToDeduct);
      await owner.save();
    }

    res.json({ success: true, message: 'Payment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
