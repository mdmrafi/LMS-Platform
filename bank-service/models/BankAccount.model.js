const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bankAccountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  accountHolder: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['learner', 'instructor', 'admin', 'lms'],
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  secret: {
    type: String,
    required: true,
    select: false // Don't include in queries by default
  },
  isActive: {
    type: Boolean,
    default: true
  },
  transactions: [{
    transactionId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    fromAccount: String,
    toAccount: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash secret before saving
bankAccountSchema.pre('save', async function(next) {
  if (!this.isModified('secret')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.secret = await bcrypt.hash(this.secret, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare secret
bankAccountSchema.methods.compareSecret = async function(candidateSecret) {
  try {
    return await bcrypt.compare(candidateSecret, this.secret);
  } catch (error) {
    return false;
  }
};

// Method to add transaction
bankAccountSchema.methods.addTransaction = function(transactionData) {
  this.transactions.push({
    transactionId: transactionData.transactionId,
    type: transactionData.type,
    amount: transactionData.amount,
    balanceAfter: this.balance,
    fromAccount: transactionData.fromAccount,
    toAccount: transactionData.toAccount,
    description: transactionData.description,
    date: new Date()
  });
};

module.exports = mongoose.model('BankAccount', bankAccountSchema);
