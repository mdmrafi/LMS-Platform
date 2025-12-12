const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  accountHolder: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['learner', 'instructor', 'lms'],
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  transactions: [{
    transactionId: String,
    type: {
      type: String
    },
    amount: Number,
    balance: Number,
    date: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
