import React from 'react';
import { Users, UserCheck, UserCog, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import StudentDirectory from './StudentDirectory';
import TeacherList from './TeacherList';
import StaffDirectory from './StaffDirectory';
import DashboardOverview from './DashboardOverview';

export default function AdminPanel({ setActiveView, onLogout, adminView, setAdminView }) {
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
              onClick={() => setAdminView('overview')}
            >
              <div className="admin-dash-icon" style={{ color: 'hsl(var(--color-success))', background: 'rgba(hsl(var(--color-success)), 0.1)' }}>
                <LayoutDashboard size={36} />
              </div>
              <h3>Main Dashboard</h3>
              <p>View visual analytics and metrics overview</p>
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
              {adminView === 'dashboard' ? 'Select a section to manage' : `Managing ${adminView === 'overview' ? 'Main Dashboard Overview' : adminView}`}
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
