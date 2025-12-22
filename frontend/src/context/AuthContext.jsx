import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Helper function to check if JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    return now >= exp;
  } catch (error) {
    // If we can't parse the token, consider it expired
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const storedToken = sessionStorage.getItem('token');
    // Check if token is expired on load
    if (storedToken && isTokenExpired(storedToken)) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return null;
    }
    return storedToken;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Check token expiration periodically
      if (isTokenExpired(token)) {
        // Token expired, clear it
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      const userData = JSON.parse(sessionStorage.getItem('user') || 'null');
      setUser(userData);
    }
    setLoading(false);
  }, [token]);

  // Check token expiration every 5 minutes
  useEffect(() => {
    if (!token) return;
    
    const checkInterval = setInterval(() => {
      if (isTokenExpired(token)) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(checkInterval);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        cache: 'no-store' // Prevent caching
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        return {
          success: false,
          error: errorData.error || 'Login failed'
        };
      }

      const { token: newToken, user: userData } = await response.json();
      
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      // Handle network errors
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.error('Network error - may be blocked by ad blocker:', error);
        // Store error for UI to display
        if (!sessionStorage.getItem('adBlockerWarningShown')) {
          sessionStorage.setItem('adBlockerWarning', 'true');
          sessionStorage.setItem('adBlockerWarningShown', 'true');
          window.dispatchEvent(new CustomEvent('adBlockerDetected'));
        }
      }
      
      return {
        success: false,
        error: error.message || 'Login failed. Please check your connection or disable ad blocker.'
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const getAuthHeader = () => {
    // Check token expiration before returning header
    if (token && isTokenExpired(token)) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
      return {};
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        getAuthHeader,
        isAuthenticated: !!token && !isTokenExpired(token),
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};