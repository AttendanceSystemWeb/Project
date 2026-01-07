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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img src="/tishk.png" alt="Logo" className="h-8 sm:h-12 w-auto" />
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">SAMS</h1>
                <p className="text-xs sm:text-sm text-gray-200 hidden sm:block">Student Attendance Management System</p>
                <p className="text-xs text-gray-200 sm:hidden">SAMS</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{user?.fullName}</p>
                <p className="text-xs text-gray-200 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-primary rounded hover:bg-gray-100 transition text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition ${
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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

