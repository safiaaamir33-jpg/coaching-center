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
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Teacher } from '../types';

const COLLECTION_NAME = 'teachers';

export const INITIAL_TEACHERS: Omit<Teacher, 'id'>[] = [
  {
    name: 'Prof. Muhammad Naveed',
    qualification: 'M.Phil Physics (Gold Medalist, IUB)',
    experience: '14+ Years in Board Exam Mentorship',
    subjects: ['Physics', 'Applied Science'],
    classes: ['Class 9', 'Class 10', 'F.Sc Part-1', 'F.Sc Part-2'],
    salaryMonthly: 60000,
    phone: '+92 300 9876543',
    email: 'naveed.physics@brightfuture.pk',
    bio: 'Renowned physics lecturer in Sadiqabad with an outstanding track record of producing top position holders in BISE Bahawalpur. Specializes in conceptual clarity and board-style numerical derivation.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    isPublished: true,
    status: 'active',
    joiningDate: '2020-03-01'
  },
  {
    name: 'Dr. Shahzad Ahmad (MBBS, RMC)',
    qualification: 'MBBS, Clinical Faculty & Senior Biology Specialist',
    experience: '10+ Years in MDCAT & F.Sc Coaching',
    subjects: ['Biology', 'Genetics', 'Human Anatomy'],
    classes: ['F.Sc Pre-Medical (Part 1 & 2)', 'MDCAT Crash Course'],
    salaryMonthly: 70000,
    phone: '+92 301 2345678',
    email: 'dr.shahzad@brightfuture.pk',
    bio: 'Medical doctor turned passionate educator. Trains intermediate students for maximum board exam scores and national medical entrance tests with diagrammatic mnemonics.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    isPublished: true,
    status: 'active',
    joiningDate: '2021-08-15'
  },
  {
    name: 'Sir Waqas Ali',
    qualification: 'M.Sc Mathematics (Quaid-e-Azam University)',
    experience: '9+ Years in Higher Secondary Mathematics',
    subjects: ['Mathematics', 'Calculus & Vectors'],
    classes: ['Class 9', 'Class 10', 'F.Sc Pre-Engineering', 'ICS'],
    salaryMonthly: 55000,
    phone: '+92 302 3456789',
    email: 'waqas.math@brightfuture.pk',
    bio: 'Expert in simplifying complex algebraic theorems, calculus, and coordinate geometry. Known for his step-by-step methodology and individual student doubt sessions.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    isPublished: true,
    status: 'active',
    joiningDate: '2021-01-10'
  },
  {
    name: 'Prof. Tariq Mahmood',
    qualification: 'M.Sc Organic Chemistry (Punjab University)',
    experience: '12+ Years Teaching Experience',
    subjects: ['Chemistry', 'Organic & Inorganic Chemistry'],
    classes: ['Class 9', 'Class 10', 'F.Sc Pre-Medical & Pre-Engg'],
    salaryMonthly: 58000,
    phone: '+92 303 4567890',
    email: 'tariq.chem@brightfuture.pk',
    bio: 'Dedicated chemistry educator transforming reactions, chemical formulas, and equations into intuitive logical concepts through practical real-life examples.',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80',
    isPublished: true,
    status: 'active',
    joiningDate: '2020-09-01'
  },
  {
    name: 'Sir Hamza Tariq',
    qualification: 'MS Computer Science (FAST-NUCES)',
    experience: '7+ Years in Programming & Computer Pedagogy',
    subjects: ['Computer Science', 'C/C++ Programming', 'Information Tech'],
    classes: ['Class 9 & 10 (CS)', 'ICS Part 1 & 2'],
    salaryMonthly: 50000,
    phone: '+92 304 5678901',
    email: 'hamza.cs@brightfuture.pk',
    bio: 'Empowers students with hands-on computer science skills, coding logic, and board exam presentation techniques. Guides students towards modern IT careers.',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80',
    isPublished: true,
    status: 'active',
    joiningDate: '2022-04-15'
  }
];

export async function getPublishedTeachers(): Promise<Omit<Teacher, 'salaryMonthly' | 'phone' | 'email'>[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    const list: Omit<Teacher, 'salaryMonthly' | 'phone' | 'email'>[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Teacher;
      // Strip confidential staff information from public view
      list.push({
        id: doc.id,
        name: data.name,
        qualification: data.qualification,
        experience: data.experience,
        subjects: data.subjects || [],
        classes: data.classes || [],
        bio: data.bio,
        photoUrl: data.photoUrl,
        isPublished: true,
        status: data.status,
      });
    });

    if (list.length === 0) {
      return INITIAL_TEACHERS.map((t, i) => ({
        id: `init-t-${i}`,
        name: t.name,
        qualification: t.qualification,
        experience: t.experience,
        subjects: t.subjects,
        classes: t.classes,
        bio: t.bio,
        photoUrl: t.photoUrl,
        isPublished: true,
        status: t.status,
      }));
    }
    return list;
  } catch (error) {
    console.warn('Error fetching public teachers, falling back to initial data:', error);
    return INITIAL_TEACHERS.map((t, i) => ({
      id: `init-t-${i}`,
      name: t.name,
      qualification: t.qualification,
      experience: t.experience,
      subjects: t.subjects,
      classes: t.classes,
      bio: t.bio,
      photoUrl: t.photoUrl,
      isPublished: true,
      status: t.status,
    }));
  }
}

const DELETED_TEACHERS_KEY = 'bfa_deleted_teachers';
const CUSTOM_TEACHERS_KEY = 'bfa_custom_teachers';

function getDeletedTeacherIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_TEACHERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalCustomTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEACHERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomTeachers(teachers: Teacher[]) {
  try {
    localStorage.setItem(CUSTOM_TEACHERS_KEY, JSON.stringify(teachers));
  } catch {
    // ignore
  }
}

export async function getAllTeachersAdmin(): Promise<Teacher[]> {
  const deletedIds = getDeletedTeacherIds();
  const localList = getLocalCustomTeachers().filter((t) => {
    if (!t.id) return false;
    const norm = t.name?.trim().toLowerCase();
    return !deletedIds.includes(t.id) && !deletedIds.includes(norm);
  });

  let dbList: Teacher[] = [];
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as Teacher;
      const norm = data.name?.trim().toLowerCase();
      if (!deletedIds.includes(doc.id) && !deletedIds.includes(norm)) {
        dbList.push(data);
      }
    });
  } catch (error) {
    console.warn('Error fetching all teachers from DB:', error);
  }

  const map = new Map<string, Teacher>();
  INITIAL_TEACHERS.forEach((t, i) => {
    const id = `init-t-${i}`;
    const norm = t.name.trim().toLowerCase();
    if (!deletedIds.includes(id) && !deletedIds.includes(norm)) {
      map.set(norm, { id, ...t });
    }
  });

  dbList.forEach((t) => {
    const norm = t.name?.trim().toLowerCase() || t.id || '';
    if (!deletedIds.includes(t.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, t);
    }
  });

  localList.forEach((t) => {
    const norm = t.name?.trim().toLowerCase() || t.id || '';
    if (!deletedIds.includes(t.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, t);
      if (t.id && !dbList.some((d) => d.id === t.id || d.name.trim().toLowerCase() === t.name.trim().toLowerCase())) {
        setDoc(doc(db, COLLECTION_NAME, t.id), t).catch(() => {});
      }
    }
  });

  return Array.from(map.values());
}

export async function addTeacher(teacher: Omit<Teacher, 'id'>): Promise<string> {
  const localId = `teacher-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const fullItem: Teacher = {
    ...teacher,
    id: localId,
    createdAt: new Date().toISOString(),
  };

  const current = getLocalCustomTeachers();
  saveLocalCustomTeachers([fullItem, ...current]);

  try {
    const docRef = doc(db, COLLECTION_NAME, localId);
    await setDoc(docRef, fullItem);
    return localId;
  } catch (error) {
    console.warn('Firestore addTeacher fallback:', error);
    return localId;
  }
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<void> {
  const current = getLocalCustomTeachers();
  const updated = current.map((t) => (t.id === id ? { ...t, ...updates } : t));
  saveLocalCustomTeachers(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.warn('Firestore updateTeacher fallback:', error);
  }
}

export async function deleteTeacher(id: string): Promise<void> {
  try {
    const deleted = getDeletedTeacherIds();
    const toDelete = new Set<string>([id, id.trim().toLowerCase()]);

    const local = getLocalCustomTeachers();
    const foundLocal = local.find((t) => t.id === id || t.name?.trim().toLowerCase() === id.trim().toLowerCase());
    if (foundLocal?.id) toDelete.add(foundLocal.id);
    if (foundLocal?.name) toDelete.add(foundLocal.name.trim().toLowerCase());

    INITIAL_TEACHERS.forEach((t, i) => {
      if (`init-t-${i}` === id || t.name.trim().toLowerCase() === id.trim().toLowerCase()) {
        toDelete.add(`init-t-${i}`);
        toDelete.add(t.name.trim().toLowerCase());
      }
    });

    const updated = Array.from(new Set([...deleted, ...toDelete]));
    localStorage.setItem(DELETED_TEACHERS_KEY, JSON.stringify(updated));

    const current = local.filter((t) => !toDelete.has(t.id || '') && (!t.name || !toDelete.has(t.name.trim().toLowerCase())));
    saveLocalCustomTeachers(current);

    if (!id.startsWith('init-t-')) {
      const docRef = doc(db, COLLECTION_NAME, id);
      deleteDoc(docRef).catch(() => {});
    }
  } catch (error) {
    console.warn('Firestore deleteTeacher fallback:', error);
  }
}
