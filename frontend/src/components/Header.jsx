import React, { useState } from 'react';
import { 
  Menu,
  Search, 
  Bell, 
  Sun, 
  Moon, 
  MessageSquare, 
  User, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  Shield,
  Calculator,
  Wallet,
  UserCog,
  UserCheck
} from 'lucide-react';

export default function Header({ 
  activeView, 
  isCollapsed, 
  setIsCollapsed, 
  mobileOpen, 
  setMobileOpen,
  theme,
  setTheme,
  schoolDetails,
  setActiveView,
  isAdmin,
  isDeveloperAdmin,
  onLogout
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);

  const viewTitles = {
    students: { title: 'Student Directory', desc: 'Manage all student profiles, registrations, and academic standings.' },
    'add-teacher': { title: 'Staff Registration Form', desc: 'Enroll a new staff member with full professional profile, credentials, and document uploads.' },
    'teacher-list': { title: 'Staff Directory', desc: 'Review and manage all staff profiles, departments, and employment records.' },
    staff: { title: 'Employee Directory', desc: 'Manage administrative, facilities, technical, and academic support employees.' },
    finance: { title: 'Financial Operations', desc: 'Track pending tuition fees, invoices, receipts, and overhead costs.' },
    school: { title: 'School', desc: 'View school details, modify profile variables, and monitor student and employee rollups.' },
    'register-student': { title: 'Student Registration Form', desc: 'Enroll a new student with full bio, parent/guardian contacts, and upload verified credentials.' }
  };

  const currentMeta = viewTitles[activeView] || { title: 'Academy Portal', desc: 'Overview and administration console' };

  const notifications = [];

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="app-header animate-fade-in">
      <div className="header-left">
        {/* Toggle button - only show when sidebar is collapsed */}
        {isCollapsed && !mobileOpen && (
          <button 
            onClick={() => {
              if (window.innerWidth <= 900) {
                setMobileOpen(true);
              } else {
                setIsCollapsed(false);
              }
            }}
            className="sidebar-toggle-btn"
            aria-label="Toggle navigation drawer"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="header-title">
          <h1>{currentMeta.title}</h1>
          <p>{currentMeta.desc}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Search bar */}
        <div className="search-bar-container">
          <Search size={18} className="search-bar-icon" />
          <input 
            type="text" 
            placeholder="Search student, staff ID..." 
            className="search-bar-input" 
          />
        </div>

        {/* Theme Toggler */}
        <button onClick={toggleTheme} className="action-btn" title="Toggle color scheme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Icon and Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }} 
            className="action-btn"
            title="Notifications"
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && <span className="badge-dot"></span>}
          </button>

          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              width: '320px',
              padding: '16px',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-primary))', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px', borderRadius: '8px', background: n.read ? 'transparent' : 'rgba(hsl(var(--color-primary)), 0.05)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: n.read ? 400 : 600 }}>{n.text}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 8px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Bell size={24} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>No new notifications</span>
                    <span style={{ fontSize: '0.7rem' }}>You're all caught up!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowDashboardMenu(false);
            }}
            className="action-btn" 
            style={{ width: 'auto', padding: '0 12px', gap: '8px' }}
            title="User Profile Menu"
          >
            <User size={18} />
            <ChevronDown size={14} />
          </button>

          {showProfileMenu && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              width: '180px',
              padding: '8px',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <button onClick={onLogout} className="nav-item" style={{ padding: '10px', fontSize: '0.85rem', color: 'rgb(var(--color-danger-rgb))' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>

        {!isAdmin && !isDeveloperAdmin && (
          <button
            onClick={() => setActiveView('admin-login')}
            className="action-btn"
            title="Admin Dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', width: 'auto', padding: '0 12px' }}
          >
            <Shield size={18} />
            <span>Admin Dashboard</span>
          </button>
        )}
      </div>
    </header>
  );
}
