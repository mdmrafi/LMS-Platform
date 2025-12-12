const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Transaction = require('../models/Transaction.model');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    
    const count = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user details (admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('enrolledCourses.courseId', 'title price')
      .populate('createdCourses', 'title price totalSales revenue');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, bankAccount } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (bankAccount?.balance !== undefined) {
      user.bankAccount.balance = bankAccount.balance;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin account'
        });
      }
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get all courses (admin only)
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getAllCourses = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    
    const count = await Course.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: courses.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: courses
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Delete course (admin only)
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    await course.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// @desc    Get all transactions (admin only)
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getAllTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const transactions = await Transaction.find(query)
      .populate('course', 'title price')
      .populate('learner', 'name email')
      .populate('instructor', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    
    const count = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: transactions
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics (admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ isActive: true });
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
    
    // Calculate total revenue
    const revenueResult = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .populate('course', 'title')
      .populate('learner', 'name email')
      .populate('instructor', 'name email')
      .sort('-createdAt')
      .limit(5);
    
    // Get top courses
    const topCourses = await Course.find()
      .sort('-totalSales')
      .limit(5)
      .populate('instructor', 'name');
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          learners: totalLearners,
          instructors: totalInstructors
        },
        courses: {
          total: totalCourses,
          active: activeCourses
        },
        transactions: {
          total: totalTransactions,
          pending: pendingTransactions,
          completed: completedTransactions
        },
        revenue: {
          total: totalRevenue
        },
        recentTransactions,
        topCourses
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};
