const BankAccount = require('../models/BankAccount.model');
const { v4: uuidv4 } = require('uuid');

// @desc    Register/Create a new bank account
// @route   POST /bank/register
// @access  Public (called by LMS API)
exports.registerAccount = async (req, res) => {
    try {
        const { accountNumber, accountHolder, accountType, initialBalance, secret } = req.body;

        // Validation
        if (!accountNumber || !accountHolder || !accountType || !secret) {
            return res.status(400).json({
                success: false,
                message: 'Please provide account number, holder, type, and secret'
            });
        }

        // Check if account already exists
        const existingAccount = await BankAccount.findOne({ accountNumber });
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: 'Account number already exists'
            });
        }

        // Create bank account
        const account = await BankAccount.create({
            accountNumber,
            accountHolder,
            accountType,
            balance: initialBalance || (accountType === 'lms' ? 1000000 : accountType === 'learner' ? 10000 : 0),
            secret
        });

        res.status(201).json({
            success: true,
            message: 'Bank account created successfully',
            data: {
                accountNumber: account.accountNumber,
                accountHolder: account.accountHolder,
                accountType: account.accountType,
                balance: account.balance
            }
        });

    } catch (error) {
        console.error('Register account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating bank account',
            error: error.message
        });
    }
};

// @desc    Get account balance
// @route   GET /bank/balance/:accountNumber
// @access  Public (called by LMS API)
exports.getBalance = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        const account = await BankAccount.findOne({ accountNumber, isActive: true });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Bank account not found'
            });
        }

        res.json({
            success: true,
            data: {
                accountNumber: account.accountNumber,
                accountHolder: account.accountHolder,
                balance: account.balance
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

// @desc    Verify transaction with secret PIN
// @route   POST /bank/verify-transaction
// @access  Public (called by LMS API)
exports.verifyTransaction = async (req, res) => {
    try {
        const { accountNumber, secret } = req.body;

        if (!accountNumber || !secret) {
            return res.status(400).json({
                success: false,
                message: 'Please provide account number and secret'
            });
        }

        // Find account with secret field included
        const account = await BankAccount.findOne({ accountNumber, isActive: true }).select('+secret');

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Bank account not found'
            });
        }

        // Verify secret
        const isMatch = await account.compareSecret(secret);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid secret'
            });
        }

        res.json({
            success: true,
            message: 'Secret verified successfully',
            data: {
                accountNumber: account.accountNumber,
                balance: account.balance
            }
        });

    } catch (error) {
        console.error('Verify transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying transaction',
            error: error.message
        });
    }
};

// @desc    Transfer money between accounts
// @route   POST /bank/transfer
// @access  Public (called by LMS API)
exports.transfer = async (req, res) => {
    try {
        const { from, to, amount, secret, description } = req.body;

        // Validation
        if (!from || !to || !amount || !secret) {
            return res.status(400).json({
                success: false,
                message: 'Please provide from, to, amount, and secret'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        if (from === to) {
            return res.status(400).json({
                success: false,
                message: 'Cannot transfer to the same account'
            });
        }

        // Find both accounts
        const fromAccount = await BankAccount.findOne({ accountNumber: from, isActive: true }).select('+secret');
        const toAccount = await BankAccount.findOne({ accountNumber: to, isActive: true });

        if (!fromAccount) {
            return res.status(404).json({
                success: false,
                message: 'Source account not found'
            });
        }

        if (!toAccount) {
            return res.status(404).json({
                success: false,
                message: 'Destination account not found'
            });
        }

        // Verify secret
        const isMatch = await fromAccount.compareSecret(secret);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid secret for source account'
            });
        }

        // Check sufficient balance
        if (fromAccount.balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance',
                data: {
                    required: amount,
                    available: fromAccount.balance
                }
            });
        }

        // Generate transaction ID
        const transactionId = `TXN${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;

        // Perform transfer
        fromAccount.balance -= amount;
        toAccount.balance += amount;

        // Add transaction records
        fromAccount.addTransaction({
            transactionId,
            type: 'debit',
            amount,
            fromAccount: from,
            toAccount: to,
            description: description || 'Transfer'
        });

        toAccount.addTransaction({
            transactionId,
            type: 'credit',
            amount,
            fromAccount: from,
            toAccount: to,
            description: description || 'Transfer'
        });

        // Save both accounts
        await fromAccount.save();
        await toAccount.save();

        res.json({
            success: true,
            message: 'Transfer successful',
            data: {
                transactionId,
                from: {
                    accountNumber: from,
                    newBalance: fromAccount.balance
                },
                to: {
                    accountNumber: to,
                    newBalance: toAccount.balance
                },
                amount,
                description: description || 'Transfer',
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing transfer',
            error: error.message
        });
    }
};

// @desc    Get transaction history
// @route   GET /bank/transactions/:accountNumber
// @access  Public (called by LMS API)
exports.getTransactions = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const { limit = 50 } = req.query;

        const account = await BankAccount.findOne({ accountNumber, isActive: true });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Bank account not found'
            });
        }

        // Get latest transactions
        const transactions = account.transactions
            .sort((a, b) => b.date - a.date)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: {
                accountNumber: account.accountNumber,
                accountHolder: account.accountHolder,
                currentBalance: account.balance,
                transactions
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

module.exports = exports;
