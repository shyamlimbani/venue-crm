import express from 'express';
import { 
  getExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense, 
  getExpenseStats, 
  getExpenseReports 
} from '../controllers/expenseController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('admin', 'owner'), getExpenses);
router.get('/stats', restrictTo('admin', 'owner'), getExpenseStats);
router.get('/reports', restrictTo('admin', 'owner'), getExpenseReports);
router.post('/', restrictTo('admin', 'owner'), createExpense);
router.put('/:id', restrictTo('admin'), updateExpense);
router.delete('/:id', restrictTo('admin'), deleteExpense);

export default router;
