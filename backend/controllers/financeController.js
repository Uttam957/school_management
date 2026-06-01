import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'db.json');
const DEFAULT_STAFF_SALARY_STRUCTURE_IDS = new Set([
  'SSSTR-ADMIN',
  'SSSTR-REG',
  'SSSTR-LIB',
  'SSSTR-IT',
  'SSSTR-SEC',
  'SSSTR-FAC'
]);
const DEFAULT_TEACHER_SALARY_STRUCTURE_IDS = new Set([
  'SSTR-PRIN',
  'SSTR-SRT',
  'SSTR-TCH',
  'SSTR-AST',
  'SSTR-RCP'
]);
const DEFAULT_TEACHER_DESIGNATIONS = new Set([
  'Principal',
  'Senior Teacher',
  'Teacher',
  'Assistant Teacher',
  'Receptionist'
]);

// Auto-seeding helper for mock finance records
const autoSeedFinance = (db) => {
  try {
    let modified = false;

    // 1. Fee Structures
    if (!db.feeStructures || db.feeStructures.length === 0) {
      console.log('--- Seeding default fee structures ---');
      const classes = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
      db.feeStructures = classes.map((c, idx) => {
        const factor = idx + 1;
        const admissionFee = 3000 + factor * 500;
        const tuitionFee = 5000 + factor * 1200;
        const examFee = 1000 + factor * 100;
        const transportFee = 2000;
        const libraryFee = 500 + factor * 50;
        const otherCharges = 500;
        const totalFee = admissionFee + tuitionFee + examFee + transportFee + libraryFee + otherCharges;
        return {
          id: `FSTR-${c}`,
          studentClass: c,
          admissionFee,
          tuitionFee,
          examFee,
          transportFee,
          hostelFee: 0,
          libraryFee,
          otherCharges,
          totalFee,
          updatedAt: new Date().toISOString()
        };
      });
      modified = true;
    }

    // 2. Salary Structures (seeding disabled to start with clean state as requested)
    if (!db.salaryStructures) {
      db.salaryStructures = [];
      modified = true;
    }

    // 3. Student Fees (Collection invoices)
    if ((!db.fees || db.fees.length === 0) && db.students && db.students.length > 0) {
      console.log('--- Seeding default student fees (collections) ---');
      const sampleStudents = db.students.slice(0, 60);
      const feeTypes = ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Transport Fee'];
      const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'];
      
      const getPastDate = (monthsAgo, sIdx) => {
        const d = new Date();
        d.setMonth(d.getMonth() - monthsAgo);
        d.setDate(1 + (sIdx % 28));
        return d.toISOString().split('T')[0];
      };

      sampleStudents.forEach((stu, sIdx) => {
        const fstr = db.feeStructures.find(f => f.studentClass === stu.studentClass) || db.feeStructures[0];
        const recordsCount = sIdx % 3 === 0 ? 2 : 1;
        for (let r = 0; r < recordsCount; r++) {
          const feeType = r === 0 ? 'Tuition Fee' : feeTypes[(sIdx + r) % feeTypes.length];
          
          let amount = 12000;
          if (feeType === 'Tuition Fee') amount = fstr.tuitionFee;
          else if (feeType === 'Admission Fee') amount = fstr.admissionFee;
          else if (feeType === 'Exam Fee') amount = fstr.examFee;
          else if (feeType === 'Transport Fee') amount = fstr.transportFee;

          const discount = sIdx % 7 === 0 ? 1000 : 0;
          const fine = sIdx % 11 === 0 ? 500 : 0;
          const totalAmount = amount - discount + fine;
          
          let paymentStatus = 'Paid';
          if (sIdx % 5 === 0) paymentStatus = 'Pending';
          else if (sIdx % 8 === 0) paymentStatus = 'Partial';

          const paidAmount = paymentStatus === 'Paid' ? totalAmount : (paymentStatus === 'Partial' ? Math.floor(totalAmount / 2) : 0);
          const dueAmount = totalAmount - paidAmount;
          
          const receiptNumber = `RCP-${new Date().getFullYear()}-${10000 + sIdx * 5 + r}`;
          const paymentMethod = paymentMethods[(sIdx + r) % paymentMethods.length];
          const transactionId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
          
          const monthsAgo = sIdx % 6;
          const paymentDate = getPastDate(monthsAgo, sIdx);

          db.fees.push({
            feeId: `FEE-${Date.now()}-${sIdx}-${r}`,
            studentId: stu.id,
            studentName: stu.fullName || stu.name,
            admissionNumber: stu.admissionNumber,
            studentClass: stu.studentClass,
            section: stu.section,
            feeType,
            amount,
            discount,
            fine,
            totalAmount,
            paidAmount,
            dueAmount,
            paymentStatus,
            paymentMethod,
            transactionId,
            receiptNumber,
            paymentDate,
            remarks: paymentStatus === 'Paid' ? 'Paid in full' : (paymentStatus === 'Partial' ? 'First installment' : 'Awaiting payment'),
            createdAt: new Date(paymentDate).toISOString()
          });
        }
      });
      modified = true;
    }

    // 4. Teacher Payroll
    if ((!db.payroll || db.payroll.length === 0) && db.teachers && db.teachers.length > 0) {
      console.log('--- Seeding default payroll ---');
      const sampleTeachers = db.teachers.slice(0, 10);
      
      const getPastDate = (monthsAgo) => {
        const d = new Date();
        d.setMonth(d.getMonth() - monthsAgo);
        d.setDate(28);
        return d.toISOString().split('T')[0];
      };

      sampleTeachers.forEach((t, tIdx) => {
        const designation = tIdx === 0 ? 'Principal' : (tIdx < 3 ? 'Senior Teacher' : 'Teacher');
        const sstr = db.salaryStructures.find(s => s.designation === designation) || db.salaryStructures[2];
        
        for (let m = 1; m <= 3; m++) {
          const paymentDate = getPastDate(m);
          const netSalary = sstr.basicSalary + sstr.allowances - sstr.deductions - sstr.pfDeduction - sstr.taxDeduction;

          db.payroll.push({
            payrollId: `PAY-${Date.now()}-${tIdx}-${m}`,
            teacherId: t.id,
            teacherName: t.fullName || t.name,
            employeeId: t.employeeId || `EMP-${1000 + tIdx}`,
            designation,
            department: t.department || 'Academics',
            basicSalary: sstr.basicSalary,
            allowances: sstr.allowances,
            bonus: 0,
            deductions: sstr.deductions,
            pfDeduction: sstr.pfDeduction,
            taxDeduction: sstr.taxDeduction,
            netSalary,
            paymentStatus: 'Paid',
            paymentDate,
            paymentMethod: 'Bank Transfer',
            createdAt: new Date(paymentDate).toISOString()
          });

          db.expenses.push({
            expenseId: `EXP-PAY-${Date.now()}-${tIdx}-${m}`,
            title: `Salary - ${t.fullName || t.name}`,
            category: 'Salary',
            amount: netSalary,
            description: `Monthly salary payout for ${t.fullName || t.name} (${designation})`,
            date: paymentDate,
            paidBy: 'Accountant',
            attachment: '',
            createdAt: new Date(paymentDate).toISOString()
          });
        }
      });
      modified = true;
    }

    // 5. Operating Expenses
    if (!db.expenses || db.expenses.length === 0 || db.expenses.filter(e => e.category !== 'Salary').length === 0) {
      console.log('--- Seeding default operating expenses ---');
      const expenseTemplates = [
        { title: 'Electricity Bill', category: 'Utilities', amount: 8500, description: 'Main school building power bill' },
        { title: 'Water Bill', category: 'Utilities', amount: 2400, description: 'Campus water supply charges' },
        { title: 'Fiber Internet lease', category: 'Utilities', amount: 3500, description: 'Monthly school internet line' },
        { title: 'Science Lab Chemicals', category: 'Lab Equipment', amount: 15000, description: 'Purchase of chemistry lab reagents' },
        { title: 'Office Stationery', category: 'Stationery', amount: 4800, description: 'Paper, markers, files' },
        { title: 'Sports Kits', category: 'Sports Gear', amount: 12000, description: 'New kits for sports teams' },
        { title: 'Library Book Purchase', category: 'Library', amount: 18000, description: 'New academic textbooks' },
        { title: 'Computer Lab Maintenance', category: 'Maintenance', amount: 22000, description: 'RAM upgrades and hardware service' },
        { title: 'Annual Day Stage Setup', category: 'Events', amount: 45000, description: 'Decor, lighting, and sound rental' },
        { title: 'School Building Painting', category: 'Maintenance', amount: 75000, description: 'Repainting classroom corridors' }
      ];

      const getPastDate = (monthsAgo, idx) => {
        const d = new Date();
        d.setMonth(d.getMonth() - monthsAgo);
        d.setDate(1 + (idx % 28));
        return d.toISOString().split('T')[0];
      };

      expenseTemplates.forEach((exp, idx) => {
        const monthsAgo = idx % 6;
        const date = getPastDate(monthsAgo, idx);

        db.expenses.push({
          expenseId: `EXP-OPS-${Date.now()}-${idx}`,
          title: exp.title,
          category: exp.category,
          amount: exp.amount,
          description: exp.description,
          date,
          paidBy: 'Accountant',
          attachment: '',
          createdAt: new Date(date).toISOString()
        });
      });
      modified = true;
    }

    // 6. (removed auto-seed - user creates manually via form)

    // 7. Staff Payments
    if ((!db.staffPayments || db.staffPayments.length === 0) && db.staff && db.staff.length > 0 && db.staffSalaryStructures && db.staffSalaryStructures.length > 0) {
      console.log('--- Seeding default staff payments ---');
      const sampleStaff = db.staff.slice(0, 15);
      const getPastDate = (monthsAgo) => {
        const d = new Date();
        d.setMonth(d.getMonth() - monthsAgo);
        d.setDate(28);
        return d.toISOString().split('T')[0];
      };

      sampleStaff.forEach((s, sIdx) => {
        const sstr = db.staffSalaryStructures.find(ss => ss.designation === s.role) || db.staffSalaryStructures[0];
        for (let m = 1; m <= 3; m++) {
          const paymentDate = getPastDate(m);
          const netSalary = sstr.basicSalary + sstr.allowances + (sstr.bonus || 0) - sstr.deductions - sstr.pfDeduction - sstr.taxDeduction;

          db.staffPayments.push({
            paymentId: `SPAY-${Date.now()}-${sIdx}-${m}`,
            staffId: s.id,
            staffName: s.name,
            staffRole: s.role,
            department: s.department,
            basicSalary: sstr.basicSalary,
            allowances: sstr.allowances,
            bonus: sstr.bonus || 0,
            deductions: sstr.deductions,
            pfDeduction: sstr.pfDeduction,
            taxDeduction: sstr.taxDeduction,
            netSalary,
            paymentStatus: 'Paid',
            paymentDate,
            paymentMethod: 'Bank Transfer',
            createdAt: new Date(paymentDate).toISOString()
          });

          db.expenses.push({
            expenseId: `EXP-SPAY-${Date.now()}-${sIdx}-${m}`,
            title: `Salary - ${s.name}`,
            category: 'Salary',
            amount: netSalary,
            description: `Monthly salary payout for ${s.name} (${s.role})`,
            date: paymentDate,
            paidBy: 'Accountant',
            attachment: '',
            createdAt: new Date(paymentDate).toISOString()
          });
        }
      });
      modified = true;
    }

    // 8. Other Income
    if (!db.income || db.income.length === 0) {
      console.log('--- Seeding default other income ---');
      const incomeTemplates = [
        { source: 'Canteen Rent', amount: 15000, description: 'Monthly rent from canteen operator' },
        { source: 'Alumni Association Donation', amount: 50000, description: 'Donation for library improvement' },
        { source: 'Uniform Counter Sales', amount: 35000, description: 'Revenue from student uniform store' },
        { source: 'Textbooks Commission', amount: 22000, description: 'Sale commission from textbook distributor' },
        { source: 'Government Sports Grant', amount: 80000, description: 'Grant for sports grounds development' }
      ];

      const getPastDate = (monthsAgo, idx) => {
        const d = new Date();
        d.setMonth(d.getMonth() - monthsAgo);
        d.setDate(1 + (idx % 28));
        return d.toISOString().split('T')[0];
      };

      incomeTemplates.forEach((inc, idx) => {
        const monthsAgo = idx % 6;
        const date = getPastDate(monthsAgo, idx);

        db.income.push({
          incomeId: `INC-OPS-${Date.now()}-${idx}`,
          source: inc.source,
          amount: inc.amount,
          description: inc.description,
          date,
          receivedBy: 'Accountant',
          createdAt: new Date(date).toISOString()
        });
      });
      modified = true;
    }

    if (modified) {
      console.log('--- FINANCE TABLES SEEDED SUCCESSFULLY ---');
    }
  } catch (err) {
    console.error('Error auto-seeding finance details:', err);
  }
};

const removeDefaultStaffSalaryStructures = (db) => {
  const initialCount = db.staffSalaryStructures?.length || 0;
  db.staffSalaryStructures = (db.staffSalaryStructures || []).filter(
    structure => !DEFAULT_STAFF_SALARY_STRUCTURE_IDS.has(structure.id)
  );

  return db.staffSalaryStructures.length !== initialCount;
};

const removeDefaultTeacherSalaryStructures = (db) => {
  const initialCount = db.salaryStructures?.length || 0;
  db.salaryStructures = (db.salaryStructures || []).filter(
    structure => !DEFAULT_TEACHER_SALARY_STRUCTURE_IDS.has(structure.id) &&
                 !DEFAULT_TEACHER_DESIGNATIONS.has(structure.designation)
  );

  return db.salaryStructures.length !== initialCount;
};

// Helper to read database
const readDb = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(data);
    // Ensure finance collections exist
    if (!db.feeStructures) db.feeStructures = [];
    if (!db.fees) db.fees = [];
    if (!db.salaryStructures) db.salaryStructures = [];
    if (!db.payroll) db.payroll = [];
    if (!db.staffSalaryStructures) db.staffSalaryStructures = [];
    if (!db.staffPayments) db.staffPayments = [];
    if (!db.expenses) db.expenses = [];
    if (!db.income) db.income = [];

    const removedDefaultStaffStructures = removeDefaultStaffSalaryStructures(db);
    const removedDefaultTeacherStructures = removeDefaultTeacherSalaryStructures(db);

    // Trigger auto-seeding if fees are empty or staff payments missing
    if (db.fees.length === 0 || !db.staffPayments || db.staffPayments.length === 0) {
      autoSeedFinance(db);
      // Write immediately to persist seeded data
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    } else if (removedDefaultStaffStructures || removedDefaultTeacherStructures) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    }

    return db;
  } catch (error) {
    console.error('Error reading db.json in finance controller:', error);
    return { students: [], teachers: [], feeStructures: [], fees: [], salaryStructures: [], payroll: [], expenses: [], income: [], activities: [] };
  }
};

// Helper to write database
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json in finance controller:', error);
  }
};

// Helper to log activities
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

// =============================================
// 1. FINANCE OVERVIEW / DASHBOARD TELEMETRY
// =============================================
export const getFinanceOverview = (req, res) => {
  try {
    const db = readDb();

    const totalFeeCollected = db.fees
      .filter(f => f.paymentStatus === 'Paid')
      .reduce((sum, f) => sum + (f.paidAmount || 0), 0);

    const totalPendingFees = db.fees
      .filter(f => f.paymentStatus === 'Pending' || f.paymentStatus === 'Partial')
      .reduce((sum, f) => sum + (f.dueAmount || 0), 0);

    const totalExpenses = db.expenses
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalIncome = db.income
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    const totalPayrollPaid = db.payroll
      .filter(p => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);

    const totalPayrollPending = db.payroll
      .filter(p => p.paymentStatus === 'Pending')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);

    const totalStaffPaymentsPaid = db.staffPayments
      .filter(p => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);

    const netProfit = totalFeeCollected + totalIncome - totalExpenses - totalPayrollPaid;

    // Monthly breakdown for charts (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const monthFees = db.fees
        .filter(f => f.paymentStatus === 'Paid' && f.paymentDate?.startsWith(yearMonth))
        .reduce((sum, f) => sum + (f.paidAmount || 0), 0);

      const monthExpenses = db.expenses
        .filter(e => e.date?.startsWith(yearMonth))
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const monthPayroll = db.payroll
        .filter(p => p.paymentStatus === 'Paid' && p.paymentDate?.startsWith(yearMonth))
        .reduce((sum, p) => sum + (p.netSalary || 0), 0);

      monthlyData.push({
        month: monthStr,
        fees: monthFees,
        expenses: monthExpenses + monthPayroll,
        profit: monthFees - monthExpenses - monthPayroll
      });
    }

    res.json({
      totalFeeCollected,
      totalPendingFees,
      totalExpenses,
      totalIncome,
      totalPayrollPaid,
      totalPayrollPending,
      netProfit,
      totalStudents: db.students?.length || 0,
      totalTeachers: db.teachers?.length || 0,
      totalFeeRecords: db.fees?.length || 0,
      totalPayrollRecords: db.payroll?.length || 0,
      totalStaffPaymentsPaid,
      totalStaffPaymentsRecords: db.staffPayments?.length || 0,
      totalStaff: db.staff?.length || 0,
      monthlyData
    });
  } catch (err) {
    console.error('Error fetching finance overview:', err);
    res.status(500).json({ error: 'Server error loading finance overview.' });
  }
};

// =============================================
// 2. FEE STRUCTURES
// =============================================
export const getFeeStructures = (req, res) => {
  try {
    const db = readDb();
    res.json(db.feeStructures || []);
  } catch (err) {
    console.error('Error fetching fee structures:', err);
    res.status(500).json({ error: 'Server error loading fee structures.' });
  }
};

export const createFeeStructure = (req, res) => {
  try {
    const { studentClass, admissionFee, tuitionFee, examFee, transportFee, hostelFee, libraryFee, otherCharges } = req.body;

    if (!studentClass) {
      return res.status(400).json({ error: 'Student class is required.' });
    }

    const db = readDb();

    const admission = Number(admissionFee) || 0;
    const tuition = Number(tuitionFee) || 0;
    const exam = Number(examFee) || 0;
    const transport = Number(transportFee) || 0;
    const hostel = Number(hostelFee) || 0;
    const library = Number(libraryFee) || 0;
    const other = Number(otherCharges) || 0;
    const totalFee = admission + tuition + exam + transport + hostel + library + other;

    // Check if structure for this class already exists
    const existingIndex = db.feeStructures.findIndex(fs => fs.studentClass === studentClass);

    const structure = {
      id: existingIndex > -1 ? db.feeStructures[existingIndex].id : `FSTR-${studentClass}`,
      studentClass,
      admissionFee: admission,
      tuitionFee: tuition,
      examFee: exam,
      transportFee: transport,
      hostelFee: hostel,
      libraryFee: library,
      otherCharges: other,
      totalFee,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      db.feeStructures[existingIndex] = structure;
    } else {
      db.feeStructures.push(structure);
    }

    addActivity(db, 'finance', 'Fee Structure Updated', `Fee structure for Grade ${studentClass} set to ₹${totalFee.toLocaleString()}`, 'rgb(var(--color-success-rgb))', 'rgba(var(--color-success-rgb), 0.1)');
    writeDb(db);

    res.status(201).json(structure);
  } catch (err) {
    console.error('Error creating fee structure:', err);
    res.status(500).json({ error: 'Server error saving fee structure.' });
  }
};

export const deleteFeeStructure = (req, res) => {
  try {
    const db = readDb();
    const idx = db.feeStructures.findIndex(fs => fs.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Fee structure not found.' });

    const removed = db.feeStructures.splice(idx, 1)[0];
    addActivity(db, 'alert', 'Fee Structure Removed', `Removed fee structure for Grade ${removed.studentClass}`, 'rgb(var(--color-danger-rgb))', 'rgba(var(--color-danger-rgb), 0.1)');
    writeDb(db);

    res.json({ success: true, message: `Removed fee structure for ${removed.studentClass}` });
  } catch (err) {
    console.error('Error deleting fee structure:', err);
    res.status(500).json({ error: 'Server error deleting fee structure.' });
  }
};

// =============================================
// 3. STUDENT FEES (COLLECTIONS)
// =============================================
export const getFees = (req, res) => {
  try {
    const { studentClass, section, status, search } = req.query;
    const db = readDb();
    let fees = db.fees || [];

    if (studentClass && studentClass !== 'All') {
      fees = fees.filter(f => f.studentClass === studentClass);
    }
    if (section && section !== 'All') {
      fees = fees.filter(f => f.section === section);
    }
    if (status && status !== 'All') {
      fees = fees.filter(f => f.paymentStatus === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      fees = fees.filter(f =>
        f.studentName?.toLowerCase().includes(q) ||
        f.admissionNumber?.toLowerCase().includes(q) ||
        f.receiptNumber?.toLowerCase().includes(q)
      );
    }

    res.json(fees);
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ error: 'Server error loading fees.' });
  }
};

export const collectFee = (req, res) => {
  try {
    const { studentId, studentName, admissionNumber, studentClass, section, feeType, amount, discount, fine, paidAmount, paymentMethod, remarks } = req.body;

    if (!studentId || !feeType || !amount) {
      return res.status(400).json({ error: 'Student ID, fee type, and amount are required.' });
    }

    const db = readDb();

    const amt = Number(amount) || 0;
    const disc = Number(discount) || 0;
    const fn = Number(fine) || 0;
    const totalAmount = amt - disc + fn;
    const paid = Number(paidAmount) || totalAmount;
    const due = totalAmount - paid;

    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newFee = {
      feeId: `FEE-${Date.now()}`,
      studentId,
      studentName: studentName || 'Unknown',
      admissionNumber: admissionNumber || '',
      studentClass: studentClass || '',
      section: section || '',
      feeType,
      amount: amt,
      discount: disc,
      fine: fn,
      totalAmount,
      paidAmount: paid,
      dueAmount: due,
      paymentStatus: due <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending'),
      paymentMethod: paymentMethod || 'Cash',
      transactionId: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      receiptNumber,
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: remarks || '',
      createdAt: new Date().toISOString()
    };

    db.fees.push(newFee);

    addActivity(db, 'finance', 'Fee Collected', `₹${paid.toLocaleString()} collected from ${studentName} (${feeType})`, 'rgb(var(--color-success-rgb))', 'rgba(var(--color-success-rgb), 0.1)');
    writeDb(db);

    res.status(201).json(newFee);
  } catch (err) {
    console.error('Error collecting fee:', err);
    res.status(500).json({ error: 'Server error recording fee.' });
  }
};

// =============================================
// 4. SALARY STRUCTURES
// =============================================
export const getSalaryStructures = (req, res) => {
  try {
    const db = readDb();
    res.json(db.salaryStructures || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error loading salary structures.' });
  }
};

export const createSalaryStructure = (req, res) => {
  try {
    const { designation, basicSalary, allowances, deductions, pfDeduction, taxDeduction } = req.body;

    if (!designation || !basicSalary) {
      return res.status(400).json({ error: 'Designation and basic salary are required.' });
    }

    const db = readDb();
    const existingIdx = db.salaryStructures.findIndex(s => s.designation === designation);

    const structure = {
      id: existingIdx > -1 ? db.salaryStructures[existingIdx].id : `SSTR-${Date.now()}`,
      designation,
      basicSalary: Number(basicSalary) || 0,
      allowances: Number(allowances) || 0,
      deductions: Number(deductions) || 0,
      pfDeduction: Number(pfDeduction) || 0,
      taxDeduction: Number(taxDeduction) || 0,
      netSalary: (Number(basicSalary) || 0) + (Number(allowances) || 0) - (Number(deductions) || 0) - (Number(pfDeduction) || 0) - (Number(taxDeduction) || 0),
      updatedAt: new Date().toISOString()
    };

    if (existingIdx > -1) {
      db.salaryStructures[existingIdx] = structure;
    } else {
      db.salaryStructures.push(structure);
    }

    addActivity(db, 'finance', 'Salary Structure Updated', `Structure for "${designation}" updated`, 'hsl(var(--color-info))', 'rgba(hsl(var(--color-info)), 0.1)');
    writeDb(db);

    res.status(201).json(structure);
  } catch (err) {
    res.status(500).json({ error: 'Server error saving salary structure.' });
  }
};

// =============================================
// 5. PAYROLL
// =============================================
export const getPayroll = (req, res) => {
  try {
    const { status, search, month } = req.query;
    const db = readDb();
    let payroll = db.payroll || [];

    if (status && status !== 'All') {
      payroll = payroll.filter(p => p.paymentStatus === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      payroll = payroll.filter(p =>
        p.teacherName?.toLowerCase().includes(q) ||
        p.employeeId?.toLowerCase().includes(q)
      );
    }
    if (month) {
      payroll = payroll.filter(p => p.paymentDate?.startsWith(month));
    }

    res.json(payroll);
  } catch (err) {
    res.status(500).json({ error: 'Server error loading payroll.' });
  }
};

export const processPayroll = (req, res) => {
  try {
    const { teacherId, teacherName, employeeId, designation, department, basicSalary, allowances, bonus, deductions, pfDeduction, taxDeduction, paymentMethod } = req.body;

    if (!teacherId || !teacherName || !basicSalary) {
      return res.status(400).json({ error: 'Teacher ID, name, and salary are required.' });
    }

    const db = readDb();

    const basic = Number(basicSalary) || 0;
    const allow = Number(allowances) || 0;
    const bon = Number(bonus) || 0;
    const ded = Number(deductions) || 0;
    const pf = Number(pfDeduction) || 0;
    const tax = Number(taxDeduction) || 0;
    const netSalary = basic + allow + bon - ded - pf - tax;

    const newPayroll = {
      payrollId: `PAY-${Date.now()}`,
      teacherId,
      teacherName,
      employeeId: employeeId || `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      designation: designation || 'Teacher',
      department: department || 'General',
      basicSalary: basic,
      allowances: allow,
      bonus: bon,
      deductions: ded,
      pfDeduction: pf,
      taxDeduction: tax,
      netSalary,
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod || 'Bank Transfer',
      createdAt: new Date().toISOString()
    };

    db.payroll.push(newPayroll);

    // Also log as expense
    db.expenses.push({
      expenseId: `EXP-${Date.now()}`,
      title: `Salary - ${teacherName}`,
      category: 'Salary',
      amount: netSalary,
      description: `Monthly salary payout for ${teacherName} (${designation})`,
      date: new Date().toISOString().split('T')[0],
      paidBy: 'Accountant',
      attachment: ''
    });

    addActivity(db, 'finance', 'Salary Processed', `₹${netSalary.toLocaleString()} paid to ${teacherName}`, 'rgb(var(--color-success-rgb))', 'rgba(var(--color-success-rgb), 0.1)');
    writeDb(db);

    res.status(201).json(newPayroll);
  } catch (err) {
    res.status(500).json({ error: 'Server error processing payroll.' });
  }
};

// =============================================
// 6. STAFF SALARY STRUCTURES
// =============================================
export const getStaffSalaryStructures = (req, res) => {
  try {
    const db = readDb();
    res.json(db.staffSalaryStructures || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error loading staff salary structures.' });
  }
};

export const createStaffSalaryStructure = (req, res) => {
  try {
    const { designation, basicSalary, allowances, bonus, deductions, pfDeduction, taxDeduction } = req.body;

    if (!designation || !basicSalary) {
      return res.status(400).json({ error: 'Designation and basic salary are required.' });
    }

    const db = readDb();
    const existingIdx = db.staffSalaryStructures.findIndex(s => s.designation === designation);

    const structure = {
      id: existingIdx > -1 ? db.staffSalaryStructures[existingIdx].id : `SSSTR-${Date.now()}`,
      designation,
      basicSalary: Number(basicSalary) || 0,
      allowances: Number(allowances) || 0,
      bonus: Number(bonus) || 0,
      deductions: Number(deductions) || 0,
      pfDeduction: Number(pfDeduction) || 0,
      taxDeduction: Number(taxDeduction) || 0,
      netSalary: (Number(basicSalary) || 0) + (Number(allowances) || 0) + (Number(bonus) || 0) - (Number(deductions) || 0) - (Number(pfDeduction) || 0) - (Number(taxDeduction) || 0),
      updatedAt: new Date().toISOString()
    };

    if (existingIdx > -1) {
      db.staffSalaryStructures[existingIdx] = structure;
    } else {
      db.staffSalaryStructures.push(structure);
    }

    addActivity(db, 'finance', 'Staff Salary Structure Updated', `Structure for "${designation}" updated`, 'hsl(var(--color-info))', 'rgba(hsl(var(--color-info)), 0.1)');
    writeDb(db);

    res.status(201).json(structure);
  } catch (err) {
    res.status(500).json({ error: 'Server error saving staff salary structure.' });
  }
};

// =============================================
// 7. STAFF PAYMENTS
// =============================================
export const getStaffPayments = (req, res) => {
  try {
    const { status, search, month } = req.query;
    const db = readDb();
    let payments = db.staffPayments || [];

    if (status && status !== 'All') {
      payments = payments.filter(p => p.paymentStatus === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      payments = payments.filter(p =>
        p.staffName?.toLowerCase().includes(q) ||
        p.staffRole?.toLowerCase().includes(q)
      );
    }
    if (month) {
      payments = payments.filter(p => p.paymentDate?.startsWith(month));
    }

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Server error loading staff payments.' });
  }
};

export const processStaffPayment = (req, res) => {
  try {
    const { staffId, staffName, staffRole, department, basicSalary, allowances, bonus, deductions, pfDeduction, taxDeduction, paymentMethod } = req.body;

    if (!staffId || !staffName || !basicSalary) {
      return res.status(400).json({ error: 'Staff ID, name, and salary are required.' });
    }

    const db = readDb();

    const basic = Number(basicSalary) || 0;
    const allow = Number(allowances) || 0;
    const bon = Number(bonus) || 0;
    const ded = Number(deductions) || 0;
    const pf = Number(pfDeduction) || 0;
    const tax = Number(taxDeduction) || 0;
    const netSalary = basic + allow + bon - ded - pf - tax;

    const newPayment = {
      paymentId: `SPAY-${Date.now()}`,
      staffId,
      staffName,
      staffRole: staffRole || 'Staff',
      department: department || 'General',
      basicSalary: basic,
      allowances: allow,
      bonus: bon,
      deductions: ded,
      pfDeduction: pf,
      taxDeduction: tax,
      netSalary,
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod || 'Bank Transfer',
      createdAt: new Date().toISOString()
    };

    db.staffPayments.push(newPayment);

    // Also log as expense
    db.expenses.push({
      expenseId: `EXP-${Date.now()}`,
      title: `Salary - ${staffName}`,
      category: 'Salary',
      amount: netSalary,
      description: `Monthly salary payout for ${staffName} (${staffRole})`,
      date: new Date().toISOString().split('T')[0],
      paidBy: 'Accountant',
      attachment: ''
    });

    addActivity(db, 'finance', 'Staff Salary Processed', `₹${netSalary.toLocaleString()} paid to ${staffName}`, 'rgb(var(--color-success-rgb))', 'rgba(var(--color-success-rgb), 0.1)');
    writeDb(db);

    res.status(201).json(newPayment);
  } catch (err) {
    res.status(500).json({ error: 'Server error processing staff payment.' });
  }
};

// =============================================
// 8. EXPENSES
// =============================================
export const getExpenses = (req, res) => {
  try {
    const { category, search } = req.query;
    const db = readDb();
    let expenses = db.expenses || [];

    if (category && category !== 'All') {
      expenses = expenses.filter(e => e.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      expenses = expenses.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    }

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Server error loading expenses.' });
  }
};

export const addExpense = (req, res) => {
  try {
    const { title, category, amount, description, date, paidBy } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ error: 'Title, category, and amount are required.' });
    }

    const db = readDb();

    const newExpense = {
      expenseId: `EXP-${Date.now()}`,
      title,
      category,
      amount: Number(amount) || 0,
      description: description || '',
      date: date || new Date().toISOString().split('T')[0],
      paidBy: paidBy || 'Accountant',
      attachment: '',
      createdAt: new Date().toISOString()
    };

    db.expenses.push(newExpense);

    addActivity(db, 'finance', 'Expense Recorded', `₹${Number(amount).toLocaleString()} for ${title} (${category})`, 'rgb(var(--color-warning-rgb))', 'rgba(var(--color-warning-rgb), 0.1)');
    writeDb(db);

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: 'Server error adding expense.' });
  }
};

// =============================================
// 7. INCOME
// =============================================
export const getIncome = (req, res) => {
  try {
    const { source, search } = req.query;
    const db = readDb();
    let income = db.income || [];

    if (source && source !== 'All') {
      income = income.filter(i => i.source === source);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      income = income.filter(i =>
        i.source?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q)
      );
    }

    res.json(income);
  } catch (err) {
    res.status(500).json({ error: 'Server error loading income.' });
  }
};

export const addIncome = (req, res) => {
  try {
    const { source, amount, description, date, receivedBy } = req.body;

    if (!source || !amount) {
      return res.status(400).json({ error: 'Source and amount are required.' });
    }

    const db = readDb();

    const newIncome = {
      incomeId: `INC-${Date.now()}`,
      source,
      amount: Number(amount) || 0,
      description: description || '',
      date: date || new Date().toISOString().split('T')[0],
      receivedBy: receivedBy || 'Accountant',
      createdAt: new Date().toISOString()
    };

    db.income.push(newIncome);

    addActivity(db, 'finance', 'Income Recorded', `₹${Number(amount).toLocaleString()} from ${source}`, 'rgb(var(--color-success-rgb))', 'rgba(var(--color-success-rgb), 0.1)');
    writeDb(db);

    res.status(201).json(newIncome);
  } catch (err) {
    res.status(500).json({ error: 'Server error adding income.' });
  }
};

export const deleteSalaryStructure = (req, res) => {
  try {
    const db = readDb();
    const idx = db.salaryStructures.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Salary structure not found.' });

    const removed = db.salaryStructures.splice(idx, 1)[0];
    addActivity(db, 'alert', 'Salary Structure Removed', `Removed salary structure for ${removed.designation}`, 'rgb(var(--color-danger-rgb))', 'rgba(var(--color-danger-rgb), 0.1)');
    writeDb(db);

    res.json({ success: true, message: `Removed salary structure for ${removed.designation}` });
  } catch (err) {
    console.error('Error deleting salary structure:', err);
    res.status(500).json({ error: 'Server error deleting salary structure.' });
  }
};

export const deleteStaffSalaryStructure = (req, res) => {
  try {
    const db = readDb();
    const idx = db.staffSalaryStructures.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Staff salary structure not found.' });

    const removed = db.staffSalaryStructures.splice(idx, 1)[0];
    addActivity(db, 'alert', 'Staff Salary Structure Removed', `Removed staff salary structure for ${removed.designation}`, 'rgb(var(--color-danger-rgb))', 'rgba(var(--color-danger-rgb), 0.1)');
    writeDb(db);

    res.json({ success: true, message: `Removed staff salary structure for ${removed.designation}` });
  } catch (err) {
    console.error('Error deleting staff salary structure:', err);
    res.status(500).json({ error: 'Server error deleting staff salary structure.' });
  }
};
