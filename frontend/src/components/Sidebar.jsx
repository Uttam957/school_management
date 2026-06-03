import React, { useState } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  UserCog,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Settings,
  School,
  UserPlus,
  UserPlus2,
  List,
  Shield,
  ClipboardCheck,
  Calculator,
  Receipt,
  Wallet,
  Banknote,
  ClipboardList,
  ShieldAlert,
  Plus,
  Bell,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  isCollapsed, 
  setIsCollapsed, 
  mobileOpen, 
  setMobileOpen, 
  schoolDetails, 
  isAdmin, 
  onAdminLogout, 
  adminView, 
  setAdminView, 
  isRecep, 
  onRecepLogout, 
  recepView, 
  setRecepView, 
  isTeacher, 
  onTeacherLogout, 
  teacherView, 
  setTeacherView,
  isAccountant,
  onAccountantLogout,
  accountantView,
  setAccountantView,
  isExpense,
  onExpenseLogout,
  expenseView,
  setExpenseView,
  onAccessAdmin
}) {
  const [studentOpen, setStudentOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [adminCoreOpen, setAdminCoreOpen] = useState(false);
  const [adminAttendanceOpen, setAdminAttendanceOpen] = useState(false);
  const [adminRecepOpen, setAdminRecepOpen] = useState(false);
  const [adminStudentFinanceOpen, setAdminStudentFinanceOpen] = useState(false);
  const [adminTeacherFinanceOpen, setAdminTeacherFinanceOpen] = useState(false);
  const [adminStaffFinanceOpen, setAdminStaffFinanceOpen] = useState(false);
  const [adminExpensesOpen, setAdminExpensesOpen] = useState(false);
  const [recepStudentOpen, setRecepStudentOpen] = useState(false);
  const [recepTeacherOpen, setRecepTeacherOpen] = useState(false);
  const [recepStaffOpen, setRecepStaffOpen] = useState(false);
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teacher-list', label: 'Teacher List', icon: UserCheck },
    { id: 'staff', label: 'Staff Directory', icon: UserCog },
    { id: 'school', label: 'School', icon: School },
  ];

  const adminMenuItems = [
    { id: 'overview', label: 'Main Dashboard', icon: List },
    { id: 'students', label: 'Student List', icon: Users },
    { id: 'teachers', label: 'Teacher List', icon: UserCheck },
    { id: 'staff', label: 'Staff List', icon: UserCog },
    { id: 'attendance', label: 'Attendance Manager', icon: ClipboardCheck },
  ];

  const recepMenuItems = [
    { id: 'overview', label: 'Receptionist Panel', icon: List },
    { id: 'register-student', label: 'Register Student', icon: UserPlus },
    { id: 'students', label: 'All Students', icon: Users },
    { id: 'add-teacher', label: 'Add Teacher', icon: UserPlus2 },
    { id: 'teachers', label: 'All Teachers', icon: UserCheck },
    { id: 'add-staff', label: 'Add Staff', icon: UserPlus2 },
    { id: 'staff', label: 'All Staff', icon: UserCog },
  ];

  const teacherMenuItems = [
    { id: 'dashboard', label: 'Teacher Panel', icon: LayoutDashboard },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: ClipboardCheck },
    { id: 'attendance-tracker', label: 'Attendance Tracker', icon: TrendingUp },
    { id: 'attendance-history', label: 'Attendance History', icon: List },
    { id: 'student-reports', label: 'Student Reports', icon: Users },
    { id: 'monthly-calendar', label: 'Monthly Calendar', icon: School },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'teacher-list', label: 'Teacher Directory', icon: UserCheck },
    { id: 'staff', label: 'Staff Directory', icon: UserCog },
  ];

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div className="brand-icon">
            <GraduationCap size={24} />
          </div>
          <span className="brand-name">{isAdmin ? 'Admin Dashboard' : (isAccountant ? 'Finance Dashboard' : (isExpense ? 'Expense Dashboard' : (isRecep ? 'Receptionist Dashboard' : (isTeacher ? 'Teacher Dashboard' : (schoolDetails?.name || 'Dashboard')))))}</span>
        </div>
        <button 
          onClick={() => {
            if (window.innerWidth <= 900) {
              setMobileOpen(false);
            } else {
              setIsCollapsed(true);
            }
          }}
          className="sidebar-close-btn"
          aria-label="Close navigation drawer"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'inherit',
            flexShrink: 0
          }}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>

            <button
              onClick={() => {
                setAdminView('overview');
                setMobileOpen(false);
              }}
              className={`nav-item ${adminView === 'overview' ? 'active' : ''}`}
            >
              <List size={20} className="flex-shrink-0" />
              <span className="nav-label">Admin Panel</span>
            </button>

            {/* Core Roster Directories Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setAdminCoreOpen(!adminCoreOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Users size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Core Registers</span>
                </div>
                {adminCoreOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {adminCoreOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setAdminView('students'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'students' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Users size={18} className="flex-shrink-0" />
                    <span className="nav-label">Student Directory</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('teachers'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'teachers' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserCheck size={18} className="flex-shrink-0" />
                    <span className="nav-label">Teacher Directory</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('staff'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'staff' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserCog size={18} className="flex-shrink-0" />
                    <span className="nav-label">Staff Directory</span>
                  </button>
                </div>
              )}
            </div>

            {/* Registry Admissions (Recep) Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setAdminRecepOpen(!adminRecepOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, overflow: 'hidden' }}>
                  <UserPlus size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Registry Admissions</span>
                </div>
                {adminRecepOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {adminRecepOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setAdminView('register-student'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'register-student' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserPlus size={18} className="flex-shrink-0" />
                    <span className="nav-label">Register Student</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('add-teacher'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'add-teacher' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserPlus size={18} className="flex-shrink-0" />
                    <span className="nav-label">Add Teacher</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('add-staff'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'add-staff' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserCog size={18} className="flex-shrink-0" />
                    <span className="nav-label">Add Staff</span>
                  </button>
                </div>
              )}
            </div>

            {/* Attendance Manager Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setAdminAttendanceOpen(!adminAttendanceOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, overflow: 'hidden' }}>
                  <ClipboardCheck size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Attendance Manager</span>
                </div>
                {adminAttendanceOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {adminAttendanceOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setAdminView('attendance'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'attendance' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <ClipboardCheck size={18} className="flex-shrink-0" />
                    <span className="nav-label">School Attendance</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('attendance-tracker'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'attendance-tracker' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <TrendingUp size={18} className="flex-shrink-0" />
                    <span className="nav-label">Attendance Tracker</span>
                  </button>
                </div>
              )}
            </div>

            {/* Student Finance Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setAdminStudentFinanceOpen(!adminStudentFinanceOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Users size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Student Finance</span>
                </div>
                {adminStudentFinanceOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {adminStudentFinanceOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setAdminView('collect-fees'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'collect-fees' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Receipt size={18} className="flex-shrink-0" />
                    <span className="nav-label">Collect Fees</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('fee-structure'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'fee-structure' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Calculator size={18} className="flex-shrink-0" />
                    <span className="nav-label">Fee Structure</span>
                  </button>
                </div>
              )}
            </div>

            {/* Teacher Finance Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setAdminTeacherFinanceOpen(!adminTeacherFinanceOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <UserCheck size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Teacher Finance</span>
                </div>
                {adminTeacherFinanceOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {adminTeacherFinanceOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setAdminView('payroll'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'payroll' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Banknote size={18} className="flex-shrink-0" />
                    <span className="nav-label">Manage Payroll</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('teacher-pay-structure'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'teacher-pay-structure' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Calculator size={18} className="flex-shrink-0" />
                    <span className="nav-label">Teacher Pay Structure</span>
                  </button>
                </div>
              )}
            </div>

            {/* Staff Finance Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setAdminStaffFinanceOpen(!adminStaffFinanceOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <UserCog size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Staff Finance</span>
                </div>
                {adminStaffFinanceOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {adminStaffFinanceOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setAdminView('staff-pay'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'staff-pay' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Banknote size={18} className="flex-shrink-0" />
                    <span className="nav-label">Pay Staff</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('staff-pay-structure'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'staff-pay-structure' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Calculator size={18} className="flex-shrink-0" />
                    <span className="nav-label">Staff Pay Structure</span>
                  </button>
                </div>
              )}
            </div>

            {/* Expense Control Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setAdminExpensesOpen(!adminExpensesOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Wallet size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Expense Control</span>
                </div>
                {adminExpensesOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {adminExpensesOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setAdminView('expense-dashboard'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'expense-dashboard' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <LayoutDashboard size={18} className="flex-shrink-0" />
              <span className="nav-label">Expense Panel</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('expense-add-expense'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'expense-add-expense' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Plus size={18} className="flex-shrink-0" />
                    <span className="nav-label">Record Expense</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('expense-all-expenses'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'expense-all-expenses' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <ClipboardList size={18} className="flex-shrink-0" />
                    <span className="nav-label">General Ledger</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('expense-categories'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'expense-categories' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <List size={18} className="flex-shrink-0" />
                    <span className="nav-label">Category Analytics</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('expense-reports'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'expense-reports' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <BarChart3 size={18} className="flex-shrink-0" />
                    <span className="nav-label">Budget Controls</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('expense-approvals'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'expense-approvals' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <ShieldAlert size={18} className="flex-shrink-0" />
                    <span className="nav-label">Approvals Queue</span>
                  </button>
                  <button
                    onClick={() => { setAdminView('expense-tracker'); setMobileOpen(false); }}
                    className={`nav-item ${adminView === 'expense-tracker' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <TrendingDown size={18} className="flex-shrink-0" />
                    <span className="nav-label">Expense Tracker</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => { setAdminView('expenses'); setMobileOpen(false); }}
              className={`nav-item ${adminView === 'expenses' ? 'active' : ''}`}
            >
              <Wallet size={20} className="flex-shrink-0" />
              <span className="nav-label">Expense Tracker</span>
            </button>

            <button
              onClick={() => { setAdminView('income'); setMobileOpen(false); }}
              className={`nav-item ${adminView === 'income' ? 'active' : ''}`}
            >
              <CreditCard size={20} className="flex-shrink-0" />
              <span className="nav-label">Income Tracker</span>
            </button>

            <button
              onClick={() => { setAdminView('reports'); setMobileOpen(false); }}
              className={`nav-item ${adminView === 'reports' ? 'active' : ''}`}
            >
              <List size={20} className="flex-shrink-0" />
              <span className="nav-label">Financial Reports</span>
            </button>

          </>
        ) : isAccountant ? (
          <>
            <button
              onClick={() => {
                setAccountantView('dashboard');
                setMobileOpen(false);
              }}
              className={`nav-item ${accountantView === 'dashboard' ? 'active' : ''}`}
              style={{ marginBottom: '4px' }}
            >
              <LayoutDashboard size={20} className="flex-shrink-0" />
              <span className="nav-label">Finance Panel</span>
            </button>
            {/* Student Finance Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setStudentOpen(!studentOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Users size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Student Finance</span>
                </div>
                {studentOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>

              {studentOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setAccountantView('collect-fees');
                      setMobileOpen(false);
                    }}
                    className={`nav-item ${accountantView === 'collect-fees' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Receipt size={18} className="flex-shrink-0" />
                    <span className="nav-label">Collect Fees</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountantView('fee-structure');
                      setMobileOpen(false);
                    }}
                    className={`nav-item ${accountantView === 'fee-structure' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Calculator size={18} className="flex-shrink-0" />
                    <span className="nav-label">Fee Structure</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountantView('students');
                      setMobileOpen(false);
                    }}
                    className={`nav-item ${accountantView === 'students' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Users size={18} className="flex-shrink-0" />
                    <span className="nav-label">Student Directory</span>
                  </button>
                </div>
              )}
            </div>

            {/* Teacher Finance Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setTeacherOpen(!teacherOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <UserCheck size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Teacher Finance</span>
                </div>
                {teacherOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>

              {teacherOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setAccountantView('payroll');
                      setMobileOpen(false);
                    }}
                    className={`nav-item ${accountantView === 'payroll' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Banknote size={18} className="flex-shrink-0" />
                    <span className="nav-label">Manage Payroll</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountantView('teacher-pay-structure');
                      setMobileOpen(false);
                    }}
                    className={`nav-item ${accountantView === 'teacher-pay-structure' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Calculator size={18} className="flex-shrink-0" />
                    <span className="nav-label">Teacher Pay Structure</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountantView('teacher-list');
                      setMobileOpen(false);
                    }}
                    className={`nav-item ${accountantView === 'teacher-list' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserCheck size={18} className="flex-shrink-0" />
                    <span className="nav-label">Teacher Directory</span>
                  </button>
                </div>
              )}
            </div>

            {/* Staff Finance Folder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setStaffOpen(!staffOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <UserCog size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Staff Finance</span>
                </div>
                {staffOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>

              {staffOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setAccountantView('staff-pay');
                      setMobileOpen(false);
                    }}
                    className={`nav-item ${accountantView === 'staff-pay' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Banknote size={18} className="flex-shrink-0" />
                    <span className="nav-label">Pay Staff</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountantView('staff-pay-structure');
                      setMobileOpen(false);
                    }}
                    className={`nav-item ${accountantView === 'staff-pay-structure' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Calculator size={18} className="flex-shrink-0" />
                    <span className="nav-label">Staff Pay Structure</span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountantView('staff');
                      setMobileOpen(false);
                    }}
                    className={`nav-item ${accountantView === 'staff' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserCog size={18} className="flex-shrink-0" />
                    <span className="nav-label">Staff Directory</span>
                  </button>
                </div>
              )}
            </div>

            {/* Other General Finance Items */}
            <button
              onClick={() => {
                setAccountantView('expenses');
                setMobileOpen(false);
              }}
              className={`nav-item ${accountantView === 'expenses' ? 'active' : ''}`}
            >
              <Wallet size={20} className="flex-shrink-0" />
              <span className="nav-label">Expense Tracker</span>
            </button>

            <button
              onClick={() => {
                setAccountantView('income');
                setMobileOpen(false);
              }}
              className={`nav-item ${accountantView === 'income' ? 'active' : ''}`}
            >
              <CreditCard size={20} className="flex-shrink-0" />
              <span className="nav-label">Income Tracker</span>
            </button>

            <button
              onClick={() => {
                setAccountantView('reports');
                setMobileOpen(false);
              }}
              className={`nav-item ${accountantView === 'reports' ? 'active' : ''}`}
            >
              <List size={20} className="flex-shrink-0" />
              <span className="nav-label">Financial Reports</span>
            </button>

          </>
        ) : isExpense ? (
          <>
            <button
              onClick={() => {
                setExpenseView('dashboard');
                setMobileOpen(false);
              }}
              className={`nav-item ${expenseView === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} className="flex-shrink-0" />
              <span className="nav-label">Expense Dashboard</span>
            </button>

            <button
              onClick={() => {
                setExpenseView('add-expense');
                setMobileOpen(false);
              }}
              className={`nav-item ${expenseView === 'add-expense' ? 'active' : ''}`}
            >
              <Plus size={20} className="flex-shrink-0" />
              <span className="nav-label">Record Expense</span>
            </button>

            <button
              onClick={() => {
                setExpenseView('all-expenses');
                setMobileOpen(false);
              }}
              className={`nav-item ${expenseView === 'all-expenses' ? 'active' : ''}`}
            >
              <ClipboardList size={20} className="flex-shrink-0" />
              <span className="nav-label">General Ledger</span>
            </button>

            <button
              onClick={() => {
                setExpenseView('categories');
                setMobileOpen(false);
              }}
              className={`nav-item ${expenseView === 'categories' ? 'active' : ''}`}
            >
              <List size={20} className="flex-shrink-0" />
              <span className="nav-label">Category Analytics</span>
            </button>

            <button
              onClick={() => {
                setExpenseView('reports');
                setMobileOpen(false);
              }}
              className={`nav-item ${expenseView === 'reports' ? 'active' : ''}`}
            >
              <BarChart3 size={20} className="flex-shrink-0" />
              <span className="nav-label">Budget Controls</span>
            </button>

            <button
              onClick={() => {
                setExpenseView('approvals');
                setMobileOpen(false);
              }}
              className={`nav-item ${expenseView === 'approvals' ? 'active' : ''}`}
            >
              <ShieldAlert size={20} className="flex-shrink-0" />
              <span className="nav-label">Approvals Queue</span>
            </button>

            <button
              onClick={() => {
                setExpenseView('tracker');
                setMobileOpen(false);
              }}
              className={`nav-item ${expenseView === 'tracker' ? 'active' : ''}`}
            >
              <TrendingDown size={20} className="flex-shrink-0" />
              <span className="nav-label">Expense Tracker</span>
            </button>


          </>
        ) : isTeacher ? (
          <>
            {teacherMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTeacherView(item.id);
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${teacherView === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </>
        ) : isRecep ? (
          <>
            {/* Receptionist Panel Overview */}
            <button
              onClick={() => {
                setRecepView('overview');
                setMobileOpen(false);
              }}
              className={`nav-item ${recepView === 'overview' ? 'active' : ''}`}
            >
              <List size={20} className="flex-shrink-0" />
              <span className="nav-label">Receptionist Panel</span>
            </button>

            {/* Students Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setRecepStudentOpen(!recepStudentOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Users size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Students</span>
                </div>
                {recepStudentOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {recepStudentOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setRecepView('register-student'); setMobileOpen(false); }}
                    className={`nav-item ${recepView === 'register-student' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserPlus size={18} className="flex-shrink-0" />
                    <span className="nav-label">Register Student</span>
                  </button>
                  <button
                    onClick={() => { setRecepView('students'); setMobileOpen(false); }}
                    className={`nav-item ${recepView === 'students' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <Users size={18} className="flex-shrink-0" />
                    <span className="nav-label">All Students</span>
                  </button>
                </div>
              )}
            </div>

            {/* Teachers Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setRecepTeacherOpen(!recepTeacherOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <UserCheck size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Teachers</span>
                </div>
                {recepTeacherOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {recepTeacherOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setRecepView('add-teacher'); setMobileOpen(false); }}
                    className={`nav-item ${recepView === 'add-teacher' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserPlus2 size={18} className="flex-shrink-0" />
                    <span className="nav-label">Add Teacher</span>
                  </button>
                  <button
                    onClick={() => { setRecepView('teachers'); setMobileOpen(false); }}
                    className={`nav-item ${recepView === 'teachers' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserCheck size={18} className="flex-shrink-0" />
                    <span className="nav-label">All Teachers</span>
                  </button>
                </div>
              )}
            </div>

            {/* Staff Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setRecepStaffOpen(!recepStaffOpen)}
                className="nav-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <UserCog size={20} className="flex-shrink-0" />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Staff</span>
                </div>
                {recepStaffOpen ? <ChevronDown size={16} className="flex-shrink-0" /> : <ChevronRight size={16} className="flex-shrink-0" />}
              </button>
              {recepStaffOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '24px', marginTop: '2px', marginBottom: '6px', gap: '4px' }}>
                  <button
                    onClick={() => { setRecepView('add-staff'); setMobileOpen(false); }}
                    className={`nav-item ${recepView === 'add-staff' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserPlus2 size={18} className="flex-shrink-0" />
                    <span className="nav-label">Add Staff</span>
                  </button>
                  <button
                    onClick={() => { setRecepView('staff'); setMobileOpen(false); }}
                    className={`nav-item ${recepView === 'staff' ? 'active' : ''}`}
                    style={{ padding: '10px 12px', fontSize: '0.88rem', position: 'relative' }}
                  >
                    <UserCog size={18} className="flex-shrink-0" />
                    <span className="nav-label">All Staff</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>

      <div className="sidebar-profile">
        <div className="profile-avatar">
          {isAdmin ? 'AD' : (isAccountant ? 'AC' : (isExpense ? 'EX' : (isRecep ? 'RE' : (isTeacher ? 'TE' : (schoolDetails?.principal ? schoolDetails.principal.split(' ').pop().substring(0, 2).toUpperCase() : 'AD')))))}
        </div>
        <div className="profile-details">
          <span className="profile-name">{isAdmin ? 'Admin Dashboard' : (isAccountant ? 'Finance Dashboard' : (isExpense ? 'Expense Dashboard' : (isRecep ? 'Receptionist Dashboard' : (isTeacher ? 'Teacher Dashboard' : (schoolDetails?.principal || 'Alex Devlin')))))}</span>
          <span className="profile-role">{isAdmin ? 'Admin Dashboard' : (isAccountant ? 'Finance Dashboard' : (isExpense ? 'Expense Dashboard' : (isRecep ? 'Receptionist Dashboard' : (isTeacher ? 'Teacher Dashboard' : 'Super Admin'))))}</span>
        </div>
      </div>
    </aside>
  );
}
