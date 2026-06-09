import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Mail, 
  Trash2,
  UserCog,
  Plus,
  Eye,
  X,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Clock,
  Edit3,
  ChevronDown,
  User,
  FileText,
  CheckCircle
} from 'lucide-react';

const STAFF_CATEGORIES = [
  'All', 'Accountant', 'Receptionist', 'Librarian', 'Lab Assistant', 'Transport Manager',
  'Driver', 'Nurse', 'Security Guard', 'IT Support', 'Maintenance Staff',
  'Housekeeping Staff', 'Office Assistant', 'Peon', 'Counselor', 'Other'
];

export default function StaffDirectory({ readOnly = true, onAddClick }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [inspectStaff, setInspectStaff] = useState(null);
  const [editStaff, setEditStaff] = useState(null);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

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

  useEffect(() => { fetchStaff(); }, []);

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to dismiss this staff member?')) {
      try {
        const res = await fetch(`/api/staff/${staffId}`, { method: 'DELETE' });
        if (res.ok) {
          setStaffList(staffList.filter(s => s.id !== staffId));
          if (inspectStaff?.id === staffId) setInspectStaff(null);
        }
      } catch (err) {
        console.error('Error removing staff:', err);
      }
    }
  };

  const openEdit = (staff) => {
    setEditStaff(staff);
    setEditData({ ...staff });
    setEditSuccess(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/staff/${editStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        const updated = await res.json();
        setStaffList(prev => prev.map(s => s.id === updated.id ? updated : s));
        if (inspectStaff?.id === updated.id) setInspectStaff(updated);
        setEditSuccess(true);
        setTimeout(() => { setEditStaff(null); setEditSuccess(false); }, 1200);
      } else {
        alert('Failed to update staff.');
      }
    } catch (err) {
      console.error('Error updating staff:', err);
      alert('Server error.');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredStaff = staffList.filter(s => {
    const name = (s.fullName || s.name || '').toLowerCase();
    const role = (s.staffCategory || s.role || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || role.includes(q) || id.includes(q);
    const matchesCategory = categoryFilter === 'All' || (s.staffCategory || s.role || '') === categoryFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Safe JSON parse for qualifications/experiences
  const parseJSON = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
    return [];
  };

  // ============================================================
  // EMPTY STATE
  // ============================================================
  if (!loading && staffList.length === 0) {
    return (
      <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', gap: '24px', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '48px 32px', maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(hsl(var(--color-primary)), 0.1)', color: 'hsl(var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCog size={48} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>No staff members found</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>Add your first staff member to get started.</p>
          </div>
          {!readOnly && onAddClick && (
            <button onClick={onAddClick} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <Plus size={16} /> Add Staff Member
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // INSPECT DRAWER
  // ============================================================
  const renderInspectDrawer = () => {
    if (!inspectStaff) return null;
    const s = inspectStaff;
    const qualArr = parseJSON(s.qualification);
    const expArr = parseJSON(s.experiences);
    const fullName = s.fullName || s.name || '—';

    return createPortal(
      <div onClick={() => setInspectStaff(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', isolation: 'isolate', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
        <div onClick={(e) => e.stopPropagation()} className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '75vh', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', background: '#ffffff' }}>
          {/* Header */}
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye size={18} style={{ color: 'hsl(var(--color-primary))' }} /> Staff Profile
            </h3>
            <button onClick={() => setInspectStaff(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}><X size={20} /></button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0 }}>
            {/* Profile Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '14px', background: s.avatarBg || 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.3rem', overflow: 'hidden', flexShrink: 0 }}>
                {s.photo ? <img src={s.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (fullName.split(' ').map(n => n[0]).join('').slice(0, 2))}
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>{fullName}</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.staffCategory || s.role || '—'} • {s.department || '—'}</p>
                <span className={`badge ${s.status === 'Active' ? 'badge-success' : s.status === 'On Leave' ? 'badge-warning' : 'badge-danger'}`} style={{ marginTop: '6px', display: 'inline-block' }}>{s.status || 'Active'}</span>
              </div>
            </div>

            {/* Info Sections */}
            {renderInfoSection('Basic Information', User, 'hsl(var(--color-primary))', [
              { label: 'Staff ID', value: s.id },
              { label: 'Gender', value: s.gender },
              { label: 'Date of Birth', value: s.dob },
              { label: 'Blood Group', value: s.bloodGroup },
              { label: 'Nationality', value: s.nationality },
              { label: 'Marital Status', value: s.maritalStatus },
              { label: 'Aadhaar', value: s.aadhaarNumber },
              { label: 'PAN', value: s.panNumber }
            ])}

            {renderInfoSection('Employment', Briefcase, 'hsl(var(--color-secondary))', [
              { label: 'Category', value: s.staffCategory || s.role },
              { label: 'Designation', value: s.designation },
              { label: 'Department', value: s.department },
              { label: 'Employment Type', value: s.employmentType },
              { label: 'Joining Date', value: s.joiningDate || s.dateOfJoining },
              { label: 'Status', value: s.employeeStatus || s.status }
            ])}

            {renderInfoSection('Contact', Phone, 'hsl(210, 90%, 55%)', [
              { label: 'Mobile', value: s.mobile || s.phone },
              { label: 'Alternate', value: s.alternateMobile },
              { label: 'Email', value: s.email },
              { label: 'Emergency', value: s.emergencyContactNumber || s.emergencyPhone }
            ])}

            {renderInfoSection('Current Address', MapPin, 'rgb(var(--color-success-rgb))', [
              { label: 'Address', value: s.currentAddress || s.address },
              { label: 'City', value: s.currentCity || s.city },
              { label: 'State', value: s.currentState || s.state },
              { label: 'Postal Code', value: s.currentPostalCode || s.pincode }
            ])}

            {s.permanentAddress && renderInfoSection('Permanent Address', MapPin, 'hsl(280, 80%, 55%)', [
              { label: 'Address', value: s.permanentAddress },
              { label: 'City', value: s.permanentCity },
              { label: 'State', value: s.permanentState },
              { label: 'Postal Code', value: s.permanentPostalCode }
            ])}

            {/* Qualifications */}
            {qualArr.length > 0 && qualArr.some(q => q.degree) && (
              <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid hsl(280, 80%, 55%)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 10px 0', color: 'hsl(280, 80%, 55%)', display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={14} /> Qualifications</h4>
                {qualArr.filter(q => q.degree).map((q, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: i < qualArr.length - 1 ? '1px solid var(--border-glass)' : 'none', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 600 }}>{q.degree}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{[q.institution, q.boardUniversity, q.year].filter(Boolean).join(' • ')}{q.percentage ? ` — ${q.percentage}` : ''}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Experiences */}
            {expArr.length > 0 && expArr.some(e => e.organization) && (
              <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid rgb(var(--color-warning-rgb))' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 10px 0', color: 'rgb(var(--color-warning-rgb))', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={14} /> Experience</h4>
                {expArr.filter(e => e.organization).map((exp, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: i < expArr.length - 1 ? '1px solid var(--border-glass)' : 'none', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 600 }}>{exp.designation || 'Staff'} at {exp.organization}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{[exp.fromDate, exp.toDate].filter(Boolean).join(' → ')}</div>
                    {exp.responsibilities && <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{exp.responsibilities}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>, document.body);
  };

  // Info Section helper
  const renderInfoSection = (title, Icon, color, fields) => (
    <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${color}` }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 10px 0', color, display: 'flex', alignItems: 'center', gap: '8px' }}><Icon size={14} /> {title}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 16px', fontSize: '0.82rem' }}>
        {fields.map((f, i) => (
          <div key={i}><strong>{f.label}:</strong> {f.value || '—'}</div>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // EDIT MODAL
  // ============================================================
  const renderEditModal = () => {
    if (!editStaff) return null;
    const inputStyle = { padding: '10px 14px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' };
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={() => setEditStaff(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
        <div className="glass-panel" style={{ position: 'relative', width: '600px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', padding: '28px', borderRadius: '16px' }}>
          {editSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 0' }}>
              <CheckCircle size={48} style={{ color: 'rgb(var(--color-success-rgb))' }} />
              <h3 style={{ margin: 0, fontWeight: 700 }}>Staff Updated!</h3>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Edit3 size={18} style={{ color: 'hsl(var(--color-primary))' }} /> Edit Staff Profile
                </h3>
                <button onClick={() => setEditStaff(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Full Name</label>
                  <input type="text" name="fullName" value={editData.fullName || editData.name || ''} onChange={(e) => setEditData(p => ({ ...p, fullName: e.target.value, name: e.target.value }))} className="form-control" style={inputStyle} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Staff Category</label>
                  <select name="staffCategory" value={editData.staffCategory || editData.role || ''} onChange={(e) => setEditData(p => ({ ...p, staffCategory: e.target.value, role: e.target.value }))} className="form-control" style={inputStyle}>
                    <option value="">Select</option>
                    {['Accountant', 'Receptionist', 'Librarian', 'Lab Assistant', 'Transport Manager', 'Driver', 'Nurse', 'Security Guard', 'IT Support', 'Maintenance Staff', 'Housekeeping Staff', 'Office Assistant', 'Peon', 'Counselor', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Department</label>
                  <select name="department" value={editData.department || ''} onChange={handleEditChange} className="form-control" style={inputStyle}>
                    <option value="">Select</option>
                    {['Administration', 'Accounts & Finance', 'Library', 'IT & Technology', 'Transport', 'Security', 'Housekeeping', 'Maintenance', 'Health & Wellness', 'Front Office', 'Laboratory', 'Counseling', 'Store & Inventory', 'Other'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email</label>
                  <input type="email" name="email" value={editData.email || ''} onChange={handleEditChange} className="form-control" style={inputStyle} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Mobile</label>
                  <input type="text" name="mobile" value={editData.mobile || editData.phone || ''} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 10); setEditData(p => ({ ...p, mobile: v, phone: v })); }} className="form-control" style={inputStyle} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status</label>
                  <select name="status" value={editData.status || 'Active'} onChange={handleEditChange} className="form-control" style={inputStyle}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Designation</label>
                  <input type="text" name="designation" value={editData.designation || ''} onChange={handleEditChange} className="form-control" style={inputStyle} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Employment Type</label>
                  <select name="employmentType" value={editData.employmentType || ''} onChange={handleEditChange} className="form-control" style={inputStyle}>
                    <option value="">Select</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={() => setEditStaff(null)} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleEditSave} className="btn-primary" disabled={editLoading} style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {editLoading ? 'Saving...' : <><CheckCircle size={14} /> Save Changes</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Search & Filter Bar */}
      <div className="glass-panel directory-actions" style={{ padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div className="search-bar-container" style={{ width: '100%', maxWidth: '360px' }}>
          <Search size={18} className="search-bar-icon" />
          <input 
            type="text" 
            placeholder="Search by name, role, or ID..." 
            className="search-bar-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div className="filter-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select className="select-custom" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {STAFF_CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select className="select-custom" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {!readOnly && onAddClick && (
          <button onClick={onAddClick} className="btn-primary" style={{ padding: '10px 18px', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: 'auto', fontSize: '0.85rem' }}>
            <Plus size={14} /> Add Staff
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Staff', value: staffList.length, color: 'hsl(var(--color-primary))' },
          { label: 'Active', value: staffList.filter(s => s.status === 'Active').length, color: 'rgb(var(--color-success-rgb))' },
          { label: 'On Leave', value: staffList.filter(s => s.status === 'On Leave').length, color: 'rgb(var(--color-warning-rgb))' },
          { label: 'Inactive', value: staffList.filter(s => s.status === 'Inactive').length, color: 'rgb(var(--color-danger-rgb))' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '14px 18px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Directory Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Staff Member</th>
                <th>Category</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{s.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: s.avatarBg || 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden', flexShrink: 0
                        }}>
                          {s.photo ? <img src={s.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ((s.fullName || s.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2))}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.fullName || s.name}</span>
                          {s.designation && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.designation}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '0.82rem' }}>{s.staffCategory || s.role || '—'}</span></td>
                    <td><span style={{ fontSize: '0.82rem' }}>{s.department || '—'}</span></td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div>{s.mobile || s.phone || '—'}</div>
                        {s.email && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.email}</div>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'Active' ? 'badge-success' : s.status === 'On Leave' ? 'badge-warning' : 'badge-danger'}`}>
                        {s.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setInspectStaff(s)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px' }} title="Inspect">
                          <Eye size={13} />
                        </button>
                        {!readOnly && (
                          <>
                            <button onClick={() => openEdit(s)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px' }} title="Edit">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => handleDeleteStaff(s.id)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px', borderColor: 'rgb(var(--color-danger-rgb))', color: 'rgb(var(--color-danger-rgb))' }} title="Dismiss">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No staff members match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Drawer */}
      {renderInspectDrawer()}

      {/* Edit Modal */}
      {renderEditModal()}
    </div>
  );
}
