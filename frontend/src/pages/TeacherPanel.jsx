import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LogOut, 
  GraduationCap, 
  ClipboardCheck, 
  List, 
  School, 
  Search, 
  Calendar, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  LayoutDashboard,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Info
} from 'lucide-react';
import StudentDirectory from './StudentDirectory';
import TeacherList from './TeacherList';
import StaffDirectory from './StaffDirectory';

export default function TeacherPanel({ setActiveView, onLogout, teacherView, setTeacherView }) {
  // Global filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('IX');
  const [selectedSection, setSelectedSection] = useState('A');
  const [studentSearch, setStudentSearch] = useState('');

  // Notification states
  const [notification, setNotification] = useState(null);

  // Cohort states for today's status cards
  const [cohortData, setCohortData] = useState([]);
  const [loadingCohort, setLoadingCohort] = useState(false);

  // Trigger notification helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchCohortData = async () => {
    try {
      setLoadingCohort(true);
      // Fetch for today's present date '2026-06-01'
      const res = await fetch('/api/attendance/reports/class?date=2026-06-01');
      if (res.ok) {
        const data = await res.json();
        setCohortData(data);
      }
    } catch (err) {
      console.error('Error loading dashboard cohort data:', err);
    } finally {
      setLoadingCohort(false);
    }
  };

  useEffect(() => {
    if (teacherView === 'dashboard') {
      fetchCohortData();
    }
  }, [teacherView]);

  // Subheader Text
  const getSubheaderText = () => {
    switch (teacherView) {
      case 'mark-attendance': return 'Mark and review today\'s student attendance';
      case 'attendance-history': return 'Search, review, and modify historical rosters';
      case 'student-reports': return 'Generate attendance metrics and export spreadsheets';
      case 'class-reports': return 'Evaluate overall cohort averages and stats';
      case 'monthly-calendar': return 'Monthly calendar tracker grid per student';
      case 'students': return 'Access complete student academic records directory';
      case 'teacher-list': return 'View faculty roster and teacher profiles';
      case 'staff': return 'View non-academic staff directory';
      default: return 'Faculty dashboard & registration telemetries';
    }
  };

  // Rendering switch
  const renderTeacherContent = () => {
    switch (teacherView) {
      case 'mark-attendance':
        return (
          <MarkAttendanceView 
            date={selectedDate}
            setDate={setSelectedDate}
            studentClass={selectedClass}
            setClass={setSelectedClass}
            section={selectedSection}
            setSection={setSelectedSection}
            search={studentSearch}
            setSearch={setStudentSearch}
            showToast={showToast}
          />
        );
      case 'attendance-history':
        return (
          <AttendanceHistoryView 
            showToast={showToast}
          />
        );
      case 'student-reports':
        return (
          <StudentReportsView 
            showToast={showToast}
          />
        );
      case 'monthly-calendar':
        return (
          <MonthlyCalendarView 
            showToast={showToast}
          />
        );
      case 'students':
        return <StudentDirectory readOnly={true} />;
      case 'teacher-list':
        return <TeacherList setActiveView={setActiveView} readOnly={true} />;
      case 'staff':
        return <StaffDirectory readOnly={true} />;
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Top Sleek Grid Navigation */}
            <div className="admin-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px' }}>
              <div className="glass-panel admin-dash-card" onClick={() => setTeacherView('mark-attendance')} style={{ padding: '20px' }}>
                <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-primary))', background: 'rgba(hsl(var(--color-primary)), 0.1)', width: '56px', height: '56px', borderRadius: '12px' }}>
                  <ClipboardCheck size={28} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '12px' }}>Mark Attendance</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Roster and log daily student attendance</p>
              </div>

              <div className="glass-panel admin-dash-card" onClick={() => setTeacherView('attendance-history')} style={{ padding: '20px' }}>
                <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-warning))', background: 'rgba(hsl(var(--color-warning)), 0.1)', width: '56px', height: '56px', borderRadius: '12px' }}>
                  <List size={28} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '12px' }}>Attendance History</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Review and edit past rosters</p>
              </div>

              <div className="glass-panel admin-dash-card" onClick={() => setTeacherView('student-reports')} style={{ padding: '20px' }}>
                <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-success))', background: 'rgba(hsl(var(--color-success)), 0.1)', width: '56px', height: '56px', borderRadius: '12px' }}>
                  <Users size={28} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '12px' }}>Student Reports</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Metrics logs & Excel/PDF exports</p>
              </div>

              <div className="glass-panel admin-dash-card" onClick={() => setTeacherView('monthly-calendar')} style={{ padding: '20px' }}>
                <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-info))', background: 'rgba(hsl(var(--color-info)), 0.1)', width: '56px', height: '56px', borderRadius: '12px' }}>
                  <School size={28} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '12px' }}>Monthly Calendar</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly visual attendance calendar grid</p>
              </div>

              <div className="glass-panel admin-dash-card" onClick={() => setTeacherView('students')} style={{ padding: '20px' }}>
                <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-secondary))', background: 'rgba(hsl(var(--color-secondary)), 0.1)', width: '56px', height: '56px', borderRadius: '12px' }}>
                  <Users size={28} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '12px' }}>Student Directory</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Search, filter, and view student profiles</p>
              </div>

              <div className="glass-panel admin-dash-card" onClick={() => setTeacherView('teacher-list')} style={{ padding: '20px' }}>
                <div className="admin-dash-icon" style={{ color: 'hsl(30, 85%, 65%)', background: 'rgba(251, 146, 60, 0.1)', width: '56px', height: '56px', borderRadius: '12px' }}>
                  <UserCheck size={28} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '12px' }}>Teacher Directory</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View faculty roster and profiles</p>
              </div>

              <div className="glass-panel admin-dash-card" onClick={() => setTeacherView('staff')} style={{ padding: '20px' }}>
                <div className="admin-dash-icon" style={{ color: 'hsl(260, 85%, 65%)', background: 'rgba(168, 85, 247, 0.1)', width: '56px', height: '56px', borderRadius: '12px' }}>
                  <UserCog size={28} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '12px' }}>Staff Directory</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View non-academic staff members</p>
              </div>
            </div>

            {/* Live Today Attendance Cohorts Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} style={{ color: 'hsl(var(--color-success))' }} /> Today's Live Attendance Dashboard
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Class-wise and section-wise current roster tallies for June 01, 2026</p>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '6px 16px',
                  borderRadius: '30px',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'hsl(var(--color-success))'
                }}>
                  Present Date: June 01, 2026
                </div>
              </div>

              {loadingCohort ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '240px', flexDirection: 'column', gap: '12px' }}>
                  <Loader2 className="animate-spin" size={32} style={{ color: 'hsl(var(--color-primary))' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading live today's rosters...</p>
                </div>
              ) : cohortData.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No students or attendance records found in the database.
                </div>
              ) : (
                <div className="admin-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {cohortData.map((r, i) => {
                    const percentage = r.attendancePercentage;
                    const ringColor = percentage >= 90 ? '#10b981' : percentage >= 75 ? '#f59e0b' : '#ef4444';
                    
                    return (
                      <div className="glass-panel" key={i} style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'hsl(var(--color-secondary))', letterSpacing: '0.05em' }}>
                              Grade {r.studentClass} - Section {r.section}
                            </span>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>Roster Attendance</h4>
                          </div>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.03)',
                            border: `2px solid ${ringColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: ringColor
                          }}>
                            {percentage}%
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total students</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{r.totalStudents}</div>
                          </div>
                          <div style={{ background: 'rgba(16, 185, 129, 0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.06)' }}>
                            <div style={{ fontSize: '0.65rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>Present</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{r.presentStudents}</div>
                          </div>
                          <div style={{ background: 'rgba(239, 68, 68, 0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.06)' }}>
                            <div style={{ fontSize: '0.65rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700 }}>Absent</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ef4444', marginTop: '2px' }}>{r.absentStudents}</div>
                          </div>
                          <div style={{ background: 'rgba(249, 115, 22, 0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.06)' }}>
                            <div style={{ fontSize: '0.65rem', color: '#f97316', textTransform: 'uppercase', fontWeight: 700 }}>Late/Leave</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f97316', marginTop: '2px' }}>{r.lateStudents + r.leaveStudents}</div>
                          </div>
                        </div>

                        {/* Progress Bar showing how many students are marked */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            <span>Marking Progress</span>
                            <span>{r.markedStudents} of {r.totalStudents} marked</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${(r.markedStudents / r.totalStudents) * 100}%`,
                              background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                              borderRadius: '3px',
                              transition: 'width 0.4s ease'
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Toast Notification */}
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

      {/* Header Block */}
      <div className="admin-panel-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(hsl(var(--color-secondary)), 0.1)',
            color: 'hsl(var(--color-secondary))'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Teacher Dashboard</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {getSubheaderText()}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {teacherView !== 'dashboard' && (
            <button
              onClick={() => setTeacherView('dashboard')}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutDashboard size={16} />
              Teacher Home
            </button>
          )}
          <button
            onClick={onLogout}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'rgb(var(--color-danger-rgb))', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Dynamic Content */}
      {renderTeacherContent()}
    </div>
  );
}

// ============================================================================
// TAB A: ROSTER DAILY MARKING VIEW
// ============================================================================
export function MarkAttendanceView({ date, setDate, studentClass, setClass, section, setSection, search, setSearch, showToast }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load roster
  const fetchRoster = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        date,
        studentClass,
        section,
        search
      }).toString();
      const res = await fetch(`/api/attendance?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setRoster(data);
      }
    } catch (err) {
      console.error('Error loading daily attendance roster:', err);
      showToast('Error loading students registry list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [date, studentClass, section, search]);

  // Handle single student toggle
  const handleStatusToggle = (stuId, status) => {
    setRoster(prev => prev.map(s => {
      if (s.id === stuId) {
        return { ...s, attendanceStatus: s.attendanceStatus === status ? '' : status };
      }
      return s;
    }));
  };

  // Handle inline remarks modification
  const handleRemarksChange = (stuId, remarks) => {
    setRoster(prev => prev.map(s => {
      if (s.id === stuId) {
        return { ...s, remarks };
      }
      return s;
    }));
  };

  // Mark all as Present
  const markAllPresent = () => {
    setRoster(prev => prev.map(s => ({ ...s, attendanceStatus: 'Present' })));
    showToast('All roster students marked Present!', 'success');
  };

  // Save Attendance to DB
  const saveAttendance = async () => {
    try {
      // Validations
      const unlogged = roster.filter(r => !r.attendanceStatus);
      if (unlogged.length > 0) {
        if (!window.confirm(`You have ${unlogged.length} unmarked students. Would you like to submit and save remaining records?`)) {
          return;
        }
      }

      setSaving(true);
      const recordsToSave = roster
        .filter(r => r.attendanceStatus) // Save only marked ones
        .map(r => ({
          studentId: r.id,
          status: r.attendanceStatus,
          remarks: r.remarks
        }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          studentClass,
          section,
          records: recordsToSave,
          markedBy: 'uttam306115@gmail.com'
        })
      });

      if (res.ok) {
        showToast('Daily attendance saved successfully!', 'success');
        fetchRoster(); // Reload to show saved state
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save attendance logs.', 'error');
      }
    } catch (err) {
      console.error('Error saving attendance records:', err);
      showToast('API network connection error.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Statistics calculation
  const totalStudents = roster.length;
  const presentCount = roster.filter(s => s.attendanceStatus === 'Present').length;
  const absentCount = roster.filter(s => s.attendanceStatus === 'Absent').length;
  const leaveCount = roster.filter(s => s.attendanceStatus === 'Leave').length;
  const lateCount = roster.filter(s => s.attendanceStatus === 'Late').length;
  const markedCount = roster.filter(s => s.attendanceStatus).length;
  const attendanceRate = markedCount > 0 ? Math.round(((presentCount + lateCount) / markedCount) * 100) : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. FILTER CONTROLS CARD */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            
            {/* Date Filter */}
            <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Attendance Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="form-control"
                style={{ height: '38px', borderRadius: '8px', padding: '8px 12px' }}
              />
            </div>

            {/* Class Filter */}
            <div className="form-group" style={{ margin: 0, minWidth: '110px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Grade Class</label>
              <select 
                className="select-custom" 
                value={studentClass} 
                onChange={(e) => setClass(e.target.value)}
                style={{ height: '38px', borderRadius: '8px' }}
              >
                <option value="I">Grade I</option>
                <option value="II">Grade II</option>
                <option value="III">Grade III</option>
                <option value="IV">Grade IV</option>
                <option value="V">Grade V</option>
                <option value="VI">Grade VI</option>
                <option value="VII">Grade VII</option>
                <option value="VIII">Grade VIII</option>
                <option value="IX">Grade IX</option>
                <option value="X">Grade X</option>
                <option value="XI">Grade XI</option>
                <option value="XII">Grade XII</option>
              </select>
            </div>

            {/* Section Filter */}
            <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Section</label>
              <select 
                className="select-custom" 
                value={section} 
                onChange={(e) => setSection(e.target.value)}
                style={{ height: '38px', borderRadius: '8px' }}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="search-bar-container" style={{ margin: 0, maxWidth: '280px', flex: 1, height: '38px', marginTop: '16px' }}>
              <Search size={16} className="search-bar-icon" />
              <input 
                type="text" 
                placeholder="Search roll, admission, name..."
                className="search-bar-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
              />
            </div>

          </div>

          {/* Mark All Button */}
          <div style={{ marginTop: '16px' }}>
            <button 
              onClick={markAllPresent}
              disabled={totalStudents === 0}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <CheckCircle size={16} /> Mark All Present
            </button>
          </div>

        </div>
      </div>

      {/* 2. SUMMARY TELEMETRY CARDS */}
      <div className="admin-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        
        {/* Total Students */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderLeft: '4px solid #64748b' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Roster</span>
          <strong style={{ fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 800 }}>{totalStudents}</strong>
        </div>

        {/* Present */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.02)' }}>
          <span style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>Present</span>
          <strong style={{ fontSize: '1.6rem', color: '#10b981', fontWeight: 800 }}>{presentCount}</strong>
        </div>

        {/* Absent */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.02)' }}>
          <span style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700 }}>Absent</span>
          <strong style={{ fontSize: '1.6rem', color: '#ef4444', fontWeight: 800 }}>{absentCount}</strong>
        </div>

        {/* Leave */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.02)' }}>
          <span style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700 }}>Leave</span>
          <strong style={{ fontSize: '1.6rem', color: '#f59e0b', fontWeight: 800 }}>{leaveCount}</strong>
        </div>

        {/* Late */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderLeft: '4px solid #f97316', background: 'rgba(249, 115, 22, 0.02)' }}>
          <span style={{ fontSize: '0.7rem', color: '#f97316', textTransform: 'uppercase', fontWeight: 700 }}>Late</span>
          <strong style={{ fontSize: '1.6rem', color: '#f97316', fontWeight: 800 }}>{lateCount}</strong>
        </div>

        {/* Attendance Rate */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderLeft: '4px solid #6366f1', background: 'rgba(99, 102, 241, 0.02)' }}>
          <span style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: 700 }}>Attendance %</span>
          <strong style={{ fontSize: '1.6rem', color: '#6366f1', fontWeight: 800 }}>{attendanceRate}%</strong>
        </div>

      </div>

      {/* 3. ROSTER LIST TABLE */}
      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
            <Loader2 className="animate-spin" size={36} style={{ color: 'hsl(var(--color-primary))' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading student rosters...</p>
          </div>
        ) : roster.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>No Students Found</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>No records matched Grade {studentClass}-{section} for the selected parameters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="student-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Roll No</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admission No</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Photo</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Class/Sec</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Attendance Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remarks / Reasons</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((stu, index) => (
                  <tr key={stu.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s ease' }} className="table-row-hover">
                    
                    {/* Roll No */}
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{stu.rollNumber}</td>
                    
                    {/* Admission No */}
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stu.admissionNumber}</td>
                    
                    {/* Photo */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50px',
                        background: stu.photoBg || 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        overflow: 'hidden'
                      }}>
                        {stu.photo ? <img src={stu.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : stu.fullName.substring(0, 2).toUpperCase()}
                      </div>
                    </td>

                    {/* Name */}
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{stu.fullName}</td>
                    
                    {/* Class/Sec */}
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid var(--border-glass)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {stu.studentClass}-{stu.section}
                      </span>
                    </td>

                    {/* Attendance Buttons */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        
                        {/* Present Button */}
                        <button 
                          onClick={() => handleStatusToggle(stu.id, 'Present')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: stu.attendanceStatus === 'Present' ? '#10b981' : 'rgba(255,255,255,0.02)',
                            color: stu.attendanceStatus === 'Present' ? '#ffffff' : 'var(--text-muted)',
                            border: stu.attendanceStatus === 'Present' ? 'none' : '1px solid var(--border-glass)'
                          }}
                        >
                          Present
                        </button>

                        {/* Absent Button */}
                        <button 
                          onClick={() => handleStatusToggle(stu.id, 'Absent')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: stu.attendanceStatus === 'Absent' ? '#ef4444' : 'rgba(255,255,255,0.02)',
                            color: stu.attendanceStatus === 'Absent' ? '#ffffff' : 'var(--text-muted)',
                            border: stu.attendanceStatus === 'Absent' ? 'none' : '1px solid var(--border-glass)'
                          }}
                        >
                          Absent
                        </button>

                        {/* Leave Button */}
                        <button 
                          onClick={() => handleStatusToggle(stu.id, 'Leave')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: stu.attendanceStatus === 'Leave' ? '#f59e0b' : 'rgba(255,255,255,0.02)',
                            color: stu.attendanceStatus === 'Leave' ? '#ffffff' : 'var(--text-muted)',
                            border: stu.attendanceStatus === 'Leave' ? 'none' : '1px solid var(--border-glass)'
                          }}
                        >
                          Leave
                        </button>

                        {/* Late Button */}
                        <button 
                          onClick={() => handleStatusToggle(stu.id, 'Late')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: stu.attendanceStatus === 'Late' ? '#f97316' : 'rgba(255,255,255,0.02)',
                            color: stu.attendanceStatus === 'Late' ? '#ffffff' : 'var(--text-muted)',
                            border: stu.attendanceStatus === 'Late' ? 'none' : '1px solid var(--border-glass)'
                          }}
                        >
                          Late
                        </button>

                      </div>
                    </td>

                    {/* Remarks Input */}
                    <td style={{ padding: '14px 20px', width: '220px' }}>
                      <input 
                        type="text" 
                        placeholder="Add reason/remark..."
                        className="form-control"
                        value={stu.remarks}
                        onChange={(e) => handleRemarksChange(stu.id, e.target.value)}
                        style={{ height: '32px', borderRadius: '6px', fontSize: '0.8rem', padding: '6px 10px' }}
                      />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. ACTIONS FLOATING BOTTOM BAR */}
      {roster.length > 0 && !loading && (
        <div className="glass-panel" style={{ 
          padding: '16px 24px', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          position: 'sticky', 
          bottom: '20px', 
          zIndex: 10,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
        }}>
          <button 
            onClick={saveAttendance}
            disabled={saving}
            className="btn-primary"
            style={{ 
              background: '#6366f1', 
              border: 'none', 
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: 700
            }}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving Attendance...
              </>
            ) : (
              <>
                <ClipboardCheck size={18} /> Save Attendance
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// TAB B: ATTENDANCE HISTORY LOG VIEW
// ============================================================================
export function AttendanceHistoryView({ showToast }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentClass, setClass] = useState('IX');
  const [section, setSection] = useState('A');
  const [search, setSearch] = useState('');
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        date,
        studentClass,
        section,
        search
      }).toString();
      const res = await fetch(`/api/attendance?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setRoster(data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading history roster list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [date, studentClass, section, search]);

  const handleStatusToggle = (stuId, status) => {
    setRoster(prev => prev.map(s => {
      if (s.id === stuId) {
        return { ...s, attendanceStatus: s.attendanceStatus === status ? '' : status };
      }
      return s;
    }));
  };

  const handleRemarksChange = (stuId, remarks) => {
    setRoster(prev => prev.map(s => {
      if (s.id === stuId) {
        return { ...s, remarks };
      }
      return s;
    }));
  };

  const saveAttendanceUpdates = async () => {
    try {
      setSaving(true);
      const recordsToSave = roster
        .filter(r => r.attendanceStatus)
        .map(r => ({
          studentId: r.id,
          status: r.attendanceStatus,
          remarks: r.remarks
        }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          studentClass,
          section,
          records: recordsToSave,
          markedBy: 'uttam306115@gmail.com'
        })
      });

      if (res.ok) {
        showToast('History records updated successfully!', 'success');
        fetchRoster();
      } else {
        showToast('Failed to update logs.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network request failure.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Find percentage
  const total = roster.length;
  const marked = roster.filter(s => s.attendanceStatus).length;
  const present = roster.filter(s => s.attendanceStatus === 'Present').length;
  const late = roster.filter(s => s.attendanceStatus === 'Late').length;
  const rate = marked > 0 ? Math.round(((present + late) / marked) * 100) : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search & Filters */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Past Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="form-control"
              style={{ height: '38px', borderRadius: '8px', padding: '8px 12px' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '110px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Grade Class</label>
            <select 
              className="select-custom" 
              value={studentClass} 
              onChange={(e) => setClass(e.target.value)}
              style={{ height: '38px', borderRadius: '8px' }}
            >
              <option value="I">Grade I</option>
              <option value="II">Grade II</option>
              <option value="III">Grade III</option>
              <option value="IV">Grade IV</option>
              <option value="V">Grade V</option>
              <option value="VI">Grade VI</option>
              <option value="VII">Grade VII</option>
              <option value="VIII">Grade VIII</option>
              <option value="IX">Grade IX</option>
              <option value="X">Grade X</option>
              <option value="XI">Grade XI</option>
              <option value="XII">Grade XII</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Section</label>
            <select 
              className="select-custom" 
              value={section} 
              onChange={(e) => setSection(e.target.value)}
              style={{ height: '38px', borderRadius: '8px' }}
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          <div className="search-bar-container" style={{ margin: 0, maxWidth: '280px', flex: 1, height: '38px', marginTop: '16px' }}>
            <Search size={16} className="search-bar-icon" />
            <input 
              type="text" 
              placeholder="Search roll, admission, name..."
              className="search-bar-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '0.85rem', marginTop: '16px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Marked Rate:</span>
            <strong style={{ color: 'hsl(var(--color-primary))', fontWeight: 700 }}>{rate}% ({marked}/{total} marked)</strong>
          </div>

        </div>
      </div>

      {/* Roster Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
            <Loader2 className="animate-spin" size={36} style={{ color: 'hsl(var(--color-primary))' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading logs history...</p>
          </div>
        ) : roster.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>No Roster Found</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>No records saved for this criteria yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="student-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Roll No</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admission No</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Attendance Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((stu) => (
                  <tr key={stu.id} style={{ borderBottom: '1px solid var(--border-glass)' }} className="table-row-hover">
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700 }}>{stu.rollNumber}</td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stu.admissionNumber}</td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700 }}>{stu.fullName}</td>
                    
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleStatusToggle(stu.id, 'Present')}
                          style={{
                            padding: '5px 10px', borderRadius: '4px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                            background: stu.attendanceStatus === 'Present' ? '#10b981' : 'rgba(255,255,255,0.02)',
                            color: stu.attendanceStatus === 'Present' ? '#ffffff' : 'var(--text-muted)',
                            border: stu.attendanceStatus === 'Present' ? 'none' : '1px solid var(--border-glass)'
                          }}
                        >
                          Present
                        </button>
                        <button 
                          onClick={() => handleStatusToggle(stu.id, 'Absent')}
                          style={{
                            padding: '5px 10px', borderRadius: '4px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                            background: stu.attendanceStatus === 'Absent' ? '#ef4444' : 'rgba(255,255,255,0.02)',
                            color: stu.attendanceStatus === 'Absent' ? '#ffffff' : 'var(--text-muted)',
                            border: stu.attendanceStatus === 'Absent' ? 'none' : '1px solid var(--border-glass)'
                          }}
                        >
                          Absent
                        </button>
                        <button 
                          onClick={() => handleStatusToggle(stu.id, 'Leave')}
                          style={{
                            padding: '5px 10px', borderRadius: '4px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                            background: stu.attendanceStatus === 'Leave' ? '#f59e0b' : 'rgba(255,255,255,0.02)',
                            color: stu.attendanceStatus === 'Leave' ? '#ffffff' : 'var(--text-muted)',
                            border: stu.attendanceStatus === 'Leave' ? 'none' : '1px solid var(--border-glass)'
                          }}
                        >
                          Leave
                        </button>
                        <button 
                          onClick={() => handleStatusToggle(stu.id, 'Late')}
                          style={{
                            padding: '5px 10px', borderRadius: '4px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                            background: stu.attendanceStatus === 'Late' ? '#f97316' : 'rgba(255,255,255,0.02)',
                            color: stu.attendanceStatus === 'Late' ? '#ffffff' : 'var(--text-muted)',
                            border: stu.attendanceStatus === 'Late' ? 'none' : '1px solid var(--border-glass)'
                          }}
                        >
                          Late
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px', width: '220px' }}>
                      <input 
                        type="text" 
                        placeholder="Add reason/remark..."
                        className="form-control"
                        value={stu.remarks || ''}
                        onChange={(e) => handleRemarksChange(stu.id, e.target.value)}
                        style={{ height: '32px', borderRadius: '6px', fontSize: '0.8rem', padding: '6px 10px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {roster.length > 0 && !loading && (
        <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button 
            onClick={saveAttendanceUpdates}
            disabled={saving}
            className="btn-primary"
            style={{ 
              background: '#6366f1', border: 'none', 
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px', fontWeight: 700
            }}
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={18} />} Update History Records
          </button>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// TAB C: STUDENT REPORT VIEW WITH PDF/CSV EXPORTS
// ============================================================================
export function StudentReportsView({ showToast }) {
  const [studentClass, setClass] = useState('All');
  const [section, setSection] = useState('All');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        studentClass,
        section,
        search
      }).toString();
      const res = await fetch(`/api/attendance/reports/student?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error fetching report analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [studentClass, section, search]);

  // EXPORT TO CSV
  const handleExportCSV = () => {
    if (reports.length === 0) {
      showToast('No records available to export.', 'error');
      return;
    }

    const headers = ['Student Name,Admission Number,Class,Section,Total Working Days,Present Days,Absent Days,Leave Days,Late Days,Attendance Percentage'];
    const rows = reports.map(r => 
      `"${r.fullName}","${r.admissionNumber}","${r.studentClass}","${r.section}","${r.totalWorkingDays}","${r.present}","${r.absent}","${r.leave}","${r.late}","${r.attendancePercentage}%"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Spreadsheet download triggered successfully!', 'success');
  };

  // EXPORT TO PDF (Print Window Option)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Controls Card */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            
            <div className="form-group" style={{ margin: 0, minWidth: '130px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Class Filter</label>
              <select className="select-custom" value={studentClass} onChange={(e) => setClass(e.target.value)} style={{ height: '38px', borderRadius: '8px' }}>
                <option value="All">All Classes</option>
                <option value="I">Grade I</option>
                <option value="II">Grade II</option>
                <option value="III">Grade III</option>
                <option value="IV">Grade IV</option>
                <option value="V">Grade V</option>
                <option value="VI">Grade VI</option>
                <option value="VII">Grade VII</option>
                <option value="VIII">Grade VIII</option>
                <option value="IX">Grade IX</option>
                <option value="X">Grade X</option>
                <option value="XI">Grade XI</option>
                <option value="XII">Grade XII</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0, minWidth: '120px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Section</label>
              <select className="select-custom" value={section} onChange={(e) => setSection(e.target.value)} style={{ height: '38px', borderRadius: '8px' }}>
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            <div className="search-bar-container" style={{ margin: 0, maxWidth: '280px', flex: 1, height: '38px', marginTop: '16px' }}>
              <Search size={16} className="search-bar-icon" />
              <input 
                type="text" 
                placeholder="Search name, admission..."
                className="search-bar-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
              />
            </div>

          </div>

          {/* Export buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={handleExportCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', fontSize: '0.85rem' }}>
              <Download size={16} /> Export CSV
            </button>
            <button onClick={handleExportPDF} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', fontSize: '0.85rem' }}>
              <FileText size={16} /> Print PDF
            </button>
          </div>

        </div>
      </div>

      {/* Reports Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }} id="printable-report">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
            <Loader2 className="animate-spin" size={36} style={{ color: 'hsl(var(--color-primary))' }} />
            <p style={{ color: 'var(--text-muted)' }}>Compiling statistics report...</p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>No Analytics Compiled</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Please check filter parameters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="student-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admission No</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Class/Sec</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Total Days</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', color: '#10b981' }}>Present</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', color: '#ef4444' }}>Absent</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', color: '#f59e0b' }}>Leave</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', color: '#f97316' }}>Late</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Rate %</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  let rateColor = '#10b981'; // green
                  if (r.attendancePercentage < 75) rateColor = '#ef4444'; // red
                  else if (r.attendancePercentage < 90) rateColor = '#f59e0b'; // amber

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-glass)' }} className="table-row-hover">
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700 }}>{r.fullName}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.admissionNumber}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem' }}>{r.studentClass}-{r.section}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>{r.totalWorkingDays}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', color: '#10b981' }}>{r.present}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', color: '#ef4444' }}>{r.absent}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', color: '#f59e0b' }}>{r.leave}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', color: '#f97316' }}>{r.late}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: `rgba(${rateColor === '#10b981' ? '16,185,129' : (rateColor === '#ef4444' ? '239,68,68' : '245,158,11')}, 0.1)`,
                          color: rateColor,
                          border: `1px solid ${rateColor}`
                        }}>
                          {r.attendancePercentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// ============================================================================
// TAB D: CLASS COHORT REPORT VIEW
// ============================================================================
export function ClassReportsView({ showToast }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/attendance/reports/class');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error compiling cohort averages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Summary Analytics Cards grid */}
      <div className="admin-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', width: '100%' }}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>No cohort averages available.</div>
        ) : (
          reports.map((r, i) => {
            let color = 'hsl(var(--color-primary))';
            if (r.attendancePercentage < 75) color = 'hsl(var(--color-danger))';
            else if (r.attendancePercentage < 90) color = 'hsl(var(--color-warning))';

            return (
              <div className="glass-panel" key={i} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Grade {r.studentClass} - Section {r.section}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>Cohort Metrics</h3>
                  </div>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    border: `3px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color
                  }}>
                    {r.attendancePercentage}%
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Enrollment Size</span>
                    <strong>{r.totalStudents} Students</strong>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.attendancePercentage}%`, background: color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

// ============================================================================
// TAB E: MONTHLY INTERACTIVE CALENDAR VIEW
// ============================================================================
export function MonthlyCalendarView({ showToast }) {
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarLogs, setCalendarLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Load all students
  const loadStudents = async () => {
    try {
      const res = await fetch('/api/students?limit=100');
      if (res.ok) {
        const data = await res.json();
        setStudentsList(data.students || []);
        if (data.students && data.students.length > 0) {
          setSelectedStudent(data.students[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Fetch calendar logs
  const fetchCalendarLogs = async () => {
    if (!selectedStudent) return;
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        studentId: selectedStudent,
        month: selectedMonth,
        year: selectedYear
      }).toString();
      const res = await fetch(`/api/attendance/calendar?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarLogs(data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading calendar records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarLogs();
  }, [selectedStudent, selectedMonth, selectedYear]);

  // Generate calendar grid days
  // Month is 1-indexed (1-12)
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonthIndex = (month, year) => {
    // 0 = Sunday, 1 = Monday, etc.
    return new Date(year, month - 1, 1).getDay();
  };

  const daysCount = getDaysInMonth(selectedMonth, selectedYear);
  const startDayIndex = getFirstDayOfMonthIndex(selectedMonth, selectedYear);

  const daysGrid = [];
  // Fill empty spaces for offset days from previous month
  for (let i = 0; i < startDayIndex; i++) {
    daysGrid.push(null);
  }
  // Fill month days
  for (let d = 1; d <= daysCount; d++) {
    daysGrid.push(d);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Selectors Card */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Student Selector */}
          <div className="form-group" style={{ margin: 0, minWidth: '220px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Select Student</label>
            <select className="select-custom" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={{ height: '38px', borderRadius: '8px' }}>
              {studentsList.map(s => (
                <option key={s.id} value={s.id}>{s.fullName || s.name} ({s.admissionNumber})</option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="form-group" style={{ margin: 0, minWidth: '140px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Month</label>
            <select className="select-custom" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} style={{ height: '38px', borderRadius: '8px' }}>
              {monthNames.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Year</label>
            <select className="select-custom" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={{ height: '38px', borderRadius: '8px' }}>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

        </div>
      </div>

      {/* Calendar Grid card */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', position: 'relative' }}>
        
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>
          {monthNames[selectedMonth - 1]} {selectedYear}
        </h3>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px' }}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            
            {/* Days header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {/* Grid days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {daysGrid.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} style={{ height: '52px' }} />;
                }

                // Match with attendanceLogs dictionary
                const padDay = day < 10 ? `0${day}` : `${day}`;
                const padMonth = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
                const dateKey = `${selectedYear}-${padMonth}-${padDay}`;
                
                const log = calendarLogs[dateKey];
                
                let dayBg = 'rgba(255,255,255,0.02)';
                let dayColor = 'var(--text-muted)';
                let dayBorder = '1px solid var(--border-glass)';
                
                if (log) {
                  if (log.status === 'Present') { dayBg = '#10b981'; dayColor = '#ffffff'; dayBorder = 'none'; }
                  else if (log.status === 'Absent') { dayBg = '#ef4444'; dayColor = '#ffffff'; dayBorder = 'none'; }
                  else if (log.status === 'Leave') { dayBg = '#f59e0b'; dayColor = '#ffffff'; dayBorder = 'none'; }
                  else if (log.status === 'Late') { dayBg = '#f97316'; dayColor = '#ffffff'; dayBorder = 'none'; }
                }

                return (
                  <div 
                    key={`day-${day}`}
                    onClick={() => log && setActiveTooltip(activeTooltip === dateKey ? null : dateKey)}
                    style={{
                      height: '52px',
                      borderRadius: '8px',
                      background: dayBg,
                      color: dayColor,
                      border: dayBorder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      cursor: log ? 'pointer' : 'default',
                      position: 'relative',
                      boxShadow: log ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                    className="calendar-day-box"
                  >
                    <span>{day}</span>
                    
                    {/* Active tooltip pop-up overlay */}
                    {activeTooltip === dateKey && log && (
                      <div style={{
                        position: 'absolute',
                        bottom: '62px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '200px',
                        padding: '12px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        zIndex: 100,
                        color: '#0f172a',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <strong style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', display: 'block', fontSize: '0.8rem', color: '#1e293b' }}>
                          {monthNames[selectedMonth - 1]} {day}, {selectedYear}
                        </strong>
                        <div>Status: <span style={{ fontWeight: 700, color: log.status === 'Present' ? '#10b981' : (log.status === 'Absent' ? '#ef4444' : '#f59e0b') }}>{log.status}</span></div>
                        {log.remarks && <div>Remarks: <span style={{ color: '#475569' }}>"{log.remarks}"</span></div>}
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>Marked by: {log.markedBy}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
