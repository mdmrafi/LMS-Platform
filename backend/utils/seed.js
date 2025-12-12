// Database seeding script for initial data
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const User = require('../models/User.model');
const Course = require('../models/Course.model');

dotenv.config();

// Bank API URL
const BANK_API_URL = process.env.BANK_API_URL || 'http://localhost:5001';

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Instructor',
    email: 'instructor1@example.com',
    password: 'password123',
    role: 'instructor'
  },
  {
    name: 'Jane Instructor',
    email: 'instructor2@example.com',
    password: 'password123',
    role: 'instructor'
  },
  {
    name: 'Bob Instructor',
    email: 'instructor3@example.com',
    password: 'password123',
    role: 'instructor'
  },
  {
    name: 'Alice Learner',
    email: 'learner1@example.com',
    password: 'password123',
    role: 'learner'
  },
  {
    name: 'Charlie Learner',
    email: 'learner2@example.com',
    password: 'password123',
    role: 'learner'
  }
];

const sampleCourses = [
  {
    title: 'Introduction to JavaScript',
    description: 'Learn the fundamentals of JavaScript programming language',
    price: 2999,
    duration: 40,
    category: 'Programming',
    level: 'Beginner',
    materials: [
      {
        title: 'Introduction to Variables',
        type: 'video',
        content: 'https://example.com/videos/js-variables.mp4',
        duration: 15,
        order: 1
      },
      {
        title: 'Understanding Functions',
        type: 'text',
        content: 'Functions are reusable blocks of code...',
        duration: 10,
        order: 2
      },
      {
        title: 'JavaScript Quiz 1',
        type: 'mcq',
        content: JSON.stringify([
          { question: 'What is a variable?', options: ['A', 'B', 'C', 'D'], answer: 'A' }
        ]),
        duration: 5,
        order: 3
      }
    ]
  },
  {
    title: 'Web Design Fundamentals',
    description: 'Master the basics of modern web design',
    price: 3499,
    duration: 35,
    category: 'Design',
    level: 'Beginner',
    materials: [
      {
        title: 'Color Theory',
        type: 'video',
        content: 'https://example.com/videos/color-theory.mp4',
        duration: 20,
        order: 1
      }
    ]
  },
  {
    title: 'Data Science with Python',
    description: 'Learn data analysis and machine learning with Python',
    price: 4999,
    duration: 60,
    category: 'Data Science',
    level: 'Intermediate',
    materials: []
  },
  {
    title: 'Business Strategy 101',
    description: 'Essential business strategy concepts for entrepreneurs',
    price: 3999,
    duration: 30,
    category: 'Business',
    level: 'Beginner',
    materials: []
  },
  {
    title: 'Advanced React Development',
    description: 'Build complex applications with React and modern tools',
    price: 5499,
    duration: 50,
    category: 'Programming',
    level: 'Advanced',
    materials: []
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});

    console.log('Cleared existing data');

    // Create LMS bank account via Bank API
    try {
      await axios.post(`${BANK_API_URL}/bank/register`, {
        accountNumber: process.env.LMS_BANK_ACCOUNT,
        accountHolder: 'LMS Organization',
        accountType: 'lms',
        initialBalance: parseFloat(process.env.LMS_INITIAL_BALANCE) || 1000000,
        secret: process.env.BANK_SECRET_KEY
      });
      console.log('✅ Created LMS bank account via Bank API');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  LMS bank account already exists');
      } else {
        console.error('❌ Error creating LMS account:', error.response?.data || error.message);
      }
    }

    // Create users
    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Setup bank accounts for users via Bank API
    for (const user of createdUsers) {
      const accountNumber = user.generateAccountNumber();
      const initialBalance = user.role === 'learner' ? 10000 : 0;

      try {
        // Register account in Bank Service
        await axios.post(`${BANK_API_URL}/bank/register`, {
          accountNumber,
          accountHolder: user.name,
          accountType: user.role,
          initialBalance,
          secret: 'secret123' // Default secret for all test users
        });

        // Update user with bank details
        user.bankAccount.accountNumber = accountNumber;
        user.bankAccount.balance = initialBalance;
        user.bankAccount.secret = 'secret123'; // Will be hashed in user model
        await user.save();

        console.log(`✅ Created bank account for ${user.name} (${accountNumber})`);
      } catch (error) {
        console.error(`❌ Error creating bank account for ${user.name}:`, error.response?.data || error.message);
      }
    }

    // Create courses (assign to instructors)
    const instructors = createdUsers.filter(u => u.role === 'instructor');

    for (let i = 0; i < sampleCourses.length; i++) {
      const instructor = instructors[i % instructors.length];
      const courseData = {
        ...sampleCourses[i],
        instructor: instructor._id,
        instructorName: instructor.name
      };

      const course = await Course.create(courseData);
      instructor.createdCourses.push(course._id);
      await instructor.save();

      console.log(`Created course: ${course.title}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample Credentials:');
    console.log('Instructor 1: instructor1@example.com / password123');
    console.log('Instructor 2: instructor2@example.com / password123');
    console.log('Instructor 3: instructor3@example.com / password123');
    console.log('Learner 1: learner1@example.com / password123');
    console.log('Learner 2: learner2@example.com / password123');
    console.log('\nBank Secret for all users: secret123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
