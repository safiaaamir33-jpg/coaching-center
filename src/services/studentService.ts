import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Student } from '../types';

const COLLECTION_NAME = 'students';
const CUSTOM_STUDENTS_KEY = 'bfa_custom_students';
const DELETED_STUDENTS_KEY = 'bfa_deleted_students';

export const INITIAL_STUDENTS: (Omit<Student, 'id'> & { id: string })[] = [
  {
    id: 'BFA-2026-001',
    studentId: 'BFA-2026-001',
    fullName: 'Muhammad Hamza',
    fatherName: 'Tariq Mehmood',
    dob: '2009-04-12',
    gender: 'male',
    phone: '0302-7654321',
    guardianPhone: '0300-9876543',
    address: 'Near Madina Masjid, Model Town, Sadiqabad',
    currentClass: 'Class 9',
    enrolledCourses: ['Class 9 (Matric Science)'],
    status: 'active',
    monthlyFee: 3500,
    discount: 500,
    totalPaid: 1500,
    balance: 1500,
    enrollmentDate: '2026-01-10',
    notes: 'Matric Science batch student. Sibling discount applied.',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'BFA-2026-002',
    studentId: 'BFA-2026-002',
    fullName: 'Fatima Zahra',
    fatherName: 'Haji Abdul Rasheed',
    dob: '2009-08-22',
    gender: 'female',
    phone: '0301-4455667',
    guardianPhone: '0301-4455667',
    address: 'Gulshan-e-Iqbal, Kacha Sadiqabad Road, Sadiqabad',
    currentClass: 'Class 9',
    enrolledCourses: ['Class 9 (Matric Science)'],
    status: 'active',
    monthlyFee: 3500,
    discount: 0,
    totalPaid: 3500,
    balance: 0,
    enrollmentDate: '2026-01-12',
    notes: 'Full fee paid. Top performer in biology test.',
    createdAt: '2026-01-12T08:00:00.000Z'
  },
  {
    id: 'BFA-2026-003',
    studentId: 'BFA-2026-003',
    fullName: 'Ali Raza',
    fatherName: 'Ghulam Muhammad',
    dob: '2009-11-05',
    gender: 'male',
    phone: '0305-1122334',
    guardianPhone: '0305-9988776',
    address: 'Railway Road, Ward No. 4, Sadiqabad',
    currentClass: 'Class 9',
    enrolledCourses: ['Class 9 (Matric Science)'],
    status: 'active',
    monthlyFee: 3500,
    discount: 0,
    totalPaid: 1000,
    balance: 2500,
    enrollmentDate: '2026-01-15',
    notes: 'Pending tuition balance PKR 2,500.',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'BFA-2026-004',
    studentId: 'BFA-2026-004',
    fullName: 'Bilal Ahmed',
    fatherName: 'Muhammad Akram',
    dob: '2008-06-18',
    gender: 'male',
    phone: '0300-3344556',
    guardianPhone: '0300-1122998',
    address: 'Allama Iqbal Town, Sadiqabad',
    currentClass: 'Class 10',
    enrolledCourses: ['Class 10 (Matric Science)'],
    status: 'active',
    monthlyFee: 3800,
    discount: 0,
    totalPaid: 3800,
    balance: 0,
    enrollmentDate: '2026-01-10',
    notes: 'Board exam revision series enrolled.',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'BFA-2026-005',
    studentId: 'BFA-2026-005',
    fullName: 'Zainab Bibi',
    fatherName: 'Shahid Nadeem',
    dob: '2008-03-30',
    gender: 'female',
    phone: '0306-7788990',
    guardianPhone: '0306-7788990',
    address: 'Main Bazar, Sadiqabad',
    currentClass: 'Class 10',
    enrolledCourses: ['Class 10 (Matric Science)'],
    status: 'active',
    monthlyFee: 3800,
    discount: 300,
    totalPaid: 1500,
    balance: 2000,
    enrollmentDate: '2026-01-14',
    notes: 'Pending fee balance PKR 2,000.',
    createdAt: '2026-01-14T08:00:00.000Z'
  },
  {
    id: 'BFA-2026-006',
    studentId: 'BFA-2026-006',
    fullName: 'Usama Tariq',
    fatherName: 'Tariq Javed',
    dob: '2007-09-14',
    gender: 'male',
    phone: '0308-2233445',
    guardianPhone: '0308-2233445',
    address: 'Officers Colony, Sadiqabad',
    currentClass: 'Class 11 (F.Sc Pre-Medical)',
    enrolledCourses: ['Class 11 (F.Sc Pre-Medical)'],
    status: 'active',
    monthlyFee: 4500,
    discount: 0,
    totalPaid: 1500,
    balance: 3000,
    enrollmentDate: '2026-01-08',
    notes: 'F.Sc Medical batch. Outstanding balance PKR 3,000.',
    createdAt: '2026-01-08T08:00:00.000Z'
  }
];

function getDeletedStudentIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_STUDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalStudents(): Student[] {
  try {
    const raw = localStorage.getItem(CUSTOM_STUDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalStudents(students: Student[]) {
  try {
    localStorage.setItem(CUSTOM_STUDENTS_KEY, JSON.stringify(students));
  } catch {
    // ignore
  }
}

export async function generateNextStudentId(): Promise<string> {
  const all = await getAllStudents().catch(() => INITIAL_STUDENTS);
  const year = new Date().getFullYear();
  const count = all.length + 1;
  const padded = String(count).padStart(3, '0');
  return `BFA-${year}-${padded}`;
}

export async function getAllStudents(): Promise<Student[]> {
  const deletedIds = getDeletedStudentIds();
  const localList = getLocalStudents().filter(
    (s) => !deletedIds.includes(s.studentId) && (!s.id || !deletedIds.includes(s.id))
  );

  let dbList: Student[] = [];
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as Student;
      if (!deletedIds.includes(data.studentId) && !deletedIds.includes(doc.id)) {
        dbList.push(data);
      }
    });
  } catch (error) {
    console.warn('Firestore students fetch skipped or offline, reading local and presets:', error);
  }

  const map = new Map<string, Student>();
  // 1. Initial presets
  for (const init of INITIAL_STUDENTS) {
    if (!deletedIds.includes(init.studentId) && !deletedIds.includes(init.id)) {
      map.set(init.studentId, { ...init });
    }
  }
  // 2. DB records
  for (const item of dbList) {
    if (!deletedIds.includes(item.studentId) && (!item.id || !deletedIds.includes(item.id))) {
      map.set(item.studentId, item);
    }
  }
  // 3. Local custom records
  for (const item of localList) {
    if (!deletedIds.includes(item.studentId) && (!item.id || !deletedIds.includes(item.id))) {
      map.set(item.studentId, item);
    }
  }

  return Array.from(map.values());
}

export async function getStudentById(id: string): Promise<Student | null> {
  const all = await getAllStudents();
  return all.find((s) => s.studentId === id || s.id === id) || null;
}

export async function createStudent(studentData: Omit<Student, 'id'>): Promise<string> {
  const studentId = studentData.studentId || (await generateNextStudentId());
  const balance = Math.max(0, (studentData.monthlyFee || 0) - (studentData.discount || 0) - (studentData.totalPaid || 0));

  const newStudent: Student = {
    ...studentData,
    id: studentId,
    studentId,
    balance,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save locally
  const current = getLocalStudents().filter((s) => s.studentId !== studentId);
  saveLocalStudents([newStudent, ...current]);

  // 2. Try Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    const cleanStudent = Object.fromEntries(
      Object.entries(newStudent).filter(([_, v]) => v !== undefined)
    );
    await setDoc(docRef, cleanStudent);
  } catch (error) {
    console.warn('Firestore student write skipped or offline, saved locally:', error);
  }

  return studentId;
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<void> {
  const current = getLocalStudents();
  const existing = current.find((s) => s.studentId === id || s.id === id);

  const monthlyFee = updates.monthlyFee ?? existing?.monthlyFee ?? 0;
  const discount = updates.discount ?? existing?.discount ?? 0;
  const totalPaid = updates.totalPaid ?? existing?.totalPaid ?? 0;
  const balance = Math.max(0, monthlyFee - discount - totalPaid);

  const updatedItem: Student = {
    ...(existing || { studentId: id, fullName: '', fatherName: '', gender: 'male' as const, phone: '', guardianPhone: '', address: '', currentClass: '', enrolledCourses: [], status: 'active' as const, monthlyFee: 0, discount: 0, totalPaid: 0, balance: 0, enrollmentDate: '' }),
    ...updates,
    studentId: id,
    balance,
    updatedAt: new Date().toISOString(),
  };

  const nextList = current.filter((s) => s.studentId !== id && s.id !== id);
  nextList.push(updatedItem);
  saveLocalStudents(nextList);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, updatedItem, { merge: true });
  } catch (error) {
    console.warn('Firestore student update skipped, saved locally:', error);
  }
}

export async function deleteStudent(studentIdOrId: string): Promise<void> {
  try {
    const deleted = getDeletedStudentIds();
    const toDelete = new Set<string>([studentIdOrId]);

    const local = getLocalStudents();
    const foundLocal = local.find((s) => s.studentId === studentIdOrId || s.id === studentIdOrId);
    if (foundLocal?.studentId) toDelete.add(foundLocal.studentId);
    if (foundLocal?.id) toDelete.add(foundLocal.id);

    INITIAL_STUDENTS.forEach((s) => {
      if (s.studentId === studentIdOrId || s.id === studentIdOrId) {
        toDelete.add(s.studentId);
        if (s.id) toDelete.add(s.id);
      }
    });

    const updatedDeleted = Array.from(new Set([...deleted, ...toDelete]));
    localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify(updatedDeleted));

    const current = local.filter((s) => !toDelete.has(s.studentId) && (!s.id || !toDelete.has(s.id)));
    saveLocalStudents(current);

    for (const dId of toDelete) {
      try {
        const docRef = doc(db, COLLECTION_NAME, dId);
        deleteDoc(docRef).catch(() => {});
      } catch (err) {
        // quiet fallback
      }
    }
  } catch (error) {
    console.warn('Firestore student delete fallback:', error);
  }
}
