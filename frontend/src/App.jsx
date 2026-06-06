import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StudentDirectory from './pages/StudentDirectory';
import AddTeacher from './pages/AddTeacher';
import TeacherList from './pages/TeacherList';
import AddStaff from './pages/AddStaff';
import StaffDirectory from './pages/StaffDirectory';
import FinancePortal from './pages/FinancePortal';
import SchoolProfile from './pages/SchoolProfile';
import RegisterStudent from './pages/RegisterStudent';
import AdminPanel from './pages/AdminPanel';
import RecepPanel from './pages/RecepPanel';
import TeacherPanel from './pages/TeacherPanel';
import AccountantPanel from './pages/AccountantPanel';
import ExpensePanel from './pages/ExpensePanel';
import SchoolLogin from './pages/SchoolLogin';
import AdminLogin from './pages/AdminLogin';
import AccountantLogin from './pages/AccountantLogin';
import RecepLogin from './pages/RecepLogin';
import TeacherLogin from './pages/TeacherLogin';
import ExpenseLogin from './pages/ExpenseLogin';

import './App.css';

// Global Fetch Interceptor for Tenant ID & Auth Token
const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  let targetUrl = typeof url === 'string' ? url : (url.url || '');
  if (targetUrl.startsWith('/') || targetUrl.includes('/api/')) {
    options.headers = options.headers || {};
    // Skip tenant header for platform-level API calls
    if (targetUrl.startsWith('/api/platform/')) {
      delete options.headers['x-tenant-id'];
    } else if (!options.headers['x-tenant-id']) {
      const host = window.location.hostname;
      const parts = host.split('.');
      let tenant = null;
      if (parts.length > 2 || (parts.length === 2 && !parts[1].startsWith('localhost'))) {
        tenant = parts[0];
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        tenant = urlParams.get('tenant') || localStorage.getItem('tenant_subdomain');
      }
      if (tenant && tenant !== 'www' && tenant !== 'platform') {
        options.headers['x-tenant-id'] = tenant;
      }
    }
    const token = sessionStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return originalFetch(url, options);
};

const getInitialAuthState = (targetRole) => {
  const path = window.location.pathname;
  if (path.startsWith('/receptionist') && targetRole === 'Receptionist') return true;
  if (path.startsWith('/teacher') && targetRole === 'Teacher') return true;
  if (path.startsWith('/expense') && targetRole === 'Expense') return true;
  if ((path.startsWith('/accountant') || path.startsWith('/finance')) && targetRole === 'Accountant') return true;
  if (path.startsWith('/admin') && targetRole === 'Admin') return true;
  if (path.startsWith('/school') && targetRole === 'Developer') return true;
  
  const savedRole = sessionStorage.getItem('role') || sessionStorage.getItem('portal_role');
  if (!savedRole) return false;
  
  if (savedRole === 'Developer Admin' && targetRole === 'Developer') return true;
  if (savedRole === 'Admin Dashboard' && targetRole === 'Admin') return true;
  if ((savedRole === 'Main Admin' || savedRole === 'admin') && targetRole === 'Admin') return true;
  if ((savedRole === 'Receptionist' || savedRole === 'recep') && targetRole === 'Receptionist') return true;
  if ((savedRole === 'Teacher' || savedRole === 'teacher') && targetRole === 'Teacher') return true;
  if ((savedRole === 'Finance Manager' || savedRole === 'accountant') && targetRole === 'Accountant') return true;
  if ((savedRole === 'Expense Manager' || savedRole === 'expense') && targetRole === 'Expense') return true;
  
  return false;
};

export default function App() {
  const [activeView, setActiveViewState] = useState('students');
  const [activeSubadminLogin, setActiveSubadminLogin] = useState(null);

  const setActiveView = (view) => {
    if (view === 'admin-login') {
      setActiveSubadminLogin('admin');
    } else if (view === 'accountant-login') {
      setActiveSubadminLogin('accountant');
    } else if (view === 'recep-login') {
      setActiveSubadminLogin('recep');
    } else if (view === 'teacher-login') {
      setActiveSubadminLogin('teacher');
    } else if (view === 'expense-login') {
      setActiveSubadminLogin('expense');
    } else {
      setActiveViewState(view);
    }
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [schoolDetails, setSchoolDetails] = useState({ name: 'Aether Academy', principal: 'Alex Devlin' });
  
  // Authentication states
  const [isDeveloperAdmin, setIsDeveloperAdmin] = useState(() => getInitialAuthState('Developer'));
  const [isAdmin, setIsAdmin] = useState(() => getInitialAuthState('Admin'));
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(() => getInitialAuthState('SchoolAdmin'));
  const [isRecep, setIsRecep] = useState(() => getInitialAuthState('Receptionist'));
  const [isTeacher, setIsTeacher] = useState(() => getInitialAuthState('Teacher'));
  const [isAccountant, setIsAccountant] = useState(() => getInitialAuthState('Accountant'));
  const [isExpense, setIsExpense] = useState(() => getInitialAuthState('Expense'));

  // Active view states for sub-dashboards
  const [adminView, setAdminView] = useState('students');
  const [recepView, setRecepView] = useState('dashboard');
  const [teacherView, setTeacherView] = useState('dashboard');
  const [accountantView, setAccountantView] = useState('dashboard');
  const [expenseView, setExpenseView] = useState('dashboard');

  const initialised = useRef(false);

  const getActiveTenant = () => {
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length > 2 || (parts.length === 2 && !parts[1].startsWith('localhost'))) {
      return parts[0];
    }
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tenant') || localStorage.getItem('tenant_subdomain') || null;
  };

  const fetchSchoolDetails = async () => {
    try {
      const tenant = getActiveTenant();
      if (!tenant) {
        setSchoolDetails({ name: 'School ERP Platform', principal: 'Master Admin' });
        return;
      }
      const res = await fetch('/api/school');
      if (res.ok) {
        const data = await res.json();
        setSchoolDetails(data);
      }
    } catch (err) {
      console.error('Error loading school details:', err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 900) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const checkRoutePath = () => {
    const path = window.location.pathname;
    if (path.startsWith('/receptionist')) {
      setIsRecep(true);
      setRecepView('overview');
      return true;
    } else if (path.startsWith('/teacher')) {
      setIsTeacher(true);
      setTeacherView('dashboard');
      return true;
    } else if (path.startsWith('/expense')) {
      setIsExpense(true);
      setExpenseView('dashboard');
      return true;
    } else if (path.startsWith('/accountant') || path.startsWith('/finance')) {
      setIsAccountant(true);
      setAccountantView('dashboard');
      return true;
    }
    return false;
  };

  // Restore session & path on mount
  useEffect(() => {
    fetchSchoolDetails();

    const pathMatched = checkRoutePath();
    if (!pathMatched) {
      const savedRole = sessionStorage.getItem('role') || sessionStorage.getItem('portal_role');
      if (savedRole) {
        switch (savedRole) {
          case 'Developer Admin':
            setIsDeveloperAdmin(true);
            setActiveView('school');
            break;
          case 'Main Admin':
          case 'admin':
            setIsAdmin(true);
            setIsSchoolAdmin(false);
            setAdminView('students');
            break;
          case 'Admin Dashboard':
            setIsAdmin(true);
            setIsSchoolAdmin(false);
            setAdminView('students');
            break;
          case 'Receptionist':
          case 'recep':
            setIsRecep(true);
            setRecepView('overview');
            break;
          case 'Teacher':
          case 'teacher':
            setIsTeacher(true);
            setTeacherView('dashboard');
            break;
          case 'Finance Manager':
          case 'accountant':
            setIsAccountant(true);
            setAccountantView('dashboard');
            break;
          case 'Expense Manager':
          case 'expense':
            setIsExpense(true);
            setExpenseView('dashboard');
            break;
          default:
            break;
        }
      }
    }
    initialised.current = true;
  }, []);

  // Listen for browser forward/back buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setIsDeveloperAdmin(false);
      setIsAdmin(false);
      setIsSchoolAdmin(false);
      setIsRecep(false);
      setIsTeacher(false);
      setIsAccountant(false);
      setIsExpense(false);

      const pathMatched = checkRoutePath();
      if (!pathMatched) {
        const savedRole = sessionStorage.getItem('role') || sessionStorage.getItem('portal_role');
        if (savedRole) {
          switch (savedRole) {
            case 'Developer Admin':
              setIsDeveloperAdmin(true);
              setActiveView('school');
              break;
            case 'Main Admin':
            case 'admin':
              setIsAdmin(true);
              setIsSchoolAdmin(false);
              setAdminView('students');
              break;
            case 'Admin Dashboard':
              setIsAdmin(true);
              setIsSchoolAdmin(false);
              setAdminView('students');
              break;
            case 'Receptionist':
            case 'recep':
              setIsRecep(true);
              setRecepView('overview');
              break;
            case 'Teacher':
            case 'teacher':
              setIsTeacher(true);
              setTeacherView('dashboard');
              break;
            case 'Finance Manager':
            case 'accountant':
              setIsAccountant(true);
              setAccountantView('dashboard');
              break;
            case 'Expense Manager':
            case 'expense':
              setIsExpense(true);
              setExpenseView('dashboard');
              break;
            default:
              setActiveView('students');
              break;
          }
        } else {
          setActiveView('students');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update window address dynamically for routing appearance
  useEffect(() => {
    if (!initialised.current) return;
    
    const tenant = getActiveTenant();
    const query = tenant ? `?tenant=${tenant}` : '';

    if (isDeveloperAdmin) {
      window.history.pushState(null, '', `/school${query}`);
    } else if (isAdmin) {
      window.history.pushState(null, '', `/admin${query}`);
    } else if (isRecep) {
      window.history.pushState(null, '', `/receptionist${query}`);
    } else if (isAccountant) {
      window.history.pushState(null, '', `/accountant${query}`);
    } else if (isExpense) {
      window.history.pushState(null, '', `/expense${query}`);
    } else if (isTeacher) {
      window.history.pushState(null, '', `/teacher${query}`);
    } else {
      window.history.pushState(null, '', `/${activeView}${query}`);
    }
  }, [activeView, isDeveloperAdmin, isAdmin, isRecep, isAccountant, isExpense, isTeacher]);

  // URL Auto-login Hook
  useEffect(() => {
    const autoLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const usernameParam = urlParams.get('username');
      const passwordParam = urlParams.get('password');
      const tenantParam = urlParams.get('tenant');
      const fromDevAdminParam = urlParams.get('from_dev_admin');

      if (fromDevAdminParam === 'true') {
        sessionStorage.setItem('from_dev_admin', 'true');
      }

      if (usernameParam && passwordParam && tenantParam) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-tenant-id': tenantParam
            },
            body: JSON.stringify({ username: usernameParam, password: passwordParam, role: 'Auto' })
          });

          if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('role', data.role);
            sessionStorage.setItem('username', data.username);
            sessionStorage.setItem('name', data.name);
            if (data.school) {
              sessionStorage.setItem('school_name', data.school.name);
              sessionStorage.setItem('school_subdomain', data.school.subdomain);
              localStorage.setItem('tenant_subdomain', data.school.subdomain);
            }

            // Remove username/password query params but keep the tenant
            const cleanUrl = window.location.pathname + `?tenant=${tenantParam}`;
            window.history.replaceState(null, '', cleanUrl);

            handleLoginSuccess(data.role, data.name);
          }
        } catch (err) {
          console.error('URL auto-login exception:', err);
        }
      }
    };
    autoLogin();
  }, []);

  const handleLoginSuccess = (role, name) => {
    sessionStorage.setItem('portal_role', role);
    switch (role) {
      case 'Developer Admin':
        setIsDeveloperAdmin(true);
        setActiveView('school');
        break;
      case 'Main Admin':
        setIsAdmin(true);
        setIsSchoolAdmin(false);
        setAdminView('students');
        break;
      case 'Admin Dashboard':
        setIsAdmin(true);
        setIsSchoolAdmin(false);
        setAdminView('students');
        break;
      case 'Teacher':
        setIsTeacher(true);
        setTeacherView('dashboard');
        break;
      case 'Finance Manager':
        setIsAccountant(true);
        setAccountantView('dashboard');
        break;
      case 'Expense Manager':
        setIsExpense(true);
        setExpenseView('dashboard');
        break;
      case 'Receptionist':
        setIsRecep(true);
        setRecepView('overview');
        break;
      default:
        break;
    }
    fetchSchoolDetails();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('tenant_subdomain');
    setIsDeveloperAdmin(false);
    setIsAdmin(false);
    setIsSchoolAdmin(false);
    setIsRecep(false);
    setIsTeacher(false);
    setIsAccountant(false);
    setIsExpense(false);
    setActiveView('students');
    
    // Clear path on logout
    const tenant = getActiveTenant();
    const query = tenant ? `?tenant=${tenant}` : '';
    window.history.pushState(null, '', `/${query}`);
  };

  const handleExpenseToAdmin = () => {
    setIsAdmin(true);
    setIsExpense(false);
    setAdminView('dashboard');
  };

  const handleBackToMain = () => {
    setIsAdmin(false);
    setIsRecep(false);
    setIsTeacher(false);
    setIsAccountant(false);
    setIsExpense(false);
    setIsSchoolAdmin(true);
    setActiveViewState('students');
    sessionStorage.setItem('role', 'Main Admin');
    sessionStorage.setItem('portal_role', 'Main Admin');

    const tenant = getActiveTenant();
    const query = tenant ? `?tenant=${tenant}` : '';
    window.history.pushState(null, '', `/students${query}`);
  };

  const renderCurrentView = () => {
    if (isDeveloperAdmin) {
      return <SchoolProfile schoolDetails={schoolDetails} fetchSchoolDetails={fetchSchoolDetails} isDeveloperAdmin={isDeveloperAdmin} />;
    }

    if (isAdmin) {
      return <AdminPanel setActiveView={setActiveView} onLogout={handleLogout} adminView={adminView} setAdminView={setAdminView} onBackToMain={handleBackToMain} />;
    }

    if (isRecep) {
      return <RecepPanel setActiveView={setActiveView} onLogout={handleLogout} recepView={recepView} setRecepView={setRecepView} onBackToMain={handleBackToMain} />;
    }

    if (isTeacher) {
      return <TeacherPanel setActiveView={setActiveView} onLogout={handleLogout} teacherView={teacherView} setTeacherView={setTeacherView} onBackToMain={handleBackToMain} />;
    }

    if (isAccountant) {
      return <AccountantPanel setActiveView={setActiveView} onLogout={handleLogout} accountantView={accountantView} setAccountantView={setAdminView} onBackToMain={handleBackToMain} />;
    }

    if (isExpense) {
      return <ExpensePanel setActiveView={setActiveView} onLogout={handleLogout} expenseView={expenseView} setExpenseView={setExpenseView} onAccessAdmin={handleExpenseToAdmin} onBackToMain={handleBackToMain} />;
    }

    switch (activeView) {
      case 'students':
        return <StudentDirectory readOnly={true} onAddClick={() => setActiveView('register-student')} />;
      case 'register-student':
        return <RegisterStudent setActiveView={setActiveView} />;
      case 'add-teacher':
        return <AddTeacher setActiveView={setActiveView} />;
      case 'teacher-list':
        return <TeacherList setActiveView={setActiveView} readOnly={true} onAddClick={() => setActiveView('add-teacher')} />;
      case 'add-staff':
        return <AddStaff setActiveView={setActiveView} />;
      case 'staff':
        return <StaffDirectory readOnly={true} onAddClick={() => setActiveView('add-staff')} />;
      case 'finance':
        return <FinancePortal />;
      case 'school':
        return <SchoolProfile schoolDetails={schoolDetails} fetchSchoolDetails={fetchSchoolDetails} isDeveloperAdmin={isDeveloperAdmin} />;
      case 'admin-login':
        return (
          <AdminLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Admin Dashboard');
              sessionStorage.setItem('portal_role', 'Admin Dashboard');
              setIsAdmin(true);
              setIsSchoolAdmin(false);
              setAdminView('students');
            }} 
            onCancel={() => setActiveView('students')} 
          />
        );
      case 'accountant-login':
        return (
          <AccountantLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Finance Manager');
              sessionStorage.setItem('portal_role', 'Finance Manager');
              setIsAccountant(true);
              setAccountantView('dashboard');
            }} 
            onCancel={() => setActiveView('students')} 
          />
        );
      case 'recep-login':
        return (
          <RecepLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Receptionist');
              sessionStorage.setItem('portal_role', 'Receptionist');
              setIsRecep(true);
              setRecepView('overview');
            }} 
            onCancel={() => setActiveView('students')} 
          />
        );
      case 'teacher-login':
        return (
          <TeacherLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Teacher');
              sessionStorage.setItem('portal_role', 'Teacher');
              setIsTeacher(true);
              setTeacherView('dashboard');
            }} 
            onCancel={() => setActiveView('students')} 
          />
        );
      case 'expense-login':
        return (
          <ExpenseLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Expense Manager');
              sessionStorage.setItem('portal_role', 'Expense Manager');
              setIsExpense(true);
              setExpenseView('dashboard');
            }} 
            onCancel={() => setActiveView('students')} 
          />
        );
      default:
        return <StudentDirectory readOnly={true} onAddClick={() => setActiveView('register-student')} />;
    }
  };

  const isLoggedIn = isDeveloperAdmin || isAdmin || isRecep || isTeacher || isAccountant || isExpense || isSchoolAdmin;

  if (!isLoggedIn) {
    const host = window.location.hostname;
    const parts = host.split('.');
    let loginTenant = null;
    if (parts.length > 2 || (parts.length === 2 && !parts[1].startsWith('localhost'))) {
      loginTenant = parts[0];
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      loginTenant = urlParams.get('tenant') || null;
    }

    if (!loginTenant) {
      localStorage.removeItem('tenant_subdomain');
    }

    return (
      <SchoolLogin 
        tenantSubdomain={loginTenant} 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  if (activeSubadminLogin) {
    const loginBgs = {
      admin: 'linear-gradient(135deg, hsl(250, 100%, 97%) 0%, hsl(320, 100%, 97%) 100%)',
      accountant: 'linear-gradient(135deg, hsl(150, 100%, 96%) 0%, hsl(160, 100%, 97%) 100%)',
      recep: 'linear-gradient(135deg, hsl(150, 100%, 97%) 0%, hsl(195, 100%, 97%) 100%)',
      teacher: 'linear-gradient(135deg, hsl(320, 100%, 97%) 0%, hsl(250, 100%, 97%) 100%)',
      expense: 'linear-gradient(135deg, hsl(0, 100%, 97%) 0%, hsl(35, 100%, 97%) 100%)'
    };

    return (
      <div data-theme="light" style={{
        width: '100vw',
        minHeight: '100vh',
        background: loginBgs[activeSubadminLogin] || '#ffffff',
        display: 'grid',
        placeItems: 'center',
        padding: '40px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        {activeSubadminLogin === 'admin' && (
          <AdminLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Admin Dashboard');
              sessionStorage.setItem('portal_role', 'Admin Dashboard');
              setIsAdmin(true);
              setIsSchoolAdmin(false);
              setAdminView('dashboard');
              setActiveSubadminLogin(null);
            }} 
            onCancel={() => setActiveSubadminLogin(null)} 
          />
        )}
        {activeSubadminLogin === 'accountant' && (
          <AccountantLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Finance Manager');
              sessionStorage.setItem('portal_role', 'Finance Manager');
              setIsAccountant(true);
              setAccountantView('dashboard');
              setActiveSubadminLogin(null);
            }} 
            onCancel={() => setActiveSubadminLogin(null)} 
          />
        )}
        {activeSubadminLogin === 'recep' && (
          <RecepLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Receptionist');
              sessionStorage.setItem('portal_role', 'Receptionist');
              setIsRecep(true);
              setRecepView('overview');
              setActiveSubadminLogin(null);
            }} 
            onCancel={() => setActiveSubadminLogin(null)} 
          />
        )}
        {activeSubadminLogin === 'teacher' && (
          <TeacherLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Teacher');
              sessionStorage.setItem('portal_role', 'Teacher');
              setIsTeacher(true);
              setTeacherView('dashboard');
              setActiveSubadminLogin(null);
            }} 
            onCancel={() => setActiveSubadminLogin(null)} 
          />
        )}
        {activeSubadminLogin === 'expense' && (
          <ExpenseLogin 
            onLogin={() => {
              sessionStorage.setItem('role', 'Expense Manager');
              sessionStorage.setItem('portal_role', 'Expense Manager');
              setIsExpense(true);
              setExpenseView('dashboard');
              setActiveSubadminLogin(null);
            }} 
            onCancel={() => setActiveSubadminLogin(null)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        schoolDetails={schoolDetails}
        isAdmin={isAdmin}
        onAdminLogout={handleLogout}
        adminView={adminView}
        setAdminView={setAdminView}
        isRecep={isRecep}
        onRecepLogout={handleLogout}
        recepView={recepView}
        setRecepView={setRecepView}
        isTeacher={isTeacher}
        onTeacherLogout={handleLogout}
        teacherView={teacherView}
        setTeacherView={setTeacherView}
        isAccountant={isAccountant}
        onAccountantLogout={handleLogout}
        accountantView={accountantView}
        setAccountantView={setAccountantView}
        isExpense={isExpense}
        onExpenseLogout={handleLogout}
        expenseView={expenseView}
        setExpenseView={setExpenseView}
        onAccessAdmin={handleExpenseToAdmin}
        isDeveloperAdmin={isDeveloperAdmin}
        onDeveloperAdminLogout={handleLogout}
        onBackToMain={handleBackToMain}
      />

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
        />
      )}

      <div className="app-content">
        <Header
          activeView={activeView}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          theme={theme}
          setTheme={setTheme}
          schoolDetails={schoolDetails}
          isAdmin={isAdmin}
          isAccountant={isAccountant}
          isRecep={isRecep}
          isTeacher={isTeacher}
          isExpense={isExpense}
          isDeveloperAdmin={isDeveloperAdmin}
          setActiveView={setActiveView}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1, marginTop: '10px' }}>
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
