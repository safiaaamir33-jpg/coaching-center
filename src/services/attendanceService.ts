import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { AttendanceRecord } from '../types';

const COLLECTION_NAME = 'attendance';
const ATTENDANCE_STORAGE_KEY = 'bfa_attendance_sessions';
const DELETED_ATTENDANCE_KEY = 'bfa_deleted_attendance_sessions';

function getDeletedAttendanceIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_ATTENDANCE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalAttendanceSessions(): Record<string, AttendanceRecord> {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalAttendanceSessions(sessions: Record<string, AttendanceRecord>) {
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export async function getAttendanceByDateAndClass(date: string, classGrade: string): Promise<AttendanceRecord | null> {
  const docId = `${classGrade.replace(/\s+/g, '_')}_${date}`;
  const localMap = getLocalAttendanceSessions();
  const localRec = localMap[docId] || null;

  try {
    const docRef = doc(db, COLLECTION_NAME, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() } as AttendanceRecord;
      // Sync local cache
      localMap[docId] = data;
      saveLocalAttendanceSessions(localMap);
      return data;
    }
  } catch (error) {
    console.warn('Firestore attendance fetch skipped or offline, reading local cache:', error);
  }

  return localRec;
}

export async function saveAttendance(record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docId = `${record.classGrade.replace(/\s+/g, '_')}_${record.date}`;
  const localMap = getLocalAttendanceSessions();
  const existingLocal = localMap[docId];

  const fullRecord: AttendanceRecord = {
    ...record,
    id: docId,
    createdAt: existingLocal?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately store in local cache
  localMap[docId] = fullRecord;
  saveLocalAttendanceSessions(localMap);

  // 2. Try Firestore write
  try {
    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, fullRecord);
  } catch (error) {
    console.warn('Firestore attendance save skipped or offline, saved locally:', error);
  }

  return docId;
}

export async function addOrUpdateSingleStudentAttendance(params: {
  date: string;
  classGrade: string;
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  remarks?: string;
  recordedBy?: string;
  allClassRecords?: Record<string, { status: 'present' | 'absent' | 'late' | 'leave'; remarks?: string; studentName?: string }>;
}): Promise<void> {
  const docId = `${params.classGrade.replace(/\s+/g, '_')}_${params.date}`;
  const localMap = getLocalAttendanceSessions();
  let session = localMap[docId];

  // If local session doesn't exist, try Firestore or use provided full class records
  if (!session) {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, docId));
      if (snap.exists()) {
        session = { id: snap.id, ...snap.data() } as AttendanceRecord;
      }
    } catch {
      // quiet fallback
    }
  }

  // Base records from existing session or from provided class records
  const currentRecords: Record<string, any> = session?.records ? { ...session.records } : {};

  // If caller provided full active student records map, merge it so no students are dropped
  if (params.allClassRecords) {
    Object.keys(params.allClassRecords).forEach((sId) => {
      if (!currentRecords[sId]) {
        currentRecords[sId] = {
          studentId: sId,
          studentName: params.allClassRecords![sId].studentName || sId,
          status: params.allClassRecords![sId].status || 'present',
          remarks: params.allClassRecords![sId].remarks || '',
          updatedAt: new Date().toISOString(),
        };
      }
    });
  }

  // Set the specific student's new status
  currentRecords[params.studentId] = {
    studentId: params.studentId,
    studentName: params.studentName,
    status: params.status,
    remarks: params.remarks || '',
    updatedAt: new Date().toISOString(),
  };

  // Recalculate totals
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;
  const allStudentsKeys = Object.keys(currentRecords);

  allStudentsKeys.forEach((sKey) => {
    const st = currentRecords[sKey].status;
    if (st === 'present') presentCount++;
    else if (st === 'absent') absentCount++;
    else if (st === 'late') lateCount++;
    else if (st === 'leave') leaveCount++;
  });

  const updatedSession: AttendanceRecord = {
    ...(session || {}),
    id: docId,
    date: params.date,
    classGrade: params.classGrade,
    records: currentRecords,
    totalStudents: allStudentsKeys.length,
    presentCount,
    absentCount,
    lateCount,
    leaveCount,
    recordedBy: params.recordedBy || session?.recordedBy || 'Admin Staff',
    createdAt: session?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save to local cache immediately
  localMap[docId] = updatedSession;
  saveLocalAttendanceSessions(localMap);

  // Try Firestore update
  try {
    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, updatedSession);
  } catch (error) {
    console.warn('Firestore single attendance update skipped or offline, saved locally:', error);
  }
}

export async function deleteAttendanceRecord(id: string): Promise<void> {
  const deleted = getDeletedAttendanceIds();
  const toDelete = new Set<string>([id, id.replace(/\s+/g, '_'), id.replace(/_/g, ' ')]);

  const localMap = getLocalAttendanceSessions();
  for (const d of toDelete) {
    delete localMap[d];
  }
  saveLocalAttendanceSessions(localMap);

  const updatedDeleted = Array.from(new Set([...deleted, ...toDelete]));
  localStorage.setItem(DELETED_ATTENDANCE_KEY, JSON.stringify(updatedDeleted));

  for (const dId of toDelete) {
    try {
      const docRef = doc(db, COLLECTION_NAME, dId);
      await deleteDoc(docRef);
    } catch (error) {
      // quiet fallback
    }
  }
}

export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  const deletedIds = getDeletedAttendanceIds();
  const localMap = getLocalAttendanceSessions();
  const recordsMap = new Map<string, AttendanceRecord>();

  Object.entries(localMap).forEach(([id, rec]) => {
    if (!deletedIds.includes(id)) {
      recordsMap.set(id, rec);
    }
  });

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      if (!deletedIds.includes(doc.id)) {
        const data = { id: doc.id, ...doc.data() } as AttendanceRecord;
        recordsMap.set(doc.id, data);
      }
    });
  } catch (error) {
    console.warn('Firestore attendance list error, using local records:', error);
  }

  const list = Array.from(recordsMap.values());
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
