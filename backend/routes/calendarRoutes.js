import express from 'express';
import { getMonthCalendar, getModuleConfig } from '../controllers/calendarController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/config/:module', getModuleConfig);
router.get('/:module', getMonthCalendar);

export default router;
