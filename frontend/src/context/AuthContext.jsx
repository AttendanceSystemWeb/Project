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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(sessionStorage.getItem('user') || 'null');
      setUser(userData);
    }
    setLoading(false);
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
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};