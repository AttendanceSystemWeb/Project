import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin APIs
export const adminAPI = {
  // Classes
  getClasses: () => api.get('/admin/classes'),
  createClass: (data) => api.post('/admin/classes', data),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),

  // Subjects
  getSubjects: () => api.get('/admin/subjects'),
  createSubject: (data) => api.post('/admin/subjects', data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),

  // Students
  getStudents: (classId) => api.get('/admin/students', { params: { classId } }),
  createStudent: (data) => api.post('/admin/students', data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),

  // Teachers
  getTeachers: () => api.get('/admin/teachers'),
  createTeacher: (data) => api.post('/admin/teachers', data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),

  // Assignments
  getAssignments: (teacherId) => api.get('/admin/assignments', { params: { teacherId } }),
  createAssignment: (data) => api.post('/admin/assignments', data),
  deleteAssignment: (id) => api.delete(`/admin/assignments/${id}`),

  // Attendance
  getAttendanceRecords: (filters) => api.get('/admin/attendance', { params: filters }),
  getStudentAttendanceStats: (filters) => api.get('/admin/attendance/student-stats', { params: filters })
};

// Teacher APIs
export const teacherAPI = {
  getAssignments: () => api.get('/teacher/assignments'),
  getStudents: (classId, subjectId) => api.get('/teacher/students', { params: { classId, subjectId } }),
  submitAttendance: (data) => api.post('/teacher/attendance', data),
  getAttendanceHistory: (filters) => api.get('/teacher/attendance/history', { params: filters })
};

// User Management APIs
export const userAPI = {
  getUserInfo: (userId) => api.get(`/users/${userId}`),
  updateCredentials: (userId, data) => api.put(`/users/${userId}/credentials`, data)
};

export default api;

