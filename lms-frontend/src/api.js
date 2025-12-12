import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Course APIs
export const courseAPI = {
  getAllCourses: () => api.get('/courses'),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  addMaterial: (courseId, materialData) => api.post(`/courses/${courseId}/materials`, materialData),
  uploadMaterial: (courseId, formData) => api.post(`/courses/${courseId}/materials/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  removeMaterial: (courseId, materialId) => api.delete(`/courses/${courseId}/materials/${materialId}`),
  getMyCourses: () => api.get('/courses/learner/enrolled'),
  updateProgress: (courseId, materialId) => api.put(`/courses/${courseId}/progress`, { materialId }),
  getMaterialFileUrl: (courseId, materialId) => {
    const token = localStorage.getItem('token');
    return `${API_URL}/courses/${courseId}/materials/${materialId}/file?token=${token}`;
  }
};

// Transaction APIs
export const transactionAPI = {
  purchaseCourse: (purchaseData) => api.post('/transactions/purchase', purchaseData),
  getMyTransactions: () => api.get('/transactions'),
  getPendingTransactions: () => api.get('/transactions/instructor/pending'),
  validateTransaction: (transactionId, validationData) => api.post(`/transactions/${transactionId}/validate`, validationData),
};

// Bank APIs
export const bankAPI = {
  setupAccount: (bankData) => api.post('/bank/setup', bankData),
  getBalance: () => api.get('/bank/balance'),
};

// Certificate APIs
export const certificateAPI = {
  generateCertificate: (courseId) => api.post(`/certificates/generate/${courseId}`),
  getMyCertificates: () => api.get('/certificates/my'),
  downloadCertificate: (certificateId) => api.get(`/certificates/${certificateId}/download`),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/me', userData),
  getDashboardStats: () => api.get('/users/me/dashboard'),
};

export default api;
