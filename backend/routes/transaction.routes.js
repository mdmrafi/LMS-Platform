const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  purchaseCourse,
  getTransactions,
  getTransaction,
  getPendingTransactions,
  validateAndClaim
} = require('../controllers/transaction.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');

// Validation rules
const purchaseValidation = [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('bankAccountSecret').notEmpty().withMessage('Bank account secret is required')
];

const validateClaimValidation = [
  body('validationToken').notEmpty().withMessage('Validation token is required')
];

// Routes
router.post('/purchase', protect, authorize('learner'), purchaseValidation, handleValidationErrors, purchaseCourse);
router.get('/', protect, getTransactions);
router.get('/instructor/pending', protect, authorize('instructor'), getPendingTransactions);
router.get('/:id', protect, getTransaction);
router.post('/:id/validate', protect, authorize('instructor'), validateClaimValidation, handleValidationErrors, validateAndClaim);

module.exports = router;
