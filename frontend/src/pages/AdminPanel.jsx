import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserCog, 
  Shield, 
  LogOut, 
  LayoutDashboard,
  ClipboardCheck,
  List,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Receipt,
  UserPlus
} from 'lucide-react';
import StudentDirectory from './StudentDirectory';
import TeacherList from './TeacherList';
import StaffDirectory from './StaffDirectory';
import DashboardOverview from './DashboardOverview';
import AcademicPanel from './AcademicPanel';
import { 
  MarkAttendanceView, 
  AttendanceTrackerView,
  AttendanceHistoryView, 
  StudentReportsView, 
  ClassReportsView, 
  MonthlyCalendarView 
} from './TeacherPanel';
import {
  CollectFeesView,
  FeeStructureView,
  PayrollView,
  TeacherSalaryStructureView,
  ExpensesView,
  IncomeView,
  ReportsView,
  StaffPaymentsView,
  StaffPaymentStructureView
} from './AccountantPanel';
import RegisterStudent from './RegisterStudent';
import AddTeacher from './AddTeacher';
import AddStaff from './AddStaff';
import ExpensePanel from './ExpensePanel';

export default function AdminPanel({ setActiveView, onLogout, adminView, setAdminView }) {
  // Roster/Filter States for Admin Attendance Panel
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('IX');
  const [selectedSection, setSelectedSection] = useState('A');
  const [studentSearch, setStudentSearch] = useState('');
  const [attendanceTab, setAttendanceTab] = useState('mark-attendance');
  const [notification, setNotification] = useState(null);

  // Sync adminView with attendanceTab
  useEffect(() => {
    if (adminView === 'attendance') {
      setAttendanceTab('mark-attendance');
    }
  }, [adminView]);

  // Toast Notification helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const renderAdminContent = () => {
    if (adminView && adminView.startsWith('expense-')) {
      const subView = adminView.replace('expense-', '');
      return (
        <ExpensePanel
          setActiveView={setActiveView}
          onLogout={() => setAdminView('overview')}
          expenseView={subView}
          setExpenseView={(v) => setAdminView('expense-' + v)}
          hideHeader={true}
        />
      );
    }

    switch (adminView) {
      case 'academic-class-timetable':
      case 'academic-teacher-timetable':
      case 'academic-exams':
      case 'academic-exam-timetable':
      case 'academic-events':
      case 'academic-notices':
      case 'academic-holidays':
      case 'academic-calendar':
      case 'academic-results':
      case 'academic-reports':
        return <AcademicPanel subView={adminView} />;
      case 'students':
        return <StudentDirectory readOnly={false} onAddClick={() => setAdminView('register-student')} />;
      case 'teachers':
        return <TeacherList setActiveView={setActiveView} readOnly={false} onAddClick={() => setAdminView('add-teacher')} />;
      case 'staff':
        return <StaffDirectory readOnly={false} onAddClick={() => setAdminView('add-staff')} />;
      case 'overview':
        return (
          <DashboardOverview 
            onQuickAction={(action) => {
              if (action === 'add-student') setAdminView('register-student');
              else if (action === 'add-teacher') setAdminView('add-teacher');
              else if (action === 'add-staff') setAdminView('add-staff');
              else if (action === 'mark-attendance') setAdminView('attendance');
              else if (action === 'collect-fee') setAdminView('collect-fees');
              else if (action === 'add-expense') setAdminView('expenses');
            }} 
          />
        );
      case 'collect-fees':
        return <CollectFeesView showToast={showToast} />;
      case 'fee-structure':
        return <FeeStructureView showToast={showToast} />;
      case 'payroll':
        return <PayrollView showToast={showToast} />;
      case 'teacher-pay-structure':
        return <TeacherSalaryStructureView showToast={showToast} />;
      case 'staff-pay':
        return <StaffPaymentsView showToast={showToast} />;
      case 'staff-pay-structure':
        return <StaffPaymentStructureView showToast={showToast} />;
      case 'expenses':
        return <ExpensesView showToast={showToast} />;
      case 'income':
        return <IncomeView showToast={showToast} />;
      case 'reports':
        return <ReportsView showToast={showToast} />;
      case 'register-student':
        return <RegisterStudent setActiveView={(view) => { if (view === 'students') setAdminView('students'); else setActiveView(view); }} />;
      case 'add-teacher':
        return <AddTeacher setActiveView={(view) => { if (view === 'teachers') setAdminView('teachers'); else setActiveView(view); }} />;
      case 'add-staff':
        return <AddStaff setActiveView={(view) => { if (view === 'staff') setAdminView('staff'); else setActiveView(view); }} />;
      case 'attendance-tracker':
        return (
          <AttendanceTrackerView 
            date={selectedDate}
            setDate={setSelectedDate}
            showToast={showToast}
          />
        );
      case 'class-reports':
        return (
          <ClassReportsView showToast={showToast} />
        );
      case 'attendance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Sub-Tab Bar for Admin Attendance */}
            <div className="glass-panel" style={{ padding: '8px', display: 'flex', gap: '8px', overflowX: 'auto', borderRadius: '12px' }}>
              <button 
                onClick={() => {
                  setAttendanceTab('mark-attendance');
                  setAdminView('attendance');
                }}
                className={`tab-btn-custom ${attendanceTab === 'mark-attendance' ? 'active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: attendanceTab === 'mark-attendance' ? 'rgba(hsl(var(--color-primary)), 0.1)' : 'transparent',
                  color: attendanceTab === 'mark-attendance' ? 'hsl(var(--color-primary))' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <ClipboardCheck size={16} /> Mark Attendance
              </button>
              
              <button 
                onClick={() => {
                  setAttendanceTab('attendance-history');
                  setAdminView('attendance');
                }}
                className={`tab-btn-custom ${attendanceTab === 'attendance-history' ? 'active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: attendanceTab === 'attendance-history' ? 'rgba(hsl(var(--color-warning)), 0.1)' : 'transparent',
                  color: attendanceTab === 'attendance-history' ? 'hsl(var(--color-warning))' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={16} /> Attendance History
              </button>
              
              <button 
                onClick={() => {
                  setAttendanceTab('student-reports');
                  setAdminView('attendance');
                }}
                className={`tab-btn-custom ${attendanceTab === 'student-reports' ? 'active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: attendanceTab === 'student-reports' ? 'rgba(hsl(var(--color-success)), 0.1)' : 'transparent',
                  color: attendanceTab === 'student-reports' ? 'hsl(var(--color-success))' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Users size={16} /> Student Reports
              </button>
              
              <button 
                onClick={() => {
                  setAttendanceTab('monthly-calendar');
                  setAdminView('attendance');
                }}
                className={`tab-btn-custom ${attendanceTab === 'monthly-calendar' ? 'active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: attendanceTab === 'monthly-calendar' ? 'rgba(hsl(var(--color-info)), 0.1)' : 'transparent',
                  color: attendanceTab === 'monthly-calendar' ? 'hsl(var(--color-info))' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Calendar size={16} /> Monthly Calendar
              </button>
            </div>

            {/* Notification Toast inside View */}
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

            {/* Dynamic Attendance Sub-views */}
            {attendanceTab === 'mark-attendance' && (
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
            )}

            {attendanceTab === 'attendance-history' && (
              <AttendanceHistoryView showToast={showToast} />
            )}

            {attendanceTab === 'student-reports' && (
              <StudentReportsView showToast={showToast} />
            )}

            {attendanceTab === 'monthly-calendar' && (
              <MonthlyCalendarView showToast={showToast} />
            )}
          </div>
        );
      default:
        return (
          <DashboardOverview 
            onQuickAction={(action) => {
              if (action === 'add-student') setAdminView('register-student');
              else if (action === 'add-teacher') setAdminView('add-teacher');
              else if (action === 'add-staff') setAdminView('add-staff');
              else if (action === 'mark-attendance') setAdminView('attendance');
              else if (action === 'collect-fee') setAdminView('collect-fees');
              else if (action === 'add-expense') setAdminView('expenses');
            }} 
          />
        );
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Panel Header */}
      <div className="admin-panel-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(hsl(var(--color-primary)), 0.1)',
            color: 'hsl(var(--color-primary))'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Admin Dashboard</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {adminView === 'overview' ? 'Viewing Main Dashboard Overview' :
               adminView === 'students' ? 'Viewing Registered Students Directory' :
               adminView === 'teachers' ? 'Viewing Faculty Registry' :
               adminView === 'staff' ? 'Viewing Non-Academic Staff Directory' :
               adminView === 'attendance-tracker' ? 'Tracking Schoolwide Attendance Cohorts' :
               adminView === 'class-reports' ? 'Evaluating Class-wise Attendance Reports' :
               adminView === 'attendance' ? 'Managing Schoolwide Attendance' :
               adminView === 'collect-fees' ? 'Collecting Student Fees' :
               adminView === 'fee-structure' ? 'Configuring Student Fee Structures' :
               adminView === 'payroll' ? 'Processing Teacher Payroll' :
               adminView === 'teacher-pay-structure' ? 'Configuring Teacher Salary Tiers' :
               adminView === 'staff-pay' ? 'Processing Staff Payments' :
               adminView === 'staff-pay-structure' ? 'Configuring Staff Salary Tiers' :
               adminView === 'expenses' ? 'Tracking School Expenditures' :
               adminView === 'income' ? 'Tracking School Other Revenue Sources' :
               adminView === 'reports' ? 'Viewing Visual Financial Statements' :
               adminView === 'register-student' ? 'Admitting a New Student' :
               adminView === 'add-teacher' ? 'Registering a New Teacher' :
               adminView === 'add-staff' ? 'Registering a New Staff Member' : `Managing ${adminView}`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onLogout}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'rgb(var(--color-danger-rgb))', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
          <button
            onClick={onLogout}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LayoutDashboard size={16} />
            Main Dashboard
          </button>
        </div>
      </div>

      {/* Admin Content */}
      {renderAdminContent()}
    </div>
  );
}
