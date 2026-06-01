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
  Banknote
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
  setAccountantView
}) {
  const [studentOpen, setStudentOpen] = useState(true);
  const [teacherOpen, setTeacherOpen] = useState(true);
  const [staffOpen, setStaffOpen] = useState(true);
  const [adminCoreOpen, setAdminCoreOpen] = useState(true);
  const [adminAttendanceOpen, setAdminAttendanceOpen] = useState(true);
  const [adminRecepOpen, setAdminRecepOpen] = useState(true);
  const [adminStudentFinanceOpen, setAdminStudentFinanceOpen] = useState(true);
  const [adminTeacherFinanceOpen, setAdminTeacherFinanceOpen] = useState(true);
  const [adminStaffFinanceOpen, setAdminStaffFinanceOpen] = useState(true);
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teacher-list', label: 'Teacher List', icon: UserCheck },
    { id: 'staff', label: 'Staff Directory', icon: UserCog },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'school', label: 'School', icon: School },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Admin Panel', icon: LayoutDashboard },
    { id: 'overview', label: 'Main Dashboard', icon: List },
    { id: 'students', label: 'Student List', icon: Users },
    { id: 'teachers', label: 'Teacher List', icon: UserCheck },
    { id: 'staff', label: 'Staff List', icon: UserCog },
    { id: 'attendance', label: 'Attendance Manager', icon: ClipboardCheck },
  ];

  const recepMenuItems = [
    { id: 'dashboard', label: 'Receptionist Panel', icon: LayoutDashboard },
    { id: 'overview', label: 'Main Dashboard', icon: List },
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
          <span className="brand-name">{isAdmin ? 'Admin Panel' : (isAccountant ? 'Finance Panel' : (isRecep ? 'Recep Panel' : (schoolDetails?.name || 'Dashboard')))}</span>
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
            {/* Admin Overview Link */}
            <button
              onClick={() => {
                setAdminView('dashboard');
                setMobileOpen(false);
              }}
              className={`nav-item ${adminView === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} className="flex-shrink-0" />
              <span className="nav-label">Admin Dashboard</span>
            </button>

            <button
              onClick={() => {
                setAdminView('overview');
                setMobileOpen(false);
              }}
              className={`nav-item ${adminView === 'overview' ? 'active' : ''}`}
            >
              <List size={20} className="flex-shrink-0" />
              <span className="nav-label">Main Dashboard</span>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

            {/* General Finance Items */}
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

            {/* Logout Div */}
            <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px' }}>
              <button
                onClick={() => {
                  onAdminLogout();
                  setMobileOpen(false);
                }}
                className="nav-item"
                style={{ color: 'rgb(var(--color-danger-rgb))' }}
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="nav-label">Admin Logout</span>
              </button>
            </div>
          </>
        ) : isAccountant ? (
          <>
            {/* Dashboard Link */}
            <button
              onClick={() => {
                setAccountantView('dashboard');
                setMobileOpen(false);
              }}
              className={`nav-item ${accountantView === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} className="flex-shrink-0" />
              <span className="nav-label">Finance Dashboard</span>
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
                setAccountantView('staff');
                setMobileOpen(false);
              }}
              className={`nav-item ${accountantView === 'staff' ? 'active' : ''}`}
            >
              <UserCog size={20} className="flex-shrink-0" />
              <span className="nav-label">Staff Directory</span>
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

            <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px' }}>
              <button
                onClick={() => {
                  onAccountantLogout();
                  setMobileOpen(false);
                }}
                className="nav-item"
                style={{ color: 'rgb(var(--color-danger-rgb))' }}
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="nav-label">Accountant Logout</span>
              </button>
            </div>
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
            <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px' }}>
              <button
                onClick={() => {
                  onTeacherLogout();
                  setMobileOpen(false);
                }}
                className="nav-item"
                style={{ color: 'rgb(var(--color-danger-rgb))' }}
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="nav-label">Teacher Logout</span>
              </button>
            </div>
          </>
        ) : isRecep ? (
          <>
            {recepMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setRecepView(item.id);
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${recepView === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
            <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px' }}>
              <button
                onClick={() => {
                  onRecepLogout();
                  setMobileOpen(false);
                }}
                className="nav-item"
                style={{ color: 'rgb(var(--color-danger-rgb))' }}
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="nav-label">Recep Logout</span>
              </button>
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
            <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => {
                  setActiveView('accountant-login');
                  setMobileOpen(false);
                }}
                className={`nav-item ${activeView === 'accountant-login' ? 'active' : ''}`}
              >
                <Calculator size={20} className="flex-shrink-0" />
                <span className="nav-label">Accountant Login</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('recep-login');
                  setMobileOpen(false);
                }}
                className={`nav-item ${activeView === 'recep-login' ? 'active' : ''}`}
              >
                <UserCog size={20} className="flex-shrink-0" />
                <span className="nav-label">Receptionist Login</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveView('teacher-login');
                  setMobileOpen(false);
                }}
                className={`nav-item ${activeView === 'teacher-login' ? 'active' : ''}`}
              >
                <UserCheck size={20} className="flex-shrink-0" />
                <span className="nav-label">Teacher Login</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveView('admin-login');
                  setMobileOpen(false);
                }}
                className={`nav-item ${activeView === 'admin-login' ? 'active' : ''}`}
              >
                <Shield size={20} className="flex-shrink-0" />
                <span className="nav-label">Admin Login</span>
              </button>
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-profile">
        <div className="profile-avatar">
          {isAdmin ? 'AD' : (isAccountant ? 'AC' : (isRecep ? 'RE' : (isTeacher ? 'TE' : (schoolDetails?.principal ? schoolDetails.principal.split(' ').pop().substring(0, 2).toUpperCase() : 'AD'))))}
        </div>
        <div className="profile-details">
          <span className="profile-name">{isAdmin ? 'Admin' : (isAccountant ? 'Accountant' : (isRecep ? 'Receptionist' : (isTeacher ? 'Teacher' : (schoolDetails?.principal || 'Alex Devlin'))))}</span>
          <span className="profile-role">{isAdmin ? 'Administrator' : (isAccountant ? 'Finance Manager' : (isRecep ? 'Subadmin' : (isTeacher ? 'Faculty' : 'Super Admin')))}</span>
        </div>
      </div>
    </aside>
  );
}
