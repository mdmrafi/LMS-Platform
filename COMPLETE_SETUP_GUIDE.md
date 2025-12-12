# Complete LMS System Setup Guide

This guide explains how to run the complete LMS system with the bank microservice.

## Architecture

The system consists of three main components:

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Frontend       │─────▶│   Main LMS API   │─────▶│  Bank Service    │
│   (Port 3000)    │      │   (Port 5000)    │      │   (Port 5001)    │
└──────────────────┘      └──────────────────┘      └──────────────────┘
     React + Vite            Node.js + Express       Node.js + Express
                              MongoDB (lms_db)       MongoDB (bank_db)
```

## Prerequisites

- **Node.js** v14 or higher
- **MongoDB** running on localhost (port 27017)
- **npm** or yarn

## Step-by-Step Setup

### 1. Start MongoDB

Make sure MongoDB is running:
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### 2. Install Dependencies

Install dependencies for all three components:

```bash
# Bank Service
cd bank-service
npm install

# Main API
cd ../backend
npm install

# Frontend
cd ../lms-frontend
npm install
```

### 3. Configure Environment Variables

#### Bank Service (.env)
```bash
cd bank-service
# Copy the existing .env or create one:
```
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/bank_database
NODE_ENV=development
BANK_API_KEY=bank_secret_api_key_change_in_production
```

#### Main LMS API (.env)
```bash
cd ../backend
# Update your .env file with:
```
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lms_database
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
BANK_SECRET_KEY=bank_secret_for_transaction_validation
BANK_API_URL=http://localhost:5001/bank
LMS_BANK_ACCOUNT=LMS000001
LMS_INITIAL_BALANCE=1000000
COURSE_UPLOAD_REWARD=5000
```

### 4. Start the Services

**IMPORTANT**: Start services in this order:

#### Terminal 1: Start Bank Service FIRST
```bash
cd bank-service
npm run dev
```

Wait until you see:
```
🏦 Bank Service is running on port 5001
✅ Bank Service: Connected to MongoDB successfully
```

#### Terminal 2: Start Main LMS API
```bash
cd backend
npm run dev
```

Wait until you see:
```
🚀 Server is running on port 5000
✅ Connected to MongoDB successfully
✅ LMS bank account created successfully
   Account Number: LMS000001
   Initial Balance: 1000000
```

#### Terminal 3: Start Frontend
```bash
cd lms-frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Verification

### Check Services are Running

1. **Bank Service Health Check**
   ```bash
   curl http://localhost:5001/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Main API Health Check**
   ```bash
   curl http://localhost:5000/
   ```
   Should return API information

3. **Frontend**
   Open `http://localhost:5173` in your browser

### Test the System

#### Option 1: Use Seed Data
```bash
cd backend
node utils/seed.js
```

This creates:
- 3 instructors (instructor1@example.com, instructor2@example.com, instructor3@example.com)
- 2 learners (learner1@example.com, learner2@example.com)
- 5 sample courses
- All with password: `password123`
- All with bank secret: `secret123`

#### Option 2: Manual Testing

1. **Register a Learner:**
   - Open frontend at http://localhost:5173
   - Click "Register"
   - Fill in details, select "Learner" role
   - Login with credentials

2. **Setup Bank Account:**
   - After login, go to "Bank Account"
   - Enter a secret PIN
   - You'll get 10,000 initial balance

3. **Browse Courses:**
   - Go to "All Courses"
   - Click on any course

4. **Purchase a Course:**
   - Click "Purchase" button
   - Enter your bank secret PIN
   - Money will flow: Learner → LMS

5. **As Instructor:**
   - Register as instructor
   - Setup bank account
   - Create a course (get 5,000 reward)
   - Wait for learner to purchase
   - Validate transaction to claim 70% payment

## Payment Flow Explained

```
1. Learner purchases course (₹2,999)
   ├─→ Bank Service deducts from learner account
   ├─→ Bank Service credits LMS account (₹2,999)
   └─→ LMS creates transaction record

2. Instructor validates transaction
   ├─→ Bank Service deducts from LMS (₹2,099 = 70%)
   ├─→ Bank Service credits instructor account (₹2,099)
   ├─→ LMS keeps 30% commission (₹900)
   └─→ Transaction marked as completed
```

## Directory Structure

```
LMS-Project/
├── bank-service/           # Bank microservice
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── backend/                # Main LMS API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/          # Bank service HTTP client
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── lms-frontend/          # React frontend
    ├── src/
    ├── package.json
    └── vite.config.js
```

## Troubleshooting

### Bank Service Not Available
```
Error: Bank service is not available
```
**Solution**: Make sure bank service is running on port 5001 BEFORE starting main API

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5001

# Kill process (Windows)
taskkill /PID <process_id> /F
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MongoDB URI in .env files
- Try connecting manually: `mongo mongodb://localhost:27017`

### CORS Errors
- Make sure CORS is enabled in both backend services
- Check that frontend is accessing correct API URLs

## Testing Scenarios

### Complete Learner Flow
1. Register → Login
2. Setup bank account (gets ₹10,000)
3. Browse courses
4. Purchase course (e.g., ₹2,999)
5. Complete course (100% progress)
6. Generate certificate

### Complete Instructor Flow
1. Register → Login
2. Setup bank account (gets ₹0)
3. Create course (gets ₹5,000 reward)
4. Add materials 
5. Wait for purchase
6. View pending transactions
7. Validate transaction (gets 70%)
8. Check bank balance

### Organization Verification
1. Check LMS account balance (should decrease after payouts)
2. View total transactions
3. Verify 30% commission retained

## API Endpoints Quick Reference

### Bank Service (Port 5001)
- `POST /bank/register` - Create account
- `GET /bank/balance/:accountNumber` - Get balance
- `POST /bank/transfer` - Transfer money
- `GET /bank/transactions/:accountNumber` - Get history

### Main LMS API (Port 5000)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/bank/setup` - Setup bank account
- `POST /api/transactions/purchase` - Purchase course
- `POST /api/certificates/generate` - Generate certificate

## Database Collections

### Bank Database (bank_database)
- `bankaccounts` - All bank accounts

### LMS Database (lms_database)
- `users` - Users (learners, instructors)
- `courses` - Courses with materials
- `transactions` - Purchase records
- `certificates` - Generated certificates

## Next Steps

1. ✅ Start all three services
2. ✅ Verify health checks
3. ✅ Run seed script or test manually
4. ✅ Test complete user flows
5. ✅ Check database records

---

**Happy Testing! 🚀**
