import React, { useState, useEffect } from 'react';
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


import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [schoolDetails, setSchoolDetails] = useState({ name: 'Aether Academy', principal: 'Alex Devlin' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminView, setAdminView] = useState('dashboard');


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
    } else if (path === '/register-student') setActiveView('register-student');
    else if (path === '/add-teacher') setActiveView('add-teacher');
    else if (path === '/add-staff') setActiveView('add-staff');
    else if (path === '/teacher-list') setActiveView('teacher-list');
  }, []);

  useEffect(() => {
    if (showAdminLogin) {
      window.history.pushState(null, '', '/admin/login');
    } else if (isAdmin) {
      window.history.pushState(null, '', '/admin');
    } else if (activeView === 'register-student') {
      window.history.pushState(null, '', '/register-student');
    } else if (activeView === 'add-staff') {
      window.history.pushState(null, '', '/add-staff');
    } else if (activeView === 'overview') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `/${activeView}`);
    }
  }, [activeView, showAdminLogin, isAdmin]);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
    setAdminView('dashboard');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminView('dashboard');
    setActiveView('overview');
  };



  const renderCurrentView = () => {
    if (showAdminLogin) {
      return <AdminLogin onLogin={handleAdminLogin} />;
    }

    if (isAdmin) {
      return <AdminPanel setActiveView={setActiveView} onLogout={handleAdminLogout} adminView={adminView} setAdminView={setAdminView} />;
    }

    switch (activeView) {
      case 'overview':
        return <DashboardOverview setActiveView={setActiveView} />;
      case 'students':
        return <StudentDirectory />;
      case 'register-student':
        return <RegisterStudent setActiveView={setActiveView} />;
      case 'add-teacher':
        return <AddTeacher setActiveView={setActiveView} />;
      case 'teacher-list':
        return <TeacherList setActiveView={setActiveView} />;
      case 'add-staff':
        return <AddStaff setActiveView={setActiveView} />;
      case 'staff':
        return <StaffDirectory />;
      case 'finance':
        return <FinancePortal />;
      case 'school':
        return <SchoolProfile schoolDetails={schoolDetails} fetchSchoolDetails={fetchSchoolDetails} />;
      default:
        return <DashboardOverview setActiveView={setActiveView} />;
    }
  };

  const showSidebar = !showAdminLogin;

  return (
    <div className="app-container">
      {showSidebar && (
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            if (view === 'admin-login') {
              setShowAdminLogin(true);
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

      <div className="app-content" style={showAdminLogin ? { padding: 0 } : {}}>
        {!showAdminLogin && (
          <Header
            activeView={activeView}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            theme={theme}
            setTheme={setTheme}
            schoolDetails={schoolDetails}
          />
        )}

        <main style={showAdminLogin ? { flex: 1, display: 'flex' } : { flex: 1, marginTop: '10px' }}>
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
