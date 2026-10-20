import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Printer,
  MapPin,
  Phone,
  ArrowRight,
  User
} from 'lucide-react';
import { checkAdmissionStatus } from '../services/admissionService';
import { AdmissionApplication } from '../types';
import { useAcademy } from '../context/AcademyContext';

export const AdmissionStatusPage: React.FC = () => {
  const { settings } = useAcademy();
  const [searchParams] = useSearchParams();
  const defaultRef = searchParams.get('ref') || '';

  const [refInput, setRefInput] = useState(defaultRef);
  const [phoneInput, setPhoneInput] = useState('');
  const [application, setApplication] = useState<AdmissionApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (defaultRef) {
      handleLookup(defaultRef);
    }
  }, [defaultRef]);

  const handleLookup = async (refToUse?: string) => {
    const targetRef = (refToUse || refInput).trim().toUpperCase();
    if (!targetRef) {
      setError('Please enter your application reference number (e.g. ADM-784912).');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const result = await checkAdmissionStatus(targetRef, phoneInput.trim());
      if (!result) {
        setApplication(null);
        setError(`No admission record found for reference "${targetRef}". Please check the spelling or contact reception.`);
      } else {
        setApplication(result);
      }
    } catch (err: unknown) {
      setApplication(null);
      setError(err instanceof Error ? err.message : 'Unable to verify application status. Please check your reference.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AdmissionApplication['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Approved & Verified
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-4 h-4 text-amber-600" />
            Under Committee Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-4 h-4 text-rose-600" />
            Application Not Accepted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0f2042] text-amber-300 border border-blue-900/60 shadow-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            Pending Initial Review
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold tracking-wide border border-blue-700/50">
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Admissions Portal Verification</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
            Check Admission Status
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Enter your application reference code provided during online registration to see real-time committee updates.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-8">
        {/* Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Application Reference *
              </label>
              <input
                type="text"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                placeholder="e.g. ADM-784912"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-base sm:text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registered Phone (Optional)
              </label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0300-1234567"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                onClick={() => handleLookup()}
                disabled={loading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Search className="w-4 h-4" />
                Track
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Result Card */}
        {application && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-4">
                {application.photoUrl ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-slate-100 shadow-xs shrink-0">
                    <img src={application.photoUrl} alt={application.fullName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">
                    Official Application
                  </span>
                  <h3 className="text-2xl font-black font-mono text-blue-900">
                    {application.applicationRef}
                  </h3>
                </div>
              </div>
              <div>{getStatusBadge(application.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-xs">Applicant Name</span>
                <span className="font-bold text-slate-900 text-base">{application.fullName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-xs">Father / Guardian</span>
                <span className="font-bold text-slate-900 text-base">{application.fatherName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-xs">Enrolled / Desired Class</span>
                <span className="font-bold text-blue-800 text-base">{application.requestedClass}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-xs">Submission Date</span>
                <span className="font-medium text-slate-700">
                  {new Date(application.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {application.studentId && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Permanent Student ID Issued
                  </span>
                  <span className="text-lg font-mono font-black text-emerald-900">
                    {application.studentId}
                  </span>
                </div>
                <Link
                  to="/results"
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition"
                >
                  View Portal
                </Link>
              </div>
            )}

            {application.reviewerNotes && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#070f1e] to-[#0f2042] border border-blue-900/60 text-white space-y-1 text-xs shadow-md">
                <strong className="text-amber-400">Admissions Committee Notes:</strong>
                <p className="text-slate-200">{application.reviewerNotes}</p>
              </div>
            )}

            {/* Campus instructions */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800">Campus Inquiries & Verification:</div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{settings.address}, {settings.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{settings.phone} • WhatsApp: {settings.whatsappNumber}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                Print Status Slip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
