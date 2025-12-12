const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
// Load environment variables
const result = dotenv.config();
if (result.error) {
  console.error('Error loading .env file:', result.error);
}
console.log('Loaded Env Keys:', Object.keys(process.env).filter(k => k.startsWith('CLOUD') || k.startsWith('MONGO')));
console.log('Cloud Name Check:', process.env.CLOUDINARY_CLOUD_NAME);

// Import routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const bankRoutes = require('./routes/bank.routes');
const transactionRoutes = require('./routes/transaction.routes');
const certificateRoutes = require('./routes/certificate.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    // Initialize LMS bank account
    require('./utils/initializeBank')();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to LMS API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      bank: '/api/bank',
      transactions: '/api/transactions',
      certificates: '/api/certificates',
      users: '/api/users'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR HANDLER:', err);
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
