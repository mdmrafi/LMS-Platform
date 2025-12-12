const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  generateCertificate,
  getCertificates,
  getCertificate,
  verifyCertificate,
  downloadCertificate
} = require('../controllers/certificate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');

// Validation rules
const generateValidation = [
  body('courseId').notEmpty().withMessage('Course ID is required')
];

// Routes
router.post('/generate', protect, authorize('learner'), generateValidation, handleValidationErrors, generateCertificate);
router.get('/', protect, getCertificates);
router.get('/:id', protect, getCertificate);
router.get('/:id/download', protect, downloadCertificate);

// Public route for verification
router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;
