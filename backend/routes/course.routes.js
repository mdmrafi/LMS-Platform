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
  markMaterialCompleted,
  addQuiz,
  getQuizzes,
  submitQuiz,
  deleteQuiz
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

const addQuizValidation = [
  body('title').trim().notEmpty().withMessage('Quiz title is required'),
  body('questions').isArray({ min: 1 }).withMessage('Quiz must have at least one question'),
  body('questions.*.question').notEmpty().withMessage('Each question must have text'),
  body('questions.*.options').isArray({ min: 4, max: 4 }).withMessage('Each question must have exactly 4 options'),
  body('questions.*.correctAnswer').isInt({ min: 0, max: 3 }).withMessage('Correct answer must be 0-3')
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

// Quiz routes (Instructor)
router.post('/:id/quizzes', protect, authorize('instructor'), addQuizValidation, handleValidationErrors, addQuiz);
router.delete('/:id/quizzes/:quizId', protect, authorize('instructor'), deleteQuiz);

// Learner routes
router.get('/learner/enrolled', protect, authorize('learner'), getEnrolledCourses);
router.put('/:id/progress', protect, authorize('learner'), updateProgress);
router.post('/:id/materials/:materialId/complete', protect, authorize('learner'), markMaterialCompleted);

// Quiz routes (Learner)
router.get('/:id/quizzes', protect, getQuizzes);
router.post('/:id/quizzes/:quizId/submit', protect, authorize('learner'), submitQuiz);

module.exports = router;
