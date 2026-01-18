const User = require('../models/User.model');
const BankService = require('../services/bankService');

// @desc    Setup bank account for user
// @route   POST /api/bank/setup
// @access  Private
exports.setupBankAccount = async (req, res) => {
  try {
    const { secret } = req.body;

    if (!secret) {
      return res.status(400).json({
        success: false,
        message: 'Bank secret is required'
      });
    }

    // Check if user already has bank account
    if (req.user.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Bank account already set up'
      });
    }

    // Generate account number
    const accountNumber = req.user.generateAccountNumber();

    // Register account with Bank API
    const bankResult = await BankService.registerAccount({
      accountNumber,
      accountHolder: req.user.name,
      accountType: req.user.role,
      initialBalance: req.user.role === 'learner' ? 10000 : 0,
      secret
    });

    if (!bankResult.success) {
      return res.status(500).json({
        success: false,
        message: bankResult.message || 'Failed to create bank account'
      });
    }

    // Update user with bank details
    req.user.bankAccount.accountNumber = accountNumber;
    req.user.bankAccount.balance = bankResult.data.balance;
    req.user.bankAccount.secret = secret; // Store hashed secret in user model
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Bank account set up successfully',
      data: {
        accountNumber: bankResult.data.accountNumber,
        balance: bankResult.data.balance
      }
    });
  } catch (error) {
    console.error('Setup bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up bank account',
      error: error.message
    });
  }
};

// @desc    Get bank balance
// @route   GET /api/bank/balance
// @access  Private
exports.getBankBalance = async (req, res) => {
  try {
    if (!req.user.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Bank account not set up. Please set up your bank account first.'
      });
    }

    // Get balance from Bank API
    const bankResult = await BankService.getBalance(req.user.bankAccount.accountNumber);

    if (!bankResult.success) {
      return res.status(404).json({
        success: false,
        message: bankResult.message || 'Failed to get balance'
      });
    }

    // Update local balance cache
    req.user.bankAccount.balance = bankResult.data.balance;
    await req.user.save();

    res.status(200).json({
      success: true,
      data: {
        accountNumber: bankResult.data.accountNumber,
        accountHolder: bankResult.data.accountHolder,
        balance: bankResult.data.balance
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching balance',
      error: error.message
    });
  }
};

// @desc    Process transaction
// @route   POST /api/bank/transaction
// @access  Private
exports.processTransaction = async (req, res) => {
  try {
    const { toAccount, amount, secret, description } = req.body;

    // Validate inputs
    if (!toAccount || !amount || !secret) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Check if user has bank account
    if (!req.user.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Bank account not set up'
      });
    }

    // Process transfer via Bank API
    const bankResult = await BankService.transfer({
      from: req.user.bankAccount.accountNumber,
      to: toAccount,
      amount,
      secret,
      description: description || 'Transfer'
    });

    if (!bankResult.success) {
      return res.status(bankResult.error?.status || 400).json({
        success: false,
        message: bankResult.message
      });
    }

    // Update local balance cache
    req.user.bankAccount.balance = bankResult.data.from.newBalance;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Transaction successful',
      data: {
        transactionId: bankResult.data.transactionId,
        from: bankResult.data.from.accountNumber,
        to: bankResult.data.to.accountNumber,
        amount,
        newBalance: bankResult.data.from.newBalance
      }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Transaction failed',
      error: error.message
    });
  }
};

// @desc    Get transaction history
// @route   GET /api/bank/transactions
// @access  Private
exports.getTransactionHistory = async (req, res) => {
  try {
    if (!req.user.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Bank account not set up'
      });
    }

    // Get transactions from Bank API
    const bankResult = await BankService.getTransactionHistory(
      req.user.bankAccount.accountNumber,
      req.query.limit || 50
    );

    if (!bankResult.success) {
      return res.status(404).json({
        success: false,
        message: bankResult.message || 'Failed to get transactions'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        transactions: bankResult.data.transactions
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Add funds to bank account (from LMS organization)
// @route   POST /api/bank/add-funds
// @access  Private/Learner
exports.addFunds = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0'
      });
    }

    // Maximum single deposit limit
    const maxDeposit = 100000;
    if (amount > maxDeposit) {
      return res.status(400).json({
        success: false,
        message: `Maximum single deposit is ₹${maxDeposit.toLocaleString()}`
      });
    }

    // Check if user has bank account
    if (!req.user.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Bank account not set up. Please set up your bank account first.'
      });
    }

    // Transfer from LMS organization account to user account
    const bankResult = await BankService.transfer({
      from: process.env.LMS_BANK_ACCOUNT,
      to: req.user.bankAccount.accountNumber,
      amount: parseFloat(amount),
      secret: process.env.BANK_SECRET_KEY,
      description: `Funds added to account - Top up`
    });

    if (!bankResult.success) {
      return res.status(400).json({
        success: false,
        message: bankResult.message || 'Failed to add funds'
      });
    }

    // Update local balance cache
    req.user.bankAccount.balance = bankResult.data.to.newBalance;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Funds added successfully',
      data: {
        transactionId: bankResult.data.transactionId,
        amount: parseFloat(amount),
        newBalance: bankResult.data.to.newBalance
      }
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding funds',
      error: error.message
    });
  }
};

module.exports = exports;
