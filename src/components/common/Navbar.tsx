import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Menu,
  X,
  Phone,
  MessageCircle,
  ShieldCheck,
  Search,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { settings } = useAcademy();
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses & Classes', path: '/courses' },
    { name: 'Faculty', path: '/teachers' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Check Status', path: '/admission-status' },
    { name: 'Results Portal', path: '/results' },
    { name: 'Gallery & News', path: '/gallery' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
      {/* Top emergency / quick contact bar */}
      <div className="bg-[#070f1e] text-blue-100 text-xs py-1.5 px-3 sm:px-8 flex justify-between items-center border-b border-blue-950 max-w-full overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden whitespace-nowrap min-w-0 flex-1 mr-2">
          <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="truncate">{settings.city}, {settings.province}</span>
          </span>
          <span className="hidden sm:inline-block text-blue-400">•</span>
          <span className="hidden sm:flex items-center gap-1 text-xs">
            <Phone className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{settings.phone}</span>
          </span>
          {settings.marqueeAnnouncement && (
            <span className="hidden md:inline-block text-amber-300 font-medium truncate">
              {settings.marqueeAnnouncement}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-[11px] sm:text-xs transition font-medium"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>WhatsApp</span>
          </a>
          {currentUser && isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-2 py-0.5 rounded text-[11px] sm:text-xs transition shadow-xs"
            >
              <ShieldCheck className="w-3 h-3" />
              Admin
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] sm:text-xs"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              Staff Login
            </Link>
          )}
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20 max-w-full">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 mr-2">
          {settings.logoUrl ? (
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-md shadow-[#0f2042]/20 group-hover:scale-105 transition transform border border-amber-400/50 p-0.5 shrink-0">
              <img
                src={settings.logoUrl}
                alt={settings.academyName}
                className="w-full h-full object-contain rounded-lg sm:rounded-xl"
              />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#070f1e] via-[#0f2042] to-[#1e3a8a] flex items-center justify-center text-white shadow-md shadow-[#0f2042]/30 group-hover:scale-105 transition transform border border-blue-900/50 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7 text-amber-300" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-[#070f1e] font-serif leading-tight truncate sm:overflow-visible sm:whitespace-normal">
              {settings.academyName}
            </div>
            <div className="text-[9px] sm:text-xs text-[#0f2042] font-semibold tracking-wide uppercase truncate">
              Sadiqabad Campus • Tuition & Board Prep
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                isActive(link.path)
                  ? 'text-amber-400 bg-[#0f2042] font-bold shadow-xs border border-blue-900/40'
                  : 'text-slate-700 hover:text-[#0f2042] hover:bg-slate-100/70'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/admissions"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0f2042] hover:bg-[#172554] text-white font-medium text-sm shadow-md shadow-[#0f2042]/25 transition transform hover:-translate-y-0.5 active:translate-y-0 border border-blue-900/60"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Apply Online
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="xl:hidden flex items-center gap-2 shrink-0">
          <Link
            to="/admissions"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-[#0f2042] text-white text-xs font-medium"
          >
            Apply
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="xl:hidden fixed inset-0 top-20 bg-slate-950/50 backdrop-blur-xs z-30"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="xl:hidden relative z-40 bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-1 shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 text-base font-semibold rounded-xl transition ${
                  isActive(link.path)
                    ? 'text-amber-400 bg-[#0f2042] font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/80 active:bg-slate-200'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/admissions"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 bg-[#0f2042] text-amber-300 font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 border border-blue-900/60"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Online Admission Form
              </Link>
              <Link
                to="/admission-status"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                <ClipboardList className="w-4 h-4 text-[#0f2042]" />
                Check Admission Status
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="py-2.5 px-3 rounded-xl bg-blue-50 text-[#0f2042] font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0f2042]" />
                  Call Office
                </a>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
