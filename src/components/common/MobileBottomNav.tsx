import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Sparkles, ClipboardList, MessageCircle } from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { settings } = useAcademy();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-1 py-1 flex items-center justify-between max-w-full"
      style={{ paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Mobile Bottom Navigation"
    >
      {/* Home */}
      <Link
        to="/"
        className={`flex-1 min-w-0 flex flex-col items-center py-1 px-1 rounded-xl transition ${
          isActive('/') ? 'text-[#0f2042] font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className={`w-5 h-5 shrink-0 ${isActive('/') ? 'stroke-[2.5px] text-[#0f2042]' : ''}`} />
        <span className="text-[10px] mt-0.5 truncate leading-tight">Home</span>
      </Link>

      {/* Courses */}
      <Link
        to="/courses"
        className={`flex-1 min-w-0 flex flex-col items-center py-1 px-1 rounded-xl transition ${
          isActive('/courses') ? 'text-[#0f2042] font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <BookOpen className={`w-5 h-5 shrink-0 ${isActive('/courses') ? 'stroke-[2.5px] text-[#0f2042]' : ''}`} />
        <span className="text-[10px] mt-0.5 truncate leading-tight">Courses</span>
      </Link>

      {/* Apply Online (Prominent center button) */}
      <Link
        to="/admissions"
        className="flex-1 min-w-0 flex flex-col items-center -mt-3.5 px-1 group"
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#070f1e] to-[#0f2042] text-amber-300 flex items-center justify-center shadow-lg shadow-[#0f2042]/40 border-2 border-amber-400 group-active:scale-95 transition transform shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <span className="text-[10px] font-bold text-[#0f2042] mt-0.5 truncate leading-tight">Apply</span>
      </Link>

      {/* Check Status */}
      <Link
        to="/admission-status"
        className={`flex-1 min-w-0 flex flex-col items-center py-1 px-1 rounded-xl transition ${
          isActive('/admission-status') ? 'text-[#0f2042] font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <ClipboardList className={`w-5 h-5 shrink-0 ${isActive('/admission-status') ? 'stroke-[2.5px] text-[#0f2042]' : ''}`} />
        <span className="text-[10px] mt-0.5 truncate leading-tight">Status</span>
      </Link>

      {/* WhatsApp Chat */}
      <a
        href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 flex flex-col items-center py-1 px-1 rounded-xl text-emerald-600 hover:text-emerald-700 transition"
      >
        <MessageCircle className="w-5 h-5 shrink-0" />
        <span className="text-[10px] mt-0.5 font-medium truncate leading-tight">WhatsApp</span>
      </a>
    </nav>
  );
};
