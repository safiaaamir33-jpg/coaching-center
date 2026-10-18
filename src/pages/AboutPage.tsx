import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Target,
  Eye,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';

export const AboutPage: React.FC = () => {
  const { settings } = useAcademy();

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          {settings.logoUrl && (
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white p-1 border-2 border-amber-400 shadow-xl shadow-black/20 flex items-center justify-center">
              <img
                src={settings.logoUrl}
                alt={settings.academyName}
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold tracking-wide border border-blue-700/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Educational Heritage & Excellence in Sadiqabad</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
            About {settings.academyName}
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-light">
            {settings.tagline}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Main Introduction Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200/80 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
                Our Story & Philosophy
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900">
                Pioneering Modern Coaching in South Punjab
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {settings.aboutText}
              </p>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Established with a singular commitment to academic rigor and moral mentorship, Bright Future Coaching Academy brings together senior university professors, medical graduates, and board examination evaluators under one roof in Sadiqabad.
              </p>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-[#070f1e] via-[#0b1b36] to-[#0f2042] p-6 rounded-2xl border border-blue-900/60 text-white space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Sadiqabad Main Campus</h4>
                  <p className="text-xs text-blue-200">Accessible from all parts of city</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Located on {settings.address}, our campus features modern air-conditioned lecture halls, quiet study corners, separate halls for male and female students, and round-the-clock solar energy backup.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Working Hours: {settings.officeHours || 'Mon–Sat: 8:00 AM – 8:00 PM'}</span>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#070f1e] via-[#0b1b36] to-[#0f2042] border border-blue-900/60 text-white space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white">Our Mission</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {settings.missionText}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#070f1e] via-[#0b1b36] to-[#0f2042] border border-blue-900/60 text-white space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white">Our Vision</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {settings.visionText}
              </p>
            </div>
          </div>

          {/* Academic Features & Facilities */}
          <div className="pt-8 border-t border-slate-100 space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
                Campus Infrastructure
              </span>
              <h3 className="text-2xl font-bold font-serif text-slate-900">
                Facilities & Learning Environment
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {settings.facilities.map((facility, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 hover:bg-white hover:shadow-xs transition"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {facility}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <h4 className="text-xl font-bold font-serif text-white">
                Begin Your Journey With Us Today
              </h4>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                Admissions are open for upcoming batches. Apply online or visit our campus.
              </p>
            </div>
            <Link
              to="/admissions"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-xs uppercase tracking-wider transition shrink-0 flex items-center gap-1.5 shadow-md"
            >
              Online Admission Form
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
