import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AsyncLocalStorage } from 'async_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GLOBAL_DB_FILE = path.join(__dirname, '..', 'db.json');
const TENANTS_DIR = path.join(__dirname, '..', 'tenants');

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

// Dynamic database path selector
export const getDbPath = () => {
  const tenantId = tenantStorage.getStore();
  if (tenantId && tenantId !== 'platform' && tenantId !== 'localhost') {
    return path.join(TENANTS_DIR, `db_${tenantId}.json`);
  }
  return GLOBAL_DB_FILE;
};

// Central database reader
export const readDb = () => {
  const dbFile = getDbPath();
  try {
    const data = fs.readFileSync(dbFile, 'utf8');
    const db = JSON.parse(data);
    
    // Ensure all collections exist defensively on both global and tenant levels
    if (!db.schools) db.schools = [];
    if (!db.subscriptionPlans) {
      db.subscriptionPlans = [
        { id: 'PLAN-001', name: 'Starter', price: '$99/mo', features: ['Up to 100 Students', 'Basic Analytics', 'Standard Support'] },
        { id: 'PLAN-002', name: 'Growth', price: '$249/mo', features: ['Up to 500 Students', 'Full Reports', 'Priority Support'] },
        { id: 'PLAN-003', name: 'Premium', price: '$499/mo', features: ['Unlimited Students', 'Advanced Finance', '24/7 Dedicated Support'] }
      ];
    }
    if (!db.activities) db.activities = [];
    if (!db.students) db.students = [];
    if (!db.teachers) db.teachers = [];
    if (!db.staff) db.staff = [];
    if (!db.timetables) db.timetables = [];
    if (!db.invoices) db.invoices = [];
    if (!db.fees) db.fees = [];
    if (!db.expenses) db.expenses = [];
    if (!db.payroll) db.payroll = [];
    if (!db.staffPayments) db.staffPayments = [];
    if (!db.exams) db.exams = [];
    if (!db.examTimetables) db.examTimetables = [];
    if (!db.notices) db.notices = [];
    if (!db.holidays) db.holidays = [];
    if (!db.results) db.results = [];
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
      subscriptionPlans: [
        { id: 'PLAN-001', name: 'Starter', price: '$99/mo', features: ['Up to 100 Students', 'Basic Analytics', 'Standard Support'] },
        { id: 'PLAN-002', name: 'Growth', price: '$249/mo', features: ['Up to 500 Students', 'Full Reports', 'Priority Support'] },
        { id: 'PLAN-003', name: 'Premium', price: '$499/mo', features: ['Unlimited Students', 'Advanced Finance', '24/7 Dedicated Support'] }
      ],
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
      results: [],
      timeslots: [
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '01:00 PM - 02:00 PM',
        '02:00 PM - 03:00 PM'
      ]
    };
    try {
      fs.writeFileSync(dbFile, JSON.stringify(defaultDb, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to create default database file:', err);
    }
    return defaultDb;
  }
};

// Central database writer
export const writeDb = (data) => {
  const dbFile = getDbPath();
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing db at ${dbFile}:`, error);
  }
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

// Run auto-migration on load if required
const runMigration = () => {
  try {
    if (!fs.existsSync(GLOBAL_DB_FILE)) return;
    const raw = fs.readFileSync(GLOBAL_DB_FILE, 'utf8');
    const db = JSON.parse(raw);
    
    // Check if db.json is in the old single-tenant structure
    if (db.school && (db.students || db.teachers || db.timetables)) {
      console.log('--- Multi-Tenant Migration Triggered ---');
      const schoolDetails = db.school;
      const rawSubdomain = schoolDetails.subdomain || 'jana';
      const tenantSubdomain = slugify(rawSubdomain);
      
      // 1. Create tenant-specific database file
      const tenantDbPath = path.join(TENANTS_DIR, `db_${tenantSubdomain}.json`);
      const tenantDb = {
        school: schoolDetails,
        students: db.students || [],
        teachers: db.teachers || [],
        staff: db.staff || [],
        timetables: db.timetables || [],
        invoices: db.invoices || [],
        fees: db.fees || [],
        expenses: db.expenses || [],
        payroll: db.payroll || [],
        staffPayments: db.staffPayments || [],
        activities: db.activities || [],
        exams: db.exams || [],
        examTimetables: db.examTimetables || [],
        notices: db.notices || [],
        holidays: db.holidays || [],
        results: db.results || [],
        income: db.income || []
      };
      
      fs.writeFileSync(tenantDbPath, JSON.stringify(tenantDb, null, 2), 'utf8');
      console.log(`Created tenant database: ${tenantDbPath}`);
      
      // 2. Format the school in global record format
      const platformSchool = {
        id: `SCH-${Date.now()}`,
        name: schoolDetails.name || 'Jana Mcgowan',
        code: 'SCH-001',
        subdomain: tenantSubdomain,
        logo: '',
        principalName: schoolDetails.principal || schoolDetails.adminName || 'Cynthia Marsh',
        email: schoolDetails.email || 'hezixeg@mailinator.com',
        phone: schoolDetails.phone || '+1 (648) 929-1212',
        address: schoolDetails.address || '',
        city: schoolDetails.city || '',
        state: schoolDetails.state || '',
        country: 'India',
        academicSession: '2026-2027',
        subscriptionPlan: 'Growth',
        url: `https://${tenantSubdomain}.myschoolerp.com`,
        status: 'Active',
        adminName: schoolDetails.adminName || 'Cynthia Marsh',
        adminEmail: schoolDetails.adminEmail || 'uttamrajpurohit306115@gmail.com',
        adminUsername: 'jana_admin',
        adminPassword: schoolDetails.adminPassword || 'uttam@2004',
        createdAt: new Date().toISOString()
      };
      
      // 3. Reconstruct global db.json for platform
      const globalDb = {
        schools: [platformSchool],
        subscriptionPlans: [
          { id: 'PLAN-001', name: 'Starter', price: '$99/mo', features: ['Up to 100 Students', 'Basic Analytics', 'Standard Support'] },
          { id: 'PLAN-002', name: 'Growth', price: '$249/mo', features: ['Up to 500 Students', 'Full Reports', 'Priority Support'] },
          { id: 'PLAN-003', name: 'Premium', price: '$499/mo', features: ['Unlimited Students', 'Advanced Finance', '24/7 Dedicated Support'] }
        ],
        activities: [
          {
            id: `ACT-${Date.now()}`,
            type: 'alert',
            title: 'Tenant Migrated Successfully',
            desc: `School "${schoolDetails.name}" migrated to subdomain "${tenantSubdomain}"`,
            time: 'Just now',
            timestamp: new Date().toISOString(),
            color: 'hsl(var(--color-primary))',
            bg: 'rgba(hsl(var(--color-primary)), 0.1)'
          }
        ]
      };
      
      fs.writeFileSync(GLOBAL_DB_FILE, JSON.stringify(globalDb, null, 2), 'utf8');
      console.log('Global database re-initialized with schools registry.');
      console.log('--- Multi-Tenant Migration Finished ---');
    }
  } catch (e) {
    console.error('Migration failed:', e);
  }
};

runMigration();
