import { API_URL } from '../config';

// Fetch-based API client (more compatible with ad blockers than Axios/XMLHttpRequest)
const fetchAPI = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Prevent caching
    cache: 'no-store',
  };

  // Add cache-busting timestamp for GET requests
  if (!options.method || options.method === 'GET') {
    const separator = endpoint.includes('?') ? '&' : '?';
    endpoint = `${endpoint}${separator}_t=${Date.now()}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();
    
    // Return in Axios-like format for compatibility
    return { data };
  } catch (error) {
    // Detect network/CORS errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      console.error('Network error - may be blocked by ad blocker:', error);
      // Store error for UI to display
      if (!sessionStorage.getItem('adBlockerWarningShown')) {
        sessionStorage.setItem('adBlockerWarning', 'true');
        sessionStorage.setItem('adBlockerWarningShown', 'true');
        window.dispatchEvent(new CustomEvent('adBlockerDetected'));
      }
    }
    throw error;
  }
};

// Admin APIs
export const adminAPI = {
  getClasses: () => fetchAPI('/admin/classes'),
  createClass: (data) => fetchAPI('/admin/classes', { method: 'POST', body: JSON.stringify(data) }),
  deleteClass: (id) => fetchAPI(`/admin/classes/${id}`, { method: 'DELETE' }),
  
  getSubjects: () => fetchAPI('/admin/subjects'),
  createSubject: (data) => fetchAPI('/admin/subjects', { method: 'POST', body: JSON.stringify(data) }),
  deleteSubject: (id) => fetchAPI(`/admin/subjects/${id}`, { method: 'DELETE' }),
  
  getStudents: (classId) => {
    const endpoint = classId ? `/admin/students?classId=${classId}` : '/admin/students';
    return fetchAPI(endpoint);
  },
  createStudent: (data) => fetchAPI('/admin/students', { method: 'POST', body: JSON.stringify(data) }),
  deleteStudent: (id) => fetchAPI(`/admin/students/${id}`, { method: 'DELETE' }),
  
  getTeachers: () => fetchAPI('/admin/teachers'),
  createTeacher: (data) => fetchAPI('/admin/teachers', { method: 'POST', body: JSON.stringify(data) }),
  deleteTeacher: (id) => fetchAPI(`/admin/teachers/${id}`, { method: 'DELETE' }),
  
  getAssignments: (teacherId) => {
    const endpoint = teacherId ? `/admin/assignments?teacherId=${teacherId}` : '/admin/assignments';
    return fetchAPI(endpoint);
  },
  createAssignment: (data) => fetchAPI('/admin/assignments', { method: 'POST', body: JSON.stringify(data) }),
  deleteAssignment: (id) => fetchAPI(`/admin/assignments/${id}`, { method: 'DELETE' }),
  
  getAttendanceRecords: (filters) => {
    const params = new URLSearchParams(filters || {}).toString();
    const endpoint = params ? `/admin/attendance?${params}` : '/admin/attendance';
    return fetchAPI(endpoint);
  },
  getStudentAttendanceStats: (filters) => {
    const params = new URLSearchParams(filters || {}).toString();
    const endpoint = params ? `/admin/attendance/student-stats?${params}` : '/admin/attendance/student-stats';
    return fetchAPI(endpoint);
  }
};

// Teacher APIs
export const teacherAPI = {
  getAssignments: () => fetchAPI('/teacher/assignments'),
  getStudents: (classId, subjectId) => {
    const params = new URLSearchParams({ classId, subjectId }).toString();
    return fetchAPI(`/teacher/students?${params}`);
  },
  submitAttendance: (data) => fetchAPI('/teacher/attendance', { method: 'POST', body: JSON.stringify(data) }),
  getAttendanceHistory: (filters) => {
    const params = new URLSearchParams(filters || {}).toString();
    const endpoint = params ? `/teacher/attendance/history?${params}` : '/teacher/attendance/history';
    return fetchAPI(endpoint);
  }
};

// User Management APIs
export const userAPI = {
  getUserInfo: (userId) => fetchAPI(`/users/${userId}`),
  updateCredentials: (userId, data) => fetchAPI(`/users/${userId}/credentials`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  })
};

// Default export for backward compatibility
export default {
  get: (url) => fetchAPI(url),
  post: (url, data) => fetchAPI(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => fetchAPI(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => fetchAPI(url, { method: 'DELETE' })
};