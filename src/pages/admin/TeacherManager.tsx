import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Upload
} from 'lucide-react';
import { Teacher, TeacherSalary } from '../../types';
import {
  getAllTeachersAdmin,
  addTeacher,
  updateTeacher,
  deleteTeacher
} from '../../services/teacherService';
import {
  getAllSalaryPayments,
  recordSalaryPayment
} from '../../services/salaryService';
import { uploadImageOrFile } from '../../services/storageService';

export const TeacherManager: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [salaries, setSalaries] = useState<TeacherSalary[]>([]);
  const [loading, setLoading] = useState(true);

  // Teacher Modal
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Salary Payout Modal
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedTeacherForSalary, setSelectedTeacherForSalary] = useState<Teacher | null>(null);
  const [salaryMonth, setSalaryMonth] = useState('October 2026');
  const [salaryAmount, setSalaryAmount] = useState(50000);
  const [salaryMethod, setSalaryMethod] = useState<TeacherSalary['paymentMethod']>('bank_transfer');
  const [salaryRef, setSalaryRef] = useState('');
  const [salaryRemarks, setSalaryRemarks] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('');
  const [classesStr, setClassesStr] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [salaryMonthly, setSalaryMonthly] = useState(50000);
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [status, setStatus] = useState<Teacher['status']>('active');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tList, sList] = await Promise.all([
        getAllTeachersAdmin(),
        getAllSalaryPayments().catch(() => []),
      ]);
      setTeachers(tList || []);
      setSalaries(sList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setError(null);
    setEditingTeacher(null);
    setName('');
    setQualification('');
    setExperience('5+ Years Experience');
    setSubjectsStr('Physics, Mathematics');
    setClassesStr('Class 9, Class 10, F.Sc');
    setPhone('');
    setEmail('');
    setSalaryMonthly(55000);
    setBio('');
    setPhotoUrl('/academy_logo.jpg');
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsPublished(true);
    setStatus('active');
    setShowTeacherModal(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setError(null);
    setEditingTeacher(t);
    setName(t.name);
    setQualification(t.qualification);
    setExperience(t.experience);
    setSubjectsStr(t.subjects?.join(', ') || '');
    setClassesStr(t.classes?.join(', ') || '');
    setPhone(t.phone || '');
    setEmail(t.email || '');
    setSalaryMonthly(t.salaryMonthly || 50000);
    setBio(t.bio);
    setPhotoUrl(t.photoUrl || '/academy_logo.jpg');
    setPhotoFile(null);
    setPhotoPreview(t.photoUrl || null);
    setIsPublished(t.isPublished);
    setStatus(t.status);
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !qualification.trim()) {
      setError('Teacher name and qualification are required.');
      return;
    }

    setSaving(true);
    try {
      let finalPhoto = photoUrl.trim() || '/academy_logo.jpg';
      if (photoFile) {
        finalPhoto = await uploadImageOrFile(photoFile, 'teachers');
      }

      const subjects = subjectsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const classes = classesStr.split(',').map((c) => c.trim()).filter(Boolean);

      const payload = {
        name: name.trim(),
        qualification: qualification.trim(),
        experience: experience.trim(),
        subjects,
        classes,
        phone: phone.trim(),
        email: email.trim(),
        salaryMonthly: Number(salaryMonthly),
        bio: bio.trim(),
        photoUrl: finalPhoto,
        isPublished,
        status,
      };

      if (editingTeacher && editingTeacher.id) {
        await updateTeacher(editingTeacher.id, payload);
      } else {
        await addTeacher({
          ...payload,
          joiningDate: new Date().toISOString().split('T')[0],
        });
      }

      setShowTeacherModal(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving teacher profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSalaryPayout = (t: Teacher) => {
    setSelectedTeacherForSalary(t);
    setSalaryAmount(t.salaryMonthly || 50000);
    setSalaryRef('');
    setSalaryRemarks('');
    setShowSalaryModal(true);
  };

  const handleRecordSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForSalary) return;

    setSaving(true);
    try {
      await recordSalaryPayment({
        teacherId: selectedTeacherForSalary.id || selectedTeacherForSalary.name,
        teacherName: selectedTeacherForSalary.name,
        month: salaryMonth,
        amount: Number(salaryAmount),
        paymentMethod: salaryMethod,
        reference: salaryRef.trim(),
        remarks: salaryRemarks.trim(),
        paidBy: 'Principal / Admin',
        paidAt: new Date().toISOString(),
      });
      setShowSalaryModal(false);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState(false);

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete?.id) return;
    const target = teacherToDelete;
    setDeletingTeacher(true);
    try {
      setTeachers((prev) => prev.filter((t) => t.id !== target.id && t.name !== target.name));
      await deleteTeacher(target.id);
      setTeacherToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingTeacher(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Faculty & Staff
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Teacher & Payroll Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage teacher profiles, subject assignments, salary packages, and monthly disbursements.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Member
        </button>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Instructor Name</th>
                <th className="py-3 px-4">Qualification</th>
                <th className="py-3 px-4">Subjects & Classes</th>
                <th className="py-3 px-4">Private Contact</th>
                <th className="py-3 px-4">Monthly Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Website</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading faculty...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No faculty records found.
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                      <div className="text-[10px] text-slate-400">{t.experience}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{t.qualification}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {t.subjects?.join(', ')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{t.phone || '—'}</div>
                      <div className="text-[10px] text-slate-400">{t.email || ''}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      PKR {t.salaryMonthly?.toLocaleString() || '0'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.isPublished
                            ? 'bg-[#0f2042] text-amber-300 border border-blue-900/50'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {t.isPublished ? 'Public' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenSalaryPayout(t)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          title="Pay Salary"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Disburse Salary
                        </button>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTeacherToDelete(t)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove Teacher"
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

      {/* Salary History */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
        <h3 className="font-bold text-base text-slate-900 border-b pb-3">
          Recent Salary Disbursements ({salaries.length})
        </h3>
        {salaries.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No salary records logged yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {salaries.slice(0, 5).map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{s.teacherName}</span>
                  <span className="text-slate-500 ml-2">({s.month})</span>
                  <div className="text-[10px] text-slate-400">
                    Paid via {s.paymentMethod.replace('_', ' ')} • Date: {new Date(s.paidAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-emerald-800 text-sm">
                  PKR {s.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Form Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingTeacher ? `Edit Faculty Profile (${name})` : 'Add Faculty Member'}
              </h3>
              <button onClick={() => setShowTeacherModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prof. Naveed Ahmad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualifications *</label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. M.Phil Physics (IUB)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 10+ Years Board Prep"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subjects (Comma Separated)</label>
                  <input
                    type="text"
                    value={subjectsStr}
                    onChange={(e) => setSubjectsStr(e.target.value)}
                    placeholder="Physics, Chemistry, Biology"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Classes Assigned</label>
                  <input
                    type="text"
                    value={classesStr}
                    onChange={(e) => setClassesStr(e.target.value)}
                    placeholder="Class 9, Class 10, F.Sc Part 1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Salary Package (PKR)</label>
                  <input
                    type="number"
                    value={salaryMonthly}
                    onChange={(e) => setSalaryMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Private Mobile Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Private Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@brightfuture.pk"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-700">
                      Teacher Profile Photo (تصویر اپلوڈ کریں - اختیاری)
                    </label>
                    {photoFile && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        ✓ Selected: {photoFile.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={photoPreview || photoUrl || '/academy_logo.jpg'}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl cursor-pointer text-xs font-semibold text-slate-700 transition">
                      <Upload className="w-4 h-4 text-blue-700" />
                      <span>Choose Photo from Device (موبائل یا کمپیوٹر سے منتخب کریں)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setPhotoFile(file);
                          if (file) {
                            setPhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {(photoPreview || photoFile) && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                          setPhotoUrl('/academy_logo.jpg');
                        }}
                        className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    تصویر منتخب کرنا اختیاری ہے۔ کسی بیرونی URL کی ضرورت نہیں ہے۔
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Public Bio / Introduction</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief background, achievements, and teaching style..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">Display on Public Faculty Directory</span>
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : editingTeacher ? 'Update Profile' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Disbursement Modal */}
      {showSalaryModal && selectedTeacherForSalary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700">Salary Disbursement</span>
                <h3 className="font-bold text-base text-slate-900">{selectedTeacherForSalary.name}</h3>
              </div>
              <button onClick={() => setShowSalaryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSalary} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Salary Month *</label>
                <input
                  type="text"
                  required
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Disburse (PKR) *</label>
                <input
                  type="number"
                  required
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={salaryMethod}
                  onChange={(e) => setSalaryMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                >
                  <option value="bank_transfer">Direct Bank Transfer</option>
                  <option value="cash">Cash in Hand</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="cheque">Crossed Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Slip #</label>
                <input
                  type="text"
                  value={salaryRef}
                  onChange={(e) => setSalaryRef(e.target.value)}
                  placeholder="e.g. TRX-123456"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={salaryRemarks}
                  onChange={(e) => setSalaryRemarks(e.target.value)}
                  placeholder="e.g. Cleared for October 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  {saving ? 'Processing...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Teacher Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Remove Teacher?</h3>
                <p className="text-xs text-slate-500">Remove faculty profile from academy directory.</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to remove <strong>{teacherToDelete.name}</strong> ({teacherToDelete.qualification})?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingTeacher}
                onClick={confirmDeleteTeacher}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-xs font-semibold"
              >
                {deletingTeacher ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
