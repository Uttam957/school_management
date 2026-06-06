const GRADE_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function getGradesWithSubjects(subjects) {
  if (!subjects || !Array.isArray(subjects)) return [];
  const gradesWithSubjects = [...new Set(subjects.map(s => s.grade).filter(Boolean))];
  return gradesWithSubjects.sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b));
}

export function getGradeOptions(subjects) {
  return getGradesWithSubjects(subjects).map(g => ({ value: g, label: `Grade ${g}` }));
}

export { GRADE_ORDER };
