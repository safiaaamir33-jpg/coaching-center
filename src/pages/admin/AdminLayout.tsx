import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  ClipboardList,
  CheckSquare,
  Award,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';

import { getAllContactMessages } from '../../services/contactService';
import { getAllAdmissions } from '../../services/admissionService';

export const AdminLayout: React.FC = () => {
  const { currentUser, isAdmin, logout, loading } = useAuth();
  const { settings } = useAcademy();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [pendingAdmissionsCount, setPendingAdmissionsCount] = useState(0);

  useEffect(() => {
    if (currentUser && isAdmin) {
      loadBadgeCounts();
    }
  }, [currentUser, isAdmin, location.pathname]);

  const loadBadgeCounts = async () => {
    try {
      const [msgs, adms] = await Promise.all([
        getAllContactMessages().catch(() => []),
        getAllAdmissions().catch(() => []),
      ]);
      setNewMessagesCount(msgs.filter((m) => m.status === 'new').length);
      setPendingAdmissionsCount(adms.filter((a) => a.status === 'pending').length);
    } catch (e) {
      // quiet fail
    }
  };

  // Protected route check
  if (!loading && (!currentUser || !isAdmin)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600">
            You must be logged in as an authorized administrator to access this portal.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/login"
              className="inline-block px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Go to Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Student Management', path: '/admin/students', icon: Users },
    { name: 'Admissions & Inquiries', path: '/admin/admissions', icon: ClipboardList },
    { name: 'Fee & Voucher System', path: '/admin/fees', icon: CreditCard },
    { name: 'Courses & Classes', path: '/admin/courses', icon: BookOpen },
    { name: 'Teachers & Staff', path: '/admin/teachers', icon: GraduationCap },
    { name: 'Daily Attendance', path: '/admin/attendance', icon: CheckSquare },
    { name: 'Exams & Results', path: '/admin/exams', icon: Award },
    { name: 'Notice Board & Gallery', path: '/admin/cms', icon: ImageIcon },
    { name: 'Review Moderation', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Contact Inquiries', path: '/admin/messages', icon: Mail },
    { name: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Chatbot Settings', path: '/admin/chatbot', icon: Bot },
    { name: 'Academy Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-[#070f1e] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-blue-950">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt={settings.academyName}
              className="w-7 h-7 rounded-lg object-contain bg-white/95 p-0.5 border border-amber-400/40"
            />
          )}
          <span className="font-bold text-sm tracking-tight truncate">{settings.academyName}</span>
        </div>
        <Link
          to="/"
          target="_blank"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <span>View Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-45 lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#070f1e] text-slate-300 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 border-r border-blue-950 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-blue-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white/95 flex items-center justify-center border border-amber-400/50 p-0.5 shadow-md shrink-0">
                  <img
                    src={settings.logoUrl}
                    alt={settings.academyName}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f2042] to-[#1e3a8a] text-white flex items-center justify-center font-bold border border-blue-900/60 shadow-md shrink-0">
                  <GraduationCap className="w-6 h-6 text-amber-300" />
                </div>
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-white truncate">{settings.academyName}</div>
                <div className="text-[11px] text-blue-400 font-medium">Admin Control Panel</div>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)] no-scrollbar text-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition ${
                    active
                      ? 'bg-[#0f2042] text-white font-bold shadow-md shadow-[#0f2042]/50 border border-blue-800/60'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.path === '/admin/messages' && newMessagesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {newMessagesCount}
                    </span>
                  )}
                  {item.path === '/admin/admissions' && pendingAdmissionsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white">
                      {pendingAdmissionsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & bottom actions */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.displayName || 'Administrator'}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">
                {currentUser?.email}
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              to="/"
              target="_blank"
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="py-1.5 px-2.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
