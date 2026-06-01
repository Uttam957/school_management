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
  Shield,
  ClipboardCheck
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen, schoolDetails, isAdmin, onAdminLogout, adminView, setAdminView, isRecep, onRecepLogout, recepView, setRecepView, isTeacher, onTeacherLogout, teacherView, setTeacherView }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teacher-list', label: 'Teacher List', icon: UserCheck },
    { id: 'staff', label: 'Staff Directory', icon: UserCog },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'school', label: 'School', icon: School },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Admin Panel', icon: LayoutDashboard },
    { id: 'overview', label: 'Main Dashboard', icon: List },
    { id: 'students', label: 'Student List', icon: Users },
    { id: 'teachers', label: 'Teacher List', icon: UserCheck },
    { id: 'staff', label: 'Staff List', icon: UserCog },
  ];

  const recepMenuItems = [
    { id: 'dashboard', label: 'Receptionist Panel', icon: LayoutDashboard },
    { id: 'overview', label: 'Main Dashboard', icon: List },
    { id: 'register-student', label: 'Register Student', icon: UserPlus },
    { id: 'students', label: 'All Students', icon: Users },
    { id: 'add-teacher', label: 'Add Teacher', icon: UserPlus2 },
    { id: 'teachers', label: 'All Teachers', icon: UserCheck },
    { id: 'add-staff', label: 'Add Staff', icon: UserPlus2 },
    { id: 'staff', label: 'All Staff', icon: UserCog },
  ];

  const teacherMenuItems = [
    { id: 'dashboard', label: 'Teacher Panel', icon: LayoutDashboard },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: ClipboardCheck },
    { id: 'attendance-history', label: 'Attendance History', icon: List },
    { id: 'student-reports', label: 'Student Reports', icon: Users },
    { id: 'class-reports', label: 'Class Reports', icon: UserCheck },
    { id: 'monthly-calendar', label: 'Monthly Calendar', icon: School },
  ];

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div className="brand-icon">
            <GraduationCap size={24} />
          </div>
          <span className="brand-name">{isAdmin ? 'Admin Panel' : (isRecep ? 'Recep Panel' : (schoolDetails?.name || 'Dashboard'))}</span>
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
        ) : isTeacher ? (
          <>
            {teacherMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTeacherView(item.id);
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${teacherView === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
            <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px' }}>
              <button
                onClick={() => {
                  onTeacherLogout();
                  setMobileOpen(false);
                }}
                className="nav-item"
                style={{ color: 'rgb(var(--color-danger-rgb))' }}
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="nav-label">Teacher Logout</span>
              </button>
            </div>
          </>
        ) : isRecep ? (
          <>
            {recepMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setRecepView(item.id);
                    setMobileOpen(false);
                  }}
                  className={`nav-item ${recepView === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
            <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px' }}>
              <button
                onClick={() => {
                  onRecepLogout();
                  setMobileOpen(false);
                }}
                className="nav-item"
                style={{ color: 'rgb(var(--color-danger-rgb))' }}
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="nav-label">Recep Logout</span>
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
            <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '8px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => {
                  setActiveView('recep-login');
                  setMobileOpen(false);
                }}
                className={`nav-item ${activeView === 'recep-login' ? 'active' : ''}`}
              >
                <UserCog size={20} className="flex-shrink-0" />
                <span className="nav-label">Receptionist Login</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveView('teacher-login');
                  setMobileOpen(false);
                }}
                className={`nav-item ${activeView === 'teacher-login' ? 'active' : ''}`}
              >
                <UserCheck size={20} className="flex-shrink-0" />
                <span className="nav-label">Teacher Login</span>
              </button>
              
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
          {isAdmin ? 'AD' : (isRecep ? 'RE' : (isTeacher ? 'TE' : (schoolDetails?.principal ? schoolDetails.principal.split(' ').pop().substring(0, 2).toUpperCase() : 'AD')))}
        </div>
        <div className="profile-details">
          <span className="profile-name">{isAdmin ? 'Admin' : (isRecep ? 'Receptionist' : (isTeacher ? 'Teacher' : (schoolDetails?.principal || 'Alex Devlin')))}</span>
          <span className="profile-role">{isAdmin ? 'Administrator' : (isRecep ? 'Subadmin' : (isTeacher ? 'Faculty' : 'Super Admin'))}</span>
        </div>
      </div>
    </aside>
  );
}
