import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserCog,
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  AlertCircle,
  FileText,
  UserPlus,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export default function DashboardOverview({ setActiveView }) {
  const [activeChartTab, setActiveChartTab] = useState('enrollment'); // 'enrollment' or 'finance'
  const [overviewData, setOverviewData] = useState({
    totalStudents: '0',
    totalTeachers: '0',
    totalStaff: '0',
    attendanceRate: '0%',
    revenueTotal: '$0',
    activities: [],
    studentsList: [],
    teachersList: [],
    staffList: [],
    invoicesList: []
  });
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/overview');
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard overview logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Compute Grade-wise Enrollment distribution (Grade 9, Grade 10, Grade 11)
  const getEnrollmentDistribution = () => {
    const grades = { 'Grade 9': 0, 'Grade 10': 0, 'Grade 11': 0 };
    overviewData.studentsList.forEach(s => {
      if (s.grade.startsWith('9')) grades['Grade 9'] += 1;
      if (s.grade.startsWith('10')) grades['Grade 10'] += 1;
      if (s.grade.startsWith('11')) grades['Grade 11'] += 1;
    });

    // Convert to percentage height mapping for SVGs (scale relative to max)
    const maxVal = Math.max(...Object.values(grades), 5); // Fallback scale 5
    return Object.entries(grades).map(([label, val]) => ({
      label,
      value: val,
      percent: (val / maxVal) * 90 // Leave buffer space
    }));
  };

  // Compute Grade-wise Financial collection
  const getFinancialDistribution = () => {
    const grades = { 
      'Grade 9': { collected: 0, pending: 0 }, 
      'Grade 10': { collected: 0, pending: 0 }, 
      'Grade 11': { collected: 0, pending: 0 } 
    };

    overviewData.invoicesList.forEach(inv => {
      const val = parseInt(inv.amount.replace(/[^0-9]/g, '') || 0);
      const gradeKey = inv.grade.startsWith('9') ? 'Grade 9' : (inv.grade.startsWith('10') ? 'Grade 10' : 'Grade 11');
      if (inv.status === 'Paid') {
        grades[gradeKey].collected += val;
      } else {
        grades[gradeKey].pending += val;
      }
    });

    // scale height
    const maxVal = Math.max(
      ...Object.values(grades).map(g => g.collected + g.pending), 
      1000 // Fallback scale $1000
    );

    return Object.entries(grades).map(([label, data]) => ({
      label,
      collected: data.collected,
      pending: data.pending,
      collectedPercent: (data.collected / maxVal) * 90,
      pendingPercent: (data.pending / maxVal) * 90
    }));
  };

  const enrollmentChart = getEnrollmentDistribution();
  const financialChart = getFinancialDistribution();

  const stats = [
    { label: 'Daily Attendance', value: overviewData.attendanceRate, trend: 'System average', isUp: true, icon: Clock, color: 'rgb(var(--color-success-rgb))', bg: 'rgba(var(--color-success-rgb), 0.1)' },
    { label: 'Revenue Received', value: overviewData.revenueTotal, trend: 'Collections sum', isUp: true, icon: DollarSign, color: 'rgb(var(--color-warning-rgb))', bg: 'rgba(var(--color-warning-rgb), 0.1)' }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Annual Science Fair', desc: 'Main Exhibition Hall', date: 'June 04', time: '09:00 AM - 04:00 PM' },
    { id: 2, title: 'PTA General Meeting', desc: 'Conference Auditorium', date: 'June 08', time: '02:30 PM - 04:30 PM' },
    { id: 3, title: 'Term 2 Final Exams', desc: 'All Grades', date: 'June 15', time: 'Starts 08:30 AM' }
  ];

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 4 Stats Cards Grid */}
      <div className="dashboard-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel stat-card">
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-trend up">
                  <TrendingUp size={14} /> {stat.trend}
                </span>
              </div>
              <div className="stat-icon-box" style={{ color: stat.color, background: stat.bg }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section & Quick Info Row */}
      <div className="chart-grid">
        {/* Dynamic Insights Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="chart-card-header">
            <div className="chart-title">
              <h3>Academic & Operations Analytics</h3>
              <p style={{ fontSize: '0.85rem' }}>Visual telemetry dynamically driven by your database records.</p>
            </div>
            
            <div className="filter-group">
              <button 
                onClick={() => setActiveChartTab('enrollment')} 
                className={`btn-secondary ${activeChartTab === 'enrollment' ? 'active' : ''}`}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', background: activeChartTab === 'enrollment' ? 'rgba(hsl(var(--color-primary)), 0.15)' : '' }}
              >
                Enrollment per Cohort
              </button>
              <button 
                onClick={() => setActiveChartTab('finance')} 
                className={`btn-secondary ${activeChartTab === 'finance' ? 'active' : ''}`}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', background: activeChartTab === 'finance' ? 'rgba(hsl(var(--color-primary)), 0.15)' : '' }}
              >
                Invoiced Revenue per Cohort
              </button>
            </div>
          </div>

          <div className="svg-chart-container">
            {activeChartTab === 'enrollment' ? (
              <div className="bar-chart" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
                {enrollmentChart.map((d, index) => (
                  <div key={index} className="bar-group">
                    <div className="bar-pair" style={{ height: '100%', width: '100%', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div 
                        className="bar-fill primary" 
                        style={{ height: `${d.percent}%`, width: '28px' }}
                        data-value={`Enrolled: ${d.value} Student${d.value !== 1 ? 's' : ''}`}
                      ></div>
                    </div>
                    <span className="bar-label">{d.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bar-chart" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
                {financialChart.map((d, index) => (
                  <div key={index} className="bar-group">
                    <div className="bar-pair" style={{ gap: '8px' }}>
                      <div 
                        className="bar-fill primary" 
                        style={{ height: `${d.collectedPercent}%`, width: '20px' }}
                        data-value={`Collected: $${d.collected.toLocaleString()}`}
                      ></div>
                      <div 
                        className="bar-fill secondary" 
                        style={{ height: `${d.pendingPercent}%`, width: '20px' }} 
                        data-value={`Outstanding: $${d.pending.toLocaleString()}`}
                      ></div>
                    </div>
                    <span className="bar-label">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.8rem', justifyContent: 'center' }}>
            {activeChartTab === 'enrollment' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'hsl(var(--color-primary))' }}></span>
                Total Cohort Registrations
              </span>
            ) : (
              <>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'hsl(var(--color-primary))' }}></span>
                  Paid Tuition ($)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'hsl(var(--color-secondary))' }}></span>
                  Outstanding Tuition ($)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Dynamic upcoming events agenda */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upcoming Events</h3>
            <Calendar size={18} style={{ color: 'hsl(var(--color-primary))' }} />
          </div>

          <div className="widget-list">
            {upcomingEvents.map((evt) => (
              <div key={evt.id} className="widget-item">
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(hsl(var(--color-primary)), 0.1)',
                  color: 'hsl(var(--color-primary))',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '60px',
                  flexShrink: 0
                }}>
                  <span>{evt.date.split(' ')[0]}</span>
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{evt.date.split(' ')[1]}</span>
                </div>
                <div className="widget-details">
                  <div className="widget-title">{evt.title}</div>
                  <div className="widget-desc">{evt.desc}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{evt.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities & Admin Checklist row */}
      <div className="activity-grid">
        {/* Real-time system logs */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Activities</h3>
            <ClipboardList size={18} style={{ color: 'hsl(var(--color-primary))' }} />
          </div>

          <div className="widget-list">
            {overviewData.activities.length > 0 ? (
              overviewData.activities.map((act) => {
                // Map icons dynamically
                let ActIcon = ClipboardList;
                if (act.type === 'registration') ActIcon = UserPlus;
                if (act.type === 'finance') ActIcon = FileText;
                if (act.type === 'alert') ActIcon = AlertCircle;

                return (
                  <div key={act.id} className="widget-item">
                    <div className="widget-icon" style={{ color: act.color, background: act.bg }}>
                      <ActIcon size={18} />
                    </div>
                    <div className="widget-details">
                      <div className="widget-title">{act.title}</div>
                      <div className="widget-desc">{act.desc}</div>
                    </div>
                    <div className="widget-meta">
                      {act.time}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No recent administrative activity logs.
              </div>
            )}
          </div>
        </div>

        {/* Administrative Quick Actions panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Administrative Quick Deck</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '24px' }}>Direct shortcuts to core tasks to expedite operations.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => setActiveView('students')} 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'space-between', padding: '14px 18px' }}
              >
                <span>Register a new Student</span>
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => setActiveView('teachers')} 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'space-between', padding: '14px 18px' }}
              >
                <span>Manage Faculty Roster</span>
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => setActiveView('finance')} 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'space-between', padding: '14px 18px' }}
              >
                <span>Review Pending Tuition Bills</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Systems operational & secure</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(var(--color-success-rgb))', boxShadow: '0 0 8px rgb(var(--color-success-rgb))' }}></span>
          </div>
        </div>
      </div>

    </div>
  );
}
