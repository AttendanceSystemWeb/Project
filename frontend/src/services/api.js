import { API_URL } from '../config';

// CORS health check function
export const checkCORS = async () => {
  try {
    // When using Netlify proxy (relative URL), no CORS preflight needed
    if (API_URL.startsWith('/')) {
      const getResponse = await fetch(`${API_URL}/health/cors?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        mode: 'same-origin'
      });
      
      if (!getResponse.ok) {
        return { working: false, error: `HTTP ${getResponse.status}` };
      }
      
      const data = await getResponse.json();
      return {
        working: true,
        details: data.cors,
        proxied: true
      };
    }
    
    // For absolute URLs (development), test OPTIONS preflight
    const optionsResponse = await fetch(`${API_URL}/health/cors`, {
      method: 'OPTIONS',
      cache: 'no-store',
      mode: 'cors'
    });
    
    // Test GET request
    const getResponse = await fetch(`${API_URL}/health/cors?_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      mode: 'cors'
    });
    
    if (!getResponse.ok) {
      return { working: false, error: `HTTP ${getResponse.status}` };
    }
    
    const data = await getResponse.json();
    return {
      working: data.cors?.working === true,
      details: data.cors,
      optionsStatus: optionsResponse.status
    };
  } catch (error) {
    return {
      working: false,
      error: error.message || 'CORS check failed',
      isCORSIssue: error.message === 'Failed to fetch' || error.name === 'TypeError'
    };
  }
};

// Fetch-based API client (more compatible with ad blockers than Axios/XMLHttpRequest)
const fetchAPI = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Add cache-busting timestamp for ALL requests
  const separator = endpoint.includes('?') ? '&' : '?';
  let endpointWithTimestamp = `${endpoint}${separator}_t=${Date.now()}`;

  // Retry logic for 503 errors and network failures
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add retry delay for subsequent attempts (exponential backoff)
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Update cache-busting for retry
        endpointWithTimestamp = endpointWithTimestamp.replace(/_t=\d+/, `_t=${Date.now()}`);
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const config = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        // Prevent caching
        cache: 'no-store',
        // When using relative URLs (Netlify proxy), mode can be 'same-origin'
        // When using absolute URLs (development), use 'cors'
        mode: API_URL.startsWith('/') ? 'same-origin' : 'cors',
        credentials: 'omit',
        signal: controller.signal
      };

      let response;
      try {
        response = await fetch(`${API_URL}${endpointWithTimestamp}`, config);
      } finally {
        clearTimeout(timeoutId);
      }
      
      // Handle 503 Service Unavailable - retry
      if (response.status === 503) {
        if (attempt < maxRetries) {
          console.warn(`Service unavailable (503), retrying... (attempt ${attempt + 1}/${maxRetries})`);
          lastError = new Error('Service temporarily unavailable');
          continue; // Retry
        }
        // Max retries reached
        throw new Error('Service temporarily unavailable. Please try again in a moment.');
      }
      
      // Handle 401 Unauthorized (expired or invalid token)
      if (response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // Only redirect if we're not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized - Please log in again');
      }
      
      // Handle 403 Forbidden (expired token)
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({ error: 'Forbidden' }));
        if (errorData.error?.includes('expired') || errorData.error?.includes('token')) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          throw new Error('Session expired - Please log in again');
        }
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Success - parse and return data
      const data = await response.json();
      return { data };
      
    } catch (error) {
      lastError = error;
      
      // Handle timeout errors
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        if (attempt < maxRetries) {
          console.warn(`Request timeout, retrying... (attempt ${attempt + 1}/${maxRetries})`);
          continue; // Retry
        }
        throw new Error('Request timeout. The server may be slow or unavailable.');
      }
      
      // Detect network/CORS errors
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        if (attempt < maxRetries) {
          console.warn(`Network error, retrying... (attempt ${attempt + 1}/${maxRetries})`);
          continue; // Retry
        }
        
        console.error('Network error - may be blocked by ad blocker or CORS issue:', error);
        
        // Store error for UI to display
        if (!sessionStorage.getItem('adBlockerWarningShown')) {
          sessionStorage.setItem('adBlockerWarning', 'true');
          sessionStorage.setItem('adBlockerWarningShown', 'true');
          window.dispatchEvent(new CustomEvent('adBlockerDetected'));
        }
        
        throw new Error('Connection failed. This may be caused by an ad blocker or network issue. Please check your connection.');
      }
      
      // For other errors (401, 403, etc.), don't retry
      throw error;
    }
  }
  
  // Should never reach here, but just in case
  throw lastError || new Error('Request failed after multiple retries');
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