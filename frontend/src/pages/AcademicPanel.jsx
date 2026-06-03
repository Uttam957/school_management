import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Clock, 
  BookOpen, 
  Award, 
  Calendar, 
  Bell, 
  Plus, 
  Trash2, 
  Printer, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  UserCheck, 
  Loader2, 
  ChevronRight, 
  TrendingUp, 
  Activity, 
  ArrowLeft,
  ChevronLeft,
  Settings
} from 'lucide-react';

export default function AcademicPanel({ subView }) {
  // Master API states
  const [timetables, setTimetables] = useState([]);
  const [exams, setExams] = useState([]);
  const [examTimetables, setExamTimetables] = useState([]);
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Active view filters
  const [activeClass, setActiveClass] = useState('XII-A');
  const [activeTeacher, setActiveTeacher] = useState('');
  const [activeExam, setActiveExam] = useState('');
  const [activeSubject, setActiveSubject] = useState('Mathematics');
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth()); // 0-11
  
  // Modal toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMarksheetStudent, setActiveMarksheetStudent] = useState(null);

  // Form states
  const [timetableForm, setTimetableForm] = useState({
    day: 'Monday', time: '09:00 AM - 10:00 AM', subject: '', teacher: '', room: '', session: '2026-2027'
  });
  const [examForm, setExamForm] = useState({
    examName: '', examType: 'Unit Test', grade: 'XII', section: 'A', startDate: '', endDate: '', totalMarks: 100, passingMarks: 40, status: 'Scheduled'
  });
  const [examTimetableForm, setExamTimetableForm] = useState({
    examId: '', subject: 'Mathematics', examDate: '', startTime: '09:00 AM', endTime: '12:00 PM', duration: '3 Hours', roomAllocation: '', invigilator: ''
  });
  const [eventForm, setEventForm] = useState({
    title: '', type: 'Event', date: '', time: '', venue: '', description: '', organizer: 'School Admin', participants: 'All Students', status: 'Scheduled'
  });
  const [noticeForm, setNoticeForm] = useState({
    title: '', content: '', category: 'General', priority: 'Medium', publishDate: new Date().toISOString().split('T')[0], expiryDate: '', visibility: 'All'
  });
  const [holidayForm, setHolidayForm] = useState({
    name: '', type: 'Public', startDate: '', endDate: '', description: ''
  });
  
  // Results Entry state: maps studentId -> obtainedMarks
  const [resultsEntry, setResultsEntry] = useState({});

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper arrays for lookups
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeslots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM'
  ];
  const classesList = ['I-A', 'VIII-E', 'XII-A'];
  const subjectsList = ['Mathematics', 'Physics', 'Chemistry', 'English Literature', 'History'];
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const endpoints = [
        { url: '/api/academics/timetables', setter: setTimetables },
        { url: '/api/academics/exams', setter: setExams },
        { url: '/api/academics/exam-timetables', setter: setExamTimetables },
        { url: '/api/academics/events', setter: setEvents },
        { url: '/api/academics/notices', setter: setNotices },
        { url: '/api/academics/holidays', setter: setHolidays },
        { url: '/api/academics/results', setter: setResults },
        { url: '/api/students?limit=10000', setter: (data) => setStudents(data.students || []) },
        { url: '/api/teachers?limit=10000', setter: (data) => setTeachers(data.teachers || []) }
      ];

      await Promise.all(
        endpoints.map(async (ep) => {
          try {
            const res = await fetch(ep.url);
            if (res.ok) {
              const data = await res.json();
              ep.setter(data);
            }
          } catch (e) {
            console.error(`Failed to fetch ${ep.url}:`, e);
          }
        })
      );
    } catch (err) {
      console.error('Error loading academic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync active teacher selection on load
  useEffect(() => {
    if (Array.isArray(teachers) && teachers.length > 0 && !activeTeacher) {
      setActiveTeacher(teachers[0].name);
    }
  }, [teachers]);

  // Sync active exam selection on load
  useEffect(() => {
    if (exams.length > 0 && !activeExam) {
      setActiveExam(exams[0].id);
    }
  }, [exams]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', flexDirection: 'column', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'hsl(var(--color-primary))' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Synchronizing Academic Records...</p>
      </div>
    );
  }

  // =============================================
  // POST & DELETE API HANDLERS
  // =============================================
  
  // 1. Timetable Slot
  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    const payload = { cohort: activeClass, ...timetableForm };
    try {
      const res = await fetch('/api/academics/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Timetable slot scheduled successfully!', 'success');
        setShowAddModal(false);
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to save timetable period.', 'error');
      }
    } catch (e) {
      showToast('Network error during operation.', 'error');
    }
  };

  const deleteTimetablePeriod = async (id) => {
    try {
      const res = await fetch(`/api/academics/timetables/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Period removed from schedule.', 'success');
        fetchAllData();
      }
    } catch (e) {
      showToast('Deletion failed.', 'error');
    }
  };

  // 2. Exam Configuration
  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academics/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examForm)
      });
      
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (err) {
        showToast(`Server Error: ${res.status} - ${text.slice(0, 80)}`, 'error');
        return;
      }

      if (res.ok) {
        showToast(`Term exam configuration created.`, 'success');
        setShowAddModal(false);
        fetchAllData();
      } else {
        showToast(data.error || 'Invalid configuration parameters.', 'error');
      }
    } catch (e) {
      showToast('Operation error: ' + e.message, 'error');
    }
  };

  const deleteExamConfig = async (id) => {
    try {
      const res = await fetch(`/api/academics/exams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Exam configuration purged.', 'success');
        fetchAllData();
      }
    } catch (e) {
      showToast('Purging failed.', 'error');
    }
  };

  // 3. Exam Timetable Slot
  const handleExamTimetableSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...examTimetableForm, examId: activeExam };
    try {
      const res = await fetch('/api/academics/exam-timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Exam date/invigilator slot assigned.', 'success');
        setShowAddModal(false);
        fetchAllData();
      } else {
        showToast(data.error || 'Conflict or error.', 'error');
      }
    } catch (e) {
      showToast('Database call failed.', 'error');
    }
  };

  const deleteExamTimetableSlot = async (id) => {
    try {
      const res = await fetch(`/api/academics/exam-timetables/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Exam schedule period deleted.', 'success');
        fetchAllData();
      }
    } catch (e) {
      showToast('Error removing schedule slot.', 'error');
    }
  };

  // 4. Events
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      });
      if (res.ok) {
        showToast('School event scheduled and logged.', 'success');
        setShowAddModal(false);
        fetchAllData();
      }
    } catch (e) {
      showToast('Could not record event.', 'error');
    }
  };

  const deleteEventLog = async (id) => {
    try {
      const res = await fetch(`/api/academics/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Event listing removed.', 'success');
        fetchAllData();
      }
    } catch (e) {
      showToast('Could not delete event.', 'error');
    }
  };

  // 5. Notices
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academics/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeForm)
      });
      if (res.ok) {
        showToast('Notice published successfully.', 'success');
        setShowAddModal(false);
        fetchAllData();
      }
    } catch (e) {
      showToast('Notice publication failed.', 'error');
    }
  };

  const deleteNoticeBoard = async (id) => {
    try {
      const res = await fetch(`/api/academics/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Notice deleted.', 'success');
        fetchAllData();
      }
    } catch (e) {
      showToast('Operation failed.', 'error');
    }
  };

  // 6. Holidays
  const handleHolidaySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academics/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holidayForm)
      });
      if (res.ok) {
        showToast('Holiday declared.', 'success');
        setShowAddModal(false);
        fetchAllData();
      }
    } catch (e) {
      showToast('Database update failed.', 'error');
    }
  };

  const deleteHolidaySchedule = async (id) => {
    try {
      const res = await fetch(`/api/academics/holidays/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Holiday designation removed.', 'success');
        fetchAllData();
      }
    } catch (e) {
      showToast('Holiday deletion failed.', 'error');
    }
  };

  const deleteResult = async (id) => {
    try {
      const res = await fetch(`/api/academics/results/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Result record deleted successfully.', 'success');
        fetchAllData();
      } else {
        showToast('Failed to delete result.', 'error');
      }
    } catch (e) {
      showToast('Error deleting result.', 'error');
    }
  };

  // 7. Results entry
  const handleSaveMarks = async (studentId, examItem) => {
    const score = resultsEntry[studentId];
    if (score === undefined || score === '') {
      showToast('Please input score.', 'error');
      return;
    }
    const payload = {
      studentId,
      examId: examItem.id,
      subject: activeSubject,
      obtainedMarks: parseFloat(score),
      totalMarks: examItem.totalMarks,
      term: examItem.examName
    };
    try {
      const res = await fetch('/api/academics/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Student grades stored and class rank re-evaluated.', 'success');
        fetchAllData();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to register grades.', 'error');
      }
    } catch (e) {
      showToast('Grades registration error.', 'error');
    }
  };

  // Printable View Helper
  const handlePrint = (elementId) => {
    const prtContent = document.getElementById(elementId);
    const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    WinPrint.document.write(`
      <html>
        <head>
          <title>Academic Report Printout</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background: #f8fafc; font-weight: 700; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0f172a; padding-bottom: 15px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
            .print-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .print-badge { font-weight: bold; }
          </style>
        </head>
        <body>
          ${prtContent.innerHTML}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
  };

  // Filter students based on active grade/section
  // e.g. activeClass is "XII-A" -> matches Grade XII, Section A
  const filteredStudents = Array.isArray(students) ? students.filter(s => {
    const classCode = `${s.studentClass || 'I'}-${s.section || 'A'}`;
    return classCode.toUpperCase() === activeClass.toUpperCase();
  }) : [];

  // =============================================
  // SUB-VIEW RENDERERS
  // =============================================

  const renderClassTimetable = () => {
    const classSlots = timetables.filter(t => t.cohort === activeClass);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Class Period Timetables</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Create and manage student cohort weekly class scheduling structures.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select className="select-custom" value={activeClass} onChange={(e) => setActiveClass(e.target.value)}>
              {classesList.map((cls, idx) => <option key={idx} value={cls}>Grade {cls}</option>)}
            </select>
            <button className="btn-primary" onClick={() => {
              setTimetableForm({ day: 'Monday', time: '09:00 AM - 10:00 AM', subject: '', teacher: '', room: '', session: '2026-2027' });
              setShowAddModal(true);
            }}>
              <Plus size={16} /> Add Class Period
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <table className="table-custom" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Time Slot</th>
                {daysOfWeek.map(d => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {timeslots.map(slot => (
                <tr key={slot}>
                  <td style={{ fontWeight: 700, color: 'hsl(var(--color-primary))', fontSize: '0.8rem' }}>{slot}</td>
                  {daysOfWeek.map(day => {
                    const matched = classSlots.find(t => t.day === day && t.time === slot);
                    return (
                      <td key={day} style={{ padding: '8px' }}>
                        {matched ? (
                          <div style={{
                            background: 'var(--bg-glass-active)',
                            border: '1px solid var(--border-glass)',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            position: 'relative'
                          }}>
                            <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{matched.subject}</strong>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <UserCheck size={10} /> {matched.teacher}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Room {matched.room}</span>
                            <button 
                              onClick={() => deleteTimetablePeriod(matched.id)}
                              style={{
                                position: 'absolute', top: '6px', right: '6px',
                                border: 'none', background: 'none', cursor: 'pointer',
                                color: 'rgb(var(--color-danger-rgb))', opacity: 0.6
                              }}
                              onMouseEnter={e => e.currentTarget.style.opacity = 1}
                              onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', padding: '12px', textAlign: 'center' }}>
                            Free Study
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTeacherTimetable = () => {
    const teacherSlots = timetables.filter(t => t.teacher && activeTeacher && t.teacher.toLowerCase() === activeTeacher.toLowerCase());
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Teacher Schedule Matrix</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Automatically generated schedules mapping active academic workloads for faculty members.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select className="select-custom" value={activeTeacher} onChange={(e) => setActiveTeacher(e.target.value)}>
              {Array.isArray(teachers) && teachers.map((t, idx) => <option key={idx} value={t.name}>{t.name} ({t.department || 'Academic'})</option>)}
            </select>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <table className="table-custom" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Time Slot</th>
                {daysOfWeek.map(d => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {timeslots.map(slot => (
                <tr key={slot}>
                  <td style={{ fontWeight: 700, color: 'hsl(var(--color-info))', fontSize: '0.8rem' }}>{slot}</td>
                  {daysOfWeek.map(day => {
                    const matched = teacherSlots.find(t => t.day === day && t.time === slot);
                    return (
                      <td key={day} style={{ padding: '8px' }}>
                        {matched ? (
                          <div style={{
                            background: 'rgba(6, 182, 212, 0.05)',
                            border: '1px solid rgba(6, 182, 212, 0.15)',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{matched.subject}</strong>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Users size={10} /> Grade {matched.cohort}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Room {matched.room}</span>
                          </div>
                        ) : (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', padding: '12px', textAlign: 'center' }}>
                            Unassigned
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderExams = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Examination Configurations</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Define test syllabus configurations, schedules, and grading targets.</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setExamForm({ examName: '', examType: 'Unit Test', grade: 'XII', section: 'A', startDate: '', endDate: '', totalMarks: 100, passingMarks: 40, status: 'Scheduled' });
            setShowAddModal(true);
          }}>
            <Plus size={16} /> Configure Term Exam
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '0px', overflowX: 'auto' }}>
          {exams.length > 0 ? (
            <table className="table-custom" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Exam Type</th>
                  <th>Class / Section</th>
                  <th>Dates (Start - End)</th>
                  <th>Total Marks</th>
                  <th>Passing Marks</th>
                  <th>Status</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(ex => (
                  <tr key={ex.id}>
                    <td style={{ fontWeight: 700 }}>{ex.examName}</td>
                    <td><span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px', background: 'var(--bg-glass-active)', border: '1px solid var(--border-glass)', fontWeight: 600 }}>{ex.examType}</span></td>
                    <td>Grade {ex.grade}-{ex.section}</td>
                    <td>{ex.startDate} to {ex.endDate}</td>
                    <td style={{ fontWeight: 600 }}>{ex.totalMarks}</td>
                    <td style={{ color: 'rgb(var(--color-danger-rgb))', fontWeight: 600 }}>{ex.passingMarks}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700,
                        background: ex.status === 'Completed' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                        color: ex.status === 'Completed' ? '#10b981' : 'hsl(var(--color-primary))',
                        border: ex.status === 'Completed' ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(99,102,241,0.15)'
                      }}>
                        {ex.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-secondary" onClick={() => deleteExamConfig(ex.id)} style={{ padding: '6px', color: 'rgb(var(--color-danger-rgb))', border: 'none', background: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '12px' }}>
              <BookOpen size={40} style={{ opacity: 0.4 }} />
              <span>No exams configured yet. Click "Configure Term Exam" to define academic test sets.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExamTimetable = () => {
    const selectedExamObj = exams.find(e => e.id === activeExam);
    const schedules = examTimetables.filter(et => et.examId === activeExam);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Term Exam Date Sheets</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure classroom allocations, duration terms, and faculty invigilator duties.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select className="select-custom" value={activeExam} onChange={(e) => setActiveExam(e.target.value)}>
              <option value="">Select Exam Set</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.examName} (Grade {ex.grade})</option>)}
            </select>
            {activeExam && (
              <>
                <button className="btn-secondary" onClick={() => handlePrint('printable-exam-timetable')}>
                  <Printer size={16} /> Export Schedule
                </button>
                <button className="btn-primary" onClick={() => {
                  setExamTimetableForm({ examId: activeExam, subject: 'Mathematics', examDate: '', startTime: '09:00 AM', endTime: '12:00 PM', duration: '3 Hours', roomAllocation: '', invigilator: '' });
                  setShowAddModal(true);
                }}>
                  <Plus size={16} /> Add Schedule Period
                </button>
              </>
            )}
          </div>
        </div>

        {activeExam && selectedExamObj ? (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div id="printable-exam-timetable">
              <div className="header">
                <h1>{selectedExamObj.examName} Date Sheet</h1>
                <p>Term: {selectedExamObj.examType} | Grade: {selectedExamObj.grade}-{selectedExamObj.section}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-glass)', paddingTop: '10px' }}>
                  <span>Total Marks: {selectedExamObj.totalMarks}</span>
                  <span>Passing Score Limit: {selectedExamObj.passingMarks}</span>
                  <span>Status: <strong>{selectedExamObj.status}</strong></span>
                </div>
              </div>

              {schedules.length > 0 ? (
                <table className="table-custom" style={{ width: '100%', marginTop: '20px' }}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Exam Date</th>
                      <th>Time Slot</th>
                      <th>Duration</th>
                      <th>Room Allocated</th>
                      <th>Invigilator Assigned</th>
                      <th className="no-print" style={{ width: '80px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(slot => (
                      <tr key={slot.id}>
                        <td style={{ fontWeight: 700 }}>{slot.subject}</td>
                        <td>{new Date(slot.examDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td>{slot.startTime} to {slot.endTime}</td>
                        <td>{slot.duration}</td>
                        <td><span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>Room {slot.roomAllocation}</span></td>
                        <td>{slot.invigilator}</td>
                        <td className="no-print" style={{ textAlign: 'center' }}>
                          <button className="btn-secondary" onClick={() => deleteExamTimetableSlot(slot.id)} style={{ padding: '4px', border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--color-danger-rgb))' }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '12px' }}>
                  <Calendar size={32} style={{ opacity: 0.4 }} />
                  <span>No schedule slots mapped for this exam configure. Click "Add Schedule Period".</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Please select an exam configuration from the dropdown to visualize the schedule grid.
          </div>
        )}
      </div>
    );
  };

  const renderEvents = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Event Operations Coordinator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Schedule school functions, PTA meets, competitions, and manage their status.</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setEventForm({ title: '', type: 'Event', date: '', time: '', venue: '', description: '', organizer: 'School Admin', participants: 'All Students', status: 'Scheduled' });
            setShowAddModal(true);
          }}>
            <Plus size={16} /> Create New Event
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {events.length > 0 ? (
            events.map(evt => (
              <div key={evt.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700,
                    background: evt.type === 'Exam' ? 'rgba(236,72,153,0.1)' : evt.type === 'Holiday' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                    color: evt.type === 'Exam' ? '#ec4899' : evt.type === 'Holiday' ? '#f59e0b' : 'hsl(var(--color-primary))',
                  }}>{evt.type}</span>
                  <button className="btn-secondary" onClick={() => deleteEventLog(evt.id)} style={{ padding: '4px', border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--color-danger-rgb))' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{evt.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{evt.description || 'No description provided.'}</p>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem',
                  borderTop: '1px solid var(--border-glass)', paddingTop: '10px', color: 'var(--text-muted)'
                }}>
                  <span>📅 Date: <strong>{new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                  <span>⏰ Time: {evt.time}</span>
                  <span>📍 Venue: {evt.venue}</span>
                  <span>👥 Target: {evt.participants}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel" style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
              No school events registered. Click "Create New Event" to register academic activities.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNotices = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Notice & Announcements Board</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Publish official announcements mapping targeted reader visibility groups.</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setNoticeForm({ title: '', content: '', category: 'General', priority: 'Medium', publishDate: new Date().toISOString().split('T')[0], expiryDate: '', visibility: 'All' });
            setShowAddModal(true);
          }}>
            <Plus size={16} /> Broadcast Notice
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notices.length > 0 ? (
            notices.map(nt => (
              <div key={nt.id} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative' }}>
                <div style={{
                  padding: '10px', borderRadius: '10px',
                  background: nt.priority === 'High' ? 'rgba(239, 68, 68, 0.08)' : nt.priority === 'Medium' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                  color: nt.priority === 'High' ? '#ef4444' : nt.priority === 'Medium' ? '#f59e0b' : 'hsl(var(--color-primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Bell size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{nt.title}</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '10px', background: 'var(--bg-glass-active)', border: '1px solid var(--border-glass)', fontWeight: 600 }}>Audience: {nt.visibility}</span>
                      <button className="btn-secondary" onClick={() => deleteNoticeBoard(nt.id)} style={{ padding: '4px', border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--color-danger-rgb))' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0', lineHeight: 1.4 }}>{nt.content}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Category: <strong>{nt.category}</strong></span>
                    <span>Date Published: {nt.publishDate}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Notice board is empty. Click "Broadcast Notice" to publish statements.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHolidays = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Holidays & Calendar Closures</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure festival recesses, official holidays, and emergency closures.</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setHolidayForm({ name: '', type: 'Public', startDate: '', endDate: '', description: '' });
            setShowAddModal(true);
          }}>
            <Plus size={16} /> Declare Holiday
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '0px', overflowX: 'auto' }}>
          {holidays.length > 0 ? (
            <table className="table-custom" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Holiday Designation</th>
                  <th>Classification</th>
                  <th>Starts On</th>
                  <th>Ends On</th>
                  <th>Notes</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 700 }}>{h.name}</td>
                    <td>
                      <span style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                        background: h.type === 'Emergency' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                        color: h.type === 'Emergency' ? '#ef4444' : '#f59e0b',
                        border: h.type === 'Emergency' ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(245, 158, 11, 0.15)'
                      }}>{h.type}</span>
                    </td>
                    <td>{h.startDate}</td>
                    <td>{h.endDate}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.description || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-secondary" onClick={() => deleteHolidaySchedule(h.id)} style={{ padding: '4px', border: 'none', background: 'none', cursor: 'pointer', color: 'rgb(var(--color-danger-rgb))' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No holidays currently registered. Click "Declare Holiday".
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAcademicCalendar = () => {
    // Generate monthly calendar views showing exams, events, and holidays
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Calculate days in the selected month
    const firstDayIndex = new Date(currentYear, activeMonth, 1).getDay(); // Sunday=0
    const totalDays = new Date(currentYear, activeMonth + 1, 0).getDate();

    const calendarGrid = [];
    // Pad days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      calendarGrid.push({ empty: true });
    }
    // Populate calendar days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const dayEvents = events.filter(e => e.date === dateStr);
      const dayHolidays = holidays.filter(h => dateStr >= h.startDate && dateStr <= h.endDate);
      const dayExams = examTimetables.filter(et => et.examDate === dateStr);
      
      calendarGrid.push({
        empty: false,
        day,
        dateStr,
        events: dayEvents,
        holidays: dayHolidays,
        exams: dayExams
      });
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Academic Master Calendar</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aggregated visualization of exam periods, holidays, and school functions.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select className="select-custom" value={activeMonth} onChange={(e) => setActiveMonth(parseInt(e.target.value))}>
              {monthsList.map((m, idx) => <option key={idx} value={idx}>{m} {currentYear}</option>)}
            </select>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Days of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', minHeight: '350px' }}>
            {calendarGrid.map((cell, idx) => {
              if (cell.empty) {
                return <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--border-glass)' }} />;
              }

              const hasContent = cell.events.length > 0 || cell.holidays.length > 0 || cell.exams.length > 0;
              return (
                <div key={idx} style={{
                  background: 'var(--bg-glass-active)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  minHeight: '80px',
                  position: 'relative'
                }}>
                  <strong style={{ fontSize: '0.9rem', color: hasContent ? 'hsl(var(--color-primary))' : 'var(--text-main)' }}>{cell.day}</strong>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                    {cell.holidays.map(h => (
                      <span key={h.id} style={{
                        fontSize: '0.62rem', fontWeight: 700, padding: '2px 4px', borderRadius: '4px',
                        background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.15)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }} title={h.name}>
                        🌴 {h.name}
                      </span>
                    ))}
                    {cell.events.map(e => (
                      <span key={e.id} style={{
                        fontSize: '0.62rem', fontWeight: 700, padding: '2px 4px', borderRadius: '4px',
                        background: 'rgba(99, 102, 241, 0.08)', color: 'hsl(var(--color-primary))', border: '1px solid rgba(99, 102, 241, 0.15)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }} title={e.title}>
                        🎉 {e.title}
                      </span>
                    ))}
                    {cell.exams.map(ex => (
                      <span key={ex.id} style={{
                        fontSize: '0.62rem', fontWeight: 700, padding: '2px 4px', borderRadius: '4px',
                        background: 'rgba(236, 72, 153, 0.08)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.15)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }} title={ex.subject}>
                        📝 {ex.subject} Exam
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const activeExamObj = exams.find(e => e.id === activeExam);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Results & Marksheet Manager</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Input student marks, calculate class rankings, GPA, and render printable marksheet report cards.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select className="select-custom" value={activeClass} onChange={(e) => { setActiveClass(e.target.value); setResultsEntry({}); }}>
              {classesList.map((cls, idx) => <option key={idx} value={cls}>Class {cls}</option>)}
            </select>
            <select className="select-custom" value={activeSubject} onChange={(e) => { setActiveSubject(e.target.value); setResultsEntry({}); }}>
              {subjectsList.map((sub, idx) => <option key={idx} value={sub}>{sub}</option>)}
            </select>
            <select className="select-custom" value={activeExam} onChange={(e) => { setActiveExam(e.target.value); setResultsEntry({}); }}>
              <option value="">Select Exam Set</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.examName}</option>)}
            </select>
          </div>
        </div>

        {activeExam && activeExamObj ? (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Score Entry Sheet: {activeSubject} | Total Marks: {activeExamObj.totalMarks}
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Passing Marks: <strong>{activeExamObj.passingMarks}</strong></span>
            </div>

            {filteredStudents.length > 0 ? (
              <table className="table-custom" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th style={{ width: '200px' }}>Marks Obtained</th>
                    <th>Calculated Grade</th>
                    <th>Class Rank</th>
                    <th style={{ width: '250px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => {
                    const studentResult = results.find(r => r.studentId === student.id && r.examId === activeExam && r.subject && activeSubject && r.subject.toLowerCase() === activeSubject.toLowerCase());
                    
                    return (
                      <tr key={student.id}>
                        <td style={{ fontWeight: 700 }}>{student.rollNumber || student.roll}</td>
                        <td>{student.name}</td>
                        <td>
                          {studentResult ? (
                            <strong style={{ fontSize: '0.9rem', color: studentResult.percentage >= activeExamObj.passingMarks ? '#10b981' : '#ef4444' }}>
                              {studentResult.obtainedMarks} / {studentResult.totalMarks}
                            </strong>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="number"
                                className="form-control"
                                style={{ width: '100px', padding: '6px' }}
                                min="0"
                                max={activeExamObj.totalMarks}
                                placeholder="Marks"
                                value={resultsEntry[student.id] || ''}
                                onChange={(e) => setResultsEntry({ ...resultsEntry, [student.id]: e.target.value })}
                              />
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {activeExamObj.totalMarks}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          {studentResult ? (
                            <span style={{
                              padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
                              background: studentResult.grade === 'F' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                              color: studentResult.grade === 'F' ? '#ef4444' : '#10b981',
                              border: studentResult.grade === 'F' ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)'
                            }}>{studentResult.grade} (GPA {studentResult.gpa.toFixed(1)})</span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }}>{studentResult ? `Rank ${studentResult.rank}` : '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {!studentResult ? (
                              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleSaveMarks(student.id, activeExamObj)}>
                                Save Score
                              </button>
                            ) : (
                              <>
                                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => {
                                  // Clear result logic: delete result record to allow re-entry
                                  deleteResult(studentResult.id);
                                }}>
                                  Reset Score
                                </button>
                                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => {
                                  setActiveMarksheetStudent({ student, result: studentResult });
                                }}>
                                  View Marksheet
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active students registered in Class {activeClass}.
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Please select an exam to display score records sheets.
          </div>
        )}

        {/* Marksheet Modal */}
        {activeMarksheetStudent && createPortal(
          <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={20} /> Academic Progress Marksheet</h2>
                <button className="modal-close" onClick={() => setActiveMarksheetStudent(null)}>×</button>
              </div>
              <div className="modal-body" id="printable-marksheet" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
                <div style={{ borderBottom: '2px solid var(--border-glass)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>AETHER ACADEMY REPORT</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Academic Transcript Record</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Session: 2026-2027</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <div>Name: <strong>{activeMarksheetStudent.student.name}</strong></div>
                  <div>Roll Number: <strong>{activeMarksheetStudent.student.rollNumber || activeMarksheetStudent.student.roll}</strong></div>
                  <div>Grade / Class: <strong>{activeMarksheetStudent.student.studentClass}-{activeMarksheetStudent.student.section}</strong></div>
                  <div>Term ID: <strong>{activeMarksheetStudent.result.term}</strong></div>
                </div>

                <table className="table-custom" style={{ width: '100%', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Subject Field</th>
                      <th>Max Marks</th>
                      <th>Marks Obtained</th>
                      <th>Grade Achieved</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700 }}>{activeMarksheetStudent.result.subject}</td>
                      <td>{activeMarksheetStudent.result.totalMarks}</td>
                      <td style={{ fontWeight: 700 }}>{activeMarksheetStudent.result.obtainedMarks}</td>
                      <td style={{ fontWeight: 700 }}>{activeMarksheetStudent.result.grade}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
                  background: 'var(--bg-glass-active)', padding: '16px', borderRadius: '12px',
                  border: '1px solid var(--border-glass)', textAlign: 'center', marginTop: '10px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>PERCENTAGE</span>
                    <strong style={{ fontSize: '1.1rem', color: 'hsl(var(--color-primary))' }}>{activeMarksheetStudent.result.percentage}%</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>CGPA</span>
                    <strong style={{ fontSize: '1.1rem', color: 'hsl(var(--color-info))' }}>{activeMarksheetStudent.result.gpa.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>CLASS RANK</span>
                    <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>Rank {activeMarksheetStudent.result.rank}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', borderTop: '1px dashed var(--border-glass)', paddingTop: '20px', fontSize: '0.8rem' }}>
                  <div style={{ textAlign: 'center', width: '150px' }}>
                    <div style={{ height: '40px' }} />
                    <div style={{ borderTop: '1px solid var(--text-muted)', paddingTop: '4px' }}>Class Teacher</div>
                  </div>
                  <div style={{ textAlign: 'center', width: '150px' }}>
                    <div style={{ height: '40px' }} />
                    <div style={{ borderTop: '1px solid var(--text-muted)', paddingTop: '4px' }}>Principal Director</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setActiveMarksheetStudent(null)}>Close</button>
                <button className="btn-primary" onClick={() => handlePrint('printable-marksheet')}>Print Transcript</button>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    );
  };

  const renderReports = () => {
    // Generate analytics calculations
    const classResults = results.filter(r => r.studentClass === activeClass);
    
    // 1. Calculate subject averages
    const subjectAverages = subjectsList.map(subject => {
      const subResults = classResults.filter(r => r.subject && subject && r.subject.toLowerCase() === subject.toLowerCase());
      const average = subResults.length > 0
        ? Math.round(subResults.reduce((sum, r) => sum + r.percentage, 0) / subResults.length)
        : 0;
      return { subject, average };
    });

    // 2. GPA distribution
    const gpaCategories = {
      'A+ (Excellent)': classResults.filter(r => r.gpa === 4.0).length,
      'A / B+ (Good)': classResults.filter(r => r.gpa >= 3.3 && r.gpa < 4.0).length,
      'B / C (Average)': classResults.filter(r => r.gpa >= 2.0 && r.gpa < 3.3).length,
      'D / F (Passing/Fail)': classResults.filter(r => r.gpa < 2.0).length
    };
    
    const maxAvgVal = Math.max(...subjectAverages.map(s => s.average), 1);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Academic Performance Analytics</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Visualize curriculum benchmarks, subject averages, and grade distributions.</p>
          </div>
          <select className="select-custom" value={activeClass} onChange={(e) => setActiveClass(e.target.value)}>
            {classesList.map((cls, idx) => <option key={idx} value={cls}>Class {cls}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Chart 1: Subject Averages */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Subject Class Averages (%)</h4>
            
            {classResults.length > 0 ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <svg viewBox="0 0 400 220" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                  {/* Grid lines */}
                  {[40, 80, 120, 160].map((y, idx) => (
                    <line key={idx} x1="50" y1={y} x2="380" y2={y} stroke="var(--border-glass)" strokeDasharray="3 3" strokeWidth="1" />
                  ))}
                  
                  {subjectAverages.map((item, idx) => {
                    const xBase = 60 + idx * 65;
                    const h = (item.average / 100) * 120;
                    const y = 160 - h;
                    
                    return (
                      <g key={idx}>
                        <rect x={xBase} y={y} width="24" height={Math.max(4, h)} rx="4" fill="hsl(var(--color-primary))" opacity="0.85" />
                        <text x={xBase + 12} y={y - 6} textAnchor="middle" fill="var(--text-main)" fontSize="9" fontWeight="700">{item.average}%</text>
                        <text x={xBase + 12} y="180" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontWeight="600" transform={`rotate(-15 ${xBase + 12} 180)`}>
                          {item.subject.length > 8 ? `${item.subject.slice(0, 7)}.` : item.subject}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No score cards calculated for Class {activeClass}.
              </div>
            )}
          </div>

          {/* Chart 2: GPA Grade Distribution */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Student GPA Distributions</h4>

            {classResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center', height: '100%' }}>
                {Object.entries(gpaCategories).map(([label, count], idx) => {
                  const pct = classResults.length > 0 ? Math.round((count / classResults.length) * 100) : 0;
                  const colors = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                        <span>{count} Students ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-glass-active)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '99px', background: colors[idx % colors.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No records to categorize.
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  // Render modal forms dynamically based on active subView
  const renderModalForm = () => {
    switch (subView) {
      case 'academic-class-timetable':
        return (
          <form onSubmit={handleTimetableSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Day of Week</label>
                <select className="form-control" value={timetableForm.day} onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value })}>
                  {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Time Slot</label>
                <select className="form-control" value={timetableForm.time} onChange={(e) => setTimetableForm({ ...timetableForm, time: e.target.value })}>
                  {timeslots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select className="form-control" value={timetableForm.subject} onChange={(e) => setTimetableForm({ ...timetableForm, subject: e.target.value })}>
                  <option value="">Select Subject</option>
                  {subjectsList.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Teacher Assignment</label>
                <select className="form-control" value={timetableForm.teacher} onChange={(e) => setTimetableForm({ ...timetableForm, teacher: e.target.value })}>
                  <option value="">Select Faculty</option>
                  {Array.isArray(teachers) && teachers.map((t, idx) => <option key={idx} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Room Number</label>
                <input type="text" className="form-control" placeholder="e.g. 101" value={timetableForm.room} onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })} required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Schedule Period</button>
            </div>
          </form>
        );

      case 'academic-exams':
        return (
          <form onSubmit={handleExamSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Exam Set Name</label>
                <input type="text" className="form-control" placeholder="e.g. Semester Finals" value={examForm.examName} onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Exam Classification Type</label>
                <select className="form-control" value={examForm.examType} onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}>
                  <option value="Unit Test">Unit Test</option>
                  <option value="Mid-Term Exam">Mid-Term Exam</option>
                  <option value="Final Exam">Final Exam</option>
                  <option value="Practical Exam">Practical Exam</option>
                </select>
              </div>
              <div className="form-group">
                <label>Grade Level</label>
                <select className="form-control" value={examForm.grade} onChange={(e) => setExamForm({ ...examForm, grade: e.target.value })}>
                  <option value="I">Grade I</option>
                  <option value="VIII">Grade VIII</option>
                  <option value="XII">Grade XII</option>
                </select>
              </div>
              <div className="form-group">
                <label>Section</label>
                <input type="text" className="form-control" placeholder="e.g. A" value={examForm.section} onChange={(e) => setExamForm({ ...examForm, section: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" className="form-control" value={examForm.startDate} onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" className="form-control" value={examForm.endDate} onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Total Marks</label>
                <input type="number" className="form-control" value={examForm.totalMarks} onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Passing Marks</label>
                <input type="number" className="form-control" value={examForm.passingMarks} onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })} required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Configuration</button>
            </div>
          </form>
        );

      case 'academic-exam-timetable':
        return (
          <form onSubmit={handleExamTimetableSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Subject</label>
                <select className="form-control" value={examTimetableForm.subject} onChange={(e) => setExamTimetableForm({ ...examTimetableForm, subject: e.target.value })}>
                  {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Exam Date</label>
                <input type="date" className="form-control" value={examTimetableForm.examDate} onChange={(e) => setExamTimetableForm({ ...examTimetableForm, examDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="text" className="form-control" placeholder="e.g. 09:00 AM" value={examTimetableForm.startTime} onChange={(e) => setExamTimetableForm({ ...examTimetableForm, startTime: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="text" className="form-control" placeholder="e.g. 12:00 PM" value={examTimetableForm.endTime} onChange={(e) => setExamTimetableForm({ ...examTimetableForm, endTime: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Room Allocation</label>
                <input type="text" className="form-control" placeholder="e.g. Hall A" value={examTimetableForm.roomAllocation} onChange={(e) => setExamTimetableForm({ ...examTimetableForm, roomAllocation: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Invigilator Duty Assignment</label>
                <select className="form-control" value={examTimetableForm.invigilator} onChange={(e) => setExamTimetableForm({ ...examTimetableForm, invigilator: e.target.value })}>
                  <option value="">Select Staff</option>
                  {Array.isArray(teachers) && teachers.map((t, idx) => <option key={idx} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Schedule Exam Slot</button>
            </div>
          </form>
        );

      case 'academic-events':
        return (
          <form onSubmit={handleEventSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Event Title</label>
                <input type="text" className="form-control" placeholder="e.g. Sports Carnival" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Event Type</label>
                <select className="form-control" value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}>
                  <option value="Event">Cultural Event</option>
                  <option value="Holiday">School Holiday</option>
                  <option value="Meeting">PTA Meeting</option>
                  <option value="Exam">Exam term</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="text" className="form-control" placeholder="e.g. 10:00 AM" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input type="text" className="form-control" placeholder="e.g. School Playground" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description Details</label>
                <textarea className="form-control" placeholder="..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Publish Event</button>
            </div>
          </form>
        );

      case 'academic-notices':
        return (
          <form onSubmit={handleNoticeSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Notice Headline</label>
                <input type="text" className="form-control" placeholder="e.g. Exam Schedule Alterations" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Announcement Content</label>
                <textarea className="form-control" placeholder="Enter instructions details..." value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={noticeForm.category} onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}>
                  <option value="General">General Notice</option>
                  <option value="Academic">Academic Notice</option>
                  <option value="Admissions">Admissions Board</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select className="form-control" value={noticeForm.priority} onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Audience Visibility</label>
                <select className="form-control" value={noticeForm.visibility} onChange={(e) => setNoticeForm({ ...noticeForm, visibility: e.target.value })}>
                  <option value="All">All School</option>
                  <option value="Students">Students Only</option>
                  <option value="Teachers">Teachers Only</option>
                  <option value="Staff">Staff Only</option>
                  <option value="Parents">Parents Only</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Broadcast</button>
            </div>
          </form>
        );

      case 'academic-holidays':
        return (
          <form onSubmit={handleHolidaySubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Holiday Name</label>
                <input type="text" className="form-control" placeholder="e.g. Diwali Break" value={holidayForm.name} onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Classification Type</label>
                <select className="form-control" value={holidayForm.type} onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}>
                  <option value="Public">Public Holiday</option>
                  <option value="Festival">Festival Break</option>
                  <option value="School">School Holiday</option>
                  <option value="Emergency">Emergency Closure</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" className="form-control" value={holidayForm.startDate} onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" className="form-control" value={holidayForm.endDate} onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Remarks / Notes</label>
                <input type="text" className="form-control" placeholder="Optional notes" value={holidayForm.description} onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Declare Holiday</button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  // Switch Render core content page views
  const renderSubViewContent = () => {
    switch (subView) {
      case 'academic-class-timetable':
        return renderClassTimetable();
      case 'academic-teacher-timetable':
        return renderTeacherTimetable();
      case 'academic-exams':
        return renderExams();
      case 'academic-exam-timetable':
        return renderExamTimetable();
      case 'academic-events':
        return renderEvents();
      case 'academic-notices':
        return renderNotices();
      case 'academic-holidays':
        return renderHolidays();
      case 'academic-calendar':
        return renderAcademicCalendar();
      case 'academic-results':
        return renderResults();
      case 'academic-reports':
        return renderReports();
      default:
        return renderClassTimetable();
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Toast notifications */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          borderRadius: '12px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 999999,
          fontWeight: 600,
          animation: 'slideInRight 0.3s ease forwards'
        }}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Render selected Tab Panel Content */}
      {renderSubViewContent()}

      {/* Dynamic Modal Renderer */}
      {showAddModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>
                Add {subView.replace('academic-', '').replace('-', ' ')}
              </h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            {renderModalForm()}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
