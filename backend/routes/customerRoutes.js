import express from 'express';
import {
  getCustomers,
  getCustomer,
  updateCustomer,
  createCustomer,
} from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);

export default router;
