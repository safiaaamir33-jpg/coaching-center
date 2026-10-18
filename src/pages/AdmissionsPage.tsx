import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Upload,
  Printer,
  Copy,
  ArrowRight,
  ShieldCheck,
  FileText,
  User,
  Camera
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { submitAdmissionApplication } from '../services/admissionService';
import { uploadImageOrFile } from '../services/storageService';

export const AdmissionsPage: React.FC = () => {
  const { settings } = useAcademy();
  const [searchParams] = useSearchParams();
  const initialClass = searchParams.get('class') || '';

  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phone, setPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [previousEducation, setPreviousEducation] = useState('');
  const [requestedClass, setRequestedClass] = useState(initialClass || 'Class 9');
  const [previousSchool, setPreviousSchool] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialClass) {
      setRequestedClass(initialClass);
    }
  }, [initialClass]);

  const classOptions = [
    'Class 1–5 (Primary)',
    'Class 6–8 (Middle School)',
    'Class 9 (Matric Science)',
    'Class 10 (Matric Science)',
    'Class 11 (F.Sc Pre-Medical)',
    'Class 11 (F.Sc Pre-Engineering)',
    'Class 11 (ICS Computer Science)',
    'Class 12 (F.Sc Pre-Medical)',
    'Class 12 (F.Sc Pre-Engineering)',
    'Class 12 (ICS Computer Science)',
    'Spoken English & Communication Skills',
    'Special Board Revision & Test Series'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || !fatherName.trim() || !phone.trim() || !guardianPhone.trim() || !address.trim()) {
      setError('Please fill in all required personal and contact details.');
      return;
    }

    if (!consent) {
      setError('Please check the consent box confirming that the information provided is accurate.');
      return;
    }

    setLoading(true);

    try {
      let documentUrl: string | undefined;
      let photoUrl: string | undefined;

      if (photoFile) {
        photoUrl = await uploadImageOrFile(photoFile, 'students');
      }
      if (file) {
        documentUrl = await uploadImageOrFile(file, 'admissions');
      }

      const ref = await submitAdmissionApplication({
        fullName: fullName.trim(),
        fatherName: fatherName.trim(),
        dob: dob || '',
        gender,
        phone: phone.trim(),
        guardianPhone: guardianPhone.trim(),
        address: address.trim(),
        previousEducation: previousEducation.trim(),
        requestedClass,
        previousSchool: previousSchool.trim(),
        message: message.trim(),
        photoUrl: photoUrl || '',
        documentUrl: documentUrl || '',
        consent,
      });

      setSubmittedRef(ref);
    } catch (err: unknown) {
      console.error('Admission submit error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyRefToClipboard = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold tracking-wide border border-blue-700/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Session 2026–2027</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
            Online Admission Application
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Fill in the details below to register for coaching classes at Bright Future Coaching Academy, Sadiqabad.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {submittedRef ? (
          /* Success Card */
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-emerald-100 space-y-8 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
                Application Successfully Submitted!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Your admission request has been recorded in our official admissions database. Please save your application reference number for status verification.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#070f1e] via-[#0c1a35] to-[#172554] border-2 border-dashed border-amber-400/50 text-center space-y-2 text-white shadow-xl">
              <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                Application Reference Number
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-wider">
                {submittedRef}
              </div>
              <div className="pt-2">
                <button
                  onClick={copyRefToClipboard}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold shadow-md transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied to Clipboard!' : 'Copy Reference Number'}
                </button>
              </div>
            </div>

            {/* Application Summary Voucher */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Father's Name:</span>
                <span className="font-bold text-slate-900">{fatherName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Requested Class:</span>
                <span className="font-bold text-blue-800">{requestedClass}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-medium">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Campus Location:</span>
                <span className="font-medium">{settings.address}, {settings.city}</span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <strong>Next Steps:</strong>
              <p>
                Our admissions committee will review your application within 24 hours. You may also visit our campus office with two passport-sized photographs and copies of your previous mark sheet to complete fee voucher payment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                Print Acknowledgment Slip
              </button>
              <Link
                to={`/admission-status?ref=${submittedRef}`}
                className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
              >
                Track Application Status
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Admission Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Student Information */}
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0f2042] text-amber-300 border border-blue-900/60 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  Student Personal Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Muhammad Ali"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Father / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Haji Muhammad Tariq"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Student Photo Upload */}
                  <div className="sm:col-span-2 p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-blue-600/40 shrink-0 flex items-center justify-center shadow-xs">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Student Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2 text-slate-400">
                          <Camera className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                          <span className="text-[9px] font-bold block uppercase text-slate-500">Student Pic</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <label className="block text-xs font-bold text-slate-900">
                        Student Passport Photo / Picture (طالب علم کی تصویر)
                      </label>
                      <p className="text-[11px] text-slate-600">
                        Upload student photo from mobile camera or gallery for the student roll register and ID file.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setPhotoFile(f);
                          if (f) {
                            setPhotoPreview(URL.createObjectURL(f));
                          } else {
                            setPhotoPreview(null);
                          }
                        }}
                        className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0f2042] file:text-amber-300 hover:file:bg-[#1a365d] cursor-pointer"
                      />
                      {photoFile && (
                        <span className="text-[11px] text-emerald-700 font-semibold block">
                          ✓ Photo Selected: {photoFile.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Address */}
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0f2042] text-amber-300 border border-blue-900/60 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student Mobile / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Father / Guardian Contact *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="0301-7654321"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Residential Address in Sadiqabad / Rahim Yar Khan *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, Colony, Ward / Mohallah, Sadiqabad..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Academic Background & Desired Course */}
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0f2042] text-amber-300 border border-blue-900/60 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  Course Selection & Background
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Requested Coaching Class / Course *
                    </label>
                    <select
                      required
                      value={requestedClass}
                      onChange={(e) => setRequestedClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-blue-900"
                    >
                      {classOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Previous Class / Degree
                    </label>
                    <input
                      type="text"
                      value={previousEducation}
                      onChange={(e) => setPreviousEducation(e.target.value)}
                      placeholder="e.g. 8th Class Pass, Matric Science"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Previous School / College (Optional)
                    </label>
                    <input
                      type="text"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      placeholder="e.g. Govt High School Sadiqabad / Comprehensive College"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Optional Document Upload (B-Form, Result Card, or Photo)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0f2042] file:text-amber-300 hover:file:bg-[#172554] cursor-pointer"
                      />
                      {file && <span className="text-xs text-emerald-600 font-medium">Selected: {file.name}</span>}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Additional Message or Specific Goals (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Any specific weak subject, timing preference, or questions..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Consent & Submission */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I solemnly declare that the information provided above is correct. I agree to abide by the disciplinary rules and attendance regulations of Bright Future Coaching Academy, Sadiqabad.
                  </span>
                </label>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100">
                <Link
                  to="/admission-status"
                  className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Already submitted? Check your status here
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-700/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Admission Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
