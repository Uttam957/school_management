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
import RecepOverview from './RecepOverview';

export default function RecepPanel({ setActiveView, onLogout, recepView, setRecepView, onBackToMain }) {
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
        return <StudentDirectory readOnly={false} onAddClick={() => setRecepView('register-student')} />;
      case 'teachers':
        return <TeacherList setActiveView={setActiveView} readOnly={false} onAddClick={() => setRecepView('add-teacher')} />;
      case 'staff':
        return <StaffDirectory readOnly={false} onAddClick={() => setRecepView('add-staff')} />;
      case 'overview':
        return <RecepOverview setRecepView={setRecepView} />;
      default:
        return <RecepOverview setRecepView={setRecepView} />;
    }
  };

  const getSubheaderText = () => {
    switch (recepView) {
      case 'register-student': return 'Managing Student Registration';
      case 'add-teacher': return 'Managing Teacher Registration';
      case 'add-staff': return 'Managing Staff Registration';
      case 'students': return 'Viewing Registered Students Directory';
      case 'teachers': return 'Viewing Faculty Registry';
      case 'staff': return 'Viewing Non-Academic Staff Directory';
      case 'overview': return 'Viewing Main Dashboard Overview';
      default: return 'Viewing Registry Operations Dashboard';
    }
  };

  const getHeaderIcon = () => {
    switch (recepView) {
      case 'register-student':
      case 'students':
        return {
          icon: <Users size={24} />,
          bg: 'rgba(hsl(var(--color-primary)), 0.1)',
          color: 'hsl(var(--color-primary))'
        };
      case 'add-teacher':
      case 'teachers':
        return {
          icon: <UserCheck size={24} />,
          bg: 'rgba(hsl(var(--color-secondary)), 0.1)',
          color: 'hsl(var(--color-secondary))'
        };
      case 'add-staff':
      case 'staff':
        return {
          icon: <UserCog size={24} />,
          bg: 'rgba(hsl(var(--color-info)), 0.1)',
          color: 'hsl(var(--color-info))'
        };
      default:
        return {
          icon: <LayoutDashboard size={24} />,
          bg: 'rgba(hsl(var(--color-success)), 0.1)',
          color: 'hsl(var(--color-success))'
        };
    }
  };

  const headerStyle = getHeaderIcon();

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-panel-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: headerStyle.bg,
            color: headerStyle.color
          }}>
            {headerStyle.icon}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Receptionist Dashboard</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {getSubheaderText()}
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

        </div>
      </div>

      {renderRecepContent()}
    </div>
  );
}
