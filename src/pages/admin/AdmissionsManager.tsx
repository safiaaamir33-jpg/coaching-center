import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Eye,
  X,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Plus,
  Camera,
  Upload,
  User,
  Trash2
} from 'lucide-react';
import { AdmissionApplication } from '../../types';
import {
  getAllAdmissions,
  updateAdmissionStatus,
  convertAdmissionToStudent,
  submitAdmissionApplication,
  deleteAdmission
} from '../../services/admissionService';
import { uploadImageOrFile } from '../../services/storageService';

export const AdmissionsManager: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightRef = searchParams.get('highlight') || '';

  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(highlightRef);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('all');

  // Add New Admission Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFullName, setAddFullName] = useState('');
  const [addFatherName, setAddFatherName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addGuardianPhone, setAddGuardianPhone] = useState('');
  const [addClass, setAddClass] = useState('Class 9');
  const [addGender, setAddGender] = useState<'male' | 'female' | 'other'>('male');
  const [addDob, setAddDob] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [addPreviousSchool, setAddPreviousSchool] = useState('');
  const [addPreviousEducation, setAddPreviousEducation] = useState('');
  const [addPhotoFile, setAddPhotoFile] = useState<File | null>(null);
  const [addPhotoPreview, setAddPhotoPreview] = useState<string | null>(null);
  const [addAutoEnroll, setAddAutoEnroll] = useState(true);
  const [addMonthlyFee, setAddMonthlyFee] = useState(3500);
  const [addNotes, setAddNotes] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Detail Modal
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAdmissions();
  }, []);

  const loadAdmissions = async () => {
    try {
      const data = await getAllAdmissions();
      setAdmissions(data);
      if (highlightRef) {
        const found = data.find((a) => a.applicationRef === highlightRef);
        if (found) {
          handleOpenApp(found);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [admissionToDelete, setAdmissionToDelete] = useState<AdmissionApplication | null>(null);
  const [deletingAdmission, setDeletingAdmission] = useState(false);

  const confirmDeleteAdmission = async () => {
    if (!admissionToDelete) return;
    const target = admissionToDelete;
    setDeletingAdmission(true);
    try {
      setAdmissions((prev) => prev.filter((a) => a.applicationRef !== target.applicationRef && a.id !== target.id));
      await deleteAdmission(target.applicationRef);
      if (selectedApp?.applicationRef === target.applicationRef) {
        setSelectedApp(null);
      }
      setAdmissionToDelete(null);
      setFeedbackMsg(`✓ Admission Application #${target.applicationRef} deleted successfully.`);
      await loadAdmissions();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingAdmission(false);
    }
  };

  const handleOpenApp = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setReviewerNotes(app.reviewerNotes || '');
    setFeedbackMsg(null);
  };

  const handleUpdateStatus = async (status: AdmissionApplication['status']) => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await updateAdmissionStatus(selectedApp.applicationRef, status, reviewerNotes);
      setFeedbackMsg(`Application marked as "${status}".`);
      await loadAdmissions();
      setSelectedApp((prev) => (prev ? { ...prev, status, reviewerNotes } : null));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToStudent = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const assignedId = await convertAdmissionToStudent(selectedApp);
      setFeedbackMsg(`Success! Applicant enrolled as official student with ID: ${assignedId}`);
      await loadAdmissions();
      setSelectedApp((prev) =>
        prev ? { ...prev, status: 'approved', studentId: assignedId } : null
      );
    } catch (err: unknown) {
      setFeedbackMsg(err instanceof Error ? err.message : 'Error converting to student.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFullName.trim() || !addFatherName.trim() || !addPhone.trim()) {
      setAddError('Student full name, father name, and contact phone are required.');
      return;
    }

    setAddSaving(true);
    setAddError(null);

    try {
      let photoUrl: string | undefined;
      if (addPhotoFile) {
        photoUrl = await uploadImageOrFile(addPhotoFile, 'students');
      }

      const ref = await submitAdmissionApplication({
        fullName: addFullName.trim(),
        fatherName: addFatherName.trim(),
        dob: addDob || '',
        gender: addGender,
        phone: addPhone.trim(),
        guardianPhone: (addGuardianPhone || addPhone).trim(),
        address: addAddress.trim() || 'Sadiqabad',
        requestedClass: addClass,
        previousEducation: addPreviousEducation.trim() || '',
        previousSchool: addPreviousSchool.trim() || '',
        photoUrl: photoUrl || '',
        consent: true,
        message: addNotes.trim() || 'Registered via Admin Portal',
      });

      if (addAutoEnroll) {
        // Automatically convert to enrolled student right away with the photo
        const createdApp: AdmissionApplication = {
          applicationRef: ref,
          fullName: addFullName.trim(),
          fatherName: addFatherName.trim(),
          dob: addDob || undefined,
          gender: addGender,
          phone: addPhone.trim(),
          guardianPhone: (addGuardianPhone || addPhone).trim(),
          address: addAddress.trim() || 'Sadiqabad',
          requestedClass: addClass,
          photoUrl,
          consent: true,
          status: 'approved',
          submittedAt: new Date().toISOString(),
        };
        const stId = await convertAdmissionToStudent(createdApp, Number(addMonthlyFee), 1000);
        setFeedbackMsg(`✓ Success! Student registered with photo and enrolled with ID: ${stId}`);
      } else {
        setFeedbackMsg(`✓ Admission registered successfully with Reference: ${ref}!`);
      }

      setShowAddModal(false);
      // Reset form
      setAddFullName('');
      setAddFatherName('');
      setAddPhone('');
      setAddGuardianPhone('');
      setAddAddress('');
      setAddPhotoFile(null);
      setAddPhotoPreview(null);
      setAddNotes('');
      await loadAdmissions();
    } catch (err: unknown) {
      console.error(err);
      setAddError(err instanceof Error ? err.message : 'Error creating admission.');
    } finally {
      setAddSaving(false);
    }
  };

  const filteredAdmissions = admissions.filter((a) => {
    const matchSearch =
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.applicationRef.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.requestedClass.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Inquiries & Admissions
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Admission Applications & Roll
          </h1>
          <p className="text-xs text-slate-500">
            Register new students with pictures, review online submissions, and manage enrollment.
          </p>
        </div>

        <button
          onClick={() => {
            setAddError(null);
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition flex items-center gap-2 cursor-pointer border border-blue-900"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>+ Add New Admission (نیا داخلہ)</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, reference (e.g. ADM-784912), or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['all', 'pending', 'under_review', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Student & Photo</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Date Applied</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading applications...
                  </td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No admission applications found matching filter.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((a) => (
                  <tr key={a.applicationRef} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {a.applicationRef}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center font-bold text-blue-900 shadow-xs">
                          {a.photoUrl ? (
                            <img
                              src={a.photoUrl}
                              alt={a.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs">{a.fullName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{a.fullName}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">
                            {a.gender || 'student'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {a.fatherName}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-900">
                      {a.requestedClass}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{a.phone}</div>
                      <div className="text-[10px] text-slate-400">G: {a.guardianPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(a.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          a.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : a.status === 'under_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#0f2042] text-amber-300'
                        }`}
                      >
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {a.studentId || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenApp(a)}
                          className="px-3 py-1.5 bg-[#0f2042] hover:bg-[#172554] text-amber-300 font-semibold rounded-lg text-xs transition border border-blue-900/50 cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdmissionToDelete(a)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Admission Application"
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

      {/* Detail / Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700">
                  Application #{selectedApp.applicationRef}
                </span>
                <h3 className="font-bold text-xl text-slate-900">{selectedApp.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Photo Card */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-blue-600/40 shrink-0 flex items-center justify-center shadow-xs">
                {selectedApp.photoUrl ? (
                  <img
                    src={selectedApp.photoUrl}
                    alt={selectedApp.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400 p-2">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <span className="text-[9px] uppercase font-bold text-slate-400">No Photo</span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-0.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-base font-bold text-slate-900">{selectedApp.fullName}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    {selectedApp.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Father: <strong>{selectedApp.fatherName}</strong> • Class:{' '}
                  <strong className="text-blue-900">{selectedApp.requestedClass}</strong>
                </p>
                {selectedApp.photoUrl && (
                  <a
                    href={selectedApp.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-700 font-semibold underline inline-flex items-center gap-1"
                  >
                    <span>View Student Picture in Full Size</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Applicant Profile Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Father's Name:</span>
                <strong>{selectedApp.fatherName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Requested Class:</span>
                <strong className="text-blue-800">{selectedApp.requestedClass}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Student Contact:</span>
                <span>{selectedApp.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Guardian Contact:</span>
                <span>{selectedApp.guardianPhone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Address:</span>
                <span>{selectedApp.address}</span>
              </div>
              {selectedApp.previousSchool && (
                <div>
                  <span className="text-slate-400 block">Previous Institution:</span>
                  <span>{selectedApp.previousSchool}</span>
                </div>
              )}
              {selectedApp.previousEducation && (
                <div>
                  <span className="text-slate-400 block">Previous Education/Marks:</span>
                  <span>{selectedApp.previousEducation}</span>
                </div>
              )}
              {selectedApp.message && (
                <div className="col-span-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">Applicant Message:</span>
                  <p className="italic">{selectedApp.message}</p>
                </div>
              )}
              {selectedApp.documentUrl && (
                <div className="col-span-2">
                  <span className="text-slate-400 block">Attached Document:</span>
                  <a
                    href={selectedApp.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 font-semibold underline mt-1"
                  >
                    View Document / Result Card <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Reviewer Notes Form */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">
                Committee Reviewer Notes (Visible to applicant when tracking status):
              </label>
              <textarea
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="e.g. Verified. Please visit campus with fee voucher and 2 photos..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Conversion to Student Record */}
            {!selectedApp.studentId ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#070f1e] to-[#0f2042] border border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white shadow-sm">
                <div>
                  <strong className="text-amber-300 block text-sm">One-Click Enrollment</strong>
                  <span className="text-blue-100">
                    Approve and assign permanent Student ID (BFA-YYYY-XXX) into active student roll.
                  </span>
                </div>
                <button
                  onClick={handleConvertToStudent}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white rounded-xl font-bold uppercase tracking-wider shrink-0 transition cursor-pointer"
                >
                  {actionLoading ? 'Enrolling...' : 'Convert to Enrolled Student'}
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <span>
                  Already enrolled with Student ID: <strong className="font-mono">{selectedApp.studentId}</strong>
                </span>
              </div>
            )}

            {/* Status change actions */}
            <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAdmissionToDelete(selectedApp)}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Application</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('under_review')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-xl transition cursor-pointer"
                >
                  Mark Under Review
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold rounded-xl transition cursor-pointer"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold rounded-xl transition cursor-pointer"
                >
                  Approve Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Admission Modal (With Student Photo Upload) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700">Official Registration</span>
                <h3 className="font-bold text-lg text-slate-900">
                  + Add New Admission & Student (طالب علم کا نیا داخلہ)
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddAdmission} className="space-y-4 text-xs">
              {/* Student Picture Upload Box */}
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-blue-600/40 shrink-0 flex items-center justify-center shadow-xs relative group">
                  {addPhotoPreview ? (
                    <img src={addPhotoPreview} alt="Student Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Camera className="w-7 h-7 mx-auto mb-1 text-blue-500" />
                      <span className="text-[9px] font-bold block uppercase text-slate-500">Student Pic</span>
                    </div>
                  )}
                  {addPhotoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddPhotoFile(null);
                        setAddPhotoPreview(null);
                      }}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <label className="block text-xs font-bold text-slate-900">
                    Upload Student Photo / Picture (طالب علم کی تصویر اپلوڈ کریں)
                  </label>
                  <p className="text-[11px] text-slate-600">
                    Upload student passport photo directly from mobile/computer for the student ID card, attendance register, and fee receipts.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setAddPhotoFile(f);
                      if (f) {
                        setAddPhotoPreview(URL.createObjectURL(f));
                      } else {
                        setAddPhotoPreview(null);
                      }
                    }}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0f2042] file:text-amber-300 hover:file:bg-[#1a365d] cursor-pointer"
                  />
                  {addPhotoFile && (
                    <span className="text-[11px] text-emerald-700 font-bold block">
                      ✓ Photo Selected: {addPhotoFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addFullName}
                    onChange={(e) => setAddFullName(e.target.value)}
                    placeholder="e.g. Muhammad Bilal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={addFatherName}
                    onChange={(e) => setAddFatherName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Contacts & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Phone *</label>
                  <input
                    type="tel"
                    required
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guardian Phone</label>
                  <input
                    type="tel"
                    value={addGuardianPhone}
                    onChange={(e) => setAddGuardianPhone(e.target.value)}
                    placeholder="0301-7654321"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class / Batch *</label>
                  <select
                    value={addClass}
                    onChange={(e) => setAddClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-blue-900"
                  >
                    {[
                      'Class 9',
                      'Class 10',
                      'Class 11 (F.Sc Pre-Medical)',
                      'Class 11 (F.Sc Pre-Engineering)',
                      'Class 11 (ICS)',
                      'Class 12 (F.Sc Pre-Medical)',
                      'Class 12 (F.Sc Pre-Engineering)',
                      'Spoken English'
                    ].map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender, DOB & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={addGender}
                    onChange={(e) => setAddGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={addDob}
                    onChange={(e) => setAddDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Tuition Fee (PKR)</label>
                  <input
                    type="number"
                    value={addMonthlyFee}
                    onChange={(e) => setAddMonthlyFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address in Sadiqabad</label>
                <input
                  type="text"
                  value={addAddress}
                  onChange={(e) => setAddAddress(e.target.value)}
                  placeholder="e.g. Model Town, Kacha Sadiqabad Road..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {/* Auto Enroll Option */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block text-xs">
                    Directly enroll in Active Student Roll
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Immediately assigns official Student ID (BFA-YYYY-XXX) with photo attached.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={addAutoEnroll}
                  onChange={(e) => setAddAutoEnroll(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>

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
                  className="px-5 py-2.5 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 font-bold rounded-xl transition cursor-pointer flex items-center gap-2 border border-blue-900 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>{addSaving ? 'Saving Admission & Photo...' : 'Register Admission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Admission Confirmation Modal */}
      {admissionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Admission Application?</h3>
                <p className="text-xs text-slate-500">Permanently remove this registration.</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              Are you sure you want to delete application <strong>#{admissionToDelete.applicationRef}</strong> for{' '}
              <strong>{admissionToDelete.fullName}</strong> ({admissionToDelete.requestedClass})?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAdmissionToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAdmission}
                onClick={confirmDeleteAdmission}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {deletingAdmission ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
