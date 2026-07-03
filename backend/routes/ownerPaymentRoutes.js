import express from 'express';
import { addOwnerPayment, getOwnerPayments } from '../controllers/ownerPaymentController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('admin'), addOwnerPayment);
router.get('/:id', restrictTo('admin', 'owner'), getOwnerPayments);

export default router;
