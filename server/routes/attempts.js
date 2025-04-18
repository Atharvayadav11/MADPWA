import express from 'express';
import Attempt from '../models/Attempt.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all attempts by user
router.get('/:id',  async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.params.id })
      .sort({ completedAt: -1 })
      .populate({
        path: 'testId',
        select: 'title totalMarks passingMarks',
        populate: {
          path: 'category',
          select: 'name'
        }
      });
    
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// // Get attempt by ID
// router.get('/:id',  async (req, res) => {
//   try {
//     const attempt = await Attempt.findOne({
//       _id: req.params.id,
    
//     })
//     .populate({
//       path: 'testId',
//       select: 'title description totalMarks passingMarks',
//       populate: {
//         path: 'category',
//         select: 'name'
//       }
//     })
//     .populate({
//       path: 'answers.questionId',
//       select: 'text options correctOption marks'
//     });
    
//     if (!attempt) {
//       return res.status(404).json({ message: 'Attempt not found' });
//     }
    
//     res.json(attempt);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

export default router;
