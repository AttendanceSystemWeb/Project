import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { teacherAPI } from '../../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    classId: '',
    subjectId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyRes, assignmentsRes] = await Promise.all([
        teacherAPI.getAttendanceHistory(filters),
        teacherAPI.getAssignments()
      ]);
      setHistory(historyRes.data);
      setAssignments(assignmentsRes.data);
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

  const handleFilter = async () => {
    setLoading(true);
    try {
      const response = await teacherAPI.getAttendanceHistory(filters);
      setHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
      
      // Check if error is due to expired token
      if (error.message === 'Unauthorized - Please log in again' || 
          error.message === 'Session expired - Please log in again' ||
          error.message?.includes('token') || 
          error.message?.includes('expired')) {
        // Token expired, api.js will handle redirect
        return;
      }
      
      // Show error message for other errors
      console.error('Failed to load history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Attendance History</h1>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Classes</option>
                {assignments
                  .filter((a, i, self) => self.findIndex(t => t.class_id === a.class_id) === i)
                  .map((assignment) => (
                    <option key={assignment.class_id} value={assignment.class_id}>
                      {assignment.class_name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={filters.subjectId}
                onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Subjects</option>
                {assignments
                  .filter((a, i, self) => self.findIndex(t => t.subject_id === a.subject_id) === i)
                  .map((assignment) => (
                    <option key={assignment.subject_id} value={assignment.subject_id}>
                      {assignment.subject_name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleFilter}
            className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition font-medium"
          >
            Apply Filters
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No attendance history found.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Lecture Time
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Class
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Subject
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Total
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Present
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Absent
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Excused
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                      Submitted At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((record) => (
                    <tr key={record.session_id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {new Date(record.session_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {record.lecture_start_time && record.lecture_end_time
                          ? `${record.lecture_start_time.slice(0, 5)} - ${record.lecture_end_time.slice(0, 5)}`
                          : '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{record.class_name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{record.subject_name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-center text-gray-900 font-medium whitespace-nowrap">
                        {record.total_students}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-center whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                          {record.present_count}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-center whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-accent bg-opacity-20 text-accent">
                          {record.absent_count}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-center whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                          {record.excused_count || 0}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(record.submitted_at).toLocaleString()}
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

export default History;

