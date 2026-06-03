import express from 'express';
import {
  getTimetables,
  createTimetable,
  deleteTimetable,
  getExams,
  createExam,
  updateExam,
  deleteExam,
  getExamTimetables,
  createExamTimetable,
  deleteExamTimetable,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getHolidays,
  createHoliday,
  deleteHoliday,
  getResults,
  createResult,
  deleteResult,
  getTimeslots,
  createTimeslot,
  deleteTimeslot
} from '../controllers/academicController.js';

const router = express.Router();

// Timetables
router.get('/timetables', getTimetables);
router.post('/timetables', createTimetable);
router.delete('/timetables/:id', deleteTimetable);

// Timeslots
router.get('/timeslots', getTimeslots);
router.post('/timeslots', createTimeslot);
router.delete('/timeslots', deleteTimeslot);

// Exams
router.get('/exams', getExams);
router.post('/exams', createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);

// Exam Timetables
router.get('/exam-timetables', getExamTimetables);
router.post('/exam-timetables', createExamTimetable);
router.delete('/exam-timetables/:id', deleteExamTimetable);

// Events
router.get('/events', getEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// Notices
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.put('/notices/:id', updateNotice);
router.delete('/notices/:id', deleteNotice);

// Holidays
router.get('/holidays', getHolidays);
router.post('/holidays', createHoliday);
router.delete('/holidays/:id', deleteHoliday);

// Results
router.get('/results', getResults);
router.post('/results', createResult);
router.delete('/results/:id', deleteResult);

export default router;
