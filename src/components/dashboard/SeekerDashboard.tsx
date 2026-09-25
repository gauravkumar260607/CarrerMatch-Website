import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Award, 
  Bookmark, 
  ExternalLink, 
  Video, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Download,
  AlertCircle,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Application, Job, ApplicationStatus } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { AppointmentLetterModal } from './AppointmentLetterModal';

interface SeekerDashboardProps {
  onNavigate: (view: string, meta?: any) => void;
  onOpenJobDetail: (job: Job) => void;
}

export const SeekerDashboard: React.FC<SeekerDashboardProps> = ({
  onNavigate,
  onOpenJobDetail
}) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'interviews' | 'saved'>('applications');
  
  // Selected appointment letter for preview modal
  const [selectedAppForLetter, setSelectedAppForLetter] = useState<Application | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appRes, savedRes] = await Promise.all([
        api.getApplications(),
        api.getSavedJobs()
      ]);
      setApplications(appRes.applications || []);
      setSavedJobs(savedRes.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const interviews = applications.filter(a => a.status === 'Interview' && a.interviewDetails);
  const selections = applications.filter(a => a.status === 'Selected' && a.appointmentLetter);

  // Profile completeness check
  const profile = user?.profile;
  const hasEdu = Boolean(profile?.education && profile.education.length > 0);
  const hasSkills = Boolean(profile?.skills && profile.skills.length >= 3);
  const hasProjects = Boolean(profile?.projects && profile.projects.length >= 1);
  const hasResume = Boolean(profile?.resumeUrl);
  const completenessScore = (hasEdu ? 25 : 0) + (hasSkills ? 25 : 0) + (hasProjects ? 25 : 0) + (hasResume ? 25 : 0);

  const pipelineStages: ApplicationStatus[] = [
    'Applied', 
    'Under Review', 
    'Shortlisted', 
    'Interview', 
    'Selected'
  ];

  const getStageIndex = (status: ApplicationStatus) => {
    if (status === 'Rejected') return -1;
    return pipelineStages.indexOf(status);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Welcome */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
            Job Seeker Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Welcome back, {user?.name || 'Aarav'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your ongoing job applications, interview invites, and formal appointment letters.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('jobs')}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap text-center"
          >
            Browse Openings
          </button>
          <button
            onClick={() => onNavigate('ml_hub')}
            className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gap Analyzer
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-3.5">
        <div 
          onClick={() => setActiveTab('applications')}
          className="bg-white border border-slate-200 rounded-xl p-4.5 cursor-pointer hover:border-slate-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Active Applications</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
            {applications.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Live pipeline entries</span>
        </div>

        <div 
          onClick={() => setActiveTab('interviews')}
          className="bg-white border border-slate-200 rounded-xl p-4.5 cursor-pointer hover:border-slate-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Interviews Scheduled</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
            {interviews.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Action required</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Official Offers Issued</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-2">
            {selections.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Appointment letters ready</span>
        </div>

        <div 
          onClick={() => setActiveTab('saved')}
          className="bg-white border border-slate-200 rounded-xl p-4.5 cursor-pointer hover:border-slate-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Bookmarked Jobs</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
            {savedJobs.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Saved for later</span>
        </div>
      </div>

      {/* Profile Completeness Alert (if < 100) */}
      {completenessScore < 100 && (
        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
              {completenessScore}%
            </div>
            <div>
              <h4 className="font-semibold text-xs text-white">
                Complete your candidate profile to increase ML recruiter match rate!
              </h4>
              <p className="text-[11px] text-slate-300">
                {!hasEdu ? 'Add education & CGPA' : !hasSkills ? 'Add at least 3 skills' : !hasProjects ? 'Add portfolio projects' : 'Add resume link'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            Update Profile
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-medium overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'applications'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Pipeline ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('interviews')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'interviews'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Interviews ({interviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'saved'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Jobs ({savedJobs.length})</span>
        </button>
      </div>

      {/* Tab 1: Application Pipeline */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading application records...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 rounded-xl text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 text-sm">No applications submitted yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore our curated listings for freshers and students and apply with one click.
              </p>
              <button
                onClick={() => onNavigate('jobs')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Find Jobs Now
              </button>
            </div>
          ) : (
            applications.map((app) => {
              const currentStageIdx = getStageIndex(app.status);
              const isRejected = app.status === 'Rejected';

              return (
                <div
                  key={app._id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {app.companyLogo ? (
                          <img
                            src={app.companyLogo}
                            alt={app.companyName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            {app.jobTitle}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {app.companyName} · Ref: <span className="font-mono font-semibold text-slate-800">{app.applicationId}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Submitted on {new Date(app.appliedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      {app.mlMatchScore !== undefined && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                          <Sparkles className="w-3 h-3" />
                          <span className="font-mono tabular-nums">{app.mlMatchScore}%</span> Match
                        </span>
                      )}
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </div>

                  {/* 5-Step Pipeline Tracker */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Application Progression Pipeline
                    </span>

                    {isRejected ? (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>This application is not moving forward at this time. Recruiter note recorded.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-1 text-center">
                        {pipelineStages.map((stage, idx) => {
                          const isCompleted = idx <= currentStageIdx;
                          const isCurrent = idx === currentStageIdx;

                          return (
                            <div key={stage} className="flex flex-col items-center min-w-0">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all mb-1 shrink-0 ${
                                  isCompleted
                                    ? isCurrent
                                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                      : 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {idx < currentStageIdx ? '✓' : idx + 1}
                              </div>
                              <span
                                className={`text-[9px] sm:text-[11px] leading-tight truncate max-w-full block ${
                                  isCurrent
                                    ? 'font-bold text-indigo-900'
                                    : isCompleted
                                    ? 'font-medium text-slate-700'
                                    : 'text-slate-400'
                                }`}
                                title={stage}
                              >
                                {stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Contextual Action Banners */}
                  {/* If Interview Scheduled */}
                  {app.status === 'Interview' && app.interviewDetails && (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <Calendar className="w-4 h-4 text-amber-700" />
                          <span>Interview Scheduled: {app.interviewDetails.scheduledDate} at {app.interviewDetails.scheduledTime}</span>
                        </div>
                        <p className="text-amber-800 text-[11px] mt-0.5">
                          Round: {app.interviewDetails.type} · Panel: {app.interviewDetails.interviewers}
                        </p>
                      </div>

                      <a
                        href={app.interviewDetails.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Meeting Call
                      </a>
                    </div>
                  )}

                  {/* If Selected & Appointment Letter Ready */}
                  {app.status === 'Selected' && app.appointmentLetter && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Offer Approved & Appointment Letter Issued!</span>
                        </div>
                        <p className="text-emerald-800 text-[11px] mt-0.5 font-mono">
                          Offered CTC: ₹{app.appointmentLetter.salaryOffered.toLocaleString('en-IN')} · Joining: {app.appointmentLetter.joiningDate}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedAppForLetter(app)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View & Download Offer Letter
                      </button>
                    </div>
                  )}

                  {/* Expandable latest recruiter note */}
                  {app.statusHistory && app.statusHistory.length > 0 && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Latest Update:</span>
                      <span className="text-slate-700 italic">
                        "{app.statusHistory[app.statusHistory.length - 1].note || 'Status updated.'}"
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Interview Schedules List */}
      {activeTab === 'interviews' && (
        <div className="space-y-3">
          {interviews.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No live interviews scheduled currently. Shortlisted candidates are invited as reviews progress.
            </div>
          ) : (
            interviews.map(app => (
              <div
                key={app._id}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1">
                    Scheduled Interview Round
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{app.jobTitle} at {app.companyName}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Date: <strong className="text-slate-800">{app.interviewDetails?.scheduledDate}</strong></span>
                    <span>·</span>
                    <span>Time: <strong className="text-slate-800">{app.interviewDetails?.scheduledTime}</strong></span>
                    <span>·</span>
                    <span>Panel: {app.interviewDetails?.interviewers}</span>
                  </div>
                  {app.interviewDetails?.notes && (
                    <p className="text-[11px] text-slate-600 mt-1 italic">
                      Note: {app.interviewDetails.notes}
                    </p>
                  )}
                </div>

                <a
                  href={app.interviewDetails?.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
                >
                  <Video className="w-4 h-4" />
                  Launch Video Call
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Saved Jobs */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          {savedJobs.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              You haven't bookmarked any jobs yet. Save interesting jobs while exploring to apply later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedJobs.map(job => (
                <div key={job._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 
                      onClick={() => onOpenJobDetail(job)}
                      className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      {job.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">{job.companyName} · {job.location}</p>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-2 tabular-nums">
                      ₹{(job.minSalary / 100000).toFixed(1)} - {(job.maxSalary / 100000).toFixed(1)} LPA
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-3">
                    <button
                      onClick={() => onOpenJobDetail(job)}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      View Full Details
                    </button>
                    <button
                      onClick={() => onNavigate('jobs')}
                      className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointment Letter Modal Preview */}
      <AppointmentLetterModal
        application={selectedAppForLetter}
        isOpen={Boolean(selectedAppForLetter)}
        onClose={() => setSelectedAppForLetter(null)}
      />
    </div>
  );
};
