# Bank API Microservice

A simulated bank API for the LMS payment system. This service runs independently from the main LMS API and handles all banking operations.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB running on localhost

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the service**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The bank service will run on `http://localhost:5001`

## 📚 API Endpoints

### Base URL
```
http://localhost:5001/bank
```

### 1. Register Bank Account
**POST** `/bank/register`

Create a new bank account.

**Request Body:**
```json
{
  "accountNumber": "LMS000001",
  "accountHolder": "LMS Organization",
  "accountType": "lms",
  "initialBalance": 1000000,
  "secret": "lms_secret_pin"
}
```

**Account Types:**
- `lms` - LMS Organization (default balance: 1,000,000)
- `learner` - Student accounts (default balance: 10,000)
- `instructor` - Teacher accounts (default balance: 0)

**Response:**
```json
{
  "success": true,
  "message": "Bank account created successfully",
  "data": {
    "accountNumber": "LMS000001",
    "accountHolder": "LMS Organization",
    "accountType": "lms",
    "balance": 1000000
  }
}
```

### 2. Get Balance
**GET** `/bank/balance/:accountNumber`

Get current balance of an account.

**Example:** `GET /bank/balance/LMS000001`

**Response:**
```json
{
  "success": true,
  "data": {
    "accountNumber": "LMS000001",
    "accountHolder": "LMS Organization",
    "balance": 1000000
  }
}
```

### 3. Verify Transaction
**POST** `/bank/verify-transaction`

Verify account ownership with secret PIN before transactions.

**Request Body:**
```json
{
  "accountNumber": "LRN123456",
  "secret": "user_secret_pin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Secret verified successfully",
  "data": {
    "accountNumber": "LRN123456",
    "balance": 10000
  }
}
```

### 4. Transfer Money
**POST** `/bank/transfer`

Transfer money between accounts.

**Request Body:**
```json
{
  "from": "LRN123456",
  "to": "LMS000001",
  "amount": 2999,
  "secret": "user_secret_pin",
  "description": "Course purchase"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "transactionId": "TXN8A3F9C2B1...",
    "from": {
      "accountNumber": "LRN123456",
      "newBalance": 7001
    },
    "to": {
      "accountNumber": "LMS000001",
      "newBalance": 1002999
    },
    "amount": 2999,
    "description": "Course purchase",
    "timestamp": "2025-12-11T18:30:00.000Z"
  }
}
```

### 5. Get Transaction History
**GET** `/bank/transactions/:accountNumber?limit=50`

Get transaction history for an account.

**Example:** `GET /bank/transactions/LRN123456?limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "accountNumber": "LRN123456",
    "accountHolder": "John Doe",
    "currentBalance": 7001,
    "transactions": [
      {
        "transactionId": "TXN8A3F9C2B1...",
        "type": "debit",
        "amount": 2999,
        "balanceAfter": 7001,
        "fromAccount": "LRN123456",
        "toAccount": "LMS000001",
        "description": "Course purchase",
        "date": "2025-12-11T18:30:00.000Z"
      }
    ]
  }
}
```

## 💡 Usage Flow

### For LMS API Integration:

1. **Create bank account** when user registers
   ```javascript
   POST /bank/register
   ```

2. **Verify secret** before any transaction
   ```javascript
   POST /bank/verify-transaction
   ```

3. **Transfer money** for course purchases
   ```javascript
   POST /bank/transfer
   ```

4. **Check balance** anytime
   ```javascript
   GET /bank/balance/:accountNumber
   ```

## 🔒 Security Features

- **Secret PIN Hashing**: All secrets are hashed using bcrypt
- **Balance Validation**: Prevents overdrafts
- **Transaction Logging**: Complete audit trail
- **Account Verification**: Secret verification required for transfers

## 📊 Database Schema

```javascript
{
  accountNumber: String (unique),
  accountHolder: String,
  accountType: String (enum),
  balance: Number (min: 0),
  secret: String (hashed),
  isActive: Boolean,
  transactions: [{
    transactionId: String,
    type: String ('credit' | 'debit'),
    amount: Number,
    balanceAfter: Number,
    fromAccount: String,
    toAccount: String,
    description: String,
    date: Date
  }]
}
```

## 🧪 Testing

### Using cURL:

```bash
# Register account
curl -X POST http://localhost:5001/bank/register \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "TEST001",
    "accountHolder": "Test User",
    "accountType": "learner",
    "secret": "test123"
  }'

# Transfer money
curl -X POST http://localhost:5001/bank/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "from": "TEST001",
    "to": "LMS000001",
    "amount": 100,
    "secret": "test123",
    "description": "Test transfer"
  }'

# Check balance
curl http://localhost:5001/bank/balance/TEST001
```

## 🔧 Environment Variables

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/bank_database
NODE_ENV=development
```

## 📝 Notes

- The bank service runs on port **5001** (main LMS API runs on 5000)
- Uses a separate MongoDB database (`bank_database`)
- All monetary amounts are in integer format (e.g., 2999 = ₹29.99)
- Transaction IDs are unique and auto-generated

---

**Bank Service Status: ✅ Running**
