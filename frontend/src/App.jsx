import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
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
    }
    // Only inject tenant header if NOT already explicitly set by the caller
    if (!options.headers['x-tenant-id']) {
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

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [schoolDetails, setSchoolDetails] = useState({ name: 'Aether Academy', principal: 'Alex Devlin' });
  
  // Authentication states
  const [isDeveloperAdmin, setIsDeveloperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRecep, setIsRecep] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [isExpense, setIsExpense] = useState(false);

  // Active view states for sub-dashboards
  const [adminView, setAdminView] = useState('dashboard');
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

  // Restore session & path on mount
  useEffect(() => {
    fetchSchoolDetails();

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
          setAdminView('overview');
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
    initialised.current = true;
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

  const handleLoginSuccess = (role, name) => {
    sessionStorage.setItem('portal_role', role);
    switch (role) {
      case 'Developer Admin':
        setIsDeveloperAdmin(true);
        setActiveView('school');
        break;
      case 'Main Admin':
        setIsAdmin(true);
        setAdminView('overview');
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
    setIsRecep(false);
    setIsTeacher(false);
    setIsAccountant(false);
    setIsExpense(false);
    setActiveView('overview');
  };

  const handleExpenseToAdmin = () => {
    setIsAdmin(true);
    setIsExpense(false);
    setAdminView('dashboard');
  };

  const renderCurrentView = () => {
    if (isDeveloperAdmin) {
      return <SchoolProfile schoolDetails={schoolDetails} fetchSchoolDetails={fetchSchoolDetails} />;
    }

    if (isAdmin) {
      return <AdminPanel setActiveView={setActiveView} onLogout={handleLogout} adminView={adminView} setAdminView={setAdminView} />;
    }

    if (isRecep) {
      return <RecepPanel setActiveView={setActiveView} onLogout={handleLogout} recepView={recepView} setRecepView={setRecepView} />;
    }

    if (isTeacher) {
      return <TeacherPanel setActiveView={setActiveView} onLogout={handleLogout} teacherView={teacherView} setTeacherView={setTeacherView} />;
    }

    if (isAccountant) {
      return <AccountantPanel setActiveView={setActiveView} onLogout={handleLogout} accountantView={accountantView} setAccountantView={setAdminView} />;
    }

    if (isExpense) {
      return <ExpensePanel setActiveView={setActiveView} onLogout={handleLogout} expenseView={expenseView} setExpenseView={setExpenseView} onAccessAdmin={handleExpenseToAdmin} />;
    }

    switch (activeView) {
      case 'overview':
        return (
          <DashboardOverview 
            setActiveView={setActiveView} 
            onQuickAction={(action) => {
              if (action === 'add-student') setActiveView('register-student');
              else if (action === 'add-teacher') setActiveView('add-teacher');
              else if (action === 'add-staff') setActiveView('add-staff');
            }} 
          />
        );
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
        return <SchoolProfile schoolDetails={schoolDetails} fetchSchoolDetails={fetchSchoolDetails} />;
      default:
        return <DashboardOverview setActiveView={setActiveView} onQuickAction={() => {}} />;
    }
  };

  const isLoggedIn = isDeveloperAdmin || isAdmin || isRecep || isTeacher || isAccountant || isExpense;

  if (!isLoggedIn) {
    return (
      <SchoolLogin 
        tenantSubdomain={getActiveTenant()} 
        onLoginSuccess={handleLoginSuccess} 
      />
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
