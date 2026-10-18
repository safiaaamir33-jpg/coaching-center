import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  Percent,
  FileSpreadsheet
} from 'lucide-react';
import { Exam, Result, Student } from '../../types';
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
  saveStudentResult,
  getResultsByExam
} from '../../services/examService';
import { getAllStudents } from '../../services/studentService';

export const ExamManager: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam Create Modal
  const [showExamModal, setShowExamModal] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<Exam['examType']>('monthly_test');
  const [classGrade, setClassGrade] = useState('Class 9');
  const [subject, setSubject] = useState('Physics');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [savingExam, setSavingExam] = useState(false);

  // Grade Entry Modal
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examResults, setExamResults] = useState<Result[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [marksSuccess, setMarksSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [exList, stList] = await Promise.all([
        getAllExams(),
        getAllStudents(),
      ]);
      setExams(exList || []);
      setStudents(stList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !totalMarks) return;

    setSavingExam(true);
    try {
      await createExam({
        title: examTitle.trim(),
        examType,
        classGrade,
        subject: subject.trim(),
        date: examDate,
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        isPublished: true,
      });
      setShowExamModal(false);
      setExamTitle('');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingExam(false);
    }
  };

  const handleOpenMarksEntry = async (exam: Exam) => {
    setSelectedExam(exam);
    setMarksSuccess(false);
    try {
      if (exam.id) {
        const existingResults = await getResultsByExam(exam.id);
        setExamResults(existingResults);
        const mMap: Record<string, number> = {};
        const rMap: Record<string, string> = {};
        existingResults.forEach((r) => {
          mMap[r.studentId] = r.marksObtained;
          rMap[r.studentId] = r.remarks || '';
        });
        setMarksMap(mMap);
        setRemarksMap(rMap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExam || !selectedExam.id) return;
    setSavingMarks(true);
    setMarksSuccess(false);

    try {
      const examStudents = students.filter(
        (s) => s.currentClass === selectedExam.classGrade
      );

      for (const st of examStudents) {
        const marks = marksMap[st.studentId];
        if (marks !== undefined && marks !== null) {
          await saveStudentResult({
            examId: selectedExam.id,
            examTitle: selectedExam.title,
            studentId: st.studentId,
            studentName: st.fullName,
            fatherName: st.fatherName,
            classGrade: selectedExam.classGrade,
            marksObtained: Number(marks),
            totalMarks: selectedExam.totalMarks,
            remarks: remarksMap[st.studentId] || '',
            isPublished: selectedExam.isPublished,
            announcedAt: new Date().toISOString(),
          });
        }
      }

      setMarksSuccess(true);
      const updated = await getResultsByExam(selectedExam.id);
      setExamResults(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMarks(false);
    }
  };

  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState(false);

  const confirmDeleteExam = async () => {
    if (!examToDelete?.id) return;
    const target = examToDelete;
    setDeletingExam(true);
    try {
      setExams((prev) => prev.filter((e) => e.id !== target.id && e.title !== target.title));
      await deleteExam(target.id);
      setExamToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingExam(false);
    }
  };

  const examEligibleStudents = selectedExam
    ? students.filter((s) => s.currentClass === selectedExam.classGrade)
    : [];

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Academic Assessments
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Exam & Result Management
          </h1>
          <p className="text-xs text-slate-500">
            Define test sessions, enter subject marks, auto-compute grades, and manage student marksheets.
          </p>
        </div>

        <button
          onClick={() => setShowExamModal(true)}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Exam
        </button>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Exam Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Class & Subject</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total Marks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading exams...
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No examination records found. Click above to create one.
                  </td>
                </tr>
              ) : (
                exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {ex.title}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-slate-700">
                      {ex.examType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{ex.classGrade}</div>
                      <div className="text-[11px] text-slate-400">{ex.subject || 'All Subjects'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{ex.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {ex.totalMarks} Marks
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenMarksEntry(ex)}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition"
                        >
                          Enter Student Marks
                        </button>
                        <button
                          onClick={() => setExamToDelete(ex)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Create Examination / Assessment</h3>
              <button onClick={() => setShowExamModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. October Grand Monthly Physics Test"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Type</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="monthly_test">Monthly Assessment</option>
                  <option value="mock_exam">Board Mock Exam</option>
                  <option value="midterm">Midterm Examination</option>
                  <option value="final">Final Term Examination</option>
                  <option value="weekly_quiz">Weekly Chapter Quiz</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class *</label>
                <input
                  type="text"
                  required
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  placeholder="e.g. Class 9, Class 10, F.Sc Pre-Med"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics, Chemistry, Mathematics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Marks *</label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExam}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold"
                >
                  {savingExam ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Marks Entry Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                  Marks Entry Register
                </span>
                <h3 className="font-bold text-xl text-slate-900">{selectedExam.title}</h3>
                <p className="text-xs text-slate-500">
                  {selectedExam.classGrade} • Total Marks: {selectedExam.totalMarks}
                </p>
              </div>
              <button onClick={() => setSelectedExam(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {marksSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Student results calculated and saved successfully!</span>
              </div>
            )}

            {examEligibleStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No active students found in {selectedExam.classGrade}.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Student Roll & Name</th>
                        <th className="py-2.5 px-4">Marks Obtained (Max: {selectedExam.totalMarks})</th>
                        <th className="py-2.5 px-4">Calculated % & Grade</th>
                        <th className="py-2.5 px-4">Teacher Feedback Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {examEligibleStudents.map((s) => {
                        const score = marksMap[s.studentId];
                        const pct = score !== undefined ? Math.round((score / selectedExam.totalMarks) * 100) : null;
                        let grade = '—';
                        if (pct !== null) {
                          if (pct >= 80) grade = 'A+';
                          else if (pct >= 70) grade = 'A';
                          else if (pct >= 60) grade = 'B';
                          else if (pct >= 50) grade = 'C';
                          else if (pct >= 40) grade = 'D';
                          else grade = 'F';
                        }

                        return (
                          <tr key={s.studentId}>
                            <td className="py-2.5 px-4">
                              <div className="font-bold text-slate-900">{s.fullName}</div>
                              <div className="font-mono text-[10px] text-blue-700">{s.studentId}</div>
                            </td>
                            <td className="py-2.5 px-4">
                              <input
                                type="number"
                                min={0}
                                max={selectedExam.totalMarks}
                                value={score ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? '' : Number(e.target.value);
                                  setMarksMap((prev) => ({ ...prev, [s.studentId]: val as any }));
                                }}
                                placeholder="0"
                                className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-sm text-center"
                              />
                            </td>
                            <td className="py-2.5 px-4 font-mono">
                              {pct !== null ? (
                                <span className="font-bold text-blue-800">
                                  {pct}% ({grade})
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-4">
                              <input
                                type="text"
                                value={remarksMap[s.studentId] || ''}
                                onChange={(e) =>
                                  setRemarksMap((prev) => ({ ...prev, [s.studentId]: e.target.value }))
                                }
                                placeholder="e.g. Good concept, practice numericals"
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedExam(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMarks}
                    disabled={savingMarks}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    {savingMarks ? 'Calculating & Saving...' : 'Save & Publish Results'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Delete Exam Modal */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Exam?</h3>
                <p className="text-xs text-slate-500">Remove examination and test paper entry.</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete <strong>{examToDelete.title}</strong> ({examToDelete.classGrade})?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingExam}
                onClick={confirmDeleteExam}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-xs font-semibold"
              >
                {deletingExam ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
