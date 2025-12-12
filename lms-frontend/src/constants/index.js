// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// User Roles
export const USER_ROLES = {
    LEARNER: 'learner',
    INSTRUCTOR: 'instructor'
};

// Route Paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    COURSES: '/courses',
    MY_COURSES: '/my-courses',
    COURSE_DETAIL: '/course/:id',
    CREATE_COURSE: '/create-course',
    TRANSACTIONS: '/transactions',
    BANK_ACCOUNT: '/bank-account'
};

// Course Upload Reward
export const COURSE_UPLOAD_REWARD = 5000;

// Initial Balances
export const INITIAL_BALANCE = {
    LEARNER: 10000,
    INSTRUCTOR: 0,
    LMS: 1000000
};
