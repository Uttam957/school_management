import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

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

const seedDatabase = () => {
  try {
    console.log('Reading db.json...');
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(data);

    console.log('Cleaning existing student and attendance registers...');
    db.students = [];
    db.attendance = [];

    let stuIdCounter = 2001;
    let attIdCounter = 50001;

    console.log('Generating 480 students across Grades I-XII (Sections A-D)...');
    classes.forEach((c) => {
      sections.forEach((sec) => {
        // Create 10 students per section
        for (let i = 1; i <= 10; i++) {
          const studentId = `STU-${stuIdCounter++}`;
          const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
          const fullName = `${fName} ${lName}`;
          const gender = Math.random() > 0.5 ? 'Male' : 'Female';
          const rollNumber = i < 10 ? `0${i}` : `${i}`;
          const admissionNumber = `ADM-${Math.floor(100000 + Math.random() * 900000)}`;

          // dynamic dob based on class
          // Approximate class number by index
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

          // Generate attendance records for past 6 working dates
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

    console.log(`Pushed ${db.students.length} students into collection...`);
    console.log(`Generated ${db.attendance.length} attendance logs...`);

    // Update first 10 invoices to match our newly generated students to ensure integrity
    if (db.invoices && db.invoices.length > 0) {
      for (let idx = 0; idx < Math.min(db.invoices.length, db.students.length); idx++) {
        db.invoices[idx].name = db.students[idx].fullName;
        db.invoices[idx].grade = `${db.students[idx].studentClass}-${db.students[idx].section}`;
      }
    }

    // Log Activity
    const newActivity = {
      id: `ACT-${Date.now()}`,
      type: 'registration',
      title: 'Database Reseeded',
      desc: `Reseeded 480 students across Grades I-XII A-D and generated 2,880 attendance records`,
      time: 'Just now',
      timestamp: new Date().toISOString(),
      color: 'hsl(var(--color-secondary))',
      bg: 'rgba(hsl(var(--color-secondary)), 0.1)'
    };
    db.activities = [newActivity, ...(db.activities || [])].slice(0, 50);

    console.log('Writing back to db.json...');
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    
    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SUCCESSFULLY SEEDED WITH DUMMY ENTRIES!');
    console.log(`- Total Students: ${db.students.length}`);
    console.log(`- Total Attendance Logs: ${db.attendance.length}`);
    console.log('----------------------------------------------------');

  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

seedDatabase();
