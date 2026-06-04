import { readDb, writeDb, addActivity } from '../utils/db.js';

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
  const { cohort, day, time, subject, teacher = '', room = '', session } = req.body;

  if (!cohort || !day || !time || !subject) {
    return res.status(400).json({ error: 'All fields (cohort, day, time, subject) are required.' });
  }

  const db = readDb();

  const cleanTeacher = (teacher || '').trim();
  const cleanRoom = (room || '').trim();

  // Conflict Detection: Teacher double booking or Room booking conflict (only if values are supplied and not n/a)
  let conflictMsg = null;
  const conflict = db.timetables.find(t => {
    if (t.day.toLowerCase() === day.toLowerCase() && isTimeOverlapping(t.time, time)) {
      // Teacher conflict
      if (cleanTeacher !== '' && cleanTeacher.toLowerCase() !== 'n/a' && t.teacher && t.teacher.trim().toLowerCase() === cleanTeacher.toLowerCase()) {
        conflictMsg = `Faculty ${cleanTeacher} is already assigned to ${t.cohort} on ${day} during ${t.time}.`;
        return true;
      }
      // Room conflict
      if (cleanRoom !== '' && cleanRoom.toLowerCase() !== 'n/a' && t.room && t.room.trim().toLowerCase() === cleanRoom.toLowerCase()) {
        conflictMsg = `Classroom ${cleanRoom} is already booked for ${t.cohort} on ${day} during ${t.time}.`;
        return true;
      }
    }
    return false;
  });

  if (conflict) {
    return res.status(400).json({ error: `Conflict Detected: ${conflictMsg}` });
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
  const enriched = (db.exams || []).map(ex => {
    const scheduleCount = db.examTimetables ? db.examTimetables.filter(et => et.examId === ex.id).length : 0;
    return { ...ex, scheduleCount };
  });
  res.json(enriched);
};

export const createExam = (req, res) => {
  const { examName, examType, academicSession, description, gradeSections } = req.body;

  if (!examName || !examType || !academicSession || !gradeSections || gradeSections.length === 0) {
    return res.status(400).json({ error: 'Missing required exam fields.' });
  }

  const db = readDb();

  const now = Date.now();
  const endDates = gradeSections.map(gs => gs.endDate).filter(Boolean);
  const examEndDate = endDates.length === gradeSections.length ? endDates.sort().reverse()[0] : null;

  const newExam = {
    id: `EXM-${now}`,
    examName,
    examType,
    academicSession,
    description: description || '',
    gradeSections: gradeSections.map(gs => ({
      grade: gs.grade,
      section: gs.section,
      startDate: gs.startDate,
      endDate: gs.endDate || null
    })),
    endDate: examEndDate,
    status: 'Draft',
    createdAt: new Date().toISOString()
  };

  db.exams.push(newExam);
  addActivity(db, 'alert', 'New Examination Created', `${examName} created as Draft`, 'hsl(var(--color-primary))', 'rgba(hsl(var(--color-primary)), 0.1)');
  writeDb(db);

  res.status(201).json(newExam);
};

export const updateExam = (req, res) => {
  const { id } = req.params;
  const { examName, examType, academicSession, description, gradeSections, status } = req.body;

  const db = readDb();
  const examIndex = db.exams.findIndex(e => e.id === id);

  if (examIndex === -1) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  if (examName) db.exams[examIndex].examName = examName;
  if (examType) db.exams[examIndex].examType = examType;
  if (academicSession) db.exams[examIndex].academicSession = academicSession;
  if (description !== undefined) db.exams[examIndex].description = description;
  if (gradeSections) db.exams[examIndex].gradeSections = gradeSections;
  if (status) db.exams[examIndex].status = status;

  writeDb(db);
  res.json(db.exams[examIndex]);
};

export const deleteExam = (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const initialCount = db.exams.length;
  db.exams = db.exams.filter(e => e.id !== id);
  db.examTimetables = (db.examTimetables || []).filter(et => et.examId !== id);

  if (db.exams.length === initialCount) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  writeDb(db);
  res.json({ message: 'Exam configuration deleted successfully.' });
};

export const generateExamSchedule = (req, res) => {
  const { examId, gapDays = 1 } = req.body;

  if (!examId) {
    return res.status(400).json({ error: 'Exam ID is required.' });
  }

  const db = readDb();
  const exam = db.exams.find(e => e.id === examId);

  if (!exam) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  const subjectsByGrade = {};
  (db.subjects || []).forEach(sub => {
    if (!subjectsByGrade[sub.grade]) subjectsByGrade[sub.grade] = [];
    subjectsByGrade[sub.grade].push(sub.subjectName);
  });

  const newSchedules = [];
  let anyError = null;

  exam.gradeSections.forEach(gs => {
    const gradeSubjects = subjectsByGrade[gs.grade] || [];
    if (gradeSubjects.length === 0) {
      anyError = `No subjects found for Grade ${gs.grade}`;
      return;
    }

    const startDate = new Date(gs.startDate + 'T00:00:00');
    const cohort = gs.section ? `${gs.grade}-${gs.section}` : gs.grade;
    const scheduledOnDates = new Set();
    let currentDate = new Date(startDate);
    let subjectIndex = 0;

    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const isHoliday = (dateStr) => {
      return (db.holidays || []).some(h => {
        if (!h.startDate || !h.endDate) return false;
        return dateStr >= h.startDate && dateStr <= h.endDate;
      });
    };

    while (subjectIndex < gradeSubjects.length) {
      const dateStr = formatDate(currentDate);

      // Skip Sundays (day 0)
      if (currentDate.getDay() === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Skip holidays
      if (isHoliday(dateStr)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Prevent duplicate exam on same day for this cohort
      const existingOnDate = (db.examTimetables || []).some(
        et => et.examDate === dateStr && et.cohort === cohort && et.examId !== examId
      );
      if (existingOnDate || scheduledOnDates.has(dateStr)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Remove existing schedule for this exam+cohort+subject to allow regeneration
      const existingIdx = db.examTimetables.findIndex(
        et => et.examId === examId && et.cohort === cohort && et.subject === gradeSubjects[subjectIndex]
      );
      if (existingIdx !== -1) {
        db.examTimetables.splice(existingIdx, 1);
      }

      newSchedules.push({
        id: `EXMT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        examId,
        grade: gs.grade,
        section: gs.section || '',
        cohort,
        subject: gradeSubjects[subjectIndex],
        examDate: dateStr
      });

      scheduledOnDates.add(dateStr);
      subjectIndex++;
      currentDate.setDate(currentDate.getDate() + parseInt(gapDays));
    }

    // Auto-calculate end date if not set manually
    if (!gs.endDate) {
      const cohortSchedules = newSchedules.filter(s => s.cohort === cohort);
      if (cohortSchedules.length > 0) {
        const lastDate = cohortSchedules[cohortSchedules.length - 1].examDate;
        gs.endDate = lastDate;
      }
    }
  });

  if (anyError) {
    return res.status(400).json({ error: anyError });
  }

  // Calculate overall exam endDate if not set manually
  if (!exam.endDate) {
    const endDates = exam.gradeSections.filter(gs => gs.endDate).map(gs => gs.endDate);
    if (endDates.length > 0) {
      endDates.sort();
      exam.endDate = endDates[endDates.length - 1];
    }
  }

  exam.status = 'Published';
  db.examTimetables.push(...newSchedules);
  writeDb(db);

  res.status(201).json({
    message: 'Schedule generated successfully.',
    schedules: newSchedules,
    exam
  });
};

export const publishExam = (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const examIndex = db.exams.findIndex(e => e.id === id);

  if (examIndex === -1) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  db.exams[examIndex].status = 'Published';
  writeDb(db);

  res.json({ message: 'Exam published successfully.', exam: db.exams[examIndex] });
};

export const getGradesSections = (req, res) => {
  const db = readDb();
  const gradeSet = new Set();
  const sectionSet = new Set();
  const pairs = new Set();

  // From subjects
  (db.subjects || []).forEach(s => {
    if (s.grade) {
      gradeSet.add(s.grade);
      pairs.add(`${s.grade}-A`); // Ensure at least Section A is available for any grade with subjects
    }
  });

  // From students
  (db.students || []).forEach(s => {
    if (s.studentClass) gradeSet.add(s.studentClass);
    if (s.section) sectionSet.add(s.section);
    if (s.studentClass && s.section) pairs.add(`${s.studentClass}-${s.section}`);
  });

  // From timetables
  (db.timetables || []).forEach(t => {
    if (t.cohort) {
      const [g, sec] = t.cohort.split('-');
      if (g) gradeSet.add(g);
      if (sec) sectionSet.add(sec);
      if (g && sec) pairs.add(`${g}-${sec}`);
    }
  });

  const grades = [...gradeSet].sort();
  const sections = [...sectionSet].sort();
  const gradeSectionPairs = [...pairs].sort().map(p => {
    const [g, s] = p.split('-');
    return { grade: g, section: s };
  });

  res.json({ grades, sections, gradeSectionPairs });
};

// =============================================
// 3. EXAM TIMETABLE CONTROLLER
// =============================================
export const getExamTimetables = (req, res) => {
  const db = readDb();
  res.json(db.examTimetables);
};

export const createExamTimetable = (req, res) => {
  const { examId, subject, examDate, startTime = '', endTime = '', duration = '', roomAllocation = '', invigilator = '', cohort = '', grade = '', section = '' } = req.body;

  if (!examId || !subject || !examDate) {
    return res.status(400).json({ error: 'Missing required exam timetable fields (examId, subject, examDate).' });
  }

  const db = readDb();

  // Conflict Detection: Invigilator or room busy on same day and overlapping time
  if (startTime && endTime) {
    const timeSlot = `${startTime} - ${endTime}`;
    const conflict = db.examTimetables.find(et => {
      if (et.examDate === examDate && et.startTime && et.endTime && isTimeOverlapping(`${et.startTime} - ${et.endTime}`, timeSlot)) {
        if (invigilator && et.invigilator && et.invigilator.toLowerCase() === invigilator.toLowerCase()) {
          return true;
        }
        if (roomAllocation && et.roomAllocation && et.roomAllocation.toLowerCase() === roomAllocation.toLowerCase()) {
          return true;
        }
      }
      return false;
    });

    if (conflict) {
      const foundConflict = db.examTimetables.find(et => et.examDate === examDate && et.startTime && et.endTime && isTimeOverlapping(`${et.startTime} - ${et.endTime}`, timeSlot));
      const msg = invigilator && foundConflict.invigilator && foundConflict.invigilator.toLowerCase() === invigilator.toLowerCase()
        ? `Invigilator ${invigilator} is already scheduled on ${examDate} at ${foundConflict.startTime}.`
        : `Room ${roomAllocation} is already allocated on ${examDate} at ${foundConflict.startTime}.`;
      return res.status(400).json({ error: `Conflict Detected: ${msg}` });
    }
  }

  const newSchedule = {
    id: `EXMT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    examId,
    subject,
    examDate,
    startTime,
    endTime,
    duration: duration || '3 Hours',
    roomAllocation,
    invigilator,
    cohort: cohort || (grade && section ? `${grade}-${section}` : ''),
    grade,
    section
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

// =============================================
// 8. TIMESLOTS CONTROLLER
// =============================================
export const getTimeslots = (req, res) => {
  const db = readDb();
  res.json(db.timeslots || [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM'
  ]);
};

export const createTimeslot = (req, res) => {
  const { timeslot } = req.body;
  if (!timeslot) {
    return res.status(400).json({ error: 'Timeslot value is required.' });
  }

  const db = readDb();
  if (!db.timeslots) {
    db.timeslots = [
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM'
    ];
  }

  if (db.timeslots.includes(timeslot)) {
    return res.status(400).json({ error: 'Timeslot already exists.' });
  }

  db.timeslots.push(timeslot);
  writeDb(db);
  res.status(201).json(timeslot);
};

export const deleteTimeslot = (req, res) => {
  const { timeslot } = req.body;
  if (!timeslot) {
    return res.status(400).json({ error: 'Timeslot value is required.' });
  }

  const db = readDb();
  if (!db.timeslots) {
    db.timeslots = [
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM'
    ];
  }

  db.timeslots = db.timeslots.filter(t => t !== timeslot);
  writeDb(db);
  res.json({ message: 'Timeslot successfully deleted.' });
};

// =============================================
// 9. SUBJECTS CONTROLLER
// =============================================
export const getSubjects = (req, res) => {
  const db = readDb();
  res.json(db.subjects || []);
};

export const createSubject = (req, res) => {
  const { grade, subjectName } = req.body;
  if (!grade || !subjectName) {
    return res.status(400).json({ error: 'Grade level and Subject Name are required.' });
  }

  const db = readDb();
  if (!db.subjects) db.subjects = [];

  const exists = db.subjects.some(
    s => s.grade.toUpperCase() === grade.toUpperCase() && s.subjectName.toLowerCase() === subjectName.toLowerCase()
  );
  if (exists) {
    return res.status(400).json({ error: 'Subject already registered for this grade.' });
  }

  const newSubject = {
    id: `SUB-${Date.now()}`,
    grade,
    subjectName
  };

  db.subjects.push(newSubject);
  writeDb(db);
  res.status(201).json(newSubject);
};

export const deleteSubject = (req, res) => {
  const { id } = req.params;
  const db = readDb();
  if (!db.subjects) db.subjects = [];

  const initialCount = db.subjects.length;
  db.subjects = db.subjects.filter(s => s.id !== id);

  if (db.subjects.length === initialCount) {
    return res.status(404).json({ error: 'Subject not found.' });
  }

  writeDb(db);
  res.json({ message: 'Subject successfully deleted.' });
};

export const createSubjectBulk = (req, res) => {
  const { grade, subjectNames } = req.body;
  if (!grade || !Array.isArray(subjectNames)) {
    return res.status(400).json({ error: 'Grade level and subjectNames list are required.' });
  }

  const db = readDb();
  if (!db.subjects) db.subjects = [];

  const added = [];
  const duplicates = [];

  subjectNames.forEach((name, index) => {
    const cleanName = (name || '').trim();
    if (!cleanName) return;

    const exists = db.subjects.some(
      s => s.grade.toUpperCase() === grade.toUpperCase() && s.subjectName.toLowerCase() === cleanName.toLowerCase()
    );
    if (!exists) {
      const newSub = {
        id: `SUB-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        grade,
        subjectName: cleanName
      };
      db.subjects.push(newSub);
      added.push(newSub);
    } else {
      duplicates.push(cleanName);
    }
  });

  writeDb(db);
  res.status(201).json({ message: 'Subjects processed.', added, duplicates });
};

// =============================================
// 10. BULK TIMETABLE SAVE CONTROLLER
// =============================================
export const createTimetableBulk = (req, res) => {
  const { cohort, timetables, session = '2026-2027' } = req.body;
  if (!cohort || !Array.isArray(timetables)) {
    return res.status(400).json({ error: 'Cohort and timetables list are required.' });
  }

  const db = readDb();
  if (!db.timetables) db.timetables = [];

  // Remove existing entries for this cohort
  db.timetables = db.timetables.filter(t => t.cohort !== cohort);

  // Push new valid timetable entries
  timetables.forEach((slot, index) => {
    if (slot.subject && slot.subject.trim() !== '') {
      db.timetables.push({
        id: `TT-${Date.now()}-${index}`,
        cohort,
        day: slot.day,
        time: slot.time,
        subject: slot.subject,
        teacher: slot.teacher || '',
        room: slot.room || '',
        session
      });
    }
  });

  writeDb(db);
  res.status(201).json({ message: 'Timetable updated successfully.' });
};

export const createTimetableBulkTeacher = (req, res) => {
  const { teacher, timetables, session = '2026-2027' } = req.body;
  if (!teacher || !Array.isArray(timetables)) {
    return res.status(400).json({ error: 'Teacher and timetables list are required.' });
  }

  const db = readDb();
  if (!db.teacherTimetables) db.teacherTimetables = [];

  // Remove existing entries for this teacher from teacherTimetables
  db.teacherTimetables = db.teacherTimetables.filter(t => !t.teacher || t.teacher.toLowerCase() !== teacher.toLowerCase());

  // Push new valid timetable entries
  timetables.forEach((slot, index) => {
    if (slot.cohort && slot.cohort.trim() !== '') {
      db.teacherTimetables.push({
        id: `TT-TEACHER-${Date.now()}-${index}`,
        cohort: slot.cohort,
        day: slot.day,
        time: slot.time,
        subject: slot.subject || '',
        teacher: teacher,
        room: '',
        session
      });
    }
  });

  writeDb(db);
  res.status(201).json({ message: 'Teacher timetable updated successfully.' });
};

export const getTeacherTimetables = (req, res) => {
  const db = readDb();
  res.json(db.teacherTimetables || []);
};

export const createExamTimetableBulk = (req, res) => {
  const { examId, cohort, schedules } = req.body;
  if (!examId || !cohort || !Array.isArray(schedules)) {
    return res.status(400).json({ error: 'Missing required bulk exam timetable fields (examId, cohort, schedules).' });
  }

  const db = readDb();
  if (!db.examTimetables) db.examTimetables = [];

  // Remove existing entries for this exam and cohort
  db.examTimetables = db.examTimetables.filter(et => !(et.examId === examId && et.cohort === cohort));

  const [grade, section] = cohort.split('-');

  schedules.forEach((slot, index) => {
    if (slot.subject && slot.examDate) {
      db.examTimetables.push({
        id: `EXMT-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        examId,
        subject: slot.subject,
        examDate: slot.examDate,
        startTime: slot.startTime || '',
        endTime: slot.endTime || '',
        duration: slot.duration || '3 Hours',
        roomAllocation: slot.roomAllocation || '',
        invigilator: slot.invigilator || '',
        cohort,
        grade: grade || '',
        section: section || ''
      });
    }
  });

  writeDb(db);
  res.status(201).json({ message: 'Exam timetable updated successfully.' });
};


