import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { teacherAPI } from '../../services/api';

const Attendance = () => {
  const location = useLocation();
  const preselectedAssignment = location.state?.assignment;

  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(preselectedAssignment?.class_id || '');
  const [selectedSubject, setSelectedSubject] = useState(preselectedAssignment?.subject_id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lectureStartTime, setLectureStartTime] = useState('08:00');
  const [lectureEndTime, setLectureEndTime] = useState('09:00');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadStudents();
    }
  }, [selectedClass, selectedSubject]);

  const loadAssignments = async () => {
    try {
      const response = await teacherAPI.getAssignments();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await teacherAPI.getStudents(selectedClass, selectedSubject);
      setStudents(response.data);
      
      // Initialize all students as present by default
      const initialAttendance = {};
      response.data.forEach(student => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance(prev => {
      const currentStatus = prev[studentId] || 'present';
      let nextStatus;
      
      if (currentStatus === 'present') {
        nextStatus = 'absent';
      } else if (currentStatus === 'absent') {
        nextStatus = 'excused';
      } else {
        nextStatus = 'present';
      }
      
      return {
        ...prev,
        [studentId]: nextStatus
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedClass || !selectedSubject || students.length === 0) {
      setError('Please select a class and subject first');
      return;
    }

    const attendanceData = students.map(student => ({
      studentId: student.id,
      status: attendance[student.id] || 'present'
    }));

    try {
      await teacherAPI.submitAttendance({
        classId: selectedClass,
        subjectId: selectedSubject,
        date,
        lectureStartTime,
        lectureEndTime,
        attendance: attendanceData
      });
      setSuccess('Attendance submitted successfully!');
      
      // Clear form after 2 seconds
      setTimeout(() => {
        setSelectedClass('');
        setSelectedSubject('');
        setStudents([]);
        setAttendance({});
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit attendance');
    }
  };

  const absentCount = Object.values(attendance).filter(status => status === 'absent').length;
  const excusedCount = Object.values(attendance).filter(status => status === 'excused').length;
  const presentCount = students.length - absentCount - excusedCount;

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Record Attendance</h1>

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

        <form onSubmit={handleSubmit}>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  required
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a class</option>
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
                  required
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!selectedClass}
                >
                  <option value="">Select a subject</option>
                  {assignments
                    .filter(a => a.class_id === parseInt(selectedClass))
                    .map((assignment) => (
                      <option key={assignment.subject_id} value={assignment.subject_id}>
                        {assignment.subject_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Lecture Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="time"
                    required
                    value={lectureStartTime}
                    onChange={(e) => setLectureStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="time"
                    required
                    value={lectureEndTime}
                    onChange={(e) => setLectureEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">
                {selectedClass && selectedSubject 
                  ? 'No students found in this class.' 
                  : 'Select a class and subject to load students.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center bg-primary bg-opacity-10 rounded-lg p-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Total: </span>
                  <span className="text-lg font-semibold text-gray-900">{students.length}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-700">Present: </span>
                  <span className="text-lg font-semibold text-green-700">{presentCount}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-accent">Absent: </span>
                  <span className="text-lg font-semibold text-accent">{absentCount}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-yellow-600">Excused: </span>
                  <span className="text-lg font-semibold text-yellow-600">{excusedCount}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-600">
                    Click on a student to cycle through: <span className="font-medium text-green-700">PRESENT</span> → <span className="font-medium text-accent">ABSENT</span> → <span className="font-medium text-yellow-600">EXCUSED</span>. 
                    All students are <span className="font-medium text-green-700">PRESENT</span> by default.
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const status = attendance[student.id] || 'present';
                    let bgClass = 'hover:bg-gray-50';
                    let statusClass = 'bg-green-100 text-green-800';
                    let statusText = 'PRESENT';
                    
                    if (status === 'absent') {
                      bgClass = 'bg-red-50 hover:bg-red-100';
                      statusClass = 'bg-accent bg-opacity-20 text-accent';
                      statusText = 'ABSENT';
                    } else if (status === 'excused') {
                      bgClass = 'bg-yellow-50 hover:bg-yellow-100';
                      statusClass = 'bg-yellow-100 text-yellow-800';
                      statusText = 'EXCUSED';
                    }
                    
                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleAttendance(student.id)}
                        className={`px-6 py-4 cursor-pointer transition ${bgClass}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{student.student_name}</p>
                            <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                          </div>
                          <div>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded ${statusClass}`}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 transition font-medium text-lg"
              >
                Submit Attendance
              </button>
            </>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default Attendance;

