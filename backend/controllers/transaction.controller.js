const Transaction = require('../models/Transaction.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const BankService = require('../services/bankService');
const { v4: uuidv4 } = require('uuid');

// @desc    Purchase a course
// @route   POST /api/transactions/purchase
// @access  Private/Learner
exports.purchaseCourse = async (req, res) => {
  try {
    const { courseId, bankAccountSecret } = req.body;

    // Validate inputs
    if (!courseId || !bankAccountSecret) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and bank account secret are required'
      });
    }

    // Check if user has bank account
    if (!req.user.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please set up your bank account first'
      });
    }

    // Verify bank secret
    const user = await User.findById(req.user._id).select('+bankAccount.secret');
    const isSecretValid = await user.compareBankSecret(bankAccountSecret);

    if (!isSecretValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid bank secret'
      });
    }

    // Get course
    const course = await Course.findById(courseId).populate('instructor', 'name bankAccount');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available'
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = req.user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Process payment via Bank Service: Learner -> LMS
    const bankTransfer = await BankService.transfer({
      from: req.user.bankAccount.accountNumber,
      to: process.env.LMS_BANK_ACCOUNT,
      amount: course.price,
      secret: bankAccountSecret,
      description: `Course purchase: ${course.title}`
    });

    if (!bankTransfer.success) {
      return res.status(400).json({
        success: false,
        message: bankTransfer.message || 'Payment failed'
      });
    }

    const transactionId = bankTransfer.data.transactionId;
    const validationToken = uuidv4();

    // Update local balance cache
    req.user.bankAccount.balance = bankTransfer.data.from.newBalance;

    // Create transaction record for instructor validation
    const transaction = await Transaction.create({
      transactionId,
      type: 'course_purchase',
      fromAccount: req.user.bankAccount.accountNumber,
      toAccount: process.env.LMS_BANK_ACCOUNT,
      amount: course.price,
      status: 'pending',
      course: course._id,
      learner: req.user._id,
      instructor: course.instructor._id,
      validationToken,
      description: `Course purchase: ${course.title}`
    });

    // Enroll user in course
    req.user.enrolledCourses.push({
      courseId: course._id,
      enrolledAt: new Date(),
      progress: 0,
      completed: false
    });

    await req.user.save();

    // Add student to course
    course.enrolledStudents.push(req.user._id);
    course.totalSales += 1;
    course.revenue += course.price;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course purchased successfully',
      data: {
        transactionId: transaction.transactionId,
        course: {
          id: course._id,
          title: course.title,
          price: course.price
        },
        newBalance: bankTransfer.data.from.newBalance,
        validationToken: validationToken, // Instructor will use this to validate and claim payment
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          bankAccount: req.user.bankAccount,
          enrolledCourses: req.user.enrolledCourses
        }
      }
    });
  } catch (error) {
    console.error('Purchase course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error purchasing course',
      error: error.message
    });
  }
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'learner') {
      query = { learner: req.user._id };
    } else if (req.user.role === 'instructor') {
      query = { instructor: req.user._id };
    }

    const transactions = await Transaction.find(query)
      .populate('course', 'title price')
      .populate('learner', 'name email')
      .populate('instructor', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('course', 'title price')
      .populate('learner', 'name email')
      .populate('instructor', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check authorization
    if (
      transaction.learner._id.toString() !== req.user._id.toString() &&
      transaction.instructor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

// @desc    Get pending transactions for instructor
// @route   GET /api/transactions/instructor/pending
// @access  Private/Instructor
exports.getPendingTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      instructor: req.user._id,
      status: 'pending'
    })
      .populate('course', 'title price')
      .populate('learner', 'name email')
      .select('+validationToken')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending transactions',
      error: error.message
    });
  }
};

// @desc    Validate and claim instructor payment
// @route   POST /api/transactions/:id/validate
// @access  Private/Instructor
exports.validateAndClaim = async (req, res) => {
  try {
    const { validationToken, bankAccountSecret } = req.body;

    if (!validationToken || !bankAccountSecret) {
      return res.status(400).json({
        success: false,
        message: 'Validation token and bank account secret are required'
      });
    }

    const transaction = await Transaction.findById(req.params.id)
      .populate('course', 'title price')
      .select('+validationToken');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is the instructor
    if (transaction.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to validate this transaction'
      });
    }

    // Check if already validated
    if (transaction.status === 'completed' || transaction.status === 'validated') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already validated and paid'
      });
    }

    // Validate token
    if (transaction.validationToken !== validationToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid validation token'
      });
    }

    // Verify bank account secret
    const user = await User.findById(req.user._id).select('+bankAccount.secret');
    const isSecretValid = await user.compareBankSecret(bankAccountSecret);

    if (!isSecretValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid bank account secret'
      });
    }

    // Check if instructor has bank account
    if (!req.user.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please set up your bank account first'
      });
    }

    // Calculate instructor payment (70% of course price)
    const instructorPayment = Math.floor(transaction.amount * 0.7);

    // Transfer payment via Bank Service: LMS -> Instructor
    const bankTransfer = await BankService.transfer({
      from: process.env.LMS_BANK_ACCOUNT,
      to: req.user.bankAccount.accountNumber,
      amount: instructorPayment,
      secret: process.env.BANK_SECRET_KEY,
      description: `Instructor payment for ${transaction.course.title}`
    });

    if (!bankTransfer.success) {
      return res.status(500).json({
        success: false,
        message: bankTransfer.message || 'Failed to transfer payment'
      });
    }

    const paymentTxnId = bankTransfer.data.transactionId;

    // Update local balance cache
    req.user.bankAccount.balance = bankTransfer.data.to.newBalance;

    // Update transaction
    transaction.status = 'completed';
    transaction.validatedAt = new Date();
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Payment validated and transferred successfully',
      data: {
        transactionId: paymentTxnId,
        amount: instructorPayment,
        course: transaction.course.title,
        newBalance: bankTransfer.data.to.newBalance
      }
    });
  } catch (error) {
    console.error('Validate and claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating transaction',
      error: error.message
    });
  }
};
