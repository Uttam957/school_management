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
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import RecepLogin from './pages/RecepLogin';
import RecepPanel from './pages/RecepPanel';
import TeacherLogin from './pages/TeacherLogin';
import TeacherPanel from './pages/TeacherPanel';
import AccountantLogin from './pages/AccountantLogin';
import AccountantPanel from './pages/AccountantPanel';
import ExpenseLogin from './pages/ExpenseLogin';
import ExpensePanel from './pages/ExpensePanel';


import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [schoolDetails, setSchoolDetails] = useState({ name: 'Aether Academy', principal: 'Alex Devlin' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminView, setAdminView] = useState('dashboard');
  const [isRecep, setIsRecep] = useState(false);
  const [showRecepLogin, setShowRecepLogin] = useState(false);
  const [recepView, setRecepView] = useState('dashboard');
  const [isTeacher, setIsTeacher] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);
  const [teacherView, setTeacherView] = useState('dashboard');
  const [isAccountant, setIsAccountant] = useState(false);
  const [showAccountantLogin, setShowAccountantLogin] = useState(false);
  const [accountantView, setAccountantView] = useState('dashboard');
  const [isExpense, setIsExpense] = useState(false);
  const [showExpenseLogin, setShowExpenseLogin] = useState(false);
  const [expenseView, setExpenseView] = useState('dashboard');
  const initialised = useRef(false);

  const saveSession = (role) => {
    sessionStorage.setItem('portal_role', role);
  };

  const clearSession = () => {
    sessionStorage.removeItem('portal_role');
  };

  const fetchSchoolDetails = async () => {
    try {
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

  useEffect(() => {
    fetchSchoolDetails();
    const path = window.location.pathname;
    if (path === '/admin/login') {
      setShowAdminLogin(true);
    } else if (path === '/receptionist/login') {
      setShowRecepLogin(true);
    } else if (path === '/teacher/login') {
      setShowTeacherLogin(true);
    } else if (path === '/accountant/login') {
      setShowAccountantLogin(true);
    } else if (path === '/expense/login') {
      setShowExpenseLogin(true);
    } else if (path === '/register-student') setActiveView('register-student');
    else if (path === '/add-teacher') setActiveView('add-teacher');
    else if (path === '/add-staff') setActiveView('add-staff');
    else if (path === '/teacher-list') setActiveView('teacher-list');

    const savedRole = sessionStorage.getItem('portal_role');
    if (savedRole) {
      switch (savedRole) {
        case 'admin': setIsAdmin(true); setAdminView('overview'); break;
        case 'recep': setIsRecep(true); setRecepView('overview'); break;
        case 'teacher': setIsTeacher(true); setTeacherView('dashboard'); break;
        case 'accountant': setIsAccountant(true); setAccountantView('dashboard'); break;
        case 'expense': setIsExpense(true); setExpenseView('dashboard'); break;
      }
    }
    initialised.current = true;
  }, []);

  useEffect(() => {
    if (showAdminLogin) {
      window.history.pushState(null, '', '/admin/login');
    } else if (showRecepLogin) {
      window.history.pushState(null, '', '/receptionist/login');
    } else if (showTeacherLogin) {
      window.history.pushState(null, '', '/teacher/login');
    } else if (showAccountantLogin) {
      window.history.pushState(null, '', '/accountant/login');
    } else if (showExpenseLogin) {
      window.history.pushState(null, '', '/expense/login');
    } else if (isAdmin) {
      window.history.pushState(null, '', '/admin');
    } else if (isRecep) {
      window.history.pushState(null, '', '/receptionist');
    } else if (isAccountant) {
      window.history.pushState(null, '', '/accountant');
    } else if (isExpense) {
      window.history.pushState(null, '', '/expense');
    } else if (isTeacher) {
      window.history.pushState(null, '', '/teacher');
    } else if (activeView === 'register-student') {
      window.history.pushState(null, '', '/register-student');
    } else if (activeView === 'add-staff') {
      window.history.pushState(null, '', '/add-staff');
    } else if (activeView === 'overview') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `/${activeView}`);
    }
  }, [activeView, showAdminLogin, isAdmin, showRecepLogin, isRecep, showAccountantLogin, isAccountant, showExpenseLogin, isExpense]);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
    setIsRecep(false);
    setShowRecepLogin(false);
    setIsTeacher(false);
    setShowTeacherLogin(false);
    setAdminView('overview');
    saveSession('admin');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminView('overview');
    setActiveView('overview');
    clearSession();
  };

  const handleRecepLogin = () => {
    setIsRecep(true);
    setShowRecepLogin(false);
    setIsAdmin(false);
    setShowAdminLogin(false);
    setIsTeacher(false);
    setShowTeacherLogin(false);
    setRecepView('overview');
    saveSession('recep');
  };

  const handleRecepLogout = () => {
    setIsRecep(false);
    setRecepView('overview');
    setActiveView('overview');
    clearSession();
  };

  const handleTeacherLogin = () => {
    setIsTeacher(true);
    setShowTeacherLogin(false);
    setIsAdmin(false);
    setShowAdminLogin(false);
    setIsRecep(false);
    setShowRecepLogin(false);
    setTeacherView('dashboard');
    saveSession('teacher');
  };

  const handleTeacherLogout = () => {
    setIsTeacher(false);
    setTeacherView('dashboard');
    setActiveView('overview');
    clearSession();
  };

  const handleAccountantLogin = () => {
    setIsAccountant(true);
    setShowAccountantLogin(false);
    setIsAdmin(false);
    setShowAdminLogin(false);
    setIsRecep(false);
    setShowRecepLogin(false);
    setIsTeacher(false);
    setShowTeacherLogin(false);
    setIsExpense(false);
    setShowExpenseLogin(false);
    setAccountantView('dashboard');
    saveSession('accountant');
  };

  const handleAccountantLogout = () => {
    setIsAccountant(false);
    setAccountantView('dashboard');
    setActiveView('overview');
    clearSession();
  };

  const handleExpenseLogin = () => {
    setIsExpense(true);
    setShowExpenseLogin(false);
    setIsAdmin(false);
    setShowAdminLogin(false);
    setIsRecep(false);
    setShowRecepLogin(false);
    setIsTeacher(false);
    setShowTeacherLogin(false);
    setIsAccountant(false);
    setShowAccountantLogin(false);
    setExpenseView('dashboard');
    saveSession('expense');
  };

  const handleExpenseLogout = () => {
    setIsExpense(false);
    setExpenseView('dashboard');
    setActiveView('overview');
    clearSession();
  };

  const handleExpenseToAdmin = () => {
    setIsAdmin(true);
    setIsExpense(false);
    setAdminView('dashboard');
  };

  const renderCurrentView = () => {
    if (showAdminLogin) {
      return <AdminLogin onLogin={handleAdminLogin} onCancel={() => { setShowAdminLogin(false); setActiveView('overview'); }} />;
    }

    if (showRecepLogin) {
      return <RecepLogin onLogin={handleRecepLogin} onCancel={() => { setShowRecepLogin(false); setActiveView('overview'); }} />;
    }

    if (isAdmin) {
      return <AdminPanel setActiveView={setActiveView} onLogout={handleAdminLogout} adminView={adminView} setAdminView={setAdminView} />;
    }

    if (isRecep) {
      return <RecepPanel setActiveView={setActiveView} onLogout={handleRecepLogout} recepView={recepView} setRecepView={setRecepView} />;
    }

    if (showTeacherLogin) {
      return <TeacherLogin onLogin={handleTeacherLogin} onCancel={() => { setShowTeacherLogin(false); setActiveView('overview'); }} />;
    }

    if (showAccountantLogin) {
      return <AccountantLogin onLogin={handleAccountantLogin} onCancel={() => { setShowAccountantLogin(false); setActiveView('overview'); }} />;
    }

    if (showExpenseLogin) {
      return <ExpenseLogin onLogin={handleExpenseLogin} onCancel={() => { setShowExpenseLogin(false); setActiveView('overview'); }} />;
    }

    if (isTeacher) {
      return <TeacherPanel setActiveView={setActiveView} onLogout={handleTeacherLogout} teacherView={teacherView} setTeacherView={setTeacherView} />;
    }

    if (isAccountant) {
      return <AccountantPanel setActiveView={setActiveView} onLogout={handleAccountantLogout} accountantView={accountantView} setAccountantView={setAccountantView} />;
    }

    if (isExpense) {
      return <ExpensePanel setActiveView={setActiveView} onLogout={handleExpenseLogout} expenseView={expenseView} setExpenseView={setExpenseView} onAccessAdmin={handleExpenseToAdmin} />;
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
              else if (action === 'collect-fee') {
                setShowAccountantLogin(true);
              } else if (action === 'add-expense') {
                setShowExpenseLogin(true);
              } else if (action === 'mark-attendance') {
                setShowTeacherLogin(true);
              }
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
        return (
          <DashboardOverview 
            setActiveView={setActiveView} 
            onQuickAction={(action) => {
              if (action === 'add-student') setActiveView('register-student');
              else if (action === 'add-teacher') setActiveView('add-teacher');
              else if (action === 'add-staff') setActiveView('add-staff');
              else if (action === 'collect-fee') {
                setShowAccountantLogin(true);
              } else if (action === 'add-expense') {
                setShowExpenseLogin(true);
              } else if (action === 'mark-attendance') {
                setShowTeacherLogin(true);
              }
            }} 
          />
        );
    }
  };

  const showSidebar = !showAdminLogin && !showRecepLogin && !showTeacherLogin && !showAccountantLogin && !showExpenseLogin;

  return (
    <div className="app-container">
      {showSidebar && (
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            if (view === 'admin-login') {
              setShowAdminLogin(true);
              setShowRecepLogin(false);
              setShowTeacherLogin(false);
              setShowAccountantLogin(false);
              setShowExpenseLogin(false);
            } else if (view === 'recep-login') {
              setShowRecepLogin(true);
              setShowAdminLogin(false);
              setShowTeacherLogin(false);
              setShowAccountantLogin(false);
              setShowExpenseLogin(false);
            } else if (view === 'teacher-login') {
              setShowTeacherLogin(true);
              setShowAdminLogin(false);
              setShowRecepLogin(false);
              setShowAccountantLogin(false);
              setShowExpenseLogin(false);
            } else if (view === 'accountant-login') {
              setShowAccountantLogin(true);
              setShowAdminLogin(false);
              setShowRecepLogin(false);
              setShowTeacherLogin(false);
              setShowExpenseLogin(false);
            } else if (view === 'expense-login') {
              setShowExpenseLogin(true);
              setShowAdminLogin(false);
              setShowRecepLogin(false);
              setShowTeacherLogin(false);
              setShowAccountantLogin(false);
            } else {
              setActiveView(view);
            }
          }}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          schoolDetails={schoolDetails}
          isAdmin={isAdmin}
          onAdminLogout={handleAdminLogout}
          adminView={adminView}
          setAdminView={setAdminView}
          isRecep={isRecep}
          onRecepLogout={handleRecepLogout}
          recepView={recepView}
          setRecepView={setRecepView}
          isTeacher={isTeacher}
          onTeacherLogout={handleTeacherLogout}
          teacherView={teacherView}
          setTeacherView={setTeacherView}
          isAccountant={isAccountant}
          onAccountantLogout={handleAccountantLogout}
          accountantView={accountantView}
          setAccountantView={setAccountantView}
          isExpense={isExpense}
          onExpenseLogout={handleExpenseLogout}
          expenseView={expenseView}
          setExpenseView={setExpenseView}
          onAccessAdmin={handleExpenseToAdmin}
        />
      )}

      {mobileOpen && showSidebar && (
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

      <div className="app-content" style={(showAdminLogin || showRecepLogin || showTeacherLogin || showAccountantLogin || showExpenseLogin) ? { padding: 0 } : {}}>
        {!showAdminLogin && !showRecepLogin && !showTeacherLogin && !showAccountantLogin && !showExpenseLogin && (
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
            setActiveView={(view) => {
              if (view === 'admin-login') {
                setShowAdminLogin(true);
                setShowRecepLogin(false);
                setShowTeacherLogin(false);
                setShowAccountantLogin(false);
                setShowExpenseLogin(false);
              } else if (view === 'recep-login') {
                setShowRecepLogin(true);
                setShowAdminLogin(false);
                setShowTeacherLogin(false);
                setShowAccountantLogin(false);
                setShowExpenseLogin(false);
              } else if (view === 'teacher-login') {
                setShowTeacherLogin(true);
                setShowAdminLogin(false);
                setShowRecepLogin(false);
                setShowAccountantLogin(false);
                setShowExpenseLogin(false);
              } else if (view === 'accountant-login') {
                setShowAccountantLogin(true);
                setShowAdminLogin(false);
                setShowRecepLogin(false);
                setShowTeacherLogin(false);
                setShowExpenseLogin(false);
              } else if (view === 'expense-login') {
                setShowExpenseLogin(true);
                setShowAdminLogin(false);
                setShowRecepLogin(false);
                setShowTeacherLogin(false);
                setShowAccountantLogin(false);
              } else {
                setActiveView(view);
              }
            }}
          />
        )}

        <main style={(showAdminLogin || showRecepLogin || showTeacherLogin || showAccountantLogin || showExpenseLogin) ? { flex: 1, display: 'flex' } : { flex: 1, marginTop: '10px' }}>
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
