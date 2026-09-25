import React from 'react';
import { Bookmark, Sparkles, Building2, MapPin, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Job } from '../../types';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  onApply: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  isSaved?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  onApply,
  onToggleSave,
  isSaved = false
}) => {
  const formatSalary = (min: number, max: number) => {
    const minLakhs = (min / 100000).toFixed(1);
    const maxLakhs = (max / 100000).toFixed(1);
    return `₹${minLakhs} - ${maxLakhs} LPA`;
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    return `Posted ${days}d ago`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between group">
      <div>
        {/* Top zone: Logo, Title, and Save button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    // Fallback to building icon
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div>
              <h3 
                onClick={() => onSelect(job)}
                className="font-semibold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer"
              >
                {job.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {job.companyName}
              </p>
            </div>
          </div>

          <button
            onClick={() => onToggleSave(job._id)}
            className={`p-2 rounded-lg border transition-colors shrink-0 ${
              isSaved || job.isSaved
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={isSaved || job.isSaved ? 'Saved to bookmarks' : 'Save job'}
            aria-label="Save job"
          >
            <Bookmark className={`w-4 h-4 ${isSaved || job.isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Clean unboxed metadata with dot separators */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-3.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{job.workMode}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{job.experienceLevel}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{job.jobType}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {job.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 5).map(skill => (
            <span
              key={skill}
              className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-[11px] text-slate-400 self-center">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Zone: Salary, ML Match & Action CTAs */}
      <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Offered CTC</div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
              {formatSalary(job.minSalary, job.maxSalary)}
            </div>
          </div>

          {/* ML Match pill or status */}
          {job.mlMatchScore !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-mono tabular-nums">{job.mlMatchScore}%</span> Match
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {job.hasApplied ? (
            <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 sm:py-1.5 rounded-lg font-medium border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Applied
            </span>
          ) : (
            <button
              onClick={() => onApply(job)}
              className="flex-1 sm:flex-initial px-4 py-2 sm:py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap text-center min-h-[36px] flex items-center justify-center"
            >
              Apply Now
            </button>
          )}

          <button
            onClick={() => onSelect(job)}
            className="p-2 sm:p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
            title="View details"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
