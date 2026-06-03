import React, { useState } from 'react';
import { Wallet, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function ExpenseLogin({ onLogin, onCancel }) {
   const [email, setEmail] = useState('uttam306115@gmail.com');
  const [password, setPassword] = useState('uttam@2004');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Accept user fallbacks + official expense manager account
      const isValidEmail = 
        email === 'expense@school.com' || 
        email === 'uttam306115@gmail.com' || 
        email === 'uttam2004@gmail.com';
      const isValidPassword = 
        password === 'uttam@2004' || 
        password === 'expense@123';

      if (isValidEmail && isValidPassword) {
        onLogin();
      } else {
        setError('Invalid email or password. Use uttam306115@gmail.com / uttam@2004');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card glass-panel">
        <div className="admin-login-header">
          <div className="admin-login-icon" style={{ background: 'linear-gradient(135deg, hsl(var(--color-danger)) 0%, hsl(var(--color-warning)) 100%)' }}>
            <Wallet size={32} />
          </div>
          <h1>Expense Management Panel</h1>
          <p>Sign in to record & approve academy expenses</p>
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
                placeholder="uttam@2004"
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
            style={{ background: 'linear-gradient(135deg, hsl(var(--color-danger)) 0%, hsl(var(--color-warning)) 100%)' }}
          >
            {loading ? (
              <span className="admin-login-spinner"></span>
            ) : (
              <>
                <Wallet size={18} />
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
            Return to Main Dashboard
          </button>
        </form>

        <div className="admin-login-footer">
          <span>Expense Dashboard access only</span>
        </div>
      </div>
    </div>
  );
}
