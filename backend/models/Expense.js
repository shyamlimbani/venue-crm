import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      required: true,
      enum: [
        'Electricity',
        'Staff Salary',
        'Maintenance',
        'Marketing',
        'Cleaning',
        'Studio Equipment',
        'Cricket Ground',
        'Marriage Ground',
        'Office Expense',
        'Miscellaneous'
      ]
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    description: { type: String, trim: true },
    paymentMethod: { 
      type: String, 
      required: true,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card']
    },
    attachment: { type: String, default: '' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
