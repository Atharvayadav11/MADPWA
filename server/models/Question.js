import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctOption: {
    type: Number,
    required: true
  },
  marks: {
    type: Number,
    required: true,
    default: 1
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

export default Question;