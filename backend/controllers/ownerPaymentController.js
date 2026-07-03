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
