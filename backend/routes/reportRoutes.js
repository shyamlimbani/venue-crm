import express from 'express';
import {
  getMonthlyRevenue,
  getModuleRevenue,
  getBookingAnalytics,
  getPendingPayments,
  getPaymentHistory,
} from '../controllers/reportController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'owner'));

router.get('/monthly-revenue', getMonthlyRevenue);
router.get('/module-revenue', getModuleRevenue);
router.get('/analytics', getBookingAnalytics);
router.get('/pending-payments', getPendingPayments);
router.get('/payments', getPaymentHistory);

export default router;
