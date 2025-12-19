import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'admin' ? [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/classes', label: 'Classes' },
    { path: '/admin/subjects', label: 'Subjects' },
    { path: '/admin/students', label: 'Students' },
    { path: '/admin/teachers', label: 'Teachers' },
    { path: '/admin/assignments', label: 'Assignments' },
    { path: '/admin/attendance', label: 'Attendance Records' },
    { path: '/admin/user-management', label: 'User Management' }
  ] : [
    { path: '/teacher/dashboard', label: 'Dashboard' },
    { path: '/teacher/attendance', label: 'Record Attendance' },
    { path: '/teacher/history', label: 'History' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/tishk.png" alt="Logo" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl font-semibold">SAMS</h1>
                <p className="text-sm text-gray-200">Student Attendance Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-gray-200 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-primary rounded hover:bg-gray-100 transition text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                  location.pathname === item.path
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

