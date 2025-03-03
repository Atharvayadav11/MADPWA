import mongoose from 'mongoose';
import Category from './models/Category.js';
import Test from './models/Test.js';
import Question from './models/Question.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configure environment variables
dotenv.config();

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import data from JSON file
const importData = async () => {
  try {
    // Read the JSON file
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'quiz-data.json'), 'utf-8')
    );
    
    console.log('Starting data import...');
    
    // Import categories
    for (const categoryData of jsonData.categories) {
      console.log(`Importing category: ${categoryData.name}`);
      
      // Create or update category
      const category = await Category.findOneAndUpdate(
        { name: categoryData.name },
        categoryData,
        { upsert: true, new: true }
      );
      
      // Import tests for this category
      for (const testData of categoryData.tests) {
        console.log(`Importing test: ${testData.title}`);
        
        // Create test without questions initially
        const test = new Test({
          title: testData.title,
          description: testData.description,
          category: category._id,
          totalQuestions: testData.questions.length,
          totalMarks: testData.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
          passingMarks: testData.passingMarks,
          duration: testData.duration,
          questions: []
        });
        
        await test.save();
        
        // Import questions for this test
        for (const questionData of testData.questions) {
          console.log(`Importing question: ${questionData.text.substring(0, 30)}...`);
          
          const question = new Question({
            text: questionData.text,
            options: questionData.options,
            correctOption: questionData.correctOption,
            marks: questionData.marks || 1,
            test: test._id
          });
          
          await question.save();
          
          // Add question to test
          test.questions.push(question._id);
        }
        
        // Update test with question references
        await test.save();
      }
    }
    
    console.log('Data import completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error importing data:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Execute the import
importData();