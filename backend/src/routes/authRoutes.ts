import express, { Response } from 'express';
import { register, login } from '../controllers/authController';
import { protect, authorize, AuthRequest } from '../middlewares/authMiddleware';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile - Protected route (requires authentication)
router.get('/profile', protect, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: 'Profile accessed successfully',
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
});

// GET /api/auth/admin-only - Admin only route
router.get('/admin-only', protect, authorize('ADMIN'), (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: 'Admin access granted',
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
});

export default router;