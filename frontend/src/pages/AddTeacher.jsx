import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Lock, 
  Upload, 
  X, 
  CheckCircle, 
  RotateCcw, 
  Save, 
  Loader2,
  FileText,
  Shield
} from 'lucide-react';

export default function AddTeacher({ setActiveView }) {
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // ==========================================
  // FORM DATA STATE
  // ==========================================
  const [formData, setFormData] = useState({
    // Section 1: Personal Details
    fullName: '',
    gender: '',
    dob: '',
    bloodGroup: '',
    maritalStatus: '',
    // Section 2: Contact & Address
    mobile: '',
    alternateMobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    // Section 3: Professional Information
    teacherId: '',
    department: '',
    subjectSpecialization: '',
    qualification: '',
    experience: '',
    joiningDate: '',
    salary: '',
    employmentType: '',
    // Section 4: Login Account
    username: '',
    password: '',
    confirmPassword: ''
  });

  // ==========================================
  // FILE UPLOAD STATE
  // ==========================================
  const [files, setFiles] = useState({
    photo: null,
    aadhaarFile: null,
    resumeFile: null,
    qualificationFile: null,
    experienceFile: null
  });

  const [filePreviews, setFilePreviews] = useState({
    photo: '',
    aadhaarFile: '',
    resumeFile: '',
    qualificationFile: '',
    experienceFile: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // ==========================================
  // INPUT HANDLERS
  // ==========================================

  // Standard text input handler
  const handleTextChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Strict numeric-only filter for Mobile (max 10 digits)
  const handleMobileChange = (e) => {
    const { name, value } = e.target;
    const cleanNum = value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData({
      ...formData,
      [name]: cleanNum
    });
  };

  // Strict numeric-only filter for Pincode (max 6 digits)
  const handlePincodeChange = (e) => {
    const { value } = e.target;
    const cleanPin = value.replace(/[^0-9]/g, '').slice(0, 6);
    setFormData({
      ...formData,
      pincode: cleanPin
    });
  };

  // ==========================================
  // FILE UPLOAD HANDLER WITH VALIDATION
  // ==========================================
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller document.');
      return;
    }

    // Validate type
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      alert('Invalid file format. Only Images (JPG, PNG) and PDFs are allowed.');
      return;
    }

    setFiles({ ...files, [fieldName]: file });

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviews(prev => ({ ...prev, [fieldName]: 'pdf_icon' }));
    }
  };

  const removeFile = (fieldName) => {
    setFiles({ ...files, [fieldName]: null });
    setFilePreviews({ ...filePreviews, [fieldName]: '' });
    const inputEl = document.getElementById(fieldName);
    if (inputEl) inputEl.value = '';
  };

  // ==========================================
  // FORM RESET
  // ==========================================
  const resetForm = () => {
    setFormData({
      fullName: '', gender: '', dob: '', bloodGroup: '', maritalStatus: '',
      mobile: '', alternateMobile: '', email: '', address: '', city: '', state: '', pincode: '',
      teacherId: '', department: '', subjectSpecialization: '', qualification: '',
      experience: '', joiningDate: '', salary: '', employmentType: '',
      username: '', password: '', confirmPassword: ''
    });
    setFiles({ photo: null, aadhaarFile: null, resumeFile: null, qualificationFile: null, experienceFile: null });
    setFilePreviews({ photo: '', aadhaarFile: '', resumeFile: '', qualificationFile: '', experienceFile: '' });
    setFormErrors({});
    setFormSubmitted(false);
  };

  // ==========================================
  // FORM VALIDATION
  // ==========================================
  const validateForm = () => {
    const errors = {};

    // Required fields
    const requiredFields = {
      fullName: 'Teacher Full Name',
      gender: 'Gender',
      dob: 'Date of Birth',
      mobile: 'Mobile Number',
      email: 'Email Address',
      address: 'Full Address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
      teacherId: 'Teacher ID',
      department: 'Department',
      subjectSpecialization: 'Subject Specialization',
      qualification: 'Qualification',
      joiningDate: 'Joining Date',
      employmentType: 'Employment Type',
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || !formData[field].trim()) {
        errors[field] = `${requiredFields[field]} is required.`;
      }
    });

    // Mobile length validation
    if (formData.mobile && formData.mobile.length !== 10) {
      errors.mobile = 'Mobile must be exactly 10 digits.';
    }
    if (formData.alternateMobile && formData.alternateMobile.length !== 10) {
      errors.alternateMobile = 'Alternate Mobile must be exactly 10 digits.';
    }

    // Pincode length validation
    if (formData.pincode && formData.pincode.length !== 6) {
      errors.pincode = 'Pincode must be exactly 6 digits.';
    }

    // Email format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==========================================
  // FORM SUBMISSION
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateForm()) {
      const firstErrorEl = document.querySelector('.input-invalid');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      const dataObj = new FormData();
      // Append all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          dataObj.append(key, formData[key]);
        }
      });

      // Append file streams
      if (files.photo) dataObj.append('photo', files.photo);
      if (files.aadhaarFile) dataObj.append('aadhaarFile', files.aadhaarFile);
      if (files.resumeFile) dataObj.append('resumeFile', files.resumeFile);
      if (files.qualificationFile) dataObj.append('qualificationFile', files.qualificationFile);
      if (files.experienceFile) dataObj.append('experienceFile', files.experienceFile);

      const res = await fetch('/api/teachers', {
        method: 'POST',
        body: dataObj
      });

      if (res.ok) {
        setSuccessToast(true);
        resetForm();
        setTimeout(() => setSuccessToast(false), 5000);
        setTimeout(() => setActiveView('teacher-list'), 1500);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Server error occurred during teacher registration.');
      }
    } catch (err) {
      console.error('Error submitting teacher details:', err);
      alert('Internal Server error connecting to the API.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VALIDATION HELPERS (Green/Red borders)
  // ==========================================
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

  const errorText = (fieldName) => (
    formErrors[fieldName] && (
      <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
        {formErrors[fieldName]}
      </span>
    )
  );

  // Password strength helper
  const getPasswordStrength = (pass) => {
    if (!pass) return null;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { label: 'Weak', color: 'rgb(var(--color-danger-rgb))' };
    if (score === 2) return { label: 'Fair', color: 'rgb(var(--color-warning-rgb))' };
    if (score === 3) return { label: 'Good', color: 'hsl(var(--color-info))' };
    return { label: 'Strong', color: 'rgb(var(--color-success-rgb))' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // ==========================================
  // RENDER COMPONENT
  // ==========================================
  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Success Toast */}
      {successToast && (
        <div className="glass-panel" style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
          background: 'rgba(var(--color-success-rgb), 0.95)', color: 'white',
          padding: '16px 24px', borderRadius: '12px', display: 'flex',
          alignItems: 'center', gap: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          animation: 'slide-up 0.3s ease'
        }}>
          <CheckCircle size={24} />
          <div>
            <strong style={{ display: 'block' }}>Teacher Registered!</strong>
            <span style={{ fontSize: '0.8rem' }}>Faculty profile created and added to roster.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ========================================================
            SECTION 1: PERSONAL INFORMATION
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <User size={18} style={{ color: 'hsl(var(--color-primary))' }} />
            Section 1: Personal Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Teacher Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleTextChange}
                className={getInputClass('fullName')} style={getInputStyle('fullName')} />
              {errorText('fullName')}
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleTextChange}
                className={getInputClass('gender')} style={getInputStyle('gender')}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errorText('gender')}
            </div>

            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleTextChange}
                className={getInputClass('dob')} style={getInputStyle('dob')} />
              {errorText('dob')}
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleTextChange}
                className="form-control" style={{ padding: '12px 16px', borderRadius: '10px' }}>
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

            <div className="form-group">
              <label>Marital Status</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleTextChange}
                className="form-control" style={{ padding: '12px 16px', borderRadius: '10px' }}>
                <option value="">Select Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Teacher Photo Upload */}
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Teacher Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '12px',
                border: '2px dashed var(--border-glass)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.02)', position: 'relative',
                overflow: 'hidden', flexShrink: 0
              }}>
                {filePreviews.photo ? (
                  <img src={filePreviews.photo} alt="Teacher Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={36} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label htmlFor="photo" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', padding: '10px 16px', borderRadius: '8px' }}>
                    <Upload size={14} /> Upload Photo
                  </label>
                  <input type="file" id="photo" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} style={{ display: 'none' }} />
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
            SECTION 2: CONTACT & ADDRESS
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <Phone size={18} style={{ color: 'hsl(var(--color-secondary))' }} />
            Section 2: Contact &amp; Address Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Mobile Number * (Numeric Only)</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleMobileChange}
                className={getInputClass('mobile')} style={getInputStyle('mobile')} />
              {errorText('mobile')}
            </div>

            <div className="form-group">
              <label>Alternate Mobile Number (Numeric Only)</label>
              <input type="text" name="alternateMobile" value={formData.alternateMobile} onChange={handleMobileChange}
                className={formSubmitted && formErrors.alternateMobile ? 'form-control input-invalid' : 'form-control'}
                style={formSubmitted && formErrors.alternateMobile ? { ...getInputStyle('alternateMobile') } : { padding: '12px 16px', borderRadius: '10px' }} />
              {errorText('alternateMobile')}
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleTextChange}
                className={getInputClass('email')} style={getInputStyle('email')} />
              {errorText('email')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
            <div className="form-group">
              <label>Full Address *</label>
              <input type="text" name="address" value={formData.address} onChange={handleTextChange}
                className={getInputClass('address')} style={getInputStyle('address')} />
              {errorText('address')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleTextChange}
                  className={getInputClass('city')} style={getInputStyle('city')} />
                {errorText('city')}
              </div>
              <div className="form-group">
                <label>State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleTextChange}
                  className={getInputClass('state')} style={getInputStyle('state')} />
                {errorText('state')}
              </div>
              <div className="form-group">
                <label>Pincode * (Numeric Only)</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handlePincodeChange}
                  className={getInputClass('pincode')} style={getInputStyle('pincode')} />
                {errorText('pincode')}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION 3: PROFESSIONAL INFORMATION
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <Briefcase size={18} style={{ color: 'hsl(var(--color-info))' }} />
            Section 3: Professional Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value="Auto-generated on Save" disabled
                className="form-control" style={{ padding: '12px 16px', borderRadius: '10px', opacity: 0.6, fontStyle: 'italic' }} />
            </div>

            <div className="form-group">
              <label>Teacher ID *</label>
              <input type="text" name="teacherId" value={formData.teacherId} onChange={handleTextChange}
                className={getInputClass('teacherId')} style={getInputStyle('teacherId')} />
              {errorText('teacherId')}
            </div>

            <div className="form-group">
              <label>Department *</label>
              <select name="department" value={formData.department} onChange={handleTextChange}
                className={getInputClass('department')} style={getInputStyle('department')}>
                <option value="">Select Department</option>
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Social Science">Social Science</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Arts">Arts</option>
                <option value="Commerce">Commerce</option>
                <option value="Music">Music</option>
                <option value="Other">Other</option>
              </select>
              {errorText('department')}
            </div>

            <div className="form-group">
              <label>Subject Specialization *</label>
              <input type="text" name="subjectSpecialization" value={formData.subjectSpecialization} onChange={handleTextChange}
                className={getInputClass('subjectSpecialization')} style={getInputStyle('subjectSpecialization')} />
              {errorText('subjectSpecialization')}
            </div>

            <div className="form-group">
              <label>Qualification *</label>
              <input type="text" name="qualification" value={formData.qualification} onChange={handleTextChange}
                className={getInputClass('qualification')} style={getInputStyle('qualification')} />
              {errorText('qualification')}
            </div>

            <div className="form-group">
              <label>Experience (Years)</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleTextChange}
                className="form-control" style={{ padding: '12px 16px', borderRadius: '10px' }} min="0" />
            </div>

            <div className="form-group">
              <label>Joining Date *</label>
              <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleTextChange}
                className={getInputClass('joiningDate')} style={getInputStyle('joiningDate')} />
              {errorText('joiningDate')}
            </div>

            <div className="form-group">
              <label>Salary (Monthly ₹)</label>
              <input type="number" name="salary" value={formData.salary} onChange={handleTextChange}
                className="form-control" style={{ padding: '12px 16px', borderRadius: '10px' }} min="0" />
            </div>

            <div className="form-group">
              <label>Employment Type *</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleTextChange}
                className={getInputClass('employmentType')} style={getInputStyle('employmentType')}>
                <option value="">Select Employment Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
              {errorText('employmentType')}
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION 4: LOGIN ACCOUNT SETUP
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <Lock size={18} style={{ color: 'rgb(var(--color-warning-rgb))' }} />
            Section 4: Login Account Setup
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Username *</label>
              <input type="text" name="username" value={formData.username} onChange={handleTextChange}
                className={getInputClass('username')} style={getInputStyle('username')} autoComplete="off" />
              {errorText('username')}
            </div>

            <div className="form-group">
              <label>Password * (Min 8 characters)</label>
              <input type="password" name="password" value={formData.password} onChange={handleTextChange}
                className={getInputClass('password')} style={getInputStyle('password')} autoComplete="new-password" />
              {formData.password && passwordStrength && (
                <span style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', color: passwordStrength.color }}>
                  <Shield size={12} /> Strength: {passwordStrength.label}
                </span>
              )}
              {errorText('password')}
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleTextChange}
                className={getInputClass('confirmPassword')} style={getInputStyle('confirmPassword')} autoComplete="new-password" />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <span style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgb(var(--color-success-rgb))' }}>
                  <CheckCircle size={12} /> Passwords match
                </span>
              )}
              {errorText('confirmPassword')}
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION 5: DOCUMENT UPLOADS
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <Upload size={18} style={{ color: 'rgb(var(--color-success-rgb))' }} />
            Section 5: Document Uploads (PDF &amp; Images Only)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* Aadhaar Card Upload */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Aadhaar Card</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="aadhaarFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input type="file" id="aadhaarFile" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'aadhaarFile')} style={{ display: 'none' }} />
              </div>
              {files.aadhaarFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} style={{ color: 'hsl(var(--color-primary))' }} /> {files.aadhaarFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('aadhaarFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Resume/CV Upload */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Resume / CV</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="resumeFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input type="file" id="resumeFile" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'resumeFile')} style={{ display: 'none' }} />
              </div>
              {files.resumeFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} style={{ color: 'hsl(var(--color-secondary))' }} /> {files.resumeFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('resumeFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Qualification Certificates Upload */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Qualification Certificates</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="qualificationFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input type="file" id="qualificationFile" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'qualificationFile')} style={{ display: 'none' }} />
              </div>
              {files.qualificationFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} style={{ color: 'hsl(var(--color-info))' }} /> {files.qualificationFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('qualificationFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Experience Certificates Upload */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Experience Certificates</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="experienceFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input type="file" id="experienceFile" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'experienceFile')} style={{ display: 'none' }} />
              </div>
              {files.experienceFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} style={{ color: 'rgb(var(--color-warning-rgb))' }} /> {files.experienceFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('experienceFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================
            ACTION BUTTONS FOOTER
            ======================================================== */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="button" onClick={resetForm} className="btn-secondary"
            style={{ padding: '12px 24px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}>
            <RotateCcw size={16} /> Reset Form
          </button>
          
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ padding: '12px 28px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', minWidth: '200px', justifyContent: 'center' }}>
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Registering...</>
            ) : (
              <><Save size={16} /> Save Teacher Profile</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
