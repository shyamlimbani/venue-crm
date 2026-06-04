import Expense from '../models/Expense.js';

export const getExpenses = async (req, res) => {
  try {
    const { filter, startDate, endDate, category, search } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let start, end;
    const now = new Date();

    if (filter === 'today') {
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
    } else if (filter === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (filter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filter === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
      query.date = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(query)
      .populate('addedBy', 'name')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, description, paymentMethod, attachment } = req.body;

    const expense = await Expense.create({
      title,
      category,
      amount,
      date,
      description,
      paymentMethod,
      attachment,
      addedBy: req.user._id,
    });

    const populated = await expense.populate('addedBy', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const { title, category, amount, date, description, paymentMethod, attachment } = req.body;

    expense.title = title !== undefined ? title : expense.title;
    expense.category = category !== undefined ? category : expense.category;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.date = date !== undefined ? date : expense.date;
    expense.description = description !== undefined ? description : expense.description;
    expense.paymentMethod = paymentMethod !== undefined ? paymentMethod : expense.paymentMethod;
    expense.attachment = attachment !== undefined ? attachment : expense.attachment;

    const updated = await expense.save();
    const populated = await updated.populate('addedBy', 'name');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenseStats = async (req, res) => {
  try {
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const statsToday = await Expense.aggregate([
      { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const statsMonth = await Expense.aggregate([
      { $match: { date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const statsYear = await Expense.aggregate([
      { $match: { date: { $gte: yearStart, $lte: yearEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        today: statsToday[0]?.total || 0,
        month: statsMonth[0]?.total || 0,
        year: statsYear[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenseReports = async (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const monthlyData = await Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const quarterlyData = await Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $cond: [
              { $lte: [{ $month: '$date' }, 3] }, 1,
              { $cond: [
                { $lte: [{ $month: '$date' }, 6] }, 2,
                { $cond: [
                  { $lte: [{ $month: '$date' }, 9] }, 3, 4
                ]}
              ]}
            ]
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const yearlyData = await Expense.aggregate([
      {
        $group: {
          _id: { $year: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const categoryData = await Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        monthly: monthlyData,
        quarterly: quarterlyData,
        yearly: yearlyData,
        category: categoryData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
