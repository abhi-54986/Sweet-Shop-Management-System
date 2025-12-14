import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

// User routes (authenticated)
router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);

// Admin only routes - PUT THIS BEFORE /:id
router.get('/all', protect, authorize('ADMIN'), getAllOrders);
router.put('/:id', protect, authorize('ADMIN'), updateOrderStatus);

// Single order route - PUT THIS AFTER /all
router.get('/:id', protect, getOrderById);

export default router;