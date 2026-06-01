import React from 'react';
import { UserPlus, UserPlus2, UserCog, LogOut } from 'lucide-react';
import RegisterStudent from './RegisterStudent';
import AddTeacher from './AddTeacher';
import AddStaff from './AddStaff';

export default function RecepPanel({ setActiveView, onLogout, recepView, setRecepView }) {
  const renderRecepContent = () => {
    switch (recepView) {
      case 'register-student':
        return <RegisterStudent setActiveView={setActiveView} />;
      case 'add-teacher':
        return <AddTeacher setActiveView={setActiveView} />;
      case 'add-staff':
        return <AddStaff setActiveView={setActiveView} />;
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
          </div>
        );
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
              {recepView === 'dashboard' ? 'Select a section to manage' : `Managing ${recepView === 'register-student' ? 'Student Registration' : recepView === 'add-teacher' ? 'Teacher Registration' : 'Staff Registration'}`}
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
            style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'rgb(var(--color-danger-rgb))' }}
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
