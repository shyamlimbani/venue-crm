import express from 'express';
import { login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /auth/login  (also available at /api/auth/login)
 * Body: { email, password, role? }
 */
router.post('/login', login);

/** GET /auth/me — requires Bearer token */
router.get('/me', protect, getMe);

/** POST /auth/logout — requires Bearer token */
router.post('/logout', protect, logout);

export default router;
