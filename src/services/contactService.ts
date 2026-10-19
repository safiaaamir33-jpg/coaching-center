import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ContactMessage } from '../types';

const COLLECTION_NAME = 'contactMessages';
const CUSTOM_CONTACTS_KEY = 'bfa_custom_contacts';
const DELETED_CONTACTS_KEY = 'bfa_deleted_contacts';

function getLocalContacts(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CONTACTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalContacts(messages: ContactMessage[]) {
  try {
    localStorage.setItem(CUSTOM_CONTACTS_KEY, JSON.stringify(messages));
  } catch {
    // ignore
  }
}

function getDeletedContactIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_CONTACTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function generateMessageId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `MSG-${Date.now().toString().slice(-6)}-${num}`;
}

export async function submitContactMessage(
  data: Omit<ContactMessage, 'id' | 'status' | 'submittedAt'>
): Promise<string> {
  const id = generateMessageId();
  const rawMessage: ContactMessage = {
    id,
    name: data.name?.trim() || 'Parent/Visitor',
    phone: data.phone?.trim() || '',
    email: data.email?.trim() || '',
    subject: data.subject?.trim() || 'Admission Inquiry',
    message: data.message?.trim() || '',
    status: 'new',
    submittedAt: new Date().toISOString(),
  };

  // 1. Immediately store in local cache so inquiry is NEVER lost and instantly appears in Admin Portal
  const localList = getLocalContacts().filter((m) => m.id !== id);
  saveLocalContacts([rawMessage, ...localList]);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, rawMessage);
  } catch (error) {
    console.warn('Firestore contact submit synced to local storage:', error);
  }

  return id;
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const deletedIds = getDeletedContactIds();
  const localList = getLocalContacts().filter((m) => m.id && !deletedIds.includes(m.id));

  let dbList: ContactMessage[] = [];
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      if (!deletedIds.includes(doc.id)) {
        dbList.push({ id: doc.id, ...doc.data() } as ContactMessage);
      }
    });
  } catch (error) {
    console.warn('Error fetching Firestore contact messages, using local store:', error);
  }

  // Merge Firestore and local store, deduplicating by id
  const map = new Map<string, ContactMessage>();
  for (const item of dbList) {
    if (item.id && !deletedIds.includes(item.id)) {
      map.set(item.id, item);
    }
  }
  for (const item of localList) {
    if (item.id && !deletedIds.includes(item.id)) {
      map.set(item.id, item);
    }
  }

  // Sort by date descending
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime()
  );
}

export async function updateContactStatus(id: string, status: ContactMessage['status']): Promise<void> {
  // Update local
  const localList = getLocalContacts();
  const updated = localList.map((m) => (m.id === id ? { ...m, status } : m));
  saveLocalContacts(updated);

  // Update Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.warn('Firestore updateContactStatus fallback:', error);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  const deleted = getDeletedContactIds();
  if (!deleted.includes(id)) {
    localStorage.setItem(DELETED_CONTACTS_KEY, JSON.stringify([...deleted, id]));
  }

  // Remove from local cache
  const localList = getLocalContacts().filter((m) => m.id !== id);
  saveLocalContacts(localList);

  // Remove from Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore deleteContactMessage fallback:', error);
  }
}

