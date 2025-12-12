const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bank.controller');

// Register new bank account
router.post('/register', bankController.registerAccount);

// Get account balance
router.get('/balance/:accountNumber', bankController.getBalance);

// Verify transaction with secret
router.post('/verify-transaction', bankController.verifyTransaction);

// Transfer money
router.post('/transfer', bankController.transfer);

// Get transaction history
router.get('/transactions/:accountNumber', bankController.getTransactions);

module.exports = router;
