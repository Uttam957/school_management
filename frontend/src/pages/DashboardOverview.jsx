import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserCog, 
  Loader2, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Activity,
  UserX,
  CreditCard,
  TrendingDown,
  AlertCircle
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
    invoicesList: [],
    totalAbsentees: 0,
    activeAttendanceDate: '',
    totalFeeCollected: 0,
    totalPendingFees: 0,
    totalPayments: 0,
    monthlyData: []
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

  // 1. Calculate Tuition Collection Percentage from invoices fallback
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
      
      {/* SECTION 1: HEADER TELEMETRY GRID */}
      <div className="admin-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Students Count Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Students</span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{overviewData.totalStudents}</h2>
            </div>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(hsl(var(--color-primary)), 0.1)', color: 'hsl(var(--color-primary))' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', marginTop: '4px' }}>
            <span style={{ color: 'rgb(var(--color-success-rgb))', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} /> +12%
            </span>
            <span style={{ color: 'var(--text-muted)' }}>this term</span>
          </div>
        </div>

        {/* Card 2: Daily Absentees Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Daily Absentees</span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{overviewData.totalAbsentees}</h2>
            </div>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <UserX size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', marginTop: '4px' }}>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>Active Date:</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{overviewData.activeAttendanceDate || 'N/A'}</span>
          </div>
        </div>

        {/* Card 3: Fees Collected Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Collected</span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                ${(overviewData.totalFeeCollected || 0).toLocaleString()}
              </h2>
            </div>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', marginTop: '4px' }}>
            <span style={{ color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} /> Live
            </span>
            <span style={{ color: 'var(--text-muted)' }}>fee collections</span>
          </div>
        </div>

        {/* Card 4: Outstanding Dues Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Outstanding Dues</span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                ${(overviewData.totalPendingFees || 0).toLocaleString()}
              </h2>
            </div>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', marginTop: '4px' }}>
            <span style={{ color: '#f59e0b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <AlertCircle size={12} /> Pending
            </span>
            <span style={{ color: 'var(--text-muted)' }}>receivable amount</span>
          </div>
        </div>

        {/* Card 5: Total Payments (Expenses) Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Payments</span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                ${(overviewData.totalPayments || 0).toLocaleString()}
              </h2>
            </div>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', marginTop: '4px' }}>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>Expenses</span>
            <span style={{ color: 'var(--text-muted)' }}>&amp; payroll paid</span>
          </div>
        </div>

      </div>

      {/* SECTION 2: CHARTS & PROGRESS */}
      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Dual Bar Chart: Monthly Revenue vs Expenses */}
        {overviewData.monthlyData && overviewData.monthlyData.length > 0 && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <TrendingUp size={18} style={{ color: '#10b981' }} /> Monthly Revenue vs Expenses
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '170px', padding: '10px 10px 0 10px', marginTop: '10px' }}>
              {overviewData.monthlyData.map((m, i) => {
                const maxVal = Math.max(...overviewData.monthlyData.map(d => Math.max(d.fees, d.expenses, 1)));
                const feeH = maxVal > 0 ? (m.fees / maxVal) * 130 : 4;
                const expH = maxVal > 0 ? (m.expenses / maxVal) * 130 : 4;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '130px' }}>
                      {/* Revenue Bar */}
                      <div style={{
                        width: '14px', height: `${Math.max(feeH, 4)}px`, borderRadius: '3px 3px 0 0',
                        background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                      }} title={`Revenue: $${m.fees.toLocaleString()}`} />
                      {/* Expenses Bar */}
                      <div style={{
                        width: '14px', height: `${Math.max(expH, 4)}px`, borderRadius: '3px 3px 0 0',
                        background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                      }} title={`Expenses: $${m.expenses.toLocaleString()}`} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.month.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Revenue
              </span>
              <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Expenses
              </span>
            </div>
          </div>
        )}

        {/* Circular Gauge: Tuition Collections Progress */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', color: 'var(--text-main)' }}>Tuition Collections Progress</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', height: '100%' }}>
            
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
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
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{collectionPercent}%</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collected</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '180px' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Invoiced</span>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 800 }}>${totalAmountBilled.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Paid</span>
                  <strong style={{ color: 'rgb(var(--color-success-rgb))', fontSize: '0.95rem', fontWeight: 700 }}>${totalAmountPaid.toLocaleString()}</strong>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-glass)' }}></div>
                <div>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Due</span>
                  <strong style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.95rem', fontWeight: 700 }}>${totalAmountPending.toLocaleString()}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 3: ACADEMY DEMOGRAPHICS & COHORT DISTRIBUTION BAR GRAPH */}
      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Diversity & Ratios Panel */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', color: 'var(--text-main)' }}>Demographics & Ratios</h3>
          
          {/* 1. Student-Teacher Ratio progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Student-to-Teacher Ratio</span>
              <strong style={{ color: 'var(--text-main)' }}>{studentToTeacherRatio} : 1</strong>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((studentCount / Math.max(teacherCount, 1)) * 10, 100)}%`, background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(var(--color-info)) 100%)', borderRadius: '4px' }}></div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ideal load distribution index</span>
          </div>

          {/* 2. Gender diversity progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Student Gender Balance</span>
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
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', color: 'var(--text-main)' }}>Enrollment per Cohort</h3>
          
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
