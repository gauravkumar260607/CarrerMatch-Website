import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Users, 
  Briefcase, 
  Calendar, 
  Award, 
  FileText, 
  MoreVertical, 
  Filter, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Eye, 
  Video, 
  LayoutGrid, 
  ListFilter,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Application, Job, Company, ApplicationStatus } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { InterviewSchedulerModal } from './InterviewSchedulerModal';
import { IssueOfferModal } from './IssueOfferModal';
import { AppointmentLetterModal } from './AppointmentLetterModal';
import { deleteJobFromSupabaseClient } from '../../services/supabase';

interface RecruiterDashboardProps {
  onOpenPostJob: () => void;
  onOpenJobDetail: (job: Job) => void;
  onJobDeleted?: (jobId: string) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  onOpenPostJob,
  onOpenJobDetail,
  onJobDeleted
}) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'applicants' | 'jobs' | 'company'>('applicants');
  const [pipelineView, setPipelineView] = useState<'kanban' | 'table'>('kanban');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [interviewModalApp, setInterviewModalApp] = useState<Application | null>(null);
  const [offerModalApp, setOfferModalApp] = useState<Application | null>(null);
  const [letterPreviewApp, setLetterPreviewApp] = useState<Application | null>(null);
  const [candidateDetailApp, setCandidateDetailApp] = useState<Application | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState(false);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  const fetchRecruiterData = async () => {
    setLoading(true);
    try {
      const [appRes, compRes] = await Promise.all([
        api.getApplications(),
        api.getCompanies()
      ]);
      setApplications(appRes.applications || []);
      setJobs(appRes.jobs || []);

      // Match recruiter company if any
      if (user?.companyId) {
        const found = compRes.companies.find(c => c._id === user.companyId);
        if (found) setCompany(found);
      } else if (compRes.companies.length > 0) {
        setCompany(compRes.companies[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterData();
  }, [user]);

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus, note?: string) => {
    try {
      const res = await api.updateApplicationStatus(appId, {
        status: newStatus,
        note: note || `Candidate status shifted to ${newStatus} by recruiter`
      });

      setApplications(prev =>
        prev.map(a => (a._id === appId ? res.application : a))
      );

      if (candidateDetailApp?._id === appId) {
        setCandidateDetailApp(res.application);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update candidate status');
    }
  };

  const handleInitiateDelete = (job: Job) => {
    setJobToDelete(job);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    setDeletingJob(true);
    try {
      await api.deleteJob(jobToDelete._id);
      
      // Also delete directly via Supabase client
      deleteJobFromSupabaseClient(jobToDelete._id).catch(err => {
        console.warn('[Supabase Client] Delete notice:', err);
      });

      setJobs(prev => prev.filter(j => j._id !== jobToDelete._id));
      setApplications(prev => prev.filter(a => a.jobId !== jobToDelete._id));
      
      if (onJobDeleted) {
        onJobDeleted(jobToDelete._id);
      }

      setDeleteToast(`Job opening "${jobToDelete.title}" was deleted successfully and removed from Supabase.`);
      setTimeout(() => setDeleteToast(null), 5000);
      setJobToDelete(null);
    } catch (err: any) {
      setDeleteToast(err.message || 'Failed to delete job posting.');
      setTimeout(() => setDeleteToast(null), 5000);
    } finally {
      setDeletingJob(false);
    }
  };

  // Filtered applicants
  const filteredApplicants = applications.filter(app => {
    const matchesJob = selectedJobFilter === 'all' || app.jobId === selectedJobFilter;
    const matchesSearch = !searchQuery || 
      app.seekerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesJob && matchesSearch;
  });

  const stages: ApplicationStatus[] = [
    'Applied', 
    'Under Review', 
    'Shortlisted', 
    'Interview', 
    'Selected'
  ];

  return (
    <div className="space-y-6">
      {/* Action Toast */}
      {deleteToast && (
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{deleteToast}</span>
          </div>
          <button
            onClick={() => setDeleteToast(null)}
            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 rounded transition-colors text-slate-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-2 shadow-inner">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name}
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
                Recruiter Talent Suite
              </span>
              {company?.verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Employer
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {company?.name || 'Enterprise Recruiter Portal'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as <strong>{user?.name}</strong> · {jobs.length} Active Postings · {applications.length} Applicants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPostJob}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Create Job Opening
          </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Candidates</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1.5">
            {applications.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all active jobs</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Interviews Scheduled</span>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1.5">
            {applications.filter(a => a.status === 'Interview').length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Rounds in progress</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Selected / Offers Issued</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1.5">
            {applications.filter(a => a.status === 'Selected').length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Appointment letters generated</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Active Job Openings</span>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-1.5">
            {jobs.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Currently accepting talent</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-0">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'applicants'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Applicant Tracking Pipeline ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            My Job Postings ({jobs.length})
          </button>
        </div>

        {activeTab === 'applicants' && (
          <div className="flex items-center gap-1.5 pb-2">
            <button
              onClick={() => setPipelineView('kanban')}
              className={`p-1.5 rounded border transition-colors ${
                pipelineView === 'kanban'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPipelineView('table')}
              className={`p-1.5 rounded border transition-colors ${
                pipelineView === 'table'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
              title="Table View"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Applicants Pipeline */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 font-medium">Filter by Role:</span>
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Jobs ({jobs.length})</option>
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>{j.title}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
              />
            </div>
          </div>

          {/* Kanban Board View */}
          {pipelineView === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto min-h-[500px]">
              {stages.map((stage) => {
                const stageApplicants = filteredApplicants.filter(a => a.status === stage);

                return (
                  <div
                    key={stage}
                    className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-col min-w-[240px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800">{stage}</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded-full border border-slate-200 font-mono">
                          {stageApplicants.length}
                        </span>
                      </div>
                    </div>

                    {/* Cards Column */}
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                      {stageApplicants.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-[11px] italic">
                          No candidates in {stage}
                        </div>
                      ) : (
                        stageApplicants.map(app => (
                          <div
                            key={app._id}
                            className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-slate-300 transition-all space-y-2 group"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <h4 
                                  onClick={() => setCandidateDetailApp(app)}
                                  className="font-bold text-slate-900 text-xs hover:text-indigo-600 cursor-pointer transition-colors"
                                >
                                  {app.seekerName}
                                </h4>
                                <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                                  {app.jobTitle}
                                </p>
                              </div>

                              {app.mlMatchScore !== undefined && (
                                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100">
                                  {app.mlMatchScore}%
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-500 space-y-0.5">
                              <p className="truncate">CGPA: <strong>{app.cgpa}</strong> · Exp: {app.experienceYears}y</p>
                              <p className="font-mono text-[10px] text-slate-400">ID: {app.applicationId}</p>
                            </div>

                            {/* Skills snippet */}
                            <div className="flex flex-wrap gap-1">
                              {app.skills.slice(0, 3).map(s => (
                                <span key={s} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <button
                                onClick={() => setCandidateDetailApp(app)}
                                className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
                              >
                                <Eye className="w-3 h-3" />
                                Inspect
                              </button>

                              <div className="flex items-center gap-1">
                                {stage === 'Applied' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app._id, 'Under Review')}
                                    className="px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    Review
                                  </button>
                                )}
                                {stage === 'Under Review' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                                    className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                                  >
                                    Shortlist
                                  </button>
                                )}
                                {stage === 'Shortlisted' && (
                                  <button
                                    onClick={() => setInterviewModalApp(app)}
                                    className="px-2 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 rounded hover:bg-amber-100 transition-colors"
                                  >
                                    Interview
                                  </button>
                                )}
                                {stage === 'Interview' && (
                                  <button
                                    onClick={() => setOfferModalApp(app)}
                                    className="px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
                                  >
                                    Select Candidate
                                  </button>
                                )}
                                {stage === 'Selected' && app.appointmentLetter && (
                                  <button
                                    onClick={() => setLetterPreviewApp(app)}
                                    className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors flex items-center gap-0.5"
                                  >
                                    <FileText className="w-3 h-3" />
                                    Letter
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Candidate & Ref</th>
                      <th className="p-3.5">Role Applied</th>
                      <th className="p-3.5">Education / CGPA</th>
                      <th className="p-3.5">ML Match</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplicants.map(app => (
                      <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <p 
                            onClick={() => setCandidateDetailApp(app)}
                            className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                          >
                            {app.seekerName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">{app.applicationId}</p>
                        </td>
                        <td className="p-3.5 font-medium text-slate-800">
                          {app.jobTitle}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <div>CGPA: <strong className="text-slate-900">{app.cgpa}</strong></div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{app.educationSummary}</div>
                        </td>
                        <td className="p-3.5">
                          {app.mlMatchScore !== undefined ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
                              <Sparkles className="w-3 h-3" />
                              {app.mlMatchScore}%
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={app.status} size="sm" />
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setCandidateDetailApp(app)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50"
                            >
                              Details
                            </button>
                            {app.status === 'Shortlisted' && (
                              <button
                                onClick={() => setInterviewModalApp(app)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded"
                              >
                                Schedule
                              </button>
                            )}
                            {app.status === 'Interview' && (
                              <button
                                onClick={() => setOfferModalApp(app)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                              >
                                Select & Offer
                              </button>
                            )}
                            {app.status === 'Selected' && app.appointmentLetter && (
                              <button
                                onClick={() => setLetterPreviewApp(app)}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded"
                              >
                                Letter PDF
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Job Postings */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Active Job Postings ({jobs.length})
            </h3>
            <button
              onClick={onOpenPostJob}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Job Opening
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(job => (
              <div key={job._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 
                        onClick={() => onOpenJobDetail(job)}
                        className="font-bold text-slate-900 text-base hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {job.location} · {job.workMode} · {job.experienceLevel}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      job.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <p className="text-xs font-mono font-bold text-slate-900 mt-2">
                    ₹{(job.minSalary / 100000).toFixed(1)} - {(job.maxSalary / 100000).toFixed(1)} LPA
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
                    <span><strong>{job.applicantsCount || 0}</strong> Candidates Applied</span>
                    <span>·</span>
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setSelectedJobFilter(job._id);
                      setActiveTab('applicants');
                    }}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    View Applicants ({job.applicantsCount || 0})
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenJobDetail(job)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleInitiateDelete(job)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Full Detail Drawer / Modal */}
      {candidateDetailApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                  Applicant Profile Record
                </span>
                <h3 className="font-bold text-slate-900 text-lg">
                  {candidateDetailApp.seekerName}
                </h3>
                <p className="text-xs text-slate-500">
                  Applied for <strong>{candidateDetailApp.jobTitle}</strong> · ID: {candidateDetailApp.applicationId}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={candidateDetailApp.status} size="sm" />
                <button
                  onClick={() => setCandidateDetailApp(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Contact info grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Email Address</span>
                  <span className="font-medium text-slate-900">{candidateDetailApp.seekerEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Phone Number</span>
                  <span className="font-medium text-slate-900">{candidateDetailApp.seekerPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Academic CGPA</span>
                  <span className="font-bold text-indigo-600 text-sm font-mono">{candidateDetailApp.cgpa}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Experience</span>
                  <span className="font-medium text-slate-900">{candidateDetailApp.experienceYears} Years</span>
                </div>
              </div>

              {/* Education Summary */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Education Background</h4>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {candidateDetailApp.educationSummary}
                </p>
              </div>

              {/* Verified Skills */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Applicant Skills Inventory</h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidateDetailApp.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Letter */}
              {candidateDetailApp.coverLetter && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Candidate Statement / Cover Letter</h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed text-xs">
                    {candidateDetailApp.coverLetter}
                  </p>
                </div>
              )}

              {/* Resume / Portfolio Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={candidateDetailApp.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold flex items-center gap-1.5 text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Verified Resume PDF <ExternalLink className="w-3 h-3" />
                </a>

                {candidateDetailApp.portfolioUrl && (
                  <a
                    href={candidateDetailApp.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 text-xs"
                  >
                    Candidate Portfolio / GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Stage Transition Action Bar */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Recruiter Action Pipeline:</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(candidateDetailApp._id, 'Under Review')}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                  >
                    Move to Under Review
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(candidateDetailApp._id, 'Shortlisted')}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
                  >
                    Shortlist Candidate
                  </button>

                  <button
                    onClick={() => setInterviewModalApp(candidateDetailApp)}
                    className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Schedule Interview
                  </button>

                  <button
                    onClick={() => setOfferModalApp(candidateDetailApp)}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    Select & Issue Offer
                  </button>

                  <button
                    onClick={() => {
                      const reason = prompt('Provide constructive feedback reason for rejection:');
                      if (reason !== null) {
                        handleUpdateStatus(candidateDetailApp._id, 'Rejected', reason);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 ml-auto"
                  >
                    Reject Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduler Modal */}
      <InterviewSchedulerModal
        application={interviewModalApp}
        isOpen={Boolean(interviewModalApp)}
        onClose={() => setInterviewModalApp(null)}
        onSuccess={(updated) => {
          setApplications(prev => prev.map(a => a._id === updated._id ? updated : a));
        }}
      />

      {/* Issue Offer & Appointment Letter Modal */}
      <IssueOfferModal
        application={offerModalApp}
        isOpen={Boolean(offerModalApp)}
        onClose={() => setOfferModalApp(null)}
        onSuccess={(updated) => {
          setApplications(prev => prev.map(a => a._id === updated._id ? updated : a));
          setLetterPreviewApp(updated);
        }}
      />

      {/* Appointment Letter View Modal */}
      <AppointmentLetterModal
        application={letterPreviewApp}
        company={company || undefined}
        isOpen={Boolean(letterPreviewApp)}
        onClose={() => setLetterPreviewApp(null)}
      />

      {/* Delete Job Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Job Posting</h3>
                <p className="text-xs text-slate-500">This action will permanently delete this job.</p>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{jobToDelete.title}</p>
              <p className="text-slate-500">{jobToDelete.companyName} · {jobToDelete.location} ({jobToDelete.workMode})</p>
              <div className="pt-2 text-[11px] text-rose-600 font-medium flex items-start gap-1">
                <span>⚠️</span>
                <span>The job will be removed from student search, ML match recommendations, and deleted from the Supabase <code className="font-mono text-slate-800">public.jobs</code> table.</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deletingJob}
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingJob}
                onClick={confirmDeleteJob}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deletingJob ? 'Deleting from Supabase...' : 'Yes, Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
