const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learnerName: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseTitle: {
    type: String,
    required: true
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
  issueDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date,
    required: true
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'Pass'],
    default: 'Pass'
  },
  verificationUrl: {
    type: String
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate certificate ID
certificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.certificateId = `CERT-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
