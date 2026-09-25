import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Application, Job } from './types.js';

export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'mwgxbkzxxoppriwiernu';
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mwgxbkzxxoppriwiernu.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_NYMijHDi1HE0LABC3jxP5g_faW7jbEA';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const APP_QUEUE_FILE = path.resolve(process.cwd(), 'data', 'supabase_sync_queue.json');
const JOB_QUEUE_FILE = path.resolve(process.cwd(), 'data', 'supabase_jobs_queue.json');

// Ensure queue files exist
function loadAppQueue(): Application[] {
  try {
    if (fs.existsSync(APP_QUEUE_FILE)) {
      const data = fs.readFileSync(APP_QUEUE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading Supabase app queue:', err);
  }
  return [];
}

function saveAppQueue(queue: Application[]) {
  try {
    const dir = path.dirname(APP_QUEUE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(APP_QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving Supabase app queue:', err);
  }
}

function loadJobQueue(): Job[] {
  try {
    if (fs.existsSync(JOB_QUEUE_FILE)) {
      const data = fs.readFileSync(JOB_QUEUE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading Supabase jobs queue:', err);
  }
  return [];
}

function saveJobQueue(queue: Job[]) {
  try {
    const dir = path.dirname(JOB_QUEUE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JOB_QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving Supabase jobs queue:', err);
  }
}

export function queuePendingApplication(app: Application) {
  const queue = loadAppQueue();
  const exists = queue.some(item => item._id === app._id || item.applicationId === app.applicationId);
  if (!exists) {
    queue.push(app);
    saveAppQueue(queue);
  }
}

export function queuePendingJob(job: Job) {
  const queue = loadJobQueue();
  const exists = queue.some(item => item._id === job._id);
  if (!exists) {
    queue.push(job);
    saveJobQueue(queue);
  }
}

export const SUPABASE_SQL_SCHEMA = `-- CareerMatch -> Supabase Database Schema
-- Run this in your Supabase SQL Editor (Project: ${SUPABASE_PROJECT_ID})
-- https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new

-- 1. Create main applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    company_id TEXT,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    seeker_id TEXT,
    seeker_name TEXT NOT NULL,
    seeker_email TEXT NOT NULL,
    seeker_phone TEXT,
    resume_url TEXT,
    resume_name TEXT,
    cover_letter TEXT,
    education_summary TEXT,
    cgpa TEXT,
    skills TEXT[],
    experience_years NUMERIC DEFAULT 0,
    portfolio_url TEXT,
    status TEXT DEFAULT 'Applied',
    ml_match_score NUMERIC,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create alias apply_bookings table
CREATE TABLE IF NOT EXISTS public.apply_bookings (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    education TEXT,
    cgpa TEXT,
    skills TEXT[],
    experience_years NUMERIC DEFAULT 0,
    portfolio_url TEXT,
    status TEXT DEFAULT 'Applied',
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company_id TEXT,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    location TEXT NOT NULL,
    work_mode TEXT DEFAULT 'Hybrid',
    job_type TEXT DEFAULT 'Full-time',
    experience_level TEXT DEFAULT 'Fresher',
    min_salary NUMERIC DEFAULT 600000,
    max_salary NUMERIC DEFAULT 1200000,
    currency TEXT DEFAULT 'INR',
    skills TEXT[],
    description TEXT NOT NULL,
    responsibilities TEXT[],
    requirements TEXT[],
    benefits TEXT[],
    status TEXT DEFAULT 'active',
    posted_by TEXT,
    applicants_count NUMERIC DEFAULT 0,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apply_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies for Anonymous & Authenticated access
CREATE POLICY "Allow anon insert to applications" 
ON public.applications FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow anon select to applications" 
ON public.applications FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow anon update to applications" 
ON public.applications FOR UPDATE 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow anon insert to apply_bookings" 
ON public.apply_bookings FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow anon select to apply_bookings" 
ON public.apply_bookings FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow anon insert to jobs" 
ON public.jobs FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow anon select to jobs" 
ON public.jobs FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow anon update to jobs" 
ON public.jobs FOR UPDATE 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow anon delete from jobs" 
ON public.jobs FOR DELETE 
TO anon, authenticated 
USING (true);
`;

/**
 * Persists an application to Supabase tables
 */
export async function saveApplicationToSupabase(app: Application): Promise<{
  success: boolean;
  table?: string;
  error?: string;
  queued?: boolean;
}> {
  try {
    const primaryRecord = {
      id: app._id,
      application_id: app.applicationId,
      job_id: app.jobId,
      job_title: app.jobTitle,
      company_id: app.companyId,
      company_name: app.companyName,
      company_logo: app.companyLogo,
      seeker_id: app.seekerId,
      seeker_name: app.seekerName,
      seeker_email: app.seekerEmail,
      seeker_phone: app.seekerPhone,
      resume_url: app.resumeUrl,
      resume_name: app.resumeName,
      cover_letter: app.coverLetter || '',
      education_summary: app.educationSummary || '',
      cgpa: app.cgpa || '',
      skills: Array.isArray(app.skills) ? app.skills : [],
      experience_years: Number(app.experienceYears) || 0,
      portfolio_url: app.portfolioUrl || '',
      status: app.status || 'Applied',
      ml_match_score: app.mlMatchScore || 0,
      applied_at: app.appliedAt || new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // Also prepare fallback apply_bookings record
    const bookingRecord = {
      id: app._id,
      application_id: app.applicationId,
      job_id: app.jobId,
      job_title: app.jobTitle,
      company_name: app.companyName,
      name: app.seekerName,
      email: app.seekerEmail,
      phone: app.seekerPhone,
      resume_url: app.resumeUrl,
      cover_letter: app.coverLetter || '',
      education: app.educationSummary || '',
      cgpa: app.cgpa || '',
      skills: Array.isArray(app.skills) ? app.skills : [],
      experience_years: Number(app.experienceYears) || 0,
      portfolio_url: app.portfolioUrl || '',
      status: app.status || 'Applied',
      applied_at: app.appliedAt || new Date().toISOString()
    };

    // Try applications table first
    const { error: appError } = await supabase.from('applications').upsert(primaryRecord, { onConflict: 'id' });

    if (!appError) {
      console.log(`[Supabase] Application ${app.applicationId} successfully saved to table 'applications'`);
      
      try {
        await supabase.from('apply_bookings').upsert(bookingRecord, { onConflict: 'id' });
      } catch {
        // Ignored if table doesn't exist
      }

      const queue = loadAppQueue().filter(q => q._id !== app._id && q.applicationId !== app.applicationId);
      saveAppQueue(queue);

      return { success: true, table: 'applications' };
    }

    // Try apply_bookings if applications failed
    const { error: bookingError } = await supabase.from('apply_bookings').upsert(bookingRecord, { onConflict: 'id' });
    if (!bookingError) {
      console.log(`[Supabase] Application ${app.applicationId} successfully saved to table 'apply_bookings'`);
      const queue = loadAppQueue().filter(q => q._id !== app._id && q.applicationId !== app.applicationId);
      saveAppQueue(queue);
      return { success: true, table: 'apply_bookings' };
    }

    // If both failed, queue it
    console.warn(`[Supabase] Could not save application directly: ${appError.message || bookingError.message}. Queuing for sync.`);
    queuePendingApplication(app);
    return {
      success: false,
      queued: true,
      error: appError.message || bookingError.message
    };
  } catch (err: any) {
    console.error('[Supabase] Exception while saving application to Supabase:', err);
    queuePendingApplication(app);
    return {
      success: false,
      queued: true,
      error: err.message || 'Unknown Supabase connection error'
    };
  }
}

/**
 * Persists a posted job to Supabase tables
 */
export async function saveJobToSupabase(job: Job): Promise<{
  success: boolean;
  table?: string;
  error?: string;
  queued?: boolean;
}> {
  try {
    const jobRecord = {
      id: job._id,
      title: job.title,
      company_id: job.companyId,
      company_name: job.companyName,
      company_logo: job.companyLogo,
      location: job.location,
      work_mode: job.workMode,
      job_type: job.jobType,
      experience_level: job.experienceLevel,
      min_salary: Number(job.minSalary) || 0,
      max_salary: Number(job.maxSalary) || 0,
      currency: job.currency || 'INR',
      skills: Array.isArray(job.skills) ? job.skills : [],
      description: job.description,
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      status: job.status || 'active',
      posted_by: job.postedBy,
      applicants_count: Number(job.applicantsCount) || 0,
      deadline: job.deadline,
      created_at: job.createdAt || new Date().toISOString()
    };

    const { error } = await supabase.from('jobs').upsert(jobRecord, { onConflict: 'id' });

    if (!error) {
      console.log(`[Supabase] Job "${job.title}" (${job._id}) successfully saved to table 'jobs'`);
      const queue = loadJobQueue().filter(q => q._id !== job._id);
      saveJobQueue(queue);
      return { success: true, table: 'jobs' };
    }

    console.warn(`[Supabase] Could not save job directly: ${error.message}. Queuing for sync.`);
    queuePendingJob(job);
    return {
      success: false,
      queued: true,
      error: error.message
    };
  } catch (err: any) {
    console.error('[Supabase] Exception while saving job to Supabase:', err);
    queuePendingJob(job);
    return {
      success: false,
      queued: true,
      error: err.message || 'Unknown Supabase connection error'
    };
  }
}

/**
 * Deletes a job from Supabase tables and pending queue
 */
export async function deleteJobFromSupabase(jobId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 1. Remove from local job sync queue if queued
    const queue = loadJobQueue().filter(q => q._id !== jobId);
    saveJobQueue(queue);

    // 2. Delete from Supabase 'jobs' table
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (!error) {
      console.log(`[Supabase] Job ${jobId} successfully deleted from table 'jobs'`);
      return { success: true };
    }

    console.warn(`[Supabase] Notice while deleting job ${jobId}: ${error.message}`);
    return { success: false, error: error.message };
  } catch (err: any) {
    console.error('[Supabase] Exception deleting job from Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Checks connection and table presence in Supabase
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  projectId: string;
  url: string;
  hasApplicationsTable: boolean;
  hasApplyBookingsTable: boolean;
  hasJobsTable: boolean;
  pendingSyncCount: number;
  message: string;
}> {
  let connected = false;
  let hasApplicationsTable = false;
  let hasApplyBookingsTable = false;
  let hasJobsTable = false;
  let message = 'Checking connection...';

  try {
    const sessionRes = await supabase.auth.getSession();
    connected = !sessionRes.error;

    const [appTableRes, bookingTableRes, jobsTableRes] = await Promise.all([
      supabase.from('applications').select('id').limit(1),
      supabase.from('apply_bookings').select('id').limit(1),
      supabase.from('jobs').select('id').limit(1)
    ]);

    if (!appTableRes.error) hasApplicationsTable = true;
    if (!bookingTableRes.error) hasApplyBookingsTable = true;
    if (!jobsTableRes.error) hasJobsTable = true;

    if (hasApplicationsTable || hasApplyBookingsTable || hasJobsTable) {
      message = 'Connected and Supabase tables are ready for direct inserts.';
    } else {
      message = 'Connected to Supabase project. Table schema setup in SQL Editor is required for persistent inserts.';
    }
  } catch (err: any) {
    message = `Connection check error: ${err.message}`;
  }

  const appQueue = loadAppQueue();
  const jobQueue = loadJobQueue();

  return {
    connected,
    projectId: SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    hasApplicationsTable,
    hasApplyBookingsTable,
    hasJobsTable,
    pendingSyncCount: appQueue.length + jobQueue.length,
    message
  };
}

/**
 * Attempts to re-sync all pending queued items (applications + jobs) to Supabase
 */
export async function syncQueuedApplications(): Promise<{
  syncedCount: number;
  remainingQueueCount: number;
  errors: string[];
}> {
  let syncedCount = 0;
  const errors: string[] = [];

  // Sync applications
  const appQueue = loadAppQueue();
  const stillPendingApps: Application[] = [];

  for (const app of appQueue) {
    const res = await saveApplicationToSupabase(app);
    if (res.success) {
      syncedCount++;
    } else {
      stillPendingApps.push(app);
      if (res.error && !errors.includes(res.error)) {
        errors.push(res.error);
      }
    }
  }
  saveAppQueue(stillPendingApps);

  // Sync jobs
  const jobQueue = loadJobQueue();
  const stillPendingJobs: Job[] = [];

  for (const job of jobQueue) {
    const res = await saveJobToSupabase(job);
    if (res.success) {
      syncedCount++;
    } else {
      stillPendingJobs.push(job);
      if (res.error && !errors.includes(res.error)) {
        errors.push(res.error);
      }
    }
  }
  saveJobQueue(stillPendingJobs);

  return {
    syncedCount,
    remainingQueueCount: stillPendingApps.length + stillPendingJobs.length,
    errors
  };
}
