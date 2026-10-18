import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Exam, Result } from '../types';

const EXAMS_COLLECTION = 'exams';
const RESULTS_COLLECTION = 'results';

export function calculateGradeAndPercentage(marksObtained: number, totalMarks: number): { percentage: number; grade: string } {
  if (totalMarks <= 0) return { percentage: 0, grade: 'F' };
  const percentage = Math.round((marksObtained / totalMarks) * 100 * 10) / 10;
  let grade = 'F';
  if (percentage >= 80) grade = 'A+';
  else if (percentage >= 70) grade = 'A';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 50) grade = 'C';
  else if (percentage >= 40) grade = 'D';
  else grade = 'F';

  return { percentage, grade };
}

export const DEFAULT_EXAMS: Exam[] = [
  {
    id: 'exam-2026-sept-monthly',
    title: 'September Diagnostic Board Assessment 2026',
    examType: 'monthly_test',
    classGrade: 'Class 9',
    subject: 'All Science Subjects',
    date: '2026-09-25',
    totalMarks: 100,
    passingMarks: 40,
    isPublished: true,
  },
  {
    id: 'exam-2026-midterm',
    title: 'Mid-Term Comprehensive Exam 2026',
    examType: 'midterm',
    classGrade: 'Class 10',
    subject: 'Physics & Chemistry',
    date: '2026-10-10',
    totalMarks: 75,
    passingMarks: 30,
    isPublished: true,
  },
  {
    id: 'exam-2026-fsc-mock',
    title: 'Pre-Board Mock Assessment (F.Sc Part 1)',
    examType: 'mock_exam',
    classGrade: 'Class 11 (F.Sc Pre-Medical)',
    subject: 'Biology & Chemistry',
    date: '2026-10-15',
    totalMarks: 85,
    passingMarks: 33,
    isPublished: true,
  }
];

export const INITIAL_SAMPLE_RESULTS: Result[] = [
  {
    id: 'exam-2026-sept-monthly_BFA-2026-001',
    examId: 'exam-2026-sept-monthly',
    examTitle: 'September Diagnostic Board Assessment 2026',
    studentId: 'BFA-2026-001',
    studentName: 'Muhammad Hamza',
    fatherName: 'Tariq Mehmood',
    classGrade: 'Class 9',
    marksObtained: 92,
    totalMarks: 100,
    percentage: 92,
    grade: 'A+',
    remarks: 'Excellent concept clarity and top board presentation skills.',
    isPublished: true,
  },
  {
    id: 'exam-2026-sept-monthly_BFA-2026-002',
    examId: 'exam-2026-sept-monthly',
    examTitle: 'September Diagnostic Board Assessment 2026',
    studentId: 'BFA-2026-002',
    studentName: 'Fatima Zahra',
    fatherName: 'Haji Abdul Rasheed',
    classGrade: 'Class 9',
    marksObtained: 88,
    totalMarks: 100,
    percentage: 88,
    grade: 'A+',
    remarks: 'Outstanding performance in biology and chemistry diagrams.',
    isPublished: true,
  },
  {
    id: 'exam-2026-midterm_BFA-2026-003',
    examId: 'exam-2026-midterm',
    examTitle: 'Mid-Term Comprehensive Exam 2026',
    studentId: 'BFA-2026-003',
    studentName: 'Ali Raza',
    fatherName: 'Muhammad Aslam',
    classGrade: 'Class 10',
    marksObtained: 68,
    totalMarks: 75,
    percentage: 90.7,
    grade: 'A+',
    remarks: 'Great improvement in physics numerical questions.',
    isPublished: true,
  }
];

const DELETED_EXAMS_KEY = 'bfa_deleted_exams';
const CUSTOM_EXAMS_KEY = 'bfa_custom_exams';

function getDeletedExamIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_EXAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalCustomExams(): Exam[] {
  try {
    const raw = localStorage.getItem(CUSTOM_EXAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomExams(exams: Exam[]) {
  try {
    localStorage.setItem(CUSTOM_EXAMS_KEY, JSON.stringify(exams));
  } catch {
    // ignore
  }
}

export async function getAllExams(): Promise<Exam[]> {
  const deletedIds = getDeletedExamIds();
  const localList = getLocalCustomExams().filter((e) => {
    if (!e.id) return false;
    const norm = e.title?.trim().toLowerCase();
    return !deletedIds.includes(e.id) && !deletedIds.includes(norm);
  });

  let dbList: Exam[] = [];
  try {
    const q = query(collection(db, EXAMS_COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as Exam;
      const norm = data.title?.trim().toLowerCase();
      if (!deletedIds.includes(doc.id) && !deletedIds.includes(norm)) {
        dbList.push(data);
      }
    });
  } catch (error) {
    console.warn('Firestore exams fetch error, reading local and defaults:', error);
  }

  const map = new Map<string, Exam>();
  DEFAULT_EXAMS.forEach((def) => {
    const norm = def.title.trim().toLowerCase();
    if (def.id && !deletedIds.includes(def.id) && !deletedIds.includes(norm)) {
      map.set(norm, { ...def });
    }
  });

  dbList.forEach((e) => {
    const norm = e.title?.trim().toLowerCase() || e.id || '';
    if (!deletedIds.includes(e.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, e);
    }
  });

  localList.forEach((e) => {
    const norm = e.title?.trim().toLowerCase() || e.id || '';
    if (!deletedIds.includes(e.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, e);
    }
  });

  return Array.from(map.values());
}

export async function createExam(exam: Omit<Exam, 'id' | 'createdAt'>): Promise<string> {
  const localId = `exam-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const fullItem: Exam = {
    ...exam,
    id: localId,
    createdAt: new Date().toISOString(),
  };

  const current = getLocalCustomExams();
  saveLocalCustomExams([fullItem, ...current]);

  try {
    const docRef = await addDoc(collection(db, EXAMS_COLLECTION), {
      ...exam,
      createdAt: new Date().toISOString(),
    });
    if (docRef.id) {
      const updated = getLocalCustomExams().map((e) => (e.id === localId ? { ...e, id: docRef.id } : e));
      saveLocalCustomExams(updated);
      return docRef.id;
    }
    return localId;
  } catch (error) {
    console.warn('Firestore addExam fallback:', error);
    return localId;
  }
}

export async function updateExam(id: string, updates: Partial<Exam>): Promise<void> {
  const current = getLocalCustomExams();
  const updated = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
  saveLocalCustomExams(updated);

  try {
    const docRef = doc(db, EXAMS_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.warn('Firestore updateExam fallback:', error);
  }
}

export async function deleteExam(id: string): Promise<void> {
  try {
    const all = await getAllExams().catch(() => []);
    const found = all.find((e) => e.id === id);
    const toDelete = new Set<string>([id]);
    if (found?.title) toDelete.add(found.title.trim().toLowerCase());

    const deleted = getDeletedExamIds();
    const updated = Array.from(new Set([...deleted, ...toDelete]));
    localStorage.setItem(DELETED_EXAMS_KEY, JSON.stringify(updated));

    const current = getLocalCustomExams().filter((e) => !toDelete.has(e.id || '') && (!e.title || !toDelete.has(e.title.trim().toLowerCase())));
    saveLocalCustomExams(current);

    if (!id.startsWith('exam-2026-')) {
      const docRef = doc(db, EXAMS_COLLECTION, id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.warn('Firestore deleteExam fallback:', error);
  }
}

export async function saveStudentResult(result: Omit<Result, 'id' | 'createdAt' | 'percentage' | 'grade'>): Promise<string> {
  try {
    const { percentage, grade } = calculateGradeAndPercentage(result.marksObtained, result.totalMarks);
    const resultDocId = `${result.examId}_${result.studentId}`;
    const docRef = doc(db, RESULTS_COLLECTION, resultDocId);

    const fullResult: Result = {
      ...result,
      percentage,
      grade,
      createdAt: new Date().toISOString(),
    };

    await setDoc(docRef, fullResult);
    return resultDocId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, RESULTS_COLLECTION);
  }
}

export async function getResultsByExam(examId: string): Promise<Result[]> {
  try {
    const q = query(collection(db, RESULTS_COLLECTION), where('examId', '==', examId));
    const snapshot = await getDocs(q);
    const list: Result[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Result);
    });

    const existingStudentIds = new Set(list.map((r) => r.studentId));
    for (const sample of INITIAL_SAMPLE_RESULTS) {
      if (sample.examId === examId && !existingStudentIds.has(sample.studentId)) {
        list.push(sample);
      }
    }

    return list.sort((a, b) => b.marksObtained - a.marksObtained);
  } catch (error) {
    console.warn('Firestore getResultsByExam error, fallback to samples:', error);
    return INITIAL_SAMPLE_RESULTS.filter((r) => r.examId === examId);
  }
}

// Secure single student result lookup for public portal (Roll No/Student ID + Exam ID)
export async function lookupStudentResult(studentId: string, examId: string): Promise<Result | null> {
  const cleanStudentId = studentId.trim().toUpperCase();
  const resultDocId = `${examId}_${cleanStudentId}`;

  try {
    const docRef = doc(db, RESULTS_COLLECTION, resultDocId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Result;
    }
  } catch (err) {
    console.warn('Firestore lookup attempted, checking sample results:', err);
  }

  // Check initial sample results for instant verification
  const found = INITIAL_SAMPLE_RESULTS.find(
    (r) => r.studentId.toUpperCase() === cleanStudentId && (!examId || r.examId === examId)
  );
  if (found) {
    return found;
  }

  return null;
}
