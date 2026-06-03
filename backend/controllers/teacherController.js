import { readDb, writeDb, addActivity } from '../utils/db.js';

// ========================================================
// TEACHER CRUD CONTROLLERS
// ========================================================

// 1. REGISTER NEW TEACHER
export const registerTeacher = async (req, res) => {
  try {
    const db = readDb();
    
    // Parse form parameters
    const {
      fullName,
      gender,
      dob,
      bloodGroup,
      maritalStatus,
      mobile,
      alternateMobile,
      email,
      address,
      city,
      state,
      pincode,
      teacherId,
      department,
      subjectSpecialization,
      qualification,
      experience,
      joiningDate,
      salary,
      employmentType,
      username,
      password
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !mobile || !teacherId || !department || !subjectSpecialization || !username || !password) {
      return res.status(400).json({ error: 'Missing required teacher registration details.' });
    }

    // Check username uniqueness
    const usernameExists = db.teachers.some(t => t.username === username);
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already exists. Please choose a different one.' });
    }

    // Generate unique employee ID (Format: EMP-2026-XXXX)
    let employeeId;
    let isUnique = false;
    while (!isUnique) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      employeeId = `EMP-2026-${randNum}`;
      isUnique = !db.teachers.some(t => t.employeeId === employeeId);
    }

    // Map uploaded file routes
    const files = req.files || {};
    const photoPath = files.photo ? `/uploads/${files.photo[0].filename}` : '';
    const aadhaarPath = files.aadhaarFile ? `/uploads/${files.aadhaarFile[0].filename}` : '';
    const resumePath = files.resumeFile ? `/uploads/${files.resumeFile[0].filename}` : '';
    const qualificationPath = files.qualificationFile ? `/uploads/${files.qualificationFile[0].filename}` : '';
    const experiencePath = files.experienceFile ? `/uploads/${files.experienceFile[0].filename}` : '';

    const newTeacher = {
      id: employeeId, // Direct backward compatibility index
      employeeId,
      teacherId,
      name: fullName, // Legacy compatibility
      fullName,
      gender,
      dob,
      bloodGroup,
      maritalStatus,
      mobile,
      alternateMobile,
      email,
      address,
      city,
      state,
      pincode,
      department,
      subjectSpecialization,
      qualification,
      experience: experience || '0',
      joiningDate,
      salary: salary || '0',
      employmentType,
      status: 'Active', // Default status: "Active", "Inactive", "On Leave"
      username,
      password, // Plain text or hash depending on system architecture
      
      // Uploaded documents
      photo: photoPath,
      aadhaarFile: aadhaarPath,
      resumeFile: resumePath,
      qualificationFile: qualificationPath,
      experienceFile: experiencePath,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Legacy compatibility mappings
      subject: subjectSpecialization,
      phone: mobile,
      classes: 0,
      hours: 0,
      badge: 'Faculty',
      avatarBg: `linear-gradient(135deg, hsl(${Math.random() * 360}, 75%, 60%) 0%, hsl(${Math.random() * 360}, 85%, 50%) 100%)`
    };

    db.teachers.push(newTeacher);
    addActivity(db, 'registration', 'New Faculty Registered', `${fullName} joined ${department} Department as ${employmentType}`, 'hsl(var(--color-secondary))', 'rgba(hsl(var(--color-secondary)), 0.1)');
    writeDb(db);

    res.status(201).json(newTeacher);
  } catch (error) {
    console.error('Error registering teacher:', error);
    res.status(500).json({ error: 'Internal API Server error during teacher registration.' });
  }
};

// 2. GET ALL TEACHERS (With Search, Filters, Sorting & Pagination)
export const getTeachers = async (req, res) => {
  try {
    const db = readDb();
    let result = [...(db.teachers || [])];

    // 1. Search Query (matches Employee ID, Name, Department)
    const search = req.query.search || '';
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(t => 
        (t.fullName && t.fullName.toLowerCase().includes(q)) || 
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.employeeId && t.employeeId.toLowerCase().includes(q)) || 
        (t.department && t.department.toLowerCase().includes(q)) ||
        (t.subjectSpecialization && t.subjectSpecialization.toLowerCase().includes(q))
      );
    }

    // 2. Department Filter
    const deptFilter = req.query.department || 'All';
    if (deptFilter !== 'All') {
      result = result.filter(t => t.department === deptFilter);
    }

    // 3. Employment Type Filter
    const typeFilter = req.query.employmentType || 'All';
    if (typeFilter !== 'All') {
      result = result.filter(t => t.employmentType === typeFilter);
    }

    // 4. Status Filter (Active, Inactive, On Leave)
    const statusFilter = req.query.status || 'All';
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    // 5. Sorting
    const sortBy = req.query.sortBy || 'name'; // 'name', 'employeeId', 'joiningDate', 'department'
    const sortOrder = req.query.sortOrder || 'asc';
    result.sort((a, b) => {
      let valA = a[sortBy] ? a[sortBy].toString().toLowerCase() : '';
      let valB = b[sortBy] ? b[sortBy].toString().toLowerCase() : '';
      
      if (sortOrder === 'asc') {
        return valA.localeCompare(valB, undefined, { numeric: true });
      } else {
        return valB.localeCompare(valA, undefined, { numeric: true });
      }
    });

    // 6. Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedItems = result.slice(startIndex, endIndex);

    res.json({
      totalCount: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit),
      teachers: paginatedItems
    });
  } catch (error) {
    console.error('Error fetching teachers registry:', error);
    res.status(500).json({ error: 'Internal Server Error fetching teachers roster.' });
  }
};

// 3. GET SINGLE TEACHER BY ID
export const getTeacherById = async (req, res) => {
  try {
    const db = readDb();
    const teacher = db.teachers.find(t => t.employeeId === req.params.id || t.id === req.params.id);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher profile not found.' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Error fetching single teacher profile:', error);
    res.status(500).json({ error: 'Internal server error fetching teacher profile.' });
  }
};

// 4. UPDATE TEACHER
export const updateTeacher = async (req, res) => {
  try {
    const db = readDb();
    const teacherId = req.params.id;
    const teacherIndex = db.teachers.findIndex(t => t.employeeId === teacherId || t.id === teacherId);

    if (teacherIndex === -1) {
      return res.status(404).json({ error: 'Teacher profile not found.' });
    }

    const currentTeacher = db.teachers[teacherIndex];
    const updateData = req.body;

    // Check username uniqueness if modified
    if (updateData.username && updateData.username !== currentTeacher.username) {
      const usernameExists = db.teachers.some(t => t.username === updateData.username);
      if (usernameExists) {
        return res.status(400).json({ error: 'Username already exists.' });
      }
    }

    // Process files
    const files = req.files || {};
    const photoPath = files.photo ? `/uploads/${files.photo[0].filename}` : currentTeacher.photo;
    const aadhaarPath = files.aadhaarFile ? `/uploads/${files.aadhaarFile[0].filename}` : currentTeacher.aadhaarFile;
    const resumePath = files.resumeFile ? `/uploads/${files.resumeFile[0].filename}` : currentTeacher.resumeFile;
    const qualificationPath = files.qualificationFile ? `/uploads/${files.qualificationFile[0].filename}` : currentTeacher.qualificationFile;
    const experiencePath = files.experienceFile ? `/uploads/${files.experienceFile[0].filename}` : currentTeacher.experienceFile;

    const updatedTeacher = {
      ...currentTeacher,
      ...updateData,
      photo: photoPath,
      aadhaarFile: aadhaarPath,
      resumeFile: resumePath,
      qualificationFile: qualificationPath,
      experienceFile: experiencePath,
      name: updateData.fullName || currentTeacher.name, // Compatibility
      phone: updateData.mobile || currentTeacher.phone, // Compatibility
      subject: updateData.subjectSpecialization || currentTeacher.subject, // Compatibility
      updatedAt: new Date().toISOString()
    };

    db.teachers[teacherIndex] = updatedTeacher;
    addActivity(db, 'alert', 'Teacher Profile Modified', `${updatedTeacher.name}'s professional records were updated.`, 'hsl(var(--color-secondary))', 'rgba(hsl(var(--color-secondary)), 0.1)');
    writeDb(db);

    res.json(updatedTeacher);
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    res.status(500).json({ error: 'Internal server error while updating teacher details.' });
  }
};

// 5. DELETE / DISMISS TEACHER
export const deleteTeacher = async (req, res) => {
  try {
    const db = readDb();
    const teacherId = req.params.id;
    const teacherIndex = db.teachers.findIndex(t => t.employeeId === teacherId || t.id === teacherId);

    if (teacherIndex === -1) {
      return res.status(404).json({ error: 'Teacher profile not found.' });
    }

    const teacherName = db.teachers[teacherIndex].name;
    db.teachers.splice(teacherIndex, 1);
    addActivity(db, 'alert', 'Faculty Dismissed', `${teacherName} was removed from the roster`, 'rgb(var(--color-danger-rgb))', 'rgba(var(--color-danger-rgb), 0.1)');
    writeDb(db);

    res.json({ success: true, message: `Successfully dismissed teacher ${teacherName}` });
  } catch (error) {
    console.error('Error removing teacher record:', error);
    res.status(500).json({ error: 'Internal server error dismissing teacher.' });
  }
};
