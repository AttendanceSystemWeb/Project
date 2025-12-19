import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await adminAPI.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      username: userToEdit.username,
      newPassword: '',
      confirmPassword: '',
      currentPassword: ''
    });
    setShowPasswordForm(false);
    setError('');
    setSuccess('');
  };

  const handleEditSelf = () => {
    setEditingUser({
      id: user.id,
      username: user.username,
      full_name: user.fullName,
      role: 'admin'
    });
    setFormData({
      username: user.username,
      newPassword: '',
      confirmPassword: '',
      currentPassword: ''
    });
    setShowPasswordForm(false);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      newPassword: '',
      confirmPassword: '',
      currentPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (showPasswordForm) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    // If updating own account, require current password
    if (editingUser.id === user.id && (formData.newPassword || formData.username !== editingUser.username)) {
      if (!formData.currentPassword) {
        setError('Please enter your current password to make changes');
        return;
      }
    }

    try {
      const updates = {};
      
      // Update username if changed
      if (formData.username !== editingUser.username) {
        updates.username = formData.username;
      }
      
      // Update password if provided
      if (showPasswordForm && formData.newPassword) {
        updates.password = formData.newPassword;
      }

      // Add current password for own account
      if (editingUser.id === user.id) {
        updates.currentPassword = formData.currentPassword;
      }

      if (Object.keys(updates).length === 0 || (Object.keys(updates).length === 1 && updates.currentPassword)) {
        setError('No changes to save');
        return;
      }

      await userAPI.updateCredentials(editingUser.id, updates);
      
      setSuccess('Credentials updated successfully!');
      
      // Reload teachers list
      if (editingUser.role === 'teacher') {
        loadTeachers();
      }
      
      // Clear form after 2 seconds
      setTimeout(() => {
        handleCancel();
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update credentials');
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">User Management</h1>

        {/* Admin Account Section */}
        <div className="bg-primary bg-opacity-10 border-2 border-primary rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Admin Account</h2>
              <p className="text-sm text-gray-600 mt-1">
                Username: <span className="font-medium">{user?.username}</span>
              </p>
            </div>
            <button
              onClick={handleEditSelf}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition"
            >
              Change Credentials
            </button>
          </div>
        </div>

        {/* Edit Form Modal */}
        {editingUser && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Credentials: {editingUser.full_name}
            </h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Password Section Toggle */}
              <div className="border-t border-gray-300 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {showPasswordForm ? '− Cancel Password Change' : '+ Change Password'}
                </button>
              </div>

              {/* Password Fields */}
              {showPasswordForm && (
                <div className="space-y-4 border-l-4 border-primary pl-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
              )}

              {/* Current Password (for own account) */}
              {editingUser.id === user.id && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password (Required for changes)
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your current password"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent text-white rounded hover:bg-opacity-90 transition font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Teachers List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Teacher Accounts</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading...</div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No teachers found.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{teacher.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{teacher.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(teacher.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleEditUser({...teacher, role: 'teacher'})}
                        className="text-primary hover:text-opacity-80 font-medium"
                      >
                        Edit Credentials
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;

