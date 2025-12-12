# Project Structure & Architecture

## Directory Tree

```
Backend-API project/
│
├── 📁 controllers/              # Request handlers & business logic
│   ├── auth.controller.js       # User registration, login, profile
│   ├── bank.controller.js       # Bank operations, transactions
│   ├── certificate.controller.js # Certificate generation & verification
│   ├── course.controller.js     # Course CRUD, materials, enrollment
│   └── transaction.controller.js # Purchase, validation, payment flow
│
├── 📁 models/                   # MongoDB schemas & models
│   ├── BankAccount.model.js     # Bank account schema
│   ├── Certificate.model.js     # Certificate schema
│   ├── Course.model.js          # Course & material schema
│   ├── Transaction.model.js     # Transaction records
│   └── User.model.js            # User (learner/instructor) schema
│
├── 📁 routes/                   # API route definitions
│   ├── auth.routes.js           # Auth endpoints
│   ├── bank.routes.js           # Bank endpoints
│   ├── certificate.routes.js   # Certificate endpoints
│   ├── course.routes.js         # Course endpoints
│   ├── transaction.routes.js   # Transaction endpoints
│   └── user.routes.js           # User profile endpoints
│
├── 📁 middleware/               # Custom middleware
│   ├── auth.middleware.js       # JWT verification, role authorization
│   └── validation.middleware.js # Input validation error handling
│
├── 📁 utils/                    # Helper functions & utilities
│   ├── apiResponse.js           # Standard API response formatter
│   ├── constants.js             # Application constants
│   ├── initializeBank.js        # LMS bank account initializer
│   └── seed.js                  # Database seeding script
│
├── 📁 node_modules/             # Dependencies (auto-generated)
│
├── 📄 server.js                 # Application entry point
├── 📄 package.json              # Project metadata & dependencies
├── 📄 package-lock.json         # Dependency lock file
├── 📄 .env                      # Environment variables (gitignored)
├── 📄 .env.example              # Environment template
├── 📄 .gitignore                # Git ignore rules
├── 📄 README.md                 # Complete API documentation
├── 📄 API_TESTING.md            # Testing guide
└── 📄 SETUP.md                  # Quick setup instructions
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│                   (Postman / Browser)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER                           │
│                      (server.js)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐   ┌──────────┐   ┌──────────┐
    │  CORS   │   │   JSON   │   │   URL    │
    │Middleware│   │  Parser  │   │ Encoded  │
    └─────────┘   └──────────┘   └──────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       ROUTES                                 │
│  /api/auth  /api/courses  /api/bank  /api/transactions     │
│  /api/certificates  /api/users                              │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐   ┌──────────┐   ┌──────────┐
    │  Auth   │   │Validation│   │   Role   │
    │Middleware│   │Middleware│   │  Check   │
    └─────────┘   └──────────┘   └──────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLERS                               │
│  Auth  │  Course  │  Bank  │  Transaction  │  Certificate  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      MODELS                                  │
│  User  │  Course  │  BankAccount  │  Transaction  │  Cert  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  MONGODB DATABASE                            │
│     Collections: users, courses, bankaccounts,              │
│                  transactions, certificates                  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Registration & Authentication Flow

```
[Client] 
   │
   ├─→ POST /api/auth/register
   │     ↓
   │   [Validation Middleware]
   │     ↓
   │   [Auth Controller - Register]
   │     ↓
   │   [User Model - Hash Password]
   │     ↓
   │   [MongoDB - Save User]
   │     ↓
   │   [Generate JWT Token]
   │     ↓
   └─← Response: { token, user }

[Client]
   │
   ├─→ POST /api/auth/login
   │     ↓
   │   [Auth Controller - Login]
   │     ↓
   │   [User Model - Compare Password]
   │     ↓
   │   [Generate JWT Token]
   │     ↓
   └─← Response: { token, user }
```

### 2. Course Purchase Flow

```
[Learner]
   │
   ├─→ POST /api/transactions/purchase
   │     ↓
   │   [Auth Middleware - Verify JWT]
   │     ↓
   │   [Authorize - Check Learner Role]
   │     ↓
   │   [Transaction Controller]
   │     ↓
   │   [Verify Bank Secret]
   │     ↓
   │   [Check Course Availability]
   │     ↓
   │   [Check Balance]
   │     ↓
   │   ┌─────────────────────────┐
   │   │ Deduct from Learner     │
   │   │ Add to LMS             │
   │   │ Create Transaction     │
   │   │ Enroll in Course       │
   │   │ Generate Validation    │
   │   │ Token for Instructor   │
   │   └─────────────────────────┘
   │     ↓
   └─← Response: { transaction, validationToken }

[Instructor]
   │
   ├─→ POST /api/transactions/:id/validate
   │     ↓
   │   [Auth Middleware]
   │     ↓
   │   [Authorize - Check Instructor]
   │     ↓
   │   [Verify Validation Token]
   │     ↓
   │   ┌─────────────────────────┐
   │   │ Deduct 70% from LMS    │
   │   │ Add to Instructor      │
   │   │ Update Transaction     │
   │   └─────────────────────────┘
   │     ↓
   └─← Response: { payment details }
```

### 3. Certificate Generation Flow

```
[Learner]
   │
   ├─→ PUT /api/courses/:id/progress
   │     ↓
   │   [Update Progress to 100%]
   │     ↓
   │   [Mark Course as Completed]
   │
   ├─→ POST /api/certificates/generate
   │     ↓
   │   [Check Course Completion]
   │     ↓
   │   [Certificate Controller]
   │     ↓
   │   ┌─────────────────────────┐
   │   │ Generate Certificate ID │
   │   │ Create Certificate     │
   │   │ Add to User Profile    │
   │   └─────────────────────────┘
   │     ↓
   └─← Response: { certificate }

[Anyone]
   │
   ├─→ GET /api/certificates/verify/:certId
   │     ↓
   │   [Public Access - No Auth]
   │     ↓
   └─← Response: { certificate validity }
```

## Database Relationships

```
┌──────────────┐
│    User      │
├──────────────┤
│ _id (PK)     │──┐
│ name         │  │
│ email        │  │
│ password     │  │
│ role         │  │
│ bankAccount  │  │
│ enrolledCourses│─┼──┐
│ createdCourses │─┼─┐│
│ certificates  │──┼┐││
└──────────────┘  │││││
                  │││││
      ┌───────────┘││││
      ▼            ││││
┌──────────────┐  ││││
│   Course     │  ││││
├──────────────┤  ││││
│ _id (PK)     │◄─┘│││
│ title        │   │││
│ description  │   │││
│ instructor   │───┘││
│ price        │    ││
│ materials[]  │    ││
│ enrolledStudents││ ││
└──────────────┘    ││
                    ││
      ┌─────────────┘│
      ▼              │
┌──────────────┐     │
│ Certificate  │     │
├──────────────┤     │
│ _id (PK)     │◄────┘
│ certificateId│
│ learner      │───┐
│ course       │   │
│ instructor   │   │
└──────────────┘   │
                   │
┌──────────────┐   │
│ Transaction  │   │
├──────────────┤   │
│ _id (PK)     │   │
│ transactionId│   │
│ type         │   │
│ fromAccount  │   │
│ toAccount    │   │
│ amount       │   │
│ learner      │───┘
│ instructor   │
│ course       │
└──────────────┘

┌──────────────┐
│ BankAccount  │
├──────────────┤
│ _id (PK)     │
│ accountNumber│
│ accountHolder│
│ balance      │
│ userId       │───┐
│ transactions[]│  │
└──────────────┘  │
                  │
            Links to User
```

## API Endpoint Structure

```
/api
├── /auth
│   ├── POST   /register        (Public)
│   ├── POST   /login           (Public)
│   └── GET    /me              (Private)
│
├── /users
│   ├── GET    /profile         (Private)
│   ├── PUT    /profile         (Private)
│   └── GET    /dashboard       (Private)
│
├── /courses
│   ├── GET    /                (Public)
│   ├── GET    /:id             (Public/Private)
│   ├── POST   /                (Instructor)
│   ├── PUT    /:id             (Instructor - Own)
│   ├── DELETE /:id             (Instructor - Own)
│   ├── POST   /:id/materials   (Instructor - Own)
│   ├── GET    /instructor/my-courses (Instructor)
│   ├── GET    /learner/enrolled (Learner)
│   └── PUT    /:id/progress    (Learner)
│
├── /bank
│   ├── POST   /setup           (Private)
│   ├── GET    /balance         (Private)
│   ├── POST   /transaction     (Private)
│   ├── GET    /transactions    (Private)
│   └── POST   /validate-transaction (Instructor)
│
├── /transactions
│   ├── POST   /purchase        (Learner)
│   ├── GET    /                (Private)
│   ├── GET    /:id             (Private)
│   ├── GET    /instructor/pending (Instructor)
│   └── POST   /:id/validate    (Instructor)
│
└── /certificates
    ├── POST   /generate        (Learner)
    ├── GET    /                (Learner)
    ├── GET    /:id             (Learner)
    ├── GET    /:id/download    (Learner)
    └── GET    /verify/:certId  (Public)
```

## Security Layers

```
┌────────────────────────────────────┐
│   Layer 1: Input Validation       │
│   express-validator                │
└────────────────────────────────────┘
             ▼
┌────────────────────────────────────┐
│   Layer 2: Authentication          │
│   JWT Token Verification           │
└────────────────────────────────────┘
             ▼
┌────────────────────────────────────┐
│   Layer 3: Authorization           │
│   Role-Based Access Control        │
└────────────────────────────────────┘
             ▼
┌────────────────────────────────────┐
│   Layer 4: Data Encryption         │
│   bcrypt (passwords, secrets)      │
└────────────────────────────────────┘
             ▼
┌────────────────────────────────────┐
│   Layer 5: Database Security       │
│   Mongoose Schema Validation       │
└────────────────────────────────────┘
```

## Payment Transaction States

```
┌─────────────┐
│   PENDING   │ ← Initial state after course purchase
└──────┬──────┘
       │
       │ Instructor validates
       ▼
┌─────────────┐
│  VALIDATED  │ ← Validation token verified
└──────┬──────┘
       │
       │ Payment transferred
       ▼
┌─────────────┐
│  COMPLETED  │ ← Final state
└─────────────┘

Alternative:
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │
       │ Error occurs
       ▼
┌─────────────┐
│   FAILED    │ ← Transaction failed
└─────────────┘
```

## Key Components Explained

### 1. **Models** (Database Schemas)
- Define data structure
- Implement business logic methods
- Handle data validation
- Manage relationships

### 2. **Controllers** (Business Logic)
- Process requests
- Interact with models
- Handle errors
- Send responses

### 3. **Routes** (API Endpoints)
- Define URL patterns
- Apply middleware
- Connect to controllers
- Handle HTTP methods

### 4. **Middleware** (Request Processing)
- Authentication
- Authorization
- Validation
- Error handling

### 5. **Utils** (Helper Functions)
- Reusable code
- Constants
- Database seeding
- Initialization

## Technology Stack

```
┌─────────────────────────────────────┐
│          Backend Framework          │
│         Node.js + Express           │
└─────────────────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│            Database                 │
│           MongoDB                   │
│         (Mongoose ODM)              │
└─────────────────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│         Authentication              │
│  JWT (jsonwebtoken)                │
│  bcryptjs (password hashing)       │
└─────────────────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│          Validation                 │
│      express-validator              │
└─────────────────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│       Other Dependencies            │
│  cors, dotenv, uuid                │
└─────────────────────────────────────┘
```

## Development Workflow

```
1. Start MongoDB
   ↓
2. Start Server (npm run dev)
   ↓
3. Server initializes LMS bank account
   ↓
4. API ready to accept requests
   ↓
5. Test with Postman/Thunder Client
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Scalable structure
- ✅ Easy maintenance
- ✅ Clear data flow
- ✅ Security at multiple layers
- ✅ RESTful design principles
