import express from 'express';
import { addOwnerPayment, getOwnerPayments, updateOwnerPayment, deleteOwnerPayment } from '../controllers/ownerPaymentController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('admin'), addOwnerPayment);
router.get('/:id', restrictTo('admin', 'owner'), getOwnerPayments);
router.put('/:id', restrictTo('admin'), updateOwnerPayment);
router.delete('/:id', restrictTo('admin'), deleteOwnerPayment);

export default router;
