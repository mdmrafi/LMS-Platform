const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  setupBankAccount,
  getBankBalance,
  processTransaction,
  getTransactionHistory
} = require('../controllers/bank.controller');
const { protect } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');

// Validation rules
const setupValidation = [
  body('secret').notEmpty().withMessage('Bank secret is required').isLength({ min: 4 }).withMessage('Secret must be at least 4 characters')
];

const transactionValidation = [
  body('toAccount').notEmpty().withMessage('Recipient account is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('secret').notEmpty().withMessage('Bank secret is required')
];

// Routes
router.post('/setup', protect, setupValidation, handleValidationErrors, setupBankAccount);
router.get('/balance', protect, getBankBalance);
router.post('/transaction', protect, transactionValidation, handleValidationErrors, processTransaction);
router.get('/transactions', protect, getTransactionHistory);

module.exports = router;
