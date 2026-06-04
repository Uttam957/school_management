import React, { useState } from 'react';
import { 
  User, 
  Users, 
  MapPin, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Save, 
  Loader2,
  FileText
} from 'lucide-react';

export default function RegisterStudent({ setActiveView }) {
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dob: '',
    bloodGroup: '',
    fatherName: '',
    fatherMobile: '',
    motherName: '',
    motherMobile: '',
    guardianName: '',
    guardianRelation: '',
    guardianContact: '',
    admissionNumber: '',
    rollNumber: '',
    studentClass: '',
    grade: '',
    section: '',
    admissionDate: '',
    academicYear: '2026-2027',
    previousSchool: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // File Upload State (for preview & API submissions)
  const [files, setFiles] = useState({
    photo: null,
    aadhaarFile: null,
    birthCertificateFile: null,
    marksheetFile: null,
    transferCertificateFile: null
  });

  const [filePreviews, setFilePreviews] = useState({
    photo: '',
    aadhaarFile: '',
    birthCertificateFile: '',
    marksheetFile: '',
    transferCertificateFile: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Strict Numeric real-time filters
  const handleMobileChange = (e) => {
    const { name, value } = e.target;
    const cleanNum = value.replace(/[^0-9]/g, '').slice(0, 10); // Capped at 10 digits
    setFormData({
      ...formData,
      [name]: cleanNum
    });
  };

  const handlePincodeChange = (e) => {
    const { value } = e.target;
    const cleanPin = value.replace(/[^0-9]/g, '').slice(0, 6); // Capped at 6 digits
    setFormData({
      ...formData,
      pincode: cleanPin
    });
  };

  const handleTextChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Safe file loader & previewer with validation checks
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`File size exceeds 5MB limit. Please upload a smaller document.`);
      return;
    }

    // Check allowed types
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      alert(`Invalid file format. Standard images (JPG, PNG) and PDFs only.`);
      return;
    }

    setFiles({
      ...files,
      [fieldName]: file
    });

    // Create dynamic previews
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({
          ...prev,
          [fieldName]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      // Mock icon preview for PDF
      setFilePreviews(prev => ({
        ...prev,
        [fieldName]: 'pdf_icon'
      }));
    }
  };

  const removeFile = (fieldName) => {
    setFiles({
      ...files,
      [fieldName]: null
    });
    setFilePreviews({
      ...filePreviews,
      [fieldName]: ''
    });
    // Clear the input DOM element if present
    const inputEl = document.getElementById(fieldName);
    if (inputEl) inputEl.value = '';
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      gender: '',
      dob: '',
      bloodGroup: '',
      fatherName: '',
      fatherMobile: '',
      motherName: '',
      motherMobile: '',
      guardianName: '',
      guardianRelation: '',
      guardianContact: '',
      admissionNumber: '',
      rollNumber: '',
      studentClass: '',
      grade: '',
      section: '',
      admissionDate: '',
      academicYear: '2026-2027',
      previousSchool: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
    setFiles({
      photo: null,
      aadhaarFile: null,
      birthCertificateFile: null,
      marksheetFile: null,
      transferCertificateFile: null
    });
    setFilePreviews({
      photo: '',
      aadhaarFile: '',
      birthCertificateFile: '',
      marksheetFile: '',
      transferCertificateFile: ''
    });
    setFormErrors({});
    setFormSubmitted(false);
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields check
    const requiredFields = {
      fullName: 'Student Full Name',
      gender: 'Gender',
      dob: 'Date of Birth',
      fatherName: 'Father Name',
      fatherMobile: 'Father Mobile Number',
      motherName: 'Mother Name',
      motherMobile: 'Mother Mobile Number',
      rollNumber: 'Roll Number',
      studentClass: 'Class',
      grade: 'Grade/Division',
      admissionDate: 'Admission Date',
      address: 'Full Address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode'
    };

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field].trim()) {
        errors[field] = `${requiredFields[field]} is required.`;
      }
    });

    // Length check validations
    if (formData.fatherMobile && formData.fatherMobile.length !== 10) {
      errors.fatherMobile = 'Father Mobile must be exactly 10 digits.';
    }
    if (formData.motherMobile && formData.motherMobile.length !== 10) {
      errors.motherMobile = 'Mother Mobile must be exactly 10 digits.';
    }
    if (formData.pincode && formData.pincode.length !== 6) {
      errors.pincode = 'Pincode must be exactly 6 digits.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorEl = document.querySelector('.input-invalid');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      // Assemble standard Multipart form data
      const dataObj = new FormData();
      Object.keys(formData).forEach(key => {
        dataObj.append(key, formData[key]);
      });

      // Append verified file streams
      if (files.photo) dataObj.append('photo', files.photo);
      if (files.aadhaarFile) dataObj.append('aadhaarFile', files.aadhaarFile);
      if (files.birthCertificateFile) dataObj.append('birthCertificateFile', files.birthCertificateFile);
      if (files.marksheetFile) dataObj.append('marksheetFile', files.marksheetFile);
      if (files.transferCertificateFile) dataObj.append('transferCertificateFile', files.transferCertificateFile);

      const res = await fetch('/api/students', {
        method: 'POST',
        body: dataObj // Let browser define multipart boundary headers
      });

      if (res.ok) {
        setSuccessToast(true);
        resetForm();
        setTimeout(() => setSuccessToast(false), 5000);
        // Automatically redirect to students list view
        setTimeout(() => setActiveView('students'), 1500);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Server error occurred during student registration.');
      }
    } catch (err) {
      console.error('Error submitting student details:', err);
      alert('Internal Server error connecting to the API registry.');
    } finally {
      setLoading(false);
    }
  };

  // Helper validation color toggles (Green for Valid, Red for Invalid)
  const getInputClass = (fieldName) => {
    if (!formSubmitted) return 'form-control';
    return formErrors[fieldName] ? 'form-control input-invalid' : 'form-control input-valid';
  };

  const getInputStyle = (fieldName) => {
    const isError = formErrors[fieldName];
    if (!formSubmitted) return { padding: '12px 16px', borderRadius: '10px' };
    
    return {
      padding: '12px 16px',
      borderRadius: '10px',
      borderColor: isError ? 'rgb(var(--color-danger-rgb))' : 'rgb(var(--color-success-rgb))',
      boxShadow: isError ? '0 0 0 3px rgba(var(--color-danger-rgb), 0.15)' : '0 0 0 3px rgba(var(--color-success-rgb), 0.15)'
    };
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {successToast && (
        <div className="glass-panel" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          background: 'rgba(var(--color-success-rgb), 0.95)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          animation: 'slide-up 0.3s ease'
        }}>
          <CheckCircle size={24} />
          <div>
            <strong style={{ display: 'block' }}>Admission Success!</strong>
            <span style={{ fontSize: '0.8rem' }}>Student registered and added to roster list.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ========================================================
            SECTION 1: STUDENT INFORMATION
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <User size={18} style={{ color: 'hsl(var(--color-primary))' }} />
            Section 1: Student Personal Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Student Full Name *</label>
              <input 
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleTextChange}
                className={getInputClass('fullName')}
                style={getInputStyle('fullName')}
                placeholder="Enter full name"
              />
              {formErrors.fullName && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleTextChange}
                className={getInputClass('gender')}
                style={getInputStyle('gender')}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.gender && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.gender}</span>}
            </div>

            <div className="form-group">
              <label>Date of Birth *</label>
              <input 
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleTextChange}
                className={getInputClass('dob')}
                style={getInputStyle('dob')}
              />
              {formErrors.dob && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.dob}</span>}
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleTextChange}
                className="form-control"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

          </div>

          {/* Student Photo Upload Card */}
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Student Photo Upload</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '12px',
                border: '2px dashed var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.02)',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {filePreviews.photo ? (
                  <img src={filePreviews.photo} alt="Student Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={36} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label htmlFor="photo" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', padding: '10px 16px', borderRadius: '8px' }}>
                    <Upload size={14} /> Upload Photo
                  </label>
                  <input 
                    type="file" 
                    id="photo" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    style={{ display: 'none' }}
                  />
                  {files.photo && (
                    <button type="button" onClick={() => removeFile('photo')} className="btn-danger" style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <X size={14} /> Remove
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Images (PNG, JPG) only. Max size 5MB.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION 2: PARENT/GUARDIAN INFORMATION
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <Users size={18} style={{ color: 'hsl(var(--color-secondary))' }} />
            Section 2: Parent / Guardian Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Father Name *</label>
              <input 
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleTextChange}
                className={getInputClass('fatherName')}
                style={getInputStyle('fatherName')}
                placeholder="Father full name"
              />
              {formErrors.fatherName && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.fatherName}</span>}
            </div>

            <div className="form-group">
              <label>Father Mobile Number * (Numeric Only)</label>
              <input 
                type="text"
                name="fatherMobile"
                value={formData.fatherMobile}
                onChange={handleMobileChange}
                className={getInputClass('fatherMobile')}
                style={getInputStyle('fatherMobile')}
                placeholder="10-digit number"
              />
              {formErrors.fatherMobile && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.fatherMobile}</span>}
            </div>

            <div className="form-group">
              <label>Mother Name *</label>
              <input 
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleTextChange}
                className={getInputClass('motherName')}
                style={getInputStyle('motherName')}
                placeholder="Mother full name"
              />
              {formErrors.motherName && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.motherName}</span>}
            </div>

            <div className="form-group">
              <label>Mother Mobile Number * (Numeric Only)</label>
              <input 
                type="text"
                name="motherMobile"
                value={formData.motherMobile}
                onChange={handleMobileChange}
                className={getInputClass('motherMobile')}
                style={getInputStyle('motherMobile')}
                placeholder="10-digit number"
              />
              {formErrors.motherMobile && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.motherMobile}</span>}
            </div>

            <div className="form-group">
              <label>Guardian Name (Optional)</label>
              <input 
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleTextChange}
                className="form-control"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
                placeholder="Guardian name if applicable"
              />
            </div>

            <div className="form-group">
              <label>Guardian Relation</label>
              <input 
                type="text"
                name="guardianRelation"
                value={formData.guardianRelation}
                onChange={handleTextChange}
                className="form-control"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
                placeholder="e.g. Uncle, Aunt, Grandparent"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label>Guardian Contact Number (Numeric Only)</label>
              <input 
                type="text"
                name="guardianContact"
                value={formData.guardianContact}
                onChange={handleMobileChange}
                className="form-control"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
                placeholder="10-digit number"
              />
            </div>

          </div>
        </div>

        {/* ========================================================
            SECTION 3: PROFESSIONAL/ACADEMIC DETAILS
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <FileText size={18} style={{ color: 'hsl(var(--color-info))' }} />
            Section 3: Professional/Academic Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Roll Number *</label>
              <input 
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleTextChange}
                className={getInputClass('rollNumber')}
                style={getInputStyle('rollNumber')}
                placeholder="Enter roll number"
              />
              {formErrors.rollNumber && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.rollNumber}</span>}
            </div>

            <div className="form-group">
              <label>Class *</label>
              <select
                name="studentClass"
                value={formData.studentClass}
                onChange={handleTextChange}
                className={getInputClass('studentClass')}
                style={getInputStyle('studentClass')}
              >
                <option value="">Select Class</option>
                <option value="I">Class I</option>
                <option value="II">Class II</option>
                <option value="III">Class III</option>
                <option value="IV">Class IV</option>
                <option value="V">Class V</option>
                <option value="VI">Class VI</option>
                <option value="VII">Class VII</option>
                <option value="VIII">Class VIII</option>
                <option value="IX">Class IX</option>
                <option value="X">Class X</option>
              </select>
              {formErrors.studentClass && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.studentClass}</span>}
            </div>

            <div className="form-group">
              <label>Grade/Division *</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleTextChange}
                className={getInputClass('grade')}
                style={getInputStyle('grade')}
              >
                <option value="">Select Grade</option>
                <option value="A">Grade A (Excellent)</option>
                <option value="B">Grade B (Good)</option>
                <option value="C">Grade C (Average)</option>
                <option value="D">Grade D (Below Average)</option>
                <option value="E">Grade E (Fail)</option>
              </select>
              {formErrors.grade && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.grade}</span>}
            </div>

            <div className="form-group">
              <label>Section</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleTextChange}
                className="form-control"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
              >
                <option value="">Select Section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
                <option value="E">Section E</option>
              </select>
            </div>

            <div className="form-group">
              <label>Admission Date *</label>
              <input 
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleTextChange}
                className={getInputClass('admissionDate')}
                style={getInputStyle('admissionDate')}
              />
              {formErrors.admissionDate && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.admissionDate}</span>}
            </div>

            <div className="form-group">
              <label>Admission Number</label>
              <input 
                type="text"
                name="admissionNumber"
                value={formData.admissionNumber}
                onChange={handleTextChange}
                className="form-control"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
                placeholder="Enter admission number"
              />
            </div>

          </div>
        </div>

        {/* ========================================================
            SECTION 4: ADDRESS INFORMATION
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <MapPin size={18} style={{ color: 'rgb(var(--color-success-rgb))' }} />
            Section 4: Address Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Full Address *</label>
              <input 
                type="text"
                name="address"
                value={formData.address}
                onChange={handleTextChange}
                className={getInputClass('address')}
                style={getInputStyle('address')}
                placeholder="House no, block, street, locality"
              />
              {formErrors.address && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.address}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label>City *</label>
                <input 
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleTextChange}
                  className={getInputClass('city')}
                  style={getInputStyle('city')}
                  placeholder="Enter city"
                />
                {formErrors.city && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.city}</span>}
              </div>

              <div className="form-group">
                <label>State *</label>
                <input 
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleTextChange}
                  className={getInputClass('state')}
                  style={getInputStyle('state')}
                  placeholder="Enter state"
                />
                {formErrors.state && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.state}</span>}
              </div>

              <div className="form-group">
                <label>Pincode * (Numeric Only)</label>
                <input 
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  className={getInputClass('pincode')}
                  style={getInputStyle('pincode')}
                  placeholder="6-digit pincode"
                />
                {formErrors.pincode && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.pincode}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION 5: DOCUMENT UPLOADS
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <Upload size={18} style={{ color: 'rgb(var(--color-warning-rgb))' }} />
            Section 5: Document Uploads (PDF & Images Only)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* 1. Aadhaar Card Upload */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Aadhaar Card</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="aadhaarFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input 
                  type="file" 
                  id="aadhaarFile" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'aadhaarFile')}
                  style={{ display: 'none' }}
                />
              </div>

              {files.aadhaarFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)' }} className="flex items-center gap-1">
                    <FileText size={12} className="text-blue-400" /> {files.aadhaarFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('aadhaarFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* 2. Birth Certificate */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Birth Certificate</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="birthCertificateFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input 
                  type="file" 
                  id="birthCertificateFile" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'birthCertificateFile')}
                  style={{ display: 'none' }}
                />
              </div>

              {files.birthCertificateFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)' }} className="flex items-center gap-1">
                    <FileText size={12} className="text-blue-400" /> {files.birthCertificateFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('birthCertificateFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* 3. Previous Marksheet */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Previous Marksheet</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="marksheetFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input 
                  type="file" 
                  id="marksheetFile" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'marksheetFile')}
                  style={{ display: 'none' }}
                />
              </div>

              {files.marksheetFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)' }} className="flex items-center gap-1">
                    <FileText size={12} className="text-blue-400" /> {files.marksheetFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('marksheetFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* 4. Transfer Certificate */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Transfer Certificate (TC)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="transferCertificateFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input 
                  type="file" 
                  id="transferCertificateFile" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'transferCertificateFile')}
                  style={{ display: 'none' }}
                />
              </div>

              {files.transferCertificateFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)' }} className="flex items-center gap-1">
                    <FileText size={12} className="text-blue-400" /> {files.transferCertificateFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('transferCertificateFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Actions Footer */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'flex-end', 
          marginTop: '10px' 
        }}>
          <button 
            type="button" 
            onClick={resetForm} 
            className="btn-secondary"
            style={{ 
              padding: '12px 24px', 
              borderRadius: '10px', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              cursor: 'pointer' 
            }}
          >
            <RotateCcw size={16} /> Reset Form
          </button>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ 
              padding: '12px 28px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: '170px',
              justifyContent: 'center'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Registering...
              </>
            ) : (
              <>
                <Save size={16} /> Save Registration
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
