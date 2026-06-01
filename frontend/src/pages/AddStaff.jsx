import React, { useState } from 'react';
import { 
  UserCog, 
  Mail, 
  Phone, 
  Building2,
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Save, 
  Loader2,
  Briefcase,
  MapPin,
  FileText
} from 'lucide-react';

export default function AddStaff({ setActiveView }) {
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    designation: '',
    qualification: '',
    experience: '',
    dateOfJoining: '',
    salaryGrade: '',
    reportingTo: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  // File Upload State
  const [files, setFiles] = useState({
    photo: null,
    aadharFile: null,
    certificateFile: null
  });

  const [filePreviews, setFilePreviews] = useState({
    photo: '',
    aadharFile: '',
    certificateFile: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Strict Numeric real-time filters
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    const cleanNum = value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData({
      ...formData,
      [name]: cleanNum
    });
  };

  const handleExperienceChange = (e) => {
    const { value } = e.target;
    const cleanNum = value.replace(/[^0-9]/g, '').slice(0, 2);
    setFormData({
      ...formData,
      experience: cleanNum
    });
  };

  const handlePincodeChange = (e) => {
    const { value } = e.target;
    const cleanPin = value.replace(/[^0-9]/g, '').slice(0, 6);
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
    const inputEl = document.getElementById(fieldName);
    if (inputEl) inputEl.value = '';
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      gender: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      designation: '',
      qualification: '',
      experience: '',
      dateOfJoining: '',
      salaryGrade: '',
      reportingTo: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
    setFiles({
      photo: null,
      aadharFile: null,
      certificateFile: null
    });
    setFilePreviews({
      photo: '',
      aadharFile: '',
      certificateFile: ''
    });
    setFormErrors({});
    setFormSubmitted(false);
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields check
    const requiredFields = {
      fullName: 'Staff Full Name',
      gender: 'Gender',
      email: 'Email Address',
      phone: 'Phone Number',
      department: 'Department',
      position: 'Position',
      designation: 'Designation',
      qualification: 'Qualification',
      experience: 'Years of Experience',
      dateOfJoining: 'Date of Joining',
      address: 'Full Address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
      emergencyContact: 'Emergency Contact Name',
      emergencyPhone: 'Emergency Phone Number'
    };

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field].toString().trim()) {
        errors[field] = `${requiredFields[field]} is required.`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // Length check validations
    if (formData.phone && formData.phone.length !== 10) {
      errors.phone = 'Phone must be exactly 10 digits.';
    }
    if (formData.emergencyPhone && formData.emergencyPhone.length !== 10) {
      errors.emergencyPhone = 'Emergency phone must be exactly 10 digits.';
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
      const firstErrorEl = document.querySelector('.input-invalid');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      const dataObj = new FormData();
      Object.keys(formData).forEach(key => {
        dataObj.append(key, formData[key]);
      });

      if (files.photo) dataObj.append('photo', files.photo);
      if (files.aadharFile) dataObj.append('aadharFile', files.aadharFile);
      if (files.certificateFile) dataObj.append('certificateFile', files.certificateFile);

      const res = await fetch('/api/staff', {
        method: 'POST',
        body: dataObj
      });

      if (res.ok) {
        setSuccessToast(true);
        resetForm();
        setTimeout(() => setSuccessToast(false), 5000);
        setTimeout(() => setActiveView('staff'), 1500);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Server error occurred during staff registration.');
      }
    } catch (err) {
      console.error('Error submitting staff details:', err);
      alert('Internal Server error connecting to the API registry.');
    } finally {
      setLoading(false);
    }
  };

  // Helper validation color toggles
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
            <strong style={{ display: 'block' }}>Staff Added!</strong>
            <span style={{ fontSize: '0.8rem' }}>Staff member registered and added to directory.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ========================================================
            SECTION 1: PERSONAL INFORMATION
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <UserCog size={18} style={{ color: 'hsl(var(--color-primary))' }} />
            Section 1: Personal Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Full Name *</label>
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
              <label>Email Address *</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleTextChange}
                className={getInputClass('email')}
                style={getInputStyle('email')}
                placeholder="staff@school.com"
              />
              {formErrors.email && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number * (Numeric Only)</label>
              <input 
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={getInputClass('phone')}
                style={getInputStyle('phone')}
                placeholder="10-digit number"
              />
              {formErrors.phone && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.phone}</span>}
            </div>
          </div>

          {/* Staff Photo Upload Card */}
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Staff Photo Upload</label>
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
                  <img src={filePreviews.photo} alt="Staff Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserCog size={36} style={{ color: 'var(--text-muted)' }} />
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
            SECTION 2: PROFESSIONAL DETAILS
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <Briefcase size={18} style={{ color: 'hsl(var(--color-secondary))' }} />
            Section 2: Professional Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleTextChange}
                className={getInputClass('department')}
                style={getInputStyle('department')}
              >
                <option value="">Select Department</option>
                <option value="Administration">Administration</option>
                <option value="Registrar Office">Registrar Office</option>
                <option value="Library">Library</option>
                <option value="IT Support">IT Support</option>
                <option value="Security Operations">Security Operations</option>
                <option value="Facilities">Facilities</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              {formErrors.department && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.department}</span>}
            </div>

            <div className="form-group">
              <label>Position *</label>
              <input 
                type="text"
                name="position"
                value={formData.position}
                onChange={handleTextChange}
                className={getInputClass('position')}
                style={getInputStyle('position')}
                placeholder="e.g. Administrative Officer"
              />
              {formErrors.position && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.position}</span>}
            </div>

            <div className="form-group">
              <label>Designation *</label>
              <input 
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleTextChange}
                className={getInputClass('designation')}
                style={getInputStyle('designation')}
                placeholder="e.g. Senior Officer"
              />
              {formErrors.designation && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.designation}</span>}
            </div>

            <div className="form-group">
              <label>Highest Qualification *</label>
              <input 
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleTextChange}
                className={getInputClass('qualification')}
                style={getInputStyle('qualification')}
                placeholder="e.g. B.Tech, B.A, M.Sc"
              />
              {formErrors.qualification && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.qualification}</span>}
            </div>

            <div className="form-group">
              <label>Years of Experience * (Numeric Only)</label>
              <input 
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleExperienceChange}
                className={getInputClass('experience')}
                style={getInputStyle('experience')}
                placeholder="e.g. 5"
              />
              {formErrors.experience && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.experience}</span>}
            </div>

            <div className="form-group">
              <label>Date of Joining *</label>
              <input 
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleTextChange}
                className={getInputClass('dateOfJoining')}
                style={getInputStyle('dateOfJoining')}
              />
              {formErrors.dateOfJoining && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.dateOfJoining}</span>}
            </div>

            <div className="form-group">
              <label>Salary Grade</label>
              <select
                name="salaryGrade"
                value={formData.salaryGrade}
                onChange={handleTextChange}
                className="form-control"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
              >
                <option value="">Select Grade</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Grade C">Grade C</option>
                <option value="Grade D">Grade D</option>
              </select>
            </div>

            <div className="form-group">
              <label>Reporting To</label>
              <input 
                type="text"
                name="reportingTo"
                value={formData.reportingTo}
                onChange={handleTextChange}
                className="form-control"
                style={{ padding: '12px 16px', borderRadius: '10px' }}
                placeholder="e.g. Principal/HOD"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION 3: ADDRESS INFORMATION
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <MapPin size={18} style={{ color: 'rgb(var(--color-success-rgb))' }} />
            Section 3: Address Details
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
            SECTION 4: EMERGENCY CONTACT INFORMATION
            ======================================================== */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', margin: 0 }}>
            <AlertCircle size={18} style={{ color: 'rgb(var(--color-warning-rgb))' }} />
            Section 4: Emergency Contact Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            <div className="form-group">
              <label>Emergency Contact Name *</label>
              <input 
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleTextChange}
                className={getInputClass('emergencyContact')}
                style={getInputStyle('emergencyContact')}
                placeholder="Full name of emergency contact"
              />
              {formErrors.emergencyContact && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.emergencyContact}</span>}
            </div>

            <div className="form-group">
              <label>Emergency Contact Phone * (Numeric Only)</label>
              <input 
                type="text"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handlePhoneChange}
                className={getInputClass('emergencyPhone')}
                style={getInputStyle('emergencyPhone')}
                placeholder="10-digit number"
              />
              {formErrors.emergencyPhone && <span style={{ color: 'rgb(var(--color-danger-rgb))', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.emergencyPhone}</span>}
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
            
            {/* 1. Aadhar Card Upload */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Aadhar Card</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="aadharFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input 
                  type="file" 
                  id="aadharFile" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'aadharFile')}
                  style={{ display: 'none' }}
                />
              </div>

              {files.aadharFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)' }} className="flex items-center gap-1">
                    <FileText size={12} className="text-blue-400" /> {files.aadharFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('aadharFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* 2. Qualification Certificate */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Qualification Certificate</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label htmlFor="certificateFile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px' }}>
                  <Upload size={14} /> Upload PDF/Image
                </label>
                <input 
                  type="file" 
                  id="certificateFile" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'certificateFile')}
                  style={{ display: 'none' }}
                />
              </div>

              {files.certificateFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', color: 'var(--text-main)' }} className="flex items-center gap-1">
                    <FileText size={12} className="text-blue-400" /> {files.certificateFile.name}
                  </span>
                  <button type="button" onClick={() => removeFile('certificateFile')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
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
                <Loader2 size={16} className="animate-spin" /> Adding Staff...
              </>
            ) : (
              <>
                <Save size={16} /> Add Staff
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
