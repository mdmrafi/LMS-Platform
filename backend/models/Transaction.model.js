const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['course_purchase', 'instructor_payment', 'course_upload_reward'],
    required: true
  },
  fromAccount: {
    type: String,
    required: true
  },
  toAccount: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'validated'],
    default: 'pending'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validationToken: {
    type: String,
    select: false
  },
  validatedAt: {
    type: Date
  },
  description: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ fromAccount: 1, toAccount: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
