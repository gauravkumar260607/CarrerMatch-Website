import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Terminal, 
  ShieldCheck 
} from 'lucide-react';
import { api } from '../../services/api';
import { SUPABASE_PROJECT_ID, SUPABASE_URL } from '../../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<any>(null);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [statusRes, schemaRes] = await Promise.all([
        api.getSupabaseStatus(),
        api.getSupabaseSchema()
      ]);
      setStatus(statusRes);
      setSqlSchema(schemaRes.sqlSchema);
    } catch (err: any) {
      console.error('Failed to fetch Supabase status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setSyncMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      const res = await api.syncSupabase();
      if (res.syncedCount > 0) {
        setSyncMessage(`Successfully synced ${res.syncedCount} application(s) to Supabase tables!`);
      } else if (res.remainingQueueCount > 0) {
        setSyncMessage(`Supabase tables pending creation. Copy and run SQL schema below in Supabase SQL Editor.`);
      } else {
        setSyncMessage('All applications are fully synchronized with Supabase backend.');
      }
      await fetchStatus();
    } catch (err: any) {
      setSyncMessage(err.message || 'Sync attempt encountered an issue.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Supabase Backend Integration
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Project ID: <code className="font-mono text-slate-700 font-semibold">{SUPABASE_PROJECT_ID}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Status summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-1">Target Supabase Project</span>
              <p className="font-mono font-bold text-slate-900 text-xs truncate">
                {SUPABASE_PROJECT_ID}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{SUPABASE_URL}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-1">Backend Table Sync Target</span>
              <p className="font-mono font-bold text-indigo-700 text-xs">
                public.applications, apply_bookings & jobs
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Auto-sync on application bookings & recruiter job posts
              </p>
            </div>
          </div>

          {/* Sync & Health Alert */}
          {syncMessage && (
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}

          {status && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connection Status: {status.connected ? 'Active & Reachable' : 'Offline'}
                </span>

                <button
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Pending Data'}
                </button>
              </div>

              <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {status.message}
              </div>

              {status.pendingSyncCount > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{status.pendingSyncCount}</strong> application(s) queued for sync. Run the SQL schema below in your Supabase SQL Editor to activate tables.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SQL Editor Instructions & Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Supabase SQL Schema (Run once in Supabase SQL Editor)
              </label>

              <div className="flex items-center gap-2">
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Open Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={handleCopySql}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              If you haven't created the <code className="font-mono text-slate-700 font-semibold">applications</code> table in Supabase yet, click <strong>"Copy SQL"</strong> and paste into your Supabase SQL Editor. It sets up table columns and RLS policies for anonymous and authenticated access.
            </p>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
              {sqlSchema || '-- Loading schema...'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            CareerHub + Supabase v2 Realtime Data Layer
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
