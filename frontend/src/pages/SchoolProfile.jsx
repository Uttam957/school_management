import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  School,
  Users,
  UserCog,
  Plus,
  X,
  Save,
  AlertCircle
} from 'lucide-react';

export default function SchoolProfile({ schoolDetails, fetchSchoolDetails }) {
  const [overviewStats, setOverviewStats] = useState({
    totalStudents: '0',
    totalStaff: '0'
  });
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    ratePerStudent: '',
    razorpayAccountId: '',
    attendanceMode: 'Teacher Marking',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/overview');
      if (res.ok) {
        const data = await res.json();
        setOverviewStats({
          totalStudents: data.totalStudents || '0',
          totalStaff: data.totalStaff || '0'
        });
      }
    } catch (err) {
      console.error('Error loading overview tallies for school card:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [schoolDetails]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectMode = (mode) => {
    setFormData({
      ...formData,
      attendanceMode: mode
    });
  };

  const handleOpenModal = () => {
    // Reset form to be completely clean/empty by default when adding a school
    setFormData({
      name: '',
      subdomain: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: '',
      ratePerStudent: '',
      razorpayAccountId: '',
      attendanceMode: 'Teacher Marking',
      adminName: '',
      adminEmail: '',
      adminPassword: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'School brand name is required.';
    if (!formData.subdomain.trim()) errors.subdomain = 'Subdomain is required.';
    if (!formData.ratePerStudent.trim()) errors.ratePerStudent = 'Rate per student is required.';
    if (!formData.adminEmail.trim()) {
      errors.adminEmail = 'Admin email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      errors.adminEmail = 'Invalid email syntax.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const res = await fetch('/api/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setFormErrors({});
        if (fetchSchoolDetails) await fetchSchoolDetails();
        setShowModal(false); // Close modal on success
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving school profile:', err);
    }
  };

  return (
    <>
      {/* 1. Full-Width Admin Dashboard Banner Card (Isolated in animation container) */}
      <div className="animate-slide-up" style={{ 
        width: '100%',
        padding: '10px 0'
      }}>
        <div className="glass-panel" style={{ 
          width: '100%',
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-md)',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Decorative Radial Glow Background Accent */}
          <div style={{
            position: 'absolute',
            top: '-150px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(hsl(var(--color-primary)), 0.1) 0%, rgba(hsl(var(--color-primary)), 0) 70%)',
            zIndex: 0,
            pointerEvents: 'none'
          }} />

          {/* Compact School Branding Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            gap: '16px',
            zIndex: 1,
            width: '100%',
            flexWrap: 'wrap'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 10px rgba(hsl(var(--color-primary)), 0.25)',
                flexShrink: 0
              }}>
                <School size={24} />
              </div>
              
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 800, 
                  letterSpacing: '-0.025em',
                  background: 'linear-gradient(135deg, var(--text-main) 40%, rgba(var(--text-main), 0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  lineHeight: '1.2'
                }}>
                  {schoolDetails?.name || 'Dashboard'}
                </h2>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  margin: 0
                }}>
                  Official Academy Administration Portal
                </p>
              </div>
            </div>

            {/* Sleek Plus Button on the upper side */}
            <button 
              onClick={handleOpenModal}
              className="btn-primary" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '10px 18px', 
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(hsl(var(--color-primary)), 0.2)',
                border: 'none',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              <Plus size={16} /> Add School
            </button>

          </div>

          {/* Thin Sleek Divider */}
          <div style={{ 
            width: '100%', 
            height: '1px', 
            background: 'var(--border-glass)',
            margin: 0
          }}></div>

          {/* Student and Staff counts positioned below the heading */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '20px', 
            width: '100%',
            zIndex: 1
          }}>
            
            {/* Total Registered Students Card */}
            <div className="glass-panel" style={{ 
              padding: '16px 20px', 
              borderRadius: '12px',
              border: '1px solid rgba(hsl(var(--color-primary)), 0.15)',
              background: 'rgba(hsl(var(--color-primary)), 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(hsl(var(--color-primary)), 0.1)',
                color: 'hsl(var(--color-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered Students</span>
                <strong style={{ 
                  fontSize: '1.75rem', 
                  color: 'var(--text-main)', 
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginTop: '2px'
                }}>
                  {overviewStats.totalStudents}
                </strong>
              </div>
            </div>

            {/* Total Support Staff Card */}
            <div className="glass-panel" style={{ 
              padding: '16px 20px', 
              borderRadius: '12px',
              border: '1px solid rgba(hsl(var(--color-info)), 0.15)',
              background: 'rgba(hsl(var(--color-info)), 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(hsl(var(--color-info)), 0.1)',
                color: 'hsl(var(--color-info))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <UserCog size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Support Staff</span>
                <strong style={{ 
                  fontSize: '1.75rem', 
                  color: 'var(--text-main)', 
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginTop: '2px'
                }}>
                  {overviewStats.totalStaff}
                </strong>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Pristine White Background Modal - Rendered via Portal directly to body */}
      {showModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="animate-scale-up" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '32px',
            borderRadius: '16px',
            background: '#ffffff', 
            border: '1px solid #cbd5e1', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}>
            
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid #e2e8f0', 
              paddingBottom: '16px' 
            }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                color: '#0f172a', 
                margin: 0 
              }}>
                Add School
              </h3>
              <button 
                type="button"
                onClick={() => { setShowModal(false); setFormErrors({}); }}
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #cbd5e1', 
                  color: '#64748b', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '8px', 
                  borderRadius: '50px',
                  width: '36px',
                  height: '36px',
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* SECTION A: SCHOOL DETAILS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: '#64748b', 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase' 
                }}>
                  School Details
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      School Name *
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                    {formErrors.name && (
                      <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <AlertCircle size={12}/>{formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      Subdomain *
                    </label>
                    <input 
                      type="text" 
                      name="subdomain" 
                      value={formData.subdomain} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                    {formErrors.subdomain && (
                      <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <AlertCircle size={12}/>{formErrors.subdomain}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                    Address
                  </label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="form-control"
                    style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      City
                    </label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      State
                    </label>
                    <input 
                      type="text" 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      Phone
                    </label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      Email
                    </label>
                    <input 
                      type="text" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      Rate per Student (₹/Month) *
                    </label>
                    <input 
                      type="text" 
                      name="ratePerStudent" 
                      value={formData.ratePerStudent} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                    {formErrors.ratePerStudent && (
                      <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <AlertCircle size={12}/>{formErrors.ratePerStudent}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      Razorpay Account ID
                    </label>
                    <input 
                      type="text" 
                      name="razorpayAccountId" 
                      value={formData.razorpayAccountId} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: ATTENDANCE MODE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: '#64748b', 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase' 
                }}>
                  Attendance Mode
                </span>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  
                  {/* Option 1: Teacher Marking */}
                  <div 
                    onClick={() => handleSelectMode('Teacher Marking')}
                    style={{
                      flex: '1 1 280px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: formData.attendanceMode === 'Teacher Marking' ? '2px solid #6366f1' : '1px solid #cbd5e1',
                      background: formData.attendanceMode === 'Teacher Marking' ? '#f5f3ff' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${formData.attendanceMode === 'Teacher Marking' ? '#6366f1' : '#cbd5e1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: formData.attendanceMode === 'Teacher Marking' ? '#6366f1' : 'transparent'
                      }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Teacher Marking</strong>
                      <span style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                        Teachers mark students manually; QR for staff only
                      </span>
                    </div>
                  </div>

                  {/* Option 2: QR Scanner */}
                  <div 
                    onClick={() => handleSelectMode('QR Scanner')}
                    style={{
                      flex: '1 1 280px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: formData.attendanceMode === 'QR Scanner' ? '2px solid #6366f1' : '1px solid #cbd5e1',
                      background: formData.attendanceMode === 'QR Scanner' ? '#f5f3ff' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${formData.attendanceMode === 'QR Scanner' ? '#6366f1' : '#cbd5e1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: formData.attendanceMode === 'QR Scanner' ? '#6366f1' : 'transparent'
                      }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>QR Scanner</strong>
                      <span style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                        All attendance via webcam QR scan
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION C: SCHOOL ADMIN LOGIN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: '#64748b', 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase' 
                }}>
                  School Admin Login
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      Admin Name
                    </label>
                    <input 
                      type="text" 
                      name="adminName" 
                      value={formData.adminName} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                      Admin Email *
                    </label>
                    <input 
                      type="text" 
                      name="adminEmail" 
                      value={formData.adminEmail} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                    />
                    {formErrors.adminEmail && (
                      <span style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <AlertCircle size={12}/>{formErrors.adminEmail}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#334155' }}>
                    Admin Password (Leave Blank to Keep Current)
                  </label>
                  <input 
                    type="password" 
                    name="adminPassword" 
                    value={formData.adminPassword} 
                    onChange={handleInputChange} 
                    className="form-control"
                    style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }}
                  />
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end', 
                borderTop: '1px solid #e2e8f0',
                paddingTop: '20px',
                marginTop: '10px' 
              }}>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setFormErrors({}); }} 
                  className="btn-secondary"
                  style={{ 
                    padding: '12px 24px', 
                    borderRadius: '10px', 
                    border: '1px solid #cbd5e1', 
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ 
                    padding: '12px 28px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    border: 'none', 
                    background: '#6366f1',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
