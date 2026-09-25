import React, { useState } from 'react';
import { Search, MapPin, Filter, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { WorkMode, JobType, ExperienceLevel } from '../../types';

interface JobFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  workMode: string;
  onWorkModeChange: (val: string) => void;
  jobType: string;
  onJobTypeChange: (val: string) => void;
  experienceLevel: string;
  onExperienceLevelChange: (val: string) => void;
  minSalary: string;
  onMinSalaryChange: (val: string) => void;
  selectedSkill: string;
  onSkillChange: (val: string) => void;
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  onReset: () => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  search,
  onSearchChange,
  location,
  onLocationChange,
  workMode,
  onWorkModeChange,
  jobType,
  onJobTypeChange,
  experienceLevel,
  onExperienceLevelChange,
  minSalary,
  onMinSalaryChange,
  selectedSkill,
  onSkillChange,
  dateFilter,
  onDateFilterChange,
  sortBy,
  onSortByChange,
  onReset
}) => {
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);

  const POPULAR_SKILLS = [
    'React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 'Docker', 'AWS', 'Tailwind CSS'
  ];

  const activeCount = [
    workMode && workMode !== 'All',
    jobType && jobType !== 'All',
    experienceLevel && experienceLevel !== 'All',
    Boolean(minSalary),
    Boolean(dateFilter),
    Boolean(selectedSkill)
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(
    search || location || activeCount > 0
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-sm space-y-3.5">
      {/* Primary search row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3">
        {/* Keyword Search */}
        <div className="sm:col-span-2 md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search role, company, or skill (e.g. React, NexaTech)..."
            className="w-full pl-10 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Location Input */}
        <div className="sm:col-span-1 md:col-span-3 relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="City or 'Remote'..."
            className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Sort selector */}
        <div className="sm:col-span-1 md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="match">Sort: AI Best Match</option>
            <option value="salary_high">Sort: Salary (High to Low)</option>
            <option value="salary_low">Sort: Salary (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Mobile Collapsible Toggle Bar */}
      <div className="flex sm:hidden items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
          <span>{mobileFiltersExpanded ? 'Hide Criteria' : 'Filter by Criteria'}</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
          {mobileFiltersExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Secondary filter chips and dropdowns */}
      <div className={`${mobileFiltersExpanded ? 'grid' : 'hidden sm:grid'} grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs`}>
        {/* Work Mode */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Work Mode</label>
          <select
            value={workMode}
            onChange={(e) => onWorkModeChange(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800"
          >
            <option value="All">All Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Experience</label>
          <select
            value={experienceLevel}
            onChange={(e) => onExperienceLevelChange(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800"
          >
            <option value="All">All Experience</option>
            <option value="Fresher">Fresher / 0-1 yr</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Employment</label>
          <select
            value={jobType}
            onChange={(e) => onJobTypeChange(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800"
          >
            <option value="All">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        {/* Min Salary Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min Salary (CTC)</label>
          <select
            value={minSalary}
            onChange={(e) => onMinSalaryChange(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800"
          >
            <option value="">Any CTC</option>
            <option value="500000">₹5+ LPA</option>
            <option value="800000">₹8+ LPA</option>
            <option value="1200000">₹12+ LPA</option>
            <option value="1800000">₹18+ LPA</option>
          </select>
        </div>

        {/* Date Posted */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date Posted</label>
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800"
          >
            <option value="">Any Time</option>
            <option value="today">Past 24 Hours</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>
        </div>
      </div>

      {/* Popular skill quick filters */}
      <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
          <span className="text-slate-400 font-medium text-[11px] mr-1 shrink-0">Tech:</span>
          {POPULAR_SKILLS.map(skill => (
            <button
              key={skill}
              onClick={() => onSkillChange(selectedSkill === skill ? '' : skill)}
              className={`px-2.5 py-1 rounded text-xs transition-colors font-medium shrink-0 whitespace-nowrap ${
                selectedSkill === skill
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="hidden sm:inline-flex text-xs text-rose-600 hover:text-rose-700 font-medium items-center gap-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
