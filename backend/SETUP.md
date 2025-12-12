# Quick Setup Guide

Follow these steps to get the LMS API up and running quickly.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup MongoDB

Make sure MongoDB is installed and running on your system.

**Windows:**
- MongoDB should be running as a service, or
- Run `mongod` in a separate terminal

**Check if MongoDB is running:**
```bash
mongo --version
```

## Step 3: Configure Environment

The `.env` file is already created with default values. You can modify if needed:
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `LMS_BANK_ACCOUNT`: LMS organization bank account number
- `LMS_INITIAL_BALANCE`: Starting balance for LMS
- `COURSE_UPLOAD_REWARD`: Reward amount for course upload

## Step 4: Seed Database (Optional but Recommended)

This creates sample instructors, learners, and courses:

```bash
node utils/seed.js
```

**Sample credentials after seeding:**
- Instructors: `instructor1@example.com` / `password123`
- Learners: `learner1@example.com` / `password123`
- Bank Secret: `secret123`

## Step 5: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:5000`

## Step 6: Test the API

1. **Open your API client** (Postman, Thunder Client, or Insomnia)

2. **Test basic endpoint:**
   ```
   GET http://localhost:5000
   ```
   Should return a welcome message.

3. **Try logging in** with seeded data:
   ```
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json

   {
     "email": "learner1@example.com",
     "password": "password123"
   }
   ```

4. **Use the token** from login response for authenticated requests:
   ```
   Authorization: Bearer <your_token_here>
   ```

## Quick Test Flow

### As a Learner:
1. Login → Get token
2. Setup bank account
3. Browse courses
4. Purchase a course
5. Update progress
6. Generate certificate

### As an Instructor:
1. Login → Get token
2. Setup bank account
3. Create a course (get reward)
4. Add materials
5. Check pending transactions
6. Validate and claim payments

## Folder Structure

```
Backend-API project/
├── controllers/       # Business logic
├── models/           # Database schemas
├── routes/           # API endpoints
├── middleware/       # Auth & validation
├── utils/            # Helper functions
├── server.js         # Entry point
├── .env              # Environment variables
└── package.json      # Dependencies
```

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Seed database
node utils/seed.js

# Check MongoDB connection
mongo
```

## Troubleshooting

### Port Already in Use
If port 5000 is busy, change it in `.env`:
```env
PORT=3000
```

### MongoDB Connection Error
- Make sure MongoDB is running
- Check if connection string in `.env` is correct
- Default: `mongodb://localhost:27017/lms_database`

### Cannot Find Module
```bash
npm install
```

### JWT Token Expired
Login again to get a new token.

## API Documentation

- Full API docs: See `README.md`
- Testing guide: See `API_TESTING.md`

## Demo Preparation

1. ✅ Install dependencies
2. ✅ Start MongoDB
3. ✅ Seed database
4. ✅ Start server
5. ✅ Test with Postman
6. ✅ Prepare to explain code

## Important Features to Highlight

1. **Authentication System**
   - JWT-based auth
   - Role-based access control

2. **Payment Flow**
   - Learner → LMS → Instructor
   - Transaction validation
   - 70/30 split

3. **Course Management**
   - CRUD operations
   - Material types (text, video, audio, MCQ)
   - Progress tracking

4. **Certificate System**
   - Auto-generation on completion
   - Public verification
   - Download feature

5. **Bank Simulation**
   - Account management
   - Transaction history
   - Balance tracking

## Ready for Showcase! 🚀

Your LMS API is now ready for demonstration. Good luck with your project showcasing!

---

For detailed API documentation, refer to `README.md`
