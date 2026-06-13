import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  Phone, 
  MapPin, 
  Award, 
  Clock, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Save, 
  Loader2,
  FileText,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Trash2,
  Plus,
  X
} from 'lucide-react';

// Custom Reusable Searchable Dropdown Select Component
function SearchableSelect({ options, value, onChange, placeholder, className, style, error }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const activeLabel = options.find(opt => opt.value === value)?.label || '';

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => setIsOpen(false);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);

  return (
    <div style={{ position: 'relative', width: '100%' }} onClick={(e) => e.stopPropagation()}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={className}
        style={{ 
          ...style, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          borderColor: error ? '#ef4444' : style?.borderColor
        }}
      >
        <span style={{ color: activeLabel ? 'var(--text-main)' : '#94a3b8' }}>
          {activeLabel || placeholder || 'Select Option'}
        </span>
        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▼</span>
      </div>
      
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          marginTop: '6px',
          maxHeight: '200px',
          overflowY: 'auto',
          background: 'var(--bg-elevated)',
          padding: '8px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <input 
            type="text"
            className="form-control"
            placeholder="Type to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: '8px', padding: '8px', fontSize: '0.85rem' }}
          />
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div 
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: value === opt.value ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: value === opt.value ? 'rgb(99, 102, 241)' : 'var(--text-main)',
                  fontWeight: value === opt.value ? '600' : 'normal',
                  fontSize: '0.85rem'
                }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No matches found</div>
          )}
        </div>
      )}
    </div>
  );
}

// Drag & Drop File Upload Component
function DragAndDropFile({ fieldName, label, file, onFileChange, onRemove, accept = "image/*,application/pdf" }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragOver(true);
    } else if (e.type === "dragleave") {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileObj = e.dataTransfer.files[0];
      
      // Validation Check size limit (5MB)
      if (fileObj.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please upload a smaller document.");
        return;
      }
      
      // Allowed types
      const allowedExts = ['pdf', 'png', 'jpg', 'jpeg'];
      const fileExt = fileObj.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(fileExt)) {
        alert("Invalid file format. PDFs and images (JPG, PNG) only.");
        return;
      }

      onFileChange({ target: { files: [fileObj] } }, fieldName);
    }
  };

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      style={{
        padding: '16px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: dragOver ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)',
        border: dragOver ? '2px dashed rgb(99, 102, 241)' : '1px solid var(--border-glass)',
        transition: 'all 0.3s ease',
        minHeight: '120px',
        justifyContent: 'center'
      }}
    >
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{label}</span>
      
      {!file ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
          <Upload size={20} style={{ color: 'var(--text-muted)' }} />
          <label htmlFor={fieldName} style={{ color: 'hsl(var(--color-primary))', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            Upload File <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>or drag here</span>
          </label>
          <input 
            type="file" 
            id={fieldName} 
            accept={accept}
            onChange={(e) => onFileChange(e, fieldName)}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} style={{ color: 'rgb(99, 102, 241)' }} /> {file.name}
          </span>
          <button type="button" onClick={() => onRemove(fieldName)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AddTeacher({ setActiveView }) {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [draftRestoredAlert, setDraftRestoredAlert] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const isSubmitting = React.useRef(false);

  const tenantSubdomain = localStorage.getItem('tenant_subdomain') || 'default';
  const draftKey = `teacher_admission_draft_${tenantSubdomain}`;

  // Form Fields State (Unified for 8 Steps)
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    firstName: '',
    middleName: '',
    lastName: '',
    fullName: '',
    gender: '',
    dob: '',
    bloodGroup: '',
    nationality: 'Indian',
    maritalStatus: '',
    aadhaarNumber: '',
    panNumber: '',
    teacherId: '',

    // Step 2: Professional Information
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: '',
    designation: '',
    department: '',
    primarySubject: '',
    secondarySubject: '',
    status: 'Active',

    // Step 3: Contact Details
    mobile: '',
    alternateMobile: '',
    email: '',
    password: '',
    emergencyContactNumber: '',

    // Step 4: Address Information
    currentAddress: '',
    currentCity: '',
    currentState: '',
    currentCountry: 'India',
    currentPostalCode: '',
    permanentAddress: '',
    permanentCity: '',
    permanentState: '',
    permanentCountry: 'India',
    permanentPostalCode: '',
    sameAsPermanent: false,

    // Step 5: Qualifications Information
    qualifications: [
      { degree: 'B.Ed', institution: '', board: '', year: '', percentage: '' },
      { degree: 'M.Ed', institution: '', board: '', year: '', percentage: '' },
      { degree: 'B.Sc', institution: '', board: '', year: '', percentage: '' },
      { degree: 'M.Sc', institution: '', board: '', year: '', percentage: '' }
    ],

    // Step 6: Experience Information
    experience: '', // Total teaching experience (e.g. 5 Years)
    experiences: [
      { schoolName: '', designation: '', duration: '', reason: '' }
    ]
  });

  // Step 7: File Upload State
  const [files, setFiles] = useState({
    photo: null,
    aadhaarFile: null,
    panFile: null,
    resumeFile: null,
    qualificationFile: null,
    experienceFile: null,
    joiningLetterFile: null,
    otherFile: null
  });

  const [formErrors, setFormErrors] = useState({});

  // Dropdown options datasets
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const maritalStatusOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' },
    { value: 'Other', label: 'Other' }
  ];

  const employmentTypeOptions = [
    { value: 'Full Time', label: 'Full Time' },
    { value: 'Part Time', label: 'Part Time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Visiting Faculty', label: 'Visiting Faculty' }
  ];

  const roleOptions = [
    { value: 'Principal', label: 'Principal' },
    { value: 'Vice Principal', label: 'Vice Principal' },
    { value: 'Academic Coordinator', label: 'Academic Coordinator' },
    { value: 'Subject Teacher', label: 'Subject Teacher' },
    { value: 'Librarian', label: 'Librarian' },
    { value: 'Receptionist', label: 'Receptionist' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Expense Manager', label: 'Expense Manager' }
  ];

  const departmentOptions = [
    { value: 'Science', label: 'Science' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Social Science', label: 'Social Science' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Physical Education', label: 'Physical Education' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Commerce', label: 'Commerce' },
    { value: 'Music', label: 'Music' },
    { value: 'Other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'On Leave', label: 'On Leave' }
  ];

  // 1. Auto Load Draft
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
        setDraftRestoredAlert(true);
        setTimeout(() => setDraftRestoredAlert(false), 5000);
      } catch (err) {
        console.error('Failed to restore draft registration:', err);
      }
    }
  }, []);

  // 2. Auto-Save Draft to LocalStorage on change
  useEffect(() => {
    const hasAnyContent = Object.keys(formData).some(key => {
      if (
        key === 'nationality' || 
        key === 'country' || 
        key === 'currentCountry' || 
        key === 'permanentCountry' || 
        key === 'joiningDate' || 
        key === 'sameAsPermanent' || 
        key === 'status' || 
        key === 'qualifications' || 
        key === 'experiences'
      ) {
        return false;
      }
      return formData[key] !== '';
    });

    if (hasAnyContent) {
      setDraftSaving(true);
      localStorage.setItem(draftKey, JSON.stringify(formData));
      const timer = setTimeout(() => setDraftSaving(false), 600);
      return () => clearTimeout(timer);
    }
  }, [formData]);

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
  };

  // Address copy handler
  useEffect(() => {
    if (formData.sameAsPermanent) {
      setFormData(prev => ({
        ...prev,
        currentAddress: prev.permanentAddress,
        currentCity: prev.permanentCity,
        currentState: prev.permanentState,
        currentCountry: prev.permanentCountry,
        currentPostalCode: prev.permanentPostalCode
      }));
    }
  }, [
    formData.sameAsPermanent, 
    formData.permanentAddress, 
    formData.permanentCity, 
    formData.permanentState, 
    formData.permanentCountry, 
    formData.permanentPostalCode
  ]);

  // Generate Unique Teacher ID (For form field display, actual Employee ID is backend auto generated)
  useEffect(() => {
    if (!formData.teacherId) {
      setFormData(prev => ({
        ...prev,
        teacherId: `TCH-${Date.now().toString().slice(-6)}`
      }));
    }
  }, []);

  // Text inputs handler
  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: val };
      if (name === 'firstName' || name === 'middleName' || name === 'lastName') {
        updated.fullName = [updated.firstName, updated.middleName, updated.lastName].filter(Boolean).join(' ');
      }
      return updated;
    });

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMobileChange = (e) => {
    const { name, value } = e.target;
    const cleanVal = value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [name]: cleanVal }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePincodeChange = (e) => {
    const { name, value } = e.target;
    const cleanVal = value.replace(/[^0-9]/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, [name]: cleanVal }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (fieldName, value) => {
    setFormData(prev => {
      const updated = { ...prev, [fieldName]: value };
      if (fieldName === 'designation' && value !== 'Subject Teacher') {
        updated.department = '';
      }
      return updated;
    });
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Qualifications table handler
  const handleQualChange = (index, field, value) => {
    const updatedQuals = [...formData.qualifications];
    updatedQuals[index][field] = value;
    setFormData(prev => ({ ...prev, qualifications: updatedQuals }));
  };

  const addQualRow = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: '', institution: '', board: '', year: '', percentage: '' }]
    }));
  };

  const removeQualRow = (index) => {
    const updatedQuals = formData.qualifications.filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, qualifications: updatedQuals }));
  };

  // Experiences table handler
  const handleExpChange = (index, field, value) => {
    const updatedExps = [...formData.experiences];
    updatedExps[index][field] = value;
    setFormData(prev => ({ ...prev, experiences: updatedExps }));
  };

  const addExpRow = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { schoolName: '', designation: '', duration: '', reason: '' }]
    }));
  };

  const removeExpRow = (index) => {
    const updatedExps = formData.experiences.filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, experiences: updatedExps }));
  };

  // Files handlers
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  const removeFile = (fieldName) => {
    setFiles(prev => ({ ...prev, [fieldName]: null }));
    const el = document.getElementById(fieldName);
    if (el) el.value = '';
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setActiveStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step validator
  const validateStep = (step) => {
    const errors = {};
    setFormErrors(errors);
    return true;
  };



  const performReset = () => {
    clearDraft();
    setFormData({
      firstName: '', middleName: '', lastName: '', fullName: '', gender: '', dob: '', bloodGroup: '',
      nationality: 'Indian', maritalStatus: '', aadhaarNumber: '', panNumber: '',
      teacherId: `TCH-${Date.now().toString().slice(-6)}`,
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: '', designation: '', department: '', primarySubject: '', secondarySubject: '', status: 'Active',
      mobile: '', alternateMobile: '', email: '', password: '', emergencyContactNumber: '',
      currentAddress: '', currentCity: '', currentState: '', currentCountry: 'India', currentPostalCode: '',
      permanentAddress: '', permanentCity: '', permanentState: '', permanentCountry: 'India', permanentPostalCode: '', sameAsPermanent: false,
      qualifications: [
        { degree: 'B.Ed', institution: '', board: '', year: '', percentage: '' },
        { degree: 'M.Ed', institution: '', board: '', year: '', percentage: '' },
        { degree: 'B.Sc', institution: '', board: '', year: '', percentage: '' },
        { degree: 'M.Sc', institution: '', board: '', year: '', percentage: '' }
      ],
      experience: '',
      experiences: [{ schoolName: '', designation: '', duration: '', reason: '' }]
    });
    setFiles({
      photo: null, aadhaarFile: null, panFile: null, resumeFile: null,
      qualificationFile: null, experienceFile: null, joiningLetterFile: null, otherFile: null
    });
    setFormErrors({});
    setFormSubmitted(false);
    setActiveStep(1);
  };

  const resetForm = () => {
    if (window.confirm("Are you sure you want to clear the entire form and draft data?")) {
      performReset();
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      const targetTag = e.target.tagName.toLowerCase();
      if (targetTag !== 'textarea' && e.target.type !== 'submit') {
        e.preventDefault();
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setFormSubmitted(true);

    let isValid = true;
    for (let step = 1; step <= 7; step++) {
      if (!validateStep(step)) {
        setActiveStep(step);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      isSubmitting.current = false;
      return;
    }

    setLoading(true);

    try {
      const dataObj = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'qualifications' || key === 'experiences') {
          dataObj.append(key, JSON.stringify(formData[key]));
        } else {
          dataObj.append(key, formData[key]);
        }
      });

      // Files attachment
      Object.keys(files).forEach(key => {
        if (files[key]) {
          dataObj.append(key, files[key]);
        }
      });

      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'x-tenant-id': tenantSubdomain },
        body: dataObj
      });

      if (res.ok) {
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 5000);
        setTimeout(() => {
          performReset();
          setLoading(false);
          isSubmitting.current = false;
        }, 1500);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Server error occurred during teacher registration.');
        setLoading(false);
        isSubmitting.current = false;
      }
    } catch (err) {
      console.error(err);
      alert('Internal Server error connecting to the API.');
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const steps = [
    { num: 1, label: 'Basic Info', icon: <User size={16} /> },
    { num: 2, label: 'Professional', icon: <Briefcase size={16} /> },
    { num: 3, label: 'Contact Details', icon: <Phone size={16} /> },
    { num: 4, label: 'Address Info', icon: <MapPin size={16} /> },
    { num: 5, label: 'Qualifications', icon: <Award size={16} /> },
    { num: 6, label: 'Experience', icon: <Clock size={16} /> },
    { num: 7, label: 'Documents', icon: <Upload size={16} /> },
    { num: 8, label: 'Final Review', icon: <CheckCircle size={16} /> }
  ];

  return (
    <div className="animate-slide-up no-card-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Draft Save Alert Toast */}
      {draftSaving && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
          background: 'rgba(99, 102, 241, 0.95)', color: 'white',
          padding: '10px 18px', borderRadius: '8px', fontSize: '0.8rem',
          fontWeight: 600, boxShadow: 'var(--shadow-md)', display: 'flex',
          alignItems: 'center', gap: '8px', pointerEvents: 'none'
        }}>
          <RotateCcw size={14} className="animate-spin" />
          Saving Draft progress...
        </div>
      )}

      {/* Draft Restored Banner */}
      {draftRestoredAlert && (
        <div className="glass-panel" style={{
          padding: '14px 20px', background: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.2)', color: 'rgb(16, 185, 129)',
          borderRadius: '12px', display: 'flex', alignItems: 'center',
          gap: '10px', fontSize: '0.875rem'
        }}>
          <CheckCircle size={18} />
          <span>Draft restored! You can continue from your previous session.</span>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="glass-panel" style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
          background: 'rgba(16, 185, 129, 0.95)', color: 'white',
          padding: '16px 24px', borderRadius: '12px', display: 'flex',
          alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-lg)',
          animation: 'slideInUp 0.3s ease'
        }}>
          <CheckCircle size={24} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>Teacher Registered!</strong>
            <span style={{ fontSize: '0.8rem' }}>Faculty profile created and account credentials activated.</span>
          </div>
        </div>
      )}

      {/* Stepper Header (Desktop view) */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '800px', padding: '0 10px' }}>
          {steps.map((s, index) => (
            <React.Fragment key={s.num}>
              <div 
                onClick={() => {
                  setActiveStep(s.num);
                }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  opacity: activeStep === s.num ? 1 : 0.6,
                  transition: 'opacity 0.3s'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: activeStep === s.num 
                    ? 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-secondary)) 100%)' 
                    : activeStep > s.num 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'var(--bg-form)',
                  border: activeStep === s.num 
                    ? 'none' 
                    : activeStep > s.num 
                      ? '1px solid rgb(16, 185, 129)' 
                      : '1px solid var(--border-glass)',
                  color: activeStep === s.num 
                    ? 'white' 
                    : activeStep > s.num 
                      ? 'rgb(16, 185, 129)' 
                      : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  {activeStep > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: activeStep === s.num ? 700 : 500,
                  color: activeStep === s.num ? 'hsl(var(--color-primary))' : 'var(--text-muted)',
                  whiteSpace: 'nowrap'
                }}>
                  {s.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div style={{ 
                  flex: 1, 
                  height: '2px', 
                  background: activeStep > s.num ? 'rgb(16, 185, 129)' : 'var(--border-glass)', 
                  margin: '0 12px',
                  alignSelf: 'center',
                  minWidth: '20px'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Active Step Progress Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {steps[activeStep - 1].label}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Step {activeStep} of 8 — Complete fields to advance.
          </p>
        </div>
        
        {/* Reset Draft Button */}
        <button 
          type="button" 
          onClick={resetForm}
          className="btn-secondary"
          style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCcw size={14} /> Clear Form & Draft
        </button>
      </div>

      {/* FORM BODY STAGE */}
      <form 
        onSubmit={handleSubmit} 
        onKeyDown={handleFormKeyDown} 
        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        
        {/* STEP 1: BASIC INFORMATION */}
        {activeStep === 1 && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} style={{ color: 'hsl(var(--color-primary))' }} /> Basic Faculty Profile
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              
              <div className="form-group">
                <label>Employee ID (Auto Generated)</label>
                <input 
                  type="text" 
                  value="EMP-2026-XXXX" 
                  disabled 
                  className="form-control" 
                  style={{ opacity: 0.6, fontStyle: 'italic', background: 'rgba(255,255,255,0.02)' }}
                />
              </div>

              <div className="form-group">
                <label>First Name *</label>
                <input 
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="First name"
                  style={{ borderColor: formErrors.firstName ? '#ef4444' : undefined }}
                />
                {formErrors.firstName && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.firstName}</span>}
              </div>

              <div className="form-group">
                <label>Middle Name (Optional)</label>
                <input 
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="Middle name"
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input 
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="Last name"
                  style={{ borderColor: formErrors.lastName ? '#ef4444' : undefined }}
                />
                {formErrors.lastName && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.lastName}</span>}
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <SearchableSelect 
                  options={genderOptions}
                  value={formData.gender}
                  onChange={(val) => handleSelectChange('gender', val)}
                  placeholder="Choose Gender"
                  className="form-control"
                  error={formErrors.gender}
                />
                {formErrors.gender && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.gender}</span>}
              </div>

              <div className="form-group">
                <label>Date of Birth *</label>
                <input 
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleTextChange}
                  className="form-control"
                  style={{ borderColor: formErrors.dob ? '#ef4444' : undefined }}
                />
                {formErrors.dob && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.dob}</span>}
              </div>

              <div className="form-group">
                <label>Blood Group</label>
                <SearchableSelect 
                  options={bloodGroupOptions}
                  value={formData.bloodGroup}
                  onChange={(val) => handleSelectChange('bloodGroup', val)}
                  placeholder="Choose Blood Group"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Nationality</label>
                <input 
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="e.g. Indian"
                />
              </div>

              <div className="form-group">
                <label>Marital Status</label>
                <SearchableSelect 
                  options={maritalStatusOptions}
                  value={formData.maritalStatus}
                  onChange={(val) => handleSelectChange('maritalStatus', val)}
                  placeholder="Choose Marital Status"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Aadhaar Number (Optional)</label>
                <input 
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="12-digit Aadhaar ID"
                />
              </div>

              <div className="form-group">
                <label>PAN Number (Optional)</label>
                <input 
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="10-digit PAN ID"
                />
              </div>

              <div className="form-group">
                <DragAndDropFile 
                  fieldName="photo"
                  label="Teacher Profile Photo (Optional)"
                  file={files.photo}
                  onFileChange={handleFileChange}
                  onRemove={removeFile}
                  accept="image/*"
                />
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: PROFESSIONAL INFORMATION */}
        {activeStep === 2 && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} style={{ color: 'hsl(var(--color-info))' }} /> Professional Information & Role
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              
              <div className="form-group">
                <label>Joining Date *</label>
                <input 
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleTextChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Employment Type *</label>
                <SearchableSelect 
                  options={employmentTypeOptions}
                  value={formData.employmentType}
                  onChange={(val) => handleSelectChange('employmentType', val)}
                  placeholder="Choose Type"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <SearchableSelect 
                  options={roleOptions}
                  value={formData.designation}
                  onChange={(val) => handleSelectChange('designation', val)}
                  placeholder="Choose Role"
                  className="form-control"
                />
              </div>

              {formData.designation === 'Subject Teacher' && (
                <div className="form-group animate-slide-down">
                  <label>Department *</label>
                  <SearchableSelect 
                    options={departmentOptions}
                    value={formData.department}
                    onChange={(val) => handleSelectChange('department', val)}
                    placeholder="Choose Department"
                    className="form-control"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Primary Subject</label>
                <input 
                  type="text"
                  name="primarySubject"
                  value={formData.primarySubject}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="e.g. Mathematics"
                />
              </div>

              <div className="form-group">
                <label>Secondary Subject</label>
                <input 
                  type="text"
                  name="secondarySubject"
                  value={formData.secondarySubject}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="e.g. Science"
                />
              </div>

              <div className="form-group">
                <label>Employee Status *</label>
                <SearchableSelect 
                  options={statusOptions}
                  value={formData.status}
                  onChange={(val) => handleSelectChange('status', val)}
                  placeholder="Choose Status"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Teacher ID Code</label>
                <input 
                  type="text"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="Auto generated or override"
                />
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: CONTACT DETAILS */}
        {activeStep === 3 && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} style={{ color: 'hsl(var(--color-secondary))' }} /> Contact Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label>Mobile Number * (Numeric Only)</label>
                <input 
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  className="form-control"
                  placeholder="10-digit mobile number"
                  style={{ borderColor: formErrors.mobile ? '#ef4444' : undefined }}
                />
                {formErrors.mobile && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>{formErrors.mobile}</span>}
              </div>

              <div className="form-group">
                <label>Alternate Mobile Number</label>
                <input 
                  type="text"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleMobileChange}
                  className="form-control"
                  placeholder="Alternate mobile number"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="Email address"
                  style={{ borderColor: formErrors.email ? '#ef4444' : undefined }}
                />
                {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label>Portal Login Password</label>
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleTextChange}
                  className="form-control"
                  placeholder="Enter login password (default: teacher123)"
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Number</label>
                <input 
                  type="text"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleMobileChange}
                  className="form-control"
                  placeholder="Emergency mobile number"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ADDRESS INFORMATION */}
        {activeStep === 4 && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} style={{ color: 'rgb(16, 185, 129)' }} /> Residential Address Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Permanent Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderRight: '1px solid var(--border-glass)', paddingRight: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'hsl(var(--color-primary))', margin: 0 }}>Permanent Address</h4>
                
                <div className="form-group">
                  <label>Address Line</label>
                  <input 
                    type="text"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleTextChange}
                    className="form-control"
                    placeholder="Street address, house number"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text"
                    name="permanentCity"
                    value={formData.permanentCity}
                    onChange={handleTextChange}
                    className="form-control"
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text"
                    name="permanentState"
                    value={formData.permanentState}
                    onChange={handleTextChange}
                    className="form-control"
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input 
                    type="text"
                    name="permanentCountry"
                    value={formData.permanentCountry}
                    onChange={handleTextChange}
                    className="form-control"
                    placeholder="Country"
                  />
                </div>

                <div className="form-group">
                  <label>Postal Code / Pincode</label>
                  <input 
                    type="text"
                    name="permanentPostalCode"
                    value={formData.permanentPostalCode}
                    onChange={handlePincodeChange}
                    className="form-control"
                    placeholder="6-digit PIN code"
                  />
                </div>
              </div>

              {/* Current Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'hsl(var(--color-secondary))', margin: 0 }}>Current Address</h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                    <input 
                      type="checkbox"
                      name="sameAsPermanent"
                      checked={formData.sameAsPermanent}
                      onChange={handleTextChange}
                    /> Same as Permanent Address
                  </label>
                </div>

                <div className="form-group">
                  <label>Address Line</label>
                  <input 
                    type="text"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleTextChange}
                    disabled={formData.sameAsPermanent}
                    className="form-control"
                    placeholder="Street address, house number"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text"
                    name="currentCity"
                    value={formData.currentCity}
                    onChange={handleTextChange}
                    disabled={formData.sameAsPermanent}
                    className="form-control"
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text"
                    name="currentState"
                    value={formData.currentState}
                    onChange={handleTextChange}
                    disabled={formData.sameAsPermanent}
                    className="form-control"
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input 
                    type="text"
                    name="currentCountry"
                    value={formData.currentCountry}
                    onChange={handleTextChange}
                    disabled={formData.sameAsPermanent}
                    className="form-control"
                    placeholder="Country"
                  />
                </div>

                <div className="form-group">
                  <label>Postal Code / Pincode</label>
                  <input 
                    type="text"
                    name="currentPostalCode"
                    value={formData.currentPostalCode}
                    onChange={handlePincodeChange}
                    disabled={formData.sameAsPermanent}
                    className="form-control"
                    placeholder="6-digit PIN code"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 5: QUALIFICATION INFORMATION */}
        {activeStep === 5 && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} style={{ color: 'rgb(245, 158, 11)' }} /> Academic Qualification Roster
              </h3>
              <button 
                type="button" 
                onClick={addQualRow} 
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={12} /> Add Degree
              </button>
            </div>

            <div className="custom-table-container" style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>Degree / Course</th>
                    <th>Institution Name</th>
                    <th>Board / University</th>
                    <th>Passing Year</th>
                    <th>Percentage / CGPA</th>
                    <th style={{ width: '50px', textAlign: 'center' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.qualifications.map((qual, idx) => (
                    <tr key={idx}>
                      <td>
                        <input 
                          type="text"
                          value={qual.degree}
                          onChange={(e) => handleQualChange(idx, 'degree', e.target.value)}
                          className="form-control"
                          placeholder="e.g. B.Ed"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={qual.institution}
                          onChange={(e) => handleQualChange(idx, 'institution', e.target.value)}
                          className="form-control"
                          placeholder="Institution Name"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={qual.board}
                          onChange={(e) => handleQualChange(idx, 'board', e.target.value)}
                          className="form-control"
                          placeholder="Board / University"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number"
                          value={qual.year}
                          onChange={(e) => handleQualChange(idx, 'year', e.target.value)}
                          className="form-control"
                          placeholder="Year"
                          min="1970"
                          max="2030"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={qual.percentage}
                          onChange={(e) => handleQualChange(idx, 'percentage', e.target.value)}
                          className="form-control"
                          placeholder="e.g. 85% or 8.5"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          type="button" 
                          onClick={() => removeQualRow(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'inline-flex' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 6: EXPERIENCE INFORMATION */}
        {activeStep === 6 && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'hsl(var(--color-primary))' }} /> Teaching Experience Information
            </h3>

            <div className="form-group" style={{ maxWidth: '300px' }}>
              <label>Total Teaching Experience (e.g. 5 Years)</label>
              <input 
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleTextChange}
                className="form-control"
                placeholder="Total years / months"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginTop: '10px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'hsl(var(--color-primary))', margin: 0 }}>Previous School Experiences</h4>
              <button 
                type="button" 
                onClick={addExpRow} 
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={12} /> Add Experience
              </button>
            </div>

            <div className="custom-table-container" style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>Previous School Name</th>
                    <th>Previous Designation</th>
                    <th>Employment Duration</th>
                    <th>Reason for Leaving</th>
                    <th style={{ width: '50px', textAlign: 'center' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.experiences.map((exp, idx) => (
                    <tr key={idx}>
                      <td>
                        <input 
                          type="text"
                          value={exp.schoolName}
                          onChange={(e) => handleExpChange(idx, 'schoolName', e.target.value)}
                          className="form-control"
                          placeholder="School Name"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={exp.designation}
                          onChange={(e) => handleExpChange(idx, 'designation', e.target.value)}
                          className="form-control"
                          placeholder="Designation"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleExpChange(idx, 'duration', e.target.value)}
                          className="form-control"
                          placeholder="e.g. 2 Years"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          value={exp.reason}
                          onChange={(e) => handleExpChange(idx, 'reason', e.target.value)}
                          className="form-control"
                          placeholder="Reason for leaving"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          type="button" 
                          onClick={() => removeExpRow(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'inline-flex' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 7: DOCUMENTS UPLOAD */}
        {activeStep === 7 && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={16} style={{ color: 'rgb(245, 158, 11)' }} /> Document Checklist (PDFs or Images under 5MB)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <DragAndDropFile 
                fieldName="aadhaarFile"
                label="Aadhaar Card"
                file={files.aadhaarFile}
                onFileChange={handleFileChange}
                onRemove={removeFile}
              />

              <DragAndDropFile 
                fieldName="panFile"
                label="PAN Card Document"
                file={files.panFile}
                onFileChange={handleFileChange}
                onRemove={removeFile}
              />

              <DragAndDropFile 
                fieldName="resumeFile"
                label="Resume / CV File"
                file={files.resumeFile}
                onFileChange={handleFileChange}
                onRemove={removeFile}
              />

              <DragAndDropFile 
                fieldName="qualificationFile"
                label="Degree / Qualification Certificates"
                file={files.qualificationFile}
                onFileChange={handleFileChange}
                onRemove={removeFile}
              />

              <DragAndDropFile 
                fieldName="experienceFile"
                label="Previous Experience Certificates"
                file={files.experienceFile}
                onFileChange={handleFileChange}
                onRemove={removeFile}
              />

              <DragAndDropFile 
                fieldName="joiningLetterFile"
                label="Joining Letter"
                file={files.joiningLetterFile}
                onFileChange={handleFileChange}
                onRemove={removeFile}
              />

              <DragAndDropFile 
                fieldName="otherFile"
                label="Other Supporting Documents"
                file={files.otherFile}
                onFileChange={handleFileChange}
                onRemove={removeFile}
              />
            </div>
          </div>
        )}

        {/* STEP 8: FINAL REVIEW PAGE */}
        {activeStep === 8 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', background: 'rgba(99, 102, 241, 0.04)', borderColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} style={{ color: 'hsl(var(--color-warning))', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Review Faculty Ledger Profile</strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Please double-check all registered values below. Submitting will commit the record and auto-create login account details.</span>
              </div>
            </div>

            {/* Review Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Card 1: Basic Information */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'hsl(var(--color-primary))', margin: 0 }}>Basic Profile</h4>
                  <button type="button" onClick={() => setActiveStep(1)} style={{ background: 'none', border: 'none', color: 'hsl(var(--color-primary))', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div><strong>Full Name:</strong> {formData.fullName || `${formData.firstName} ${formData.lastName}`}</div>
                  <div><strong>Gender / DOB:</strong> {formData.gender} / {formData.dob}</div>
                  <div><strong>Blood Group:</strong> {formData.bloodGroup || 'N/A'}</div>
                  <div><strong>Nationality:</strong> {formData.nationality}</div>
                  <div><strong>Marital Status:</strong> {formData.maritalStatus || 'N/A'}</div>
                  <div><strong>Aadhaar / PAN Number:</strong> {formData.aadhaarNumber || 'N/A'} / {formData.panNumber || 'N/A'}</div>
                </div>
              </div>

              {/* Card 2: Professional Information */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'hsl(var(--color-info))', margin: 0 }}>Professional Details</h4>
                  <button type="button" onClick={() => setActiveStep(2)} style={{ background: 'none', border: 'none', color: 'hsl(var(--color-primary))', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div><strong>Role:</strong> {formData.designation || 'N/A'}</div>
                  <div><strong>Department:</strong> {formData.department || 'N/A'}</div>
                  <div><strong>Subjects:</strong> {formData.primarySubject} {formData.secondarySubject ? `, ${formData.secondarySubject}` : ''}</div>
                  <div><strong>Type / Session:</strong> {formData.employmentType || 'N/A'} / {formData.joiningDate}</div>
                  <div><strong>Status / ID:</strong> {formData.status} / {formData.teacherId}</div>
                </div>
              </div>

              {/* Card 3: Contact Details */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'hsl(var(--color-secondary))', margin: 0 }}>Contact Details</h4>
                  <button type="button" onClick={() => setActiveStep(3)} style={{ background: 'none', border: 'none', color: 'hsl(var(--color-primary))', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div><strong>Mobile Number:</strong> {formData.mobile} {formData.alternateMobile ? `/ ${formData.alternateMobile}` : ''}</div>
                  <div><strong>Email Address:</strong> {formData.email || 'N/A'}</div>
                  <div><strong>Emergency Number:</strong> {formData.emergencyContactNumber || 'N/A'}</div>
                  <div><strong>Portal Access:</strong> Credentials will be auto-generated</div>
                </div>
              </div>

              {/* Card 4: Address Details */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'rgb(16, 185, 129)', margin: 0 }}>Residential Addresses</h4>
                  <button type="button" onClick={() => setActiveStep(4)} style={{ background: 'none', border: 'none', color: 'hsl(var(--color-primary))', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div><strong>Permanent:</strong> {formData.permanentAddress || 'N/A'} ({formData.permanentCity}, {formData.permanentState})</div>
                  <div><strong>Current Address:</strong> {formData.sameAsPermanent ? 'Same as Permanent' : `${formData.currentAddress || 'N/A'} (${formData.currentCity}, ${formData.currentState})`}</div>
                </div>
              </div>

              {/* Card 5: Qualification & Experience summary */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'rgb(245, 158, 11)', margin: 0 }}>Qualification &amp; Experience</h4>
                  <button type="button" onClick={() => setActiveStep(5)} style={{ background: 'none', border: 'none', color: 'hsl(var(--color-primary))', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div><strong>Total Experience:</strong> {formData.experience || 'None listed'}</div>
                  <div><strong>Qualifications Count:</strong> {formData.qualifications.filter(q => q.degree).length} degrees filled</div>
                  <div><strong>Prev History Count:</strong> {formData.experiences.filter(e => e.schoolName).length} records filled</div>
                </div>
              </div>

            </div>

            {/* Document checklist reviews */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>Uploaded Documents Review</h4>
                <button type="button" onClick={() => setActiveStep(7)} style={{ background: 'none', border: 'none', color: 'hsl(var(--color-primary))', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
                <div><strong>Photograph:</strong> {files.photo ? <span style={{ color: '#10b981' }}>✔ {files.photo.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>}</div>
                <div><strong>Aadhaar Card:</strong> {files.aadhaarFile ? <span>✔ {files.aadhaarFile.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>}</div>
                <div><strong>PAN Card:</strong> {files.panFile ? <span>✔ {files.panFile.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>}</div>
                <div><strong>Resume/CV Document:</strong> {files.resumeFile ? <span>✔ {files.resumeFile.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>}</div>
                <div><strong>Degrees/Certs:</strong> {files.qualificationFile ? <span>✔ {files.qualificationFile.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>}</div>
                <div><strong>Exp Certificates:</strong> {files.experienceFile ? <span>✔ {files.experienceFile.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>}</div>
                <div><strong>Joining Letter:</strong> {files.joiningLetterFile ? <span>✔ {files.joiningLetterFile.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>}</div>
                <div><strong>Other Docs:</strong> {files.otherFile ? <span>✔ {files.otherFile.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>}</div>
              </div>
            </div>

          </div>
        )}

        {/* STEPPER WIZARD CONTROLS */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '10px',
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '20px'
        }}>
          <div>
            {activeStep > 1 && (
              <button 
                type="button" 
                onClick={handlePrev} 
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={() => { clearDraft(); setActiveView('teachers'); }} 
              className="btn-secondary"
              style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            
            {activeStep < 8 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
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
                  fontWeight: 700,
                  cursor: 'pointer',
                  minWidth: '200px',
                  justifyContent: 'center'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Registering...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Register Teacher
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
