import express from 'express';
import {
  getFinanceOverview,
  getFeeStructures,
  createFeeStructure,
  deleteFeeStructure,
  getFees,
  collectFee,
  getSalaryStructures,
  createSalaryStructure,
  deleteSalaryStructure,
  getPayroll,
  processPayroll,
  getStaffSalaryStructures,
  createStaffSalaryStructure,
  deleteStaffSalaryStructure,
  getStaffPayments,
  processStaffPayment,
  getExpenses,
  addExpense,
  getIncome,
  addIncome
} from '../controllers/financeController.js';

const router = express.Router();

// Dashboard overview
router.get('/overview', getFinanceOverview);

// Fee structures
router.get('/fee-structures', getFeeStructures);
router.post('/fee-structures', createFeeStructure);
router.delete('/fee-structures/:id', deleteFeeStructure);

// Student fees (collections)
router.get('/fees', getFees);
router.post('/fees', collectFee);

// Salary structures
router.get('/salary-structures', getSalaryStructures);
router.post('/salary-structures', createSalaryStructure);
router.delete('/salary-structures/:id', deleteSalaryStructure);

// Payroll
router.get('/payroll', getPayroll);
router.post('/payroll', processPayroll);

// Staff Salary Structures
  router.get('/staff-salary-structures', getStaffSalaryStructures);
  router.post('/staff-salary-structures', createStaffSalaryStructure);
  router.delete('/staff-salary-structures/:id', deleteStaffSalaryStructure);

  // Staff Payments
router.get('/staff-payments', getStaffPayments);
router.post('/staff-payments', processStaffPayment);

// Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', addExpense);

// Income
router.get('/income', getIncome);
router.post('/income', addIncome);

export default router;
