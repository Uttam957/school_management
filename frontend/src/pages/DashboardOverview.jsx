import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserCog, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  IndianRupee, 
  ClipboardCheck, 
  DollarSign, 
  CreditCard,
  Plus, 
  Calendar,
  Activity,
  ArrowRight,
  PieChart,
  BarChart3,
  Percent,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Custom inline SVG icons helper to prevent hoisting/scoping issues
function UserPlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

export default function DashboardOverview({ onQuickAction }) {
  const [overviewData, setOverviewData] = useState({
    totalStudents: '0',
    totalTeachers: '0',
    totalStaff: '0',
    todayAttendancePercentage: 0,
    currentMonthFeeCollection: 0,
    pendingFeeAmount: 0,
    currentMonthExpenses: 0,
    netProfitLoss: 0,
    growthData: [],
    attendanceAnalytics: { daily: [], weekly: [], monthly: [] },
    monthlyData: [],
    feeStatusCounts: { paid: 0, partial: 0, pending: 0 },
    classWiseDistribution: {},
    genderDistribution: { male: 0, female: 0 },
    events: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);

  // Chart Filters
  const [attendanceFilter, setAttendanceFilter] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [studentDistFilter, setStudentDistFilter] = useState('class-wise'); // 'class-wise' | 'gender'

  // Tooltip/Hover States
  const [growthHoverIdx, setGrowthHoverIdx] = useState(null);
  const [attendanceHoverIdx, setAttendanceHoverIdx] = useState(null);
  const [revenueHoverIdx, setRevenueHoverIdx] = useState(null);
  const [feeStatusHoverIdx, setFeeStatusHoverIdx] = useState(null);
  const [studentDistHoverIdx, setStudentDistHoverIdx] = useState(null);

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', flexDirection: 'column', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'hsl(var(--color-primary))' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Assembling SaaS Analytics Command...</p>
      </div>
    );
  }

  // ==========================================
  // DEFENSIVE DESTRUCTURING & FALLBACKS
  // ==========================================
  const totalStudents = overviewData.totalStudents || '0';
  const totalTeachers = overviewData.totalTeachers || '0';
  const totalStaff = overviewData.totalStaff || '0';
  const todayAttendancePercentage = overviewData.todayAttendancePercentage || 0;
  const currentMonthFeeCollection = overviewData.currentMonthFeeCollection || 0;
  const pendingFeeAmount = overviewData.pendingFeeAmount || 0;
  const currentMonthExpenses = overviewData.currentMonthExpenses || 0;
  const netProfitLoss = overviewData.netProfitLoss || 0;
  const activeAttendanceDate = overviewData.activeAttendanceDate || 'N/A';
  const currentYear = new Date().getFullYear();
  
  const growthPoints = overviewData.growthData || [];
  const attendanceAnalytics = overviewData.attendanceAnalytics || { daily: [], weekly: [], monthly: [] };
  const attendanceList = attendanceAnalytics[attendanceFilter] || [];
  const revExpList = overviewData.monthlyData || [];
  const feeCounts = overviewData.feeStatusCounts || { paid: 0, partial: 0, pending: 0 };
  const classWiseDistribution = overviewData.classWiseDistribution || {};
  const genderCounts = overviewData.genderDistribution || { male: 0, female: 0 };
  const activitiesList = overviewData.activities || [];
  const eventsList = overviewData.events || [];

  // Helper: Format Currency in INR
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper: Get Activity Styles
  const getActivityIcon = (type) => {
    switch (type) {
      case 'finance': return { icon: <IndianRupee size={14} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'registration': return { icon: <UserPlusIcon size={14} />, color: 'hsl(var(--color-primary))', bg: 'rgba(99, 102, 241, 0.1)' };
      case 'alert': return { icon: <AlertCircle size={14} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      default: return { icon: <Activity size={14} />, color: 'hsl(var(--color-info))', bg: 'rgba(6, 182, 212, 0.1)' };
    }
  };

  // ==========================================
  // CHART CALCULATIONS & COORDINATES
  // ==========================================

  // 1. Growth Line Chart Coordinates
  const hasGrowthData = growthPoints.length > 0 && growthPoints.some(d => (d.students || 0) > 0 || (d.teachers || 0) > 0);
  const maxGrowthVal = growthPoints.length > 0 
    ? Math.max(...growthPoints.map(d => Math.max(d.students || 0, d.teachers || 0, 1))) 
    : 1;
  
  const studentPoints = growthPoints.map((d, i) => ({
    x: 60 + i * 43,
    y: 190 - ((d.students || 0) / maxGrowthVal) * 140
  }));
  
  const teacherPoints = growthPoints.map((d, i) => ({
    x: 60 + i * 43,
    y: 190 - ((d.teachers || 0) / maxGrowthVal) * 140
  }));

  const buildLinePath = (pts) => pts.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const buildAreaPath = (pts) => pts.length > 0 ? `${buildLinePath(pts)} L ${pts[pts.length - 1].x} 190 L ${pts[0].x} 190 Z` : '';

  // 2. Attendance Grouped Bar Coordinates
  const hasAttendanceData = attendanceList.length > 0 && attendanceList.some(d => (d.students || 0) > 0 || (d.teachers || 0) > 0);
  const attBarGroupWidth = attendanceList.length > 0 ? (500 / attendanceList.length) : 0;
  const attBarWidth = Math.max(8, attBarGroupWidth * 0.28);

  // 3. Revenue vs Expenses Grouped Bar Coordinates
  const hasRevExpData = revExpList.length > 0 && revExpList.some(d => (d.fees || 0) > 0 || (d.expenses || 0) > 0);
  const maxRevExpVal = revExpList.length > 0 
    ? Math.max(...revExpList.map(d => Math.max(d.fees || 0, d.expenses || 0, 1))) 
    : 1;
  const revExpGroupWidth = revExpList.length > 0 ? (500 / revExpList.length) : 0;
  const revExpBarWidth = 14;

  // 4. Fee Status Donut Chart Calculations
  const totalFeeRecords = (feeCounts.paid || 0) + (feeCounts.partial || 0) + (feeCounts.pending || 0);
  
  const paidPct = totalFeeRecords > 0 ? ((feeCounts.paid || 0) / totalFeeRecords) * 100 : 0;
  const partialPct = totalFeeRecords > 0 ? ((feeCounts.partial || 0) / totalFeeRecords) * 100 : 0;
  const pendingPct = totalFeeRecords > 0 ? ((feeCounts.pending || 0) / totalFeeRecords) * 100 : 0;

  const circ = 282.74; // 2 * PI * r (r=45)
  const paidLength = (paidPct / 100) * circ;
  const partialLength = (partialPct / 100) * circ;
  const pendingLength = (pendingPct / 100) * circ;

  const paidOffset = 0;
  const partialOffset = -paidLength;
  const pendingOffset = -(paidLength + partialLength);

  // 5. Student Distribution Donut Chart Calculations
  const totalGender = (genderCounts.male || 0) + (genderCounts.female || 0);
  const malePct = totalGender > 0 ? ((genderCounts.male || 0) / totalGender) * 100 : 0;
  const femalePct = totalGender > 0 ? ((genderCounts.female || 0) / totalGender) * 100 : 0;

  const maleLength = (malePct / 100) * circ;
  const femaleLength = (femalePct / 100) * circ;

  // Class-wise sorting & top 4 grouping
  const classEntries = Object.entries(classWiseDistribution)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const topClasses = classEntries.slice(0, 4);
  const classOthersCount = classEntries.slice(4).reduce((acc, entry) => acc + (entry[1] || 0), 0);
  
  const displayClasses = [...topClasses];
  if (classOthersCount > 0) {
    displayClasses.push(['Others', classOthersCount]);
  }
  const totalClassStudents = displayClasses.reduce((acc, c) => acc + (c[1] || 0), 0);
  
  // Calculate stroke properties for Class Donut segments
  let cumulativeClassPct = 0;
  const classSegments = displayClasses.map((item, idx) => {
    const pct = totalClassStudents > 0 ? ((item[1] || 0) / totalClassStudents) * 100 : 0;
    const len = (pct / 100) * circ;
    const offset = -(cumulativeClassPct / 100) * circ;
    cumulativeClassPct += pct;
    
    // Custom colors
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
    return {
      label: item[0],
      value: item[1] || 0,
      percent: pct,
      length: len,
      offset: offset,
      color: colors[idx % colors.length]
    };
  });

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      
      {/* SECTION 1: KEY PERFORMANCE TELEMETRY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* KPI Card 1: Total Students */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total Students</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', color: '#6366f1' }}>
              <Users size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {totalStudents}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Registered active registry</span>
        </div>

        {/* KPI Card 2: Total Teachers */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total Teachers</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.08)', color: '#ec4899' }}>
              <UserCheck size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {totalTeachers}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Academic faculty board</span>
        </div>

        {/* KPI Card 3: Total Staff */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total Staff</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.08)', color: '#06b6d4' }}>
              <UserCog size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {totalStaff}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Support staff members</span>
        </div>

        {/* KPI Card 4: Attendance Rate */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Attendance Rate</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
              <ClipboardCheck size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {todayAttendancePercentage}%
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Active date: {activeAttendanceDate}
          </span>
        </div>

        {/* KPI Card 5: Fees Collected */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Fee Collection</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
              <IndianRupee size={14} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatCurrency(currentMonthFeeCollection)}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>For the current month</span>
        </div>

        {/* KPI Card 6: Outstanding Fees */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Pending Amount</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
              <CreditCard size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatCurrency(pendingFeeAmount)}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total outstanding invoice dues</span>
        </div>

        {/* KPI Card 7: Monthly Expenses */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total Expenses</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
              <TrendingDown size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatCurrency(currentMonthExpenses)}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current month expenditures</span>
        </div>

        {/* KPI Card 8: Net Profit/Loss */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Net Profit/Loss</span>
            <div style={{ 
              padding: '8px', 
              borderRadius: '10px', 
              background: netProfitLoss >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
              color: netProfitLoss >= 0 ? '#10b981' : '#ef4444' 
            }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 800, 
            margin: '2px 0 0 0', 
            color: netProfitLoss >= 0 ? '#10b981' : '#ef4444',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {netProfitLoss < 0 ? '-' : ''}
            {formatCurrency(Math.abs(netProfitLoss))}
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Collection minus Expenses</span>
        </div>

      </div>

      {/* SECTION 2: CHARTS ROW 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Chart A: Student vs Teacher Growth (Line Chart) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Sparkles size={16} style={{ color: 'hsl(var(--color-primary))' }} /> Student vs Teacher Growth
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FY {currentYear}</span>
          </div>

          {!hasGrowthData ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-muted)', gap: '8px' }}>
              <Users size={32} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No growth data available</span>
              <span style={{ fontSize: '0.75rem' }}>Growth curves will appear when members register</span>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%' }}>
              {/* Responsive SVG */}
              <svg 
                viewBox="0 0 600 240" 
                style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const idx = Math.min(11, Math.max(0, Math.floor((x / rect.width) * 12)));
                  setGrowthHoverIdx(idx);
                }}
                onMouseLeave={() => setGrowthHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="teacherGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* X and Y grid lines */}
                {[50, 85, 120, 155, 190].map((y, idx) => (
                  <line key={idx} x1="50" y1={y} x2="560" y2={y} stroke="var(--border-glass)" strokeDasharray="4 4" strokeWidth="1" />
                ))}

                {/* Growth Gradients Areas */}
                <path d={buildAreaPath(studentPoints)} fill="url(#studentGrad)" style={{ transition: 'all 0.3s' }} />
                <path d={buildAreaPath(teacherPoints)} fill="url(#teacherGrad)" style={{ transition: 'all 0.3s' }} />

                {/* Paths */}
                <path d={buildLinePath(studentPoints)} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.3s' }} />
                <path d={buildLinePath(teacherPoints)} fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.3s' }} />

                {/* Render Axis labels */}
                {growthPoints.map((p, i) => (
                  <text key={i} x={60 + i * 43} y="215" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="600">
                    {p.month}
                  </text>
                ))}

                {/* Hover Line Marker */}
                {growthHoverIdx !== null && (
                  <line 
                    x1={60 + growthHoverIdx * 43} 
                    y1="40" 
                    x2={60 + growthHoverIdx * 43} 
                    y2="190" 
                    stroke="var(--text-muted)" 
                    strokeWidth="1" 
                    strokeDasharray="2 2" 
                  />
                )}

                {/* Point Circles */}
                {growthPoints.map((d, i) => {
                  const sPt = studentPoints[i];
                  const tPt = teacherPoints[i];
                  const isHovered = growthHoverIdx === i;
                  return (
                    <g key={i}>
                      {/* Students dot */}
                      {sPt && (
                        <circle 
                          cx={sPt.x} 
                          cy={sPt.y} 
                          r={isHovered ? 6 : 4} 
                          fill="#ffffff" 
                          stroke="#6366f1" 
                          strokeWidth={isHovered ? 3 : 2} 
                          style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                        />
                      )}
                      {/* Teachers dot */}
                      {tPt && (
                        <circle 
                          cx={tPt.x} 
                          cy={tPt.y} 
                          r={isHovered ? 5.5 : 3.5} 
                          fill="#ffffff" 
                          stroke="#ec4899" 
                          strokeWidth={isHovered ? 2.5 : 1.5} 
                          style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip positioned absolutely over parent */}
              {growthHoverIdx !== null && growthPoints[growthHoverIdx] && studentPoints[growthHoverIdx] && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  left: `${(studentPoints[growthHoverIdx].x / 600) * 100}%`,
                  transform: 'translateX(-50%)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-glass)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '130px'
                }}>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{growthPoints[growthHoverIdx].month} Growth</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6366f1', fontWeight: 600 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} /> Students
                    </span>
                    <span style={{ fontWeight: 700 }}>{growthPoints[growthHoverIdx].students || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ec4899', fontWeight: 600 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ec4899' }} /> Teachers
                    </span>
                    <span style={{ fontWeight: 700 }}>{growthPoints[growthHoverIdx].teachers || 0}</span>
                  </div>
                </div>
              )}

              {/* Chart Legend */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} /> Students Growth
                </span>
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }} /> Teachers Growth
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chart B: Attendance Analytics (Grouped Bar Chart with filters) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <ClipboardCheck size={18} style={{ color: '#10b981' }} /> Attendance Analytics
            </h3>
            
            {/* Filter Toggle Buttons */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              {['daily', 'weekly', 'monthly'].map(f => (
                <button
                  key={f}
                  onClick={() => {
                    setAttendanceFilter(f);
                    setAttendanceHoverIdx(null);
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    background: attendanceFilter === f ? 'var(--bg-glass-active)' : 'transparent',
                    color: attendanceFilter === f ? 'hsl(var(--color-primary))' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {!hasAttendanceData ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-muted)', gap: '8px' }}>
              <ClipboardCheck size={32} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No attendance records logged</span>
              <span style={{ fontSize: '0.75rem' }}>Charts will render once daily sheets are saved</span>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%' }}>
              <svg 
                viewBox="0 0 600 240" 
                style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const idx = Math.min(attendanceList.length - 1, Math.max(0, Math.floor((x / rect.width) * attendanceList.length)));
                  setAttendanceHoverIdx(idx);
                }}
                onMouseLeave={() => setAttendanceHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="attStudGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--color-primary))" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="attTeachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--color-info))" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[50, 85, 120, 155, 190].map((y, idx) => (
                  <line key={idx} x1="50" y1={y} x2="560" y2={y} stroke="var(--border-glass)" strokeDasharray="4 4" strokeWidth="1" />
                ))}

                {/* Bars */}
                {attendanceList.map((item, i) => {
                  const xBase = 60 + i * attBarGroupWidth;
                  const xStud = xBase + attBarGroupWidth * 0.15;
                  const xTeach = xStud + attBarWidth + 3;

                  const yStud = 190 - ((item.students || 0) / 100) * 140;
                  const hStud = ((item.students || 0) / 100) * 140;

                  const yTeach = 190 - ((item.teachers || 0) / 100) * 140;
                  const hTeach = ((item.teachers || 0) / 100) * 140;

                  const isHovered = attendanceHoverIdx === i;

                  return (
                    <g key={i}>
                      {/* Student Attendance Bar */}
                      <rect
                        x={xStud}
                        y={yStud}
                        width={attBarWidth}
                        height={Math.max(4, hStud)}
                        rx="3"
                        ry="3"
                        fill="url(#attStudGrad)"
                        opacity={isHovered ? 1.0 : 0.85}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                      {/* Teacher Attendance Bar */}
                      <rect
                        x={xTeach}
                        y={yTeach}
                        width={attBarWidth}
                        height={Math.max(4, hTeach)}
                        rx="3"
                        ry="3"
                        fill="url(#attTeachGrad)"
                        opacity={isHovered ? 1.0 : 0.85}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                      {/* Label */}
                      <text 
                        x={xBase + attBarGroupWidth * 0.5} 
                        y="215" 
                        textAnchor="middle" 
                        fill="var(--text-muted)" 
                        fontSize="9" 
                        fontWeight="600"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {attendanceHoverIdx !== null && attendanceList.length > 0 && attendanceList[attendanceHoverIdx] && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  left: `${((60 + attendanceHoverIdx * attBarGroupWidth + attBarGroupWidth * 0.5) / 600) * 100}%`,
                  transform: 'translateX(-50%)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-glass)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '130px'
                }}>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{attendanceList[attendanceHoverIdx].label}</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'hsl(var(--color-primary))', fontWeight: 600 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--color-primary))' }} /> Students
                    </span>
                    <span style={{ fontWeight: 700 }}>{attendanceList[attendanceHoverIdx].students || 0}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'hsl(var(--color-info))', fontWeight: 600 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--color-info))' }} /> Teachers
                    </span>
                    <span style={{ fontWeight: 700 }}>{attendanceList[attendanceHoverIdx].teachers || 0}%</span>
                  </div>
                </div>
              )}

              {/* Chart Legend */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'hsl(var(--color-primary))' }} /> Students
                </span>
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'hsl(var(--color-info))' }} /> Teachers
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SECTION 3: CHARTS ROW 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Chart C: Revenue vs Expenses (Bar Chart) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <BarChart3 size={18} style={{ color: '#10b981' }} /> Revenue vs Expenses
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Trailing 6 Months</span>
          </div>

          {!hasRevExpData ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', gap: '8px' }}>
              <BarChart3 size={32} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No financial data logged</span>
              <span style={{ fontSize: '0.75rem' }}>Revenue tracking requires invoice payments</span>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%' }}>
              <svg 
                viewBox="0 0 600 220" 
                style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const idx = Math.min(revExpList.length - 1, Math.max(0, Math.floor((x / rect.width) * revExpList.length)));
                  setRevenueHoverIdx(idx);
                }}
                onMouseLeave={() => setRevenueHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[50, 85, 120, 155, 190].map((y, idx) => (
                  <line key={idx} x1="60" y1={y} x2="560" y2={y} stroke="var(--border-glass)" strokeDasharray="4 4" strokeWidth="1" />
                ))}

                {/* Bars */}
                {revExpList.map((item, i) => {
                  const xBase = 60 + i * revExpGroupWidth;
                  const xRev = xBase + revExpGroupWidth * 0.15;
                  const xExp = xRev + revExpBarWidth + 4;

                  const yRev = 190 - ((item.fees || 0) / maxRevExpVal) * 140;
                  const hRev = ((item.fees || 0) / maxRevExpVal) * 140;

                  const yExp = 190 - ((item.expenses || 0) / maxRevExpVal) * 140;
                  const hExp = ((item.expenses || 0) / maxRevExpVal) * 140;

                  const isHovered = revenueHoverIdx === i;

                  return (
                    <g key={i}>
                      {/* Revenue Bar */}
                      <rect
                        x={xRev}
                        y={yRev}
                        width={revExpBarWidth}
                        height={Math.max(4, hRev)}
                        rx="3"
                        ry="3"
                        fill="url(#revGrad)"
                        opacity={isHovered ? 1.0 : 0.85}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                      {/* Expense Bar */}
                      <rect
                        x={xExp}
                        y={yExp}
                        width={revExpBarWidth}
                        height={Math.max(4, hExp)}
                        rx="3"
                        ry="3"
                        fill="url(#expGrad)"
                        opacity={isHovered ? 1.0 : 0.85}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                      {/* Label */}
                      <text 
                        x={xBase + revExpGroupWidth * 0.5} 
                        y="212" 
                        textAnchor="middle" 
                        fill="var(--text-muted)" 
                        fontSize="9" 
                        fontWeight="600"
                      >
                        {(item.month || '').split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {revenueHoverIdx !== null && revExpList.length > 0 && revExpList[revenueHoverIdx] && (
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: `${((60 + revenueHoverIdx * revExpGroupWidth + revExpGroupWidth * 0.5) / 600) * 100}%`,
                  transform: 'translateX(-50%)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-glass)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '150px'
                }}>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{revExpList[revenueHoverIdx].month}</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 600 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Revenue
                    </span>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(revExpList[revenueHoverIdx].fees || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 600 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} /> Expenses
                    </span>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(revExpList[revenueHoverIdx].expenses || 0)}</span>
                  </div>
                </div>
              )}

              {/* Chart Legend */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} /> Revenue
                </span>
                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }} /> Expenses
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chart D: Fee Collection Status (Donut Chart) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <PieChart size={18} style={{ color: 'hsl(var(--color-secondary))' }} /> Fee Collection Status
          </h3>

          {totalFeeRecords === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', gap: '8px' }}>
              <PieChart size={32} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No invoice records available</span>
              <span style={{ fontSize: '0.75rem' }}>Collection split will show up here</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', height: '100%' }}>
              
              <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                  {/* Background Circle */}
                  <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />

                  {/* Paid Segment */}
                  {paidLength > 0 && (
                    <circle
                      cx="55" cy="55" r="45" fill="none"
                      stroke="#10b981" strokeWidth={feeStatusHoverIdx === 'paid' ? 15 : 12}
                      strokeDasharray={`${paidLength} ${circ}`} strokeDashoffset={paidOffset}
                      strokeLinecap="round" style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                      onMouseEnter={() => setFeeStatusHoverIdx('paid')}
                      onMouseLeave={() => setFeeStatusHoverIdx(null)}
                    />
                  )}

                  {/* Partial Segment */}
                  {partialLength > 0 && (
                    <circle
                      cx="55" cy="55" r="45" fill="none"
                      stroke="#f59e0b" strokeWidth={feeStatusHoverIdx === 'partial' ? 15 : 12}
                      strokeDasharray={`${partialLength} ${circ}`} strokeDashoffset={partialOffset}
                      strokeLinecap="round" style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                      onMouseEnter={() => setFeeStatusHoverIdx('partial')}
                      onMouseLeave={() => setFeeStatusHoverIdx(null)}
                    />
                  )}

                  {/* Pending Segment */}
                  {pendingLength > 0 && (
                    <circle
                      cx="55" cy="55" r="45" fill="none"
                      stroke="#ef4444" strokeWidth={feeStatusHoverIdx === 'pending' ? 15 : 12}
                      strokeDasharray={`${pendingLength} ${circ}`} strokeDashoffset={pendingOffset}
                      strokeLinecap="round" style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                      onMouseEnter={() => setFeeStatusHoverIdx('pending')}
                      onMouseLeave={() => setFeeStatusHoverIdx(null)}
                    />
                  )}
                </svg>

                {/* Center text details */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {feeStatusHoverIdx === 'paid' ? `${Math.round(paidPct)}%` : 
                     feeStatusHoverIdx === 'partial' ? `${Math.round(partialPct)}%` : 
                     feeStatusHoverIdx === 'pending' ? `${Math.round(pendingPct)}%` : 
                     totalFeeRecords}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px', fontWeight: 600 }}>
                    {feeStatusHoverIdx ? feeStatusHoverIdx : 'Invoices'}
                  </span>
                </div>
              </div>

              {/* Legends with Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '110px' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', fontSize: '0.78rem', gap: '8px', opacity: (feeStatusHoverIdx && feeStatusHoverIdx !== 'paid') ? 0.4 : 1, transition: 'all 0.2s', cursor: 'default' }}
                  onMouseEnter={() => setFeeStatusHoverIdx('paid')}
                  onMouseLeave={() => setFeeStatusHoverIdx(null)}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ color: 'var(--text-muted)', flex: 1, fontWeight: 500 }}>Paid</span>
                  <strong style={{ marginLeft: 'auto' }}>{feeCounts.paid || 0}</strong>
                </div>
                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', fontSize: '0.78rem', gap: '8px', opacity: (feeStatusHoverIdx && feeStatusHoverIdx !== 'partial') ? 0.4 : 1, transition: 'all 0.2s', cursor: 'default' }}
                  onMouseEnter={() => setFeeStatusHoverIdx('partial')}
                  onMouseLeave={() => setFeeStatusHoverIdx(null)}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ color: 'var(--text-muted)', flex: 1, fontWeight: 500 }}>Partial</span>
                  <strong style={{ marginLeft: 'auto' }}>{feeCounts.partial || 0}</strong>
                </div>
                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', fontSize: '0.78rem', gap: '8px', opacity: (feeStatusHoverIdx && feeStatusHoverIdx !== 'pending') ? 0.4 : 1, transition: 'all 0.2s', cursor: 'default' }}
                  onMouseEnter={() => setFeeStatusHoverIdx('pending')}
                  onMouseLeave={() => setFeeStatusHoverIdx(null)}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ color: 'var(--text-muted)', flex: 1, fontWeight: 500 }}>Due</span>
                  <strong style={{ marginLeft: 'auto' }}>{feeCounts.pending || 0}</strong>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Chart E: Student Distribution (Donut Chart) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Users size={18} style={{ color: 'hsl(var(--color-primary))' }} /> Student Distribution
            </h3>

            {/* Filter Toggle Buttons */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              {['class-wise', 'gender'].map(f => (
                <button
                  key={f}
                  onClick={() => {
                    setStudentDistFilter(f);
                    setStudentDistHoverIdx(null);
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: studentDistFilter === f ? 'var(--bg-glass-active)' : 'transparent',
                    color: studentDistFilter === f ? 'hsl(var(--color-primary))' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {f === 'class-wise' ? 'Grade' : 'Gender'}
                </button>
              ))}
            </div>
          </div>

          {(studentDistFilter === 'gender' ? totalGender === 0 : totalClassStudents === 0) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', gap: '8px' }}>
              <Users size={32} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No demographic data</span>
              <span style={{ fontSize: '0.75rem' }}>Registered students will generate metrics</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', height: '100%' }}>
              
              <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                  <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />

                  {studentDistFilter === 'gender' ? (
                    <>
                      {/* Male Segment */}
                      {maleLength > 0 && (
                        <circle
                          cx="55" cy="55" r="45" fill="none"
                          stroke="#6366f1" strokeWidth={studentDistHoverIdx === 'male' ? 15 : 12}
                          strokeDasharray={`${maleLength} ${circ}`} strokeDashoffset={0}
                          strokeLinecap="round" style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                          onMouseEnter={() => setStudentDistHoverIdx('male')}
                          onMouseLeave={() => setStudentDistHoverIdx(null)}
                        />
                      )}
                      {/* Female Segment */}
                      {femaleLength > 0 && (
                        <circle
                          cx="55" cy="55" r="45" fill="none"
                          stroke="#ec4899" strokeWidth={studentDistHoverIdx === 'female' ? 15 : 12}
                          strokeDasharray={`${femaleLength} ${circ}`} strokeDashoffset={-maleLength}
                          strokeLinecap="round" style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                          onMouseEnter={() => setStudentDistHoverIdx('female')}
                          onMouseLeave={() => setStudentDistHoverIdx(null)}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {/* Class-wise Segments */}
                      {classSegments.map((seg, i) => (
                        seg.length > 0 && (
                          <circle
                            key={i}
                            cx="55" cy="55" r="45" fill="none"
                            stroke={seg.color} strokeWidth={studentDistHoverIdx === i ? 15 : 12}
                            strokeDasharray={`${seg.length} ${circ}`} strokeDashoffset={seg.offset}
                            strokeLinecap="round" style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                            onMouseEnter={() => setStudentDistHoverIdx(i)}
                            onMouseLeave={() => setStudentDistHoverIdx(null)}
                          />
                        )
                      ))}
                    </>
                  )}
                </svg>

                {/* Center text details */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {studentDistFilter === 'gender' ? (
                      studentDistHoverIdx === 'male' ? `${Math.round(malePct)}%` :
                      studentDistHoverIdx === 'female' ? `${Math.round(femalePct)}%` :
                      totalGender
                    ) : (
                      studentDistHoverIdx !== null && classSegments[studentDistHoverIdx] ? `${Math.round(classSegments[studentDistHoverIdx].percent)}%` :
                      totalClassStudents
                    )}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px', fontWeight: 600 }}>
                    {studentDistFilter === 'gender' ? (
                      studentDistHoverIdx ? studentDistHoverIdx : 'Students'
                    ) : (
                      studentDistHoverIdx !== null && classSegments[studentDistHoverIdx] ? classSegments[studentDistHoverIdx].label : 'Students'
                    )}
                  </span>
                </div>
              </div>

              {/* Legends with Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '110px', maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
                {studentDistFilter === 'gender' ? (
                  <>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', fontSize: '0.78rem', gap: '8px', opacity: (studentDistHoverIdx && studentDistHoverIdx !== 'male') ? 0.4 : 1, transition: 'all 0.2s', cursor: 'default' }}
                      onMouseEnter={() => setStudentDistHoverIdx('male')}
                      onMouseLeave={() => setStudentDistHoverIdx(null)}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
                      <span style={{ color: 'var(--text-muted)', flex: 1, fontWeight: 500 }}>Boys</span>
                      <strong style={{ marginLeft: 'auto' }}>{genderCounts.male || 0}</strong>
                    </div>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', fontSize: '0.78rem', gap: '8px', opacity: (studentDistHoverIdx && studentDistHoverIdx !== 'female') ? 0.4 : 1, transition: 'all 0.2s', cursor: 'default' }}
                      onMouseEnter={() => setStudentDistHoverIdx('female')}
                      onMouseLeave={() => setStudentDistHoverIdx(null)}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }} />
                      <span style={{ color: 'var(--text-muted)', flex: 1, fontWeight: 500 }}>Girls</span>
                      <strong style={{ marginLeft: 'auto' }}>{genderCounts.female || 0}</strong>
                    </div>
                  </>
                ) : (
                  classSegments.map((seg, i) => (
                    <div 
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', fontSize: '0.78rem', gap: '8px', opacity: (studentDistHoverIdx !== null && studentDistHoverIdx !== i) ? 0.4 : 1, transition: 'all 0.2s', cursor: 'default' }}
                      onMouseEnter={() => setStudentDistHoverIdx(i)}
                      onMouseLeave={() => setStudentDistHoverIdx(null)}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: seg.color }} />
                      <span style={{ color: 'var(--text-muted)', flex: 1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Grade {seg.label}
                      </span>
                      <strong style={{ marginLeft: 'auto' }}>{seg.value}</strong>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* SECTION 4: ACTIONS & WIDGETS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Widget A: Recent Activities Feed */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Activity size={18} style={{ color: 'hsl(var(--color-primary))' }} /> Recent Activities
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }}>
            {activitiesList.length > 0 ? (
              activitiesList.map((act, i) => {
                const styles = getActivityIcon(act.type);
                return (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: styles.bg,
                      color: styles.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyItems: 'center',
                      flexShrink: 0
                    }}>
                      {styles.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}>
                        {act.title}
                      </span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
                        {act.desc}
                      </p>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={10} /> {new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '180px', color: 'var(--text-muted)', gap: '6px' }}>
                <Activity size={24} style={{ opacity: 0.4 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>No recent activities</span>
              </div>
            )}
          </div>
        </div>

        {/* Widget B: Upcoming Events Calendar */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Calendar size={18} style={{ color: 'hsl(var(--color-secondary))' }} /> Upcoming Events
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '280px', paddingRight: '4px' }}>
            {eventsList.length > 0 ? (
              eventsList.map((evt, i) => {
                const colors = {
                  Exam: { text: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.15)' },
                  Holiday: { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.15)' },
                  Meeting: { text: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.15)' },
                  Event: { text: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.15)' }
                };
                const style = colors[evt.type] || { text: 'hsl(var(--color-primary))', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.15)' };

                return (
                  <div key={i} style={{ 
                    padding: '12px 14px', 
                    borderRadius: '12px', 
                    background: 'var(--bg-glass-active)', 
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        padding: '3px 8px', 
                        borderRadius: '20px', 
                        fontSize: '0.62rem', 
                        fontWeight: 700, 
                        color: style.text, 
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        textTransform: 'uppercase'
                      }}>{evt.type || 'Event'}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {evt.date ? new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{evt.title}</strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', gap: '10px' }}>
                      <span>{evt.time}</span>
                      <span>{evt.description}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '180px', color: 'var(--text-muted)', gap: '6px' }}>
                <Calendar size={24} style={{ opacity: 0.4 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>No upcoming events scheduled</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
