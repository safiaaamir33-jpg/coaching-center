import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Course } from '../types';

const COLLECTION_NAME = 'courses';

export const INITIAL_COURSES: Omit<Course, 'id'>[] = [
  {
    name: 'Class 9th (Matric Science Group)',
    classGrade: 'Class 9',
    subject: 'Physics, Chemistry, Biology/Computer, Mathematics, English',
    description: 'Comprehensive Board Exam coaching for 9th class students following BISE Bahawalpur syllabus with weekly tests and numericals mastery.',
    schedule: 'Monday – Friday (3:30 PM – 6:30 PM)',
    duration: 'Full Session (9 Months)',
    feeMonthly: 3500,
    feeAdmission: 1000,
    teacherName: 'Sir Tariq & Sir Waqas',
    seatsAvailable: 35,
    isPublished: true,
    featured: true,
    posterUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Class 10th (Matric Science Board Prep)',
    classGrade: 'Class 10',
    subject: 'Physics, Chemistry, Biology/Computer, Mathematics, English, Pak Studies',
    description: 'Intensive board preparation for matriculation, focusing on past papers, conceptual derivations, and high percentage score techniques.',
    schedule: 'Monday – Friday (4:00 PM – 7:00 PM)',
    duration: 'Full Session (8 Months)',
    feeMonthly: 4000,
    feeAdmission: 1000,
    teacherName: 'Prof. Naveed & Team',
    seatsAvailable: 30,
    isPublished: true,
    featured: true,
    posterUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'F.Sc Part-1 (Pre-Medical)',
    classGrade: 'Class 11 (F.Sc)',
    subject: 'Biology, Physics, Chemistry, English',
    description: 'Concept-oriented teaching for intermediate medical aspirants, strengthening foundational concepts essential for board exams and MDCAT.',
    schedule: 'Monday – Saturday (4:30 PM – 7:45 PM)',
    duration: 'Full Academic Year',
    feeMonthly: 5500,
    feeAdmission: 1500,
    teacherName: 'Dr. Shahzad (MBBS) & Prof. Irfan',
    seatsAvailable: 25,
    isPublished: true,
    featured: true,
    posterUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'F.Sc Part-2 (Pre-Engineering & Board Exam Series)',
    classGrade: 'Class 12 (F.Sc)',
    subject: 'Mathematics, Physics, Chemistry, English, Pak Studies',
    description: 'Rigorous coaching for 2nd year engineering students with complete past papers practice, speed problem solving, and ECAT preparation.',
    schedule: 'Monday – Saturday (3:30 PM – 6:45 PM)',
    duration: 'Academic Year & Revision Phase',
    feeMonthly: 5500,
    feeAdmission: 1500,
    teacherName: 'Engr. Bilal & Prof. Naveed',
    seatsAvailable: 25,
    isPublished: true,
    featured: true,
    posterUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'ICS (Computer Science & Mathematics)',
    classGrade: 'Class 11 & 12 (ICS)',
    subject: 'Computer Science, Mathematics, Physics/Statistics',
    description: 'Practical programming in C/C++, theoretical IT foundations, and rigorous mathematics coaching for prospective IT and Software Engineering students.',
    schedule: 'Monday – Friday (5:00 PM – 7:30 PM)',
    duration: 'Full Academic Year',
    feeMonthly: 4500,
    feeAdmission: 1200,
    teacherName: 'Sir Hamza (MS CS)',
    seatsAvailable: 25,
    isPublished: true,
    featured: false,
    posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'MDCAT / ECAT Comprehensive Entry Test Program',
    classGrade: 'MDCAT / ECAT',
    subject: 'Physics, Chemistry, Biology, Mathematics, English & Logical Reasoning',
    description: 'High-yield MCQs bank, speed derivation techniques, negative marking mastery, and full-length simulated mock tests for top medical & engineering university admissions.',
    schedule: 'Monday – Saturday (8:30 AM – 1:30 PM)',
    duration: '3 Months Crash Course',
    feeMonthly: 7000,
    feeAdmission: 2000,
    teacherName: 'Dr. Shahzad (MBBS) & Prof. Irfan',
    seatsAvailable: 30,
    isPublished: true,
    featured: true,
    posterUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Junior School Tuition (Classes 1 to 8)',
    classGrade: 'Class 1–8',
    subject: 'All Core Subjects (English, Mathematics, Science, Urdu, Islamiyat)',
    description: 'Individual attention, homework assistance, reading comprehension, mental math, and foundation building for young learners in Sadiqabad.',
    schedule: 'Monday – Friday (2:30 PM – 4:30 PM)',
    duration: 'Monthly Ongoing',
    feeMonthly: 2500,
    feeAdmission: 500,
    teacherName: 'Senior Elementary Faculty',
    seatsAvailable: 40,
    isPublished: true,
    featured: false,
    posterUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Spoken English & Communication Skills',
    classGrade: 'All Age Groups',
    subject: 'English Fluency, Grammar, Vocabulary, Public Speaking',
    description: 'Interactive spoken English course designed to build confidence in conversation, presentation skills, and language accuracy.',
    schedule: 'Tuesday & Thursday (6:00 PM – 7:30 PM)',
    duration: '2 Months Certificate Course',
    feeMonthly: 3000,
    feeAdmission: 500,
    teacherName: 'Sir Rehan (MA English)',
    seatsAvailable: 20,
    isPublished: true,
    featured: true,
    posterUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1000&q=80',
  }
];

const DELETED_COURSES_KEY = 'bfa_deleted_courses';
const CUSTOM_COURSES_KEY = 'bfa_custom_courses';

function getDeletedCourseIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalCustomCourses(): Course[] {
  try {
    const raw = localStorage.getItem(CUSTOM_COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomCourses(courses: Course[]) {
  try {
    localStorage.setItem(CUSTOM_COURSES_KEY, JSON.stringify(courses));
  } catch {
    // ignore
  }
}

export async function getPublishedCourses(): Promise<Course[]> {
  const deletedIds = getDeletedCourseIds();
  const localList = getLocalCustomCourses().filter((c) => {
    if (!c.id || !c.isPublished) return false;
    const norm = c.name?.trim().toLowerCase();
    return !deletedIds.includes(c.id) && !deletedIds.includes(norm);
  });

  let dbList: Course[] = [];
  try {
    const q = query(collection(db, COLLECTION_NAME), where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as Course;
      const norm = data.name?.trim().toLowerCase();
      if (!deletedIds.includes(doc.id) && !deletedIds.includes(norm)) {
        dbList.push(data);
      }
    });
  } catch (error) {
    console.warn('Error fetching published courses from DB:', error);
  }

  const map = new Map<string, Course>();
  INITIAL_COURSES.forEach((c, i) => {
    const id = `init-${i}`;
    const norm = c.name.trim().toLowerCase();
    if (!deletedIds.includes(id) && !deletedIds.includes(norm)) {
      map.set(norm, { id, ...c });
    }
  });

  dbList.forEach((c) => {
    const norm = c.name?.trim().toLowerCase() || c.id || '';
    if (!deletedIds.includes(c.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, c);
    }
  });

  localList.forEach((c) => {
    const norm = c.name?.trim().toLowerCase() || c.id || '';
    if (!deletedIds.includes(c.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, c);
    }
  });

  return Array.from(map.values());
}

export async function getAllCourses(): Promise<Course[]> {
  const deletedIds = getDeletedCourseIds();
  const localList = getLocalCustomCourses().filter((c) => {
    if (!c.id) return false;
    const norm = c.name?.trim().toLowerCase();
    return !deletedIds.includes(c.id) && !deletedIds.includes(norm);
  });

  let dbList: Course[] = [];
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as Course;
      const norm = data.name?.trim().toLowerCase();
      if (!deletedIds.includes(doc.id) && !deletedIds.includes(norm)) {
        dbList.push(data);
      }
    });
  } catch (error) {
    console.warn('Error fetching all courses from DB:', error);
  }

  const map = new Map<string, Course>();
  INITIAL_COURSES.forEach((c, i) => {
    const id = `init-${i}`;
    const norm = c.name.trim().toLowerCase();
    if (!deletedIds.includes(id) && !deletedIds.includes(norm)) {
      map.set(norm, { id, ...c });
    }
  });

  dbList.forEach((c) => {
    const norm = c.name?.trim().toLowerCase() || c.id || '';
    if (!deletedIds.includes(c.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, c);
    }
  });

  localList.forEach((c) => {
    const norm = c.name?.trim().toLowerCase() || c.id || '';
    if (!deletedIds.includes(c.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, c);
    }
  });

  return Array.from(map.values());
}

export async function addCourse(course: Omit<Course, 'id'>): Promise<string> {
  const localId = `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const fullCourse: Course = {
    ...course,
    id: localId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const current = getLocalCustomCourses();
  saveLocalCustomCourses([fullCourse, ...current]);

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...course,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (docRef.id) {
      const updated = getLocalCustomCourses().map((c) => (c.id === localId ? { ...c, id: docRef.id } : c));
      saveLocalCustomCourses(updated);
      return docRef.id;
    }
    return localId;
  } catch (error) {
    console.warn('Firestore addCourse fallback:', error);
    return localId;
  }
}

export async function updateCourse(id: string, course: Partial<Course>): Promise<void> {
  const current = getLocalCustomCourses();
  const updated = current.map((c) => (c.id === id ? { ...c, ...course, updatedAt: new Date().toISOString() } : c));
  saveLocalCustomCourses(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...course,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Firestore updateCourse fallback:', error);
  }
}

export async function deleteCourse(id: string): Promise<void> {
  try {
    const deleted = getDeletedCourseIds();
    const toDelete = new Set<string>([id, id.trim().toLowerCase()]);

    const local = getLocalCustomCourses();
    const foundLocal = local.find((c) => c.id === id || c.name?.trim().toLowerCase() === id.trim().toLowerCase());
    if (foundLocal?.id) toDelete.add(foundLocal.id);
    if (foundLocal?.name) toDelete.add(foundLocal.name.trim().toLowerCase());

    INITIAL_COURSES.forEach((c, i) => {
      if (`init-${i}` === id || c.name.trim().toLowerCase() === id.trim().toLowerCase()) {
        toDelete.add(`init-${i}`);
        toDelete.add(c.name.trim().toLowerCase());
      }
    });

    const updatedDeleted = Array.from(new Set([...deleted, ...toDelete]));
    localStorage.setItem(DELETED_COURSES_KEY, JSON.stringify(updatedDeleted));

    const current = local.filter(
      (c) => !toDelete.has(c.id || '') && (!c.name || !toDelete.has(c.name.trim().toLowerCase()))
    );
    saveLocalCustomCourses(current);

    if (!id.startsWith('init-')) {
      const docRef = doc(db, COLLECTION_NAME, id);
      deleteDoc(docRef).catch(() => {});
    }
  } catch (error) {
    console.warn('Firestore deleteCourse fallback:', error);
  }
}
