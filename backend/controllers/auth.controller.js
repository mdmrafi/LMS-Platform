const User = require('../models/User.model');
const BankService = require('../services/bankService');
const { generateToken } = require('../middleware/auth.middleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, bankAccountSecret } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Only allow learner registration - instructors and admins are pre-created
    if (role && role !== 'learner') {
      return res.status(400).json({
        success: false,
        message: 'Only learner registration is allowed. Instructors and admins are pre-created.'
      });
    }

    // Validate bank secret
    if (!bankAccountSecret) {
      return res.status(400).json({
        success: false,
        message: 'Bank account secret is required'
      });
    }

    // Create user first
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'learner'
    });

    // Generate account number
    const accountNumber = user.generateAccountNumber();
    const initialBalance = user.role === 'learner' ? 10000 : 0;

    // Create bank account via Bank Service
    const bankResult = await BankService.registerAccount({
      accountNumber,
      accountHolder: user.name,
      accountType: user.role,
      initialBalance,
      secret: bankAccountSecret
    });

    if (!bankResult.success) {
      // If bank account creation fails, delete the user
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: bankResult.message || 'Failed to create bank account'
      });
    }

    // Update user with bank details
    user.bankAccount.accountNumber = accountNumber;
    user.bankAccount.balance = initialBalance;
    user.bankAccount.secret = bankAccountSecret; // Will be hashed
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bankAccount: {
            accountNumber: user.bankAccount.accountNumber,
            balance: user.bankAccount.balance
          },
          enrolledCourses: user.enrolledCourses
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bankAccount: user.bankAccount,
          enrolledCourses: user.enrolledCourses
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses.courseId', 'title description price')
      .populate('createdCourses', 'title description price')
      .populate('certificates');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};
