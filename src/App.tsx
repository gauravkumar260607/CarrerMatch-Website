import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { LandingHero } from './components/home/LandingHero';
import { JobFilters } from './components/jobs/JobFilters';
import { JobCard } from './components/jobs/JobCard';
import { JobDetailModal } from './components/jobs/JobDetailModal';
import { ApplyModal } from './components/jobs/ApplyModal';
import { ApplicationSuccessModal } from './components/jobs/ApplicationSuccessModal';
import { PostJobModal } from './components/jobs/PostJobModal';
import { SeekerDashboard } from './components/dashboard/SeekerDashboard';
import { RecruiterDashboard } from './components/dashboard/RecruiterDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { SeekerProfileView } from './components/profile/SeekerProfileView';
import { MLIntelligenceHub } from './components/ml/MLIntelligenceHub';
import { CompaniesView } from './components/companies/CompaniesView';
import { AuthModal } from './components/auth/AuthModal';
import { SupabaseModal } from './components/common/SupabaseModal';
import { api } from './services/api';
import { Job, Company, Application } from './types';
import { Search, Sparkles, Briefcase, Filter, ArrowLeft, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { user, refreshNotifications } = useAuth();

  // Navigation view state: 'home' | 'jobs' | 'dashboard' | 'profile' | 'ml_hub' | 'companies' | 'saved_jobs'
  const [currentView, setCurrentView] = useState<string>('home');

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [jobSuccessToast, setJobSuccessToast] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [experienceLevel, setExperienceLevel] = useState('All');
  const [minSalary, setMinSalary] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Modals state
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Fetch jobs according to filters
  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const params: Record<string, string | number | undefined> = {
        search: search || undefined,
        location: location || undefined,
        workMode: workMode !== 'All' ? workMode : undefined,
        jobType: jobType !== 'All' ? jobType : undefined,
        experienceLevel: experienceLevel !== 'All' ? experienceLevel : undefined,
        minSalary: minSalary ? parseInt(minSalary, 10) : undefined,
        skill: selectedSkill || undefined,
        date: dateFilter || undefined,
        sort: sortBy
      };

      const [jobsRes, companiesRes] = await Promise.all([
        api.getJobs(params),
        api.getCompanies()
      ]);

      setJobs(jobsRes.jobs || []);
      setCompanies(companiesRes.companies || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, [search, location, workMode, jobType, experienceLevel, minSalary, selectedSkill, dateFilter, sortBy]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setWorkMode('All');
    setJobType('All');
    setExperienceLevel('All');
    setMinSalary('');
    setSelectedSkill('');
    setDateFilter('');
    setSortBy('recent');
  };

  const handleToggleSaveJob = async (jobId: string) => {
    if (!user) {
      setAuthModalMode('signin');
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await api.toggleSaveJob(jobId);
      setJobs(prev =>
        prev.map(j => (j._id === jobId ? { ...j, isSaved: res.saved } : j))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to save job');
    }
  };

  const handleOpenApply = (job: Job) => {
    setSelectedJobForApply(job);
  };

  const handleApplicationSuccess = (application: Application) => {
    setSelectedJobForApply(null);
    setSubmittedApplication(application);
    // Mark as applied in local jobs list
    setJobs(prev =>
      prev.map(j =>
        j._id === application.jobId ? { ...j, hasApplied: true, applicationId: application.applicationId } : j
      )
    );
  };

  const handleHeroSearch = (keyword: string, loc: string) => {
    setSearch(keyword);
    setLocation(loc);
    setCurrentView('jobs');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Test Persona Quick Switcher */}
      <RoleSwitcherBanner />

      {/* Main Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenAuth={(mode = 'signin') => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenPostJob={() => setPostJobModalOpen(true)}
        onOpenSupabase={() => setSupabaseModalOpen(true)}
      />

      {/* Global In-App Notification Toast */}
      {jobSuccessToast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{jobSuccessToast}</span>
            </div>
            <button
              onClick={() => setJobSuccessToast(null)}
              className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-800 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Body Content View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: HOME LANDING */}
        {currentView === 'home' && (
          <LandingHero
            onSearch={handleHeroSearch}
            onNavigate={(view) => setCurrentView(view)}
            featuredJobs={jobs}
            companies={companies}
            onSelectJob={(j) => setSelectedJobForDetail(j)}
            onApplyJob={handleOpenApply}
            onToggleSaveJob={handleToggleSaveJob}
          />
        )}

        {/* VIEW 2: EXPLORE JOBS & ADVANCED FILTERS */}
        {currentView === 'jobs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Explore Career Openings
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing <strong>{jobs.length}</strong> verified job positions
                </p>
              </div>

              {user?.role === 'job_seeker' && (
                <button
                  onClick={() => setCurrentView('ml_hub')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  View Top AI Matches For Your Profile
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <JobFilters
              search={search}
              onSearchChange={setSearch}
              location={location}
              onLocationChange={setLocation}
              workMode={workMode}
              onWorkModeChange={setWorkMode}
              jobType={jobType}
              onJobTypeChange={setJobType}
              experienceLevel={experienceLevel}
              onExperienceLevelChange={setExperienceLevel}
              minSalary={minSalary}
              onMinSalaryChange={setMinSalary}
              selectedSkill={selectedSkill}
              onSkillChange={setSelectedSkill}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onReset={handleResetFilters}
            />

            {/* Job Cards Grid */}
            {loadingJobs ? (
              <div className="p-16 text-center text-slate-400 text-xs">
                Searching verified job postings...
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
                <Search className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">No jobs match your filter criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your keyword, removing skill tags, or resetting filters to view all openings.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onSelect={(j) => setSelectedJobForDetail(j)}
                    onApply={handleOpenApply}
                    onToggleSave={handleToggleSaveJob}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ROLE DASHBOARD */}
        {currentView === 'dashboard' && (
          <div>
            {!user ? (
              <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h2 className="text-lg font-bold text-slate-900">Sign in to access your dashboard</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Track your application pipeline, review candidates, or manage system parameters.
                </p>
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setAuthModalOpen(true);
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Sign In / Quick Demo Login
                </button>
              </div>
            ) : user.role === 'admin' ? (
              <AdminDashboard
                onJobDeleted={(jobId) => {
                  setJobs(prev => prev.filter(j => j._id !== jobId));
                  fetchJobs();
                }}
              />
            ) : user.role === 'recruiter' ? (
              <RecruiterDashboard
                onOpenPostJob={() => setPostJobModalOpen(true)}
                onOpenJobDetail={(j) => setSelectedJobForDetail(j)}
                onJobDeleted={(jobId) => {
                  setJobs(prev => prev.filter(j => j._id !== jobId));
                  fetchJobs();
                }}
              />
            ) : (
              <SeekerDashboard
                onNavigate={(v, meta) => {
                  if (v === 'saved_jobs') {
                    setCurrentView('saved_jobs');
                  } else {
                    setCurrentView(v);
                  }
                }}
                onOpenJobDetail={(j) => setSelectedJobForDetail(j)}
              />
            )}
          </div>
        )}

        {/* VIEW 4: CANDIDATE PROFILE */}
        {currentView === 'profile' && (
          <SeekerProfileView />
        )}

        {/* VIEW 5: ML INTELLIGENCE HUB */}
        {currentView === 'ml_hub' && (
          <MLIntelligenceHub
            onOpenJobDetail={(j) => setSelectedJobForDetail(j)}
            onApplyJob={handleOpenApply}
          />
        )}

        {/* VIEW 6: COMPANIES DIRECTORY */}
        {currentView === 'companies' && (
          <CompaniesView
            onSelectJob={(j) => setSelectedJobForDetail(j)}
          />
        )}

        {/* VIEW 7: SAVED JOBS */}
        {currentView === 'saved_jobs' && (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Your Bookmarked Positions
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.filter(j => j.isSaved).map(job => (
                <JobCard
                  key={job._id}
                  job={job}
                  isSaved={true}
                  onSelect={(j) => setSelectedJobForDetail(j)}
                  onApply={handleOpenApply}
                  onToggleSave={handleToggleSaveJob}
                />
              ))}
            </div>

            {jobs.filter(j => j.isSaved).length === 0 && (
              <div className="p-12 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                No bookmarked jobs found.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      {/* 1. Job Detail Modal */}
      <JobDetailModal
        job={selectedJobForDetail!}
        company={companies.find(c => c._id === selectedJobForDetail?.companyId)}
        isOpen={Boolean(selectedJobForDetail)}
        onClose={() => setSelectedJobForDetail(null)}
        onApply={(j) => handleOpenApply(j)}
        onToggleSave={handleToggleSaveJob}
        isSaved={selectedJobForDetail?.isSaved}
      />

      {/* 2. Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          job={selectedJobForApply}
          isOpen={Boolean(selectedJobForApply)}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* 3. Application Success Modal */}
      <ApplicationSuccessModal
        application={submittedApplication}
        isOpen={Boolean(submittedApplication)}
        onClose={() => setSubmittedApplication(null)}
        onViewDashboard={() => setCurrentView('dashboard')}
      />

      {/* 4. Recruiter Post Job Modal */}
      <PostJobModal
        isOpen={postJobModalOpen}
        onClose={() => setPostJobModalOpen(false)}
        onSuccess={(newJob) => {
          setJobs(prev => [newJob, ...prev.filter(j => j._id !== newJob._id)]);
          fetchJobs();
          refreshNotifications();
          setJobSuccessToast(`"${newJob.title}" has been published and saved to Supabase! Visible to students.`);
          setTimeout(() => setJobSuccessToast(null), 6000);
        }}
      />

      {/* 5. Auth Modal (Sign In / Sign Up / Forgot) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* 6. Supabase Backend Integration Modal */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      {/* Footer */}
      <Footer onNavigate={(v) => setCurrentView(v)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
