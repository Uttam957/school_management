import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mail, 
  Trash2,
  UserCog,
  Plus
} from 'lucide-react';

export default function StaffDirectory({ readOnly = true, onAddClick }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error('Error loading staff roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to dismiss this staff member from the roster?')) {
      try {
        const res = await fetch(`/api/staff/${staffId}`, { method: 'DELETE' });
        if (res.ok) {
          setStaffList(staffList.filter(s => s.id !== staffId));
        }
      } catch (err) {
        console.error('Error removing staff member:', err);
      }
    }
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const isSearchOrFilterActive = searchQuery !== '' || roleFilter !== 'All';

  if (!loading && staffList.length === 0 && !isSearchOrFilterActive) {
    return (
      <div className="animate-slide-up" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '80px 24px', 
        textAlign: 'center',
        gap: '24px',
        width: '100%'
      }}>
        <div className="glass-panel" style={{
          padding: '48px 32px',
          maxWidth: '500px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '50%',
            background: 'rgba(hsl(var(--color-primary)), 0.1)',
            color: 'hsl(var(--color-primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCog size={48} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>No staff members found</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Add your first staff member to get started with the School Management System.
            </p>
          </div>
          {!readOnly && onAddClick && (
            <button 
              onClick={onAddClick}
              className="btn-primary"
              style={{ 
                padding: '12px 24px', 
                borderRadius: '12px', 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Add Staff Member
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search and Action Header */}
      <div className="glass-panel directory-actions" style={{ padding: '16px 24px' }}>
        <div className="search-bar-container" style={{ width: '100%', maxWidth: '360px' }}>
          <Search size={18} className="search-bar-icon" />
          <input 
            type="text" 
            placeholder="Search by staff name or role..." 
            className="search-bar-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div className="filter-group">
          <select 
            className="select-custom"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Administrative Officer">Administration</option>
            <option value="Registrar Officer">Registrar</option>
            <option value="Librarian Keeper">Librarian</option>
            <option value="IT System Analyst">IT Support</option>
            <option value="Security Commander">Security</option>
            <option value="Facilities Specialist">Facilities</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Staff Member</th>
                <th>Designation Role</th>
                <th>Department</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: s.avatarBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          {s.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td>{s.role}</td>
                    <td>{s.department}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>
                      <span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a 
                          href={`mailto:${s.email}`}
                          className="btn-secondary" 
                          style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px' }}
                          title="Mail Support"
                        >
                          <Mail size={12} />
                        </a>
                        {!readOnly && (
                          <button 
                            onClick={() => handleDeleteStaff(s.id)}
                            className="btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px', borderColor: 'rgb(var(--color-danger-rgb))', color: 'rgb(var(--color-danger-rgb))' }}
                            title="Dismiss Staff"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No support staff found in the directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
