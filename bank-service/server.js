const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const bankRoutes = require('./routes/bank.routes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Bank Service: Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('❌ Bank Service: MongoDB connection error:', err);
        process.exit(1);
    });

// Routes
app.use('/bank', bankRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        service: 'Bank API Service',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            register: 'POST /bank/register',
            balance: 'GET /bank/balance/:accountNumber',
            verifyTransaction: 'POST /bank/verify-transaction',
            transfer: 'POST /bank/transfer',
            transactions: 'GET /bank/transactions/:accountNumber'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🏦 Bank Service is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
