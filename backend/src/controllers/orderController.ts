import { Response } from 'express';
import Order from '../models/Order';
import Sweet from '../models/Sweet';
import { AuthRequest } from '../middlewares/authMiddleware';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'No order items provided' });
      return;
    }

    // Calculate total amount and validate sweets
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const sweet = await Sweet.findById(item.sweet);

      if (!sweet) {
        res.status(404).json({ message: `Sweet with id ${item.sweet} not found` });
        return;
      }

      if (sweet.stock < item.quantity) {
        res.status(400).json({ 
          message: `Insufficient stock for ${sweet.name}. Available: ${sweet.stock}` 
        });
        return;
      }

      const itemTotal = sweet.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        sweet: sweet._id,
        quantity: item.quantity,
        price: sweet.price,
      });

      // Update stock
      sweet.stock -= item.quantity;
      await sweet.save();
    }

    // Create order
    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      status: 'Pending',
    });

    const populatedOrder = await Order.findById(order._id).populate('items.sweet', 'name price');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user?._id })
      .populate('items.sweet', 'name price imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.sweet', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.sweet', 'name price imageUrl')
      .populate('user', 'name email');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check if user is the owner or admin
    if (order.user._id.toString() !== req.user?._id.toString() && req.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }

    res.status(200).json({
      order,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};