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
      <div className="bg-[#070f1e] text-blue-100 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-blue-950">
        <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {settings.city}, {settings.province}
          </span>
          <span className="hidden sm:inline-block text-blue-400">•</span>
          <span className="hidden sm:flex items-center gap-1">
            <Phone className="w-3 h-3 text-amber-400" />
            {settings.phone}
          </span>
          {settings.marqueeAnnouncement && (
            <span className="hidden md:inline-block text-amber-300 font-medium">
              {settings.marqueeAnnouncement}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>
          {currentUser && isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-2 py-0.5 rounded text-xs transition shadow-xs"
            >
              <ShieldCheck className="w-3 h-3" />
              Admin Portal
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              Staff Login
            </Link>
          )}
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          {settings.logoUrl ? (
            <div className="w-13 h-13 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-md shadow-[#0f2042]/20 group-hover:scale-105 transition transform border border-amber-400/50 p-0.5 shrink-0">
              <img
                src={settings.logoUrl}
                alt={settings.academyName}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#070f1e] via-[#0f2042] to-[#1e3a8a] flex items-center justify-center text-white shadow-md shadow-[#0f2042]/30 group-hover:scale-105 transition transform border border-blue-900/50 shrink-0">
              <GraduationCap className="w-7 h-7 text-amber-300" />
            </div>
          )}
          <div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-[#070f1e] font-serif leading-none">
              {settings.academyName}
            </div>
            <div className="text-xs text-[#0f2042] font-bold tracking-wide uppercase mt-1">
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
        <div className="xl:hidden flex items-center gap-2">
          <Link
            to="/admissions"
            className="px-3 py-1.5 rounded-lg bg-[#0f2042] text-white text-xs font-medium"
          >
            Apply
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 text-base font-medium rounded-lg transition ${
                isActive(link.path)
                  ? 'text-amber-400 bg-[#0f2042] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/admissions"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 bg-blue-700 text-white font-semibold rounded-lg text-sm"
            >
              Online Admission Form
            </Link>
            <Link
              to="/admission-status"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 bg-slate-100 text-slate-800 font-medium rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <ClipboardList className="w-4 h-4 text-blue-600" />
              Check Admission Status
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
