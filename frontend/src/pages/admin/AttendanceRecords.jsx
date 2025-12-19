import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filters, setFilters] = useState({
    classId: '',
    subjectId: '',
    date: ''
  });
  const [statsFilters, setStatsFilters] = useState({
    classId: '',
    subjectId: '',
    startDate: '',
    endDate: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSession, setExpandedSession] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsRes, classesRes, subjectsRes] = await Promise.all([
        adminAPI.getAttendanceRecords(filters),
        adminAPI.getClasses(),
        adminAPI.getSubjects()
      ]);
      setRecords(recordsRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAttendanceRecords(filters);
      setRecords(response.data);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const loadStudentStats = async () => {
    setStatsLoading(true);
    try {
      const response = await adminAPI.getStudentAttendanceStats(statsFilters);
      setStudentStats(response.data);
    } catch (error) {
      console.error('Error loading student stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleStatsFilter = async () => {
    await loadStudentStats();
  };

  const downloadPDF = (session) => {
    const doc = new jsPDF();
    
    // Add logo/header
    doc.setFontSize(20);
    doc.setTextColor(47, 100, 151); // Primary color
    doc.text('SAMS - Attendance Report', 14, 20);
    
    // Add horizontal line
    doc.setDrawColor(47, 100, 151);
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);
    
    // Session Details
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Class: ${session.class_name}`, 14, 35);
    doc.text(`Subject: ${session.subject_name}`, 14, 42);
    doc.text(`Teacher: ${session.teacher_name}`, 14, 49);
    doc.text(`Date: ${new Date(session.session_date).toLocaleDateString()}`, 14, 56);
    
    if (session.lecture_start_time && session.lecture_end_time) {
      doc.text(
        `Lecture Time: ${session.lecture_start_time.slice(0, 5)} - ${session.lecture_end_time.slice(0, 5)}`, 
        14, 
        63
      );
    }
    
    doc.text(`Submitted: ${new Date(session.submitted_at).toLocaleString()}`, 14, 70);
    
    // Calculate statistics
    const totalStudents = session.records.length;
    const presentCount = session.records.filter(r => r.status === 'present').length;
    const absentCount = session.records.filter(r => r.status === 'absent').length;
    const excusedCount = session.records.filter(r => r.status === 'excused').length;
    
    // Add statistics box
    doc.setFillColor(249, 250, 251);
    doc.rect(14, 77, 182, 20, 'F');
    doc.setFontSize(10);
    doc.text(`Total Students: ${totalStudents}`, 20, 85);
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Present: ${presentCount}`, 70, 85);
    doc.setTextColor(247, 147, 30); // Orange
    doc.text(`Absent: ${absentCount}`, 110, 85);
    doc.setTextColor(234, 179, 8); // Yellow
    doc.text(`Excused: ${excusedCount}`, 145, 85);
    doc.setTextColor(0, 0, 0);
    
    // Attendance Table
    const tableData = session.records.map(record => [
      record.student_name,
      record.student_number,
      record.status.toUpperCase()
    ]);
    
    doc.autoTable({
      startY: 105,
      head: [['Student Name', 'Student ID', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [47, 100, 151], // Primary color
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      didParseCell: function(data) {
        // Color code status column
        if (data.column.index === 2 && data.section === 'body') {
          const status = data.cell.text[0];
          if (status === 'PRESENT') {
            data.cell.styles.textColor = [34, 197, 94]; // Green
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'ABSENT') {
            data.cell.styles.textColor = [247, 147, 30]; // Orange
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'EXCUSED') {
            data.cell.styles.textColor = [234, 179, 8]; // Yellow
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Save the PDF
    const fileName = `Attendance_${session.class_name.replace(/\s+/g, '_')}_${session.subject_name.replace(/\s+/g, '_')}_${session.session_date}.pdf`;
    doc.save(fileName);
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Attendance Records</h1>
          <button
            onClick={() => {
              setShowStats(!showStats);
              if (!showStats) {
                loadStudentStats();
              }
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition font-medium"
          >
            {showStats ? 'Hide Student Statistics' : 'View Student Statistics'}
          </button>
        </div>

        {/* Student Statistics Section */}
        {showStats && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Attendance Statistics</h2>
            
            {/* Search Bar */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Student by Name or ID
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type student name or ID to search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={statsFilters.classId}
                    onChange={(e) => setStatsFilters({ ...statsFilters, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    value={statsFilters.subjectId}
                    onChange={(e) => setStatsFilters({ ...statsFilters, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={statsFilters.startDate}
                    onChange={(e) => setStatsFilters({ ...statsFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={statsFilters.endDate}
                    onChange={(e) => setStatsFilters({ ...statsFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={handleStatsFilter}
                className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition font-medium"
              >
                Apply Filters
              </button>
            </div>

            {statsLoading ? (
              <div className="text-center py-12 text-gray-600">Loading statistics...</div>
            ) : studentStats.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">No student statistics found.</p>
              </div>
            ) : (() => {
              // Filter students by search query
              const filteredStats = studentStats.filter(stat => {
                if (!searchQuery.trim()) return true;
                const query = searchQuery.toLowerCase();
                return stat.student_name.toLowerCase().includes(query) ||
                       stat.student_number.toLowerCase().includes(query);
              });

              if (filteredStats.length === 0) {
                return (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600">No students found matching "{searchQuery}"</p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <div className="mb-2 text-sm text-gray-600">
                    Showing {filteredStats.length} of {studentStats.length} students
                    {searchQuery && ` matching "${searchQuery}"`}
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Class
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                          Total Records
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                          Present
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                          Absent
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                          Excused
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                          Attendance Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStats.map((stat) => {
                      const total = parseInt(stat.total_records) || 0;
                      const present = parseInt(stat.present_count) || 0;
                      const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';
                      
                      return (
                        <tr key={stat.student_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {stat.student_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{stat.student_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{stat.class_name}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-900 font-medium">
                            {total}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                              {stat.present_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-accent bg-opacity-20 text-accent">
                              {stat.absent_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                              {stat.excused_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                              parseFloat(attendanceRate) >= 80 
                                ? 'bg-green-100 text-green-800'
                                : parseFloat(attendanceRate) >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {attendanceRate}%
                            </span>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name}
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
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
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
        ) : records.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No attendance records found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((session) => (
              <div key={session.session_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleExpand(session.session_id)}
                    >
                      <h3 className="font-medium text-gray-900">
                        {session.class_name} - {session.subject_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Teacher: {session.teacher_name} | Date: {new Date(session.session_date).toLocaleDateString()}
                        {session.lecture_start_time && session.lecture_end_time && (
                          <> | Time: {session.lecture_start_time.slice(0, 5)} - {session.lecture_end_time.slice(0, 5)}</>
                        )}
                        {' | '}Submitted: {new Date(session.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPDF(session);
                        }}
                        className="px-4 py-2 bg-accent text-white rounded hover:bg-opacity-90 transition text-sm font-medium"
                      >
                        Download PDF
                      </button>
                      <span 
                        className="text-gray-600 cursor-pointer"
                        onClick={() => toggleExpand(session.session_id)}
                      >
                        {expandedSession === session.session_id ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                </div>

                {expandedSession === session.session_id && session.records && (
                  <div className="px-6 py-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              Student Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              Student ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {session.records.map((record, idx) => {
                            let statusClass = 'bg-green-100 text-green-800';
                            if (record.status === 'absent') {
                              statusClass = 'bg-accent bg-opacity-20 text-accent';
                            } else if (record.status === 'excused') {
                              statusClass = 'bg-yellow-100 text-yellow-800';
                            }
                            
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-900">{record.student_name}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{record.student_number}</td>
                                <td className="px-4 py-2 text-sm">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusClass}`}>
                                    {record.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AttendanceRecords;

