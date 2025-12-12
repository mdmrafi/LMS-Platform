# API Testing Guide

Quick reference for testing the LMS API endpoints.

## Setup

1. Start MongoDB
2. Start the server: `npm run dev`
3. Seed database: `node utils/seed.js` (optional)

## Test Credentials (After Seeding)

### Instructors
- `instructor1@example.com` / `password123`
- `instructor2@example.com` / `password123`
- `instructor3@example.com` / `password123`

### Learners
- `learner1@example.com` / `password123`
- `learner2@example.com` / `password123`

### Bank Secret
- All users: `secret123`

---

## Test Scenarios

### Scenario 1: Learner Flow

#### 1. Register as Learner
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Learner",
  "email": "testlearner@example.com",
  "password": "password123",
  "role": "learner"
}
```

#### 2. Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "testlearner@example.com",
  "password": "password123"
}
```
**Save the token from response!**

#### 3. Setup Bank Account
```http
POST http://localhost:5000/api/bank/setup
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "secret": "mysecret123"
}
```

#### 4. Get All Courses
```http
GET http://localhost:5000/api/courses
```

#### 5. Purchase a Course
```http
POST http://localhost:5000/api/transactions/purchase
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "courseId": "COURSE_ID_FROM_STEP_4",
  "bankSecret": "mysecret123"
}
```
**Save the validationToken for instructor!**

#### 6. View Course Materials
```http
GET http://localhost:5000/api/courses/COURSE_ID
Authorization: Bearer YOUR_TOKEN
```

#### 7. Update Progress
```http
PUT http://localhost:5000/api/courses/COURSE_ID/progress
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "progress": 100
}
```

#### 8. Generate Certificate
```http
POST http://localhost:5000/api/certificates/generate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "courseId": "COURSE_ID"
}
```

#### 9. Download Certificate
```http
GET http://localhost:5000/api/certificates/CERTIFICATE_ID/download
Authorization: Bearer YOUR_TOKEN
```

---

### Scenario 2: Instructor Flow

#### 1. Register as Instructor
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Instructor",
  "email": "testinstructor@example.com",
  "password": "password123",
  "role": "instructor"
}
```

#### 2. Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "testinstructor@example.com",
  "password": "password123"
}
```

#### 3. Setup Bank Account
```http
POST http://localhost:5000/api/bank/setup
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "secret": "instructorsecret"
}
```

#### 4. Create Course (Receive Reward)
```http
POST http://localhost:5000/api/courses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "My Awesome Course",
  "description": "Learn awesome things",
  "price": 3999,
  "duration": 30,
  "category": "Programming",
  "level": "Beginner"
}
```

#### 5. Add Material to Course
```http
POST http://localhost:5000/api/courses/COURSE_ID/materials
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Introduction Lesson",
  "type": "video",
  "content": "https://example.com/video.mp4",
  "duration": 15,
  "order": 1
}
```

#### 6. Check Pending Transactions
```http
GET http://localhost:5000/api/transactions/instructor/pending
Authorization: Bearer YOUR_TOKEN
```

#### 7. Validate and Claim Payment
```http
POST http://localhost:5000/api/transactions/TRANSACTION_ID/validate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "validationToken": "VALIDATION_TOKEN_FROM_PURCHASE"
}
```

#### 8. Check Bank Balance
```http
GET http://localhost:5000/api/bank/balance
Authorization: Bearer YOUR_TOKEN
```

---

## Quick Commands

### View Dashboard Stats
```http
GET http://localhost:5000/api/users/dashboard
Authorization: Bearer YOUR_TOKEN
```

### Get My Profile
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN
```

### Get Bank Transactions
```http
GET http://localhost:5000/api/bank/transactions
Authorization: Bearer YOUR_TOKEN
```

### Get Enrolled Courses (Learner)
```http
GET http://localhost:5000/api/courses/learner/enrolled
Authorization: Bearer YOUR_TOKEN
```

### Get My Courses (Instructor)
```http
GET http://localhost:5000/api/courses/instructor/my-courses
Authorization: Bearer YOUR_TOKEN
```

---

## Expected Flow for Demo

1. **Register 1 Learner & 1 Instructor**
2. **Setup bank accounts for both**
3. **Instructor creates a course** → Gets ₹5000 reward
4. **Instructor adds materials to course**
5. **Learner browses courses**
6. **Learner purchases course** → Money deducted
7. **Instructor sees pending transaction**
8. **Instructor validates transaction** → Gets 70% payment
9. **Learner accesses course materials**
10. **Learner updates progress to 100%**
11. **Learner generates certificate**
12. **Show dashboard stats for both users**

---

## Common Issues

### "Bank account not set up"
→ Call `/api/bank/setup` first

### "Invalid bank secret"
→ Use the secret you set during bank setup

### "Course not found"
→ Check if you're using the correct course ID

### "Not enrolled in course"
→ Purchase the course first

### "Progress must be 100%"
→ Update progress to 100 before generating certificate

---

## Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token/credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Tips for Showcasing

1. **Have Postman/Thunder Client ready** with pre-configured requests
2. **Run seed script** before demo for sample data
3. **Open MongoDB Compass** to show database in real-time
4. **Keep terminal visible** to show server logs
5. **Prepare to explain**:
   - JWT authentication
   - Payment flow (Learner → LMS → Instructor)
   - Transaction validation mechanism
   - Certificate generation logic
   - Database schema relationships

---

## Postman Collection

Create a collection with these folders:
1. **Auth** (register, login, me)
2. **Bank** (setup, balance, transactions)
3. **Courses** (CRUD operations)
4. **Transactions** (purchase, validate)
5. **Certificates** (generate, download)
6. **Users** (profile, dashboard)

Set environment variables:
- `base_url`: `http://localhost:5000/api`
- `token`: (update after login)
- `course_id`: (update after getting courses)
- `transaction_id`: (update after purchase)

---

**Ready to showcase! 🎉**
