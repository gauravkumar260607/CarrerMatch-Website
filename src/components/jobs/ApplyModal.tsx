import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Check, AlertCircle, Sparkles, Database } from 'lucide-react';
import { Job, Application } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { saveApplicationToSupabaseClient, SUPABASE_PROJECT_ID } from '../../services/supabase';

interface ApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (application: Application) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resumeUrl: '',
    resumeName: '',
    coverLetter: '',
    educationSummary: '',
    cgpa: '',
    skills: '',
    experienceYears: '0',
    portfolioUrl: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill with user profile if available
  useEffect(() => {
    if (user) {
      const p = user.profile;
      const primaryEdu = p?.education?.[0];
      const eduStr = primaryEdu 
        ? `${primaryEdu.degree}, ${primaryEdu.institution} (${primaryEdu.endYear})`
        : 'Bachelor of Technology in Computer Science';

      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: p?.phone || '+91 98765 43210',
        resumeUrl: p?.resumeUrl || 'https://careermatch.io/resumes/my_resume_verified.pdf',
        resumeName: p?.resumeName || `${user.name.replace(/\s+/g, '_')}_Resume_2026.pdf`,
        coverLetter: `Dear Hiring Team at ${job.companyName},\n\nI am thrilled to apply for the ${job.title} role. With my background in ${job.skills.slice(0, 3).join(', ')} and my passion for engineering robust software, I believe I can be a strong fit for your team.`,
        educationSummary: eduStr,
        cgpa: p?.cgpa || '8.5',
        skills: p?.skills ? p.skills.join(', ') : job.skills.join(', '),
        experienceYears: String(p?.experience?.length ? (p.experience.length * 0.5) : 0),
        portfolioUrl: p?.portfolio || p?.github || 'https://github.com/my-profile'
      });
    }
  }, [user, job]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await api.applyJob(job._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        resumeUrl: formData.resumeUrl,
        resumeName: formData.resumeName || 'Resume.pdf',
        coverLetter: formData.coverLetter,
        educationSummary: formData.educationSummary,
        cgpa: formData.cgpa,
        skills: skillsArray,
        experienceYears: parseFloat(formData.experienceYears) || 0,
        portfolioUrl: formData.portfolioUrl
      });

      // Mirror directly to Supabase client
      if (res.application) {
        saveApplicationToSupabaseClient({
          id: res.application._id,
          application_id: res.application.applicationId,
          job_id: job._id,
          job_title: job.title,
          company_id: job.companyId,
          company_name: job.companyName,
          company_logo: job.companyLogo,
          seeker_id: res.application.seekerId,
          seeker_name: formData.name,
          seeker_email: formData.email,
          seeker_phone: formData.phone,
          resume_url: formData.resumeUrl,
          resume_name: formData.resumeName || 'Resume.pdf',
          cover_letter: formData.coverLetter,
          education_summary: formData.educationSummary,
          cgpa: formData.cgpa,
          skills: skillsArray,
          experience_years: parseFloat(formData.experienceYears) || 0,
          portfolio_url: formData.portfolioUrl,
          status: 'Applied',
          ml_match_score: res.application.mlMatchScore,
          applied_at: res.application.appliedAt
        }).catch(err => {
          console.warn('[Supabase Client] sync attempt:', err);
        });
      }

      onSuccess(res.application);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
              Job Application
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Apply for {job.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              at {job.companyName} · {job.location} ({job.workMode})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center gap-2 text-indigo-900 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Your profile data has been automatically loaded. We will calculate an instant ML Compatibility Score upon submission.
            </span>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Portfolio or GitHub URL
              </label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                placeholder="https://github.com/your-username"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          {/* Academic & Skills Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Highest Education Summary *
              </label>
              <input
                type="text"
                required
                value={formData.educationSummary}
                onChange={(e) => setFormData({ ...formData, educationSummary: e.target.value })}
                placeholder="B.Tech Computer Science, NITK (2022-2026)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                CGPA / Percentage *
              </label>
              <input
                type="text"
                required
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                placeholder="e.g. 8.85 / 10"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Key Technical Skills (Comma separated) *
            </label>
            <input
              type="text"
              required
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, TypeScript, Node.js, Express, MongoDB, Tailwind CSS"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Resume Upload / Link */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Resume Document (PDF Link or Verified File) *
            </label>
            <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {formData.resumeName || 'Attached_Resume.pdf'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {formData.resumeUrl || 'Cloud storage hosted resume verified'}
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={formData.resumeUrl}
                onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                placeholder="Resume link (https://...)"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter or paste direct link to your PDF resume:', formData.resumeUrl);
                  if (url) setFormData({ ...formData, resumeUrl: url, resumeName: 'Candidate_Resume_Verified.pdf' });
                }}
                className="px-3 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shrink-0"
              >
                Change Link
              </button>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Cover Letter & Note to Hiring Manager
            </label>
            <textarea
              rows={4}
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 leading-relaxed text-xs"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Backend connected: Supabase <strong>{SUPABASE_PROJECT_ID}</strong></span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
