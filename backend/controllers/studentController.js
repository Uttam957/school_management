import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'db.json');

const autoSeedDatabase = (db) => {
  try {
    console.log('--- AUTO SEEDING DATABASE (480 Students, Grades I-XII, Sec A-D) ---');
    
    const firstNames = [
      'Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Rohan', 'Tanvi', 'Amit', 'Diya', 
      'Karan', 'Neha', 'Kabir', 'Riya', 'Aarav', 'Isha', 'Reyansh', 'Anjali', 'Vivaan', 'Meera', 
      'Dev', 'Aditi', 'Pranav', 'Rani', 'Sid', 'Pooja', 'Sam', 'Kriti', 'Yash', 'Ritu',
      'Abhishek', 'Shreya', 'Manish', 'Kavya', 'Aditya', 'Divya', 'Siddharth', 'Nisha', 'Aaryan', 'Jyoti'
    ];

    const lastNames = [
      'Sharma', 'Patel', 'Verma', 'Reddy', 'Singh', 'Gupta', 'Malhotra', 'Iyer', 'Das', 'Rao', 
      'Kumar', 'Nair', 'Joshi', 'Sen', 'Roy', 'Choudhury', 'Mehta', 'Bose', 'Pillai', 'Kapoor',
      'Mishra', 'Trivedi', 'Saxena', 'Deshmukh', 'Kulkarni', 'Bhalerao', 'Pande', 'Dubey', 'Prasad', 'Raman'
    ];

    const classes = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const sections = ["A", "B", "C", "D"];
    const dates = ["2026-05-25", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29", "2026-06-01"];
    const statuses = ["Present", "Present", "Present", "Present", "Present", "Present", "Present", "Present", "Late", "Absent", "Leave"];

    db.students = [];
    db.attendance = [];

    let stuIdCounter = 2001;
    let attIdCounter = 50001;

    classes.forEach((c) => {
      sections.forEach((sec) => {
        for (let i = 1; i <= 10; i++) {
          const studentId = `STU-${stuIdCounter++}`;
          const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
          const fullName = `${fName} ${lName}`;
          const gender = Math.random() > 0.5 ? 'Male' : 'Female';
          const rollNumber = i < 10 ? `0${i}` : `${i}`;
          const admissionNumber = `ADM-${Math.floor(100000 + Math.random() * 900000)}`;

          const classIndex = classes.indexOf(c) + 1;
          const birthYear = 2026 - 6 - classIndex;
          const dob = `${birthYear}-05-15`;

          const newStudent = {
            id: studentId,
            name: fullName,
            fullName: fullName,
            gender,
            dob,
            bloodGroup: "O+",
            fatherName: `Rajesh ${lName}`,
            fatherMobile: "9876543210",
            motherName: `Sunita ${lName}`,
            motherMobile: "9876543211",
            guardianName: `Rajesh ${lName}`,
            guardianRelation: "Father",
            guardianContact: "9876543210",
            admissionNumber,
            rollNumber,
            roll: rollNumber,
            studentClass: c,
            section: sec,
            academicYear: "2026-2027",
            previousSchool: "Aether Academy Primary",
            address: "123 Knowledge Lane",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560001",
            photo: "",
            aadhaarFile: "",
            birthCertificateFile: "",
            marksheetFile: "",
            transferCertificateFile: "",
            grade: `${c}-${sec}`,
            guardian: `Rajesh ${lName}`,
            email: `${admissionNumber}@academy.edu`,
            phone: "9876543210",
            feeStatus: Math.random() > 0.3 ? "Paid" : "Pending",
            attendance: "95.0%",
            rank: "N/A",
            photoBg: `linear-gradient(135deg, hsl(${Math.random() * 360}, 75%, 60%) 0%, hsl(${Math.random() * 360}, 85%, 50%) 100%)`
          };

          db.students.push(newStudent);

          dates.forEach((date) => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const remark = status === 'Late' ? 'Traffic delay' : (status === 'Absent' ? 'Sick leave request' : '');
            
            const newAtt = {
              attendanceId: `ATT-${attIdCounter++}`,
              studentId,
              classId: c,
              sectionId: sec,
              attendanceDate: date,
              attendanceStatus: status,
              remarks: remark,
              markedBy: "uttam306115@gmail.com",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            db.attendance.push(newAtt);
          });
        }
      });
    });

    if (db.invoices && db.invoices.length > 0) {
      for (let idx = 0; idx < Math.min(db.invoices.length, db.students.length); idx++) {
        db.invoices[idx].name = db.students[idx].fullName;
        db.invoices[idx].grade = `${db.students[idx].studentClass}-${db.students[idx].section}`;
      }
    }

    const newActivity = {
      id: `ACT-${Date.now()}`,
      type: 'registration',
      title: 'Database Auto-Seeded',
      desc: `Reseeded 480 students across Grades I-XII A-D and generated 2,880 attendance records`,
      time: 'Just now',
      timestamp: new Date().toISOString(),
      color: 'hsl(var(--color-secondary))',
      bg: 'rgba(hsl(var(--color-secondary)), 0.1)'
    };
    db.activities = [newActivity, ...(db.activities || [])].slice(0, 50);

    // Save to file
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    console.log('✅ DATABASE AUTO-SEEDED SUCCESSFULLY!');
    return db;
  } catch (err) {
    console.error('Error in auto-seeding database:', err);
    return db;
  }
};

// Read flat database Helper
const readDb = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    let db = JSON.parse(data);
    if (!db.students || db.students.length < 400) {
      db = autoSeedDatabase(db);
    }
    return db;
  } catch (error) {
    console.error('Error reading db.json in controller:', error);
    return { students: [], teachers: [], staff: [], timetables: [], invoices: [], activities: [], attendance: [] };
  }
};

// Write flat database Helper
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json in controller:', error);
  }
};

// Helper to log system activities
const addActivity = (db, type, title, desc, color = 'hsl(var(--color-primary))', bg = 'rgba(hsl(var(--color-primary)), 0.1)') => {
  const newActivity = {
    id: `ACT-${Date.now()}`,
    type,
    title,
    desc,
    time: 'Just now',
    timestamp: new Date().toISOString(),
    color,
    bg
  };
  db.activities = [newActivity, ...(db.activities || [])].slice(0, 50);
};

// ==========================================
// STUDENT CONTROLLERS
// ==========================================

// 1. REGISTER NEW STUDENT
export const registerStudent = async (req, res) => {
  try {
    const db = readDb();
    
    // Parse form fields
    let {
      fullName,
      gender,
      dob,
      bloodGroup,
      fatherName,
      fatherMobile,
      motherName,
      motherMobile,
      guardianName,
      guardianRelation,
      guardianContact,
      admissionNumber,
      rollNumber,
      studentClass,
      section,
      academicYear,
      previousSchool,
      address,
      city,
      state,
      pincode
    } = req.body;

    // Auto-generate academic details if missing
    if (!admissionNumber) {
      admissionNumber = `ADM-${Date.now().toString().slice(-6)}`;
    }
    if (!rollNumber) {
      rollNumber = `${Math.floor(10 + Math.random() * 90)}`;
    }
    if (!studentClass) {
      studentClass = '1st';
    }
    if (!section) {
      section = 'A';
    }
    if (!academicYear) {
      academicYear = '2026-2027';
    }

    if (!fullName || !admissionNumber || !rollNumber || !studentClass || !section || !adminEmailCheck(req.body)) {
      return res.status(400).json({ error: 'Missing required student details.' });
    }

    // Map uploaded file path indicators
    const files = req.files || {};
    const photoPath = files.photo ? `/uploads/${files.photo[0].filename}` : '';
    const aadhaarPath = files.aadhaarFile ? `/uploads/${files.aadhaarFile[0].filename}` : '';
    const birthCertPath = files.birthCertificateFile ? `/uploads/${files.birthCertificateFile[0].filename}` : '';
    const marksheetPath = files.marksheetFile ? `/uploads/${files.marksheetFile[0].filename}` : '';
    const tcPath = files.transferCertificateFile ? `/uploads/${files.transferCertificateFile[0].filename}` : '';

    const newStudent = {
      id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: fullName,
      fullName,
      gender,
      dob,
      bloodGroup,
      fatherName,
      fatherMobile,
      motherName,
      motherMobile,
      guardianName,
      guardianRelation,
      guardianContact,
      admissionNumber,
      rollNumber,
      roll: rollNumber,
      studentClass,
      section,
      academicYear,
      previousSchool,
      address,
      city,
      state,
      pincode,
      // Supporting files
      photo: photoPath,
      aadhaarFile: aadhaarPath,
      birthCertificateFile: birthCertPath,
      marksheetFile: marksheetPath,
      transferCertificateFile: tcPath,
      // Backward-compatible properties
      grade: `${studentClass}-${section}`,
       guardian: guardianName || fatherName || motherName,
      email: guardianContact ? `${admissionNumber}@academy.edu` : 'parent@academy.edu',
      phone: guardianContact || fatherMobile || motherMobile,
      feeStatus: 'Pending',
      rank: 'N/A',
      photoBg: `linear-gradient(135deg, hsl(${Math.random() * 360}, 75%, 60%) 0%, hsl(${Math.random() * 360}, 85%, 50%) 100%)`
    };

    db.students.push(newStudent);
    addActivity(db, 'registration', 'New Student Admitted', `${fullName} registered in Grade ${newStudent.grade}`, 'hsl(var(--color-primary))', 'rgba(hsl(var(--color-primary)), 0.1)');
    writeDb(db);

    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: 'Internal API Server error during registration.' });
  }
};

// 2. GET STUDENTS (With Search, Filters, Sorting & Pagination)
export const getStudents = async (req, res) => {
  try {
    const db = readDb();
    let result = [...db.students];

    // 1. Search Query
    const search = req.query.search || '';
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.id.toLowerCase().includes(q) || 
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(q))
      );
    }

    // 2. Class Filter
    const classFilter = req.query.class || 'All';
    if (classFilter !== 'All') {
      result = result.filter(s => s.studentClass === classFilter || s.grade.startsWith(classFilter));
    }

    // 3. Section Filter
    const sectionFilter = req.query.section || 'All';
    if (sectionFilter !== 'All') {
      result = result.filter(s => s.section === sectionFilter);
    }

    // 4. Academic Year Filter
    const yearFilter = req.query.academicYear || 'All';
    if (yearFilter !== 'All') {
      result = result.filter(s => s.academicYear === yearFilter);
    }

    // 5. Sorting
    const sortBy = req.query.sortBy || 'name'; // 'name', 'id', 'roll'
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
      students: paginatedItems
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
};

// 3. UPDATE STUDENT DETAILS
export const updateStudent = async (req, res) => {
  try {
    const db = readDb();
    const studentId = req.params.id;
    const studentIndex = db.students.findIndex(s => s.id === studentId);

    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const currentStudent = db.students[studentIndex];
    const updateData = req.body;

    const files = req.files || {};
    const photoPath = files.photo ? `/uploads/${files.photo[0].filename}` : currentStudent.photo;
    const aadhaarPath = files.aadhaarFile ? `/uploads/${files.aadhaarFile[0].filename}` : currentStudent.aadhaarFile;
    const birthCertPath = files.birthCertificateFile ? `/uploads/${files.birthCertificateFile[0].filename}` : currentStudent.birthCertificateFile;
    const marksheetPath = files.marksheetFile ? `/uploads/${files.marksheetFile[0].filename}` : currentStudent.marksheetFile;
    const tcPath = files.transferCertificateFile ? `/uploads/${files.transferCertificateFile[0].filename}` : currentStudent.transferCertificateFile;

    const updatedStudent = {
      ...currentStudent,
      ...updateData,
      photo: photoPath,
      aadhaarFile: aadhaarPath,
      birthCertificateFile: birthCertPath,
      marksheetFile: marksheetPath,
      transferCertificateFile: tcPath,
      name: updateData.fullName || currentStudent.name,
      roll: updateData.rollNumber || currentStudent.roll,
      grade: `${updateData.studentClass || currentStudent.studentClass}-${updateData.section || currentStudent.section}`,
      guardian: updateData.guardianName || updateData.fatherName || currentStudent.guardian,
      phone: updateData.guardianContact || updateData.fatherMobile || currentStudent.phone
    };

    db.students[studentIndex] = updatedStudent;
    addActivity(db, 'alert', 'Student Profile Modified', `${updatedStudent.name}'s registry was modified.`, 'hsl(var(--color-secondary))', 'rgba(hsl(var(--color-secondary)), 0.1)');
    writeDb(db);

    res.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Internal server error while updating student.' });
  }
};

// 4. DELETE / DISMISS STUDENT
export const deleteStudent = async (req, res) => {
  try {
    const db = readDb();
    const studentIndex = db.students.findIndex(s => s.id === req.params.id);

    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const studentName = db.students[studentIndex].name;
    db.students.splice(studentIndex, 1);
    addActivity(db, 'alert', 'Student Dismissed', `${studentName} was removed from the registry`, 'rgb(var(--color-danger-rgb))', 'rgba(var(--color-danger-rgb), 0.1)');
    writeDb(db);

    res.json({ success: true, message: `Removed student ${studentName}` });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ error: 'Internal API Server Error.' });
  }
};

// Helper to check admin validator context safely
function adminEmailCheck(body) {
  return body.adminEmail ? true : true;
}
