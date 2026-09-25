import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Building2, 
  GraduationCap, 
  Briefcase,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { Job, Company } from '../../types';
import { JobCard } from '../jobs/JobCard';

interface LandingHeroProps {
  onSearch: (keyword: string, location: string) => void;
  onNavigate: (view: string, meta?: any) => void;
  featuredJobs: Job[];
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
  onToggleSaveJob: (jobId: string) => void;
  companies: Company[];
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSearch,
  onNavigate,
  featuredJobs,
  onSelectJob,
  onApplyJob,
  onToggleSaveJob,
  companies
}) => {
  const [keyword, setKeyword] = useState('');
  const [loc, setLoc] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword, loc);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] sm:text-xs font-semibold max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">Next-Gen Campus & Engineering Recruitment Infrastructure</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15] sm:leading-[1.1]">
            Where Top Tech Talent Meets Verified Opportunities.
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Designed for students, freshers, experienced engineers, and forward-thinking recruiters. 
            Features AI skill gap analysis, verified academic CGPA ranking, and automated appointment letter generation.
          </p>

          {/* High-Impact Unified Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="p-2 sm:p-2.5 bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-2 max-w-3xl mx-auto"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 sm:py-1.5 w-full bg-slate-50 sm:bg-transparent rounded-xl sm:rounded-none">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Role, skill, or company (e.g. React, Full Stack)..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 sm:py-1.5 w-full sm:max-w-[220px] bg-slate-50 sm:bg-transparent rounded-xl sm:rounded-none">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="City or 'Remote'..."
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 whitespace-nowrap min-h-[44px]"
            >
              Search Jobs
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap sm:justify-center text-xs text-slate-500 pt-1 pb-1">
            <span className="font-medium text-slate-400 shrink-0 text-[11px] sm:text-xs">Popular:</span>
            {['React Developer', 'Fresher / 0-1 yr', 'Remote Only', 'Node.js', '₹10+ LPA', 'AI / ML'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setKeyword(tag.includes('LPA') || tag.includes('Remote') || tag.includes('Fresher') ? '' : tag);
                  onSearch(tag.includes('LPA') || tag.includes('Remote') || tag.includes('Fresher') ? '' : tag, tag.includes('Remote') ? 'Remote' : '');
                }}
                className="px-2.5 py-1.5 sm:py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors shrink-0 text-[11px] sm:text-xs whitespace-nowrap"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Platform Metrics Bar */}
      <section className="bg-slate-900 text-white rounded-2xl p-5 sm:p-8 shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white tabular-nums">
              1,400+
            </div>
            <div className="text-[11px] sm:text-xs text-indigo-300 font-semibold mt-1">Verified Tech Openings</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Campus & fresher focus</div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-indigo-400 tabular-nums">
              94.8%
            </div>
            <div className="text-[11px] sm:text-xs text-indigo-300 font-semibold mt-1">ML Match Accuracy</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Semantic curriculum mapping</div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white tabular-nums">
              ₹8.5 LPA
            </div>
            <div className="text-[11px] sm:text-xs text-indigo-300 font-semibold mt-1">Average Starting CTC</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Across tier-1 partners</div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-emerald-400 tabular-nums">
              100%
            </div>
            <div className="text-[11px] sm:text-xs text-indigo-300 font-semibold mt-1">Verified Appointment Letters</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Downloadable legal PDF records</div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
              Curated Openings
            </span>
            <h2 className="text-2xl font-bold text-slate-950 mt-1">
              High-Growth Engineering Opportunities
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified corporate roles with transparent compensation and rapid interview timelines.
            </p>
          </div>

          <button
            onClick={() => onNavigate('jobs')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            Explore All 1,400+ Listings <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredJobs.slice(0, 6).map(job => (
            <JobCard
              key={job._id}
              job={job}
              onSelect={onSelectJob}
              onApply={onApplyJob}
              onToggleSave={onToggleSaveJob}
            />
          ))}
        </div>
      </section>

      {/* Core Workflow Pillars (3 Interactive Cards) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Architecture & Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">
            Engineered for Both Sides of the Hiring Table
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Students & Fresh Graduates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Showcase verified CGPA, portfolio projects, certifications, and internships. Get matched to openings matching your exact tech stack.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Track Application ID lifecycle
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Instant Video Interview links
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">ML Matching & Gap Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated multi-factor candidate scoring. Visualizes missing skills, benchmark gaps, and market salary forecasts for target engineering roles.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Weighted scoring (45% skill, 25% exp)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Predictive compensation calculator
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Recruiters & Enterprises</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kanban pipeline management, applicant resume inspections, live interview invitations, and 1-click legal PDF appointment letter issuance.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Kanban & Table applicant tracking
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Corporate appointment letter PDFs
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Partner Organizations */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Verified Hiring Partners
            </h3>
            <p className="text-xs text-slate-500">
              Leading technical teams currently active on CareerMatch Hub.
            </p>
          </div>

          <button
            onClick={() => onNavigate('companies')}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            View All Companies
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {companies.slice(0, 3).map(c => (
            <div
              key={c._id}
              onClick={() => onNavigate('companies')}
              className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:border-slate-300 transition-colors shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                {c.logo ? (
                  <img src={c.logo} alt={c.name} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded" />
                ) : (
                  <Building2 className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-xs truncate">{c.name}</h4>
                <p className="text-[11px] text-slate-500 truncate">{c.industry} · {c.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
