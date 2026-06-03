import React, { useState } from 'react';
import { UserCheck, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

export default function TeacherLogin({ onLogin, onCancel }) {
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
        setError('Invalid email or password. Please try again.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card glass-panel">
        <div className="admin-login-header">
          <div className="admin-login-icon" style={{ background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(var(--color-primary)) 100%)' }}>
            <UserCheck size={32} />
          </div>
          <h1>Teacher Panel</h1>
          <p>Sign in to view student directory</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="admin-input-wrapper">
              <Mail size={18} className="admin-input-icon" />
              <input
                type="email"
                className="form-control"
                placeholder="teacher@school.com"
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
            style={{ background: 'linear-gradient(135deg, hsl(var(--color-secondary)) 0%, hsl(var(--color-primary)) 100%)' }}
          >
            {loading ? (
              <span className="admin-login-spinner"></span>
            ) : (
              <>
                <UserCheck size={18} />
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
            Back to Main Dashboard
          </button>
        </form>

        <div className="admin-login-footer">
          <span>Teacher access only</span>
        </div>
      </div>
    </div>
  );
}
