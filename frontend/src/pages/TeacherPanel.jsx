import React from 'react';
import { Users, LogOut, GraduationCap } from 'lucide-react';
import StudentDirectory from './StudentDirectory';

export default function TeacherPanel({ onLogout }) {
  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-panel-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(hsl(var(--color-secondary)), 0.1)',
            color: 'hsl(var(--color-secondary))'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Teacher Panel</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Student Directory</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'rgb(var(--color-danger-rgb))' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <StudentDirectory />
    </div>
  );
}
