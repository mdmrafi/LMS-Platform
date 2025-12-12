const axios = require('axios');

const BANK_API_URL = process.env.BANK_API_URL || 'http://localhost:5001/bank';

/**
 * Bank Service HTTP Client
 * Communicates with the standalone bank microservice
 */
class BankService {

    /**
     * Register a new bank account
     */
    static async registerAccount(accountData) {
        try {
            const response = await axios.post(`${BANK_API_URL}/register`, {
                accountNumber: accountData.accountNumber,
                accountHolder: accountData.accountHolder,
                accountType: accountData.accountType,
                initialBalance: accountData.initialBalance,
                secret: accountData.secret
            });

            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Bank Service - Register Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to register bank account',
                error: error.response?.data
            };
        }
    }

    /**
     * Get account balance
     */
    static async getBalance(accountNumber) {
        try {
            const response = await axios.get(`${BANK_API_URL}/balance/${accountNumber}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Bank Service - Get Balance Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get balance',
                error: error.response?.data
            };
        }
    }

    /**
     * Verify transaction with secret PIN
     */
    static async verifyTransaction(accountNumber, secret) {
        try {
            const response = await axios.post(`${BANK_API_URL}/verify-transaction`, {
                accountNumber,
                secret
            });

            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Bank Service - Verify Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to verify transaction',
                error: error.response?.data
            };
        }
    }

    /**
     * Transfer money between accounts
     */
    static async transfer(transferData) {
        try {
            const response = await axios.post(`${BANK_API_URL}/transfer`, {
                from: transferData.from,
                to: transferData.to,
                amount: transferData.amount,
                secret: transferData.secret,
                description: transferData.description
            });

            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Bank Service - Transfer Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to transfer money',
                error: error.response?.data
            };
        }
    }

    /**
     * Get transaction history
     */
    static async getTransactionHistory(accountNumber, limit = 50) {
        try {
            const response = await axios.get(`${BANK_API_URL}/transactions/${accountNumber}?limit=${limit}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Bank Service - Get Transactions Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get transactions',
                error: error.response?.data
            };
        }
    }

    /**
     * Check if bank service is healthy
     */
    static async healthCheck() {
        try {
            const response = await axios.get(`${BANK_API_URL.replace('/bank', '')}/health`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Bank Service - Health Check Error:', error.message);
            return {
                success: false,
                message: 'Bank service is not available'
            };
        }
    }
}

module.exports = BankService;
