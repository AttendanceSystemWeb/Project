import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { teacherAPI } from '../../services/api';

const Dashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await teacherAPI.getAssignments();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error loading assignments:', error);
      
      // Check if error is due to expired token
      if (error.message === 'Unauthorized - Please log in again' || 
          error.message === 'Session expired - Please log in again' ||
          error.message?.includes('token') || 
          error.message?.includes('expired')) {
        // Token expired, api.js will handle redirect
        return;
      }
      
      // Show error message for other errors
      console.error('Failed to load assignments:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Teacher Dashboard</h1>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Assignments</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">You have no class assignments yet.</p>
              <p className="text-sm text-gray-500 mt-2">Contact your administrator to get assigned to classes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-primary hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate('/teacher/attendance', { state: { assignment } })}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{assignment.class_name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Subject:</span> {assignment.subject_name}
                  </p>
                  <p className="text-xs text-gray-500">Code: {assignment.class_code} - {assignment.subject_code}</p>
                  <div className="mt-4 text-primary text-sm font-medium">
                    Record Attendance →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-primary bg-opacity-10 border-2 border-primary rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/teacher/attendance')}
              className="p-4 bg-white border border-gray-200 rounded hover:border-primary hover:shadow transition text-left"
            >
              <span className="text-primary font-medium">📝 Record Attendance</span>
              <p className="text-sm text-gray-600 mt-1">Mark student attendance for today</p>
            </button>
            <button
              onClick={() => navigate('/teacher/history')}
              className="p-4 bg-white border border-gray-200 rounded hover:border-primary hover:shadow transition text-left"
            >
              <span className="text-primary font-medium">📊 View History</span>
              <p className="text-sm text-gray-600 mt-1">Check past attendance records</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

