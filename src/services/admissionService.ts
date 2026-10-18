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
import { AdmissionApplication } from '../types';
import { createStudent, generateNextStudentId } from './studentService';

const COLLECTION_NAME = 'admissions';
const DELETED_ADMISSIONS_KEY = 'bfa_deleted_admissions';
const CUSTOM_ADMISSIONS_KEY = 'bfa_custom_admissions';

function getDeletedAdmissionRefs(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_ADMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDeletedAdmissionRefs(refs: string[]) {
  try {
    localStorage.setItem(DELETED_ADMISSIONS_KEY, JSON.stringify(refs));
  } catch {
    // ignore
  }
}

function getLocalCustomAdmissions(): AdmissionApplication[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ADMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomAdmissions(admissions: AdmissionApplication[]) {
  try {
    localStorage.setItem(CUSTOM_ADMISSIONS_KEY, JSON.stringify(admissions));
  } catch {
    // ignore
  }
}

export function generateApplicationRef(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ref = 'ADM-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export async function submitAdmissionApplication(
  data: Omit<AdmissionApplication, 'id' | 'applicationRef' | 'status' | 'submittedAt'>
): Promise<string> {
  const applicationRef = generateApplicationRef();
  const rawPayload: Record<string, any> = {
    fullName: data.fullName?.trim() || '',
    fatherName: data.fatherName?.trim() || '',
    dob: data.dob || '',
    gender: data.gender || 'male',
    phone: data.phone?.trim() || '',
    guardianPhone: data.guardianPhone?.trim() || '',
    address: data.address?.trim() || '',
    previousEducation: data.previousEducation?.trim() || '',
    requestedClass: data.requestedClass || '',
    previousSchool: data.previousSchool?.trim() || '',
    message: data.message?.trim() || '',
    photoUrl: data.photoUrl || '',
    documentUrl: data.documentUrl || '',
    consent: data.consent ?? true,
    applicationRef,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Filter out any undefined values to strictly ensure valid Firestore document data
  const cleanPayload = Object.fromEntries(
    Object.entries(rawPayload).filter(([_, v]) => v !== undefined)
  ) as AdmissionApplication;

  // Save locally first so it immediately appears in admin portal
  const custom = getLocalCustomAdmissions().filter((a) => a.applicationRef !== applicationRef);
  saveLocalCustomAdmissions([cleanPayload, ...custom]);

  try {
    const docRef = doc(db, COLLECTION_NAME, applicationRef);
    await setDoc(docRef, cleanPayload);
  } catch (error) {
    console.warn('Firestore admission submit fallback, saved locally:', error);
  }

  return applicationRef;
}

export async function checkAdmissionStatus(applicationRef: string, verificationPhone?: string): Promise<AdmissionApplication | null> {
  const cleanRef = applicationRef.trim().toUpperCase();
  const localList = getLocalCustomAdmissions();
  const localMatch = localList.find((a) => a.applicationRef.toUpperCase() === cleanRef);

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanRef);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() } as AdmissionApplication;
      if (verificationPhone) {
        const cleanInput = verificationPhone.replace(/\D/g, '');
        const cleanStored = (data.phone || '').replace(/\D/g, '');
        const cleanGuardian = (data.guardianPhone || '').replace(/\D/g, '');
        if (!cleanStored.endsWith(cleanInput.slice(-7)) && !cleanGuardian.endsWith(cleanInput.slice(-7))) {
          throw new Error('Phone verification did not match the application record.');
        }
      }
      return data;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('verification')) {
      throw error;
    }
    console.warn('Firestore admission check failed, falling back to local:', error);
  }

  if (localMatch) {
    if (verificationPhone) {
      const cleanInput = verificationPhone.replace(/\D/g, '');
      const cleanStored = (localMatch.phone || '').replace(/\D/g, '');
      const cleanGuardian = (localMatch.guardianPhone || '').replace(/\D/g, '');
      if (!cleanStored.endsWith(cleanInput.slice(-7)) && !cleanGuardian.endsWith(cleanInput.slice(-7))) {
        throw new Error('Phone verification did not match the application record.');
      }
    }
    return localMatch;
  }

  return null;
}

export async function getAllAdmissions(): Promise<AdmissionApplication[]> {
  const deletedRefs = getDeletedAdmissionRefs();
  const localList = getLocalCustomAdmissions().filter(
    (a) => !deletedRefs.includes(a.applicationRef) && (!a.id || !deletedRefs.includes(a.id))
  );
  const admissionsMap = new Map<string, AdmissionApplication>();

  // Add local admissions first
  localList.forEach((a) => admissionsMap.set(a.applicationRef, a));

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() } as AdmissionApplication;
      const ref = data.applicationRef || doc.id;
      if (!deletedRefs.includes(ref) && !deletedRefs.includes(doc.id)) {
        admissionsMap.set(ref, data);
      }
    });
  } catch (error) {
    console.warn('Firestore admissions list error, returning local records:', error);
  }

  const list = Array.from(admissionsMap.values());
  return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function deleteAdmission(refOrId: string): Promise<void> {
  const deleted = getDeletedAdmissionRefs();
  const toDelete = new Set<string>([refOrId]);

  const custom = getLocalCustomAdmissions();
  const found = custom.find((a) => a.applicationRef === refOrId || a.id === refOrId);
  if (found?.applicationRef) toDelete.add(found.applicationRef);
  if (found?.id) toDelete.add(found.id);

  saveDeletedAdmissionRefs(Array.from(new Set([...deleted, ...toDelete])));

  const remaining = custom.filter(
    (a) => !toDelete.has(a.applicationRef) && (!a.id || !toDelete.has(a.id))
  );
  saveLocalCustomAdmissions(remaining);

  for (const r of toDelete) {
    try {
      const docRef = doc(db, COLLECTION_NAME, r);
      deleteDoc(docRef).catch(() => {});
    } catch {
      // quiet fallback
    }
  }
}

export async function updateAdmissionStatus(
  refId: string,
  status: AdmissionApplication['status'],
  reviewerNotes?: string
): Promise<void> {
  const custom = getLocalCustomAdmissions();
  const updated = custom.map((a) =>
    a.applicationRef === refId
      ? { ...a, status, reviewerNotes: reviewerNotes || '', updatedAt: new Date().toISOString() }
      : a
  );
  saveLocalCustomAdmissions(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, refId);
    await updateDoc(docRef, {
      status,
      reviewerNotes: reviewerNotes || '',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Firestore admission status update fallback:', error);
  }
}

export async function convertAdmissionToStudent(
  admission: AdmissionApplication,
  monthlyFee: number = 3500,
  admissionFee: number = 1000
): Promise<string> {
  if (admission.studentId) {
    return admission.studentId;
  }

  const newStudentId = await generateNextStudentId();
  await createStudent({
    studentId: newStudentId,
    fullName: admission.fullName,
    fatherName: admission.fatherName,
    dob: admission.dob,
    gender: admission.gender || 'male',
    phone: admission.phone,
    guardianPhone: admission.guardianPhone,
    address: admission.address,
    currentClass: admission.requestedClass,
    enrolledCourses: [admission.requestedClass],
    status: 'active',
    monthlyFee,
    discount: 0,
    totalPaid: 0,
    balance: monthlyFee + admissionFee,
    enrollmentDate: new Date().toISOString().split('T')[0],
    photoUrl: admission.photoUrl || '',
    notes: `Converted from Admission Ref ${admission.applicationRef}`,
  });

  await updateAdmissionStatus(admission.applicationRef, 'approved');

  // Update in local cache
  const custom = getLocalCustomAdmissions();
  const updated = custom.map((a) =>
    a.applicationRef === admission.applicationRef
      ? { ...a, status: 'approved' as const, studentId: newStudentId, updatedAt: new Date().toISOString() }
      : a
  );
  saveLocalCustomAdmissions(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, admission.applicationRef);
    await updateDoc(docRef, {
      status: 'approved',
      studentId: newStudentId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Firestore convert admission update fallback:', error);
  }

  return newStudentId;
}
