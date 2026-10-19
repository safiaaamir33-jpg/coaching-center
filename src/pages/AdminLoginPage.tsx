import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  Info,
  KeyRound,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAcademy } from '../context/AcademyContext';

export const AdminLoginPage: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithEmailPassword,
    createAdminAccount,
    resetPassword,
    currentUser,
    isAdmin,
    loading,
    logout
  } = useAuth();
  const { settings } = useAcademy();

  const [activeTab, setActiveTab] = useState<'password' | 'google' | 'setup'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState(false);

  // If already logged in and admin, redirect to admin dashboard declaratively
  if (!loading && currentUser && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setInProgress(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error('Google login error:', err);
      setAuthError(err instanceof Error ? err.message : 'Google authentication failed. Please try again or use email/password.');
    } finally {
      setInProgress(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError('Please enter both administrative email and password.');
      return;
    }

    setAuthError(null);
    setAuthSuccess(null);
    setInProgress(true);
    try {
      await signInWithEmailPassword(email, password);
    } catch (err: any) {
      console.error('Password login error:', err);
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. Please verify your credentials and try again.');
      } else {
        setAuthError(err?.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setInProgress(false);
    }
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError('Please enter your authorized email and desired password.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthError(null);
    setAuthSuccess(null);
    setInProgress(true);
    try {
      await createAdminAccount(email, password);
      setAuthSuccess('Admin password successfully saved! You are now logged in.');
    } catch (err: any) {
      console.error('Account setup error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailPassword(email, password);
        } catch {
          setAuthError('This email is already registered. If you forgot the password, please request a password reset.');
        }
      } else {
        setAuthError(err?.message || 'Failed to set admin password.');
      }
    } finally {
      setInProgress(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setAuthError('Please enter your admin email address first.');
      return;
    }
    setInProgress(true);
    setAuthError(null);
    try {
      await resetPassword(email);
      setAuthSuccess(`Password reset instructions sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to send password reset email.');
    } finally {
      setInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-blue-900/30 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          {settings.logoUrl ? (
            <div className="w-18 h-18 rounded-3xl bg-white shadow-xl shadow-[#0f2042]/30 border-2 border-amber-400/60 p-1 mx-auto flex items-center justify-center">
              <img
                src={settings.logoUrl}
                alt={settings.academyName}
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#070f1e] via-[#0f2042] to-[#1e3a8a] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#0f2042]/30 border border-blue-900/60">
              <ShieldCheck className="w-8 h-8 text-amber-300" />
            </div>
          )}
          <h2 className="text-2xl font-black font-serif text-slate-900">
            Administrative Portal
          </h2>
          <p className="text-xs text-slate-500">
            {settings.academyName} • Management Console
          </p>
        </div>

        {/* Status Messages */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{authSuccess}</span>
          </div>
        )}

        {currentUser && !isAdmin && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              Unauthorized Account
            </div>
            <p>
              Signed in account does not have administrative privileges in {settings.academyName}.
            </p>
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => logout()}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg font-semibold transition text-xs cursor-pointer"
              >
                Sign Out & Switch Account
              </button>
            </div>
          </div>
        )}

        {/* Tab Selection: Password vs Google vs Setup */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setAuthError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'password'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-blue-900" />
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('google');
              setAuthError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'google'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Google
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('setup');
              setAuthError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'setup'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            Reset / Set
          </button>
        </div>

        {/* TAB 1: Password Login */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brightfuture.edu.pk"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] text-blue-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={inProgress}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#070f1e] via-[#0f2042] to-[#172554] hover:from-[#0b172a] hover:to-[#0f2042] disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-2 border border-blue-900/60"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              {inProgress ? 'Authenticating...' : 'Sign In to Admin Portal'}
            </button>
          </form>
        )}

        {/* TAB 2: Google 1-Click Login */}
        {activeTab === 'google' && (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#070f1e] to-[#0f2042] border border-blue-900/60 text-xs text-white space-y-1 shadow-md">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Google Workspace Sign-In
              </div>
              <p className="text-[11px] leading-relaxed text-blue-100">
                Sign in with your verified administrative Google account.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={inProgress}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-md transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              {inProgress ? 'Connecting to Google...' : 'Sign in with Google'}
            </button>
          </div>
        )}

        {/* TAB 3: Set / Create Custom Password */}
        {activeTab === 'setup' && (
          <form onSubmit={handleSetupPassword} className="space-y-4 pt-1">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950">
              <strong>Set Administrative Password:</strong> Choose a secure password (minimum 6 characters) for your authorized administrative email.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brightfuture.edu.pk"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={inProgress}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              {inProgress ? 'Saving Password...' : 'Save & Set Admin Password'}
            </button>
          </form>
        )}

        {/* Security Assurance Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Protected Administrator Gateway
          </div>
          <p>
            Administrative privileges are enforced via Firebase Security Rules. Public visitors have no access to administrative functions.
          </p>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/"
            className="text-xs text-blue-700 font-semibold hover:underline flex items-center justify-center gap-1"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
