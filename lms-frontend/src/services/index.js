import api from '../config/api.config';

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/auth/me'),
};

export const courseService = {
    getAllCourses: () => api.get('/courses'),
    getCourse: (id) => api.get(`/courses/${id}`),
    createCourse: (courseData) => api.post('/courses', courseData),
    addMaterial: (courseId, materialData) => api.post(`/courses/${courseId}/materials`, materialData),
    getMyCourses: () => api.get('/courses/learner/enrolled'), // For learners
    getInstructorCourses: () => api.get('/courses/instructor/my-courses'), // For instructors
    updateProgress: (courseId, progress) => api.put(`/courses/${courseId}/progress`, { progress }),
    markMaterialCompleted: (courseId, materialId) => api.post(`/courses/${courseId}/materials/${materialId}/complete`),
};

export const bankService = {
    setupAccount: (bankData) => api.post('/bank/setup', bankData),
    getBalance: () => api.get('/bank/balance'),
    processTransaction: (transactionData) => api.post('/bank/transaction', transactionData),
    getTransactionHistory: () => api.get('/bank/transactions'),
};

export const transactionService = {
    purchaseCourse: (purchaseData) => api.post('/transactions/purchase', purchaseData),
    getMyTransactions: () => api.get('/transactions'),
    getPendingTransactions: () => api.get('/transactions/instructor/pending'),
    validateTransaction: (transactionId, validationData) => api.post(`/transactions/${transactionId}/validate`, validationData),
};

export const certificateService = {
    generateCertificate: (courseId) => api.post('/certificates/generate', { courseId }),
    getMyCertificates: () => api.get('/certificates'),
    downloadCertificate: (certificateId) => api.get(`/certificates/${certificateId}/download`),
};

export const userService = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (userData) => api.put('/users/profile', userData),
    getDashboardStats: () => api.get('/users/dashboard'),
};
