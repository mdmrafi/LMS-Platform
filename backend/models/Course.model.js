const mongoose = require('mongoose');

// Quiz question schema for course quizzes
const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number, // Index of correct option (0-3)
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    default: ''
  }
});

// Quiz schema for course
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  questions: [quizQuestionSchema],
  passingScore: {
    type: Number,
    default: 70, // Percentage required to pass
    min: 0,
    max: 100
  },
  timeLimit: {
    type: Number, // In minutes, 0 means no limit
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isRequired: {
    type: Boolean,
    default: true // Must pass to complete course
  }
});

const courseMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'audio', 'video', 'mcq', 'document'],
    required: true
  },
  content: {
    type: String,
    required: false
  },
  fileUrl: {
    type: String,
    required: false
  },
  fileName: {
    type: String,
    required: false
  },
  fileSize: {
    type: String, // Storing as string to handle "10MB", "500KB" etc or just bytes
    required: false
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: 0
  },
  duration: {
    type: Number, // in hours
    required: true,
    min: 1
  },
  category: {
    type: String,
    required: true,
    enum: ['Programming', 'Design', 'Business', 'Data Science', 'Other']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  materials: [courseMaterialSchema],
  quizzes: [quizSchema], // Course quizzes for progress validation
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  thumbnail: {
    type: String,
    default: 'default-course-thumbnail.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalSales: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search
courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);
