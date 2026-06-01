import React from 'react';
import { 
  UserPlus, 
  UserPlus2, 
  UserCog, 
  LogOut, 
  Users, 
  UserCheck, 
  LayoutDashboard 
} from 'lucide-react';
import RegisterStudent from './RegisterStudent';
import AddTeacher from './AddTeacher';
import AddStaff from './AddStaff';
import StudentDirectory from './StudentDirectory';
import TeacherList from './TeacherList';
import StaffDirectory from './StaffDirectory';
import DashboardOverview from './DashboardOverview';

export default function RecepPanel({ setActiveView, onLogout, recepView, setRecepView }) {
  const renderRecepContent = () => {
    switch (recepView) {
      case 'register-student':
        return (
          <RegisterStudent
            setActiveView={(view) => {
              if (view === 'students') {
                setRecepView('students');
              } else {
                setActiveView(view);
              }
            }}
          />
        );
      case 'add-teacher':
        return <AddTeacher setActiveView={setActiveView} />;
      case 'add-staff':
        return <AddStaff setActiveView={setActiveView} />;
      case 'students':
        return <StudentDirectory />;
      case 'teachers':
        return <TeacherList setActiveView={setActiveView} />;
      case 'staff':
        return <StaffDirectory />;
      case 'overview':
        return <DashboardOverview />;
      default:
        return (
          <div className="admin-dashboard-grid">
            <div
              className="glass-panel admin-dash-card"
              onClick={() => setRecepView('register-student')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-primary))', background: 'rgba(hsl(var(--color-primary)), 0.1)' }}>
                <UserPlus size={36} />
              </div>
              <h3>Register Student</h3>
              <p>Add a new student to the directory</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setRecepView('add-teacher')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-secondary))', background: 'rgba(hsl(var(--color-secondary)), 0.1)' }}>
                <UserPlus2 size={36} />
              </div>
              <h3>Add Teacher</h3>
              <p>Register a new faculty member</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setRecepView('add-staff')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-info))', background: 'rgba(hsl(var(--color-info)), 0.1)' }}>
                <UserCog size={36} />
              </div>
              <h3>Add Staff</h3>
              <p>Register a new staff member</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setRecepView('students')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-success))', background: 'rgba(hsl(var(--color-success)), 0.1)' }}>
                <Users size={36} />
              </div>
              <h3>All Students</h3>
              <p>View and search student directories</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setRecepView('teachers')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-warning))', background: 'rgba(hsl(var(--color-warning)), 0.1)' }}>
                <UserCheck size={36} />
              </div>
              <h3>All Teachers</h3>
              <p>View faculty roster lists</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setRecepView('staff')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-danger))', background: 'rgba(hsl(var(--color-danger)), 0.1)' }}>
                <UserCog size={36} />
              </div>
              <h3>All Staff</h3>
              <p>View non-academic staff directories</p>
            </div>

            <div
              className="glass-panel admin-dash-card"
              onClick={() => setRecepView('overview')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-secondary))', background: 'rgba(hsl(var(--color-secondary)), 0.1)' }}>
                <LayoutDashboard size={36} />
              </div>
              <h3>Main Dashboard</h3>
              <p>View visual analytics and metrics overview</p>
            </div>
          </div>
        );
    }
  };

  const getSubheaderText = () => {
    if (recepView === 'dashboard') return 'Select a section to manage';
    switch (recepView) {
      case 'register-student': return 'Managing Student Registration';
      case 'add-teacher': return 'Managing Teacher Registration';
      case 'add-staff': return 'Managing Staff Registration';
      case 'students': return 'Viewing Registered Students Directory';
      case 'teachers': return 'Viewing Faculty Registry';
      case 'staff': return 'Viewing Non-Academic Staff Directory';
      case 'overview': return 'Viewing Main Dashboard Overview';
      default: return 'Select a section to manage';
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-panel-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(hsl(var(--color-success)), 0.1)',
            color: 'hsl(var(--color-success))'
          }}>
            <UserPlus size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Receptionist Panel</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {getSubheaderText()}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {recepView !== 'dashboard' && (
            <button
              onClick={() => setRecepView('dashboard')}
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

      {renderRecepContent()}
    </div>
  );
}
