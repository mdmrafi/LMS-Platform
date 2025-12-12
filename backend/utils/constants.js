// Application constants

module.exports = {
  // User roles
  USER_ROLES: {
    LEARNER: 'learner',
    INSTRUCTOR: 'instructor',
    ADMIN: 'admin'
  },

  // Transaction types
  TRANSACTION_TYPES: {
    COURSE_PURCHASE: 'course_purchase',
    INSTRUCTOR_PAYMENT: 'instructor_payment',
    COURSE_UPLOAD_REWARD: 'course_upload_reward'
  },

  // Transaction status
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    VALIDATED: 'validated'
  },

  // Course categories
  COURSE_CATEGORIES: [
    'Programming',
    'Design',
    'Business',
    'Data Science',
    'Other'
  ],

  // Course levels
  COURSE_LEVELS: {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced'
  },

  // Material types
  MATERIAL_TYPES: {
    TEXT: 'text',
    AUDIO: 'audio',
    VIDEO: 'video',
    MCQ: 'mcq'
  },

  // Certificate grades
  CERTIFICATE_GRADES: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'Pass'],

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,

  // Payment split
  INSTRUCTOR_PAYMENT_PERCENTAGE: 0.7, // 70% to instructor
  LMS_COMMISSION_PERCENTAGE: 0.3, // 30% to LMS

  // System limits
  MAX_COURSES: 5,
  MAX_INSTRUCTORS: 3,

  // Account prefixes
  ACCOUNT_PREFIXES: {
    LEARNER: 'LRN',
    INSTRUCTOR: 'INS',
    LMS: 'LMS'
  }
};
