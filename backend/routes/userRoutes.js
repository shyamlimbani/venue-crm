import express from 'express';
import { getAllUsers, createUser, updateUser, deleteUser, getUserDetails } from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('admin', 'owner'), getAllUsers);
router.get('/:id', restrictTo('admin', 'owner'), getUserDetails);
router.post('/', restrictTo('admin'), createUser);
router.put('/:id', restrictTo('admin'), updateUser);
router.delete('/:id', restrictTo('admin'), deleteUser);

export default router;
