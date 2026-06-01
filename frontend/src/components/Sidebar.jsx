import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  UserCog,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  School,
  UserPlus,
  UserPlus2,
  List,
  Shield
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen, schoolDetails, isAdmin, onAdminLogout, adminView, setAdminView }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'register-student', label: 'Register Student', icon: UserPlus },
    { id: 'add-teacher', label: 'Add Teacher', icon: UserPlus2 },
    { id: 'teacher-list', label: 'Teacher List', icon: UserCheck },
    { id: 'add-staff', label: 'Add Staff', icon: UserPlus2 },
    { id: 'staff', label: 'Staff Directory', icon: UserCog },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'school', label: 'School', icon: School },
  ];

  const adminMenuItems = [
    { id: 'students', label: 'Student List', icon: Users },
    { id: 'teachers', label: 'Teacher List', icon: UserCheck },
    { id: 'staff', label: 'Staff List', icon: UserCog },
  ];

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div className="brand-icon">
            <GraduationCap size={24} />
          </div>
          <span className="brand-name">{isAdmin ? 'Admin Panel' : (schoolDetails?.name || 'Dashboard')}</span>
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
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminView(item.id);
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${adminView === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
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
            <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px' }}>
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
          {isAdmin ? 'AD' : (schoolDetails?.principal ? schoolDetails.principal.split(' ').pop().substring(0, 2).toUpperCase() : 'AD')}
        </div>
        <div className="profile-details">
          <span className="profile-name">{isAdmin ? 'Admin' : (schoolDetails?.principal || 'Alex Devlin')}</span>
          <span className="profile-role">{isAdmin ? 'Administrator' : 'Super Admin'}</span>
        </div>
      </div>
    </aside>
  );
}
