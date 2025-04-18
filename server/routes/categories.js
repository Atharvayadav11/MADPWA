import express from 'express';
import Category from '../models/Category.js';
import Test from '../models/Test.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/',  async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category by ID
router.get('/:id',  async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tests by category ID
router.get('/:id/tests', async (req, res) => {
  try {
    const tests = await Test.find({ category: req.params.id })
      .select('title description totalQuestions totalMarks passingMarks duration');
    
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
