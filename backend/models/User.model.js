const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['learner', 'instructor', 'admin'],
    default: 'learner'
  },
  bankAccount: {
    accountNumber: {
      type: String,
      default: null
    },
    secret: {
      type: String,
      select: false,
      default: null
    },
    balance: {
      type: Number,
      default: 10000 // Initial balance for testing
    }
  },
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    completedMaterials: [{
      type: String // Store material IDs
    }],
    quizAttempts: [{
      quizId: {
        type: String,
        required: true
      },
      score: {
        type: Number,
        required: true
      },
      passed: {
        type: Boolean,
        required: true
      },
      answers: [{
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean
      }],
      attemptedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Hash bank secret before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('bankAccount.secret') || !this.bankAccount.secret) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.bankAccount.secret = await bcrypt.hash(this.bankAccount.secret, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compare bank secret method
userSchema.methods.compareBankSecret = async function (candidateSecret) {
  if (!this.bankAccount.secret) {
    return false;
  }
  return await bcrypt.compare(candidateSecret, this.bankAccount.secret);
};

// Generate account number
userSchema.methods.generateAccountNumber = function () {
  let prefix = 'LRN';
  if (this.role === 'instructor') prefix = 'INS';
  else if (this.role === 'admin') prefix = 'ADM';

  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum}`;
};

module.exports = mongoose.model('User', userSchema);
