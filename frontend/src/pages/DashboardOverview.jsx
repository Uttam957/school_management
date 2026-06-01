import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserCog, 
  Loader2, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Activity
} from 'lucide-react';

export default function DashboardOverview() {
  const [overviewData, setOverviewData] = useState({
    totalStudents: '0',
    totalTeachers: '0',
    totalStaff: '0',
    revenueTotal: '$0',
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'hsl(var(--color-primary))' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading academy analytics...</p>
      </div>
    );
  }

  // 1. Calculate Tuition Collection Percentage
  const invoices = overviewData.invoicesList || [];
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const collectionPercent = invoices.length > 0 ? Math.round((paidInvoices.length / invoices.length) * 100) : 0;
  
  const totalAmountBilled = invoices.reduce((acc, curr) => acc + parseInt(curr.amount.replace(/[^0-9]/g, '') || 0), 0);
  const totalAmountPaid = invoices.filter(inv => inv.status === 'Paid').reduce((acc, curr) => acc + parseInt(curr.amount.replace(/[^0-9]/g, '') || 0), 0);
  const totalAmountPending = totalAmountBilled - totalAmountPaid;

  // 2. Student Gender Distribution
  const students = overviewData.studentsList || [];
  const totalStus = students.length;
  const femaleStudents = students.filter(s => s.gender === 'Female').length;
  const femalePercent = totalStus > 0 ? Math.round((femaleStudents / totalStus) * 100) : 50;
  const malePercent = totalStus > 0 ? (100 - femalePercent) : 50;

  // 3. Student to Faculty Ratio
  const studentCount = parseInt(overviewData.totalStudents || '0');
  const teacherCount = parseInt(overviewData.totalTeachers || '0');
  const studentToTeacherRatio = teacherCount > 0 ? (studentCount / teacherCount).toFixed(1) : '1.0';

  // 4. Grade-wise Cohort counts
  const gradeDistribution = { 'Grade 9': 0, 'Grade 10': 0, 'Grade 11': 0 };
  students.forEach(s => {
    if (s.grade.toUpperCase().startsWith('IX') || s.grade.startsWith('9')) gradeDistribution['Grade 9'] += 1;
    else if (s.grade.toUpperCase().startsWith('X') || s.grade.startsWith('10')) gradeDistribution['Grade 10'] += 1;
    else if (s.grade.toUpperCase().startsWith('XI') || s.grade.startsWith('11')) gradeDistribution['Grade 11'] += 1;
  });

  const maxVal = Math.max(...Object.values(gradeDistribution), 4);
  const cohortData = Object.entries(gradeDistribution).map(([label, val]) => ({
    label,
    value: val,
    percent: (val / maxVal) * 90 // scale relative to max
  }));

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      
      {/* SECTION 1: HEADER TELEMETRY COUNTS WITH MINI SPARKLINE GRAPHS */}
      <div className="admin-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Card 1: Students Count Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Students</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>{overviewData.totalStudents}</h2>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(hsl(var(--color-primary)), 0.1)', color: 'hsl(var(--color-primary))' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ color: 'rgb(var(--color-success-rgb))', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={14} /> +12%
            </span>
            <span style={{ color: 'var(--text-muted)' }}>this academic term</span>
          </div>
          {/* Mini Sparkline Line chart SVG */}
          <div style={{ width: '100%', height: '40px', marginTop: '8px' }}>
            <svg viewBox="0 0 100 20" width="100%" height="100%" preserveAspectRatio="none">
              <path d="M 0 18 Q 20 15 40 10 T 80 5 T 100 2" fill="none" stroke="rgba(hsl(var(--color-primary)), 0.75)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 0 18 Q 20 15 40 10 T 80 5 T 100 2 L 100 20 L 0 20 Z" fill="rgba(hsl(var(--color-primary)), 0.05)" />
            </svg>
          </div>
        </div>

        {/* Card 2: Teachers Count Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Teachers</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>{overviewData.totalTeachers}</h2>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(hsl(var(--color-secondary)), 0.1)', color: 'hsl(var(--color-secondary))' }}>
              <UserCheck size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ color: 'rgb(var(--color-success-rgb))', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <Activity size={14} /> 100%
            </span>
            <span style={{ color: 'var(--text-muted)' }}>faculty operational status</span>
          </div>
          {/* Mini Sparkline Line chart SVG */}
          <div style={{ width: '100%', height: '40px', marginTop: '8px' }}>
            <svg viewBox="0 0 100 20" width="100%" height="100%" preserveAspectRatio="none">
              <path d="M 0 8 Q 20 18 40 5 T 80 12 T 100 3" fill="none" stroke="rgba(hsl(var(--color-secondary)), 0.75)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 0 8 Q 20 18 40 5 T 80 12 T 100 3 L 100 20 L 0 20 Z" fill="rgba(hsl(var(--color-secondary)), 0.05)" />
            </svg>
          </div>
        </div>

        {/* Card 3: Staff Count Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Staff</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>{overviewData.totalStaff}</h2>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(hsl(var(--color-info)), 0.1)', color: 'hsl(var(--color-info))' }}>
              <UserCog size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ color: 'hsl(var(--color-info))', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <BookOpen size={14} /> 6 Departments
            </span>
            <span style={{ color: 'var(--text-muted)' }}>operations roster</span>
          </div>
          {/* Mini Sparkline Line chart SVG */}
          <div style={{ width: '100%', height: '40px', marginTop: '8px' }}>
            <svg viewBox="0 0 100 20" width="100%" height="100%" preserveAspectRatio="none">
              <path d="M 0 15 Q 30 2 60 18 T 100 8" fill="none" stroke="rgba(hsl(var(--color-info)), 0.75)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 0 15 Q 30 2 60 18 T 100 8 L 100 20 L 0 20 Z" fill="rgba(hsl(var(--color-info)), 0.05)" />
            </svg>
          </div>
        </div>

      </div>

      {/* SECTION 2: SINGLE TUITION REVENUE PROGRESS AND METRICS SPARK CARDS */}
      <div className="chart-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Full Width Gauge: Tuition Revenue Progress */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, alignSelf: 'flex-start', margin: 0, borderBottom: '1px solid var(--border-glass)', width: '100%', paddingBottom: '12px' }}>Tuition Collections Progress</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', width: '100%', padding: '10px 0' }}>
            
            <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
              {/* SVG Circular Gauge */}
              <svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="2.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--color-secondary))"
                  strokeWidth="2.5"
                  strokeDasharray={`${collectionPercent}, 100`}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(hsl(var(--color-secondary)), 0.3))' }}
                />
              </svg>
              {/* Center Text */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{collectionPercent}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collected</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '220px', alignItems: 'flex-start' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Total Invoiced Tuition</span>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800 }}>${totalAmountBilled.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', gap: '30px', fontSize: '0.85rem', width: '100%', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>PAID TUITION</span>
                  <strong style={{ color: 'rgb(var(--color-success-rgb))', fontSize: '1.1rem', fontWeight: 700 }}>${totalAmountPaid.toLocaleString()}</strong>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-glass)' }}></div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>OUTSTANDING</span>
                  <strong style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '1.1rem', fontWeight: 700 }}>${totalAmountPending.toLocaleString()}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 3: ACADEMY DEMOGRAPHICS & COHORT DISTRIBUTION BAR GRAPH */}
      <div className="chart-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Diversity & Ratios Panel */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>Demographics & Ratios</h3>
          
          {/* 1. Student-Teacher Ratio progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 500 }}>Student-to-Teacher Ratio</span>
              <strong>{studentToTeacherRatio} : 1</strong>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((studentCount / Math.max(teacherCount, 1)) * 10, 100)}%`, background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(var(--color-info)) 100%)', borderRadius: '4px' }}></div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ideal load distribution index</span>
          </div>

          {/* 2. Gender diversity progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 500 }}>Student Gender Balance</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{malePercent}% M / {femalePercent}% F</span>
            </div>
            <div style={{ height: '8px', background: 'hsl(var(--color-secondary))', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ height: '100%', width: `${malePercent}%`, background: 'hsl(var(--color-primary))' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>Male ({totalStus - femaleStudents})</span>
              <span>Female ({femaleStudents})</span>
            </div>
          </div>
        </div>

        {/* Cohort Grade Spread Vertical Bar Chart */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>Enrollment per Cohort</h3>
          
          <div className="svg-chart-container" style={{ height: '140px', marginTop: '10px' }}>
            <div className="bar-chart" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
              {cohortData.map((d, index) => (
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
          </div>
        </div>

      </div>

    </div>
  );
}
