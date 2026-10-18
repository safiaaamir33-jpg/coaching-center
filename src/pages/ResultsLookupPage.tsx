import React, { useState, useEffect } from 'react';
import {
  Search,
  Award,
  AlertCircle,
  Printer,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Percent
} from 'lucide-react';
import { Exam, Result } from '../types';
import { getAllExams, lookupStudentResult } from '../services/examService';
import { useAcademy } from '../context/AcademyContext';

export const ResultsLookupPage: React.FC = () => {
  const { settings } = useAcademy();
  const [exams, setExams] = useState<Exam[]>([]);
  const [studentId, setStudentId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllExams()
      .then((data) => {
        setExams(data);
        if (data.length > 0) {
          setSelectedExamId(data[0].id || '');
        }
      })
      .catch(console.error);
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = studentId.trim().toUpperCase();
    if (!cleanId || !selectedExamId) {
      setError('Please enter your Student Roll Number and select an Examination.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const found = await lookupStudentResult(cleanId, selectedExamId);
      if (!found) {
        setError(`No result found for Student ID "${cleanId}" in the selected examination. Please verify your ID or contact administration.`);
      } else {
        setResult(found);
      }
    } catch (err: unknown) {
      console.error('Result lookup error:', err);
      setError(err instanceof Error ? err.message : 'Error fetching examination marksheet.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'B':
        return 'bg-[#0f2042] text-amber-300 border border-blue-900/60';
      case 'C':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold tracking-wide border border-blue-700/50">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Performance & Marksheets</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
            Student Results Portal
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Securely verify weekly test and board mock assessment results using your individual Student ID.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-8">
        {/* Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Examination / Test Session *
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {exams.length === 0 ? (
                    <option value="">No published exams available</option>
                  ) : (
                    exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title} ({ex.classGrade})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Roll / Registration ID *
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  placeholder="e.g. BFA-2026-001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Retrieving Marksheet...' : 'Find Student Marksheet'}
            </button>
          </form>
        </div>

        {/* Marksheet Display */}
        {result && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-slate-300 space-y-6 print:m-0 print:border-none animate-in fade-in zoom-in-95">
            {/* Marksheet Header */}
            <div className="text-center border-b pb-4 space-y-1">
              <span className="text-xs font-serif font-black uppercase text-blue-900 tracking-wider">
                {settings.academyName}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                Official Student Assessment Marksheet
              </h2>
              <p className="text-xs text-slate-500">
                {result.examTitle} • {result.classGrade}
              </p>
            </div>

            {/* Student Meta */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Student Name:</span>
                <strong className="text-slate-900 text-base">{result.studentName}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-xs">Student ID / Roll No:</span>
                <strong className="font-mono text-base text-blue-900">{result.studentId}</strong>
              </div>
            </div>

            {/* Marks Breakdown Table */}
            <div className="overflow-hidden border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Evaluation Metric</th>
                    <th className="py-3 px-4 font-semibold text-center">Score Recorded</th>
                    <th className="py-3 px-4 font-semibold text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-700">Marks Obtained</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 font-mono text-base">
                      {result.marksObtained}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">Out of {result.totalMarks}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-700">Aggregate Percentage</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700 font-mono text-base">
                      {result.percentage}%
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">Standard Scale</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-700">Assigned Grade</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-3 py-0.5 rounded-full font-black text-sm border ${getGradeColor(result.grade)}`}>
                        Grade {result.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-medium">
                      {result.grade === 'A+' || result.grade === 'A' ? 'Excellent Performance' : 'Satisfactory'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {result.remarks && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#070f1e] to-[#0f2042] border border-blue-900/60 text-xs text-white space-y-1 shadow-md">
                <strong className="text-amber-400">Instructor Performance Feedback:</strong>
                <p className="text-slate-200">{result.remarks}</p>
              </div>
            )}

            {/* Signature row */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-500">
              <div>
                <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                <span>Class Incharge Signature</span>
              </div>
              <div>
                <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                <span>Principal Stamp</span>
              </div>
            </div>

            <div className="print:hidden pt-2 flex gap-3">
              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                Print Student Marksheet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
