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
import { Announcement, GalleryItem } from '../types';

const ANNOUNCEMENTS_COLLECTION = 'announcements';
const GALLERY_COLLECTION = 'gallery';
const DELETED_CMS_KEY = 'bfa_deleted_cms_records';
const CUSTOM_ANNOUNCEMENTS_KEY = 'bfa_custom_announcements';
const CUSTOM_GALLERY_KEY = 'bfa_custom_gallery';

export const INITIAL_ANNOUNCEMENTS: (Omit<Announcement, 'id'> & { id: string })[] = [
  {
    id: 'init-a-0',
    title: 'Admissions Open: Annual Academic Session 2026–2027',
    category: 'admission',
    classGrade: 'All Classes',
    content: 'Registration is now underway for Class 9th, 10th (Matric Science) and F.Sc Part 1 & 2 (Pre-Medical & Pre-Engineering). Special 20% early bird discount for the first 50 enrolled students in Sadiqabad.',
    date: '2026-10-15',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    actionText: 'Apply for Admission',
    actionUrl: '/admissions'
  },
  {
    id: 'init-a-class9',
    title: 'Class 9th (Matric Science) Foundation & Conceptual Batch Admissions Open',
    category: 'admission',
    classGrade: 'Class 9',
    content: 'Admissions open for Class 9th Science (Physics, Chemistry, Biology, Mathematics). Daily chapter tests, weekly revision assessments, and board pattern training in Sadiqabad.',
    date: '2026-10-16',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1000&q=80',
    actionText: 'Register for Class 9',
    actionUrl: '/admissions?class=Class+9'
  },
  {
    id: 'init-a-class10',
    title: 'Class 10th (Matric Science) High-Scoring Board Preparation Session',
    category: 'admission',
    classGrade: 'Class 10',
    content: 'Target 1050+ marks in BISE Bahawalpur Board exams. Complete syllabus coverage, 5-year past papers solved series, and personalized weak area mentoring.',
    date: '2026-10-17',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    actionText: 'Enroll in Class 10',
    actionUrl: '/admissions?class=Class+10'
  },
  {
    id: 'init-a-class11',
    title: 'Class 11 / 1st Year (F.Sc Pre-Medical & Pre-Engineering) New Session Admissions',
    category: 'admission',
    classGrade: 'Class 11 (F.Sc)',
    content: 'Expert college faculty for Physics, Chemistry, Biology, and Mathematics. Conceptual diagrams, numerical problem sheets, and air-conditioned science labs in Sadiqabad.',
    date: '2026-10-18',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',
    actionText: 'Apply for F.Sc Part 1',
    actionUrl: '/admissions?class=Class+11'
  },
  {
    id: 'init-a-class12',
    title: 'Class 12 / 2nd Year (F.Sc & ICS) Final Board Crash & Revision Series',
    category: 'admission',
    classGrade: 'Class 12 (F.Sc)',
    content: 'Comprehensive 90-day board revision session with daily unit-wise mock assessments, past paper drills, and computer lab practical coaching.',
    date: '2026-10-19',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    actionText: 'Join 2nd Year Revision',
    actionUrl: '/admissions?class=Class+12'
  },
  {
    id: 'init-a-ics',
    title: 'Class 11 & 12 (ICS) Computer Science, Physics & Mathematics Special Batch',
    category: 'admission',
    classGrade: 'Class 11 & 12 (ICS)',
    content: 'Hands-on programming practice in C/C++, database management, electronics, and calculus with FAST/NUCES qualified teachers in Sadiqabad.',
    date: '2026-10-19',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
    actionText: 'Apply for ICS Batch',
    actionUrl: '/admissions?class=ICS'
  },
  {
    id: 'init-a-mdcat',
    title: 'MDCAT & ECAT 2026 Comprehensive Entry Test Preparation Batch',
    category: 'admission',
    classGrade: 'MDCAT / ECAT',
    content: 'High-yield MCQs bank, speed-accuracy shortcut techniques, negative-marking practice, and full-length simulated mock exams for NUMS, UHS, and UET entry tests.',
    date: '2026-10-20',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
    actionText: 'Register for MDCAT / ECAT',
    actionUrl: '/admissions?class=MDCAT'
  },
  {
    id: 'init-a-pre9',
    title: 'Pre-9th Foundation Batch (Early Matric Science Prep)',
    category: 'admission',
    classGrade: 'Class 9',
    content: 'Kick-start your science foundation 3 months before board classes begin. Strong grasp of high school basic chemistry, physics laws, and algebraic equations.',
    date: '2026-10-21',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
    actionText: 'Join Pre-9th Batch',
    actionUrl: '/admissions?class=Class+9'
  },
  {
    id: 'init-a-junior',
    title: 'Junior Wing (Class 1–8) English Medium Conceptual Coaching',
    category: 'admission',
    classGrade: 'Class 1–8',
    content: 'Interactive English speaking, mathematics tables & arithmetic, basic science phenomena, Urdu grammar, and daily homework guidance under patient lady tutors.',
    date: '2026-10-22',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80',
    actionText: 'Enroll in Junior Wing',
    actionUrl: '/admissions?class=Junior'
  },
  {
    id: 'init-a-1',
    title: 'Grand Monthly Assessment & Board Mock Test Series',
    category: 'exam',
    classGrade: 'Class 10',
    content: 'All enrolled students of Class 10th and 12th must appear in the upcoming full-syllabus diagnostic mock test on Sunday. Board answer sheets will be provided for authentic practice.',
    date: '2026-10-25',
    isImportant: true,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
    actionText: 'View Exam Schedule',
    actionUrl: '/exams'
  },
  {
    id: 'init-a-2',
    title: 'Congratulations: Top BISE Board Positions Achieved',
    category: 'event',
    classGrade: 'All Classes',
    content: 'Heartiest congratulations to our star students Muhammad Bilal (1068/1100 in Matric) and Ayesha Noor (1045/1100 in F.Sc) for clinching top positions in Sadiqabad tehsil!',
    date: '2026-09-30',
    isImportant: false,
    isPublished: true,
    posterUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
    actionText: 'View Hall of Fame',
    actionUrl: '/gallery'
  }
];

export const INITIAL_GALLERY: (Omit<GalleryItem, 'id'> & { id: string })[] = [
  {
    id: 'init-g-0',
    title: 'Modern Science & Practical Laboratory',
    category: 'campus',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',
    description: 'Fully equipped physics, chemistry, and biology experimental workspace for practical demonstrations.',
    isPublished: true,
  },
  {
    id: 'init-g-1',
    title: 'Smart Air-Conditioned Classrooms',
    category: 'classes',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
    description: 'Comfortable, multimedia-enabled learning environment engineered for deep concentration.',
    isPublished: true,
  },
  {
    id: 'init-g-2',
    title: 'Annual Academic Position Holders Award Ceremony',
    category: 'events',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80',
    description: 'Shields, certificates, and cash prizes distributed to top scorers by notable educationists.',
    isPublished: true,
  },
  {
    id: 'init-g-3',
    title: 'Academy Resource & Reference Study Library',
    category: 'campus',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80',
    description: 'Extensive collection of reference books, past papers, syllabus guides, and self-study spaces.',
    isPublished: true,
  },
  {
    id: 'init-g-4',
    title: 'Pre-Medical Doubt Solving Session',
    category: 'classes',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
    description: 'Individual faculty guidance to ensure every student resolves complex concepts before exams.',
    isPublished: true,
  },
  {
    id: 'init-g-5',
    title: 'Parent-Teacher Council & Feedback Meet',
    category: 'events',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1000&q=80',
    description: 'Regular academic progress reviews with parents to ensure holistic student development.',
    isPublished: true,
  }
];

function getDeletedCmsIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_CMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markCmsIdDeleted(id: string) {
  try {
    const current = getDeletedCmsIds();
    if (!current.includes(id)) {
      localStorage.setItem(DELETED_CMS_KEY, JSON.stringify([...current, id]));
    }
  } catch {
    // ignore
  }
}

// Memory fallback cache in case of browser storage quota limitations
let inMemoryAnnouncementsCache: Announcement[] | null = null;
let inMemoryGalleryCache: GalleryItem[] | null = null;

function getCustomAnnouncementsFromStorage(): Announcement[] {
  if (inMemoryAnnouncementsCache && inMemoryAnnouncementsCache.length > 0) {
    return inMemoryAnnouncementsCache;
  }
  try {
    const raw = localStorage.getItem(CUSTOM_ANNOUNCEMENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    inMemoryAnnouncementsCache = parsed;
    return parsed;
  } catch {
    return inMemoryAnnouncementsCache || [];
  }
}

function saveCustomAnnouncementsToStorage(items: Announcement[]) {
  inMemoryAnnouncementsCache = items;
  try {
    localStorage.setItem(CUSTOM_ANNOUNCEMENTS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Storage quota limit reached, optimizing poster cache:', err);
    try {
      // Keep recent 12 items
      const recent = items.slice(0, 12);
      localStorage.setItem(CUSTOM_ANNOUNCEMENTS_KEY, JSON.stringify(recent));
    } catch {
      // Retain in memory cache
    }
  }
}

function getCustomGalleryFromStorage(): GalleryItem[] {
  if (inMemoryGalleryCache && inMemoryGalleryCache.length > 0) {
    return inMemoryGalleryCache;
  }
  try {
    const raw = localStorage.getItem(CUSTOM_GALLERY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    inMemoryGalleryCache = parsed;
    return parsed;
  } catch {
    return inMemoryGalleryCache || [];
  }
}

function saveCustomGalleryToStorage(items: GalleryItem[]) {
  inMemoryGalleryCache = items;
  try {
    localStorage.setItem(CUSTOM_GALLERY_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Gallery storage quota reached, saving recent items in memory:', err);
    try {
      localStorage.setItem(CUSTOM_GALLERY_KEY, JSON.stringify(items.slice(0, 12)));
    } catch {
      // Retain in memory
    }
  }
}

export function restoreAllDefaultPosters(): void {
  try {
    localStorage.removeItem(DELETED_CMS_KEY);
  } catch {
    // ignore
  }
}

export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  const deletedIds = getDeletedCmsIds();
  const customItems = getCustomAnnouncementsFromStorage().filter((a) => {
    if (!a.id || !a.isPublished) return false;
    const norm = a.title?.trim().toLowerCase();
    return !deletedIds.includes(a.id) && !deletedIds.includes(norm);
  });

  let dbList: Announcement[] = [];
  try {
    const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as Announcement;
      const norm = data.title?.trim().toLowerCase();
      if (!deletedIds.includes(doc.id) && !deletedIds.includes(norm)) {
        dbList.push(data);
      }
    });
  } catch (error) {
    console.warn('Error fetching announcements from DB, using local and defaults:', error);
  }

  // Deduplicate using normalized title
  const map = new Map<string, Announcement>();

  // Defaults first
  for (const init of INITIAL_ANNOUNCEMENTS) {
    const norm = init.title.trim().toLowerCase();
    if (!deletedIds.includes(init.id) && !deletedIds.includes(norm)) {
      map.set(norm, { ...init });
    }
  }

  // DB items override defaults
  for (const item of dbList) {
    const norm = item.title?.trim().toLowerCase() || item.id || '';
    if (!deletedIds.includes(item.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, item);
    }
  }

  // Custom items & Auto-sync to Firestore so clients always see what admin shared
  for (const item of customItems) {
    const norm = item.title?.trim().toLowerCase() || item.id || '';
    if (!deletedIds.includes(item.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, item);
      if (item.id && !dbList.some((d) => d.id === item.id)) {
        setDoc(doc(db, ANNOUNCEMENTS_COLLECTION, item.id), item).catch(() => {});
      }
    }
  }

  const merged = Array.from(map.values());
  return merged.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const deletedIds = getDeletedCmsIds();
  const customItems = getCustomAnnouncementsFromStorage().filter((a) => {
    if (!a.id) return false;
    const norm = a.title?.trim().toLowerCase();
    return !deletedIds.includes(a.id) && !deletedIds.includes(norm);
  });

  let dbList: Announcement[] = [];
  try {
    const snapshot = await getDocs(collection(db, ANNOUNCEMENTS_COLLECTION));
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as Announcement;
      const norm = data.title?.trim().toLowerCase();
      if (!deletedIds.includes(doc.id) && !deletedIds.includes(norm)) {
        dbList.push(data);
      }
    });
  } catch (error) {
    console.warn('Error fetching all announcements from DB:', error);
  }

  const map = new Map<string, Announcement>();

  // 1. Initial presets
  for (const init of INITIAL_ANNOUNCEMENTS) {
    const norm = init.title.trim().toLowerCase();
    if (!deletedIds.includes(init.id) && !deletedIds.includes(norm)) {
      map.set(norm, { ...init });
    }
  }

  // 2. DB records override presets with same title or add
  for (const item of dbList) {
    const norm = item.title?.trim().toLowerCase() || item.id || '';
    if (!deletedIds.includes(item.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, item);
    }
  }

  // 3. Local custom items override or add, and sync up to Firestore
  for (const item of customItems) {
    const norm = item.title?.trim().toLowerCase() || item.id || '';
    if (!deletedIds.includes(item.id || '') && !deletedIds.includes(norm)) {
      map.set(norm, item);
      if (item.id && !dbList.some((d) => d.id === item.id)) {
        setDoc(doc(db, ANNOUNCEMENTS_COLLECTION, item.id), item).catch(() => {});
      }
    }
  }

  const merged = Array.from(map.values());
  return merged.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
  const localId = `poster-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const fullItem: Announcement = {
    ...announcement,
    id: localId,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to custom local storage
  const current = getCustomAnnouncementsFromStorage();
  saveCustomAnnouncementsToStorage([fullItem, ...current]);

  // 2. Persist directly to Firestore so all clients/visitors immediately see it
  try {
    const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, localId);
    await setDoc(docRef, fullItem);
    return localId;
  } catch (error) {
    console.warn('Firestore announcement write skipped or offline, saved to local cache safely:', error);
    return localId;
  }
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<void> {
  const current = getCustomAnnouncementsFromStorage();
  const updated = current.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
  saveCustomAnnouncementsToStorage(updated);

  try {
    const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.warn('Firestore announcement update fallback:', error);
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  markCmsIdDeleted(id);

  // Also check if any announcement in memory or storage matches this id and record its title
  const current = getCustomAnnouncementsFromStorage();
  const found = current.find((a) => a.id === id);
  if (found?.title) {
    markCmsIdDeleted(found.title.trim().toLowerCase());
  }

  const remaining = current.filter((a) => a.id !== id && (!found?.title || a.title !== found.title));
  saveCustomAnnouncementsToStorage(remaining);

  try {
    if (!id.startsWith('init-')) {
      const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.warn('Firestore announcement delete fallback:', error);
  }
}

export async function getPublishedGallery(): Promise<GalleryItem[]> {
  const deletedIds = getDeletedCmsIds();
  const customItems = getCustomGalleryFromStorage().filter((g) => g.isPublished && !deletedIds.includes(g.id || ''));

  let dbList: GalleryItem[] = [];
  try {
    const q = query(collection(db, GALLERY_COLLECTION), where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      if (!deletedIds.includes(doc.id)) {
        dbList.push({ id: doc.id, ...doc.data() } as GalleryItem);
      }
    });
  } catch (error) {
    console.warn('Error fetching published gallery from DB:', error);
  }

  const map = new Map<string, GalleryItem>();
  for (const init of INITIAL_GALLERY) {
    if (!deletedIds.includes(init.id)) {
      map.set(init.id, { ...init });
    }
  }
  for (const item of dbList) {
    if (item.id && !deletedIds.includes(item.id)) {
      map.set(item.id, item);
    }
  }
  for (const item of customItems) {
    if (item.id && !deletedIds.includes(item.id)) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
}

export async function getAllGallery(): Promise<GalleryItem[]> {
  const deletedIds = getDeletedCmsIds();
  const customItems = getCustomGalleryFromStorage().filter((g) => !deletedIds.includes(g.id || ''));

  let dbList: GalleryItem[] = [];
  try {
    const snapshot = await getDocs(collection(db, GALLERY_COLLECTION));
    snapshot.forEach((doc) => {
      if (!deletedIds.includes(doc.id)) {
        dbList.push({ id: doc.id, ...doc.data() } as GalleryItem);
      }
    });
  } catch (error) {
    console.warn('Error fetching all gallery from DB:', error);
  }

  const map = new Map<string, GalleryItem>();
  for (const init of INITIAL_GALLERY) {
    if (!deletedIds.includes(init.id)) {
      map.set(init.id, { ...init });
    }
  }
  for (const item of dbList) {
    if (item.id && !deletedIds.includes(item.id)) {
      map.set(item.id, item);
    }
  }
  for (const item of customItems) {
    if (item.id && !deletedIds.includes(item.id)) {
      map.set(item.id, item);
      if (!dbList.some((d) => d.id === item.id)) {
        setDoc(doc(db, GALLERY_COLLECTION, item.id), item).catch(() => {});
      }
    }
  }

  return Array.from(map.values());
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt'>): Promise<string> {
  const localId = `gallery-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const fullItem: GalleryItem = {
    ...item,
    id: localId,
    createdAt: new Date().toISOString(),
  };

  const current = getCustomGalleryFromStorage();
  saveCustomGalleryToStorage([fullItem, ...current]);

  try {
    const docRef = doc(db, GALLERY_COLLECTION, localId);
    await setDoc(docRef, fullItem);
    return localId;
  } catch (error) {
    console.warn('Firestore gallery write skipped or offline, saved to local cache safely:', error);
    return localId;
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  markCmsIdDeleted(id);
  const current = getCustomGalleryFromStorage().filter((g) => g.id !== id);
  saveCustomGalleryToStorage(current);

  try {
    if (!id.startsWith('init-') && !id.startsWith('gallery-')) {
      const docRef = doc(db, GALLERY_COLLECTION, id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.warn('Firestore gallery delete fallback:', error);
  }
}
