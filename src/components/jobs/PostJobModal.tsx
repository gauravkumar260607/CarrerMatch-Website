import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle, Building2, Database, Sparkles, UserCheck } from 'lucide-react';
import { Job, WorkMode, JobType, ExperienceLevel } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { saveJobToSupabaseClient, SUPABASE_PROJECT_ID } from '../../services/supabase';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newJob: Job) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, switchDemoAccount } = useAuth();
  const [title, setTitle] = useState('Full Stack Software Engineer');
  const [location, setLocation] = useState('Bangalore, Karnataka');
  const [workMode, setWorkMode] = useState<WorkMode>('Hybrid');
  const [jobType, setJobType] = useState<JobType>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Fresher');
  const [minSalary, setMinSalary] = useState('750000');
  const [maxSalary, setMaxSalary] = useState('1200000');
  const [skills, setSkills] = useState('React, TypeScript, Node.js, Express, MongoDB, Tailwind CSS');
  const [description, setDescription] = useState(
    'We are seeking a talented, proactive Full Stack Engineer to join our high-velocity engineering team. You will build resilient, modern user interfaces, architect scalable RESTful APIs, and contribute directly to production releases.'
  );
  const [responsibilities, setResponsibilities] = useState(
    'Develop modular, responsive web interfaces with React and Tailwind CSS.\nDesign RESTful APIs and integrate scalable database queries.\nParticipate in code reviews, automated unit testing, and team agile sprints.'
  );
  const [requirements, setRequirements] = useState(
    'Bachelor degree in Computer Science, Engineering, or relevant technical field.\nStrong fundamentals in JavaScript, TypeScript, and modern data structures.\nFamiliarity with Git version control, REST APIs, and responsive design.'
  );
  const [benefits, setBenefits] = useState(
    'Comprehensive Family Medical Health Insurance\nFlexible Hybrid Work Arrangement\nAnnual Learning & Upskilling Stipend\nMacBook Pro & Home Office Hardware Allowance'
  );
  const [deadline, setDeadline] = useState('2026-12-31');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Auto-switch to recruiter if not already recruiter/admin
      if (user && user.role !== 'recruiter' && user.role !== 'admin') {
        await switchDemoAccount('recruiter');
      }

      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const respArray = responsibilities.split('\n').map(s => s.trim()).filter(Boolean);
      const reqArray = requirements.split('\n').map(s => s.trim()).filter(Boolean);
      const benArray = benefits.split('\n').map(s => s.trim()).filter(Boolean);

      const res = await api.createJob({
        title,
        location,
        workMode,
        jobType,
        experienceLevel,
        minSalary: parseInt(minSalary, 10),
        maxSalary: parseInt(maxSalary, 10),
        skills: skillsArray,
        description: description || `Join our engineering team as ${title}.`,
        responsibilities: respArray,
        requirements: reqArray,
        benefits: benArray,
        deadline
      });

      // Mirror to Supabase client
      if (res.job) {
        saveJobToSupabaseClient(res.job).catch(err => {
          console.warn('[Supabase Client] Job sync notice:', err);
        });
      }

      onSuccess(res.job);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to post job opening.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
              Recruiter Job Studio
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Post New Career Opportunity
            </h2>
            <p className="text-xs text-slate-500">
              Publish opening to campus talent and experienced applicants.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Associate Full Stack Engineer"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              >
                <option value="Fresher">Fresher / 0-1 yr</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Primary Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, Karnataka"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Min Salary (INR CTC)</label>
              <input
                type="number"
                required
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Salary (INR CTC)</label>
              <input
                type="number"
                required
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Required Technical Skills (Comma separated) *
            </label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, TypeScript, Node.js, Express, MongoDB"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Job Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of the mission, day-to-day impact, and engineering culture..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Key Responsibilities (One per line)
            </label>
            <textarea
              rows={3}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Requirements & Qualifications (One per line)
            </label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Saves to Supabase (<strong>{SUPABASE_PROJECT_ID}</strong>) · Table: <code>public.jobs</code></span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                {submitting ? 'Publishing...' : 'Publish Job Opening'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
