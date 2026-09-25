import React from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Job, Company } from '../../types';

interface JobDetailModalProps {
  job: Job;
  company?: Company;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  isSaved?: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  company,
  isOpen,
  onClose,
  onApply,
  onToggleSave,
  isSaved = false
}) => {
  if (!isOpen) return null;

  const formatSalary = (min: number, max: number) => {
    return `₹${(min / 100000).toFixed(1)} - ${(max / 100000).toFixed(1)} LPA`;
  };

  const ml = job.mlMatchDetails;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1.5 shadow-sm">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building2 className="w-7 h-7 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  {job.companyName}
                </span>
                {company?.verified && (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Employer
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {job.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
                <span aria-hidden="true">·</span>
                <span>{job.workMode}</span>
                <span aria-hidden="true">·</span>
                <span>{job.experienceLevel}</span>
                <span aria-hidden="true">·</span>
                <span>{job.jobType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleSave(job._id)}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved || job.isSaved
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Save"
            >
              <Bookmark className={`w-4 h-4 ${isSaved || job.isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Salary Compensation</span>
              <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                {formatSalary(job.minSalary, job.maxSalary)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Experience Target</span>
              <span className="font-semibold text-slate-900">{job.experienceLevel}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Work Arrangement</span>
              <span className="font-semibold text-slate-900">{job.workMode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Application Deadline</span>
              <span className="font-semibold text-slate-900">
                {new Date(job.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* ML Intelligence Match Analysis Card */}
          {ml && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/60 to-purple-50/40 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-indigo-600 text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-xs text-indigo-950">
                    ML Candidate Compatibility Score: <strong className="font-mono tabular-nums text-indigo-700">{ml.overallScore}%</strong> ({ml.compatibilityTier})
                  </span>
                </div>
                <div className="text-[11px] font-medium text-indigo-700">
                  Skill Alignment: {ml.skillScore}%
                </div>
              </div>

              {/* Matched vs Missing Skills breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 bg-white/80 rounded-lg border border-indigo-100">
                  <span className="block text-[11px] font-semibold text-emerald-800 mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Matched Skills ({ml.matchedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {ml.matchedSkills.length > 0 ? (
                      ml.matchedSkills.map(s => (
                        <span key={s} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No direct keyword overlap found</span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 bg-white/80 rounded-lg border border-indigo-100">
                  <span className="block text-[11px] font-semibold text-amber-800 mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Recommended Growth Skills ({ml.missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {ml.missingSkills.length > 0 ? (
                      ml.missingSkills.map(s => (
                        <span key={s} className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-medium">All required skills mastered!</span>
                    )}
                  </div>
                </div>
              </div>

              {ml.recommendations && ml.recommendations.length > 0 && (
                <p className="text-[11px] text-indigo-900 bg-white/60 p-2 rounded border border-indigo-100/50">
                  <strong>Career Advisor Tip:</strong> {ml.recommendations[0]}
                </p>
              )}
            </div>
          )}

          {/* About the Role */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Role Overview</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
              {job.description}
            </p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Key Responsibilities</h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {job.responsibilities.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements & Qualifications */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Candidate Requirements & Qualifications</h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Tech Stack */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Required Technical Stack</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map(s => (
                <span
                  key={s}
                  className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Perks & Benefits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.benefits.map((b, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company Brief */}
          {company && (
            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-2">About {company.name}</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-3">
                {company.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span>Industry: {company.industry}</span>
                <span>·</span>
                <span>Team Size: {company.employeeCount}</span>
                <span>·</span>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-900">{job.applicantsCount || 0} candidates</span> applied for this role
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Close
            </button>

            {job.hasApplied ? (
              <span className="px-5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Already Applied ({job.applicationId})
              </span>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onApply(job);
                }}
                className="px-6 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
              >
                Apply for this Position
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
