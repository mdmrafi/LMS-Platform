const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getAllCourses,
  deleteCourse,
  getAllTransactions,
  getDashboardStats
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Course management routes
router.get('/courses', getAllCourses);
router.delete('/courses/:id', deleteCourse);

// Transaction management routes
router.get('/transactions', getAllTransactions);

// Dashboard statistics
router.get('/stats', getDashboardStats);

module.exports = router;
