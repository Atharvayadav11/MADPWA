import express from 'express';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Attempt from '../models/Attempt.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get test by ID
router.get('/:id',  async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('category', 'name')
      .select('-questions');
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get test questions
router.get('/:id/questions', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate({
        path: 'questions',
        select: 'text options marks', // Exclude correctOption
        options: { sort: { createdAt: 1 } }
      });
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit test
// router.post('/:id/submit',  async (req, res) => {
//   try {
//     const { answers } = req.body;
//     const testId = req.params.id;
    
//     // Get test details
//     const test = await Test.findById(testId);
//     if (!test) {
//       return res.status(404).json({ message: 'Test not found' });
//     }
    
//     // Calculate score
//     let score = 0;
//     const answersWithDetails = [];
    
//     for (const answer of answers) {
//       const question = await Question.findById(answer.questionId);
//       if (!question) continue;
      
//       const isCorrect = question.correctOption === answer.selectedOption;
//       if (isCorrect) {
//         score += question.marks;
//       }
      
//       answersWithDetails.push({
//         questionId: question._id,
//         selectedOption: answer.selectedOption,
//         isCorrect
//       });
//     }
    
//     // Create attempt record
//     const attempt = new Attempt({
//       user: req.user.id,
//       testId: test._id,
//       score,
//       passed: score >= test.passingMarks,
//       timeTaken: 60 * test.duration, // Assuming full time for now
//       answers: answersWithDetails
//     });
    
//     await attempt.save();
    
//     res.json({
//       score,
//       totalMarks: test.totalMarks,
//       passed: score >= test.passingMarks,
//       attemptId: attempt._id
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });
router.post('/:id/submit', async (req, res) => {
  try {
    const { user, answers, timeTaken } = req.body;
    const testId = req.params.id;
    
    // Get test details
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Calculate score
    let score = 0;
    const answersWithDetails = [];
    
    for (const answer of answers) {
      const question = await Question.findById(answer.questionId);
      if (!question) {
        console.log(`Question not found: ${answer.questionId}`);
        continue;
      }
      
      // Use the isCorrect value from the frontend for now
      // Later you can implement server-side validation if needed
      const isCorrect = answer.isCorrect;
      if (isCorrect) {
        score += question.marks || 1;
      }
      
      answersWithDetails.push({
        questionId: question._id,
        selectedOption: answer.selectedOption,
        isCorrect
      });
    }
    
    // Create attempt record
    const attempt = new Attempt({
      user: user, // Use the user ID from request body
      testId: test._id,
      score,
      passed: score >= (test.passingMarks || 0),
      timeTaken: timeTaken || (60 * test.duration),
      answers: answersWithDetails
    });
    
    await attempt.save();
    
    res.json({
      score,
      totalMarks: test.totalMarks || answers.length,
      passed: score >= (test.passingMarks || 0),
      attemptId: attempt._id
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get test results
router.get('/:id/results', async (req, res) => {
  try {
    const testId = req.params.id;
    
    // Find the most recent attempt for this test by the user
    const attempt = await Attempt.findOne({
      user: req.user.id,
      testId
    })
    .sort({ completedAt: -1 })
    .populate({
      path: 'testId',
      select: 'title description totalMarks passingMarks',
      populate: {
        path: 'category',
        select: 'name'
      }
    })
    .populate({
      path: 'answers.questionId',
      select: 'text options correctOption marks'
    });
    
    if (!attempt) {
      return res.status(404).json({ message: 'No attempt found for this test' });
    }
    
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
