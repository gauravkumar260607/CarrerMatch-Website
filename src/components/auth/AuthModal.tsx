import React, { useState } from 'react';
import { X, LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle2, Building2, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin'
}) => {
  const { login, register, switchDemoAccount } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [role, setRole] = useState<UserRole>('job_seeker');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
        onClose();
      } else if (mode === 'signup') {
        await register({
          name,
          email,
          password,
          role,
          companyName: role === 'recruiter' ? companyName : undefined
        });
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(email);
        setSuccessMessage(res.message);
        setTimeout(() => setMode('reset'), 1500);
      } else if (mode === 'reset') {
        const res = await api.resetPassword({ email, newPassword });
        setSuccessMessage(res.message);
        setTimeout(() => setMode('signin'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await switchDemoAccount(demoRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="mb-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center mx-auto mb-2 shadow-sm">
            CM
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'signin' && 'Sign in to CareerMatch'}
            {mode === 'signup' && 'Create your CareerMatch account'}
            {mode === 'forgot' && 'Reset your password'}
            {mode === 'reset' && 'Set new password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Intelligent career hub for students, freshers, recruiters & enterprises.
          </p>
        </div>

        {/* Mode Tabs (Sign In / Sign Up) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="flex rounded-lg bg-slate-100 p-1 mb-5 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('job_seeker')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    role === 'job_seeker'
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs">Job Seeker / Student</span>
                  <span className="text-[10px] text-slate-500 font-normal">Apply & track jobs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    role === 'recruiter'
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs">Employer / Recruiter</span>
                  <span className="text-[10px] text-slate-500 font-normal">Post & hire talent</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {mode === 'signup' && role === 'recruiter' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Organization *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. NexaTech Innovations"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {(mode === 'signin' || mode === 'signup' || mode === 'forgot' || mode === 'reset') && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Password *</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[11px] text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {mode === 'reset' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter strong new password"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors mt-2"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Send Password Reset Link' : 'Confirm New Password'}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-400 block mb-2 font-medium">
            Instant Demo Logins (No password needed)
          </span>

          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              onClick={() => handleQuickDemo('job_seeker')}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium flex flex-col items-center gap-1 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Job Seeker</span>
            </button>

            <button
              onClick={() => handleQuickDemo('recruiter')}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium flex flex-col items-center gap-1 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Recruiter</span>
            </button>

            <button
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium flex flex-col items-center gap-1 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
