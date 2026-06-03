import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserCog, 
  UserPlus, 
  UserPlus2, 
  Loader2, 
  ArrowRight,
  Plus,
  List,
  Building
} from 'lucide-react';

export default function RecepOverview({ setRecepView }) {
  const [data, setData] = useState({
    totalStudents: '0',
    totalTeachers: '0',
    totalStaff: '0',
    studentsList: [],
    teachersList: [],
    staffList: []
  });
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/overview');
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      }
    } catch (err) {
      console.error('Error loading registry data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'hsl(var(--color-primary))' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading registry overview...</p>
      </div>
    );
  }

  // Get recent 4 items
  const recentStudents = (data.studentsList || []).slice(-4).reverse();
  const recentTeachers = (data.teachersList || []).slice(-4).reverse();
  const recentStaff = (data.staffList || []).slice(-4).reverse();

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      
      {/* SECTION 1: METRIC CARD GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Students */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Enrolled Students</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{data.totalStudents}</h2>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(hsl(var(--color-primary)), 0.1)', color: 'hsl(var(--color-primary))' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px', marginTop: '4px' }}>
            <button 
              onClick={() => setRecepView('students')} 
              className="btn-secondary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
            >
              <List size={14} /> Directory
            </button>
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Active Faculty</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{data.totalTeachers}</h2>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(hsl(var(--color-secondary)), 0.1)', color: 'hsl(var(--color-secondary))' }}>
              <UserCheck size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px', marginTop: '4px' }}>
            <button 
              onClick={() => setRecepView('add-teacher')} 
              className="btn-primary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(var(--color-secondary-hover)) 100%)', borderColor: 'hsl(var(--color-secondary))' }}
            >
              <Plus size={14} /> Onboard
            </button>
            <button 
              onClick={() => setRecepView('teachers')} 
              className="btn-secondary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <List size={14} /> Directory
            </button>
          </div>
        </div>

        {/* Card 3: Support Staff */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Support Staff</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{data.totalStaff}</h2>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(hsl(var(--color-info)), 0.1)', color: 'hsl(var(--color-info))' }}>
              <UserCog size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px', marginTop: '4px' }}>
            <button 
              onClick={() => setRecepView('add-staff')} 
              className="btn-primary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, hsl(var(--color-info)) 0%, hsl(var(--color-info-hover)) 100%)', borderColor: 'hsl(var(--color-info))' }}
            >
              <Plus size={14} /> Recruit
            </button>
            <button 
              onClick={() => setRecepView('staff')} 
              className="btn-secondary" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <List size={14} /> Directory
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 2: QUICK REGISTRATION CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Registry Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Action 1 */}
          <div 
            onClick={() => setRecepView('register-student')}
            className="glass-panel" 
            style={{ 
              padding: '24px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(hsl(var(--color-primary)), 0.1)', color: 'hsl(var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Register New Student</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Admissions and profile details</p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Action 2 */}
          <div 
            onClick={() => setRecepView('add-teacher')}
            className="glass-panel" 
            style={{ 
              padding: '24px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(hsl(var(--color-secondary)), 0.1)', color: 'hsl(var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus2 size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Onboard New Teacher</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Add new academic department faculty</p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Action 3 */}
          <div 
            onClick={() => setRecepView('add-staff')}
            className="glass-panel" 
            style={{ 
              padding: '24px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(hsl(var(--color-info)), 0.1)', color: 'hsl(var(--color-info))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCog size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Recruit Support Staff</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Onboard non-academic resource staff</p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

        </div>
      </div>

      {/* SECTION 3: RECENT REGISTRATIONS COLUMNS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Recent Students */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', color: 'var(--text-main)' }}>Recent Admissions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentStudents.length > 0 ? (
              recentStudents.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: s.photoBg || 'var(--bg-glass-active)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.8rem', fontWeight: 700
                  }}>
                    {s.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class: {s.studentClass || 'N/A'} - {s.section || ''}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.rollNumber}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center', padding: '20px 0' }}>No students admitted recently</p>
            )}
          </div>
        </div>

        {/* Recent Teachers */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', color: 'var(--text-main)' }}>Recent Faculty Onboarded</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTeachers.length > 0 ? (
              recentTeachers.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: t.avatarBg || 'var(--bg-glass-active)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.8rem', fontWeight: 700
                  }}>
                    {t.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{t.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dept: {t.department || 'N/A'}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subject || 'Faculty'}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center', padding: '20px 0' }}>No faculty onboarded recently</p>
            )}
          </div>
        </div>

        {/* Recent Staff */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', color: 'var(--text-main)' }}>Recent Staff Recruits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentStaff.length > 0 ? (
              recentStaff.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: s.avatarBg || 'var(--bg-glass-active)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.8rem', fontWeight: 700
                  }}>
                    {s.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dept: {s.department || 'N/A'}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.role || 'Staff'}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center', padding: '20px 0' }}>No support staff recruited recently</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
