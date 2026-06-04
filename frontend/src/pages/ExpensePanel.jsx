import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, DollarSign, Wallet, ClipboardList, BarChart3, Bell, CheckCircle,
  XCircle, AlertTriangle, Plus, Search, Filter, Download, ArrowUpRight, ArrowDownRight,
  TrendingDown, FileText, Check, X, ShieldAlert, ChevronRight, Eye, Trash2, Edit2, Loader2,
  ListFilter, Calendar, PieChart, Info, Settings, RefreshCw, AlertCircle, Shield,
  LogOut
} from 'lucide-react';

export default function ExpensePanel({ setActiveView, onLogout, expenseView, setExpenseView, onAccessAdmin, hideHeader, onBackToMain }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [budgetLimit] = useState(600000); // Default monthly budget limit

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchExpenses = () => {
    setLoading(true);
    fetch('/api/finance/expenses')
      .then(res => res.json())
      .then(data => {
        setExpenses(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching expenses:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExpenses();
  }, [expenseView]);

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '12px' }}>
          <Loader2 className="animate-spin" size={36} style={{ color: 'hsl(var(--color-danger))' }} />
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Fetching expense metrics...</p>
        </div>
      );
    }

    switch (expenseView) {
      case 'dashboard':
        return <DashboardView expenses={expenses} setExpenseView={setExpenseView} budgetLimit={budgetLimit} />;
      case 'add-expense':
        return <AddExpenseView showToast={showToast} setExpenseView={setExpenseView} />;
      case 'categories':
        return <CategoriesView expenses={expenses} showToast={showToast} fetchExpenses={fetchExpenses} />;
      case 'all-expenses':
        return <AllExpensesView expenses={expenses} showToast={showToast} fetchExpenses={fetchExpenses} />;
      case 'reports':
        return <ReportsView expenses={expenses} budgetLimit={budgetLimit} showToast={showToast} />;
      case 'approvals':
        return <ApprovalsView expenses={expenses} showToast={showToast} fetchExpenses={fetchExpenses} />;
      case 'tracker':
        return <TrackerView expenses={expenses} showToast={showToast} />;
      default:
        return <AddExpenseView showToast={showToast} setExpenseView={setExpenseView} />;
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', padding: '16px 24px', borderRadius: '12px',
          background: notification.type === 'success' ? '#10b981' : notification.type === 'warning' ? '#f59e0b' : '#ef4444', 
          color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
          gap: '10px', zIndex: 999999, fontWeight: 600, animation: 'slideInRight 0.3s ease forwards'
        }}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      {!hideHeader && (
        <div className="admin-panel-header glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(hsl(var(--color-danger)), 0.1)',
              color: 'hsl(var(--color-danger))'
            }}>
              <Wallet size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{expenseView === 'dashboard' ? 'Expense Dashboard' :
               expenseView === 'add-expense' ? 'New Expense Application' :
               expenseView === 'categories' ? 'Departmental Overheads' :
               expenseView === 'all-expenses' ? 'General Expense Ledger' :
               expenseView === 'reports' ? 'Reports & Budget Control' :
               expenseView === 'approvals' ? 'Review & Approvals Queue' :
               expenseView === 'tracker' ? 'Time-Period Expense Tracker' : 'New Expense Application'}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {expenseView === 'dashboard' ? 'Monitor expense totals, approval queues, budget usage, and recent ledger activity.' :
                 expenseView === 'add-expense' ? 'Record utility bills, administrative supplies, renovation costs, or payroll expenses.' :
                 expenseView === 'categories' ? 'Detailed records segmented across specific school operations and utilities.' :
                 expenseView === 'all-expenses' ? 'Search, filter, paginate, sort, and export the complete academy expense history.' :
                 expenseView === 'reports' ? 'Analyze budget thresholds, daily/weekly burn rates, and vendor analytics.' :
                 expenseView === 'approvals' ? 'Audit workflow queue for reviewing, comment recording, and invoice verification.' :
                 expenseView === 'tracker' ? 'Analyze expenditures per day, month, or year with custom comparative filters.' : 'Record utility bills, administrative supplies, renovation costs, or payroll expenses.'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'rgb(var(--color-danger-rgb))', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
            <button
              onClick={onBackToMain}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutDashboard size={16} />
              Main Dashboard
            </button>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}

/* ============================================================
   DASHBOARD VIEW
   ============================================================ */
function DashboardView({ expenses, setExpenseView, budgetLimit }) {
  // Current Month calculations
  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7); // "YYYY-MM"
  const todayStr = today.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const currentYearStr = today.getFullYear().toString();

  const monthlyExpenses = expenses.filter(e => e.date?.startsWith(currentMonthStr));
  const approvedMonthlyExpenses = monthlyExpenses.filter(e => e.status === 'Approved' || e.status === undefined || e.status === '');
  const totalApprovedMonthly = approvedMonthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Daily spending calculations for the current month (June 2026, etc.)
  const year = today.getFullYear();
  const monthNum = today.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, monthNum + 1, 0).getDate();

  const dailyData = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentMonthStr}-${d.toString().padStart(2, '0')}`;
    dailyData[dateStr] = 0;
  }

  approvedMonthlyExpenses.forEach(e => {
    if (e.date && dailyData[e.date] !== undefined) {
      dailyData[e.date] += e.amount || 0;
    }
  });

  const sortedDays = Object.entries(dailyData)
    .sort((a, b) => a[0].localeCompare(b[0]));

  const yearlyExpenses = expenses.filter(e => e.date?.startsWith(currentYearStr));
  const totalYearly = yearlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const totalToday = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const pendingApprovals = expenses.filter(e => e.status === 'Pending');
  const totalPendingAmount = pendingApprovals.reduce((sum, e) => sum + (e.amount || 0), 0);

  const approvedExpenses = expenses.filter(e => e.status === 'Approved');
  const rejectedExpenses = expenses.filter(e => e.status === 'Rejected');

  // Group by category
  const categoryGroups = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    categoryGroups[cat] = (categoryGroups[cat] || 0) + (e.amount || 0);
  });

  const sortedCategories = Object.entries(categoryGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const metrics = [
    { label: 'Current Month Expenses', value: `₹${totalApprovedMonthly.toLocaleString()}`, subText: `Budget: ₹${budgetLimit.toLocaleString()}`, color: totalApprovedMonthly > budgetLimit ? '#ef4444' : '#10b981', icon: Wallet, progress: Math.min((totalApprovedMonthly / budgetLimit) * 100, 100) },
    { label: 'Current Year Total', value: `₹${totalYearly.toLocaleString()}`, subText: 'Cumulative overall spending', color: '#3b82f6', icon: BarChart3 },
    { label: "Today's Overhead", value: `₹${totalToday.toLocaleString()}`, subText: 'Recorded today', color: '#a855f7', icon: Calendar },
    { label: 'Pending Approvals', value: pendingApprovals.length.toString(), subText: `₹${totalPendingAmount.toLocaleString()} awaiting audit`, color: '#f59e0b', icon: ShieldAlert },
    { label: 'Approved Invoices', value: approvedExpenses.length.toString(), subText: 'Signed off by managers', color: '#10b981', icon: CheckCircle },
    { label: 'Rejected Invoices', value: rejectedExpenses.length.toString(), subText: 'Failed verification logs', color: '#ef4444', icon: XCircle }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="glass-panel" style={{
              padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px',
              background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</span>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: `${m.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={18} style={{ color: m.color }} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{m.value}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{m.subText}</p>
              </div>
              {m.progress !== undefined && (
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${m.progress}%`, height: '100%', background: m.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Grid: Charts & Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Category breakdown */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <PieChart size={18} style={{ color: 'hsl(var(--color-danger))' }} /> Top Spending Categories
            </h3>
            <button 
              onClick={() => setExpenseView('categories')}
              className="btn-text" 
              style={{ fontSize: '0.75rem', color: 'hsl(var(--color-danger))', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Analyze Categories
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedCategories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>No data available</span>
                <span>Data will appear once records are added</span>
              </div>
            ) : (
              sortedCategories.map(([cat, val]) => {
                const maxVal = Math.max(...Object.values(categoryGroups), 1);
                const percent = Math.round((val / maxVal) * 100);
                const catColors = { 
                  Maintenance: '#3b82f6', Salary: '#8b5cf6', Stationery: '#f59e0b', 
                  Utilities: '#06b6d4', Transportation: '#10b981', Events: '#f97316', 
                  Other: '#6b7280' 
                };
                const color = catColors[cat] || 'hsl(var(--color-danger))';
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>₹{val.toLocaleString()}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Add and Actions */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} style={{ color: 'hsl(var(--color-danger))' }} /> Quick Actions
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Frequently used controls for managing corporate spending and approving utility requisitions.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button 
              onClick={() => setExpenseView('add-expense')}
              style={{
                padding: '16px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff',
                border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: '0.85rem',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)', transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={20} />
              <span>Record Expense</span>
            </button>
            
            <button 
              onClick={() => setExpenseView('approvals')}
              style={{
                padding: '16px', background: 'rgba(255,255,255,0.03)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: '0.85rem',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <ShieldAlert size={20} style={{ color: '#f59e0b' }} />
              <span>Pending Reviews</span>
            </button>

            <button 
              onClick={() => setExpenseView('all-expenses')}
              style={{
                padding: '12px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', fontWeight: 600, cursor: 'pointer',
                fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <ClipboardList size={15} /> Ledger View
            </button>
            <button 
              onClick={() => setExpenseView('reports')}
              style={{
                padding: '12px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', fontWeight: 600, cursor: 'pointer',
                fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <BarChart3 size={15} /> Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Daily Spending Trends */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <BarChart3 size={18} style={{ color: 'hsl(var(--color-danger))' }} /> Daily Spending Trends (Current Month)
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Active Month: {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', width: '100%' }}>
          {sortedDays.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>No data available</span>
              <span>Daily trends will appear as expenses are recorded</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100%', width: '100%', padding: '0 10px', overflowX: 'auto' }}>
              {sortedDays.map(([dateStr, val], idx) => {
                const maxVal = Math.max(...Object.values(dailyData), 1);
                const height = (val / maxVal) * 160;
                const dayNum = parseInt(dateStr.split('-')[2]);
                const isToday = dateStr === todayStr;
                return (
                  <div key={idx} style={{ flex: 1, minWidth: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                      {val > 0 && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)' }}>₹{val.toLocaleString()}</span>
                      )}
                      <div style={{
                        width: '100%', maxWidth: '24px', height: `${Math.max(height, 4)}px`, borderRadius: '4px 4px 0 0',
                        background: val > 0 
                          ? (isToday ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)')
                          : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.3s ease', minHeight: '4px',
                        border: isToday ? '1px solid #f59e0b' : 'none'
                      }} title={`Date: ${dateStr} | Spent: ₹${val.toLocaleString()}`} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: isToday ? 'hsl(var(--color-warning))' : 'var(--text-muted)', fontWeight: isToday ? 800 : 600 }}>{dayNum}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Ledger Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <ClipboardList size={18} style={{ color: 'hsl(var(--color-danger))' }} /> Recent Activity Ledger
          </h3>
          <button 
            onClick={() => setExpenseView('all-expenses')}
            style={{ background: 'none', border: 'none', color: 'hsl(var(--color-danger))', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            View Full Ledger
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Title', 'Category', 'Amount', 'Date', 'Vendor', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No expense records registered.</td>
                </tr>
              ) : (
                expenses.slice(0, 5).map((exp, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{exp.title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)'
                      }}>{exp.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#ef4444' }}>₹{exp.amount?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.vendor?.name || 'Various'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                        background: exp.status === 'Approved' ? 'rgba(16,185,129,0.1)' : exp.status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: exp.status === 'Approved' ? '#10b981' : exp.status === 'Rejected' ? '#ef4444' : '#f59e0b'
                      }}>{exp.status || 'Pending'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADD EXPENSE VIEW
   ============================================================ */
function AddExpenseView({ showToast, setExpenseView }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', category: 'Office & Administrative', subcategory: 'Office Supplies',
    amount: '', date: new Date().toISOString().slice(0, 10), paymentDate: '',
    vendorName: '', vendorContact: '', vendorEmail: '', vendorAddress: '',
    paymentMethod: 'Cash', transactionId: '', invoiceNumber: '',
    remarks: '', notes: '', attachmentName: '', status: 'Pending'
  });

  const categories = {
    'Office & Administrative': ['Stationery', 'Printing', 'Internet Bills', 'Telephone Bills', 'Office Supplies'],
    'Staff Welfare': ['Tea & Refreshments', 'Snacks', 'Staff Meetings', 'Staff Events', 'Training Programs'],
    'Furniture & Equipment': ['Classroom Furniture', 'Office Furniture', 'Laboratory Equipment', 'Sports Equipment', 'Computers', 'Smart Boards', 'Projectors'],
    'Building & Renovation': ['Construction', 'Painting', 'Flooring', 'Plumbing', 'Electrical Work', 'Classroom Renovation', 'Washroom Renovation', 'Roof Repair', 'Boundary Wall Repair'],
    'Utilities': ['Electricity', 'Water', 'Gas', 'Generator Fuel', 'Solar Maintenance'],
    'Transportation': ['Fuel', 'Vehicle Maintenance', 'Repairs', 'Insurance'],
    'Maintenance & Repair': ['AC Repair', 'CCTV Maintenance', 'Computer Repair', 'Furniture Repair', 'Playground Maintenance'],
    'Academic Expenses': ['Books', 'Library', 'Laboratory Materials', 'Examination Materials', 'Software Licenses'],
    'Events & Functions': ['Annual Day', 'Sports Day', 'Science Exhibition', 'Seminars', 'Other Events'],
    'Other Expenses': ['Miscellaneous Overhead']
  };

  const handleCategoryChange = (cat) => {
    const subcats = categories[cat] || [];
    setForm(prev => ({
      ...prev,
      category: cat,
      subcategory: subcats[0] || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      category: form.category,
      subcategory: form.subcategory,
      amount: Number(form.amount) || 0,
      description: form.remarks,
      date: form.date,
      paymentDate: form.paymentDate || form.date,
      paidBy: 'Expense Management',
      vendor: {
        name: form.vendorName,
        contact: form.vendorContact,
        email: form.vendorEmail,
        address: form.vendorAddress
      },
      paymentDetails: {
        method: form.paymentMethod,
        transactionId: form.transactionId,
        invoiceNumber: form.invoiceNumber
      },
      status: form.status,
      submittedBy: 'Expense Management',
      remarks: form.remarks,
      notes: form.notes,
      attachment: form.attachmentName || 'invoice_mock.pdf'
    };

    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Expense of ₹${Number(form.amount).toLocaleString()} successfully logged!`);
        setExpenseView('dashboard');
      } else {
        showToast('Failed to record expense. Verify parameters.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network interface error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fieldLabelStyle = { fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' };
  const inputStyle = {
    width: '100%', padding: '11px 14px', background: 'var(--bg-form)',
    border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'var(--text-main)',
    fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
  };
  const sectionTitleStyle = { fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '16px' };

  return (
    <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Basic Information */}
        <div>
          <h4 style={sectionTitleStyle}>Basic Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <label style={fieldLabelStyle}>Expense Title</label>
              <input 
                type="text" required placeholder="Fiber internet lease renewal" 
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Expense Category</label>
              <select 
                value={form.category} onChange={e => handleCategoryChange(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabelStyle}>Subcategory</label>
              <select 
                value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value})}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {(categories[form.category] || []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabelStyle}>Amount (₹)</label>
              <input 
                type="number" required placeholder="12500" 
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Expense Date</label>
              <input 
                type="date" required 
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Payment Settlement Date</label>
              <input 
                type="date" 
                value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div>
          <h4 style={sectionTitleStyle}>Vendor / Supplier Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <label style={fieldLabelStyle}>Vendor Name</label>
              <input 
                type="text" placeholder="Aegis Digital Solutions" 
                value={form.vendorName} onChange={e => setForm({ ...form, vendorName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Contact Number</label>
              <input 
                type="tel" placeholder="+91 9876543210" 
                value={form.vendorContact} onChange={e => setForm({ ...form, vendorContact: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Email Address</label>
              <input 
                type="email" placeholder="billing@aegissolutions.com" 
                value={form.vendorEmail} onChange={e => setForm({ ...form, vendorEmail: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Postal Address</label>
              <input 
                type="text" placeholder="Plot 12, Sector 5, Industrial Area" 
                value={form.vendorAddress} onChange={e => setForm({ ...form, vendorAddress: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Payment details */}
        <div>
          <h4 style={sectionTitleStyle}>Payment Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <label style={fieldLabelStyle}>Payment Method</label>
              <select 
                value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabelStyle}>Transaction / Reference ID</label>
              <input 
                type="text" placeholder="TXN-938210398" 
                value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Invoice / Receipt Number</label>
              <input 
                type="text" placeholder="INV-2026-883" 
                value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Document Upload (Mock)</label>
              <input 
                type="text" placeholder="invoice_receipt.pdf" 
                value={form.attachmentName} onChange={e => setForm({ ...form, attachmentName: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Approval Workflow & Extra */}
        <div>
          <h4 style={sectionTitleStyle}>Workflow Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <label style={fieldLabelStyle}>Sign-off Status</label>
              <select 
                value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="Pending">Pending Verification</option>
                <option value="Approved">Pre-Approved (Immediate Payout)</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={fieldLabelStyle}>Description / Statement of Purpose</label>
              <input 
                type="text" placeholder="Annual renewal of high-speed office fiber line (500Mbps)" 
                value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <button 
            type="button" 
            onClick={() => setExpenseView('dashboard')}
            style={{
              padding: '12px 24px', background: 'rgba(255,255,255,0.04)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '12px 28px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff',
              border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Submit Expense Requisition
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   CATEGORIES VIEW
   ============================================================ */
function CategoriesView({ expenses, showToast, fetchExpenses }) {
  const [activeTab, setActiveTab] = useState('Office & Administrative');

  const categories = [
    'Office & Administrative', 'Staff Welfare', 'Furniture & Equipment', 
    'Building & Renovation', 'Utilities', 'Transportation', 
    'Maintenance & Repair', 'Academic Expenses', 'Events & Functions', 'Other Expenses'
  ];

  const filteredExpenses = expenses.filter(e => e.category === activeTab);
  const totalCategorySpent = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              padding: '10px 18px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)',
              background: activeTab === cat ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)',
              color: activeTab === cat ? '#ef4444' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', borderColor: activeTab === cat ? '#ef444455' : 'rgba(255,255,255,0.06)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Category Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* Left Side: Summary Card */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Category Total</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>₹{totalCategorySpent.toLocaleString()}</h3>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total invoices registered in this category: <strong style={{ color: 'var(--text-main)' }}>{filteredExpenses.length}</strong>
            </p>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
            <Info size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <span>Review subcategory allocations on the right table. Dismiss bad records inside approvals page.</span>
          </div>
        </div>

        {/* Right Side: Category Table */}
        <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>Segmented Ledger: {activeTab}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Title', 'Subcategory', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expenses found in this category.</td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{exp.title}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.subcategory || 'General'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{exp.amount?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.date}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700,
                          background: exp.status === 'Approved' ? 'rgba(16,185,129,0.1)' : exp.status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: exp.status === 'Approved' ? '#10b981' : exp.status === 'Rejected' ? '#ef4444' : '#f59e0b'
                        }}>{exp.status || 'Pending'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================
   ALL EXPENSES VIEW
   ============================================================ */
function AllExpensesView({ expenses, showToast, fetchExpenses }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const itemsPerPage = 10;

  const categories = [
    'Office & Administrative', 'Staff Welfare', 'Furniture & Equipment', 
    'Building & Renovation', 'Utilities', 'Transportation', 
    'Maintenance & Repair', 'Academic Expenses', 'Events & Functions', 'Other Expenses'
  ];

  // Process sorting/filtering
  const filtered = expenses.filter(e => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase()) || 
                        e.expenseId?.toLowerCase().includes(search.toLowerCase()) ||
                        e.vendor?.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter || (statusFilter === 'Pending' && !e.status);

    return matchSearch && matchCategory && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently remove expense request "${title}"?`)) return;
    try {
      const res = await fetch(`/api/finance/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Expense successfully removed.');
        fetchExpenses();
      } else {
        showToast('Error removing expense.', 'error');
      }
    } catch {
      showToast('Network communication error', 'error');
    }
  };

  const exportCSV = () => {
    if (!sorted.length) return showToast('No items to export.', 'error');
    const headers = ['ID', 'Title', 'Category', 'Subcategory', 'Amount', 'Date', 'Vendor', 'Method', 'Status'];
    const csvContent = [
      headers.join(','),
      ...sorted.map(e => [
        e.expenseId,
        `"${e.title}"`,
        e.category,
        e.subcategory || '',
        e.amount,
        e.date,
        `"${e.vendor?.name || ''}"`,
        e.paymentDetails?.method || '',
        e.status || 'Pending'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense_report_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Ledger successfully downloaded as CSV.');
  };

  const inputStyle = {
    padding: '10px 14px', background: 'var(--bg-form)',
    border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'var(--text-main)',
    fontSize: '0.82rem', outline: 'none'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Filtering Toolbar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" placeholder="Search title, ID, vendor..." 
            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ ...inputStyle, paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <select 
          value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          style={{ ...inputStyle, cursor: 'pointer', width: '160px' }}
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select 
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          style={{ ...inputStyle, cursor: 'pointer', width: '130px' }}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select 
          value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer', width: '140px' }}
        >
          <option value="date-desc">Newest Date</option>
          <option value="date-asc">Oldest Date</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
          <option value="title-asc">Alphabetical</option>
        </select>

        <button 
          onClick={exportCSV}
          className="btn-secondary"
          style={{
            padding: '10px 16px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem'
          }}
        >
          <Download size={14} /> Export CSV
        </button>

        <button 
          onClick={() => window.print()}
          className="btn-secondary"
          style={{
            padding: '10px 16px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem'
          }}
        >
          Print Ledger
        </button>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['ID', 'Expense Title', 'Category', 'Vendor', 'Amount', 'Date', 'Status', 'Method', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expenses found matching the selected filters.</td>
                </tr>
              ) : (
                paginated.map((exp, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-danger))' }}>{exp.expenseId}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{exp.title}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{exp.category}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{exp.vendor?.name || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{exp.amount?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{exp.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                        background: exp.status === 'Approved' ? 'rgba(16,185,129,0.1)' : exp.status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: exp.status === 'Approved' ? '#10b981' : exp.status === 'Rejected' ? '#ef4444' : '#f59e0b'
                      }}>{exp.status || 'Pending'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{exp.paymentDetails?.method || 'Cash'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => setSelectedExpense(exp)}
                          style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            color: '#3b82f6', cursor: 'pointer', padding: '6px', borderRadius: '6px'
                          }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(exp.expenseId, exp.title)}
                          style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px'
                          }}
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing page {currentPage} of {totalPages} ({filtered.length} total records)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Previous
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedExpense && (
        <div className="modal-overlay" onClick={() => setSelectedExpense(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '500px', background: 'var(--bg-elevated)', borderRadius: '20px',
            border: '1px solid var(--border-glass)', padding: '28px', boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Expense Voucher Details</h3>
              <button onClick={() => setSelectedExpense(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--bg-card-subtle)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              {[
                ['Expense ID', selectedExpense.expenseId],
                ['Title', selectedExpense.title],
                ['Category', selectedExpense.category],
                ['Subcategory', selectedExpense.subcategory || 'General'],
                ['Amount', `₹${selectedExpense.amount?.toLocaleString()}`],
                ['Expense Date', selectedExpense.date],
                ['Vendor Name', selectedExpense.vendor?.name || '—'],
                ['Vendor Contact', selectedExpense.vendor?.contact || '—'],
                ['Vendor Email', selectedExpense.vendor?.email || '—'],
                ['Vendor Address', selectedExpense.vendor?.address || '—'],
                ['Payment Method', selectedExpense.paymentDetails?.method || 'Cash'],
                ['Transaction ID', selectedExpense.paymentDetails?.transactionId || '—'],
                ['Invoice Number', selectedExpense.paymentDetails?.invoiceNumber || '—'],
                ['Audit Status', selectedExpense.status || 'Pending'],
                ['Submitted By', selectedExpense.submittedBy || 'Expense Management'],
                ['Remarks', selectedExpense.remarks || '—']
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 700, textAlign: 'right', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ============================================================
   REPORTS & ANALYTICS VIEW
   ============================================================ */
function ReportsView({ expenses, budgetLimit }) {
  // Simple budget progress calculation
  const totalSpent = expenses
    .filter(e => e.status === 'Approved' || e.status === undefined || e.status === '')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const budgetExceeded = totalSpent > budgetLimit;

  // Monthly comparison
  const monthlyData = {};
  expenses.forEach(e => {
    if (e.date) {
      const month = e.date.substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + (e.amount || 0);
    }
  });

  const sortedMonths = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6); // last 6 months

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Budget Vs Actual Card */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} style={{ color: budgetExceeded ? '#ef4444' : '#10b981' }} /> Monthly Budget Performance
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Current Burn Rate</p>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: budgetExceeded ? '#ef4444' : '#10b981', marginTop: '6px' }}>₹{totalSpent.toLocaleString()}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>of ₹{budgetLimit.toLocaleString()} limit</span>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span>Cumulative Overhead Tracker</span>
              <span>{Math.round((totalSpent / budgetLimit) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((totalSpent / budgetLimit) * 100, 100)}%`, height: '100%', background: budgetExceeded ? '#ef4444' : 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '5px' }} />
            </div>
            {budgetExceeded && (
              <p style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} /> Budget Limit Exceeded! Reduce non-essential operations.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Historical Trend Charts */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} style={{ color: 'hsl(var(--color-danger))' }} /> Monthly Spending Trends
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', width: '100%' }}>
          {sortedMonths.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>No data available</span>
              <span>Data will appear once records are added</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '100%', width: '100%', padding: '0 10px' }}>
              {sortedMonths.map(([m, val], idx) => {
                const maxVal = Math.max(...Object.values(monthlyData), 1);
                const height = (val / maxVal) * 160;
                // Format month string
                const dateObj = new Date(m + "-02"); // avoid local offset
                const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>₹{Math.round(val/1000)}k</span>
                      <div style={{
                        width: '40px', height: `${Math.max(height, 6)}px`, borderRadius: '6px 6px 0 0',
                        background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)', transition: 'height 0.5s ease',
                        minHeight: '6px'
                      }} title={`Spent: ₹${val.toLocaleString()}`} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{monthLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   APPROVALS VIEW
   ============================================================ */
function ApprovalsView({ expenses, showToast, fetchExpenses }) {
  const [submittingId, setSubmittingId] = useState(null);
  const [remarks, setRemarks] = useState({});

  const pending = expenses.filter(e => e.status === 'Pending');

  const handleAction = async (id, status) => {
    setSubmittingId(id);
    const itemRemarks = remarks[id] || '';

    try {
      const res = await fetch(`/api/finance/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          approvedBy: 'Expense Sub-Admin',
          remarks: itemRemarks || `Expense verified and ${status.toLowerCase()}.`
        })
      });
      if (res.ok) {
        showToast(`Invoice successfully ${status.toLowerCase()}!`);
        fetchExpenses();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Error (${res.status}): ${errData.error || errData.details || 'Operation failed'}`, 'error');
      }
    } catch (err) {
      showToast(`Network error: ${err.message || 'Connection timeout'}`, 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const textStyle = {
    padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff',
    fontSize: '0.8rem', outline: 'none', width: '100%', boxSizing: 'border-box'
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert size={18} style={{ color: '#f59e0b' }} /> Pending Invoice Audits
      </h3>
      
      {pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={32} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.88rem' }}>Verification queue is empty. All vouchers processed!</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pending.map(exp => (
            <div key={exp.expenseId} style={{
              background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px', padding: '20px', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{exp.title}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '10px' }}>{exp.category}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Amount: <strong style={{ color: '#ef4444' }}>₹{exp.amount.toLocaleString()}</strong> • Date: {exp.date} • Vendor: {exp.vendor?.name || 'Various'}
                </p>
                {exp.description && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
                    Note: "{exp.description}"
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" placeholder="Audit comment or remarks..." 
                  value={remarks[exp.expenseId] || ''}
                  onChange={e => setRemarks({ ...remarks, [exp.expenseId]: e.target.value })}
                  style={textStyle}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={submittingId === exp.expenseId}
                    onClick={() => handleAction(exp.expenseId, 'Approved')}
                    style={{
                      flex: 1, padding: '8px', background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.78rem'
                    }}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    disabled={submittingId === exp.expenseId}
                    onClick={() => handleAction(exp.expenseId, 'Rejected')}
                    style={{
                      flex: 1, padding: '8px', background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#ef4444', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.78rem'
                    }}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   EXPENSE TRACKER VIEW (Per Month, Per Year, Per Day)
   ============================================================ */
function TrackerView({ expenses, showToast }) {
  const [mode, setMode] = useState('date'); // 'date' | 'month' | 'year'

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Filter values
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState((today.getMonth() + 1).toString().padStart(2, '0'));
  const [selectedMonthYear, setSelectedMonthYear] = useState(today.getFullYear().toString());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = ['2024', '2025', '2026', '2027'];

  // Filter expenses based on selected mode and value
  const filteredExpenses = expenses.filter(e => {
    if (e.status === 'Rejected') return false; // Exclude rejected expenses

    if (mode === 'date') {
      return e.date === selectedDate;
    }
    if (mode === 'month') {
      return e.date?.startsWith(`${selectedMonthYear}-${selectedMonth}`);
    }
    if (mode === 'year') {
      return e.date?.startsWith(selectedYear);
    }
    return true;
  });

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalCount = filteredExpenses.length;
  const avgAmount = totalCount > 0 ? Math.round(totalSpent / totalCount) : 0;
  const maxAmount = totalCount > 0 ? Math.max(...filteredExpenses.map(e => e.amount || 0)) : 0;

  // Group by category for current period
  const categoryGroups = {};
  filteredExpenses.forEach(e => {
    const cat = e.category || 'Other';
    categoryGroups[cat] = (categoryGroups[cat] || 0) + (e.amount || 0);
  });
  const sortedCategories = Object.entries(categoryGroups).sort((a, b) => b[1] - a[1]);

  const getPeriodLabel = () => {
    if (mode === 'date') {
      const d = new Date(selectedDate);
      return isNaN(d.getTime()) ? selectedDate : d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (mode === 'month') {
      const monthLabel = months.find(m => m.value === selectedMonth)?.label || '';
      return `${monthLabel} ${selectedMonthYear}`;
    }
    if (mode === 'year') {
      return `Year ${selectedYear}`;
    }
    return '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Segmented Selector for Time Period */}
      <div className="glass-panel" style={{ padding: '8px', display: 'flex', gap: '8px', borderRadius: '12px' }}>
        {[
          { id: 'date', label: 'Particular Date' },
          { id: 'month', label: 'Monthly Tracker' },
          { id: 'year', label: 'Yearly Tracker' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: mode === t.id ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              color: mode === t.id ? '#ef4444' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.2s ease', flex: 1
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Dynamic Filters Form */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {mode === 'date' && (
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'block' }}>
              Select Date (Day, Month, and Year)
            </label>
            <input 
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                padding: '10px 14px', background: 'var(--bg-form)',
                border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'var(--text-main)',
                fontSize: '0.85rem', outline: 'none', width: '100%', maxWidth: '300px'
              }}
            />
          </div>
        )}

        {mode === 'month' && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'block' }}>
                Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={{
                  padding: '10px 14px', background: 'var(--bg-form)',
                  border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'var(--text-main)',
                  fontSize: '0.85rem', outline: 'none', width: '100%', cursor: 'pointer'
                }}
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'block' }}>
                Select Year
              </label>
              <select
                value={selectedMonthYear}
                onChange={e => setSelectedMonthYear(e.target.value)}
                style={{
                  padding: '10px 14px', background: 'var(--bg-form)',
                  border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'var(--text-main)',
                  fontSize: '0.85rem', outline: 'none', width: '100%', cursor: 'pointer'
                }}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {mode === 'year' && (
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'block' }}>
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={{
                padding: '10px 14px', background: 'var(--bg-form)',
                border: '1px solid var(--border-glass)', borderRadius: '10px', color: 'var(--text-main)',
                fontSize: '0.85rem', outline: 'none', width: '100%', maxWidth: '200px', cursor: 'pointer'
              }}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        {/* Total Spent */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Expenditure
          </span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            ₹{totalSpent.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Spent during {getPeriodLabel()}
          </p>
        </div>

        {/* Total Count */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Invoices Audited
          </span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', margin: 0 }}>
            {totalCount} Vouchers
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Vouchers approved/pending for this period
          </p>
        </div>

        {/* Averages & Peaks */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Average &amp; Peak Vouchers
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Avg: ₹{avgAmount.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b' }}>
              Max: ₹{maxAmount.toLocaleString()}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Statistical analysis of vouchers
          </p>
        </div>

      </div>

      {/* Main Analysis Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Category Breakdown Card */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
            Category Allocation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedCategories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No category allocations in this period.
              </div>
            ) : (
              sortedCategories.map(([cat, val]) => {
                const maxVal = Math.max(...Object.values(categoryGroups), 1);
                const percent = Math.round((val / maxVal) * 100);
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>₹{val.toLocaleString()}</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #b91c1c)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Transactions Table Card */}
        <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', overflow: 'hidden', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
            Voucher Listing ({getPeriodLabel()})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Title', 'Category', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No expenses recorded for this time period.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{exp.title}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.category}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#ef4444' }}>₹{exp.amount?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.date}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700,
                          background: exp.status === 'Approved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: exp.status === 'Approved' ? '#10b981' : '#f59e0b'
                        }}>{exp.status || 'Pending'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
