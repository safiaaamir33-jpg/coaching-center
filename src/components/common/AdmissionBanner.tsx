import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sparkles, X, ArrowRight } from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';

export const AdmissionBanner: React.FC = () => {
  const { settings } = useAcademy();
  const [dismissed, setDismissed] = useState(false);

  if (!settings.admissionOpen || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#070f1e] via-[#0f2042] to-[#172554] text-white shadow-md relative overflow-hidden border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 animate-bounce">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="font-bold text-sm sm:text-base text-amber-300 tracking-wide flex items-center justify-center sm:justify-start gap-1.5">
              <span>{settings.admissionBannerTitle || 'Admissions Open!'}</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Session 2026–2027
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl mt-0.5">
              {settings.admissionBannerText || 'Morning and evening batches for Class 9, 10, F.Sc, and ICS in Sadiqabad.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admissions"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs uppercase tracking-wider transition shadow-sm"
          >
            Apply Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-blue-300 hover:text-white rounded-md transition"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
