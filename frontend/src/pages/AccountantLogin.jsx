import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Calculator } from 'lucide-react';

export default function AccountantLogin({ onLogin, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email === 'uttam306115@gmail.com' && password === 'uttam@2004') {
        onLogin();
      } else {
        setError('Invalid credentials. Use uttam306115@gmail.com / uttam@2004');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card glass-panel">
        <div className="admin-login-header">
          <div className="admin-login-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <Calculator size={32} />
          </div>
          <h1>Accountant Portal</h1>
          <p>Finance & Accounts Management System</p>
        </div>

        {error && (
          <div className="admin-login-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="admin-input-wrapper">
              <Mail size={18} className="admin-input-icon" />
              <input
                type="email"
                className="form-control"
                placeholder="uttam306115@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="admin-input-wrapper">
              <Lock size={18} className="admin-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary admin-login-btn"
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            {loading ? (
              <span className="admin-login-spinner"></span>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '14px 24px', fontSize: '0.95rem' }}
          >
            <ArrowLeft size={16} />
            Return to Main Dashboard
          </button>
        </form>

        <div className="admin-login-footer">
          <span>Authorized personnel only</span>
        </div>
      </div>
    </div>
  );
}
