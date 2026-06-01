import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
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
  Info
} from 'lucide-react';

export default function StudentDirectory({ readOnly = true }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search: searchQuery,
        class: classFilter,
        section: sectionFilter,
        academicYear: yearFilter,
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
              <option value="Nursery">Nursery</option>
              <option value="KG">KG</option>
              {Array.from({ length: 12 }, (_, i) => `${i + 1}`).map(num => (
                <option key={num} value={num === '1' ? '1st' : (num === '2' ? '2nd' : (num === '3' ? '3rd' : `${num}th`))}>
                  Grade {num === '1' ? '1st' : (num === '2' ? '2nd' : (num === '3' ? '3rd' : `${num}th`))}
                </option>
              ))}
            </select>

            {/* Section filter */}
            <select 
              className="select-custom"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>

            {/* Academic Year Filter */}
            <select 
              className="select-custom"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <option value="All">All Years</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
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

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Total Registrations: <strong style={{ color: 'var(--text-main)' }}>{totalCount}</strong>
          </span>

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
                        <td style={{ fontWeight: 500 }}>{stu.studentClass || stu.grade.split('-')[0] || 'Nursery'}</td>
                        <td style={{ fontWeight: 500 }}>{stu.section || stu.grade.split('-')[1] || 'A'}</td>
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
                              <button 
                                onClick={() => handleDeleteStudent(stu.id, stu.name)}
                                className="btn-danger" 
                                style={{ padding: '6px 8px', borderRadius: '8px', background: 'rgba(var(--color-danger-rgb), 0.1)', border: '1px solid rgba(var(--color-danger-rgb), 0.2)', color: 'rgb(var(--color-danger-rgb))' }}
                                title="Delete profile"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
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
      {selectedStudent && (
        <div 
          onClick={() => setSelectedStudent(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '460px',
              height: '100vh',
              borderRadius: '24px 0 0 24px',
              borderLeft: '1px solid var(--border-glass)',
              background: 'var(--bg-sidebar)',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              zIndex: 1000,
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)'
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
                  {selectedStudent.studentClass || selectedStudent.grade.split('-')[0] || 'Nursery'} Grade (Sec {selectedStudent.section || selectedStudent.grade.split('-')[1] || 'A'})
                </span>
              </div>
            </div>

            {/* Profile specifications list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registration ID</span>
                <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.id}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admission Number</span>
                <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.admissionNumber || 'N/A'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Academic Year</span>
                <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.academicYear || '2026-2027'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DOB / Gender</span>
                <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.dob || 'N/A'} / {selectedStudent.gender || 'N/A'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Father / Mother</span>
                <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.fatherName || 'N/A'} / {selectedStudent.motherName || 'N/A'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Parent Mobile</span>
                <strong style={{ fontSize: '0.85rem' }}>{selectedStudent.phone || selectedStudent.guardianContact || 'N/A'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Previous School</span>
                <strong style={{ fontSize: '0.85rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedStudent.previousSchool || 'N/A'}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Residential Address</span>
                <strong style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{selectedStudent.address || 'N/A'}, {selectedStudent.city || ''}, {selectedStudent.state || ''} {selectedStudent.pincode || ''}</strong>
              </div>

            </div>

            {/* Document upload previews sheet */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Verified Documents</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Aadhaar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <FileText size={14} style={{ color: 'hsl(var(--color-primary))' }} /> Aadhaar Card
                  </span>
                  {selectedStudent.aadhaarFile ? (
                    <a href={selectedStudent.aadhaarFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Download size={10} /> Get Document
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Not Uploaded</span>
                  )}
                </div>

                {/* Birth Cert */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <FileText size={14} style={{ color: 'hsl(var(--color-secondary))' }} /> Birth Certificate
                  </span>
                  {selectedStudent.birthCertificateFile ? (
                    <a href={selectedStudent.birthCertificateFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Download size={10} /> Get Document
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Not Uploaded</span>
                  )}
                </div>

                {/* Marksheet */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <FileText size={14} style={{ color: 'hsl(var(--color-info))' }} /> Marksheet Card
                  </span>
                  {selectedStudent.marksheetFile ? (
                    <a href={selectedStudent.marksheetFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Download size={10} /> Get Document
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Not Uploaded</span>
                  )}
                </div>

                {/* TC */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <FileText size={14} style={{ color: 'rgb(var(--color-warning-rgb))' }} /> Transfer Cert (TC)
                  </span>
                  {selectedStudent.transferCertificateFile ? (
                    <a href={selectedStudent.transferCertificateFile} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Download size={10} /> Get Document
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Not Uploaded</span>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
