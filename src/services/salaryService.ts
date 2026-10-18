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
import { TeacherSalary } from '../types';

const COLLECTION_NAME = 'teacherSalaries';

export async function getAllSalaryPayments(): Promise<TeacherSalary[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('paidAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: TeacherSalary[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as TeacherSalary);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

export async function recordSalaryPayment(payment: Omit<TeacherSalary, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...payment,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function deleteSalaryPayment(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
