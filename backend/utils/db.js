import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AsyncLocalStorage } from 'async_hooks';
import * as sqlDb from './sqlDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GLOBAL_DB_FILE = path.join(__dirname, '..', 'db.json');
const TENANTS_DIR = path.join(__dirname, '..', 'tenants');
const SCHEMA_FILE = path.join(__dirname, '..', 'schema.sql');

// Ensure tenants directory exists
if (!fs.existsSync(TENANTS_DIR)) {
  fs.mkdirSync(TENANTS_DIR, { recursive: true });
}

// Global AsyncLocalStorage to store tenant subdomain for the active request context
export const tenantStorage = new AsyncLocalStorage();

// Slugify helper
export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};

// Middleware to restore tenant context lost during async processing
export const restoreTenantContext = (req, res, next) => {
  let tenantId = req.headers['x-tenant-id'] || req.query.tenantId;
  if (!tenantId && req.headers.host) {
    const host = req.headers.host;
    const parts = host.split('.');
    if (parts.length > 2 || (parts.length === 2 && !parts[1].startsWith('localhost'))) {
      tenantId = parts[0];
    }
  }
  
  if (tenantId) {
    tenantStorage.run(slugify(tenantId), () => {
      next();
    });
  } else {
    tenantStorage.run(null, () => {
      next();
    });
  }
};

// Dynamic database path selector (JSON fallback)
export const getDbPath = () => {
  const tenantId = tenantStorage.getStore();
  if (tenantId && tenantId !== 'platform' && tenantId !== 'localhost') {
    return path.join(TENANTS_DIR, `db_${tenantId}.json`);
  }
  return GLOBAL_DB_FILE;
};

// ==========================================
// SQL CACHING & SYNC ADAPTER
// ==========================================

// Global in-memory cache for tenants.
// Map of tenantId -> database object structure
const dbCache = {};
let isSqlInitialized = false;

// Helper to check if MySQL is running and active
export const isSqlActive = () => {
  const pool = sqlDb.getPool();
  return !!pool && isSqlInitialized;
};

// Execute schema.sql to initialize database tables
const createTablesFromSchema = async () => {
  try {
    if (!fs.existsSync(SCHEMA_FILE)) {
      console.warn(`[SQL Init] Schema file not found at ${SCHEMA_FILE}`);
      return;
    }
    const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
    
    // Strip single-line comments and split by semicolon
    const cleanLines = schemaSql
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('--') && !line.startsWith('#'));
    
    const queries = cleanLines
      .join(' ')
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log(`[SQL Init] Executing ${queries.length} DDL statements to construct tables...`);
    for (const sql of queries) {
      try {
        await sqlDb.query(sql);
      } catch (err) {
        console.error('[SQL Schema Execute Error]', err.message);
        console.error('Failed statement:', sql);
      }
    }
    console.log('[SQL Init] Database tables verified/created successfully.');

    // Ensure ratePerStudent column exists in schools table
    try {
      await sqlDb.query("ALTER TABLE schools ADD COLUMN ratePerStudent VARCHAR(50) DEFAULT '250.00'");
      console.log("[SQL Init] Added missing column ratePerStudent to schools table.");
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.warn("[SQL Init WARNING] Failed to check/add ratePerStudent column:", err.message);
      }
    }

    // Ensure transportRequired and hostelRequired columns exist in students table
    try {
      await sqlDb.query("ALTER TABLE students ADD COLUMN transportRequired VARCHAR(50) DEFAULT 'No'");
      console.log("[SQL Init] Added missing column transportRequired to students table.");
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.warn("[SQL Init WARNING] Failed to check/add transportRequired column:", err.message);
      }
    }
    try {
      await sqlDb.query("ALTER TABLE students ADD COLUMN hostelRequired VARCHAR(50) DEFAULT 'No'");
      console.log("[SQL Init] Added missing column hostelRequired to students table.");
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.warn("[SQL Init WARNING] Failed to check/add hostelRequired column:", err.message);
      }
    }
  } catch (err) {
    console.error('[SQL Init ERROR] Failed to run schema DDL:', err);
  }
};

// Migrate legacy JSON databases (db.json and tenant files) to MySQL
const migrateJsonToSql = async () => {
  try {
    // Check if schools table is empty
    const existingSchools = await sqlDb.query('SELECT COUNT(*) as cnt FROM schools');
    if (existingSchools[0].cnt > 0) {
      console.log('[SQL Migrate] Database is already populated. Skipping migration.');
      return;
    }

    console.log('[SQL Migrate] No schools found. Starting legacy JSON database migration to MySQL...');

    // 1. Read Global Platform DB
    let globalDb = {};
    if (fs.existsSync(GLOBAL_DB_FILE)) {
      globalDb = JSON.parse(fs.readFileSync(GLOBAL_DB_FILE, 'utf8'));
    }

    const schools = globalDb.schools || [];
    const subscriptionPlans = globalDb.subscriptionPlans || [];

    // Seed subscription plans
    for (const plan of subscriptionPlans) {
      await sqlDb.query(
        'INSERT INTO subscription_plans (id, name, price, features) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [plan.id, plan.name, plan.price, JSON.stringify(plan.features || [])]
      );
    }

    // Seed global platform activities
    const globalActivities = globalDb.activities || [];
    for (const act of globalActivities) {
      await sqlDb.query(
        'INSERT INTO activities (id, type, title, description, time, timestamp, color, bg, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [act.id, act.type, act.title, act.desc || act.description, act.time, act.timestamp, act.color, act.bg, 'platform']
      );
    }

    // 2. Scan and migrate schools & tenants
    for (const school of schools) {
      console.log(`[SQL Migrate] Migrating school: ${school.name} (${school.subdomain})...`);
      
      // Save school profile
      await sqlDb.query(
        `INSERT INTO schools (
          id, name, code, subdomain, logo, principalName, email, phone, address, city, state, country, 
          academicSession, subscriptionPlan, url, status, adminName, adminEmail, adminUsername, adminPassword, 
          complexAdminUsername, complexAdminPassword, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          school.id, school.name, school.code, school.subdomain, school.logo, school.principalName, school.email, 
          school.phone, school.address, school.city, school.state, school.country, school.academicSession, 
          school.subscriptionPlan, school.url, school.status, school.adminName, school.adminEmail, 
          school.adminUsername, school.adminPassword, school.complexAdminUsername || '', school.complexAdminPassword || '', 
          school.createdAt
        ]
      );

      // Try loading tenant db.json
      const tenantFile = path.join(TENANTS_DIR, `db_${school.subdomain}.json`);
      if (fs.existsSync(tenantFile)) {
        try {
          const tenantDb = JSON.parse(fs.readFileSync(tenantFile, 'utf8'));
          const tenantId = school.subdomain;

          // Seed teachers
          const teachers = tenantDb.teachers || [];
          for (const t of teachers) {
            await sqlDb.query(
              `INSERT INTO teachers (
                id, name, email, phone, username, password, gender, qualification, experience, dateOfJoining, 
                salaryGrade, address, city, state, pincode, emergencyContact, emergencyPhone, photo, aadharFile, 
                certificateFile, status, avatarBg, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                t.id, t.name, t.email, t.phone, t.username, t.password, t.gender, t.qualification, t.experience, 
                t.dateOfJoining, t.salaryGrade, t.address, t.city, t.state, t.pincode, t.emergencyContact, 
                t.emergencyPhone, t.photo, t.aadharFile, t.certificateFile, t.status || 'Active', t.avatarBg, tenantId
              ]
            );
          }

          // Seed staff
          const staff = tenantDb.staff || [];
          for (const s of staff) {
            await sqlDb.query(
              `INSERT INTO staff (
                id, name, fullName, role, department, email, phone, gender, qualification, experience, 
                dateOfJoining, salaryGrade, reportingTo, address, city, state, pincode, emergencyContact, 
                emergencyPhone, photo, aadharFile, certificateFile, status, avatarBg, password, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                s.id, s.name, s.fullName, s.role, s.department, s.email, s.phone, s.gender, s.qualification, 
                s.experience, s.dateOfJoining, s.salaryGrade, s.reportingTo, s.address, s.city, s.state, s.pincode, 
                s.emergencyContact, s.emergencyPhone, s.photo, s.aadharFile, s.certificateFile, s.status || 'Active', 
                s.avatarBg, s.password, tenantId
              ]
            );
          }

          // Seed students (Normalized Tables)
          const students = tenantDb.students || [];
          for (const s of students) {
            // Write core student profile
            await sqlDb.query(
              `INSERT INTO students (
                id, firstName, middleName, lastName, name, fullName, admissionNumber, admissionDate, dob, 
                gender, bloodGroup, nationality, category, religion, aadhaarNumber, photo, status, photoBg, 
                email, phone, feeStatus, \`rank\`, createdAt, updatedAt, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                s.id, s.firstName || s.fullName.split(' ')[0], s.middleName || '', s.lastName || s.fullName.split(' ').slice(1).join(' '),
                s.fullName || s.name, s.fullName || s.name, s.admissionNumber || `ADM-${Date.now().toString().slice(-6)}`,
                s.admissionDate || new Date().toISOString().split('T')[0], s.dob, s.gender, s.bloodGroup, 
                s.nationality || 'Indian', s.category || 'General', s.religion || 'Hinduism', s.aadhaarNumber, s.photo, 
                s.status || 'Active', s.photoBg, s.email, s.phone, s.feeStatus || 'Pending', s.rank || 'N/A', 
                s.createdAt || new Date().toISOString(), s.updatedAt || new Date().toISOString(), tenantId
              ]
            );

            // Write active student enrollment
            await sqlDb.query(
              `INSERT INTO student_enrollments (
                id, studentId, academicYear, admissionType, studentClass, section, rollNumber, previousSchoolName, 
                previousSchoolAddress, previousClassStudied, transferCertificateNumber, status, createdAt, updatedAt, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                `ENR-${Math.floor(100000 + Math.random() * 900000)}`, s.id, s.academicYear || '2026-2027', 
                s.admissionType || 'New Admission', s.studentClass || '1st', s.section || 'A', s.rollNumber || s.roll || '', 
                s.previousSchool || '', '', '', '', s.status || 'Active', new Date().toISOString(), new Date().toISOString(), tenantId
              ]
            );

            // Write parent info
            await sqlDb.query(
              `INSERT INTO parents (
                id, studentId, fatherName, fatherOccupation, fatherMobile, fatherEmail, motherName, motherOccupation, 
                motherMobile, motherEmail, guardianName, guardianRelation, guardianContact, parentUsername, parentPassword, 
                createdAt, updatedAt, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                `PAR-${Math.floor(100000 + Math.random() * 900000)}`, s.id, s.fatherName || '', '', s.fatherMobile || '', 
                '', s.motherName || '', '', s.motherMobile || '', '', s.guardianName || s.guardian || '', 
                s.guardianRelation || '', s.guardianContact || '', `parent_${s.admissionNumber}`, 'parent123', 
                new Date().toISOString(), new Date().toISOString(), tenantId
              ]
            );

            // Write address details
            await sqlDb.query(
              `INSERT INTO addresses (
                id, studentId, currentAddress, permanentAddress, city, state, country, postalCode, 
                emergencyContactNumber, isSameAddress, createdAt, updatedAt, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                `ADD-${Math.floor(100000 + Math.random() * 900000)}`, s.id, s.address || '', s.address || '', 
                s.city || '', s.state || '', 'India', s.pincode || '', s.phone || '', true, 
                new Date().toISOString(), new Date().toISOString(), tenantId
              ]
            );

            // Write medical records
            await sqlDb.query(
              `INSERT INTO medical_records (
                id, studentId, bloodGroup, medicalConditions, allergies, disabilities, emergencyNotes, 
                doctorName, doctorContact, createdAt, updatedAt, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                `MED-${Math.floor(100000 + Math.random() * 900000)}`, s.id, s.bloodGroup || '', '', '', '', '', '', '', 
                new Date().toISOString(), new Date().toISOString(), tenantId
              ]
            );

            // Save documents (photo, aadhaar, tc etc.)
            if (s.photo) {
              await sqlDb.query(
                'INSERT INTO documents (id, studentId, documentType, fileName, filePath, fileSize, uploadedAt, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [`DOC-${Math.floor(100000 + Math.random() * 900000)}`, s.id, 'photo', s.photo.split('/').pop(), s.photo, 0, new Date().toISOString(), tenantId]
              );
            }

            // Write fee assignments
            await sqlDb.query(
              `INSERT INTO fee_assignments (
                id, studentId, feeStructure, scholarshipDetails, discountType, discountAmount, initialPaymentStatus, assignedAt, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                `FEE-ASN-${Math.floor(100000 + Math.random() * 900000)}`, s.id, '', '', '', 0, s.feeStatus || 'Pending', new Date().toISOString(), tenantId
              ]
            );

            // Create account logins
            await sqlDb.query(
              'INSERT INTO student_accounts (id, studentId, studentUsername, studentPassword, createdAt, tenantId) VALUES (?, ?, ?, ?, ?, ?)',
              [`ACT-S-${s.id}`, s.id, s.admissionNumber, `stu@${s.fullName.split(' ')[0].toLowerCase()}`, new Date().toISOString(), tenantId]
            );
            await sqlDb.query(
              'INSERT INTO parent_accounts (id, studentId, parentUsername, parentPassword, createdAt, tenantId) VALUES (?, ?, ?, ?, ?, ?)',
              [`ACT-P-${s.id}`, s.id, `parent_${s.admissionNumber}`, 'parent123', new Date().toISOString(), tenantId]
            );
          }

          // Seed timetables
          const timetables = tenantDb.timetables || [];
          for (const t of timetables) {
            await sqlDb.query(
              'INSERT INTO timetables (cohort, time, mon, tue, wed, thu, fri, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [t.cohort, t.time, JSON.stringify(t.mon), JSON.stringify(t.tue), JSON.stringify(t.wed), JSON.stringify(t.thu), JSON.stringify(t.fri), tenantId]
            );
          }

          // Seed invoices
          const invoices = tenantDb.invoices || [];
          for (const inv of invoices) {
            await sqlDb.query(
              'INSERT INTO invoices (invoiceNo, name, grade, amount, date, status, method, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [inv.invoiceNo, inv.name, inv.grade, inv.amount, inv.date, inv.status, inv.method || 'N/A', tenantId]
            );
          }

          // Seed fees
          const fees = tenantDb.fees || [];
          for (const f of fees) {
            await sqlDb.query(
              `INSERT INTO fees (
                id, studentId, studentName, classId, sectionId, feeType, totalAmount, paidAmount, dueAmount, status, paymentDate, paymentMethod, remarks, createdAt, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [f.id, f.studentId, f.studentName, f.classId, f.sectionId, f.feeType, f.totalAmount, f.paidAmount, f.dueAmount, f.status, f.paymentDate, f.paymentMethod, f.remarks, f.createdAt, tenantId]
            );
          }

          // Seed expenses
          const expenses = tenantDb.expenses || [];
          for (const e of expenses) {
            await sqlDb.query(
              'INSERT INTO expenses (id, category, amount, date, description, status, paidTo, paymentMethod, attachment, createdAt, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [e.id, e.category, e.amount, e.date || e.paymentDate, e.description || '', e.status || 'Approved', e.paidTo || '', e.paymentMethod || '', e.attachment || '', e.createdAt || new Date().toISOString(), tenantId]
            );
          }

          // Seed payroll
          const payroll = tenantDb.payroll || [];
          for (const p of payroll) {
            await sqlDb.query(
              'INSERT INTO payroll (id, staffId, staffName, role, month, basicSalary, allowances, deductions, netSalary, paymentStatus, paymentDate, paymentMethod, createdAt, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [p.id, p.staffId, p.staffName, p.role, p.month, p.basicSalary, p.allowances, p.deductions, p.netSalary, p.paymentStatus, p.paymentDate, p.paymentMethod, p.createdAt || new Date().toISOString(), tenantId]
            );
          }

          // Seed staff payments
          const staffPayments = tenantDb.staffPayments || [];
          for (const sp of staffPayments) {
            await sqlDb.query(
              'INSERT INTO staff_payments (id, staffId, amount, paymentDate, paymentMethod, status, remarks, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [sp.id || `SP-${Date.now()}`, sp.staffId, sp.amount, sp.paymentDate, sp.paymentMethod, sp.status || 'Paid', sp.remarks || '', tenantId]
            );
          }

          // Seed activities
          const activities = tenantDb.activities || [];
          for (const act of activities) {
            await sqlDb.query(
              'INSERT INTO activities (id, type, title, description, time, timestamp, color, bg, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [act.id, act.type, act.title, act.desc || act.description, act.time, act.timestamp, act.color, act.bg, tenantId]
            );
          }

          // Seed exams
          const exams = tenantDb.exams || [];
          for (const ex of exams) {
            await sqlDb.query(
              'INSERT INTO exams (id, name, term, startDate, endDate, status, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [ex.id, ex.name, ex.term, ex.startDate, ex.endDate, ex.status, tenantId]
            );
          }

          // Seed exam timetables
          const examTimetables = tenantDb.examTimetables || [];
          for (const et of examTimetables) {
            await sqlDb.query(
              'INSERT INTO exam_timetables (id, examId, examName, classId, subject, date, timeSlot, room, maxMarks, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [et.id, et.examId, et.examName, et.classId, et.subject, et.date, et.timeSlot, et.room, et.maxMarks || 100, tenantId]
            );
          }

          // Seed notices
          const notices = tenantDb.notices || [];
          for (const n of notices) {
            await sqlDb.query(
              'INSERT INTO notices (id, title, content, date, audience, createdBy, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [n.id, n.title, n.content, n.date, n.audience || 'All', n.createdBy || '', tenantId]
            );
          }

          // Seed holidays
          const holidays = tenantDb.holidays || [];
          for (const h of holidays) {
            await sqlDb.query(
              'INSERT INTO holidays (id, title, startDate, endDate, description, tenantId) VALUES (?, ?, ?, ?, ?, ?)',
              [h.id, h.title, h.startDate, h.endDate, h.description || '', tenantId]
            );
          }

          // Seed events
          const events = tenantDb.events || [];
          for (const ev of events) {
            await sqlDb.query(
              'INSERT INTO events (id, title, description, date, time, venue, audience, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [ev.id, ev.title, ev.description || '', ev.date, ev.time, ev.venue || '', ev.audience || 'All', tenantId]
            );
          }

          // Seed results
          const results = tenantDb.results || [];
          for (const r of results) {
            await sqlDb.query(
              'INSERT INTO results (id, studentId, studentName, examId, examName, subject, marksObtained, maxMarks, grade, remarks, isLocked, isPublished, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [r.id, r.studentId, r.studentName, r.examId, r.examName, r.subject, r.marksObtained, r.maxMarks || 100, r.grade || '', r.remarks || '', r.isLocked || false, r.isPublished || false, tenantId]
            );
          }

          // Seed overall results
          const overallResults = tenantDb.overallResults || [];
          for (const o of overallResults) {
            await sqlDb.query(
              'INSERT INTO overall_results (id, studentId, studentName, classId, sectionId, percentage, grade, status, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [o.id || `OR-${o.studentId}`, o.studentId, o.studentName, o.classId, o.sectionId, o.percentage, o.grade, o.status, tenantId]
            );
          }

          // Seed subjects
          const subjects = tenantDb.subjects || [];
          for (const sub of subjects) {
            await sqlDb.query(
              'INSERT INTO subjects (id, name, code, classId, teacherId, teacherName, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [sub.id, sub.name, sub.code || '', sub.classId, sub.teacherId || '', sub.teacherName || '', tenantId]
            );
          }

          // Seed timeslots
          const timeslots = tenantDb.timeslots || [];
          for (const slot of timeslots) {
            await sqlDb.query(
              'INSERT INTO timeslots (slotTime, tenantId) VALUES (?, ?)',
              [slot, tenantId]
            );
          }

          // Seed fee structures
          const feeStructures = tenantDb.feeStructures || [];
          for (const fsItem of feeStructures) {
            await sqlDb.query(
              'INSERT INTO fee_structures (id, classId, amount, frequency, tenantId) VALUES (?, ?, ?, ?, ?)',
              [fsItem.id || `FS-${fsItem.grade}`, fsItem.grade, fsItem.amount, fsItem.frequency || 'Yearly', tenantId]
            );
          }

          // Seed salary structures
          const salaryStructures = tenantDb.salaryStructures || [];
          for (const ss of salaryStructures) {
            await sqlDb.query(
              'INSERT INTO salary_structures (id, gradeName, basicSalary, allowances, deductions, tenantId) VALUES (?, ?, ?, ?, ?, ?)',
              [ss.id || `SS-${ss.gradeName}`, ss.gradeName, ss.basicSalary, JSON.stringify(ss.allowances || []), JSON.stringify(ss.deductions || []), tenantId]
            );
          }

          // Seed staff salary structures
          const staffSalaryStructures = tenantDb.staffSalaryStructures || [];
          for (const sss of staffSalaryStructures) {
            await sqlDb.query(
              'INSERT INTO staff_salary_structures (id, position, basicSalary, allowances, deductions, tenantId) VALUES (?, ?, ?, ?, ?, ?)',
              [sss.id || `SSS-${sss.position}`, sss.position, sss.basicSalary, JSON.stringify(sss.allowances || []), JSON.stringify(sss.deductions || []), tenantId]
            );
          }

          // Seed income
          const income = tenantDb.income || [];
          for (const inc of income) {
            await sqlDb.query(
              'INSERT INTO income (id, source, amount, date, description, tenantId) VALUES (?, ?, ?, ?, ?, ?)',
              [inc.id, inc.source, inc.amount, inc.date || inc.paymentDate, inc.description || '', tenantId]
            );
          }

          // Seed attendance
          const attendance = tenantDb.attendance || [];
          for (const att of attendance) {
            await sqlDb.query(
              `INSERT INTO attendance (
                attendanceId, studentId, classId, sectionId, attendanceDate, attendanceStatus, remarks, markedBy, createdAt, updatedAt, tenantId
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [att.attendanceId, att.studentId, att.classId, att.sectionId, att.attendanceDate, att.attendanceStatus, att.remarks || '', att.markedBy || '', att.createdAt, att.updatedAt, tenantId]
            );
          }

          console.log(`[SQL Migrate] Finished migration for tenant subdomain: ${school.subdomain}`);
        } catch (err) {
          console.error(`[SQL Migrate ERROR] Failed to migrate tenant JSON file ${tenantFile}:`, err);
        }
      }
    }

    console.log('[SQL Migrate] Legacy JSON data migration completed successfully!');
  } catch (err) {
    console.error('[SQL Migrate ERROR] JSON Migration triggered error:', err);
  }
};

// Initial database check called on server boot
export const initSqlDb = async () => {
  const isConnected = await sqlDb.testConnection();
  if (isConnected) {
    // 1. Create tables
    await createTablesFromSchema();
    // 2. Run data migration
    await migrateJsonToSql();
    isSqlInitialized = true;
    console.log('[SQL Init] MySQL Caching Adapter is active and running.');
  } else {
    console.warn('[SQL Init WARNING] MySQL Connection unavailable. Falling back to local JSON files.');
    isSqlInitialized = false;
  }
};

// Start the init procedure on boot
initSqlDb();

// Load dynamic cached tenant details from MySQL database
export const loadTenantSqlIntoMemory = async (tenantId) => {
  try {
    if (!isSqlActive()) return null;
    
    const isGlobal = !tenantId || tenantId === 'localhost' || tenantId === 'platform';
    const queryTenantId = isGlobal ? 'platform' : tenantId;
    
    // Create base data structure
    const data = {
      school: {},
      students: [],
      teachers: [],
      staff: [],
      timetables: [],
      invoices: [],
      fees: [],
      expenses: [],
      payroll: [],
      staffPayments: [],
      activities: [],
      exams: [],
      examTimetables: [],
      notices: [],
      holidays: [],
      events: [],
      results: [],
      overallResults: [],
      subjects: [],
      timeslots: [],
      feeStructures: [],
      salaryStructures: [],
      staffSalaryStructures: [],
      income: [],
      attendance: [],
      subscriptionPlans: [],
      schools: []
    };

    // 1. Get Global Platform details
    const globalSchools = await sqlDb.query('SELECT * FROM schools');
    data.schools = globalSchools;

    const plans = await sqlDb.query('SELECT * FROM subscription_plans');
    data.subscriptionPlans = plans.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || [])
    }));

    if (!isGlobal) {
      // Find school info
      const matchedSchool = globalSchools.find(s => s.subdomain === tenantId);
      if (matchedSchool) {
        data.school = {
          name: matchedSchool.name,
          subdomain: matchedSchool.subdomain,
          address: matchedSchool.address || '',
          city: matchedSchool.city || '',
          state: matchedSchool.state || '',
          phone: matchedSchool.phone || '',
          email: matchedSchool.email || '',
          ratePerStudent: matchedSchool.ratePerStudent || '250.00',
          adminName: matchedSchool.adminName || '',
          adminEmail: matchedSchool.adminEmail || '',
          adminPassword: matchedSchool.adminPassword || '',
          principal: matchedSchool.principalName || ''
        };
      }
    }

    // 2. Fetch specific tables filtered by tenantId
    const tId = queryTenantId;

    // Load simple fields
    data.teachers = await sqlDb.query('SELECT * FROM teachers WHERE tenantId = ?', [tId]);
    data.staff = await sqlDb.query('SELECT * FROM staff WHERE tenantId = ?', [tId]);
    data.invoices = await sqlDb.query('SELECT * FROM invoices WHERE tenantId = ?', [tId]);
    
    // Parse decimals back to floats for finance metrics
    const rawFees = await sqlDb.query('SELECT * FROM fees WHERE tenantId = ?', [tId]);
    data.fees = rawFees.map(f => ({
      ...f,
      totalAmount: parseFloat(f.totalAmount || 0),
      paidAmount: parseFloat(f.paidAmount || 0),
      dueAmount: parseFloat(f.dueAmount || 0)
    }));

    const rawExpenses = await sqlDb.query('SELECT * FROM expenses WHERE tenantId = ?', [tId]);
    data.expenses = rawExpenses.map(e => ({ ...e, amount: parseFloat(e.amount || 0) }));

    const rawPayroll = await sqlDb.query('SELECT * FROM payroll WHERE tenantId = ?', [tId]);
    data.payroll = rawPayroll.map(p => ({
      ...p,
      basicSalary: parseFloat(p.basicSalary || 0),
      allowances: parseFloat(p.allowances || 0),
      deductions: parseFloat(p.deductions || 0),
      netSalary: parseFloat(p.netSalary || 0)
    }));

    const rawStaffPayments = await sqlDb.query('SELECT * FROM staff_payments WHERE tenantId = ?', [tId]);
    data.staffPayments = rawStaffPayments.map(sp => ({ ...sp, amount: parseFloat(sp.amount || 0) }));

    const rawIncome = await sqlDb.query('SELECT * FROM income WHERE tenantId = ?', [tId]);
    data.income = rawIncome.map(i => ({ ...i, amount: parseFloat(i.amount || 0) }));

    data.activities = await sqlDb.query('SELECT * FROM activities WHERE tenantId = ?', [tId]);
    data.exams = await sqlDb.query('SELECT * FROM exams WHERE tenantId = ?', [tId]);
    data.examTimetables = await sqlDb.query('SELECT * FROM exam_timetables WHERE tenantId = ?', [tId]);
    data.notices = await sqlDb.query('SELECT * FROM notices WHERE tenantId = ?', [tId]);
    data.holidays = await sqlDb.query('SELECT * FROM holidays WHERE tenantId = ?', [tId]);
    data.events = await sqlDb.query('SELECT * FROM events WHERE tenantId = ?', [tId]);
    data.results = await sqlDb.query('SELECT * FROM results WHERE tenantId = ?', [tId]);
    data.subjects = await sqlDb.query('SELECT * FROM subjects WHERE tenantId = ?', [tId]);
    data.attendance = await sqlDb.query('SELECT * FROM attendance WHERE tenantId = ?', [tId]);

    const rawOverall = await sqlDb.query('SELECT * FROM overall_results WHERE tenantId = ?', [tId]);
    data.overallResults = rawOverall.map(o => ({ ...o, percentage: parseFloat(o.percentage || 0) }));

    // Load timeslots (flat list mapping)
    const dbTimeslots = await sqlDb.query('SELECT slotTime FROM timeslots WHERE tenantId = ? ORDER BY id', [tId]);
    data.timeslots = dbTimeslots.map(ts => ts.slotTime);

    // Load JSON config tables
    const dbSalary = await sqlDb.query('SELECT * FROM salary_structures WHERE tenantId = ?', [tId]);
    data.salaryStructures = dbSalary.map(ss => ({
      id: ss.id,
      gradeName: ss.gradeName,
      basicSalary: parseFloat(ss.basicSalary || 0),
      allowances: typeof ss.allowances === 'string' ? JSON.parse(ss.allowances) : (ss.allowances || []),
      deductions: typeof ss.deductions === 'string' ? JSON.parse(ss.deductions) : (ss.deductions || [])
    }));

    const dbStaffSalary = await sqlDb.query('SELECT * FROM staff_salary_structures WHERE tenantId = ?', [tId]);
    data.staffSalaryStructures = dbStaffSalary.map(sss => ({
      id: sss.id,
      position: sss.position,
      basicSalary: parseFloat(sss.basicSalary || 0),
      allowances: typeof sss.allowances === 'string' ? JSON.parse(sss.allowances) : (sss.allowances || []),
      deductions: typeof sss.deductions === 'string' ? JSON.parse(sss.deductions) : (sss.deductions || [])
    }));

    const dbFeeStructures = await sqlDb.query('SELECT * FROM fee_structures WHERE tenantId = ?', [tId]);
    data.feeStructures = dbFeeStructures.map(fsItem => ({
      id: fsItem.id,
      grade: fsItem.classId,
      amount: parseFloat(fsItem.amount || 0),
      frequency: fsItem.frequency
    }));

    const dbTimetables = await sqlDb.query('SELECT * FROM timetables WHERE tenantId = ?', [tId]);
    data.timetables = dbTimetables.map(t => ({
      cohort: t.cohort,
      time: t.time,
      mon: typeof t.mon === 'string' ? JSON.parse(t.mon) : t.mon,
      tue: typeof t.tue === 'string' ? JSON.parse(t.tue) : t.tue,
      wed: typeof t.wed === 'string' ? JSON.parse(t.wed) : t.wed,
      thu: typeof t.thu === 'string' ? JSON.parse(t.thu) : t.thu,
      fri: typeof t.fri === 'string' ? JSON.parse(t.fri) : t.fri
    }));

    // 3. Reconstruct students (Joining Normalized Tables in memory)
    const sqlStudents = await sqlDb.query('SELECT * FROM students WHERE tenantId = ?', [tId]);
    const sqlEnrollments = await sqlDb.query('SELECT * FROM student_enrollments WHERE tenantId = ?', [tId]);
    const sqlParents = await sqlDb.query('SELECT * FROM parents WHERE tenantId = ?', [tId]);
    const sqlAddresses = await sqlDb.query('SELECT * FROM addresses WHERE tenantId = ?', [tId]);
    const sqlMedicals = await sqlDb.query('SELECT * FROM medical_records WHERE tenantId = ?', [tId]);
    const sqlDocs = await sqlDb.query('SELECT * FROM documents WHERE tenantId = ?', [tId]);
    const sqlFeesAssigned = await sqlDb.query('SELECT * FROM fee_assignments WHERE tenantId = ?', [tId]);
    const sqlStudentAccounts = await sqlDb.query('SELECT * FROM student_accounts WHERE tenantId = ?', [tId]);
    const sqlParentAccounts = await sqlDb.query('SELECT * FROM parent_accounts WHERE tenantId = ?', [tId]);

    data.students = sqlStudents.map(s => {
      const enrollment = sqlEnrollments.find(e => e.studentId === s.id) || {};
      const parent = sqlParents.find(p => p.studentId === s.id) || {};
      const address = sqlAddresses.find(a => a.studentId === s.id) || {};
      const medical = sqlMedicals.find(m => m.studentId === s.id) || {};
      const fee = sqlFeesAssigned.find(f => f.studentId === s.id) || {};
      const studAcc = sqlStudentAccounts.find(sa => sa.studentId === s.id) || {};
      const parentAcc = sqlParentAccounts.find(pa => pa.studentId === s.id) || {};

      const docList = sqlDocs.filter(d => d.studentId === s.id);
      const photoDoc = docList.find(d => d.documentType === 'photo');
      const aadhaarDoc = docList.find(d => d.documentType === 'aadhaar');
      const birthDoc = docList.find(d => d.documentType === 'birthCertificate');
      const marksheetDoc = docList.find(d => d.documentType === 'marksheet');
      const tcDoc = docList.find(d => d.documentType === 'tc');
      const addProofDoc = docList.find(d => d.documentType === 'addressProof');
      const medCertDoc = docList.find(d => d.documentType === 'medicalCertificate');
      const extraDoc = docList.find(d => d.documentType === 'additional');

      return {
        ...s,
        // Academic
        academicYear: enrollment.academicYear || '2026-2027',
        admissionType: enrollment.admissionType || 'New Admission',
        studentClass: enrollment.studentClass || '1st',
        section: enrollment.section || 'A',
        rollNumber: enrollment.rollNumber || '',
        roll: enrollment.rollNumber || '',
        grade: `${enrollment.studentClass || '1st'}-${enrollment.section || 'A'}`,
        previousSchool: enrollment.previousSchoolName || '',
        previousSchoolName: enrollment.previousSchoolName || '',
        previousSchoolAddress: enrollment.previousSchoolAddress || '',
        previousClassStudied: enrollment.previousClassStudied || '',
        transferCertificateNumber: enrollment.transferCertificateNumber || '',

        // Parent
        fatherName: parent.fatherName || '',
        fatherOccupation: parent.fatherOccupation || '',
        fatherMobile: parent.fatherMobile || '',
        fatherEmail: parent.fatherEmail || '',
        motherName: parent.motherName || '',
        motherOccupation: parent.motherOccupation || '',
        motherMobile: parent.motherMobile || '',
        motherEmail: parent.motherEmail || '',
        guardianName: parent.guardianName || '',
        guardianRelation: parent.guardianRelation || '',
        guardianContact: parent.guardianContact || '',
        guardian: parent.guardianName || parent.fatherName || parent.motherName || '',
        phone: parent.guardianContact || parent.fatherMobile || parent.motherMobile || '',

        // Address
        currentAddress: address.currentAddress || '',
        permanentAddress: address.permanentAddress || '',
        address: address.currentAddress || '',
        city: address.city || '',
        state: address.state || '',
        country: address.country || 'India',
        postalCode: address.postalCode || '',
        pincode: address.postalCode || '',
        emergencyContactNumber: address.emergencyContactNumber || '',
        isSameAddress: address.isSameAddress !== undefined ? address.isSameAddress : true,

        // Medical
        bloodGroup: medical.bloodGroup || s.bloodGroup || '',
        medicalConditions: medical.medicalConditions || '',
        allergies: medical.allergies || '',
        disabilities: medical.disabilities || '',
        emergencyNotes: medical.emergencyNotes || '',
        doctorName: medical.doctorName || '',
        doctorContact: medical.doctorContact || '',

        // Logins
        studentUsername: studAcc.studentUsername || s.admissionNumber || '',
        studentPassword: studAcc.studentPassword || '',
        parentUsername: parentAcc.parentUsername || '',
        parentPassword: parentAcc.parentPassword || '',
        transportRequired: s.transportRequired || 'No',
        hostelRequired: s.hostelRequired || 'No',

        // Files
        photo: photoDoc ? photoDoc.filePath : s.photo || '',
        aadhaarFile: aadhaarDoc ? aadhaarDoc.filePath : '',
        birthCertificateFile: birthDoc ? birthDoc.filePath : '',
        marksheetFile: marksheetDoc ? marksheetDoc.filePath : '',
        transferCertificateFile: tcDoc ? tcDoc.filePath : '',
        addressProofFile: addProofDoc ? addProofDoc.filePath : '',
        medicalCertificateFile: medCertDoc ? medCertDoc.filePath : '',
        additionalFile: extraDoc ? extraDoc.filePath : '',

        // Fees
        feeStructure: fee.feeStructure || '',
        scholarshipDetails: fee.scholarshipDetails || '',
        discountType: fee.discountType || '',
        discountAmount: fee.discountAmount || 0,
        feeStatus: fee.initialPaymentStatus || 'Pending',
        initialPaymentStatus: fee.initialPaymentStatus || 'Pending'
      };
    });

    dbCache[queryTenantId] = data;
    return data;
  } catch (err) {
    console.error(`[SQL Preload ERROR] Failed to load SQL tenant ${tenantId}:`, err);
    return null;
  }
};

// Express middleware to ensure SQL cache is loaded on incoming requests
export const ensureTenantSqlLoaded = async (req, res, next) => {
  if (!isSqlActive()) {
    return next(); // Fail-safe fallback to local JSON file operations
  }

  let tenantId = req.headers['x-tenant-id'] || req.query.tenantId;
  if (!tenantId && req.headers.host) {
    const host = req.headers.host;
    const parts = host.split('.');
    if (parts.length > 2 || (parts.length === 2 && !parts[1].startsWith('localhost'))) {
      tenantId = parts[0];
    }
  }

  const activeTenant = tenantId ? slugify(tenantId) : 'platform';
  
  // Always load or reload the tenant's cache
  await loadTenantSqlIntoMemory(activeTenant);
  next();
};

// Asynchronous write dispatcher to MySQL
export const saveMemoryDbToSql = async (tenantId, db) => {
  try {
    if (!isSqlActive()) return;

    const tId = tenantId || 'platform';
    console.log(`[SQL Sync] Initiating async MySQL database update for tenant: ${tId}`);

    // 1. Sync global platforms
    if (db.schools && Array.isArray(db.schools)) {
      for (const s of db.schools) {
        await sqlDb.query(
          `INSERT INTO schools (
            id, name, code, subdomain, logo, principalName, email, phone, address, city, state, country, 
            academicSession, subscriptionPlan, url, status, adminName, adminEmail, adminUsername, adminPassword, 
            complexAdminUsername, complexAdminPassword, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            name=VALUES(name), logo=VALUES(logo), principalName=VALUES(principalName), email=VALUES(email),
            phone=VALUES(phone), address=VALUES(address), city=VALUES(city), state=VALUES(state),
            academicSession=VALUES(academicSession), subscriptionPlan=VALUES(subscriptionPlan),
            status=VALUES(status), adminName=VALUES(adminName), adminEmail=VALUES(adminEmail),
            adminUsername=VALUES(adminUsername), adminPassword=VALUES(adminPassword),
            complexAdminUsername=VALUES(complexAdminUsername), complexAdminPassword=VALUES(complexAdminPassword)`,
          [
            s.id, s.name, s.code, s.subdomain, s.logo, s.principalName || s.principal || '', s.email, 
            s.phone, s.address, s.city, s.state, s.country || 'India', s.academicSession || '2026-2027', 
            s.subscriptionPlan || 'Starter', s.url, s.status || 'Active', s.adminName || '', s.adminEmail || '', 
            s.adminUsername || '', s.adminPassword || '', s.complexAdminUsername || '', s.complexAdminPassword || '', 
            s.createdAt
          ]
        );
      }
    }

    // 2. Sync school details
    if (tId !== 'platform' && db.school) {
      const sch = db.school;
      await sqlDb.query(
        `UPDATE schools SET 
          name = ?, address = ?, city = ?, state = ?, phone = ?, email = ?, 
          principalName = ?, adminName = ?, adminEmail = ?, adminPassword = ?, ratePerStudent = ?
         WHERE subdomain = ?`,
        [
          sch.name, sch.address, sch.city, sch.state, sch.phone, sch.email, 
          sch.principal, sch.adminName, sch.adminEmail, sch.adminPassword, sch.ratePerStudent || '250.00', tId
        ]
      );
    }

    // 3. Sync Teachers
    if (db.teachers && Array.isArray(db.teachers)) {
      // Clean deleted
      const activeTeacherIds = db.teachers.map(t => t.id);
      if (activeTeacherIds.length > 0) {
        await sqlDb.query(`DELETE FROM teachers WHERE tenantId = ? AND id NOT IN (${activeTeacherIds.map(() => '?').join(',')})`, [tId, ...activeTeacherIds]);
      } else {
        await sqlDb.query('DELETE FROM teachers WHERE tenantId = ?', [tId]);
      }

      for (const t of db.teachers) {
        await sqlDb.query(
          `INSERT INTO teachers (
            id, name, email, phone, username, password, gender, qualification, experience, dateOfJoining, 
            salaryGrade, address, city, state, pincode, emergencyContact, emergencyPhone, photo, aadharFile, 
            certificateFile, status, avatarBg, tenantId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            name=VALUES(name), email=VALUES(email), phone=VALUES(phone), username=VALUES(username),
            password=VALUES(password), status=VALUES(status), address=VALUES(address)`,
          [
            t.id, t.name, t.email, t.phone, t.username, t.password, t.gender, t.qualification, t.experience, 
            t.dateOfJoining, t.salaryGrade, t.address, t.city, t.state, t.pincode, t.emergencyContact, 
            t.emergencyPhone, t.photo, t.aadharFile, t.certificateFile, t.status || 'Active', t.avatarBg, tId
          ]
        );
      }
    }

    // 4. Sync Staff
    if (db.staff && Array.isArray(db.staff)) {
      const activeStaffIds = db.staff.map(s => s.id);
      if (activeStaffIds.length > 0) {
        await sqlDb.query(`DELETE FROM staff WHERE tenantId = ? AND id NOT IN (${activeStaffIds.map(() => '?').join(',')})`, [tId, ...activeStaffIds]);
      } else {
        await sqlDb.query('DELETE FROM staff WHERE tenantId = ?', [tId]);
      }

      for (const s of db.staff) {
        await sqlDb.query(
          `INSERT INTO staff (
            id, name, fullName, role, department, email, phone, gender, qualification, experience, 
            dateOfJoining, salaryGrade, reportingTo, address, city, state, pincode, emergencyContact, 
            emergencyPhone, photo, aadharFile, certificateFile, status, avatarBg, password, tenantId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name=VALUES(name), role=VALUES(role), department=VALUES(department), email=VALUES(email),
            phone=VALUES(phone), status=VALUES(status), password=VALUES(password)`,
          [
            s.id, s.name, s.fullName, s.role, s.department, s.email, s.phone, s.gender, s.qualification, 
            s.experience, s.dateOfJoining, s.salaryGrade, s.reportingTo, s.address, s.city, s.state, s.pincode, 
            s.emergencyContact, s.emergencyPhone, s.photo, s.aadharFile, s.certificateFile, s.status || 'Active', 
            s.avatarBg, s.password, tId
          ]
        );
      }
    }

    // 5. Sync Students & Sub-Tables
    if (db.students && Array.isArray(db.students)) {
      const activeStudentIds = db.students.map(s => s.id);
      if (activeStudentIds.length > 0) {
        // Cascade delete will automatically handle enrollments, parents, addresses, medical, documents, fee_assignments, student_accounts, parent_accounts
        await sqlDb.query(`DELETE FROM students WHERE tenantId = ? AND id NOT IN (${activeStudentIds.map(() => '?').join(',')})`, [tId, ...activeStudentIds]);
      } else {
        await sqlDb.query('DELETE FROM students WHERE tenantId = ?', [tId]);
      }

      for (const s of db.students) {
        // Core student
        await sqlDb.query(
          `INSERT INTO students (
            id, firstName, middleName, lastName, name, fullName, admissionNumber, admissionDate, dob, 
            gender, bloodGroup, nationality, category, religion, aadhaarNumber, photo, status, photoBg, 
            email, phone, feeStatus, \`rank\`, createdAt, updatedAt, tenantId, transportRequired, hostelRequired
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name=VALUES(name), fullName=VALUES(fullName), photo=VALUES(photo), status=VALUES(status),
            email=VALUES(email), phone=VALUES(phone), feeStatus=VALUES(feeStatus), updatedAt=VALUES(updatedAt),
            transportRequired=VALUES(transportRequired), hostelRequired=VALUES(hostelRequired)`,
          [
            s.id, s.firstName || s.fullName.split(' ')[0], s.middleName || '', s.lastName || s.fullName.split(' ').slice(1).join(' '),
            s.fullName || s.name, s.fullName || s.name, s.admissionNumber || `ADM-${Date.now().toString().slice(-6)}`,
            s.admissionDate || new Date().toISOString().split('T')[0], s.dob, s.gender, s.bloodGroup, 
            s.nationality || 'Indian', s.category || 'General', s.religion || 'Hinduism', s.aadhaarNumber, s.photo, 
            s.status || 'Active', s.photoBg, s.email, s.phone, s.feeStatus || 'Pending', s.rank || 'N/A', 
            s.createdAt || new Date().toISOString(), s.updatedAt || new Date().toISOString(), tId,
            s.transportRequired || 'No', s.hostelRequired || 'No'
          ]
        );

        // Enrollment
        await sqlDb.query(
          `INSERT INTO student_enrollments (
            id, studentId, academicYear, admissionType, studentClass, section, rollNumber, previousSchoolName, 
            previousSchoolAddress, previousClassStudied, transferCertificateNumber, status, createdAt, updatedAt, tenantId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            academicYear=VALUES(academicYear), studentClass=VALUES(studentClass), section=VALUES(section),
            rollNumber=VALUES(rollNumber), previousSchoolName=VALUES(previousSchoolName), status=VALUES(status), updatedAt=VALUES(updatedAt)`,
          [
            s.enrollmentId || `ENR-${Math.floor(100000 + Math.random() * 900000)}`, s.id, s.academicYear || '2026-2027', 
            s.admissionType || 'New Admission', s.studentClass || '1st', s.section || 'A', s.rollNumber || s.roll || '', 
            s.previousSchoolName || s.previousSchool || '', s.previousSchoolAddress || '', s.previousClassStudied || '', 
            s.transferCertificateNumber || '', s.status || 'Active', new Date().toISOString(), new Date().toISOString(), tId
          ]
        );

        // Parent
        await sqlDb.query(
          `INSERT INTO parents (
            id, studentId, fatherName, fatherOccupation, fatherMobile, fatherEmail, motherName, motherOccupation, 
            motherMobile, motherEmail, guardianName, guardianRelation, guardianContact, parentUsername, parentPassword, 
            createdAt, updatedAt, tenantId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            fatherName=VALUES(fatherName), fatherOccupation=VALUES(fatherOccupation), fatherMobile=VALUES(fatherMobile), fatherEmail=VALUES(fatherEmail),
            motherName=VALUES(motherName), motherOccupation=VALUES(motherOccupation), motherMobile=VALUES(motherMobile), motherEmail=VALUES(motherEmail),
            guardianName=VALUES(guardianName), guardianRelation=VALUES(guardianRelation), guardianContact=VALUES(guardianContact), parentUsername=VALUES(parentUsername), parentPassword=VALUES(parentPassword), updatedAt=VALUES(updatedAt)`,
          [
            s.parentId || `PAR-${Math.floor(100000 + Math.random() * 900000)}`, s.id, s.fatherName || '', s.fatherOccupation || '', s.fatherMobile || '', 
            s.fatherEmail || '', s.motherName || '', s.motherOccupation || '', s.motherMobile || '', s.motherEmail || '', s.guardianName || s.guardian || '', 
            s.guardianRelation || '', s.guardianContact || '', s.parentUsername || `parent_${s.admissionNumber}`, s.parentPassword || 'parent123', 
            new Date().toISOString(), new Date().toISOString(), tId
          ]
        );

        // Address
        await sqlDb.query(
          `INSERT INTO addresses (
            id, studentId, currentAddress, permanentAddress, city, state, country, postalCode, 
            emergencyContactNumber, isSameAddress, createdAt, updatedAt, tenantId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            currentAddress=VALUES(currentAddress), permanentAddress=VALUES(permanentAddress), city=VALUES(city),
            state=VALUES(state), postalCode=VALUES(postalCode), emergencyContactNumber=VALUES(emergencyContactNumber),
            isSameAddress=VALUES(isSameAddress), updatedAt=VALUES(updatedAt)`,
          [
            s.addressId || `ADD-${Math.floor(100000 + Math.random() * 900000)}`, s.id, s.currentAddress || s.address || '', s.permanentAddress || s.address || '', 
            s.city || '', s.state || '', s.country || 'India', s.postalCode || s.pincode || '', s.emergencyContactNumber || s.phone || '', s.isSameAddress !== undefined ? s.isSameAddress : true, 
            new Date().toISOString(), new Date().toISOString(), tId
          ]
        );

        // Medical
        await sqlDb.query(
          `INSERT INTO medical_records (
            id, studentId, bloodGroup, medicalConditions, allergies, disabilities, emergencyNotes, 
            doctorName, doctorContact, createdAt, updatedAt, tenantId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            bloodGroup=VALUES(bloodGroup), medicalConditions=VALUES(medicalConditions), allergies=VALUES(allergies),
            disabilities=VALUES(disabilities), emergencyNotes=VALUES(emergencyNotes), doctorName=VALUES(doctorName), doctorContact=VALUES(doctorContact), updatedAt=VALUES(updatedAt)`,
          [
            s.medicalId || `MED-${Math.floor(100000 + Math.random() * 900000)}`, s.id, s.bloodGroup || '', s.medicalConditions || '', s.allergies || '', s.disabilities || '', s.emergencyNotes || '', s.doctorName || '', s.doctorContact || '', 
            new Date().toISOString(), new Date().toISOString(), tId
          ]
        );

        // Documents sync (delete old docs metadata and write current ones)
        await sqlDb.query('DELETE FROM documents WHERE tenantId = ? AND studentId = ?', [tId, s.id]);
        const docFields = [
          { type: 'photo', path: s.photo },
          { type: 'aadhaar', path: s.aadhaarFile },
          { type: 'birthCertificate', path: s.birthCertificateFile },
          { type: 'marksheet', path: s.marksheetFile },
          { type: 'tc', path: s.transferCertificateFile },
          { type: 'addressProof', path: s.addressProofFile },
          { type: 'medicalCertificate', path: s.medicalCertificateFile },
          { type: 'additional', path: s.additionalFile }
        ];
        for (const df of docFields) {
          if (df.path) {
            await sqlDb.query(
              'INSERT INTO documents (id, studentId, documentType, fileName, filePath, fileSize, uploadedAt, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [`DOC-${Math.floor(100000 + Math.random() * 900000)}`, s.id, df.type, df.path.split('/').pop(), df.path, 0, new Date().toISOString(), tId]
            );
          }
        }

        // Fee Assignment
        await sqlDb.query(
          `INSERT INTO fee_assignments (
            id, studentId, feeStructure, scholarshipDetails, discountType, discountAmount, initialPaymentStatus, assignedAt, tenantId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            feeStructure=VALUES(feeStructure), scholarshipDetails=VALUES(scholarshipDetails),
            discountType=VALUES(discountType), discountAmount=VALUES(discountAmount), initialPaymentStatus=VALUES(initialPaymentStatus)`,
          [
            s.feeAssignmentId || `FEE-ASN-${Math.floor(100000 + Math.random() * 900000)}`, s.id, s.feeStructure || '', s.scholarshipDetails || '', s.discountType || '', 
            parseFloat(s.discountAmount || 0), s.feeStatus || s.initialPaymentStatus || 'Pending', new Date().toISOString(), tId
          ]
        );

        // Account Logins
        await sqlDb.query(
          `INSERT INTO student_accounts (id, studentId, studentUsername, studentPassword, createdAt, tenantId) VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE studentPassword=VALUES(studentPassword)`,
          [`ACT-S-${s.id}`, s.id, s.studentUsername || s.admissionNumber, s.studentPassword || `stu@${s.fullName.split(' ')[0].toLowerCase()}`, new Date().toISOString(), tId]
        );
        await sqlDb.query(
          `INSERT INTO parent_accounts (id, studentId, parentUsername, parentPassword, createdAt, tenantId) VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE parentPassword=VALUES(parentPassword)`,
          [`ACT-P-${s.id}`, s.id, s.parentUsername || `parent_${s.admissionNumber}`, s.parentPassword || 'parent123', new Date().toISOString(), tId]
        );
      }
    }

    // 6. Sync Timetables
    if (db.timetables && Array.isArray(db.timetables)) {
      await sqlDb.query('DELETE FROM timetables WHERE tenantId = ?', [tId]);
      for (const t of db.timetables) {
        await sqlDb.query(
          'INSERT INTO timetables (cohort, time, mon, tue, wed, thu, fri, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [t.cohort, t.time, JSON.stringify(t.mon), JSON.stringify(t.tue), JSON.stringify(t.wed), JSON.stringify(t.thu), JSON.stringify(t.fri), tId]
        );
      }
    }

    // 7. Sync Invoices
    if (db.invoices && Array.isArray(db.invoices)) {
      const activeInvNos = db.invoices.map(i => i.invoiceNo);
      if (activeInvNos.length > 0) {
        await sqlDb.query(`DELETE FROM invoices WHERE tenantId = ? AND invoiceNo NOT IN (${activeInvNos.map(() => '?').join(',')})`, [tId, ...activeInvNos]);
      } else {
        await sqlDb.query('DELETE FROM invoices WHERE tenantId = ?', [tId]);
      }

      for (const inv of db.invoices) {
        await sqlDb.query(
          `INSERT INTO invoices (invoiceNo, name, grade, amount, date, status, method, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status), method=VALUES(method)`,
          [inv.invoiceNo, inv.name, inv.grade, inv.amount, inv.date, inv.status, inv.method || 'N/A', tId]
        );
      }
    }

    // 8. Sync Fees
    if (db.fees && Array.isArray(db.fees)) {
      const activeFeeIds = db.fees.map(f => f.id);
      if (activeFeeIds.length > 0) {
        await sqlDb.query(`DELETE FROM fees WHERE tenantId = ? AND id NOT IN (${activeFeeIds.map(() => '?').join(',')})`, [tId, ...activeFeeIds]);
      } else {
        await sqlDb.query('DELETE FROM fees WHERE tenantId = ?', [tId]);
      }

      for (const f of db.fees) {
        await sqlDb.query(
          `INSERT INTO fees (
            id, studentId, studentName, classId, sectionId, feeType, totalAmount, paidAmount, dueAmount, status, paymentDate, paymentMethod, remarks, createdAt, tenantId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            paidAmount=VALUES(paidAmount), dueAmount=VALUES(dueAmount), status=VALUES(status), paymentDate=VALUES(paymentDate), paymentMethod=VALUES(paymentMethod)`,
          [f.id, f.studentId, f.studentName, f.classId, f.sectionId, f.feeType, parseFloat(f.totalAmount || 0), parseFloat(f.paidAmount || 0), parseFloat(f.dueAmount || 0), f.status, f.paymentDate, f.paymentMethod, f.remarks || '', f.createdAt, tId]
        );
      }
    }

    // 9. Sync Expenses
    if (db.expenses && Array.isArray(db.expenses)) {
      const activeExpIds = db.expenses.map(e => e.id);
      if (activeExpIds.length > 0) {
        await sqlDb.query(`DELETE FROM expenses WHERE tenantId = ? AND id NOT IN (${activeExpIds.map(() => '?').join(',')})`, [tId, ...activeExpIds]);
      } else {
        await sqlDb.query('DELETE FROM expenses WHERE tenantId = ?', [tId]);
      }

      for (const e of db.expenses) {
        await sqlDb.query(
          `INSERT INTO expenses (id, category, amount, date, description, status, paidTo, paymentMethod, attachment, createdAt, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE amount=VALUES(amount), status=VALUES(status)`,
          [e.id, e.category, parseFloat(e.amount || 0), e.date, e.description || '', e.status || 'Approved', e.paidTo || '', e.paymentMethod || '', e.attachment || '', e.createdAt || new Date().toISOString(), tId]
        );
      }
    }

    // 10. Sync Payroll
    if (db.payroll && Array.isArray(db.payroll)) {
      const activePayIds = db.payroll.map(p => p.id);
      if (activePayIds.length > 0) {
        await sqlDb.query(`DELETE FROM payroll WHERE tenantId = ? AND id NOT IN (${activePayIds.map(() => '?').join(',')})`, [tId, ...activePayIds]);
      } else {
        await sqlDb.query('DELETE FROM payroll WHERE tenantId = ?', [tId]);
      }

      for (const p of db.payroll) {
        await sqlDb.query(
          `INSERT INTO payroll (id, staffId, staffName, role, month, basicSalary, allowances, deductions, netSalary, paymentStatus, paymentDate, paymentMethod, createdAt, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE paymentStatus=VALUES(paymentStatus), paymentDate=VALUES(paymentDate), paymentMethod=VALUES(paymentMethod)`,
          [p.id, p.staffId, p.staffName, p.role, p.month, parseFloat(p.basicSalary || 0), parseFloat(p.allowances || 0), parseFloat(p.deductions || 0), parseFloat(p.netSalary || 0), p.paymentStatus, p.paymentDate, p.paymentMethod, p.createdAt || new Date().toISOString(), tId]
        );
      }
    }

    // 11. Sync Staff Payments
    if (db.staffPayments && Array.isArray(db.staffPayments)) {
      const activeSpIds = db.staffPayments.map(sp => sp.id);
      if (activeSpIds.length > 0) {
        await sqlDb.query(`DELETE FROM staff_payments WHERE tenantId = ? AND id NOT IN (${activeSpIds.map(() => '?').join(',')})`, [tId, ...activeSpIds]);
      } else {
        await sqlDb.query('DELETE FROM staff_payments WHERE tenantId = ?', [tId]);
      }

      for (const sp of db.staffPayments) {
        await sqlDb.query(
          'INSERT INTO staff_payments (id, staffId, amount, paymentDate, paymentMethod, status, remarks, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [sp.id, sp.staffId, parseFloat(sp.amount || 0), sp.paymentDate, sp.paymentMethod, sp.status || 'Paid', sp.remarks || '', tId]
        );
      }
    }

    // 12. Sync Activities
    if (db.activities && Array.isArray(db.activities)) {
      // Keep last 50 only in database to match JSON limit
      const itemsToKeep = db.activities.slice(0, 50);
      const activeActIds = itemsToKeep.map(act => act.id);
      if (activeActIds.length > 0) {
        await sqlDb.query(`DELETE FROM activities WHERE tenantId = ? AND id NOT IN (${activeActIds.map(() => '?').join(',')})`, [tId, ...activeActIds]);
      } else {
        await sqlDb.query('DELETE FROM activities WHERE tenantId = ?', [tId]);
      }

      for (const act of itemsToKeep) {
        await sqlDb.query(
          `INSERT INTO activities (id, type, title, description, time, timestamp, color, bg, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE time=VALUES(time)`,
          [act.id, act.type, act.title, act.desc || act.description, act.time, act.timestamp, act.color, act.bg, tId]
        );
      }
    }

    // 13. Sync Exams & Results
    if (db.exams && Array.isArray(db.exams)) {
      const activeExamIds = db.exams.map(ex => ex.id);
      if (activeExamIds.length > 0) {
        await sqlDb.query(`DELETE FROM exams WHERE tenantId = ? AND id NOT IN (${activeExamIds.map(() => '?').join(',')})`, [tId, ...activeExamIds]);
      } else {
        await sqlDb.query('DELETE FROM exams WHERE tenantId = ?', [tId]);
      }

      for (const ex of db.exams) {
        await sqlDb.query(
          `INSERT INTO exams (id, name, term, startDate, endDate, status, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status), startDate=VALUES(startDate), endDate=VALUES(endDate)`,
          [ex.id, ex.name, ex.term, ex.startDate, ex.endDate, ex.status, tId]
        );
      }
    }

    if (db.examTimetables && Array.isArray(db.examTimetables)) {
      const activeEtIds = db.examTimetables.map(et => et.id);
      if (activeEtIds.length > 0) {
        await sqlDb.query(`DELETE FROM exam_timetables WHERE tenantId = ? AND id NOT IN (${activeEtIds.map(() => '?').join(',')})`, [tId, ...activeEtIds]);
      } else {
        await sqlDb.query('DELETE FROM exam_timetables WHERE tenantId = ?', [tId]);
      }

      for (const et of db.examTimetables) {
        await sqlDb.query(
          'INSERT INTO exam_timetables (id, examId, examName, classId, subject, date, timeSlot, room, maxMarks, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [et.id, et.examId, et.examName, et.classId, et.subject, et.date, et.timeSlot, et.room, et.maxMarks || 100, tId]
        );
      }
    }

    if (db.results && Array.isArray(db.results)) {
      const activeResIds = db.results.map(r => r.id);
      if (activeResIds.length > 0) {
        await sqlDb.query(`DELETE FROM results WHERE tenantId = ? AND id NOT IN (${activeResIds.map(() => '?').join(',')})`, [tId, ...activeResIds]);
      } else {
        await sqlDb.query('DELETE FROM results WHERE tenantId = ?', [tId]);
      }

      for (const r of db.results) {
        await sqlDb.query(
          `INSERT INTO results (id, studentId, studentName, examId, examName, subject, marksObtained, maxMarks, grade, remarks, isLocked, isPublished, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE marksObtained=VALUES(marksObtained), grade=VALUES(grade), isLocked=VALUES(isLocked), isPublished=VALUES(isPublished)`,
          [r.id, r.studentId, r.studentName, r.examId, r.examName, r.subject, r.marksObtained, r.maxMarks || 100, r.grade || '', r.remarks || '', r.isLocked || false, r.isPublished || false, tId]
        );
      }
    }

    if (db.overallResults && Array.isArray(db.overallResults)) {
      const activeOrIds = db.overallResults.map(o => o.id || `OR-${o.studentId}`);
      if (activeOrIds.length > 0) {
        await sqlDb.query(`DELETE FROM overall_results WHERE tenantId = ? AND id NOT IN (${activeOrIds.map(() => '?').join(',')})`, [tId, ...activeOrIds]);
      } else {
        await sqlDb.query('DELETE FROM overall_results WHERE tenantId = ?', [tId]);
      }

      for (const o of db.overallResults) {
        await sqlDb.query(
          `INSERT INTO overall_results (id, studentId, studentName, classId, sectionId, percentage, grade, status, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE percentage=VALUES(percentage), grade=VALUES(grade), status=VALUES(status)`,
          [o.id || `OR-${o.studentId}`, o.studentId, o.studentName, o.classId, o.sectionId, parseFloat(o.percentage || 0), o.grade, o.status, tId]
        );
      }
    }

    // 14. Sync Notices, Holidays, Events, Subjects
    if (db.notices && Array.isArray(db.notices)) {
      const activeNoticeIds = db.notices.map(n => n.id);
      if (activeNoticeIds.length > 0) {
        await sqlDb.query(`DELETE FROM notices WHERE tenantId = ? AND id NOT IN (${activeNoticeIds.map(() => '?').join(',')})`, [tId, ...activeNoticeIds]);
      } else {
        await sqlDb.query('DELETE FROM notices WHERE tenantId = ?', [tId]);
      }

      for (const n of db.notices) {
        await sqlDb.query(
          `INSERT INTO notices (id, title, content, date, audience, createdBy, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content), audience=VALUES(audience)`,
          [n.id, n.title, n.content, n.date, n.audience || 'All', n.createdBy || '', tId]
        );
      }
    }

    if (db.holidays && Array.isArray(db.holidays)) {
      const activeHolidayIds = db.holidays.map(h => h.id);
      if (activeHolidayIds.length > 0) {
        await sqlDb.query(`DELETE FROM holidays WHERE tenantId = ? AND id NOT IN (${activeHolidayIds.map(() => '?').join(',')})`, [tId, ...activeHolidayIds]);
      } else {
        await sqlDb.query('DELETE FROM holidays WHERE tenantId = ?', [tId]);
      }

      for (const h of db.holidays) {
        await sqlDb.query(
          'INSERT INTO holidays (id, title, startDate, endDate, description, tenantId) VALUES (?, ?, ?, ?, ?, ?)',
          [h.id, h.title, h.startDate, h.endDate, h.description || '', tId]
        );
      }
    }

    if (db.events && Array.isArray(db.events)) {
      const activeEventIds = db.events.map(ev => ev.id);
      if (activeEventIds.length > 0) {
        await sqlDb.query(`DELETE FROM events WHERE tenantId = ? AND id NOT IN (${activeEventIds.map(() => '?').join(',')})`, [tId, ...activeEventIds]);
      } else {
        await sqlDb.query('DELETE FROM events WHERE tenantId = ?', [tId]);
      }

      for (const ev of db.events) {
        await sqlDb.query(
          'INSERT INTO events (id, title, description, date, time, venue, audience, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [ev.id, ev.title, ev.description || '', ev.date, ev.time, ev.venue || '', ev.audience || 'All', tId]
        );
      }
    }

    if (db.subjects && Array.isArray(db.subjects)) {
      const activeSubjectIds = db.subjects.map(sub => sub.id);
      if (activeSubjectIds.length > 0) {
        await sqlDb.query(`DELETE FROM subjects WHERE tenantId = ? AND id NOT IN (${activeSubjectIds.map(() => '?').join(',')})`, [tId, ...activeSubjectIds]);
      } else {
        await sqlDb.query('DELETE FROM subjects WHERE tenantId = ?', [tId]);
      }

      for (const sub of db.subjects) {
        await sqlDb.query(
          `INSERT INTO subjects (id, name, code, classId, teacherId, teacherName, tenantId) VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name), teacherId=VALUES(teacherId), teacherName=VALUES(teacherName)`,
          [sub.id, sub.name, sub.code || '', sub.classId, sub.teacherId || '', sub.teacherName || '', tId]
        );
      }
    }

    // 15. Sync Timeslots
    if (db.timeslots && Array.isArray(db.timeslots)) {
      await sqlDb.query('DELETE FROM timeslots WHERE tenantId = ?', [tId]);
      for (const slot of db.timeslots) {
        await sqlDb.query('INSERT INTO timeslots (slotTime, tenantId) VALUES (?, ?)', [slot, tId]);
      }
    }

    // 16. Sync structures: feeStructures, salaryStructures, staffSalaryStructures, income, attendance
    if (db.feeStructures && Array.isArray(db.feeStructures)) {
      const activeFsIds = db.feeStructures.map(fsItem => fsItem.id || `FS-${fsItem.grade}`);
      if (activeFsIds.length > 0) {
        await sqlDb.query(`DELETE FROM fee_structures WHERE tenantId = ? AND id NOT IN (${activeFsIds.map(() => '?').join(',')})`, [tId, ...activeFsIds]);
      } else {
        await sqlDb.query('DELETE FROM fee_structures WHERE tenantId = ?', [tId]);
      }

      for (const fsItem of db.feeStructures) {
        await sqlDb.query(
          `INSERT INTO fee_structures (id, classId, amount, frequency, tenantId) VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE amount=VALUES(amount), frequency=VALUES(frequency)`,
          [fsItem.id || `FS-${fsItem.grade}`, fsItem.grade, parseFloat(fsItem.amount || 0), fsItem.frequency || 'Yearly', tId]
        );
      }
    }

    if (db.salaryStructures && Array.isArray(db.salaryStructures)) {
      const activeSsIds = db.salaryStructures.map(ss => ss.id || `SS-${ss.gradeName}`);
      if (activeSsIds.length > 0) {
        await sqlDb.query(`DELETE FROM salary_structures WHERE tenantId = ? AND id NOT IN (${activeSsIds.map(() => '?').join(',')})`, [tId, ...activeSsIds]);
      } else {
        await sqlDb.query('DELETE FROM salary_structures WHERE tenantId = ?', [tId]);
      }

      for (const ss of db.salaryStructures) {
        await sqlDb.query(
          `INSERT INTO salary_structures (id, gradeName, basicSalary, allowances, deductions, tenantId) VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE basicSalary=VALUES(basicSalary), allowances=VALUES(allowances), deductions=VALUES(deductions)`,
          [ss.id || `SS-${ss.gradeName}`, ss.gradeName, parseFloat(ss.basicSalary || 0), JSON.stringify(ss.allowances || []), JSON.stringify(ss.deductions || []), tId]
        );
      }
    }

    if (db.staffSalaryStructures && Array.isArray(db.staffSalaryStructures)) {
      const activeSssIds = db.staffSalaryStructures.map(sss => sss.id || `SSS-${sss.position}`);
      if (activeSssIds.length > 0) {
        await sqlDb.query(`DELETE FROM staff_salary_structures WHERE tenantId = ? AND id NOT IN (${activeSssIds.map(() => '?').join(',')})`, [tId, ...activeSssIds]);
      } else {
        await sqlDb.query('DELETE FROM staff_salary_structures WHERE tenantId = ?', [tId]);
      }

      for (const sss of db.staffSalaryStructures) {
        await sqlDb.query(
          `INSERT INTO staff_salary_structures (id, position, basicSalary, allowances, deductions, tenantId) VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE basicSalary=VALUES(basicSalary), allowances=VALUES(allowances), deductions=VALUES(deductions)`,
          [sss.id || `SSS-${sss.position}`, sss.position, parseFloat(sss.basicSalary || 0), JSON.stringify(sss.allowances || []), JSON.stringify(sss.deductions || []), tId]
        );
      }
    }

    if (db.income && Array.isArray(db.income)) {
      const activeIncIds = db.income.map(inc => inc.id);
      if (activeIncIds.length > 0) {
        await sqlDb.query(`DELETE FROM income WHERE tenantId = ? AND id NOT IN (${activeIncIds.map(() => '?').join(',')})`, [tId, ...activeIncIds]);
      } else {
        await sqlDb.query('DELETE FROM income WHERE tenantId = ?', [tId]);
      }

      for (const inc of db.income) {
        await sqlDb.query(
          'INSERT INTO income (id, source, amount, date, description, tenantId) VALUES (?, ?, ?, ?, ?, ?)',
          [inc.id, inc.source, parseFloat(inc.amount || 0), inc.date || inc.paymentDate, inc.description || '', tId]
        );
      }
    }

    if (db.attendance && Array.isArray(db.attendance)) {
      const activeAttIds = db.attendance.map(att => att.attendanceId);
      if (activeAttIds.length > 0) {
        await sqlDb.query(`DELETE FROM attendance WHERE tenantId = ? AND attendanceId NOT IN (${activeAttIds.map(() => '?').join(',')})`, [tId, ...activeAttIds]);
      } else {
        await sqlDb.query('DELETE FROM attendance WHERE tenantId = ?', [tId]);
      }

      for (const att of db.attendance) {
        await sqlDb.query(
          `INSERT INTO attendance (
            attendanceId, studentId, classId, sectionId, attendanceDate, attendanceStatus, remarks, markedBy, createdAt, updatedAt, tenantId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE attendanceStatus=VALUES(attendanceStatus), remarks=VALUES(remarks), updatedAt=VALUES(updatedAt)`,
          [att.attendanceId, att.studentId, att.classId, att.sectionId, att.attendanceDate, att.attendanceStatus, att.remarks || '', att.markedBy || '', att.createdAt, att.updatedAt, tId]
        );
      }
    }

    console.log(`[SQL Sync SUCCESS] Finished database sync for tenant: ${tId}`);
  } catch (err) {
    console.error(`[SQL Sync ERROR] Sync query failed for tenant ${tenantId}:`, err);
  }
};

// Central Database Reader (Preserves synchronous signature)
export const readDb = () => {
  const tenantId = tenantStorage.getStore();
  const activeTenant = tenantId ? slugify(tenantId) : 'platform';
  
  if (isSqlActive() && dbCache[activeTenant]) {
    return dbCache[activeTenant];
  }

  // Fallback to synchronous local file read
  const dbFile = getDbPath();
  try {
    const data = fs.readFileSync(dbFile, 'utf8');
    const db = JSON.parse(data);
    
    // Ensure all standard collections exist defensively
    if (!db.schools) db.schools = [];
    if (!db.subscriptionPlans) db.subscriptionPlans = [];
    if (!db.activities) db.activities = [];
    if (!db.students) db.students = [];
    if (!db.teachers) db.teachers = [];
    if (!db.staff) db.staff = [];
    if (!db.timetables) db.timetables = [];
    if (!db.teacherTimetables) db.teacherTimetables = [];
    if (!db.invoices) db.invoices = [];
    if (!db.fees) db.fees = [];
    if (!db.expenses) db.expenses = [];
    if (!db.payroll) db.payroll = [];
    if (!db.staffPayments) db.staffPayments = [];
    if (!db.exams) db.exams = [];
    if (!db.examTimetables) db.examTimetables = [];
    if (!db.notices) db.notices = [];
    if (!db.holidays) db.holidays = [];
    if (!db.events) db.events = [];
    if (!db.results) db.results = [];
    if (!db.overallResults) db.overallResults = [];
    if (!db.subjects) db.subjects = [];
    if (!db.timeslots) {
      db.timeslots = [
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '01:00 PM - 02:00 PM',
        '02:00 PM - 03:00 PM'
      ];
    }
    return db;
  } catch (error) {
    const defaultDb = {
      schools: [],
      activities: [],
      students: [],
      teachers: [],
      staff: [],
      timetables: [],
      invoices: [],
      fees: [],
      expenses: [],
      payroll: [],
      staffPayments: [],
      exams: [],
      examTimetables: [],
      notices: [],
      holidays: [],
      events: [],
      results: [],
      overallResults: [],
      timeslots: [
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '01:00 PM - 02:00 PM',
        '02:00 PM - 03:00 PM'
      ]
    };
    return defaultDb;
  }
};

// Central Database Writer (Preserves synchronous signature)
export const writeDb = (data) => {
  const tenantId = tenantStorage.getStore();
  const activeTenant = tenantId ? slugify(tenantId) : 'platform';

  if (isSqlActive()) {
    // 1. Update memory cache instantly
    dbCache[activeTenant] = data;
    // 2. Dispatch MySQL sync asynchronously in the background
    saveMemoryDbToSql(activeTenant, data);
  }

  // Backup to JSON file asynchronously to avoid blocking
  const dbFile = getDbPath();
  fs.writeFile(dbFile, JSON.stringify(data, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(`[JSON Backup ERROR] Failed writing local backup:`, err);
    }
  });
};

// Helper to log system activities
export const addActivity = (db, type, title, desc, color = 'hsl(var(--color-primary))', bg = 'rgba(hsl(var(--color-primary)), 0.1)') => {
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
