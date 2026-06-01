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

// Helper to read database
const readDb = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    let db = JSON.parse(data);
    if (!db.students || db.students.length < 400) {
      db = autoSeedDatabase(db);
    }
    return db;
  } catch (error) {
    console.error('Error reading db.json in attendance controller:', error);
    return { students: [], teachers: [], staff: [], timetables: [], invoices: [], activities: [], attendance: [] };
  }
};

// Helper to write database
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json in attendance controller:', error);
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

// 1. GET ATTENDANCE ROSTER FOR GIVEN DATE, CLASS, SECTION
export const getAttendanceRoster = (req, res) => {
  try {
    const { date, studentClass, section, search } = req.query;

    if (!date || !studentClass || !section) {
      return res.status(400).json({ error: 'Date, Class, and Section are required filters.' });
    }

    const db = readDb();
    
    // Filter students by class & section
    let filteredStudents = db.students.filter(stu => {
      const matchClass = stu.studentClass === studentClass || stu.grade?.split('-')[0] === studentClass;
      const matchSec = stu.section === section || stu.grade?.split('-')[1] === section;
      return matchClass && matchSec;
    });

    // Apply search filter if present
    if (search && search.trim() !== '') {
      const query = search.toLowerCase();
      filteredStudents = filteredStudents.filter(stu => 
        stu.name.toLowerCase().includes(query) || 
        stu.fullName.toLowerCase().includes(query) ||
        stu.admissionNumber.toLowerCase().includes(query) ||
        (stu.rollNumber && stu.rollNumber.toString().includes(query))
      );
    }

    // Map existing attendance for this date
    const attendanceRecords = db.attendance || [];
    const dateRecords = attendanceRecords.filter(att => att.attendanceDate === date);

    const roster = filteredStudents.map(stu => {
      const existing = dateRecords.find(att => att.studentId === stu.id);
      return {
        id: stu.id,
        rollNumber: stu.rollNumber || stu.roll || 'N/A',
        admissionNumber: stu.admissionNumber,
        fullName: stu.fullName || stu.name,
        photo: stu.photo || '',
        photoBg: stu.photoBg || '',
        studentClass: stu.studentClass || studentClass,
        section: stu.section || section,
        attendanceStatus: existing ? existing.attendanceStatus : '',
        remarks: existing ? existing.remarks : '',
        attendanceId: existing ? existing.attendanceId : null
      };
    });

    res.json(roster);
  } catch (err) {
    console.error('Error fetching attendance roster:', err);
    res.status(500).json({ error: 'Server error loading roster.' });
  }
};

// 2. SAVE OR UPDATE ATTENDANCE ROSTER
export const saveAttendanceRoster = (req, res) => {
  try {
    const { date, records, markedBy, studentClass, section } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid payload. Date and records roster list are required.' });
    }

    const db = readDb();
    if (!db.attendance) db.attendance = [];

    let updatedCount = 0;
    let createdCount = 0;
    const now = new Date().toISOString();

    records.forEach(rec => {
      const { studentId, status, remarks } = rec;
      if (!studentId || !status) return;

      // Find if entry already exists for student on this date
      const existingIndex = db.attendance.findIndex(att => 
        att.studentId === studentId && 
        att.attendanceDate === date
      );

      if (existingIndex > -1) {
        // Update existing record
        db.attendance[existingIndex] = {
          ...db.attendance[existingIndex],
          attendanceStatus: status,
          remarks: remarks || '',
          markedBy: markedBy || 'Teacher',
          updatedAt: now
        };
        updatedCount++;
      } else {
        // Find student details to copy class & section
        const stu = db.students.find(s => s.id === studentId);
        
        // Create new record
        const newRecord = {
          attendanceId: `ATT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          studentId,
          classId: stu?.studentClass || studentClass || 'Unknown',
          sectionId: stu?.section || section || 'Unknown',
          attendanceDate: date,
          attendanceStatus: status,
          remarks: remarks || '',
          markedBy: markedBy || 'Teacher',
          createdAt: now,
          updatedAt: now
        };
        db.attendance.push(newRecord);
        createdCount++;
      }
    });

    // Log Activity
    const classSecLabel = studentClass && section ? `Grade ${studentClass}-${section}` : 'roster';
    addActivity(
      db, 
      'registration', 
      'Attendance Roster Saved', 
      `Saved ${records.length} records for ${classSecLabel} on ${date}`, 
      'hsl(var(--color-secondary))', 
      'rgba(hsl(var(--color-secondary)), 0.1)'
    );

    writeDb(db);
    res.json({ 
      success: true, 
      message: `Attendance marked successfully. Created: ${createdCount}, Updated: ${updatedCount}.` 
    });
  } catch (err) {
    console.error('Error saving attendance roster:', err);
    res.status(500).json({ error: 'Server error saving records.' });
  }
};

// 3. STUDENT REPORT
export const getStudentAttendanceReport = (req, res) => {
  try {
    const { studentClass, section, search } = req.query;

    const db = readDb();
    let filteredStudents = db.students;

    // Filters
    if (studentClass && studentClass !== 'All') {
      filteredStudents = filteredStudents.filter(stu => stu.studentClass === studentClass || stu.grade?.startsWith(studentClass));
    }
    if (section && section !== 'All') {
      filteredStudents = filteredStudents.filter(stu => stu.section === section || stu.grade?.endsWith(section));
    }
    if (search && search.trim() !== '') {
      const query = search.toLowerCase();
      filteredStudents = filteredStudents.filter(stu => 
        stu.name.toLowerCase().includes(query) || 
        stu.fullName.toLowerCase().includes(query) ||
        stu.admissionNumber.toLowerCase().includes(query)
      );
    }

    const attendanceRecords = db.attendance || [];

    const reports = filteredStudents.map(stu => {
      const studentLogs = attendanceRecords.filter(att => att.studentId === stu.id);
      const totalWorkingDays = studentLogs.length;

      const present = studentLogs.filter(att => att.attendanceStatus === 'Present').length;
      const absent = studentLogs.filter(att => att.attendanceStatus === 'Absent').length;
      const leave = studentLogs.filter(att => att.attendanceStatus === 'Leave').length;
      const late = studentLogs.filter(att => att.attendanceStatus === 'Late').length;

      // Late counts as Present in percentage. Leave is excused (excludes from denominator, or counts as 0, or counts fully).
      // Standard SaaS metric: Percentage = (Present + Late) / Total Evaluated Days * 100. If Total is 0, default to 100%.
      let attendancePercentage = 100;
      if (totalWorkingDays > 0) {
        attendancePercentage = Math.round(((present + late) / totalWorkingDays) * 100);
      }

      return {
        id: stu.id,
        fullName: stu.fullName || stu.name,
        admissionNumber: stu.admissionNumber,
        studentClass: stu.studentClass || stu.grade?.split('-')[0] || 'IX',
        section: stu.section || stu.grade?.split('-')[1] || 'A',
        totalWorkingDays,
        present,
        absent,
        leave,
        late,
        attendancePercentage
      };
    });

    res.json(reports);
  } catch (err) {
    console.error('Error generating student attendance report:', err);
    res.status(500).json({ error: 'Server error generating reports.' });
  }
};

// 4. CLASS COHORT REPORT
export const getClassAttendanceReport = (req, res) => {
  try {
    const { date } = req.query;
    const todayStr = date || new Date().toLocaleDateString('en-CA'); // 'en-CA' outputs YYYY-MM-DD in local time
    
    const db = readDb();
    const students = db.students || [];
    const attendanceRecords = db.attendance || [];

    // Group students by Class & Section
    const cohortGroups = {};
    students.forEach(stu => {
      const c = stu.studentClass || stu.grade?.split('-')[0] || 'Unknown';
      const s = stu.section || stu.grade?.split('-')[1] || 'Unknown';
      const key = `${c}-${s}`;
      if (!cohortGroups[key]) {
        cohortGroups[key] = {
          studentClass: c,
          section: s,
          studentIds: []
        };
      }
      cohortGroups[key].studentIds.push(stu.id);
    });

    const reports = Object.entries(cohortGroups).map(([key, group]) => {
      const totalStudents = group.studentIds.length;
      
      // Calculate overall counts for all student logs in this class
      const classLogs = attendanceRecords.filter(att => group.studentIds.includes(att.studentId));
      
      // Filter for target date records
      const targetDateLogs = classLogs.filter(att => att.attendanceDate === todayStr);

      const present = targetDateLogs.filter(att => att.attendanceStatus === 'Present').length;
      const absent = targetDateLogs.filter(att => att.attendanceStatus === 'Absent').length;
      const leave = targetDateLogs.filter(att => att.attendanceStatus === 'Leave').length;
      const late = targetDateLogs.filter(att => att.attendanceStatus === 'Late').length;

      let attendancePercentage = 100;
      const markedCount = targetDateLogs.length;
      if (markedCount > 0) {
        attendancePercentage = Math.round(((present + late) / markedCount) * 100);
      } else {
        // If no records marked for this specific date, default percentage to 100% or 0% depending on style
        // Let's use 100% or calculate historical average
        const totalLogs = classLogs.length;
        if (totalLogs > 0) {
          const histPresent = classLogs.filter(att => att.attendanceStatus === 'Present').length;
          const histLate = classLogs.filter(att => att.attendanceStatus === 'Late').length;
          attendancePercentage = Math.round(((histPresent + histLate) / totalLogs) * 100);
        }
      }

      return {
        studentClass: group.studentClass,
        section: group.section,
        totalStudents,
        presentStudents: present,
        absentStudents: absent,
        leaveStudents: leave,
        lateStudents: late,
        markedStudents: markedCount,
        attendancePercentage
      };
    });

    res.json(reports);
  } catch (err) {
    console.error('Error generating class attendance report:', err);
    res.status(500).json({ error: 'Server error generating cohort reports.' });
  }
};

// 5. MONTHLY CALENDAR ATTENDANCE DATA FOR SINGLE STUDENT
export const getMonthlyCalendarData = (req, res) => {
  try {
    const { studentId, month, year } = req.query;

    if (!studentId || !month || !year) {
      return res.status(400).json({ error: 'Student ID, Month, and Year are required.' });
    }

    const db = readDb();
    const attendanceRecords = db.attendance || [];

    // Filter records for student
    const studentLogs = attendanceRecords.filter(att => att.studentId === studentId);

    // Filter by Month and Year: e.g. YYYY-MM
    // Note: month from query is 1-indexed or 0-indexed. Let's normalize:
    // We will parse month as integer (e.g. 5 for May if 1-indexed, or 4 if 0-indexed). Let's assume standard 1-indexed YYYY-MM string match,
    // but support prefix padding.
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const monthString = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    const datePrefix = `${yearNum}-${monthString}`; // e.2026-06

    const filteredLogs = studentLogs.filter(att => att.attendanceDate.startsWith(datePrefix));

    // Map as dictionary date -> log
    const calendarData = {};
    filteredLogs.forEach(log => {
      calendarData[log.attendanceDate] = {
        status: log.attendanceStatus,
        remarks: log.remarks || '',
        markedBy: log.markedBy || 'Teacher'
      };
    });

    res.json(calendarData);
  } catch (err) {
    console.error('Error generating monthly calendar data:', err);
    res.status(500).json({ error: 'Server error loading calendar statistics.' });
  }
};
