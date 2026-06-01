import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Helper to read database
const readDb = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json, returning empty structure:', error);
    return { students: [], teachers: [], staff: [], timetables: [], invoices: [], activities: [], school: { name: "Aether Academy", principal: "Alex Devlin" } };
  }
};

// Helper to write database (formatted with indentation for clean manual editing)
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
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
  db.activities = [newActivity, ...(db.activities || [])].slice(0, 50); // Keep last 50
};

// ==========================================
// 1. STUDENTS ROUTER & STATIC UPLOADS
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/students', studentRoutes);

// ==========================================
// 2. TEACHERS ROUTER
// ==========================================
app.use('/api/teachers', teacherRoutes);

// ==========================================
// 2A. ATTENDANCE ROUTER
// ==========================================
app.use('/api/attendance', attendanceRoutes);

// ==========================================
// 2B. STAFF ENDPOINTS
// ==========================================
app.get('/api/staff', (req, res) => {
  const db = readDb();
  res.json(db.staff || []);
});

app.post('/api/staff', (req, res) => {
  const { name, role, department, email, phone, status } = req.body;

  if (!name || !role || !department || !email || !phone) {
    return res.status(400).json({ error: 'Missing required staff details.' });
  }

  const db = readDb();
  const newStaff = {
    id: `STF-${Math.floor(100 + Math.random() * 900)}`,
    name,
    role,
    department,
    email,
    phone,
    status: status || 'Active',
    avatarBg: `linear-gradient(135deg, hsl(${Math.random() * 360}, 75%, 60%) 0%, hsl(${Math.random() * 360}, 85%, 50%) 100%)`
  };

  if (!db.staff) db.staff = [];
  db.staff.push(newStaff);
  addActivity(db, 'registration', 'New Staff Recruited', `${name} joined as ${role}`, 'hsl(var(--color-info))', 'rgba(hsl(var(--color-info)), 0.1)');
  writeDb(db);

  res.status(201).json(newStaff);
});

app.delete('/api/staff/:id', (req, res) => {
  const db = readDb();
  if (!db.staff) db.staff = [];
  const staffIndex = db.staff.findIndex(s => s.id === req.params.id);

  if (staffIndex === -1) {
    return res.status(404).json({ error: 'Staff profile not found.' });
  }

  const staffName = db.staff[staffIndex].name;
  db.staff.splice(staffIndex, 1);
  addActivity(db, 'alert', 'Staff Dismissed', `${staffName} was removed from the roster`, 'rgb(var(--color-danger-rgb))', 'rgba(var(--color-danger-rgb), 0.1)');
  writeDb(db);

  res.json({ success: true, message: `Removed staff ${staffName}` });
});

// ==========================================
// 3. ACADEMICS ENDPOINTS
// ==========================================
app.get('/api/timetables', (req, res) => {
  const db = readDb();
  res.json(db.timetables);
});

app.post('/api/timetables', (req, res) => {
  const { cohort, time, mon, tue, wed, thu, fri } = req.body;

  if (!cohort || !time) {
    return res.status(400).json({ error: 'Cohort and slot time are required.' });
  }

  const db = readDb();
  
  // Find or create timetable slot
  const newSlot = {
    time,
    mon: mon || { subject: 'Free Study', teacher: 'N/A', room: 'Library' },
    tue: tue || { subject: 'Free Study', teacher: 'N/A', room: 'Library' },
    wed: wed || { subject: 'Free Study', teacher: 'N/A', room: 'Library' },
    thu: thu || { subject: 'Free Study', teacher: 'N/A', room: 'Library' },
    fri: fri || { subject: 'Free Study', teacher: 'N/A', room: 'Library' }
  };

  // Find if slot exists, else append
  db.timetables.push({ cohort, ...newSlot });
  writeDb(db);

  res.status(201).json(newSlot);
});

// ==========================================
// 4. INVOICE ENDPOINTS
// ==========================================
app.get('/api/invoices', (req, res) => {
  const db = readDb();
  res.json(db.invoices);
});

app.post('/api/invoices', (req, res) => {
  const { name, grade, amount, status, method } = req.body;

  if (!name || !grade || !amount) {
    return res.status(400).json({ error: 'Student name, grade, and amount are required.' });
  }

  const db = readDb();
  const cleanAmount = amount.startsWith('$') ? amount : `$${amount}`;
  const newInvoice = {
    invoiceNo: `INV-${Math.floor(4000 + Math.random() * 1000)}`,
    name,
    grade,
    amount: cleanAmount,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    status: status || 'Pending',
    method: status === 'Paid' ? (method || 'Direct Cash') : 'N/A'
  };

  db.invoices.push(newInvoice);

  if (status === 'Paid') {
    addActivity(db, 'finance', 'Tuition Receipt Generated', `Payment of ${cleanAmount} verified for ${name}`, 'rgb(var(--color-success-rgb))', 'rgba(var(--color-success-rgb), 0.1)');
  } else {
    addActivity(db, 'finance', 'Tuition Invoiced', `New tuition bill of ${cleanAmount} generated for ${name}`, 'rgb(var(--color-warning-rgb))', 'rgba(var(--color-warning-rgb), 0.1)');
  }

  writeDb(db);
  res.status(201).json(newInvoice);
});

// ==========================================
// 4B. SCHOOL PROFILE ENDPOINTS
// ==========================================
app.get('/api/school', (req, res) => {
  const db = readDb();
  res.json(db.school || { name: "Aether Academy", principal: "Alex Devlin" });
});

app.post('/api/school', (req, res) => {
  const { 
    name, 
    subdomain, 
    address, 
    city, 
    state, 
    phone, 
    email, 
    ratePerStudent, 
    razorpayAccountId, 
    adminName, 
    adminEmail, 
    adminPassword 
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'School brand name is required.' });
  }
  if (!adminEmail) {
    return res.status(400).json({ error: 'Admin email is required.' });
  }

  const db = readDb();
  
  // Preserve or update password
  let savedPassword = db.school?.adminPassword || 'admin123';
  if (adminPassword && adminPassword.trim() !== '') {
    savedPassword = adminPassword;
  }

  db.school = {
    ...db.school,
    name,
    subdomain: subdomain || '',
    address: address || '',
    city: city || '',
    state: state || '',
    phone: phone || '',
    email: email || '',
    ratePerStudent: ratePerStudent || '250.00',
    razorpayAccountId: razorpayAccountId || '',
    adminName: adminName || 'Rajesh Kumar',
    adminEmail,
    adminPassword: savedPassword,
    principal: adminName || 'Rajesh Kumar' // Keep fallback compatibility
  };

  addActivity(db, 'alert', 'School Profile Modified', `Global branding variables updated manually`, 'hsl(var(--color-primary))', 'rgba(hsl(var(--color-primary)), 0.1)');
  writeDb(db);

  res.json(db.school);
});

// ==========================================
// 5. OVERVIEW DYNAMIC ANALYTICS SUMMARY
// ==========================================
app.get('/api/overview', (req, res) => {
  const db = readDb();

  // Dynamic statistics sums
  const totalStudents = db.students.length;
  const totalTeachers = db.teachers.length;
  const totalStaff = (db.staff || []).length;



  // Calculate monthly revenue collections
  const revenueTotal = db.invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((acc, curr) => acc + parseInt(curr.amount.replace(/[^0-9]/g, '') || 0), 0);

  // Return telemetry payload
  res.json({
    totalStudents: totalStudents.toString(),
    totalTeachers: totalTeachers.toString(),
    totalStaff: totalStaff.toString(),
    revenueTotal: `$${revenueTotal.toLocaleString()}`,
    activities: db.activities.slice(0, 5),
    studentsList: db.students,
    teachersList: db.teachers,
    staffList: db.staff || [],
    invoicesList: db.invoices,
    school: db.school || { name: "Aether Academy", principal: "Alex Devlin" }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Aether Server running at http://localhost:${PORT}`);
});
