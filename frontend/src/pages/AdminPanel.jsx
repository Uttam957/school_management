import React, { useState } from 'react';
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
import { 
  MarkAttendanceView, 
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

export default function AdminPanel({ setActiveView, onLogout, adminView, setAdminView }) {
  // Roster/Filter States for Admin Attendance Panel
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('IX');
  const [selectedSection, setSelectedSection] = useState('A');
  const [studentSearch, setStudentSearch] = useState('');
  const [attendanceTab, setAttendanceTab] = useState('mark-attendance');
  const [notification, setNotification] = useState(null);

  // Toast Notification helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const renderAdminContent = () => {
    switch (adminView) {
      case 'students':
        return <StudentDirectory readOnly={false} />;
      case 'teachers':
        return <TeacherList setActiveView={setActiveView} readOnly={false} />;
      case 'staff':
        return <StaffDirectory readOnly={false} />;
      case 'overview':
        return <DashboardOverview />;
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
      case 'attendance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Sub-Tab Bar for Admin Attendance */}
            <div className="glass-panel" style={{ padding: '8px', display: 'flex', gap: '8px', overflowX: 'auto', borderRadius: '12px' }}>
              <button 
                onClick={() => setAttendanceTab('mark-attendance')}
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
                onClick={() => setAttendanceTab('attendance-history')}
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
                onClick={() => setAttendanceTab('student-reports')}
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
                onClick={() => setAttendanceTab('class-reports')}
                className={`tab-btn-custom ${attendanceTab === 'class-reports' ? 'active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: attendanceTab === 'class-reports' ? 'rgba(hsl(var(--color-danger)), 0.1)' : 'transparent',
                  color: attendanceTab === 'class-reports' ? 'hsl(var(--color-danger))' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <TrendingUp size={16} /> Class Reports
              </button>
              
              <button 
                onClick={() => setAttendanceTab('monthly-calendar')}
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

            {attendanceTab === 'class-reports' && (
              <ClassReportsView showToast={showToast} />
            )}

            {attendanceTab === 'monthly-calendar' && (
              <MonthlyCalendarView showToast={showToast} />
            )}
          </div>
        );
      default:
        return (
          <div className="admin-dashboard-grid">
            <div
              className="glass-panel admin-dash-card"
              onClick={() => setAdminView('students')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-primary))', background: 'rgba(hsl(var(--color-primary)), 0.1)' }}>
                <Users size={36} />
              </div>
              <h3>Student List</h3>
              <p>View and manage all registered students</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setAdminView('teachers')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-secondary))', background: 'rgba(hsl(var(--color-secondary)), 0.1)' }}>
                <UserCheck size={36} />
              </div>
              <h3>Teacher List</h3>
              <p>View and manage all faculty members</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setAdminView('staff')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-info))', background: 'rgba(hsl(var(--color-info)), 0.1)' }}>
                <UserCog size={36} />
              </div>
              <h3>Staff List</h3>
              <p>View and manage all staff members</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setAdminView('attendance')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(280, 85%, 65%)', background: 'rgba(168, 85, 247, 0.1)' }}>
                <ClipboardCheck size={36} />
              </div>
              <h3>Attendance Manager</h3>
              <p>Manage, track, analyze, and log student attendance schoolwide</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setAdminView('overview')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-success))', background: 'rgba(hsl(var(--color-success)), 0.1)' }}>
                <LayoutDashboard size={36} />
              </div>
              <h3>Main Dashboard</h3>
              <p>View visual analytics and metrics overview</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setAdminView('register-student')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(140, 85%, 65%)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <UserPlus size={36} />
              </div>
              <h3>Admissions Registry</h3>
              <p>Admit new students, teachers, or staff members schoolwide</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setAdminView('reports')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(30, 85%, 65%)', background: 'rgba(245, 158, 11, 0.1)' }}>
                <Receipt size={36} />
              </div>
              <h3>Finance & Accounts</h3>
              <p>Collect fees, manage school payrolls, track expenses and revenues</p>
            </div>
          </div>
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Admin Panel</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {adminView === 'dashboard' ? 'Select a section to manage' : 
               adminView === 'overview' ? 'Viewing Main Dashboard Overview' :
               adminView === 'students' ? 'Viewing Registered Students Directory' :
               adminView === 'teachers' ? 'Viewing Faculty Registry' :
               adminView === 'staff' ? 'Viewing Non-Academic Staff Directory' :
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
          {adminView !== 'dashboard' && (
            <button
              onClick={() => setAdminView('dashboard')}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Back to Dashboard
            </button>
          )}
          <button
            onClick={onLogout}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'rgb(var(--color-danger-rgb))', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={16} />
            Back to Main Dashboard
          </button>
        </div>
      </div>

      {/* Admin Content */}
      {renderAdminContent()}
    </div>
  );
}
