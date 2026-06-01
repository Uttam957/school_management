import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, DollarSign, CreditCard, Users, UserCheck, TrendingUp, TrendingDown,
  PieChart, FileText, Download, Search, Filter, Plus, CheckCircle, AlertCircle,
  Loader2, Calculator, Receipt, Wallet, Building2, ArrowUpRight, ArrowDownRight,
  ChevronDown, Printer, X, IndianRupee, BookOpen, Banknote, HandCoins, CircleDollarSign,
  ClipboardList, BarChart3, Calendar, Eye, UserCog, UserPlus, Pencil, Trash2
} from 'lucide-react';

import StudentDirectory from './StudentDirectory';
import TeacherList from './TeacherList';
import StaffDirectory from './StaffDirectory';
import RegisterStudent from './RegisterStudent';
import AddTeacher from './AddTeacher';
import AddStaff from './AddStaff';

export default function AccountantPanel({ setActiveView, onLogout, accountantView, setAccountantView }) {
  const [notification, setNotification] = useState(null);
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const renderContent = () => {
    switch (accountantView) {
      case 'collect-fees': return <CollectFeesView showToast={showToast} />;
      case 'fee-structure': return <FeeStructureView showToast={showToast} />;
      case 'payroll': return <PayrollView showToast={showToast} />;
      case 'teacher-pay-structure': return <TeacherSalaryStructureView showToast={showToast} />;
      case 'expenses': return <ExpensesView showToast={showToast} />;
      case 'income': return <IncomeView showToast={showToast} />;
      case 'reports': return <ReportsView showToast={showToast} />;
      case 'staff-pay': return <StaffPaymentsView showToast={showToast} />;
      case 'staff-pay-structure': return <StaffPaymentStructureView showToast={showToast} />;
      case 'students': return <StudentDirectory />;
      case 'teacher-list': return <TeacherList setActiveView={setActiveView} readOnly={true} />;
      case 'staff': return <StaffDirectory readOnly={true} />;
      case 'register-student':
        return <RegisterStudent setActiveView={(view) => { if (view === 'students') setAccountantView('students'); else setActiveView(view); }} />;
      case 'add-teacher':
        return <AddTeacher setActiveView={(view) => { if (view === 'teacher-list') setAccountantView('teacher-list'); else setActiveView(view); }} />;
      case 'add-staff':
        return <AddStaff setActiveView={(view) => { if (view === 'staff') setAccountantView('staff'); else setActiveView(view); }} />;
      default: return <DashboardView setAccountantView={setAccountantView} />;
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', padding: '16px 24px', borderRadius: '12px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444', color: '#fff',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
          gap: '10px', zIndex: 999999, fontWeight: 600, animation: 'slideInRight 0.3s ease forwards'
        }}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calculator size={24} style={{ color: '#10b981' }} />
            {accountantView === 'dashboard' ? 'Finance Dashboard' :
             accountantView === 'collect-fees' ? 'Student Fee Collection' :
             accountantView === 'fee-structure' ? 'Fee Structure Configuration' :
             accountantView === 'payroll' ? 'Teacher Payroll Management' :
             accountantView === 'teacher-pay-structure' ? 'Teacher Pay Structure' :
             accountantView === 'expenses' ? 'Expense Tracker' :
             accountantView === 'income' ? 'Income Tracker' :
             accountantView === 'reports' ? 'Financial Reports' :
             accountantView === 'staff-pay' ? 'Staff Salary Payments' :
             accountantView === 'staff-pay-structure' ? 'Staff Payment Structure' :
             accountantView === 'students' ? 'Student Directory' :
             accountantView === 'teacher-list' ? 'Teacher Directory' :
             accountantView === 'staff' ? 'Staff Directory' :
             accountantView === 'register-student' ? 'Register Student' :
             accountantView === 'add-teacher' ? 'Add Teacher' :
             accountantView === 'add-staff' ? 'Add Staff' : 'Finance Dashboard'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Comprehensive financial management and accounting portal
          </p>
        </div>
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)', padding: '6px 16px', borderRadius: '30px',
          border: '1px solid rgba(16, 185, 129, 0.15)', fontSize: '0.78rem', fontWeight: 600, color: '#10b981'
        }}>
          FY 2026-2027
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

/* ============================================================
   DASHBOARD VIEW - Overview cards + charts
   ============================================================ */
function DashboardView({ setAccountantView }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/finance/overview')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '12px' }}>
      <Loader2 className="animate-spin" size={32} style={{ color: '#10b981' }} />
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading financial data...</p>
    </div>
  );

  const cards = [
    { label: 'Total Fee Collection', value: `₹${(data?.totalFeeCollected || 0).toLocaleString()}`, icon: IndianRupee, color: '#10b981', bg: 'rgba(16,185,129,0.08)', trend: '+12.5%', up: true },
    { label: 'Pending Fees', value: `₹${(data?.totalPendingFees || 0).toLocaleString()}`, icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', trend: `${data?.totalFeeRecords || 0} records`, up: false },
    { label: 'Monthly Expenses', value: `₹${(data?.totalExpenses || 0).toLocaleString()}`, icon: TrendingDown, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', trend: '-3.2%', up: false },
    { label: 'Net Profit', value: `₹${(data?.netProfit || 0).toLocaleString()}`, icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', trend: '+8.1%', up: true },
    { label: 'Total Payroll Paid', value: `₹${(data?.totalPayrollPaid || 0).toLocaleString()}`, icon: Banknote, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', trend: `${data?.totalTeachers || 0} teachers`, up: true },
    { label: 'Other Income', value: `₹${(data?.totalIncome || 0).toLocaleString()}`, icon: HandCoins, color: '#ec4899', bg: 'rgba(236,72,153,0.08)', trend: 'Grants & Donations', up: true },
  ];

  const quickActions = [
    { label: 'Collect Fees', icon: Receipt, view: 'collect-fees', color: '#10b981' },
    { label: 'Fee Structure', icon: BookOpen, view: 'fee-structure', color: '#3b82f6' },
    { label: 'Process Payroll', icon: Banknote, view: 'payroll', color: '#8b5cf6' },
    { label: 'Teacher Pay Structure', icon: Calculator, view: 'teacher-pay-structure', color: '#10b981' },
    { label: 'Staff Payments', icon: UserCog, view: 'staff-pay', color: '#ec4899' },
    { label: 'Staff Pay Structure', icon: Calculator, view: 'staff-pay-structure', color: '#14b8a6' },
    { label: 'Add Expense', icon: TrendingDown, view: 'expenses', color: '#ef4444' },
    { label: 'Add Income', icon: TrendingUp, view: 'income', color: '#f59e0b' },
    { label: 'View Reports', icon: BarChart3, view: 'reports', color: '#06b6d4' },
    { label: 'Student Directory', icon: Users, view: 'students', color: '#14b8a6' },
    { label: 'Teacher Directory', icon: UserCheck, view: 'teacher-list', color: '#f97316' },
    { label: 'Staff Directory', icon: UserCog, view: 'staff', color: '#a855f7' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-panel" style={{
              padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px',
              background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.25s ease', cursor: 'default'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = `${card.color}33`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', background: card.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={22} style={{ color: card.color }} />
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, color: card.up ? '#10b981' : '#f59e0b',
                  display: 'flex', alignItems: 'center', gap: '2px', background: card.up ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                  padding: '3px 8px', borderRadius: '20px'
                }}>
                  {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.trend}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</p>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CircleDollarSign size={18} style={{ color: '#10b981' }} /> Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <div key={i} className="glass-panel admin-dash-card" onClick={() => setAccountantView(action.view)} style={{
                padding: '20px', cursor: 'pointer', borderRadius: '14px', transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={22} style={{ color: action.color }} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{action.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Chart (CSS-based bar chart) */}
      {data?.monthlyData && data.monthlyData.length > 0 && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: '#10b981' }} /> Monthly Revenue vs Expenses (Last 6 Months)
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '200px', padding: '0 10px' }}>
            {data.monthlyData.map((m, i) => {
              const maxVal = Math.max(...data.monthlyData.map(d => Math.max(d.fees, d.expenses, 1)));
              const feeH = maxVal > 0 ? (m.fees / maxVal) * 160 : 4;
              const expH = maxVal > 0 ? (m.expenses / maxVal) * 160 : 4;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '170px' }}>
                    <div style={{
                      width: '20px', height: `${Math.max(feeH, 4)}px`, borderRadius: '4px 4px 0 0',
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)', transition: 'height 0.5s ease',
                      minHeight: '4px'
                    }} title={`Fees: ₹${m.fees.toLocaleString()}`} />
                    <div style={{
                      width: '20px', height: `${Math.max(expH, 4)}px`, borderRadius: '4px 4px 0 0',
                      background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)', transition: 'height 0.5s ease',
                      minHeight: '4px'
                    }} title={`Expenses: ₹${m.expenses.toLocaleString()}`} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.month}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} /> Revenue
            </span>
            <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }} /> Expenses
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COLLECT FEES VIEW
   ============================================================ */
export function CollectFeesView({ showToast }) {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feeStructures, setFeeStructures] = useState([]);
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    studentId: '', studentName: '', admissionNumber: '', studentClass: '', section: '',
    feeType: 'Tuition Fee', amount: '', discount: '0', fine: '0', paidAmount: '', paymentMethod: 'Cash', remarks: ''
  });
  const [receiptData, setReceiptData] = useState(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  useEffect(() => {
    if (!showForm) {
      setStudentSearchQuery('');
      setShowStudentDropdown(false);
    }
  }, [showForm]);

  const classes = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const feeTypes = ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Transport Fee', 'Library Fee', 'Hostel Fee', 'Other Charges'];

  const fetchFees = () => {
    const params = new URLSearchParams();
    if (filterClass !== 'All') params.set('studentClass', filterClass);
    if (filterStatus !== 'All') params.set('status', filterStatus);
    if (search) params.set('search', search);
    fetch(`/api/finance/fees?${params}`)
      .then(r => r.json())
      .then(d => { setFees(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchStudents = () => {
    fetch('/api/students?limit=1000')
      .then(r => r.json())
      .then(d => setStudents(d.students || []))
      .catch(() => {});

    fetch('/api/finance/fee-structures')
      .then(r => r.json())
      .then(d => setFeeStructures(d))
      .catch(() => {});
  };

  useEffect(() => { fetchFees(); fetchStudents(); }, [filterClass, filterStatus, search]);

  const selectStudent = (stu) => {
    if (stu) {
      const fstr = feeStructures.find(f => f.studentClass === stu.studentClass);
      let defaultAmount = '';
      if (fstr) {
        if (form.feeType === 'Tuition Fee') defaultAmount = fstr.tuitionFee;
        else if (form.feeType === 'Admission Fee') defaultAmount = fstr.admissionFee;
        else if (form.feeType === 'Exam Fee') defaultAmount = fstr.examFee;
        else if (form.feeType === 'Transport Fee') defaultAmount = fstr.transportFee;
        else if (form.feeType === 'Library Fee') defaultAmount = fstr.libraryFee;
        else if (form.feeType === 'Hostel Fee') defaultAmount = fstr.hostelFee;
        else if (form.feeType === 'Other Charges') defaultAmount = fstr.otherCharges;
      }

      setForm(prev => ({
        ...prev,
        studentId: stu.id,
        studentName: stu.fullName || stu.name,
        admissionNumber: stu.admissionNumber,
        studentClass: stu.studentClass,
        section: stu.section,
        amount: defaultAmount ? String(defaultAmount) : '',
        paidAmount: defaultAmount ? String(defaultAmount) : ''
      }));
      setStudentSearchQuery(stu.fullName || stu.name);
      setShowStudentDropdown(false);
    } else {
      setForm(prev => ({
        ...prev,
        studentId: '',
        studentName: '',
        admissionNumber: '',
        studentClass: '',
        section: '',
        amount: '',
        paidAmount: ''
      }));
      setStudentSearchQuery('');
    }
  };

  const handleStudentSelect = (e) => {
    const stu = students.find(s => s.id === e.target.value);
    if (stu) {
      const fstr = feeStructures.find(f => f.studentClass === stu.studentClass);
      let defaultAmount = '';
      if (fstr) {
        if (form.feeType === 'Tuition Fee') defaultAmount = fstr.tuitionFee;
        else if (form.feeType === 'Admission Fee') defaultAmount = fstr.admissionFee;
        else if (form.feeType === 'Exam Fee') defaultAmount = fstr.examFee;
        else if (form.feeType === 'Transport Fee') defaultAmount = fstr.transportFee;
        else if (form.feeType === 'Library Fee') defaultAmount = fstr.libraryFee;
        else if (form.feeType === 'Hostel Fee') defaultAmount = fstr.hostelFee;
        else if (form.feeType === 'Other Charges') defaultAmount = fstr.otherCharges;
      }

      setForm(prev => ({
        ...prev,
        studentId: stu.id,
        studentName: stu.fullName || stu.name,
        admissionNumber: stu.admissionNumber,
        studentClass: stu.studentClass,
        section: stu.section,
        amount: defaultAmount ? String(defaultAmount) : '',
        paidAmount: defaultAmount ? String(defaultAmount) : ''
      }));
    } else {
      setForm(prev => ({
        ...prev,
        studentId: '',
        studentName: '',
        admissionNumber: '',
        studentClass: '',
        section: '',
        amount: '',
        paidAmount: ''
      }));
    }
  };

  const handleFeeTypeChange = (newFeeType, selectedStudentId = form.studentId) => {
    const stu = students.find(s => s.id === selectedStudentId);
    let defaultAmount = '';
    if (stu) {
      const fstr = feeStructures.find(f => f.studentClass === stu.studentClass);
      if (fstr) {
        if (newFeeType === 'Tuition Fee') defaultAmount = fstr.tuitionFee;
        else if (newFeeType === 'Admission Fee') defaultAmount = fstr.admissionFee;
        else if (newFeeType === 'Exam Fee') defaultAmount = fstr.examFee;
        else if (newFeeType === 'Transport Fee') defaultAmount = fstr.transportFee;
        else if (newFeeType === 'Library Fee') defaultAmount = fstr.libraryFee;
        else if (newFeeType === 'Hostel Fee') defaultAmount = fstr.hostelFee;
        else if (newFeeType === 'Other Charges') defaultAmount = fstr.otherCharges;
      }
    }
    setForm(prev => ({
      ...prev,
      feeType: newFeeType,
      amount: defaultAmount ? String(defaultAmount) : prev.amount,
      paidAmount: defaultAmount ? String(defaultAmount) : prev.paidAmount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Fee collected successfully! Receipt: ${data.receiptNumber}`);
        setReceiptData(data);
        setShowForm(false);
        setForm({ studentId: '', studentName: '', admissionNumber: '', studentClass: '', section: '',
          feeType: 'Tuition Fee', amount: '', discount: '0', fine: '0', paidAmount: '', paymentMethod: 'Cash', remarks: '' });
        fetchFees();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to collect fee', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' };
  const optionStyle = { background: '#131324', color: '#fff' };

  const filteredStudentsForSelect = students.filter(s => {
    const name = (s.fullName || s.name || '').toLowerCase();
    const admNo = (s.admissionNumber || '').toLowerCase();
    const className = (s.studentClass || '').toLowerCase();
    const sec = (s.section || '').toLowerCase();
    const query = studentSearchQuery.toLowerCase();
    return name.includes(query) || admNo.includes(query) || `${className}-${sec}`.includes(query) || className.includes(query);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Receipt Modal */}
      {receiptData && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
        }} onClick={() => setReceiptData(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '440px', background: '#1a1a2e', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <CheckCircle size={40} style={{ color: '#10b981', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Payment Receipt</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{receiptData.receiptNumber}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                ['Student', receiptData.studentName],
                ['Class', `${receiptData.studentClass}-${receiptData.section}`],
                ['Fee Type', receiptData.feeType],
                ['Amount', `₹${receiptData.amount?.toLocaleString()}`],
                ['Discount', `₹${receiptData.discount?.toLocaleString()}`],
                ['Fine', `₹${receiptData.fine?.toLocaleString()}`],
                ['Total', `₹${receiptData.totalAmount?.toLocaleString()}`],
                ['Paid', `₹${receiptData.paidAmount?.toLocaleString()}`],
                ['Due', `₹${receiptData.dueAmount?.toLocaleString()}`],
                ['Method', receiptData.paymentMethod],
                ['Date', receiptData.paymentDate],
                ['Transaction', receiptData.transactionId],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => window.print()} style={{
                flex: 1, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem'
              }}>
                <Printer size={16} /> Print Receipt
              </button>
              <button onClick={() => setReceiptData(null)} style={{
                padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
              }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none',
          borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '6px', fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(16,185,129,0.2)'
        }}>
          <Plus size={16} /> Collect New Fee
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, receipt..."
            style={{ ...inputStyle, paddingLeft: '36px', width: '220px' }} />
        </div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ ...inputStyle, width: '120px', cursor: 'pointer' }}>
          <option value="All" style={optionStyle}>All Classes</option>
          {classes.map(c => <option key={c} value={c} style={optionStyle}>Grade {c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: '120px', cursor: 'pointer' }}>
          <option value="All" style={optionStyle}>All Status</option>
          <option value="Paid" style={optionStyle}>Paid</option>
          <option value="Pending" style={optionStyle}>Pending</option>
          <option value="Partial" style={optionStyle}>Partial</option>
        </select>
      </div>

      {/* Collection Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="glass-panel animate-scale-up" style={{
            width: '100%', maxWidth: '650px', background: '#131324', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <Receipt size={22} style={{ color: '#10b981' }} /> New Fee Collection
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Select Student</label>
                  <input 
                    type="text" 
                    placeholder="Type student name to search..." 
                    value={studentSearchQuery} 
                    onChange={(e) => {
                      setStudentSearchQuery(e.target.value);
                      setShowStudentDropdown(true);
                      if (!e.target.value) {
                        selectStudent(null);
                      }
                    }} 
                    onFocus={() => setShowStudentDropdown(true)}
                    onBlur={() => setTimeout(() => setShowStudentDropdown(false), 250)}
                    style={inputStyle}
                  />
                  {showStudentDropdown && studentSearchQuery && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      background: '#131324',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      zIndex: 1000,
                      marginTop: '4px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                      {filteredStudentsForSelect.length === 0 ? (
                        <div style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No matches found</div>
                      ) : (
                        filteredStudentsForSelect.slice(0, 10).map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => selectStudent(s)}
                            style={{
                              padding: '10px 14px',
                              fontSize: '0.85rem',
                              color: '#fff',
                              cursor: 'pointer',
                              borderBottom: '1px solid rgba(255,255,255,0.02)',
                              transition: 'background 0.15s',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span>{s.fullName || s.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Grade {s.studentClass}-{s.section}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Fee Type</label>
                  <select value={form.feeType} onChange={e => handleFeeTypeChange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {feeTypes.map(f => <option key={f} value={f} style={optionStyle}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Amount (₹)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="12000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Discount (₹)</label>
                  <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Fine (₹)</label>
                  <input type="number" value={form.fine} onChange={e => setForm({ ...form, fine: e.target.value })} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Paid Amount (₹)</label>
                  <input type="number" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} placeholder="Full amount" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Online'].map(m => <option key={m} value={m} style={optionStyle}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Remarks</label>
                  <input value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Optional note" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}><X size={16} /> Close</button>
                <button type="submit" style={{
                  padding: '12px 28px', background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', transition: 'transform 0.15s, opacity 0.2s'
                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                   onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}><CheckCircle size={16} /> Collect & Generate Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fees Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Receipt #', 'Student', 'Class', 'Fee Type', 'Amount', 'Paid', 'Due', 'Status', 'Method', 'Date'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <Loader2 className="animate-spin" size={20} style={{ marginRight: '8px' }} /> Loading...
                </td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No fee records found. Click "Collect New Fee" to get started.
                </td></tr>
              ) : (
                fees.slice(0, 50).map((fee, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{fee.receiptNumber}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{fee.studentName}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fee.studentClass}-{fee.section}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fee.feeType}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>₹{fee.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>₹{fee.paidAmount?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: fee.dueAmount > 0 ? '#ef4444' : 'var(--text-muted)' }}>₹{fee.dueAmount?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                        background: fee.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.1)' : fee.paymentStatus === 'Partial' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: fee.paymentStatus === 'Paid' ? '#10b981' : fee.paymentStatus === 'Partial' ? '#f59e0b' : '#ef4444'
                      }}>{fee.paymentStatus}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fee.paymentMethod}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fee.paymentDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FEE STRUCTURE VIEW
   ============================================================ */
export function FeeStructureView({ showToast }) {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentClass: 'I', admissionFee: '5000', tuitionFee: '12000', examFee: '1500',
    transportFee: '3000', hostelFee: '0', libraryFee: '1000', otherCharges: '500'
  });

  const classes = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

  const fetchStructures = () => {
    fetch('/api/finance/fee-structures')
      .then(r => r.json())
      .then(d => { setStructures(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchStructures(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/fee-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(`Fee structure for Grade ${form.studentClass} saved!`);
        setShowForm(false);
        fetchStructures();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      const res = await fetch(`/api/finance/fee-structures/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Fee structure deleted'); fetchStructures(); }
    } catch { showToast('Error deleting', 'error'); }
  };

  const handleEdit = (s) => {
    setForm({
      studentClass: s.studentClass || 'I',
      admissionFee: String(s.admissionFee || '0'),
      tuitionFee: String(s.tuitionFee || '0'),
      examFee: String(s.examFee || '0'),
      transportFee: String(s.transportFee || '0'),
      hostelFee: String(s.hostelFee || '0'),
      libraryFee: String(s.libraryFee || '0'),
      otherCharges: String(s.otherCharges || '0')
    });
    setShowForm(true);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' };
  const optionStyle = { background: '#131324', color: '#fff' };

  const total = Number(form.admissionFee || 0) + Number(form.tuitionFee || 0) + Number(form.examFee || 0) +
    Number(form.transportFee || 0) + Number(form.hostelFee || 0) + Number(form.libraryFee || 0) + Number(form.otherCharges || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none',
          borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '6px', fontSize: '0.85rem'
        }}>
          <Plus size={16} /> Add/Edit Fee Structure
        </button>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="animate-scale-up" style={{
            width: '100%', maxWidth: '650px', background: '#131324', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <BookOpen size={18} style={{ color: '#3b82f6' }} /> Configure Fee Structure
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Class</label>
                  <select value={form.studentClass} onChange={e => setForm({ ...form, studentClass: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {classes.map(c => <option key={c} value={c} style={optionStyle}>Grade {c}</option>)}
                  </select>
                </div>
                {[
                  ['Admission Fee', 'admissionFee'], ['Tuition Fee', 'tuitionFee'], ['Exam Fee', 'examFee'],
                  ['Transport Fee', 'transportFee'], ['Hostel Fee', 'hostelFee'], ['Library Fee', 'libraryFee'], ['Other Charges', 'otherCharges']
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label} (₹)</label>
                    <input type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.06)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Annual Fee</span>
                <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>₹{total.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none',
                  borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                }}><CheckCircle size={16} /> Save Fee Structure</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}><X size={16} /> Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structures Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : structures.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', borderRadius: '16px' }}>
            No fee structures configured yet. Click "Add/Edit Fee Structure" to create one.
          </div>
        ) : (
          structures.map((s, i) => (
            <div key={i} className="glass-panel" style={{ 
              padding: '24px', 
              borderRadius: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              maxWidth: '420px',
              width: '100%',
              background: 'rgba(20, 20, 35, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#3b82f6' }}>Grade {s.studentClass}</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  ['Admission Fee', s.admissionFee], ['Tuition Fee', s.tuitionFee], ['Exam Fee', s.examFee],
                  ['Transport Fee', s.transportFee], ['Hostel Fee', s.hostelFee], ['Library Fee', s.libraryFee], ['Other Charges', s.otherCharges]
                ].map(([l, v], idx) => (
                  <div key={l} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '0.82rem',
                    padding: '8px 0',
                    borderBottom: idx === 6 ? 'none' : '1px solid rgba(255,255,255,0.03)'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{(v || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Total Fee</span>
                  <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.15rem' }}>₹{(s.totalFee || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(s)} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#3b82f6', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px',
                    transition: 'all 0.2s'
                  }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; }}
                     onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                     title="Edit Structure">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#ef4444', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px',
                    transition: 'all 0.2s'
                  }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                     onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                     title="Delete Structure">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============================================================
   STAFF PAYMENT STRUCTURE VIEW
   ============================================================ */
const defaultStaffDesignations = [
  'Administrative Officer',
  'Registrar Officer',
  'Librarian Keeper',
  'IT System Analyst',
  'Security Commander',
  'Facilities Specialist'
];

export function StaffPaymentStructureView({ showToast }) {
  const [structures, setStructures] = useState([]);
  const [designationOptions, setDesignationOptions] = useState(defaultStaffDesignations);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    designation: '', basicSalary: '', allowances: '', bonus: '0',
    deductions: '0', pfDeduction: '0', taxDeduction: '0'
  });

  const fetchStructures = () => {
    fetch('/api/finance/staff-salary-structures')
      .then(r => r.json())
      .then(d => { setStructures(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchDesignationOptions = () => {
    fetch('/api/staff')
      .then(r => r.json())
      .then(staff => {
        const staffRoles = (staff || []).map(s => s.role).filter(Boolean);
        setDesignationOptions([...new Set([...defaultStaffDesignations, ...staffRoles])]);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStructures();
    fetchDesignationOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/staff-salary-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(`Salary structure for ${form.designation} saved!`);
        setForm({
          designation: '', basicSalary: '', allowances: '', bonus: '0',
          deductions: '0', pfDeduction: '0', taxDeduction: '0'
        });
        setShowForm(false);
        fetchStructures();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the structure for ${name}?`)) return;
    try {
      const res = await fetch(`/api/finance/staff-salary-structures/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Deleted salary structure for ${name}`);
        fetchStructures();
      } else {
        showToast('Failed to delete structure', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const handleEdit = (s) => {
    setForm({
      designation: s.designation || '',
      basicSalary: String(s.basicSalary || ''),
      allowances: String(s.allowances || ''),
      bonus: String(s.bonus || '0'),
      deductions: String(s.deductions || '0'),
      pfDeduction: String(s.pfDeduction || '0'),
      taxDeduction: String(s.taxDeduction || '0')
    });
    setShowForm(true);
  };

  const netSalary = Number(form.basicSalary || 0) + Number(form.allowances || 0) + Number(form.bonus || 0)
    - Number(form.deductions || 0) - Number(form.pfDeduction || 0) - Number(form.taxDeduction || 0);

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' };
  const optionStyle = { background: '#131324', color: '#fff' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', border: 'none',
          borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '6px', fontSize: '0.85rem'
        }}>
          <Plus size={16} /> Add Staff Salary Structure
        </button>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="animate-scale-up" style={{
            width: '100%', maxWidth: '650px', background: '#131324', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Calculator size={18} style={{ color: '#14b8a6' }} /> Configure Staff Salary Structure
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Designation/Role</label>
                  <select
                    value={form.designation}
                    onChange={e => setForm({ ...form, designation: e.target.value })}
                    required
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="" style={optionStyle}>Select designation</option>
                    {designationOptions.map(designation => (
                      <option key={designation} value={designation} style={optionStyle}>{designation}</option>
                    ))}
                  </select>
                </div>
                {[
                  ['Basic Salary', 'basicSalary'], ['Allowances', 'allowances'], ['Bonus', 'bonus'],
                  ['Deductions', 'deductions'], ['PF Deduction', 'pfDeduction'], ['Tax Deduction', 'taxDeduction']
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label} (₹)</label>
                    <input type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(20,184,166,0.06)', borderRadius: '10px', border: '1px solid rgba(20,184,166,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Net Salary</span>
                <span style={{ fontWeight: 800, color: '#14b8a6', fontSize: '1.1rem' }}>₹{netSalary.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', border: 'none',
                  borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                }}><CheckCircle size={16} /> Save Staff Structure</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}><X size={16} /> Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : structures.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', borderRadius: '16px' }}>
              No staff salary structures configured yet.
            </div>
          ) : (
            structures.map((s, i) => (
              <div key={i} className="glass-panel" style={{ 
                padding: '24px', 
                borderRadius: '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                maxWidth: '420px',
                width: '100%',
                background: 'rgba(20, 20, 35, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#14b8a6' }}>{s.designation}</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {[
                    ['Basic Salary', s.basicSalary], ['Allowances', s.allowances], ['Bonus', s.bonus],
                    ['Deductions', s.deductions], ['PF Deduction', s.pfDeduction], ['Tax Deduction', s.taxDeduction]
                  ].map(([l, v], idx) => (
                    <div key={l} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.82rem',
                      padding: '8px 0',
                      borderBottom: idx === 5 ? 'none' : '1px solid rgba(255,255,255,0.03)'
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{(v || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Net Salary</span>
                    <span style={{ fontWeight: 800, color: '#14b8a6', fontSize: '1.15rem' }}>₹{(s.netSalary || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(s)} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#3b82f6', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px',
                      transition: 'all 0.2s'
                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; }}
                       onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                       title="Edit Structure">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(s.id, s.designation)} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#ef4444', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px',
                      transition: 'all 0.2s'
                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                       onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                       title="Delete Structure">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  );
}

/* ============================================================
   STAFF PAYMENTS VIEW
   ============================================================ */
export function StaffPaymentsView({ showToast }) {
  const [payments, setPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    staffId: '', staffName: '', staffRole: '', department: '',
    basicSalary: '30000', allowances: '6000', bonus: '0', deductions: '1500',
    pfDeduction: '1500', taxDeduction: '1000', paymentMethod: 'Bank Transfer'
  });
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  useEffect(() => {
    if (!showForm) {
      setStaffSearchQuery('');
      setShowStaffDropdown(false);
    }
  }, [showForm]);

  const fetchPayments = () => {
    const params = new URLSearchParams();
    if (filterStatus !== 'All') params.set('status', filterStatus);
    if (search) params.set('search', search);
    fetch(`/api/finance/staff-payments?${params}`)
      .then(r => r.json())
      .then(d => { setPayments(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchStaff = () => {
    fetch('/api/staff')
      .then(r => r.json())
      .then(d => setStaff(d))
      .catch(() => {});
  };

  useEffect(() => { fetchPayments(); fetchStaff(); }, [filterStatus, search]);

  const selectStaff = (s) => {
    if (s) {
      fetch('/api/finance/staff-salary-structures')
        .then(r => r.json())
        .then(structures => {
          const sstr = structures.find(st => st.designation === s.role);
          setForm(prev => ({
            ...prev,
            staffId: s.id,
            staffName: s.name,
            staffRole: s.role,
            department: s.department,
            basicSalary: sstr ? String(sstr.basicSalary) : '30000',
            allowances: sstr ? String(sstr.allowances) : '6000',
            bonus: sstr ? String(sstr.bonus || 0) : '0',
            deductions: sstr ? String(sstr.deductions) : '1500',
            pfDeduction: sstr ? String(sstr.pfDeduction) : '1500',
            taxDeduction: sstr ? String(sstr.taxDeduction) : '1000'
          }));
        })
        .catch(() => {});
      setStaffSearchQuery(s.name);
      setShowStaffDropdown(false);
    } else {
      setForm(prev => ({
        ...prev,
        staffId: '',
        staffName: '',
        staffRole: '',
        department: ''
      }));
      setStaffSearchQuery('');
    }
  };

  const handleStaffSelect = (e) => {
    const s = staff.find(st => st.id === e.target.value);
    if (s) {
      // Find matching salary structure by role
      fetch('/api/finance/staff-salary-structures')
        .then(r => r.json())
        .then(structures => {
          const sstr = structures.find(st => st.designation === s.role);
          setForm(prev => ({
            ...prev,
            staffId: s.id,
            staffName: s.name,
            staffRole: s.role,
            department: s.department,
            basicSalary: sstr ? String(sstr.basicSalary) : '30000',
            allowances: sstr ? String(sstr.allowances) : '6000',
            bonus: sstr ? String(sstr.bonus || 0) : '0',
            deductions: sstr ? String(sstr.deductions) : '1500',
            pfDeduction: sstr ? String(sstr.pfDeduction) : '1500',
            taxDeduction: sstr ? String(sstr.taxDeduction) : '1000'
          }));
        })
        .catch(() => {});
    }
  };

  const netSalary = Number(form.basicSalary || 0) + Number(form.allowances || 0) + Number(form.bonus || 0)
    - Number(form.deductions || 0) - Number(form.pfDeduction || 0) - Number(form.taxDeduction || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/staff-payments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(`Payment of ₹${netSalary.toLocaleString()} processed for ${form.staffName}!`);
        setShowForm(false);
        setForm({ staffId: '', staffName: '', staffRole: '', department: '',
          basicSalary: '30000', allowances: '6000', bonus: '0', deductions: '1500',
          pfDeduction: '1500', taxDeduction: '1000', paymentMethod: 'Bank Transfer' });
        fetchPayments();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' };
  const optionStyle = { background: '#131324', color: '#fff' };

  const filteredStaffForSelect = staff.filter(s => {
    const name = (s.name || '').toLowerCase();
    const role = (s.role || '').toLowerCase();
    const dept = (s.department || '').toLowerCase();
    const query = staffSearchQuery.toLowerCase();
    return name.includes(query) || role.includes(query) || dept.includes(query);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: 'linear-gradient(135deg, #ec4899, #db2777)', border: 'none',
          borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '6px', fontSize: '0.85rem'
        }}>
          <Plus size={16} /> Process Staff Payment
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..."
            style={{ ...inputStyle, paddingLeft: '36px', width: '200px' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: '120px', cursor: 'pointer' }}>
          <option value="All" style={optionStyle}>All Status</option>
          <option value="Paid" style={optionStyle}>Paid</option>
          <option value="Pending" style={optionStyle}>Pending</option>
        </select>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="animate-scale-up" style={{
            width: '100%', maxWidth: '650px', background: '#131324', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <UserCog size={18} style={{ color: '#ec4899' }} /> Process Staff Salary Payment
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Select Staff</label>
                  <input 
                    type="text" 
                    placeholder="Type staff name to search..." 
                    value={staffSearchQuery} 
                    onChange={(e) => {
                      setStaffSearchQuery(e.target.value);
                      setShowStaffDropdown(true);
                      if (!e.target.value) {
                        selectStaff(null);
                      }
                    }} 
                    onFocus={() => setShowStaffDropdown(true)}
                    onBlur={() => setTimeout(() => setShowStaffDropdown(false), 250)}
                    style={inputStyle}
                  />
                  {showStaffDropdown && staffSearchQuery && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      background: '#131324',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      zIndex: 1000,
                      marginTop: '4px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                      {filteredStaffForSelect.length === 0 ? (
                        <div style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No matches found</div>
                      ) : (
                        filteredStaffForSelect.slice(0, 10).map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => selectStaff(s)}
                            style={{
                              padding: '10px 14px',
                              fontSize: '0.85rem',
                              color: '#fff',
                              cursor: 'pointer',
                              borderBottom: '1px solid rgba(255,255,255,0.02)',
                              transition: 'background 0.15s',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span>{s.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.role}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {[
                  ['Basic Salary', 'basicSalary'], ['Allowances', 'allowances'], ['Bonus', 'bonus'],
                  ['Deductions', 'deductions'], ['PF Deduction', 'pfDeduction'], ['Tax Deduction', 'taxDeduction']
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label} (₹)</label>
                    <input type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['Bank Transfer', 'UPI', 'Cheque', 'Cash'].map(m => <option key={m} value={m} style={optionStyle}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(236,72,153,0.06)', borderRadius: '10px', border: '1px solid rgba(236,72,153,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Net Salary</span>
                <span style={{ fontWeight: 800, color: '#ec4899', fontSize: '1.1rem' }}>₹{netSalary.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #ec4899, #db2777)', border: 'none',
                  borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                }}><CheckCircle size={16} /> Process & Pay</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}><X size={16} /> Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Payment ID', 'Staff', 'Role', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No staff payment records. Click "Process Staff Payment" to get started.</td></tr>
              ) : (
                payments.slice(0, 50).map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 600, color: '#ec4899' }}>{p.paymentId}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{p.staffName}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.staffRole}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-main)' }}>₹{p.basicSalary?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#10b981' }}>+₹{p.allowances?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#ef4444' }}>-₹{((p.deductions || 0) + (p.pfDeduction || 0) + (p.taxDeduction || 0))?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#ec4899' }}>₹{p.netSalary?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                        background: p.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: p.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b'
                      }}>{p.paymentStatus}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.paymentDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAYROLL VIEW
   ============================================================ */
export function PayrollView({ showToast }) {
  const [payroll, setPayroll] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    teacherId: '', teacherName: '', employeeId: '', designation: '', department: '',
    basicSalary: '45000', allowances: '5000', bonus: '0', deductions: '2000',
    pfDeduction: '1800', taxDeduction: '1200', paymentMethod: 'Bank Transfer'
  });
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [selectedStructureId, setSelectedStructureId] = useState('');

  useEffect(() => {
    if (!showForm) {
      setTeacherSearchQuery('');
      setShowTeacherDropdown(false);
      setSelectedStructureId('');
    }
  }, [showForm]);

  const fetchPayroll = () => {
    const params = new URLSearchParams();
    if (filterStatus !== 'All') params.set('status', filterStatus);
    if (search) params.set('search', search);
    fetch(`/api/finance/payroll?${params}`)
      .then(r => r.json())
      .then(d => { setPayroll(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchTeachers = () => {
    fetch('/api/teachers?limit=1000')
      .then(r => r.json())
      .then(d => setTeachers(d.teachers || []))
      .catch(() => {});
  };

  const fetchSalaryStructures = () => {
    fetch('/api/finance/salary-structures')
      .then(r => r.json())
      .then(d => setSalaryStructures(d || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchPayroll();
    fetchTeachers();
    fetchSalaryStructures();
  }, [filterStatus, search]);

  const selectTeacher = (t) => {
    if (t) {
      setForm(prev => ({
        ...prev, teacherId: t.id, teacherName: t.name,
        employeeId: t.employeeId || `EMP-${t.id}`,
        designation: t.designation || 'Teacher',
        department: t.department || 'General'
      }));
      setTeacherSearchQuery(t.name);
      setShowTeacherDropdown(false);
    } else {
      setForm(prev => ({
        ...prev,
        teacherId: '',
        teacherName: '',
        employeeId: '',
        designation: '',
        department: ''
      }));
      setTeacherSearchQuery('');
    }
  };

  const handleTeacherSelect = (e) => {
    const t = teachers.find(t => t.id === e.target.value);
    if (t) {
      setForm(prev => ({
        ...prev, teacherId: t.id, teacherName: t.name,
        employeeId: t.employeeId || `EMP-${t.id}`,
        designation: t.designation || 'Teacher',
        department: t.department || 'General'
      }));
    }
  };

  const netSalary = Number(form.basicSalary || 0) + Number(form.allowances || 0) + Number(form.bonus || 0)
    - Number(form.deductions || 0) - Number(form.pfDeduction || 0) - Number(form.taxDeduction || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/payroll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(`Salary processed for ${form.teacherName}! Net: ₹${netSalary.toLocaleString()}`);
        setShowForm(false);
        setForm({ teacherId: '', teacherName: '', employeeId: '', designation: '', department: '',
          basicSalary: '45000', allowances: '5000', bonus: '0', deductions: '2000',
          pfDeduction: '1800', taxDeduction: '1200', paymentMethod: 'Bank Transfer' });
        setSelectedStructureId('');
        fetchPayroll();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' };
  const optionStyle = { background: '#131324', color: '#fff' };

  const filteredTeachersForSelect = teachers.filter(t => {
    const name = (t.name || '').toLowerCase();
    const dept = (t.department || '').toLowerCase();
    const desg = (t.designation || '').toLowerCase();
    const empId = (t.employeeId || '').toLowerCase();
    const query = teacherSearchQuery.toLowerCase();
    return name.includes(query) || dept.includes(query) || desg.includes(query) || empId.includes(query);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none',
          borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '6px', fontSize: '0.85rem'
        }}>
          <Plus size={16} /> Process Teacher Salary
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teacher..."
            style={{ ...inputStyle, paddingLeft: '36px', width: '200px' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: '120px', cursor: 'pointer' }}>
          <option value="All" style={optionStyle}>All Status</option>
          <option value="Paid" style={optionStyle}>Paid</option>
          <option value="Pending" style={optionStyle}>Pending</option>
        </select>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="animate-scale-up" style={{
            width: '100%', maxWidth: '650px', background: '#131324', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Banknote size={18} style={{ color: '#8b5cf6' }} /> Process Teacher Salary
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Select Teacher</label>
                  <input 
                    type="text" 
                    placeholder="Type teacher name to search..." 
                    value={teacherSearchQuery} 
                    onChange={(e) => {
                      setTeacherSearchQuery(e.target.value);
                      setShowTeacherDropdown(true);
                      if (!e.target.value) {
                        selectTeacher(null);
                      }
                    }} 
                    onFocus={() => setShowTeacherDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTeacherDropdown(false), 250)}
                    style={inputStyle}
                  />
                  {showTeacherDropdown && teacherSearchQuery && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      background: '#131324',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      zIndex: 1000,
                      marginTop: '4px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                      {filteredTeachersForSelect.length === 0 ? (
                        <div style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No matches found</div>
                      ) : (
                        filteredTeachersForSelect.slice(0, 10).map(t => (
                          <div 
                            key={t.id} 
                            onClick={() => selectTeacher(t)}
                            style={{
                              padding: '10px 14px',
                              fontSize: '0.85rem',
                              color: '#fff',
                              cursor: 'pointer',
                              borderBottom: '1px solid rgba(255,255,255,0.02)',
                              transition: 'background 0.15s',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span>{t.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.department || 'General'}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Grade Range Pay Tier</label>
                  <select
                    value={selectedStructureId}
                    onChange={e => {
                      const id = e.target.value;
                      setSelectedStructureId(id);
                      const selectedStr = salaryStructures.find(s => s.id === id);
                      if (selectedStr) {
                        setForm(prev => ({
                          ...prev,
                          basicSalary: String(selectedStr.basicSalary || '0'),
                          allowances: String(selectedStr.allowances || '0'),
                          deductions: String(selectedStr.deductions || '0'),
                          pfDeduction: String(selectedStr.pfDeduction || '0'),
                          taxDeduction: String(selectedStr.taxDeduction || '0')
                        }));
                      }
                    }}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="" style={optionStyle}>Select a configured grade/tier to pre-fill</option>
                    {salaryStructures.map(s => (
                      <option key={s.id} value={s.id} style={optionStyle}>
                        {s.designation} (Net: ₹{(s.netSalary || 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                {[
                  ['Basic Salary', 'basicSalary'], ['Allowances', 'allowances'], ['Bonus', 'bonus'],
                  ['Deductions', 'deductions'], ['PF Deduction', 'pfDeduction'], ['Tax Deduction', 'taxDeduction']
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label} (₹)</label>
                    <input type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['Bank Transfer', 'UPI', 'Cheque', 'Cash'].map(m => <option key={m} value={m} style={optionStyle}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(139,92,246,0.06)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Net Salary</span>
                <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: '1.1rem' }}>₹{netSalary.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none',
                  borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                }}><CheckCircle size={16} /> Process & Pay</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}><X size={16} /> Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Payroll ID', 'Teacher', 'Designation', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : payroll.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No payroll records. Click "Process Salary" to get started.</td></tr>
              ) : (
                payroll.slice(0, 50).map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#8b5cf6' }}>{p.payrollId}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{p.teacherName}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.designation}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-main)' }}>₹{p.basicSalary?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#10b981' }}>+₹{p.allowances?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#ef4444' }}>-₹{(p.deductions + p.pfDeduction + p.taxDeduction)?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>₹{p.netSalary?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                        background: p.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: p.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b'
                      }}>{p.paymentStatus}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.paymentDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EXPENSES VIEW
   ============================================================ */
export function ExpensesView({ showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', category: 'Maintenance', amount: '', description: '', date: new Date().toISOString().split('T')[0], paidBy: '' });

  const categories = ['Maintenance', 'Salary', 'Stationery', 'Transport', 'Internet', 'Electricity', 'Events', 'Infrastructure', 'Other'];

  const fetchExpenses = () => {
    const params = new URLSearchParams();
    if (filterCat !== 'All') params.set('category', filterCat);
    if (search) params.set('search', search);
    fetch(`/api/finance/expenses?${params}`)
      .then(r => r.json())
      .then(d => { setExpenses(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, [filterCat, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(`Expense of ₹${Number(form.amount).toLocaleString()} recorded!`);
        setShowForm(false);
        setForm({ title: '', category: 'Maintenance', amount: '', description: '', date: new Date().toISOString().split('T')[0], paidBy: '' });
        fetchExpenses();
      } else { showToast('Failed to add expense', 'error'); }
    } catch { showToast('Network error', 'error'); }
  };

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' };
  const optionStyle = { background: '#131324', color: '#fff' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary Card */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Expenses</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>₹{totalExpenses.toLocaleString()}</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expenses.length} records</span>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
          borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '6px', fontSize: '0.85rem'
        }}>
          <Plus size={16} /> Add Expense
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: '36px', width: '200px' }} />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: '150px', cursor: 'pointer' }}>
          <option value="All" style={optionStyle}>All Categories</option>
          {categories.map(c => <option key={c} value={c} style={optionStyle}>{c}</option>)}
        </select>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="animate-scale-up" style={{
            width: '100%', maxWidth: '650px', background: '#131324', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <TrendingDown size={18} style={{ color: '#ef4444' }} /> Record New Expense
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div><label style={labelStyle}>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Internet Bill" style={inputStyle} /></div>
                <div><label style={labelStyle}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>{categories.map(c => <option key={c} value={c} style={optionStyle}>{c}</option>)}</select></div>
                <div><label style={labelStyle}>Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="2500" style={inputStyle} /></div>
                <div><label style={labelStyle}>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Paid By</label><input value={form.paidBy} onChange={e => setForm({ ...form, paidBy: e.target.value })} placeholder="Accountant" style={inputStyle} /></div>
                <div><label style={labelStyle}>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
                  borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                }}><CheckCircle size={16} /> Save Expense</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}><X size={16} /> Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['ID', 'Title', 'Category', 'Amount', 'Date', 'Paid By', 'Description'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expenses recorded yet.</td></tr>
              ) : (
                expenses.map((exp, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 600, color: '#ef4444' }}>{exp.expenseId}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{exp.title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>{exp.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>₹{exp.amount?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.paidBy}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INCOME VIEW
   ============================================================ */
export function IncomeView({ showToast }) {
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source: 'Donations', amount: '', description: '', date: new Date().toISOString().split('T')[0], receivedBy: '' });

  const sources = ['Donations', 'Grants', 'Event Revenue', 'Canteen', 'Rental', 'Sponsorship', 'Other'];

  const fetchIncome = () => {
    fetch('/api/finance/income')
      .then(r => r.json())
      .then(d => { setIncome(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchIncome(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/income', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(`Income of ₹${Number(form.amount).toLocaleString()} recorded!`);
        setShowForm(false);
        setForm({ source: 'Donations', amount: '', description: '', date: new Date().toISOString().split('T')[0], receivedBy: '' });
        fetchIncome();
      } else { showToast('Failed to add income', 'error'); }
    } catch { showToast('Network error', 'error'); }
  };

  const totalIncome = income.reduce((s, i) => s + (i.amount || 0), 0);

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' };
  const optionStyle = { background: '#131324', color: '#fff' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Income</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>₹{totalIncome.toLocaleString()}</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{income.length} records</span>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none',
          borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '6px', fontSize: '0.85rem'
        }}>
          <Plus size={16} /> Add Income
        </button>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="animate-scale-up" style={{
            width: '100%', maxWidth: '650px', background: '#131324', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <TrendingUp size={18} style={{ color: '#f59e0b' }} /> Record New Income
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div><label style={labelStyle}>Source</label><select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>{sources.map(s => <option key={s} value={s} style={optionStyle}>{s}</option>)}</select></div>
                <div><label style={labelStyle}>Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="150000" style={inputStyle} /></div>
                <div><label style={labelStyle}>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Received By</label><input value={form.receivedBy} onChange={e => setForm({ ...form, receivedBy: e.target.value })} placeholder="Accountant" style={inputStyle} /></div>
                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Alumni corpus donation" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none',
                  borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                }}><CheckCircle size={16} /> Save Income</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}><X size={16} /> Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['ID', 'Source', 'Amount', 'Date', 'Received By', 'Description'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : income.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No income records yet.</td></tr>
              ) : (
                income.map((inc, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 600, color: '#f59e0b' }}>{inc.incomeId}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>{inc.source}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>₹{inc.amount?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inc.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inc.receivedBy}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   REPORTS VIEW
   ============================================================ */
export function ReportsView({ showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/finance/overview').then(r => r.json()),
      fetch('/api/finance/fees').then(r => r.json()),
      fetch('/api/finance/payroll').then(r => r.json()),
      fetch('/api/finance/expenses').then(r => r.json()),
    ]).then(([overview, feesData, payrollData, expensesData]) => {
      setData(overview);
      setFees(feesData);
      setPayroll(payrollData);
      setExpenses(expensesData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const exportCSV = (rows, filename) => {
    if (!rows.length) return showToast('No data to export', 'error');
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    showToast(`${filename} downloaded!`);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
      <Loader2 className="animate-spin" size={32} style={{ color: '#10b981' }} />
    </div>
  );

  const summaryItems = [
    { label: 'Total Fee Collection', value: `₹${(data?.totalFeeCollected || 0).toLocaleString()}`, color: '#10b981' },
    { label: 'Pending Fees', value: `₹${(data?.totalPendingFees || 0).toLocaleString()}`, color: '#f59e0b' },
    { label: 'Total Expenses', value: `₹${(data?.totalExpenses || 0).toLocaleString()}`, color: '#ef4444' },
    { label: 'Total Payroll', value: `₹${(data?.totalPayrollPaid || 0).toLocaleString()}`, color: '#8b5cf6' },
    { label: 'Other Income', value: `₹${(data?.totalIncome || 0).toLocaleString()}`, color: '#06b6d4' },
    { label: 'Net Profit/Loss', value: `₹${(data?.netProfit || 0).toLocaleString()}`, color: data?.netProfit >= 0 ? '#10b981' : '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Profit & Loss Summary */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} style={{ color: '#06b6d4' }} /> Profit & Loss Summary — FY 2026-2027
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {summaryItems.map((item, i) => (
            <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</p>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: item.color, marginTop: '6px' }}>{item.value}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} style={{ color: '#10b981' }} /> Export Financial Reports
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Fee Collection Report', desc: `${fees.length} records`, color: '#10b981', onClick: () => exportCSV(fees, 'fee_collection_report.csv') },
            { label: 'Payroll Report', desc: `${payroll.length} records`, color: '#8b5cf6', onClick: () => exportCSV(payroll, 'payroll_report.csv') },
            { label: 'Expense Report', desc: `${expenses.length} records`, color: '#ef4444', onClick: () => exportCSV(expenses, 'expense_report.csv') },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} style={{
              padding: '18px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'all 0.2s ease', textAlign: 'left'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${btn.color}44`; e.currentTarget.style.background = `${btn.color}08`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${btn.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={18} style={{ color: btn.color }} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>{btn.label}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CSV • {btn.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      {expenses.length > 0 && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={18} style={{ color: '#ef4444' }} /> Expense Category Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(() => {
              const cats = {};
              expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + (e.amount || 0); });
              const maxCat = Math.max(...Object.values(cats), 1);
              const catColors = { Maintenance: '#3b82f6', Salary: '#8b5cf6', Stationery: '#f59e0b', Transport: '#06b6d4', Internet: '#10b981', Electricity: '#ec4899', Events: '#f97316', Infrastructure: '#14b8a6', Other: '#6b7280' };
              return Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', width: '100px', flexShrink: 0 }}>{cat}</span>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(val / maxCat) * 100}%`, height: '100%', background: catColors[cat] || '#6b7280', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', width: '90px', textAlign: 'right', flexShrink: 0 }}>₹{val.toLocaleString()}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TEACHER SALARY STRUCTURE VIEW
   ============================================================ */
export function TeacherSalaryStructureView({ showToast }) {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    designation: '', basicSalary: '', allowances: '',
    deductions: '0', pfDeduction: '0', taxDeduction: '0'
  });

  const fetchStructures = () => {
    fetch('/api/finance/salary-structures')
      .then(r => r.json())
      .then(d => { setStructures(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/salary-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast(`Salary structure for ${form.designation} saved!`);
        setForm({
          designation: '', basicSalary: '', allowances: '',
          deductions: '0', pfDeduction: '0', taxDeduction: '0'
        });
        setShowForm(false);
        fetchStructures();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the structure for ${name}?`)) return;
    try {
      const res = await fetch(`/api/finance/salary-structures/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Deleted salary structure for ${name}`);
        fetchStructures();
      } else {
        showToast('Failed to delete structure', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const handleEdit = (s) => {
    setForm({
      designation: s.designation || '',
      basicSalary: String(s.basicSalary || ''),
      allowances: String(s.allowances || ''),
      deductions: String(s.deductions || '0'),
      pfDeduction: String(s.pfDeduction || '0'),
      taxDeduction: String(s.taxDeduction || '0')
    });
    setShowForm(true);
  };

  const netSalary = Number(form.basicSalary || 0) + Number(form.allowances || 0)
    - Number(form.deductions || 0) - Number(form.pfDeduction || 0) - Number(form.taxDeduction || 0);

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' };
  const optionStyle = { background: '#131324', color: '#fff' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none',
          borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '6px', fontSize: '0.85rem'
        }}>
          <Plus size={16} /> Add Teacher Pay Structure
        </button>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px'
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="animate-scale-up" style={{
            width: '100%', maxWidth: '650px', background: '#131324', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Calculator size={18} style={{ color: '#10b981' }} /> Configure Teacher Pay Structure
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Grade Range / Designation</label>
                  <select
                    value={form.designation}
                    onChange={e => setForm({ ...form, designation: e.target.value })}
                    required
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="" style={optionStyle}>Select Grade Range / Designation</option>
                    <option value="Grades 1-5" style={optionStyle}>Grades 1-5</option>
                    <option value="Grades 6-10" style={optionStyle}>Grades 6-10</option>
                    <option value="Grades 11-12" style={optionStyle}>Grades 11-12</option>
                    <option value="Principal" style={optionStyle}>Principal</option>
                    <option value="Senior Teacher" style={optionStyle}>Senior Teacher</option>
                    <option value="Teacher" style={optionStyle}>Teacher</option>
                    <option value="Assistant Teacher" style={optionStyle}>Assistant Teacher</option>
                  </select>
                </div>
                {[
                  ['Basic Salary', 'basicSalary'], ['Allowances', 'allowances'],
                  ['Deductions', 'deductions'], ['PF Deduction', 'pfDeduction'], ['Tax Deduction', 'taxDeduction']
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label} (₹)</label>
                    <input type="number" required value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.06)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Net Salary</span>
                <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>₹{netSalary.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none',
                  borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                }}><CheckCircle size={16} /> Save Structure</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}><X size={16} /> Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : structures.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', borderRadius: '16px' }}>
              No teacher salary structures configured yet.
            </div>
          ) : (
            structures.map((s, i) => (
              <div key={i} className="glass-panel" style={{ 
                padding: '24px', 
                borderRadius: '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                maxWidth: '420px',
                width: '100%',
                background: 'rgba(20, 20, 35, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>{s.designation}</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {[
                    ['Basic Salary', s.basicSalary], ['Allowances', s.allowances],
                    ['Deductions', s.deductions], ['PF Deduction', s.pfDeduction], ['Tax Deduction', s.taxDeduction]
                  ].map(([l, v], idx) => (
                    <div key={l} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.82rem',
                      padding: '8px 0',
                      borderBottom: idx === 4 ? 'none' : '1px solid rgba(255,255,255,0.03)'
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{(v || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Net Salary</span>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.15rem' }}>₹{(s.netSalary || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(s)} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#3b82f6', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px',
                      transition: 'all 0.2s'
                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; }}
                       onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                       title="Edit Structure">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(s.id, s.designation)} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#ef4444', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px',
                      transition: 'all 0.2s'
                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                       onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                       title="Delete Structure">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  );
}
