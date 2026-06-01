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
  Settings,
  ChevronDown
} from 'lucide-react';

export default function Header({ 
  activeView, 
  isCollapsed, 
  setIsCollapsed, 
  mobileOpen, 
  setMobileOpen,
  theme,
  setTheme,
  schoolDetails
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const viewTitles = {
    overview: { title: 'Dashboard Overview', desc: `Welcome back, Principal ${schoolDetails?.principal || 'Alex'}. Here is your academy's status.` },
    students: { title: 'Student Directory', desc: 'Manage all student profiles, registrations, and academic standings.' },
    'add-teacher': { title: 'Teacher Registration Form', desc: 'Enroll a new teacher with full professional profile, credentials, and document uploads.' },
    'teacher-list': { title: 'Teacher Directory', desc: 'Review and manage all faculty profiles, departments, and employment records.' },
    staff: { title: 'Staff Directory', desc: 'Manage administrative, facilities, technical, and academic support staff.' },
    finance: { title: 'Financial Operations', desc: 'Track pending tuition fees, invoices, receipts, and overhead costs.' },
    school: { title: 'School', desc: 'View school details, modify profile variables, and monitor student and staff rollups.' },
    'register-student': { title: 'Student Registration Form', desc: 'Enroll a new student with full bio, parent/guardian contacts, and upload verified credentials.' }
  };

  const currentMeta = viewTitles[activeView] || { title: 'Academy Portal', desc: 'Overview and administration console' };

  const notifications = [
    { id: 1, text: 'New student registered: Emily Stone (Grade 9-A)', time: '5 mins ago', read: false },
    { id: 2, text: 'Fee receipt generated for Leo Sanders ($1,450)', time: '20 mins ago', read: false },
    { id: 3, text: 'Teacher leave request: Mr. Robert Vance (Chemistry)', time: '1 hour ago', read: true }
  ];

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
            placeholder="Search student, teacher ID..." 
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
            <span className="badge-dot"></span>
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
                {notifications.map(n => (
                  <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px', borderRadius: '8px', background: n.read ? 'transparent' : 'rgba(hsl(var(--color-primary)), 0.05)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: n.read ? 400 : 600 }}>{n.text}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                ))}
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
              <button className="nav-item" style={{ padding: '10px', fontSize: '0.85rem' }}>
                <Settings size={16} /> Settings
              </button>
              <button className="nav-item" style={{ padding: '10px', fontSize: '0.85rem', color: 'rgb(var(--color-danger-rgb))' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
