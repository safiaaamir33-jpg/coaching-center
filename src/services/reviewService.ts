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
import { Review } from '../types';

const COLLECTION_NAME = 'reviews';

export const INITIAL_REVIEWS: Omit<Review, 'id'>[] = [
  {
    authorName: 'Haji Muhammad Iqbal',
    roleOrClass: 'Parent of Class 10 (Matric Topper)',
    rating: 5,
    comment: 'Alhamdulillah, my son scored 1052 marks in BISE Bahawalpur Matric exams under the guidance of Bright Future Academy teachers in Sadiqabad. The daily testing routine and individual attention made all the difference.',
    status: 'approved',
    submittedAt: '2026-08-20T10:00:00Z',
    approvedAt: '2026-08-20T11:00:00Z',
  },
  {
    authorName: 'Aiman Fatima',
    roleOrClass: 'F.Sc Pre-Medical Student',
    rating: 5,
    comment: 'The biology and physics faculty here are phenomenal! Dr. Shahzad and Prof. Naveed explain each topic with conceptual depth instead of rote learning. I highly recommend this academy to all medical aspirants.',
    status: 'approved',
    submittedAt: '2026-09-05T14:30:00Z',
    approvedAt: '2026-09-05T15:00:00Z',
  },
  {
    authorName: 'Rana Zulfiqar Ali',
    roleOrClass: 'Parent of Class 9 Student',
    rating: 5,
    comment: 'Very disciplined academy with clean classrooms and timely SMS attendance alerts. Best tuition center for children in Sadiqabad.',
    status: 'approved',
    submittedAt: '2026-09-18T09:15:00Z',
    approvedAt: '2026-09-18T10:00:00Z',
  }
];

const DELETED_REVIEWS_KEY = 'bfa_deleted_reviews';

function getDeletedReviewIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getApprovedReviews(): Promise<Review[]> {
  const deletedIds = getDeletedReviewIds();
  try {
    const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'approved'));
    const snapshot = await getDocs(q);
    const list: Review[] = [];
    snapshot.forEach((doc) => {
      if (!deletedIds.includes(doc.id)) {
        list.push({ id: doc.id, ...doc.data() } as Review);
      }
    });

    INITIAL_REVIEWS.forEach((r, i) => {
      const id = `init-r-${i}`;
      if (!deletedIds.includes(id) && !list.some((item) => item.id === id)) {
        list.push({ id, ...r });
      }
    });

    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    console.warn('Error fetching approved reviews, using defaults:', error);
    return INITIAL_REVIEWS.map((r, i) => ({ id: `init-r-${i}`, ...r })).filter((r) => !deletedIds.includes(r.id));
  }
}

export async function getAllReviewsAdmin(): Promise<Review[]> {
  const deletedIds = getDeletedReviewIds();
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const list: Review[] = [];
    snapshot.forEach((doc) => {
      if (!deletedIds.includes(doc.id)) {
        list.push({ id: doc.id, ...doc.data() } as Review);
      }
    });

    INITIAL_REVIEWS.forEach((r, i) => {
      const id = `init-r-${i}`;
      if (!deletedIds.includes(id) && !list.some((item) => item.id === id)) {
        list.push({ id, ...r });
      }
    });

    return list;
  } catch (error) {
    console.warn('Error fetching all reviews admin, using fallback:', error);
    return INITIAL_REVIEWS.map((r, i) => ({ id: `init-r-${i}`, ...r })).filter((r) => !deletedIds.includes(r.id));
  }
}

export async function submitReview(review: Omit<Review, 'id' | 'status' | 'submittedAt' | 'approvedAt'>): Promise<string> {
  try {
    if (review.rating < 1 || review.rating > 5) throw new Error('Rating must be between 1 and 5');
    if (!review.authorName.trim() || !review.comment.trim()) throw new Error('Name and review content are required');

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...review,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function moderateReview(id: string, status: 'approved' | 'rejected'): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status,
      approvedAt: status === 'approved' ? new Date().toISOString() : null,
    });
  } catch (error) {
    console.warn('Firestore moderateReview fallback:', error);
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    const deleted = getDeletedReviewIds();
    if (!deleted.includes(id)) {
      localStorage.setItem(DELETED_REVIEWS_KEY, JSON.stringify([...deleted, id]));
    }

    if (!id.startsWith('init-r-')) {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.warn('Firestore deleteReview fallback:', error);
  }
}
