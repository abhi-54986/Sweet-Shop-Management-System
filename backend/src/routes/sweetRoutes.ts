import express from 'express';
import {
  createSweet,
  getAllSweets,
  getSweetById,
  updateSweet,
  deleteSweet,
} from '../controllers/sweetController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getAllSweets);
router.get('/:id', getSweetById);

// Admin only routes
router.post('/', protect, authorize('ADMIN'), createSweet);
router.put('/:id', protect, authorize('ADMIN'), updateSweet);
router.delete('/:id', protect, authorize('ADMIN'), deleteSweet);

export default router;