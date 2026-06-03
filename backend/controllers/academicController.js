import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'db.json');

// Helper to read database
const readDb = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(data);
    
    // Ensure all required academic collections exist
    if (!db.timetables) db.timetables = [];
    if (!db.exams) db.exams = [];
    if (!db.examTimetables) db.examTimetables = [];
    if (!db.events) db.events = [];
    if (!db.notices) db.notices = [];
    if (!db.holidays) db.holidays = [];
    if (!db.results) db.results = [];
    if (!db.activities) db.activities = [];
    
    return db;
  } catch (error) {
    console.error('Error reading db.json in academics controller:', error);
    return {
      timetables: [],
      exams: [],
      examTimetables: [],
      events: [],
      notices: [],
      holidays: [],
      results: [],
      activities: []
    };
  }
};

// Helper to write database
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db.json in academics controller:', error);
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

// Conflict helper: Checks if two time slots overlap
// e.g. "09:00 AM - 10:00 AM" and "09:30 AM - 10:30 AM"
const isTimeOverlapping = (time1, time2) => {
  if (!time1 || !time2) return false;
  if (time1.trim().toLowerCase() === time2.trim().toLowerCase()) return true;

  const parseTime = (timeStr) => {
    // Format: "HH:MM AM/PM" or "HH:MM AM/PM - HH:MM AM/PM"
    const parts = timeStr.split('-');
    if (parts.length < 2) {
      // Just single time slot
      return { start: parseSingle(timeStr), end: parseSingle(timeStr) + 60 };
    }
    return {
      start: parseSingle(parts[0]),
      end: parseSingle(parts[1])
    };
  };

  const parseSingle = (tStr) => {
    const clean = tStr.trim();
    const match = clean.match(/^(\d+):(\d+)\s*(am|pm)$/i);
    if (!match) return 0;
    let hrs = parseInt(match[1]);
    const mins = parseInt(match[2]);
    const ampm = match[3].toLowerCase();
    
    if (ampm === 'pm' && hrs < 12) hrs += 12;
    if (ampm === 'am' && hrs === 12) hrs = 0;
    
    return hrs * 60 + mins;
  };

  try {
    const t1 = parseTime(time1);
    const t2 = parseTime(time2);
    return t1.start < t2.end && t2.start < t1.end;
  } catch (e) {
    return false; // Fallback in case of parse errors
  }
};

// =============================================
// 1. CLASS TIMETABLE CONTROLLER
// =============================================
export const getTimetables = (req, res) => {
  const db = readDb();
  res.json(db.timetables);
};

export const createTimetable = (req, res) => {
  const { cohort, day, time, subject, teacher, room, session } = req.body;

  if (!cohort || !day || !time || !subject || !teacher || !room) {
    return res.status(400).json({ error: 'All fields (cohort, day, time, subject, teacher, room) are required.' });
  }

  const db = readDb();

  // Conflict Detection: Teacher double booking or Room booking conflict
  const conflict = db.timetables.find(t => {
    if (t.day.toLowerCase() === day.toLowerCase() && isTimeOverlapping(t.time, time)) {
      // Teacher conflict
      if (t.teacher.toLowerCase() === teacher.toLowerCase()) {
        return { type: 'Teacher', msg: `Faculty ${teacher} is already assigned to ${t.cohort} on ${day} during ${t.time}.` };
      }
      // Room conflict
      if (t.room.toLowerCase() === room.toLowerCase()) {
        return { type: 'Room', msg: `Classroom ${room} is already booked for ${t.cohort} on ${day} during ${t.time}.` };
      }
    }
    return false;
  });

  if (conflict) {
    const foundConflict = db.timetables.find(t => t.day.toLowerCase() === day.toLowerCase() && isTimeOverlapping(t.time, time) && (t.teacher.toLowerCase() === teacher.toLowerCase() || t.room.toLowerCase() === room.toLowerCase()));
    const msg = foundConflict.teacher.toLowerCase() === teacher.toLowerCase() 
      ? `Faculty ${teacher} is already assigned to ${foundConflict.cohort} on ${day} during ${foundConflict.time}.`
      : `Classroom ${room} is already booked for ${foundConflict.cohort} on ${day} during ${foundConflict.time}.`;
    return res.status(400).json({ error: `Conflict Detected: ${msg}` });
  }

  const newSlot = {
    id: `TT-${Date.now()}`,
    cohort,
    day,
    time,
    subject,
    teacher,
    room,
    session: session || '2026-2027'
  };

  db.timetables.push(newSlot);
  writeDb(db);

  res.status(201).json(newSlot);
};

export const deleteTimetable = (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialCount = db.timetables.length;
  db.timetables = db.timetables.filter(t => t.id !== id);

  if (db.timetables.length === initialCount) {
    return res.status(404).json({ error: 'Timetable period not found.' });
  }

  writeDb(db);
  res.json({ message: 'Timetable period successfully deleted.' });
};

// =============================================
// 2. EXAM MANAGEMENT CONTROLLER
// =============================================
export const getExams = (req, res) => {
  const db = readDb();
  res.json(db.exams);
};

export const createExam = (req, res) => {
  const { examName, examType, grade, section, startDate, endDate, totalMarks, passingMarks, status } = req.body;

  if (!examName || !examType || !grade || !startDate || !endDate || !totalMarks || !passingMarks) {
    return res.status(400).json({ error: 'Missing required exam fields.' });
  }

  const db = readDb();
  const newExam = {
    id: `EXM-${Date.now()}`,
    examName,
    examType,
    grade,
    section: section || 'All',
    startDate,
    endDate,
    totalMarks: parseInt(totalMarks),
    passingMarks: parseInt(passingMarks),
    status: status || 'Scheduled'
  };

  db.exams.push(newExam);
  addActivity(db, 'alert', 'New Examination Scheduled', `${examName} created for Grade ${grade}`, 'hsl(var(--color-primary))', 'rgba(hsl(var(--color-primary)), 0.1)');
  writeDb(db);

  res.status(201).json(newExam);
};

export const updateExam = (req, res) => {
  const { id } = req.params;
  const { examName, examType, grade, section, startDate, endDate, totalMarks, passingMarks, status } = req.body;

  const db = readDb();
  const examIndex = db.exams.findIndex(e => e.id === id);

  if (examIndex === -1) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  db.exams[examIndex] = {
    ...db.exams[examIndex],
    examName: examName || db.exams[examIndex].examName,
    examType: examType || db.exams[examIndex].examType,
    grade: grade || db.exams[examIndex].grade,
    section: section || db.exams[examIndex].section,
    startDate: startDate || db.exams[examIndex].startDate,
    endDate: endDate || db.exams[examIndex].endDate,
    totalMarks: totalMarks ? parseInt(totalMarks) : db.exams[examIndex].totalMarks,
    passingMarks: passingMarks ? parseInt(passingMarks) : db.exams[examIndex].passingMarks,
    status: status || db.exams[examIndex].status
  };

  writeDb(db);
  res.json(db.exams[examIndex]);
};

export const deleteExam = (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialCount = db.exams.length;
  db.exams = db.exams.filter(e => e.id !== id);

  if (db.exams.length === initialCount) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  writeDb(db);
  res.json({ message: 'Exam configuration deleted successfully.' });
};

// =============================================
// 3. EXAM TIMETABLE CONTROLLER
// =============================================
export const getExamTimetables = (req, res) => {
  const db = readDb();
  res.json(db.examTimetables);
};

export const createExamTimetable = (req, res) => {
  const { examId, subject, examDate, startTime, endTime, duration, roomAllocation, invigilator } = req.body;

  if (!examId || !subject || !examDate || !startTime || !endTime || !roomAllocation || !invigilator) {
    return res.status(400).json({ error: 'Missing required exam timetable fields.' });
  }

  const db = readDb();

  // Conflict Detection: Invigilator or room busy on same day and overlapping time
  const timeSlot = `${startTime} - ${endTime}`;
  const conflict = db.examTimetables.find(et => {
    if (et.examDate === examDate && isTimeOverlapping( `${et.startTime} - ${et.endTime}`, timeSlot)) {
      if (et.invigilator.toLowerCase() === invigilator.toLowerCase()) {
        return true;
      }
      if (et.roomAllocation.toLowerCase() === roomAllocation.toLowerCase()) {
        return true;
      }
    }
    return false;
  });

  if (conflict) {
    const foundConflict = db.examTimetables.find(et => et.examDate === examDate && isTimeOverlapping( `${et.startTime} - ${et.endTime}`, timeSlot));
    const msg = foundConflict.invigilator.toLowerCase() === invigilator.toLowerCase()
      ? `Invigilator ${invigilator} is already scheduled on ${examDate} at ${foundConflict.startTime}.`
      : `Room ${roomAllocation} is already allocated on ${examDate} at ${foundConflict.startTime}.`;
    return res.status(400).json({ error: `Conflict Detected: ${msg}` });
  }

  const newSchedule = {
    id: `EXMT-${Date.now()}`,
    examId,
    subject,
    examDate,
    startTime,
    endTime,
    duration: duration || '3 Hours',
    roomAllocation,
    invigilator
  };

  db.examTimetables.push(newSchedule);
  writeDb(db);

  res.status(201).json(newSchedule);
};

export const deleteExamTimetable = (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialCount = db.examTimetables.length;
  db.examTimetables = db.examTimetables.filter(et => et.id !== id);

  if (db.examTimetables.length === initialCount) {
    return res.status(404).json({ error: 'Exam slot not found.' });
  }

  writeDb(db);
  res.json({ message: 'Exam slot deleted successfully.' });
};

// =============================================
// 4. EVENTS CONTROLLER
// =============================================
export const getEvents = (req, res) => {
  const db = readDb();
  res.json(db.events);
};

export const createEvent = (req, res) => {
  const { title, type, date, time, venue, description, organizer, participants, status } = req.body;

  if (!title || !type || !date || !time || !venue) {
    return res.status(400).json({ error: 'Title, Type, Date, Time, and Venue are required.' });
  }

  const db = readDb();
  const newEvent = {
    id: `EVT-${Date.now()}`,
    title,
    type,
    date,
    time,
    venue,
    description: description || '',
    organizer: organizer || 'School Admin',
    participants: participants || 'All Students',
    status: status || 'Scheduled'
  };

  db.events.push(newEvent);
  addActivity(db, 'alert', 'New School Event', `Event "${title}" scheduled for ${date} at ${venue}`, 'hsl(var(--color-secondary))', 'rgba(hsl(var(--color-secondary)), 0.1)');
  writeDb(db);

  res.status(201).json(newEvent);
};

export const updateEvent = (req, res) => {
  const { id } = req.params;
  const { title, type, date, time, venue, description, organizer, participants, status } = req.body;

  const db = readDb();
  const eventIdx = db.events.findIndex(evt => evt.id === id);

  if (eventIdx === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  db.events[eventIdx] = {
    ...db.events[eventIdx],
    title: title || db.events[eventIdx].title,
    type: type || db.events[eventIdx].type,
    date: date || db.events[eventIdx].date,
    time: time || db.events[eventIdx].time,
    venue: venue || db.events[eventIdx].venue,
    description: description || db.events[eventIdx].description,
    organizer: organizer || db.events[eventIdx].organizer,
    participants: participants || db.events[eventIdx].participants,
    status: status || db.events[eventIdx].status
  };

  writeDb(db);
  res.json(db.events[eventIdx]);
};

export const deleteEvent = (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialCount = db.events.length;
  db.events = db.events.filter(evt => evt.id !== id);

  if (db.events.length === initialCount) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  writeDb(db);
  res.json({ message: 'Event deleted successfully.' });
};

// =============================================
// 5. NOTICES CONTROLLER
// =============================================
export const getNotices = (req, res) => {
  const db = readDb();
  res.json(db.notices);
};

export const createNotice = (req, res) => {
  const { title, content, category, priority, publishDate, expiryDate, visibility } = req.body;

  if (!title || !content || !category || !publishDate) {
    return res.status(400).json({ error: 'Title, Content, Category, and Publish Date are required.' });
  }

  const db = readDb();
  const newNotice = {
    id: `NTC-${Date.now()}`,
    title,
    content,
    category,
    priority: priority || 'Medium',
    publishDate,
    expiryDate: expiryDate || '',
    visibility: visibility || 'All'
  };

  db.notices.push(newNotice);
  addActivity(db, 'alert', 'Notice Board Published', `Notice: "${title}" visibility set to: ${newNotice.visibility}`, 'hsl(var(--color-info))', 'rgba(hsl(var(--color-info)), 0.1)');
  writeDb(db);

  res.status(201).json(newNotice);
};

export const updateNotice = (req, res) => {
  const { id } = req.params;
  const { title, content, category, priority, publishDate, expiryDate, visibility } = req.body;

  const db = readDb();
  const index = db.notices.findIndex(n => n.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Notice not found.' });
  }

  db.notices[index] = {
    ...db.notices[index],
    title: title || db.notices[index].title,
    content: content || db.notices[index].content,
    category: category || db.notices[index].category,
    priority: priority || db.notices[index].priority,
    publishDate: publishDate || db.notices[index].publishDate,
    expiryDate: expiryDate || db.notices[index].expiryDate,
    visibility: visibility || db.notices[index].visibility
  };

  writeDb(db);
  res.json(db.notices[index]);
};

export const deleteNotice = (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialCount = db.notices.length;
  db.notices = db.notices.filter(n => n.id !== id);

  if (db.notices.length === initialCount) {
    return res.status(404).json({ error: 'Notice not found.' });
  }

  writeDb(db);
  res.json({ message: 'Notice board entry deleted successfully.' });
};

// =============================================
// 6. HOLIDAYS CONTROLLER
// =============================================
export const getHolidays = (req, res) => {
  const db = readDb();
  res.json(db.holidays);
};

export const createHoliday = (req, res) => {
  const { name, type, startDate, endDate, description } = req.body;

  if (!name || !type || !startDate || !endDate) {
    return res.status(400).json({ error: 'Holiday Name, Type, Start Date, and End Date are required.' });
  }

  const db = readDb();
  const newHoliday = {
    id: `HLD-${Date.now()}`,
    name,
    type,
    startDate,
    endDate,
    description: description || ''
  };

  db.holidays.push(newHoliday);
  writeDb(db);

  res.status(201).json(newHoliday);
};

export const deleteHoliday = (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialCount = db.holidays.length;
  db.holidays = db.holidays.filter(h => h.id !== id);

  if (db.holidays.length === initialCount) {
    return res.status(404).json({ error: 'Holiday not found.' });
  }

  writeDb(db);
  res.json({ message: 'Holiday schedule removed successfully.' });
};

// =============================================
// 7. RESULTS CONTROLLER (GRADES, GPA, MARKSHEETS & RANKS)
// =============================================
export const getResults = (req, res) => {
  const db = readDb();
  
  // Enforce linking student details
  const resultsWithDetails = (db.results || []).map(r => {
    const student = (db.students || []).find(s => s.id === r.studentId);
    const exam = (db.exams || []).find(e => e.id === r.examId);
    return {
      ...r,
      studentName: student ? student.name : 'Unknown Student',
      studentRoll: student ? student.rollNumber || student.roll : 'N/A',
      studentClass: student ? student.studentClass : 'N/A',
      examName: exam ? exam.examName : 'Unknown Exam'
    };
  });

  res.json(resultsWithDetails);
};

export const createResult = (req, res) => {
  const { studentId, examId, subject, obtainedMarks, totalMarks, term } = req.body;

  if (!studentId || !examId || !subject || obtainedMarks === undefined || !totalMarks) {
    return res.status(400).json({ error: 'Student ID, Exam ID, Subject, Obtained Marks, and Total Marks are required.' });
  }

  const db = readDb();
  const obt = parseFloat(obtainedMarks);
  const tot = parseFloat(totalMarks);

  if (obt > tot) {
    return res.status(400).json({ error: 'Obtained Marks cannot be greater than Total Marks.' });
  }

  const percentage = Math.round((obt / tot) * 100);

  // Grade & GPA Mapping
  let grade = 'F';
  let gpa = 0.0;

  if (percentage >= 90) { grade = 'A+'; gpa = 4.0; }
  else if (percentage >= 80) { grade = 'A'; gpa = 3.7; }
  else if (percentage >= 70) { grade = 'B+'; gpa = 3.3; }
  else if (percentage >= 60) { grade = 'B'; gpa = 3.0; }
  else if (percentage >= 50) { grade = 'C'; gpa = 2.0; }
  else if (percentage >= 40) { grade = 'D'; gpa = 1.0; }
  else { grade = 'F'; gpa = 0.0; }

  const newResult = {
    id: `RST-${Date.now()}`,
    studentId,
    examId,
    subject,
    obtainedMarks: obt,
    totalMarks: tot,
    term: term || 'First Term',
    percentage,
    grade,
    gpa,
    rank: '-' // Placeholder, calculated below
  };

  // Check if result already exists for this student, exam, and subject, if so update it
  const matchIdx = db.results.findIndex(r => r.studentId === studentId && r.examId === examId && r.subject.toLowerCase() === subject.toLowerCase());
  if (matchIdx !== -1) {
    db.results[matchIdx] = { ...db.results[matchIdx], ...newResult, id: db.results[matchIdx].id };
  } else {
    db.results.push(newResult);
  }

  // RE-CALCULATE CLASS RANKS FOR THIS SPECIFIC EXAM AND SUBJECT
  // We rank students in the same class/grade
  const student = (db.students || []).find(s => s.id === studentId);
  const targetClass = student ? student.studentClass : null;

  if (targetClass) {
    // 1. Get all students in targetClass
    const classStudentIds = (db.students || [])
      .filter(s => s.studentClass === targetClass)
      .map(s => s.id);

    // 2. Get all results for this subject and exam for these students
    const cohortResults = db.results.filter(r => 
      r.examId === examId && 
      r.subject.toLowerCase() === subject.toLowerCase() &&
      classStudentIds.includes(r.studentId)
    );

    // 3. Sort by percentage descending
    cohortResults.sort((a, b) => b.percentage - a.percentage);

    // 4. Update ranks in the main database array
    cohortResults.forEach((resItem, index) => {
      const idxInDb = db.results.findIndex(r => r.id === resItem.id);
      if (idxInDb !== -1) {
        db.results[idxInDb].rank = index + 1; // 1-based ranking
      }
    });
  }

  writeDb(db);
  res.status(201).json(newResult);
};

export const deleteResult = (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialCount = db.results.length;
  db.results = db.results.filter(r => r.id !== id);

  if (db.results.length === initialCount) {
    return res.status(404).json({ error: 'Result entry not found.' });
  }

  writeDb(db);
  res.json({ message: 'Result record deleted successfully.' });
};
