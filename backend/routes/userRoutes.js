import express from 'express';
import { getAllUsers, getUserById, updateUserRole, deleteUser, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Authenticated user routes
router.put('/profile', protect, updateProfile);

// Admin only routes
router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
