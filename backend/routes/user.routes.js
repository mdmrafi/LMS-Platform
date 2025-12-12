const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const { protect } = require('../middleware/auth.middleware');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.courseId', 'title description price instructor')
      .populate('createdCourses', 'title description price enrolledStudents')
      .populate('certificates');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.courseId', 'title')
      .populate('createdCourses', 'title totalSales revenue');

    let stats = {};

    if (user.role === 'learner') {
      const completedCourses = user.enrolledCourses.filter(e => e.completed).length;
      const inProgressCourses = user.enrolledCourses.filter(e => !e.completed).length;
      const totalCertificates = user.certificates.length;

      stats = {
        totalCoursesEnrolled: user.enrolledCourses.length,
        completedCourses,
        inProgressCourses,
        totalCertificates,
        bankBalance: user.bankAccount.balance
      };
    } else if (user.role === 'instructor') {
      const totalRevenue = user.createdCourses.reduce((sum, course) => sum + (course.revenue || 0), 0);
      const totalStudents = user.createdCourses.reduce((sum, course) => sum + (course.totalSales || 0), 0);

      stats = {
        totalCourses: user.createdCourses.length,
        totalStudents,
        totalRevenue,
        bankBalance: user.bankAccount.balance
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

module.exports = router;
