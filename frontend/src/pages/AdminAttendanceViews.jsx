import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  Loader2, 
  ClipboardCheck, 
  AlertCircle, 
  Edit3 
} from 'lucide-react';

// ============================================================================
// ADMIN VERSION OF ROSTER DAILY MARKING VIEW (Single Submit Button)
// ============================================================================
export function MarkAttendanceView({ date, setDate, studentClass, setClass, section, setSection, search, setSearch, showToast }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if attendance is already submitted
  const isSubmitted = roster.length > 0 && roster.some(s => s.submitted);

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

  // Submit Attendance - saves records and then marks them as submitted
  const submitAttendance = async () => {
    try {
      const unlogged = roster.filter(r => !r.attendanceStatus);
      if (unlogged.length > 0) {
        if (!window.confirm(`You have ${unlogged.length} unmarked students. Do you still want to submit attendance?`)) {
          return;
        }
      }

      setSubmitting(true);
      const recordsToSave = roster
        .filter(r => r.attendanceStatus)
        .map(r => ({
          studentId: r.id,
          status: r.attendanceStatus,
          remarks: r.remarks
        }));

      // Step 1: Save all attendance records
      const saveRes = await fetch('/api/attendance', {
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

      if (!saveRes.ok) {
        const err = await saveRes.json();
        showToast(err.error || 'Failed to save attendance records.', 'error');
        return;
      }

      // Step 2: Submit (finalize) the attendance
      const submitRes = await fetch('/api/attendance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, studentClass, section })
      });

      if (submitRes.ok) {
        showToast('Attendance submitted successfully!', 'success');
        fetchRoster();
      } else {
        const err = await submitRes.json();
        showToast(err.error || 'Failed to submit attendance.', 'error');
      }
    } catch (err) {
      console.error('Error submitting attendance:', err);
      showToast('Network error submitting attendance.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
              disabled={roster.length === 0}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <CheckCircle size={16} /> Mark All Present
            </button>
          </div>

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
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            <table className="student-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-glass-active)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-glass)' }}>
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
                {roster.map((stu) => (
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

      {/* 4. ACTIONS BOTTOM BAR */}
      {roster.length > 0 && !loading && (
        <div className="glass-panel" style={{ 
          padding: '16px 24px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          border: '1px solid rgba(255,255,255,0.08)',
          marginTop: '16px'
        }}>
          {isSubmitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
              <CheckCircle size={18} />
              <span style={{ fontWeight: 700 }}>Attendance Submitted</span>
            </div>
          ) : (
            <button 
              onClick={submitAttendance}
              disabled={submitting}
              className="btn-primary"
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                border: 'none', 
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 700
              }}
            >
              {submitting ? (
                <><Loader2 className="animate-spin" size={16} /> Submitting...</>
              ) : (
                <><CheckCircle size={18} /> Submit Attendance</>
              )}
            </button>
          )}
        </div>
      )}

    </div>
  );
}

// ============================================================================
// ADMIN VERSION OF ATTENDANCE HISTORY LOG VIEW (Read-only + Single Edit Buttons)
// ============================================================================
export function AttendanceHistoryView({ showToast }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentClass, setClass] = useState('I');
  const [section, setSection] = useState('A');
  const [session, setSession] = useState('2026-2027');
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // Student ID being edited
  const [editStatus, setEditStatus] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        date,
        studentClass,
        section,
        submitted: 'true'
      }).toString();
      const res = await fetch(`/api/attendance?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        // Only show students who have a submitted attendance record
        setRoster(data.filter(s => s.attendanceStatus));
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading attendance history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [date, studentClass, section, session]);

  const handleEditClick = (stu) => {
    setEditingId(stu.id);
    setEditStatus(stu.attendanceStatus);
    setEditRemarks(stu.remarks || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditStatus('');
    setEditRemarks('');
  };

  const handleSaveEdit = async (stuId) => {
    try {
      setSavingEdit(true);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          studentClass,
          section,
          records: [{ studentId: stuId, status: editStatus, remarks: editRemarks }],
          markedBy: 'uttam306115@gmail.com'
        })
      });

      if (res.ok) {
        showToast('Attendance updated successfully!', 'success');
        setEditingId(null);
        fetchRoster();
      } else {
        showToast('Failed to update attendance.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error updating attendance.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Present: { bg: '#10b981', text: '#fff' },
      Absent: { bg: '#ef4444', text: '#fff' },
      Leave: { bg: '#f59e0b', text: '#fff' },
      Late: { bg: '#f97316', text: '#fff' }
    };
    const c = colors[status] || { bg: 'var(--bg-glass)', text: 'var(--text-muted)' };
    return (
      <span style={{
        padding: '4px 14px',
        borderRadius: '20px',
        background: c.bg,
        color: c.text,
        fontSize: '0.75rem',
        fontWeight: 700
      }}>
        {status}
      </span>
    );
  };

  // Statistics
  const totalStudents = roster.length;
  const presentCount = roster.filter(s => s.attendanceStatus === 'Present').length;
  const absentCount = roster.filter(s => s.attendanceStatus === 'Absent').length;
  const leaveCount = roster.filter(s => s.attendanceStatus === 'Leave').length;
  const lateCount = roster.filter(s => s.attendanceStatus === 'Late').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Filter Controls */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Date Filter */}
          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="form-control"
              style={{ height: '38px', borderRadius: '8px', padding: '8px 12px' }}
            />
          </div>

          {/* Session Filter */}
          <div className="form-group" style={{ margin: 0, minWidth: '140px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Session</label>
            <select 
              className="select-custom" 
              value={session} 
              onChange={(e) => setSession(e.target.value)}
              style={{ height: '38px', borderRadius: '8px' }}
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
              <option value="2028-2029">2028-2029</option>
            </select>
          </div>

          {/* Grade Filter */}
          <div className="form-group" style={{ margin: 0, minWidth: '110px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Grade</label>
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

        </div>
      </div>

      {/* Statistics Summary */}
      {roster.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Total</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalStudents}</strong>
          </div>
          <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', display: 'block' }}>Present</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{presentCount}</strong>
          </div>
          <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#ef4444', display: 'block' }}>Absent</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>{absentCount}</strong>
          </div>
          <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#f59e0b', display: 'block' }}>Leave</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{leaveCount}</strong>
          </div>
          <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#f97316', display: 'block' }}>Late</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316' }}>{lateCount}</strong>
          </div>
        </div>
      )}

      {/* Attendance History Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
            <Loader2 className="animate-spin" size={36} style={{ color: 'hsl(var(--color-primary))' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading attendance history...</p>
          </div>
        ) : roster.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>No Attendance Records Found</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>No submitted attendance records for Grade {studentClass}-{section} on {date}.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            <table className="student-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-glass-active)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-glass)' }}>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Roll No</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admission No</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Photo</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Section</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remarks</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((stu) => (
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
                    
                    {/* Section */}
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

                    {/* Status */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {editingId === stu.id ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {['Present', 'Absent', 'Leave', 'Late'].map(status => {
                            const colors = { Present: '#10b981', Absent: '#ef4444', Leave: '#f59e0b', Late: '#f97316' };
                            return (
                              <button 
                                key={status}
                                onClick={() => setEditStatus(status)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  background: editStatus === status ? colors[status] : 'rgba(255,255,255,0.02)',
                                  color: editStatus === status ? '#fff' : 'var(--text-muted)',
                                  border: editStatus === status ? 'none' : '1px solid var(--border-glass)'
                                }}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        getStatusBadge(stu.attendanceStatus)
                      )}
                    </td>

                    {/* Remarks */}
                    <td style={{ padding: '14px 20px', width: '200px' }}>
                      {editingId === stu.id ? (
                        <input 
                          type="text" 
                          placeholder="Add reason/remark..."
                          className="form-control"
                          value={editRemarks}
                          onChange={(e) => setEditRemarks(e.target.value)}
                          style={{ height: '32px', borderRadius: '6px', fontSize: '0.8rem', padding: '6px 10px' }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: stu.remarks ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {stu.remarks || '—'}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {editingId === stu.id ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleSaveEdit(stu.id)}
                            disabled={savingEdit}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              background: '#10b981',
                              border: 'none',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {savingEdit ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle size={12} />} Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--border-glass)',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(stu)}
                          style={{
                            padding: '5px 14px',
                            borderRadius: '6px',
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            color: 'hsl(var(--color-primary))',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
