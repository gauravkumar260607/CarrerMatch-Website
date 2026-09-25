import React from 'react';
import { ShieldCheck, Sparkles, Building2, GraduationCap } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                CM
              </span>
              <span className="text-base font-bold text-slate-900 tracking-tight">CareerMatch</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              Intelligent career hub empowering engineering students, fresh graduates, recruiters, and innovative enterprises with ML-driven candidate scoring and verified credentials.
            </p>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Enterprise Placement Infrastructure</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3">For Candidates & Students</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-indigo-600 transition-colors">
                  Fresher & Campus Job Openings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ml_hub')} className="hover:text-indigo-600 transition-colors">
                  Resume-Job Match & Gap Analyzer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('profile')} className="hover:text-indigo-600 transition-colors">
                  Build Verified Academic Profile
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600 transition-colors">
                  Track Application Status
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3">For Employers & Recruiters</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-indigo-600 transition-colors">
                  Post New Opening
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600 transition-colors">
                  Candidate Pipeline Kanban
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600 transition-colors">
                  Generate Appointment Letter PDFs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('companies')} className="hover:text-indigo-600 transition-colors">
                  Company Directory & Showcase
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3">ML Intelligence Engine</h4>
            <p className="text-slate-500 leading-relaxed text-[11px] mb-3">
              Powered by multi-factor semantic skill mapping, curriculum alignment, and market compensation indices.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block font-semibold text-slate-900 text-[11px]">Campus Placement Portal</span>
              <span className="text-[10px] text-slate-500">Connecting Tier-1 tech teams with top university talent</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <p>© 2026 CareerMatch Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-600 cursor-pointer">Recruiter Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
