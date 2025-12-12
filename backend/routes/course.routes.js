const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addMaterial,
  uploadMaterial,
  removeMaterial,
  getMaterialFile,
  getInstructorCourses,
  getEnrolledCourses,
  updateProgress,
  markMaterialCompleted
} = require('../controllers/course.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');

// Validation rules
const createCourseValidation = [
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('description').trim().notEmpty().withMessage('Course description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
  body('category').isIn(['Programming', 'Design', 'Business', 'Data Science', 'Other']).withMessage('Invalid category')
];

const addMaterialValidation = [
  body('title').trim().notEmpty().withMessage('Material title is required'),
  body('type').isIn(['text', 'audio', 'video', 'mcq']).withMessage('Invalid material type'),
  body('content').trim().notEmpty().withMessage('Material content is required')
];

// Public routes
router.get('/', getAllCourses);
router.get('/:id', optionalAuth, getCourse);

// Instructor routes
router.post('/', protect, authorize('instructor'), createCourseValidation, handleValidationErrors, createCourse);
router.put('/:id', protect, authorize('instructor'), updateCourse);
router.delete('/:id', protect, authorize('instructor'), deleteCourse);
router.post('/:id/materials', protect, authorize('instructor'), addMaterialValidation, handleValidationErrors, addMaterial);
router.post('/:id/materials/upload', protect, authorize('instructor'), upload.single('file'), uploadMaterial);
router.delete('/:id/materials/:materialId', protect, authorize('instructor'), removeMaterial);
router.get('/instructor/my-courses', protect, authorize('instructor'), getInstructorCourses);
router.get('/:id/materials/:materialId/file', protect, getMaterialFile);

// Learner routes
router.get('/learner/enrolled', protect, authorize('learner'), getEnrolledCourses);
router.put('/:id/progress', protect, authorize('learner'), updateProgress);

module.exports = router;
