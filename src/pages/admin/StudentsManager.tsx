import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  CreditCard,
  AlertCircle,
  FileText,
  Camera,
  Upload
} from 'lucide-react';
import { Student, FeePayment } from '../../types';
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  generateNextStudentId
} from '../../services/studentService';
import { getPaymentsByStudent } from '../../services/feeService';
import { uploadImageOrFile } from '../../services/storageService';

export const StudentsManager: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(searchParams.get('action') === 'new');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [studentPayments, setStudentPayments] = useState<FeePayment[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form fields
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phone, setPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentClass, setCurrentClass] = useState('Class 9');
  const [monthlyFee, setMonthlyFee] = useState(3500);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<Student['status']>('active');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = async () => {
    setError(null);
    setEditingStudent(null);
    const nextId = await generateNextStudentId();
    setStudentId(nextId);
    setFullName('');
    setFatherName('');
    setDob('');
    setGender('male');
    setPhone('');
    setGuardianPhone('');
    setAddress('');
    setCurrentClass('Class 9');
    setMonthlyFee(3500);
    setDiscount(0);
    setStatus('active');
    setPhotoUrl('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (s: Student) => {
    setError(null);
    setEditingStudent(s);
    setStudentId(s.studentId);
    setFullName(s.fullName);
    setFatherName(s.fatherName);
    setDob(s.dob || '');
    setGender(s.gender || 'male');
    setPhone(s.phone);
    setGuardianPhone(s.guardianPhone);
    setAddress(s.address);
    setCurrentClass(s.currentClass);
    setMonthlyFee(s.monthlyFee || 0);
    setDiscount(s.discount || 0);
    setStatus(s.status);
    setPhotoUrl(s.photoUrl || '');
    setPhotoFile(null);
    setPhotoPreview(s.photoUrl || null);
    setNotes(s.notes || '');
    setShowModal(true);
  };

  const handleOpenView = async (s: Student) => {
    setViewingStudent(s);
    try {
      const history = await getPaymentsByStudent(s.studentId);
      setStudentPayments(history);
    } catch {
      setStudentPayments([]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !fatherName.trim() || !phone.trim()) {
      setError('Student name, father name, and contact are required.');
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUrl = photoUrl;
      if (photoFile) {
        finalPhotoUrl = await uploadImageOrFile(photoFile, 'students');
      }

      if (editingStudent && editingStudent.id) {
        await updateStudent(editingStudent.studentId, {
          fullName,
          fatherName,
          dob,
          gender,
          phone,
          guardianPhone,
          address,
          currentClass,
          monthlyFee: Number(monthlyFee),
          discount: Number(discount),
          status,
          photoUrl: finalPhotoUrl,
          notes,
        });
      } else {
        await createStudent({
          studentId,
          fullName,
          fatherName,
          dob,
          gender,
          phone,
          guardianPhone,
          address,
          currentClass,
          enrolledCourses: [currentClass],
          status,
          monthlyFee: Number(monthlyFee),
          discount: Number(discount),
          totalPaid: 0,
          balance: Math.max(0, Number(monthlyFee) - Number(discount)),
          enrollmentDate: new Date().toISOString().split('T')[0],
          photoUrl: finalPhotoUrl,
          notes,
        });
      }
      setShowModal(false);
      await loadStudents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving student record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setStudents((prev) => prev.filter((s) => s.studentId !== id && s.id !== id));
      await deleteStudent(id);
      setDeleteConfirmId(null);
      await loadStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingStudentsCount = students.filter((s) => (s.balance || 0) > 0).length;
  const totalPendingAmount = students.reduce((sum, s) => sum + (s.balance || 0), 0);

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.fatherName.toLowerCase().includes(search.toLowerCase());

    const matchClass = selectedClass === 'All' || s.currentClass === selectedClass;
    const matchPending = !filterPendingOnly || (s.balance || 0) > 0;
    return matchSearch && matchClass && matchPending;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Student Records & Fee Balances
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Student Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage enrolled students, track each child's pending fee balance, and view attendance.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Quick Filter Tabs for All vs Pending Fees */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterPendingOnly(false)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            !filterPendingOnly
              ? 'bg-[#0f2042] text-amber-300 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Students ({students.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterPendingOnly(true)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            filterPendingOnly
              ? 'bg-rose-700 text-white shadow-sm'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>Students with Pending Fees ({pendingStudentsCount}) — PKR {totalPendingAmount.toLocaleString()}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID (e.g. BFA-2026-001), father's name, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
        >
          <option value="All">All Classes</option>
          <option value="Class 9">Class 9</option>
          <option value="Class 10">Class 10</option>
          <option value="Class 11 (F.Sc Pre-Medical)">Class 11 (F.Sc Pre-Med)</option>
          <option value="Class 11 (F.Sc Pre-Engineering)">Class 11 (F.Sc Pre-Engg)</option>
          <option value="Class 11 (ICS)">Class 11 (ICS)</option>
          <option value="Class 12 (F.Sc Pre-Medical)">Class 12 (F.Sc Pre-Med)</option>
          <option value="Class 12 (F.Sc Pre-Engineering)">Class 12 (F.Sc Pre-Engg)</option>
          <option value="Spoken English">Spoken English</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Full Name & Father</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Monthly Fee</th>
                <th className="py-3 px-4">Fee Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No students found. Enroll a new student to get started.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.studentId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {s.studentId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{s.fullName}</span>
                        {s.balance > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Pending: PKR {s.balance.toLocaleString()}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Paid</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">S/D/O {s.fatherName}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {s.currentClass}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{s.phone}</div>
                      <div className="text-[10px] text-slate-400">G: {s.guardianPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      PKR {s.monthlyFee?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {s.balance > 0 ? (
                        <span className="text-rose-700">PKR {s.balance.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-700">Cleared</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(s)}
                          className="p-1.5 text-[#0f2042] hover:bg-slate-100 rounded-lg transition"
                          title="View Profile & Payments"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(s.studentId)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Archive / Remove"
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

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingStudent ? `Edit Student (${studentId})` : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ali Raza"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Ghulam Muhammad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class / Program *</label>
                  <input
                    type="text"
                    required
                    value={currentClass}
                    onChange={(e) => setCurrentClass(e.target.value)}
                    placeholder="e.g. Class 9, Class 10, F.Sc Pre-Med"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guardian Phone *</label>
                  <input
                    type="text"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="0301-7654321"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Tuition Fee (PKR)</label>
                  <input
                    type="number"
                    required
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Concession/Discount (PKR)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Address in Sadiqabad</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Colony, street or village..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enrollment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="active">Active</option>
                    <option value="graduated">Graduated</option>
                    <option value="suspended">Suspended</option>
                    <option value="left">Left</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reference, sibling concession, etc."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : editingStudent ? 'Update Student' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Profile & Payment History Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-xl text-slate-900">{viewingStudent.fullName}</h3>
                  {viewingStudent.balance > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Pending Fee: PKR {viewingStudent.balance.toLocaleString()}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Fee Cleared (No Dues)
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{viewingStudent.studentId}</p>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Father / Guardian:</span>
                <strong>{viewingStudent.fatherName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Enrolled Class:</span>
                <strong>{viewingStudent.currentClass}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Phone:</span>
                <span>{viewingStudent.phone} (G: {viewingStudent.guardianPhone})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Address:</span>
                <span>{viewingStudent.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Monthly Fee:</span>
                <span className="font-mono font-bold">PKR {viewingStudent.monthlyFee?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Current Outstanding Balance:</span>
                <span className="font-mono font-bold text-rose-700">PKR {viewingStudent.balance?.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment history list */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Payment & Voucher History</h4>
              {studentPayments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl">
                  No payment vouchers recorded yet for this student.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {studentPayments.map((p) => (
                    <div key={p.paymentId} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">
                          {p.feeMonth} ({p.paymentType})
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Receipt #{p.receiptNumber} • {new Date(p.paidAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono text-emerald-700">
                          PKR {p.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          {p.paymentMethod}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900">Archive Student Record?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete student <strong>{deleteConfirmId}</strong>? Note that financial voucher records should be preserved for auditing.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
