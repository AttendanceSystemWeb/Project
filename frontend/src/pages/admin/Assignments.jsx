import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    classId: '',
    subjectId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
        adminAPI.getAssignments(),
        adminAPI.getTeachers(),
        adminAPI.getClasses(),
        adminAPI.getSubjects()
      ]);
      setAssignments(assignmentsRes.data);
      setTeachers(teachersRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Check if error is due to expired token
      if (error.message === 'Unauthorized - Please log in again' || 
          error.message === 'Session expired - Please log in again' ||
          error.message?.includes('token') || 
          error.message?.includes('expired')) {
        // Token expired, api.js will handle redirect
        return;
      }
      
      // Show error message for other errors
      console.error('Failed to load data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await adminAPI.createAssignment(formData);
      setFormData({ teacherId: '', classId: '', subjectId: '' });
      setShowForm(false);
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await adminAPI.deleteAssignment(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete assignment');
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Teacher Assignments</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 sm:px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition text-sm sm:text-base whitespace-nowrap"
          >
            {showForm ? 'Cancel' : '+ Add Assignment'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Assignment</h2>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher
                </label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name} ({teacher.username})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} ({cls.class_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subject_name} ({subject.subject_code})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-accent text-white rounded hover:bg-opacity-90 transition font-medium"
              >
                Save Assignment
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No assignments found. Assign teachers to classes and subjects to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Teacher
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Class
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Subject
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Created At
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{assignment.teacher_name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{assignment.class_name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{assignment.subject_name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-right text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Assignments;

