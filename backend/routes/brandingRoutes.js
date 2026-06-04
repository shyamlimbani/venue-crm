import express from 'express';
import { 
  getBranding, 
  updateBranding, 
  uploadLogo, 
  deleteLogo 
} from '../controllers/brandingController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// GET is public so login page and client context can load branding before auth
router.get('/', getBranding);

// Admin-only write/update endpoints
router.put('/', protect, restrictTo('admin'), updateBranding);
router.put('/logo', protect, restrictTo('admin'), uploadLogo);
router.delete('/logo', protect, restrictTo('admin'), deleteLogo);

export default router;
