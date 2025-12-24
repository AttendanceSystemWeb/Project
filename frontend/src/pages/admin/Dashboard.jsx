import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    classes: 0,
    subjects: 0,
    students: 0,
    teachers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load stats individually to handle partial failures
      const results = await Promise.allSettled([
        adminAPI.getClasses(),
        adminAPI.getSubjects(),
        adminAPI.getStudents(),
        adminAPI.getTeachers()
      ]);

      // Update stats only for successful requests
      const [classesResult, subjectsResult, studentsResult, teachersResult] = results;
      
      if (classesResult.status === 'fulfilled' && classesResult.value?.data) {
        setStats(prev => ({ ...prev, classes: classesResult.value.data.length }));
      }
      
      if (subjectsResult.status === 'fulfilled' && subjectsResult.value?.data) {
        setStats(prev => ({ ...prev, subjects: subjectsResult.value.data.length }));
      }
      
      if (studentsResult.status === 'fulfilled' && studentsResult.value?.data) {
        setStats(prev => ({ ...prev, students: studentsResult.value.data.length }));
      }
      
      if (teachersResult.status === 'fulfilled' && teachersResult.value?.data) {
        setStats(prev => ({ ...prev, teachers: teachersResult.value.data.length }));
      }

      // Check if any requests failed
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        const errorMessages = failures
          .map(r => r.reason?.message || 'Unknown error')
          .filter((msg, idx, arr) => arr.indexOf(msg) === idx); // Remove duplicates
        
        // Don't show error for token expiration (redirect will happen)
        const nonAuthErrors = errorMessages.filter(
          msg => !msg.includes('Unauthorized') && !msg.includes('expired')
        );
        
        if (nonAuthErrors.length > 0) {
          setError(`Some data failed to load: ${nonAuthErrors.join(', ')}. Please refresh the page.`);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      
      // Check if error is due to expired token
      if (error.message === 'Unauthorized - Please log in again' || 
          error.message === 'Session expired - Please log in again' ||
          error.message?.includes('token') || 
          error.message?.includes('expired')) {
        // Token expired, api.js will handle redirect
        return;
      }
      
      setError(error.message || 'Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Classes', value: stats.classes, color: 'bg-blue-50 text-primary border-primary' },
    { label: 'Total Subjects', value: stats.subjects, color: 'bg-orange-50 text-accent border-accent' },
    { label: 'Total Students', value: stats.students, color: 'bg-green-50 text-green-700 border-green-700' },
    { label: 'Total Teachers', value: stats.teachers, color: 'bg-purple-50 text-purple-700 border-purple-700' }
  ];

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="font-medium">Warning:</p>
            <p>{error}</p>
            <button
              onClick={loadStats}
              className="mt-2 text-yellow-900 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div
                key={index}
                className={`${card.color} border-2 rounded-lg p-6 shadow-sm`}
              >
                <h3 className="text-sm font-medium opacity-80">{card.label}</h3>
                <p className="text-4xl font-bold mt-2">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/classes"
              className="block p-4 bg-white border border-gray-200 rounded hover:border-primary hover:shadow transition text-center"
            >
              <span className="text-primary font-medium">Manage Classes</span>
            </a>
            <a
              href="/admin/students"
              className="block p-4 bg-white border border-gray-200 rounded hover:border-primary hover:shadow transition text-center"
            >
              <span className="text-primary font-medium">Manage Students</span>
            </a>
            <a
              href="/admin/teachers"
              className="block p-4 bg-white border border-gray-200 rounded hover:border-primary hover:shadow transition text-center"
            >
              <span className="text-primary font-medium">Manage Teachers</span>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

