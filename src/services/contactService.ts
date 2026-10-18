import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { ContactMessage } from '../types';

const COLLECTION_NAME = 'contactMessages';

export async function submitContactMessage(
  data: Omit<ContactMessage, 'id' | 'status' | 'submittedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: 'new',
      submittedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

const DELETED_CONTACTS_KEY = 'bfa_deleted_contacts';

function getDeletedContactIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_CONTACTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const deletedIds = getDeletedContactIds();
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: ContactMessage[] = [];
    snapshot.forEach((doc) => {
      if (!deletedIds.includes(doc.id)) {
        list.push({ id: doc.id, ...doc.data() } as ContactMessage);
      }
    });
    return list;
  } catch (error) {
    console.warn('Error fetching contact messages:', error);
    return [];
  }
}

export async function updateContactStatus(id: string, status: ContactMessage['status']): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.warn('Firestore updateContactStatus fallback:', error);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    const deleted = getDeletedContactIds();
    if (!deleted.includes(id)) {
      localStorage.setItem(DELETED_CONTACTS_KEY, JSON.stringify([...deleted, id]));
    }
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore deleteContactMessage fallback:', error);
  }
}
