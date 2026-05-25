import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  generateReminders,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.post('/generate', generateReminders);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);

export default router;
