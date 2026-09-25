import React from 'react';
import { CheckCircle2, ArrowRight, Copy, Check, Sparkles, Calendar, Database } from 'lucide-react';
import { Application } from '../../types';
import { SUPABASE_PROJECT_ID } from '../../services/supabase';

interface ApplicationSuccessModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDashboard: () => void;
}

export const ApplicationSuccessModal: React.FC<ApplicationSuccessModalProps> = ({
  application,
  isOpen,
  onClose,
  onViewDashboard
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !application) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(application.applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Application Submitted!
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Your credentials and profile have been delivered to {application.companyName}.
        </p>

        {/* Application ID Badge */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-5 text-left">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
            Official Application Reference
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">
              {application.applicationId}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors flex items-center gap-1 text-xs"
              title="Copy ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* ML Match Preview */}
          {application.mlMatchScore !== undefined && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Initial ML Match:
              </span>
              <span className="font-semibold text-indigo-700 font-mono tabular-nums">
                {application.mlMatchScore}% Match
              </span>
            </div>
          )}
        </div>

        {/* Supabase Persistence Confirmation Box */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-left text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold mb-1">
            <Database className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Saved to Supabase Backend</span>
          </div>
          <p className="text-emerald-700 text-[11px] leading-relaxed">
            Applicant & booking details have been registered into your Supabase project (<strong>{SUPABASE_PROJECT_ID}</strong>).
          </p>
        </div>

        {/* Pipeline Step Tracker Snapshot */}
        <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 mb-6 text-left text-xs">
          <span className="font-semibold text-slate-900 block mb-1">Status Pipeline Stage:</span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Currently: <strong>Applied</strong>. The recruiter will review your profile, shortlisted candidates will be scheduled for technical interviews, followed by appointment offer letters.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={() => {
              onClose();
              onViewDashboard();
            }}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            Track in My Applications <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
