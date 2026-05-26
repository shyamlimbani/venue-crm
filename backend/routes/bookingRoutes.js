import express from 'express';
import {
  createBooking,
  updateBooking,
  deleteBooking,
  getBooking,
  getBookingsByDate,
  getBookingsByModule,
  markPaid,
  updatePayment,
} from '../controllers/bookingController.js';
import { protect, requireModuleAccess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess);

router.post('/', createBooking);
router.get('/date', getBookingsByDate);
router.get('/module/:module', getBookingsByModule);
router.get('/:id', getBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id/mark-paid', markPaid);
router.patch('/:id/payment', updatePayment);

export default router;
