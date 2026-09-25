import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Briefcase, ShieldAlert, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

export const RoleSwitcherBanner: React.FC = () => {
  const { user, switchDemoAccount, loading } = useAuth();

  const handleSwitch = (role: UserRole) => {
    if (loading) return;
    switchDemoAccount(role);
  };

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-3 sm:px-4 py-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 shadow-inner">
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
        <span className="inline-flex items-center gap-1 font-medium text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Role Preview Mode:</span>
          <span className="sm:hidden font-bold">Active Role:</span>
        </span>
        <span className="text-slate-300">
          <strong className="text-white font-semibold capitalize">
            {user ? (user.role === 'job_seeker' ? 'Student (Aarav)' : user.role === 'recruiter' ? 'Recruiter (Priya)' : 'Admin (Dr. Vikram)') : 'Guest'}
          </strong>
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-0.5 sm:pb-0">
        <span className="text-slate-400 mr-1 text-[11px] hidden md:inline shrink-0">Switch Persona:</span>
        <button
          onClick={() => handleSwitch('job_seeker')}
          disabled={loading || user?.role === 'job_seeker'}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded text-[11px] sm:text-xs transition-colors shrink-0 ${
            user?.role === 'job_seeker'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <UserCheck className="w-3 h-3" />
          <span className="sm:hidden">Student</span>
          <span className="hidden sm:inline">Student / Seeker</span>
        </button>

        <button
          onClick={() => handleSwitch('recruiter')}
          disabled={loading || user?.role === 'recruiter'}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded text-[11px] sm:text-xs transition-colors shrink-0 ${
            user?.role === 'recruiter'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Briefcase className="w-3 h-3" />
          <span className="sm:hidden">Recruiter</span>
          <span className="hidden sm:inline">Recruiter</span>
        </button>

        <button
          onClick={() => handleSwitch('admin')}
          disabled={loading || user?.role === 'admin'}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-1 rounded text-[11px] sm:text-xs transition-colors shrink-0 ${
            user?.role === 'admin'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3 h-3" />
          <span>Admin</span>
        </button>
      </div>
    </div>
  );
};
