import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { FeePayment, Student } from '../types';
import { updateStudent, getLocalStudents } from './studentService';

const COLLECTION_NAME = 'feePayments';
const DELETED_PAYMENTS_KEY = 'bfa_deleted_fee_payments';
const CUSTOM_PAYMENTS_KEY = 'bfa_custom_fee_payments';

const INITIAL_PAYMENTS: FeePayment[] = [
  {
    paymentId: 'REC-202610-1011',
    receiptNumber: 'REC-202610-1011',
    studentId: 'BFA-2026-001',
    studentName: 'Muhammad Hamza',
    fatherName: 'Tariq Mehmood',
    classGrade: 'Class 9',
    feeMonth: 'October 2026',
    amount: 3500,
    discountApplied: 0,
    paymentMethod: 'cash',
    paymentType: 'monthly',
    referenceNumber: 'CASH-DESK-01',
    paidBy: 'Tariq Mehmood (Father)',
    receivedBy: 'Principal / Admin Office',
    paidAt: '2026-10-05T09:30:00.000Z',
    createdAt: '2026-10-05T09:30:00.000Z',
  },
  {
    paymentId: 'REC-202610-1012',
    receiptNumber: 'REC-202610-1012',
    studentId: 'BFA-2026-002',
    studentName: 'Ayesha Bibi',
    fatherName: 'Muhammad Aslam',
    classGrade: 'Class 9',
    feeMonth: 'October 2026',
    amount: 1500,
    discountApplied: 500,
    paymentMethod: 'jazzcash',
    paymentType: 'monthly',
    referenceNumber: 'JC-88291039',
    paidBy: 'Muhammad Aslam',
    receivedBy: 'Accounts Desk',
    paidAt: '2026-10-08T11:15:00.000Z',
    createdAt: '2026-10-08T11:15:00.000Z',
  },
  {
    paymentId: 'REC-202610-1013',
    receiptNumber: 'REC-202610-1013',
    studentId: 'BFA-2026-004',
    studentName: 'Ali Raza',
    fatherName: 'Muhammad Akram',
    classGrade: 'Class 10',
    feeMonth: 'October 2026',
    amount: 3800,
    discountApplied: 0,
    paymentMethod: 'cash',
    paymentType: 'monthly',
    referenceNumber: 'CASH-DESK-02',
    paidBy: 'Muhammad Akram',
    receivedBy: 'Admin Desk',
    paidAt: '2026-10-10T10:00:00.000Z',
    createdAt: '2026-10-10T10:00:00.000Z',
  },
  {
    paymentId: 'REC-202610-1014',
    receiptNumber: 'REC-202610-1014',
    studentId: 'BFA-2026-006',
    studentName: 'Usama Tariq',
    fatherName: 'Tariq Javed',
    classGrade: 'Class 11 (F.Sc Pre-Medical)',
    feeMonth: 'October 2026',
    amount: 2500,
    discountApplied: 0,
    paymentMethod: 'easypaisa',
    paymentType: 'monthly',
    referenceNumber: 'EP-44910283',
    paidBy: 'Tariq Javed',
    receivedBy: 'Admin Office',
    paidAt: '2026-10-12T14:20:00.000Z',
    createdAt: '2026-10-12T14:20:00.000Z',
  }
];

function getDeletedPaymentIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDeletedPaymentIds(ids: string[]) {
  try {
    localStorage.setItem(DELETED_PAYMENTS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function getLocalCustomPayments(): FeePayment[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomPayments(payments: FeePayment[]) {
  try {
    localStorage.setItem(CUSTOM_PAYMENTS_KEY, JSON.stringify(payments));
  } catch {
    // ignore
  }
}

export function generateReceiptNumber(): string {
  const d = new Date();
  const yearMonth = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REC-${yearMonth}-${rand}`;
}

export async function getAllFeePayments(): Promise<FeePayment[]> {
  const deletedIds = getDeletedPaymentIds();
  const localList = getLocalCustomPayments().filter(
    (p) => !deletedIds.includes(p.paymentId) && (!p.receiptNumber || !deletedIds.includes(p.receiptNumber))
  );
  const paymentsMap = new Map<string, FeePayment>();

  // Initialize with initial demo payments
  INITIAL_PAYMENTS.forEach((p) => {
    if (!deletedIds.includes(p.paymentId) && !deletedIds.includes(p.receiptNumber)) {
      paymentsMap.set(p.paymentId, p);
    }
  });

  // Overlay custom local payments
  localList.forEach((p) => {
    if (!deletedIds.includes(p.paymentId) && (!p.receiptNumber || !deletedIds.includes(p.receiptNumber))) {
      paymentsMap.set(p.paymentId, p);
    }
  });

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('paidAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as FeePayment;
      const pid = data.paymentId || doc.id;
      if (!deletedIds.includes(pid) && !deletedIds.includes(doc.id) && (!data.receiptNumber || !deletedIds.includes(data.receiptNumber))) {
        paymentsMap.set(pid, data);
      }
    });
  } catch (error) {
    console.warn('Firestore fee payments list error, returning cached records:', error);
  }

  const list = Array.from(paymentsMap.values());
  return list.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
}

export async function getPaymentsByStudent(studentId: string): Promise<FeePayment[]> {
  const all = await getAllFeePayments();
  return all.filter((p) => p.studentId === studentId);
}

export async function recordFeePayment(
  paymentData: Omit<FeePayment, 'id' | 'paymentId' | 'receiptNumber' | 'createdAt'>
): Promise<FeePayment> {
  const receiptNumber = generateReceiptNumber();
  const paymentId = receiptNumber;

  const fullPayment: FeePayment = {
    ...paymentData,
    paymentId,
    receiptNumber,
    createdAt: new Date().toISOString(),
  };

  // Save locally first
  const custom = getLocalCustomPayments().filter((p) => p.paymentId !== paymentId);
  saveLocalCustomPayments([fullPayment, ...custom]);

  // Sync student's financial summary in local students cache
  const localStudents = getLocalStudents();
  const targetStudent = localStudents.find((s) => s.studentId === paymentData.studentId);
  if (targetStudent) {
    const newTotalPaid = (targetStudent.totalPaid || 0) + paymentData.amount;
    const discount = (targetStudent.discount || 0) + (paymentData.discountApplied || 0);
    const totalDue = targetStudent.monthlyFee || 0;
    const newBalance = Math.max(0, totalDue - discount - newTotalPaid);
    await updateStudent(targetStudent.studentId, {
      totalPaid: newTotalPaid,
      discount,
      balance: newBalance,
    });
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId);
    await setDoc(docRef, fullPayment);

    // Sync student's financial summary in Firestore
    const studentDocRef = doc(db, 'students', paymentData.studentId);
    const studentSnap = await getDoc(studentDocRef);
    if (studentSnap.exists()) {
      const student = studentSnap.data() as Student;
      const newTotalPaid = (student.totalPaid || 0) + paymentData.amount;
      const discount = (student.discount || 0) + (paymentData.discountApplied || 0);
      const totalDue = student.monthlyFee || 0;
      const newBalance = Math.max(0, totalDue - discount - newTotalPaid);

      await updateDoc(studentDocRef, {
        totalPaid: newTotalPaid,
        discount,
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.warn('Firestore fee payment record skipped, saved locally:', error);
  }

  return fullPayment;
}

export async function deleteFeePayment(paymentIdOrReceipt: string): Promise<void> {
  const custom = getLocalCustomPayments();
  const target =
    custom.find(
      (p) => p.paymentId === paymentIdOrReceipt || p.receiptNumber === paymentIdOrReceipt || p.id === paymentIdOrReceipt
    ) ||
    INITIAL_PAYMENTS.find(
      (p) => p.paymentId === paymentIdOrReceipt || p.receiptNumber === paymentIdOrReceipt || p.id === paymentIdOrReceipt
    );

  const toDelete = new Set<string>([paymentIdOrReceipt]);
  if (target?.paymentId) toDelete.add(target.paymentId);
  if (target?.receiptNumber) toDelete.add(target.receiptNumber);
  if (target?.id) toDelete.add(target.id);

  const deleted = getDeletedPaymentIds();
  saveDeletedPaymentIds(Array.from(new Set([...deleted, ...toDelete])));

  const remaining = custom.filter(
    (p) => !toDelete.has(p.paymentId) && (!p.receiptNumber || !toDelete.has(p.receiptNumber)) && (!p.id || !toDelete.has(p.id))
  );
  saveLocalCustomPayments(remaining);

  // If this payment belongs to a student, revert their totalPaid and balance
  if (target) {
    const localStudents = getLocalStudents();
    const st = localStudents.find((s) => s.studentId === target.studentId);
    if (st) {
      const newTotalPaid = Math.max(0, (st.totalPaid || 0) - target.amount);
      const discount = Math.max(0, (st.discount || 0) - (target.discountApplied || 0));
      const newBalance = Math.max(0, (st.monthlyFee || 0) - discount - newTotalPaid);
      updateStudent(st.studentId, {
        totalPaid: newTotalPaid,
        discount,
        balance: newBalance,
      }).catch(() => {});
    }
  }

  for (const pid of toDelete) {
    try {
      const docRef = doc(db, COLLECTION_NAME, pid);
      deleteDoc(docRef).catch(() => {});
    } catch {
      // quiet fallback
    }
  }
}
