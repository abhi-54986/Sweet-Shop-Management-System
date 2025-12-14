import { Response } from 'express';
import Sweet from '../models/Sweet';
import { AuthRequest } from '../middlewares/authMiddleware';

// @desc    Create a new sweet
// @route   POST /api/sweets
// @access  Private/Admin
export const createSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    const sweet = await Sweet.create({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
    });

    res.status(201).json({
      message: 'Sweet created successfully',
      sweet,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all sweets
// @route   GET /api/sweets
// @access  Public
export const getAllSweets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sweets = await Sweet.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      sweets,
      count: sweets.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single sweet by ID
// @route   GET /api/sweets/:id
// @access  Public
export const getSweetById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    res.status(200).json({
      sweet,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a sweet
// @route   PUT /api/sweets/:id
// @access  Private/Admin
export const updateSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    // Update fields
    sweet.name = name || sweet.name;
    sweet.description = description || sweet.description;
    sweet.price = price !== undefined ? price : sweet.price;
    sweet.category = category || sweet.category;
    sweet.stock = stock !== undefined ? stock : sweet.stock;
    sweet.imageUrl = imageUrl || sweet.imageUrl;

    const updatedSweet = await sweet.save();

    res.status(200).json({
      message: 'Sweet updated successfully',
      sweet: updatedSweet,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a sweet
// @route   DELETE /api/sweets/:id
// @access  Private/Admin
export const deleteSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    await Sweet.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Sweet deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};