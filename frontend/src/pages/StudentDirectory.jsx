import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  FileText,
  MapPin,
  Download,
  Info,
  Edit3,
  Plus
} from 'lucide-react';



export default function StudentDirectory({ readOnly = true, onAddClick }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const hasValue = (val) => {
    if (val === undefined || val === null || val === '') return false;
    const lower = String(val).trim().toLowerCase();
    return lower !== 'n/a' && lower !== 'none' && lower !== 'null' && lower !== 'undefined';
  };
  const [totalCount, setTotalCount] = useState(0);
  
  // Search, Filters & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // Inspector States
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Edit Modal States
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditFormData({
      fullName: student.fullName || student.name || '',
      studentClass: student.studentClass || (student.grade ? student.grade.split('-')[0] : 'I'),
      section: student.section || '',
      rollNumber: student.rollNumber || student.roll || '',
      phone: student.phone || student.guardianContact || '',
      fatherName: student.fatherName || '',
      fatherMobile: student.fatherMobile || '',
      motherName: student.motherName || '',
      emergencyContactNumber: student.emergencyContactNumber || '',
      academicYear: student.academicYear || '2026-2027',
      status: student.status || 'Active'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const studentId = editingStudent.id;
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        setEditingStudent(null);
        fetchStudents();
        setSelectedStudent(null);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Server error occurred while updating student.');
      }
    } catch (err) {
      console.error('Error updating student:', err);
      alert('Network error updating student profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search: searchQuery,
        class: classFilter,
        section: sectionFilter,
        academicYear: yearFilter,
        status: 'All',
        sortBy,
        sortOrder,
        page,
        limit
      }).toString();
      
      const res = await fetch(`/api/students?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error loading students registry:', err);
    } finally {
      setLoading(false);
    }
  };



  // Reload students on search/filter/pagination triggers
  useEffect(() => {
    fetchStudents();
  }, [searchQuery, classFilter, sectionFilter, yearFilter, sortBy, sortOrder, page]);

  // Reset page index on filter change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, classFilter, sectionFilter, yearFilter]);

  // Delete Student Profile
  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to completely dismiss student ${studentName} (${studentId}) from the ERP registry?`)) {
      try {
        const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
        if (res.ok) {
          fetchStudents();
          setSelectedStudent(null);
        }
      } catch (err) {
        console.error('Error removing student record:', err);
      }
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const isSearchOrFilterActive = searchQuery !== '' || classFilter !== 'All' || sectionFilter !== 'All' || yearFilter !== 'All';

  if (!loading && totalCount === 0 && !isSearchOrFilterActive) {
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
            <User size={48} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>No students found</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Add your first student to get started with the School Management System.
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
              <Plus size={16} /> Register Student
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Search & Actions Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Row 1: Search & Filter indicators */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div className="search-bar-container" style={{ width: '100%', maxWidth: '380px' }}>
            <Search size={18} className="search-bar-icon" />
            <input 
              type="text" 
              placeholder="Search student, Registration ID, admission no..." 
              className="search-bar-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} /> Filters:
            </span>
            
            {/* Class filter */}
            <select 
              className="select-custom"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <option value="All">All Classes</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
              {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map(grade => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>

            {/* Academic Year Filter */}
            <select 
              className="select-custom"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <option value="All">All Years</option>
              {Array.from({ length: 2049 - 2026 + 1 }, (_, i) => {
                const s = 2026 + i;
                return `${s}-${s + 1}`;
              }).map(sy => (
                <option key={sy} value={sy}>{sy}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Row 2: Sort indices */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort By:</span>
            
            <select 
              className="select-custom"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem' }}
            >
              <option value="name">Student Name</option>
              <option value="id">Registration ID</option>
              <option value="admissionNumber">Admission Number</option>
              <option value="studentClass">Class/Grade</option>
              <option value="rollNumber">Roll No</option>
            </select>

            <button 
              onClick={toggleSortOrder}
              className="btn-secondary"
              style={{ padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
            >
              <ArrowUpDown size={14} /> {sortOrder.toUpperCase()}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Total Registrations: <strong style={{ color: 'var(--text-main)' }}>{totalCount}</strong>
            </span>

          </div>

        </div>

      </div>

      {/* Directory Roster Table Card */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Loading students database directory...
          </div>
        ) : (
          <>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Parent Contact</th>
                    <th>Admission Number</th>
                    <th>Academic Year</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((stu) => (
                      <tr key={stu.id}>
                        <td style={{ fontWeight: 700, color: 'hsl(var(--color-primary))' }}>{stu.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {stu.photo ? (
                              <img 
                                src={stu.photo} 
                                alt={stu.name} 
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                              />
                            ) : (
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: stu.photoBg || '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                {stu.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span style={{ fontWeight: 600 }}>{stu.name}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{stu.studentClass || (stu.grade && stu.grade.split('-')[0]) || 'Nursery'}</td>
                        <td style={{ fontWeight: 500 }}>{stu.section || '-'}</td>
                        <td style={{ fontWeight: 500 }}>{stu.phone || stu.guardianContact || 'N/A'}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{stu.admissionNumber || stu.id}</td>
                        <td style={{ fontWeight: 500 }}>{stu.academicYear || '2026-2027'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => setSelectedStudent(stu)}
                              className="btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Info size={12} /> Inspect
                            </button>
                            {!readOnly && (
                              <>
                                <button 
                                  onClick={() => openEditModal(stu)}
                                  className="btn-secondary" 
                                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Edit3 size={12} /> Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteStudent(stu.id, stu.name)}
                                  className="btn-danger" 
                                  style={{ padding: '6px 8px', borderRadius: '8px', background: 'rgba(var(--color-danger-rgb), 0.1)', border: '1px solid rgba(var(--color-danger-rgb), 0.2)', color: 'rgb(var(--color-danger-rgb))' }}
                                  title="Delete profile"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                        No registered students found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Showing Page <strong style={{ color: 'var(--text-main)' }}>{page}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong>
                </span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Inspect Student Profile Drawer */}
      {selectedStudent && createPortal(
        <div 
          onClick={() => setSelectedStudent(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', isolation: 'isolate', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-panel animate-scale-up"
            style={{
              width: '100%', maxWidth: '600px', maxHeight: '75vh',
              background: 'var(--bg-elevated)',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              overflowY: 'auto',
              borderRadius: '16px',
              minHeight: 0
            }}
          >
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Student Registry Inspector</h3>
              <button 
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
              {selectedStudent.photo ? (
                <img 
                  src={selectedStudent.photo} 
                  alt={selectedStudent.name} 
                  style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid hsl(var(--color-primary))', boxShadow: 'var(--shadow-md)' }}
                />
              ) : (
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: selectedStudent.photoBg || '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 800,
                  border: '3px solid hsl(var(--color-primary))'
                }}>
                  {selectedStudent.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>{selectedStudent.name}</h4>
                <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                  {selectedStudent.studentClass || selectedStudent.grade.split('-')[0] || 'Nursery'} Grade
                </span>
              </div>
            </div>

            {/* Profile specifications list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              
              {/* Section 1: Basic Information */}
              {(hasValue(selectedStudent.id) || 
                hasValue(selectedStudent.dob) || 
                hasValue(selectedStudent.gender) || 
                hasValue(selectedStudent.bloodGroup) || 
                hasValue(selectedStudent.nationality) || 
                hasValue(selectedStudent.category) || 
                hasValue(selectedStudent.religion) || 
                hasValue(selectedStudent.aadhaarNumber)) && (
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--color-primary))', marginBottom: '10px' }}>Basic Information</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {hasValue(selectedStudent.id) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registration ID</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.id}</strong>
                      </div>
                    )}
                    {(hasValue(selectedStudent.dob) || hasValue(selectedStudent.gender)) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DOB / Gender</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {[selectedStudent.dob, selectedStudent.gender].filter(hasValue).join(' / ')}
                        </strong>
                      </div>
                    )}
                    {(hasValue(selectedStudent.bloodGroup) || hasValue(selectedStudent.nationality)) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blood Group / Nationality</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {[selectedStudent.bloodGroup, selectedStudent.nationality].filter(hasValue).join(' / ')}
                        </strong>
                      </div>
                    )}
                    {(hasValue(selectedStudent.category) || hasValue(selectedStudent.religion)) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category / Religion</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {[selectedStudent.category, selectedStudent.religion].filter(hasValue).join(' / ')}
                        </strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.aadhaarNumber) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aadhaar Number</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.aadhaarNumber}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 2: Academic Details */}
              {(hasValue(selectedStudent.admissionNumber) || 
                hasValue(selectedStudent.admissionDate) || 
                hasValue(selectedStudent.admissionType) || 
                hasValue(selectedStudent.academicYear) || 
                hasValue(selectedStudent.status) || 
                hasValue(selectedStudent.previousSchoolName) || 
                hasValue(selectedStudent.previousSchoolAddress) || 
                hasValue(selectedStudent.previousClassStudied) || 
                hasValue(selectedStudent.transferCertificateNumber)) && (
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--color-info))', marginBottom: '10px' }}>Academic Details</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {hasValue(selectedStudent.admissionNumber) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admission Number</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.admissionNumber}</strong>
                      </div>
                    )}
                    {(hasValue(selectedStudent.admissionDate) || hasValue(selectedStudent.admissionType)) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admission Date / Type</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {[selectedStudent.admissionDate, selectedStudent.admissionType].filter(hasValue).join(' / ')}
                        </strong>
                      </div>
                    )}
                    {(hasValue(selectedStudent.academicYear) || hasValue(selectedStudent.status)) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Academic Year / Status</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {[selectedStudent.academicYear, selectedStudent.status].filter(hasValue).join(' / ')}
                        </strong>
                      </div>
                    )}
                    {(hasValue(selectedStudent.previousSchoolName) || hasValue(selectedStudent.previousSchoolAddress)) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Previous School Name / Address</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {[selectedStudent.previousSchoolName, selectedStudent.previousSchoolAddress].filter(hasValue).join(' - ')}
                        </strong>
                      </div>
                    )}
                    {(hasValue(selectedStudent.previousClassStudied) || hasValue(selectedStudent.transferCertificateNumber)) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Previous Class / TC Number</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {[selectedStudent.previousClassStudied, selectedStudent.transferCertificateNumber].filter(hasValue).join(' / ')}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 3: Parent & Guardian Details */}
              {(hasValue(selectedStudent.fatherName) || 
                hasValue(selectedStudent.fatherEmail) || 
                hasValue(selectedStudent.motherName) || 
                hasValue(selectedStudent.motherEmail) || 
                hasValue(selectedStudent.guardianName)) && (
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--color-secondary))', marginBottom: '10px' }}>Parent & Guardian Details</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {hasValue(selectedStudent.fatherName) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Father Details</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {selectedStudent.fatherName}
                          {hasValue(selectedStudent.fatherMobile) && ` (${selectedStudent.fatherMobile})`}
                          {hasValue(selectedStudent.fatherOccupation) && ` - ${selectedStudent.fatherOccupation}`}
                        </strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.fatherEmail) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Father Email</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.fatherEmail}</strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.motherName) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mother Details</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {selectedStudent.motherName}
                          {hasValue(selectedStudent.motherMobile) && ` (${selectedStudent.motherMobile})`}
                          {hasValue(selectedStudent.motherOccupation) && ` - ${selectedStudent.motherOccupation}`}
                        </strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.motherEmail) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mother Email</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.motherEmail}</strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.guardianName) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Guardian Details</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {selectedStudent.guardianName}
                          {hasValue(selectedStudent.guardianRelation) && ` (${selectedStudent.guardianRelation})`}
                          {hasValue(selectedStudent.guardianContact) && `: ${selectedStudent.guardianContact}`}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 4: Contact & Address */}
              {(hasValue(selectedStudent.currentAddress) || 
                hasValue(selectedStudent.permanentAddress) || 
                hasValue(selectedStudent.city) || 
                hasValue(selectedStudent.state) || 
                hasValue(selectedStudent.postalCode) || 
                hasValue(selectedStudent.pincode) || 
                hasValue(selectedStudent.emergencyContactNumber)) && (
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgb(16, 185, 129)', marginBottom: '10px' }}>Contact & Address</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {hasValue(selectedStudent.permanentAddress) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Permanent Address</span>
                        <strong style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{selectedStudent.permanentAddress}</strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.currentAddress) && !selectedStudent.isSameAddress && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Address</span>
                        <strong style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{selectedStudent.currentAddress}</strong>
                      </div>
                    )}
                    {selectedStudent.isSameAddress && hasValue(selectedStudent.permanentAddress) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Address</span>
                        <strong style={{ fontSize: '0.85rem' }}>Same as Permanent Address</strong>
                      </div>
                    )}
                    {(hasValue(selectedStudent.city) || hasValue(selectedStudent.state) || hasValue(selectedStudent.postalCode) || hasValue(selectedStudent.pincode)) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>City / State / Postal Code</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {[selectedStudent.city, selectedStudent.state, selectedStudent.postalCode || selectedStudent.pincode].filter(hasValue).join(' / ')}
                        </strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.emergencyContactNumber) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Emergency Contact Number</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.emergencyContactNumber}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 5: Medical Profile */}
              {(hasValue(selectedStudent.medicalConditions) || 
                hasValue(selectedStudent.allergies) || 
                hasValue(selectedStudent.disabilities) || 
                hasValue(selectedStudent.emergencyNotes) || 
                hasValue(selectedStudent.doctorName) || 
                hasValue(selectedStudent.doctorContact)) && (
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--color-danger))', marginBottom: '10px' }}>Medical Profile</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {hasValue(selectedStudent.medicalConditions) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Conditions / Chronic Illnesses</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.medicalConditions}</strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.allergies) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Allergies</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.allergies}</strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.disabilities) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Disabilities or SEN Needs</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.disabilities}</strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.emergencyNotes) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Emergency Notes</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.emergencyNotes}</strong>
                      </div>
                    )}
                    {(hasValue(selectedStudent.doctorName) || hasValue(selectedStudent.doctorContact)) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Family Doctor</span>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {[selectedStudent.doctorName, selectedStudent.doctorContact].filter(hasValue).join(' - ')}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 6: Transport & Hostel */}
              {(hasValue(selectedStudent.transportRequired) || hasValue(selectedStudent.hostelRequired)) && (
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgb(245, 158, 11)', marginBottom: '10px' }}>Transport & Hostel</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {hasValue(selectedStudent.transportRequired) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Require Transport Service</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.transportRequired}</strong>
                      </div>
                    )}
                    {hasValue(selectedStudent.hostelRequired) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Require Hostel Accommodation</span>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.hostelRequired}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Document upload previews sheet */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Verified Documents</span>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                
                {/* Aadhaar */}
                {hasValue(selectedStudent.aadhaarFile) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={12} style={{ color: 'hsl(var(--color-primary))' }} /> Aadhaar Card
                    </span>
                    <a href={selectedStudent.aadhaarFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', textAlign: 'center' }}>
                      Get Doc
                    </a>
                  </div>
                )}

                {/* Birth Cert */}
                {hasValue(selectedStudent.birthCertificateFile) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={12} style={{ color: 'hsl(var(--color-secondary))' }} /> Birth Cert
                    </span>
                    <a href={selectedStudent.birthCertificateFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', textAlign: 'center' }}>
                      Get Doc
                    </a>
                  </div>
                )}

                {/* Marksheet */}
                {hasValue(selectedStudent.marksheetFile) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={12} style={{ color: 'hsl(var(--color-info))' }} /> Marksheet
                    </span>
                    <a href={selectedStudent.marksheetFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', textAlign: 'center' }}>
                      Get Doc
                    </a>
                  </div>
                )}

                {/* TC */}
                {hasValue(selectedStudent.transferCertificateFile) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={12} style={{ color: 'rgb(var(--color-warning-rgb))' }} /> Transfer Cert
                    </span>
                    <a href={selectedStudent.transferCertificateFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', textAlign: 'center' }}>
                      Get Doc
                    </a>
                  </div>
                )}

                {/* Address Proof */}
                {hasValue(selectedStudent.addressProofFile) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={12} style={{ color: 'rgb(16, 185, 129)' }} /> Address Proof
                    </span>
                    <a href={selectedStudent.addressProofFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', textAlign: 'center' }}>
                      Get Doc
                    </a>
                  </div>
                )}

                {/* Medical Cert */}
                {hasValue(selectedStudent.medicalCertificateFile) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={12} style={{ color: 'hsl(var(--color-danger))' }} /> Medical Cert
                    </span>
                    <a href={selectedStudent.medicalCertificateFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', textAlign: 'center' }}>
                      Get Doc
                    </a>
                  </div>
                )}

                {/* Additional Docs */}
                {hasValue(selectedStudent.additionalFile) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={12} style={{ color: 'rgb(245, 158, 11)' }} /> Additional Docs
                    </span>
                    <a href={selectedStudent.additionalFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 6px', fontSize: '0.65rem', borderRadius: '6px', textAlign: 'center' }}>
                      Get Doc
                    </a>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>, document.body)}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div onClick={() => setEditingStudent(null)} className="modal-overlay">
          <div onClick={(e) => e.stopPropagation()} className="glass-panel animate-scale-up"
            style={{
              width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto',
              padding: '30px', borderRadius: '20px', background: 'var(--bg-elevated)',
              boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} style={{ color: 'hsl(var(--color-primary))' }} /> Edit Student Profile
              </h3>
              <button onClick={() => setEditingStudent(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={editFormData.fullName || ''} onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }} required />
                </div>

                <div className="form-group">
                  <label>Roll Number</label>
                  <input type="text" value={editFormData.rollNumber || ''} onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }} />
                </div>

                <div className="form-group">
                  <label>Class/Grade</label>
                  <select value={editFormData.studentClass || ''} onChange={(e) => setEditFormData({ ...editFormData, studentClass: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map(grade => (
                      <option key={grade} value={grade}>Class {grade}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Section</label>
                  <select value={editFormData.section || ''} onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                    <option value="">-</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Academic Session</label>
                  <select value={editFormData.academicYear || ''} onChange={(e) => setEditFormData({ ...editFormData, academicYear: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                    {Array.from({ length: 2049 - 2026 + 1 }, (_, i) => {
                      const s = 2026 + i;
                      return `${s}-${s + 1}`;
                    }).map(sy => (
                      <option key={sy} value={sy}>{sy}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select value={editFormData.status || ''} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Father's Name</label>
                  <input type="text" value={editFormData.fatherName || ''} onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }} />
                </div>

                <div className="form-group">
                  <label>Father's Mobile</label>
                  <input type="text" value={editFormData.fatherMobile || ''} onChange={(e) => setEditFormData({ ...editFormData, fatherMobile: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }} />
                </div>

                <div className="form-group">
                  <label>Mother's Name</label>
                  <input type="text" value={editFormData.motherName || ''} onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }} />
                </div>

                <div className="form-group">
                  <label>Primary Phone</label>
                  <input type="text" value={editFormData.phone || ''} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="form-control" style={{ padding: '10px 14px', borderRadius: '10px' }} />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingStudent(null)} className="btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={editLoading}
                  style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {editLoading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
