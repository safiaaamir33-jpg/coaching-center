import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  X,
  UserCheck,
  UserX,
  FileSpreadsheet
} from 'lucide-react';
import { Student, AttendanceRecord } from '../../types';
import { getAllStudents } from '../../services/studentService';
import {
  getAttendanceByDateAndClass,
  saveAttendance,
  addOrUpdateSingleStudentAttendance,
  deleteAttendanceRecord,
  getAllAttendanceRecords
} from '../../services/attendanceService';

export const AttendanceManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes] = useState<string[]>([
    'Class 9',
    'Class 10',
    'Class 11 (F.Sc Pre-Medical)',
    'Class 11 (F.Sc Pre-Engineering)',
    'Class 11 (ICS)',
    'Class 12 (F.Sc Pre-Medical)',
    'Class 12 (F.Sc Pre-Engineering)',
    'Spoken English'
  ]);
  const [selectedClass, setSelectedClass] = useState('Class 9');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance state map: studentId -> { status, remarks }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, {
    status: 'present' | 'absent' | 'late' | 'leave';
    remarks?: string;
  }>>({});

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [historySearch, setHistorySearch] = useState('');

  // Add Attendance Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single');
  const [addStudentId, setAddStudentId] = useState('');
  const [addCustomName, setAddCustomName] = useState('');
  const [addClass, setAddClass] = useState('Class 9');
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [addStatus, setAddStatus] = useState<'present' | 'absent' | 'late' | 'leave'>('present');
  const [addRemarks, setAddRemarks] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    getAllStudents().then(setStudents).catch(console.error);
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const recs = await getAllAttendanceRecords();
      setHistory(recs || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Load existing attendance for selected date & class
  useEffect(() => {
    loadCurrentSession();
  }, [selectedDate, selectedClass, students]);

  const loadCurrentSession = async () => {
    setSavedSuccess(null);
    try {
      const activeClassStudents = students.filter(
        (s) => s.currentClass === selectedClass && s.status === 'active'
      );
      const existing = await getAttendanceByDateAndClass(selectedDate, selectedClass);

      const map: Record<string, { status: 'present' | 'absent' | 'late' | 'leave'; remarks?: string }> = {};

      activeClassStudents.forEach((s) => {
        if (existing?.records && existing.records[s.studentId]) {
          map[s.studentId] = {
            status: existing.records[s.studentId].status || 'present',
            remarks: existing.records[s.studentId].remarks || '',
          };
        } else {
          // Default all active students of this class to 'present'
          map[s.studentId] = { status: 'present', remarks: '' };
        }
      });

      // Also incorporate any manually added entries that exist in existing.records
      if (existing?.records) {
        Object.keys(existing.records).forEach((sId) => {
          if (!map[sId]) {
            map[sId] = {
              status: existing.records[sId].status || 'present',
              remarks: existing.records[sId].remarks || '',
            };
          }
        });
      }

      setAttendanceMap(map);
    } catch (err) {
      console.error('Error loading current attendance session:', err);
    }
  };

  const classStudents = students.filter(
    (s) => s.currentClass === selectedClass && s.status === 'active'
  );

  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'leave'>('all');
  const [instantNotification, setInstantNotification] = useState<string | null>(null);
  const [activeLateStudent, setActiveLateStudent] = useState<{
    studentId: string;
    studentName: string;
    currentRemarks?: string;
  } | null>(null);

  const handleStatusChange = async (studentId: string, status: 'present' | 'absent' | 'late' | 'leave') => {
    const student = students.find((s) => s.studentId === studentId);
    const studentName = student?.fullName || studentId;
    const currentEntry = attendanceMap[studentId] || { status: 'present', remarks: '' };
    const currentRemarks = currentEntry.remarks || '';

    const newRemarks = status === 'late' && !currentRemarks ? 'Arrived Late (لیٹ آمد)' : currentRemarks;

    const updatedMap = {
      ...attendanceMap,
      [studentId]: {
        status,
        remarks: newRemarks,
      },
    };

    setAttendanceMap(updatedMap);

    // If status is 'late', open the Late Options dialog so user can pick exact minutes and reasons
    if (status === 'late') {
      setActiveLateStudent({
        studentId,
        studentName,
        currentRemarks: newRemarks,
      });
    }

    const statusLabel =
      status === 'late'
        ? 'LATE (لیٹ درج ہو گیا ⏱️ اختیارات کھلے ہیں)'
        : status === 'present'
        ? 'PRESENT (حاضر ✅)'
        : status === 'absent'
        ? 'ABSENT (غیر حاضر ❌)'
        : 'LEAVE (رخصت 📝)';

    setInstantNotification(`✓ ${studentName}: Marked as ${statusLabel}`);
    setTimeout(() => {
      setInstantNotification((curr) => (curr?.includes(studentName) ? null : curr));
    }, 3500);

    // Prepare full class map to prevent dropping any student from the register
    const allClassRecords: Record<string, any> = {};
    Object.keys(updatedMap).forEach((id) => {
      const match = students.find((st) => st.studentId === id);
      allClassRecords[id] = {
        studentId: id,
        studentName: match?.fullName || id,
        status: updatedMap[id].status,
        remarks: updatedMap[id].remarks || '',
      };
    });

    try {
      await addOrUpdateSingleStudentAttendance({
        date: selectedDate,
        classGrade: selectedClass,
        studentId,
        studentName,
        status,
        remarks: newRemarks,
        recordedBy: 'Admin Staff',
        allClassRecords,
      });
      loadHistory();
    } catch (err) {
      console.warn('Auto-save attendance error:', err);
    }
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present' }),
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'late') => {
    const updated: Record<string, { status: any; remarks?: string }> = {};
    classStudents.forEach((s) => {
      const currentRemarks = attendanceMap[s.studentId]?.remarks || '';
      updated[s.studentId] = {
        status,
        remarks: status === 'late' && !currentRemarks ? 'Arrived Late' : currentRemarks,
      };
    });
    setAttendanceMap(updated);

    const statusLabel = status === 'late' ? 'LATE' : status === 'absent' ? 'ABSENT' : 'PRESENT';
    setInstantNotification(`All ${classStudents.length} students in ${selectedClass} marked as ${statusLabel}`);
    setTimeout(() => setInstantNotification(null), 3000);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSavedSuccess(null);

    try {
      const recordsToStore: Record<string, any> = {};
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let leaveCount = 0;

      classStudents.forEach((s) => {
        const entry = attendanceMap[s.studentId] || { status: 'present' };
        if (entry.status === 'present') presentCount++;
        else if (entry.status === 'absent') absentCount++;
        else if (entry.status === 'late') lateCount++;
        else if (entry.status === 'leave') leaveCount++;

        recordsToStore[s.studentId] = {
          studentId: s.studentId,
          studentName: s.fullName,
          status: entry.status,
          remarks: entry.remarks || '',
        };
      });

      await saveAttendance({
        date: selectedDate,
        classGrade: selectedClass,
        records: recordsToStore,
        totalStudents: classStudents.length,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        recordedBy: 'Admin Staff',
      });

      setSavedSuccess(`Daily attendance register successfully saved for ${selectedClass} on ${selectedDate}.`);
      await loadHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Submit Modal Add Attendance
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError(null);

    try {
      if (addMode === 'single') {
        let finalStudentId = addStudentId;
        let finalStudentName = addCustomName;

        if (addStudentId && addStudentId !== 'custom') {
          const match = students.find((s) => s.studentId === addStudentId);
          if (match) {
            finalStudentName = match.fullName;
          }
        } else {
          if (!addCustomName.trim()) {
            setAddError('Please enter the student name.');
            setAddSaving(false);
            return;
          }
          finalStudentId = `MANUAL-${Date.now().toString().slice(-4)}`;
        }

        await addOrUpdateSingleStudentAttendance({
          date: addDate,
          classGrade: addClass,
          studentId: finalStudentId,
          studentName: finalStudentName,
          status: addStatus,
          remarks: addRemarks.trim(),
          recordedBy: 'Admin Portal',
        });

        // If currently viewing the same class and date, update live state
        if (addClass === selectedClass && addDate === selectedDate) {
          setAttendanceMap((prev) => ({
            ...prev,
            [finalStudentId]: { status: addStatus, remarks: addRemarks },
          }));
        }

        setSavedSuccess(`Attendance record added for ${finalStudentName} (${addStatus.toUpperCase()}) on ${addDate}.`);
      } else {
        // Bulk register initialization for chosen date and class
        setSelectedDate(addDate);
        setSelectedClass(addClass);
        setSavedSuccess(`Opened attendance register for ${addClass} on ${addDate}. You can now review and save it.`);
      }

      setShowAddModal(false);
      setAddCustomName('');
      setAddRemarks('');
      await loadHistory();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Error adding attendance entry.');
    } finally {
      setAddSaving(false);
    }
  };

  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; date: string; cls: string } | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    setDeletingSession(true);
    try {
      await deleteAttendanceRecord(sessionToDelete.id);
      setHistory((prev) => prev.filter((h) => h.id !== sessionToDelete.id));
      if (selectedDate === sessionToDelete.date && selectedClass === sessionToDelete.cls) {
        await loadCurrentSession();
      }
      setSessionToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingSession(false);
    }
  };

  const handleLoadSession = (date: string, cls: string) => {
    setSelectedDate(date);
    setSelectedClass(cls);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Summaries
  const present = Object.values(attendanceMap).filter((v) => v.status === 'present').length;
  const absent = Object.values(attendanceMap).filter((v) => v.status === 'absent').length;
  const late = Object.values(attendanceMap).filter((v) => v.status === 'late').length;
  const leave = Object.values(attendanceMap).filter((v) => v.status === 'leave').length;

  const filteredHistory = history.filter((h) => {
    const matchSearch =
      h.classGrade.toLowerCase().includes(historySearch.toLowerCase()) ||
      h.date.includes(historySearch);
    return matchSearch;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Top Header with Add Attendance Option */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Classroom Daily Register
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
              Active Session
            </span>
          </div>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Attendance Management & Daily Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark daily attendance, add individual student entries, record check-ins, and track student absences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Requested Feature: + Add Attendance Button */}
          <button
            onClick={() => {
              setAddClass(selectedClass);
              setAddDate(selectedDate);
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 border border-blue-900/60 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ Add Attendance</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || classStudents.length === 0}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Register'}
          </button>
        </div>
      </div>

      {instantNotification && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
            <span>{instantNotification}</span>
          </div>
          <button
            onClick={() => setInstantNotification(null)}
            className="text-white/80 hover:text-white font-bold px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{savedSuccess}</span>
          </div>
          <button
            onClick={() => setSavedSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Class & Date Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Select Class / Batch
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-blue-900 bg-slate-50 focus:bg-white"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Shortcuts & Counts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleMarkAll('present')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition cursor-pointer flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark All Present</span>
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('absent')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 transition cursor-pointer flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Mark All Absent</span>
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('late')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold border border-amber-300 transition cursor-pointer flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Mark All Late</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAddClass(selectedClass);
              setAddDate(selectedDate);
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200 transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Student</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Pills with Interactive Toggle Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            statusFilter === 'all'
              ? 'bg-[#0f2042] text-amber-300 border-blue-900 shadow-md ring-2 ring-blue-900/30'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          }`}
          title="Click to view all students"
        >
          <div>
            <span className="block font-medium text-xs opacity-80">Total Students</span>
            <span className="font-mono font-black text-xl">{classStudents.length}</span>
          </div>
          <Users className="w-7 h-7 opacity-70" />
        </div>
        <div
          onClick={() => setStatusFilter((curr) => (curr === 'present' ? 'all' : 'present'))}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            statusFilter === 'present'
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/40'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-xs hover:border-emerald-300'
          }`}
          title="Click to filter by Present (click again to show all)"
        >
          <div>
            <span className="block font-medium text-xs opacity-80">Present (حاضر)</span>
            <span className="font-mono font-black text-xl">{present}</span>
          </div>
          <UserCheck className="w-7 h-7 text-emerald-400" />
        </div>
        <div
          onClick={() => setStatusFilter((curr) => (curr === 'absent' ? 'all' : 'absent'))}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            statusFilter === 'absent'
              ? 'bg-rose-700 text-white border-rose-800 shadow-md ring-2 ring-rose-500/40'
              : 'bg-rose-50 text-rose-900 border-rose-200 shadow-xs hover:border-rose-300'
          }`}
          title="Click to filter by Absent (click again to show all)"
        >
          <div>
            <span className="block font-medium text-xs opacity-80">Absent (غیر حاضر)</span>
            <span className="font-mono font-black text-xl">{absent}</span>
          </div>
          <UserX className="w-7 h-7 text-rose-400" />
        </div>
        <div
          onClick={() => setStatusFilter((curr) => (curr === 'late' ? 'all' : 'late'))}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            statusFilter === 'late'
              ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400/50'
              : 'bg-amber-50 text-amber-900 border-amber-200 shadow-xs hover:border-amber-300'
          }`}
          title="Click to filter by Late (click again to show all)"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="block font-medium text-xs opacity-90">Late / Leave (لیٹ)</span>
              {statusFilter === 'late' && (
                <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">ACTIVE</span>
              )}
            </div>
            <span className="font-mono font-black text-xl">{late} / {leave}</span>
          </div>
          <Clock className="w-7 h-7 text-amber-500" />
        </div>
      </div>

      {/* Students Attendance Register Sheet */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Register for {selectedClass} — {selectedDate}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Filter List:</span>
            {(['all', 'present', 'absent', 'late', 'leave'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter((curr) => (curr === filter && filter !== 'all' ? 'all' : filter))}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-[#0f2042] text-amber-300 shadow-xs ring-1 ring-blue-900'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter === 'all'
                  ? `All (${classStudents.length})`
                  : filter === 'present'
                  ? `Present (${present})`
                  : filter === 'absent'
                  ? `Absent (${absent})`
                  : filter === 'late'
                  ? `Late (${late})`
                  : `Leave (${leave})`}
              </button>
            ))}
          </div>
        </div>

        {classStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              No active students enrolled in {selectedClass} currently.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAddClass(selectedClass);
                  setAddDate(selectedDate);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-[#0f2042] text-amber-300 rounded-xl text-xs font-bold hover:bg-[#1a365d] transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Student Attendance Manually</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Full Name</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4 text-center">Attendance Status (حاضری درج کریں)</th>
                  <th className="py-3 px-4">Remarks / Late Arrival Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.filter((s) => {
                  if (statusFilter === 'all') return true;
                  const st = attendanceMap[s.studentId]?.status || 'present';
                  return st === statusFilter;
                }).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 px-4 text-center bg-slate-50/70">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            No students marked as &ldquo;{statusFilter.toUpperCase()}&rdquo; yet
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Currently showing filtered view for {selectedClass}. All {classStudents.length} enrolled students are present in the class roster.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStatusFilter('all')}
                          className="px-4 py-2 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 font-bold rounded-xl text-xs transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                        >
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                          <span>Show All Students (تمام {classStudents.length} طلباء دکھائیں)</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  classStudents
                    .filter((s) => {
                      if (statusFilter === 'all') return true;
                      const st = attendanceMap[s.studentId]?.status || 'present';
                      return st === statusFilter;
                    })
                    .map((s) => {
                      const currentEntry = attendanceMap[s.studentId] || { status: 'present', remarks: '' };
                      const currentStatus = currentEntry.status;
                      const isLate = currentStatus === 'late';
                      return (
                        <tr
                          key={s.studentId}
                          className={`transition ${isLate ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/70'}`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-blue-900">
                            {s.studentId}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-slate-900">{s.fullName}</span>
                              {isLate && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  <span>LATE</span>
                                </span>
                              )}
                              {s.balance > 0 ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span>Pending: PKR {s.balance.toLocaleString()}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                                  Fee Paid
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono">
                            {s.guardianPhone || s.phone}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {(['present', 'absent', 'late', 'leave'] as const).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleStatusChange(s.studentId, st)}
                                  title={`Mark as ${st.toUpperCase()}`}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                                    currentStatus === st
                                      ? st === 'present'
                                        ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                                        : st === 'absent'
                                        ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300'
                                        : st === 'late'
                                        ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400'
                                        : 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                                  }`}
                                >
                                  {st === 'present' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  {st === 'absent' && <XCircle className="w-3.5 h-3.5" />}
                                  {st === 'late' && <Clock className="w-3.5 h-3.5 text-slate-950" />}
                                  {st === 'leave' && <Calendar className="w-3.5 h-3.5" />}
                                  <span>{st}</span>
                                </button>
                              ))}

                              {/* Interactive Late Options Launcher */}
                              {isLate && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveLateStudent({
                                      studentId: s.studentId,
                                      studentName: s.fullName,
                                      currentRemarks: currentEntry.remarks,
                                    })
                                  }
                                  className="px-2 py-1 bg-amber-200/90 hover:bg-amber-300 text-amber-950 border border-amber-400 rounded-lg text-[10px] font-black flex items-center gap-1 transition cursor-pointer shadow-xs"
                                  title="Change Late minutes, reason or notes"
                                >
                                  <Clock className="w-3 h-3 text-amber-900" />
                                  <span>Late Options (اختیارات)</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 space-y-1">
                            <input
                              type="text"
                              placeholder={
                                isLate
                                  ? 'e.g. Arrived at 4:20 PM (15 mins late)'
                                  : 'e.g. Regular, informed note...'
                              }
                              value={currentEntry.remarks || ''}
                              onChange={(e) => handleRemarkChange(s.studentId, e.target.value)}
                              className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none transition ${
                                isLate
                                  ? 'border-amber-400 bg-amber-50/70 focus:border-amber-600 font-medium text-amber-950'
                                  : 'border-slate-200 focus:border-blue-500'
                              }`}
                            />
                            {isLate && (
                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                <span className="text-[10px] text-amber-800 font-bold">Quick:</span>
                                {[
                                  '+10m late',
                                  '+15m late',
                                  '+30m late',
                                  'Traffic delay',
                                  'Van late',
                                  'Parent informed'
                                ].map((chip) => (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() => handleRemarkChange(s.studentId, chip)}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition cursor-pointer"
                                  >
                                    {chip}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveLateStudent({
                                      studentId: s.studentId,
                                      studentName: s.fullName,
                                      currentRemarks: currentEntry.remarks,
                                    })
                                  }
                                  className="text-[10px] font-bold text-amber-900 underline hover:text-amber-950 ml-1 cursor-pointer"
                                >
                                  More Options...
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Attendance Sessions History */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Saved Attendance Sessions ({history.length})
            </h3>
            <p className="text-xs text-slate-500">
              All historically recorded daily registers in the academy database.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by class or date..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No attendance sessions matching your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredHistory.slice(0, 10).map((h) => (
              <div key={h.id || `${h.classGrade}_${h.date}`} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 p-2 rounded-xl transition">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{h.classGrade}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-mono font-semibold">
                      {h.date}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Recorded by: {h.recordedBy || 'Admin Staff'} • Total Students: {h.totalStudents || Object.keys(h.records || {}).length}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">
                      {h.presentCount} Present
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-bold">
                      {h.absentCount} Absent
                    </span>
                    {(h.lateCount > 0 || h.leaveCount > 0) && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">
                        {h.lateCount + h.leaveCount} Late/Leave
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      title="Open / Edit this session"
                      onClick={() => handleLoadSession(h.date, h.classGrade)}
                      className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {h.id && (
                      <button
                        type="button"
                        title="Delete this attendance record"
                        onClick={() => setSessionToDelete({ id: h.id!, date: h.date, cls: h.classGrade })}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- ADD ATTENDANCE MODAL (The key missing feature user requested) --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md uppercase">
                    Register Action
                  </span>
                </div>
                <h2 className="text-xl font-black font-serif text-slate-900 mt-1">
                  Add Daily Attendance Record
                </h2>
                <p className="text-xs text-slate-500">
                  نئی حاضری درج کریں — Record student attendance directly into the register.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setAddMode('single')}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
                  addMode === 'single'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Single Student Entry
              </button>
              <button
                type="button"
                onClick={() => setAddMode('bulk')}
                className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
                  addMode === 'bulk'
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Open / Create Date Register
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">
                    Class / Batch
                  </label>
                  <select
                    value={addClass}
                    onChange={(e) => setAddClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-medium"
                  >
                    {classes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">
                    Attendance Date
                  </label>
                  <input
                    type="date"
                    required
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-medium"
                  />
                </div>
              </div>

              {addMode === 'single' && (
                <>
                  <div>
                    <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">
                      Select Student
                    </label>
                    <select
                      value={addStudentId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddStudentId(val);
                        if (val && val !== 'custom') {
                          const s = students.find((st) => st.studentId === val);
                          if (s) setAddCustomName(s.fullName);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-medium"
                    >
                      <option value="">-- Choose from Enrolled Students --</option>
                      {students.map((s) => (
                        <option key={s.studentId} value={s.studentId}>
                          {s.studentId} — {s.fullName} ({s.currentClass}) {s.balance > 0 ? `[⚠️ Pending Fee: PKR ${s.balance.toLocaleString()}]` : `[✅ Fee Paid]`}
                        </option>
                      ))}
                      <option value="custom">+ Other / Walk-in / Enter Name Manually</option>
                    </select>
                    {addStudentId && addStudentId !== 'custom' && (() => {
                      const s = students.find((st) => st.studentId === addStudentId);
                      if (!s) return null;
                      return (
                        <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Pending Fee Balance:</span>
                          {s.balance > 0 ? (
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              ⚠️ PKR {s.balance.toLocaleString()} Pending
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✅ All Fees Cleared
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {(!addStudentId || addStudentId === 'custom') && (
                    <div>
                      <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter student name..."
                        value={addCustomName}
                        onChange={(e) => setAddCustomName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1.5">
                      Attendance Status
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['present', 'absent', 'late', 'leave'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAddStatus(st)}
                          className={`py-2 px-1 rounded-xl text-center text-xs font-bold capitalize transition border ${
                            addStatus === st
                              ? st === 'present'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : st === 'absent'
                                ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                : st === 'late'
                                ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                                : 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">
                      Remarks / Check-in Time (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arrived at 4:10 PM, Sick leave verified by father"
                      value={addRemarks}
                      onChange={(e) => setAddRemarks(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </>
              )}

              {addMode === 'bulk' && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-blue-900 text-xs space-y-2">
                  <p className="font-semibold">
                    This will load the attendance register for <span className="font-bold">{addClass}</span> on <span className="font-bold">{addDate}</span>.
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    All enrolled students in this class will be pre-filled so you can quickly mark Present, Absent, Late or Leave in one convenient screen.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSaving}
                  className="px-5 py-2 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 border border-blue-900 font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>{addSaving ? 'Adding...' : addMode === 'single' ? 'Add Record Now' : 'Open Register'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DEDICATED LATE ATTENDANCE OPTIONS MODAL (لیٹ آمد کے اختیارات) --- */}
      {activeLateStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-amber-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300 shadow-xs shrink-0">
                  <Clock className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                    Late Arrival Options (لیٹ آمد کے اختیارات)
                  </span>
                  <h3 className="font-bold text-base text-slate-900">
                    {activeLateStudent.studentName}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    ID: {activeLateStudent.studentId} • Class: {selectedClass}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveLateStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Common Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Choose Late Arrival Preset (فوری اختیارات منتخب کریں):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { label: '⏱️ 10 Mins Late (10 منٹ تاخیر)', val: '10 Mins Late (Traffic Delay)' },
                  { label: '⏱️ 15 Mins Late (15 منٹ تاخیر)', val: '15 Mins Late (Van Delay)' },
                  { label: '⏱️ 30 Mins Late (30 منٹ تاخیر)', val: '30 Mins Late' },
                  { label: '⏱️ 45 Mins Late (45 منٹ تاخیر)', val: '45 Mins Late' },
                  { label: '🚐 Van / Transport Delay (وین لیٹ)', val: 'Academy Van / Transport Delay' },
                  { label: '📞 Parent Informed (والدین کی اطلاع)', val: 'Informed by Parent in Advance' },
                  { label: '🩺 Medical / Doctor (ڈاکٹر معائنہ)', val: 'Medical Appointment / Clinic' },
                  { label: '🌧️ Bad Weather (بارش کی تاخیر)', val: 'Delayed due to Rain / Bad Weather' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      handleRemarkChange(activeLateStudent.studentId, item.val);
                      setActiveLateStudent((prev) => (prev ? { ...prev, currentRemarks: item.val } : null));
                      handleStatusChange(activeLateStudent.studentId, 'late');
                    }}
                    className={`p-2.5 rounded-xl border text-left font-medium transition cursor-pointer flex flex-col gap-0.5 ${
                      (attendanceMap[activeLateStudent.studentId]?.remarks || '') === item.val
                        ? 'bg-amber-100 border-amber-500 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Remarks input */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-800">
                Custom Late Remark / Entry Time (اپنی مرضی کا وقت یا نوٹ لکھیں):
              </label>
              <input
                type="text"
                placeholder="e.g. Arrived at 4:35 PM, Traffic issue at Chowk Bahadur"
                value={attendanceMap[activeLateStudent.studentId]?.remarks || ''}
                onChange={(e) => {
                  handleRemarkChange(activeLateStudent.studentId, e.target.value);
                  setActiveLateStudent((prev) => (prev ? { ...prev, currentRemarks: e.target.value } : null));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  handleStatusChange(activeLateStudent.studentId, 'present');
                  setActiveLateStudent(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 cursor-pointer"
              >
                ← Change to Present
              </button>

              <button
                type="button"
                onClick={() => {
                  const sId = activeLateStudent.studentId;
                  setActiveLateStudent(null);
                  handleStatusChange(sId, 'late');
                  setInstantNotification(`✓ ${activeLateStudent.studentName}: Late record saved with remarks.`);
                  setTimeout(() => setInstantNotification(null), 3000);
                }}
                className="px-5 py-2.5 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 border border-blue-900 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Confirm & Done (محفوظ کریں)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Session Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Attendance Session?</h3>
                <p className="text-xs text-slate-500">{sessionToDelete.cls} • {sessionToDelete.date}</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to permanently delete attendance for <strong>{sessionToDelete.cls}</strong> on <strong>{sessionToDelete.date}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                disabled={deletingSession}
                className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingSession}
                onClick={confirmDeleteSession}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {deletingSession ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
