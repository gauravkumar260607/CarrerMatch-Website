import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'mwgxbkzxxoppriwiernu';
export const SUPABASE_URL = 'https://mwgxbkzxxoppriwiernu.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_NYMijHDi1HE0LABC3jxP5g_faW7jbEA';

// Direct Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseApplicationPayload {
  id?: string;
  application_id: string;
  job_id: string;
  job_title: string;
  company_id?: string;
  company_name: string;
  company_logo?: string;
  seeker_id?: string;
  seeker_name: string;
  seeker_email: string;
  seeker_phone?: string;
  resume_url: string;
  resume_name?: string;
  cover_letter?: string;
  education_summary?: string;
  cgpa?: string;
  skills?: string[];
  experience_years?: number;
  portfolio_url?: string;
  status?: string;
  ml_match_score?: number;
  applied_at?: string;
  created_at?: string;
}

/**
 * Saves application directly to Supabase client-side
 */
export async function saveApplicationToSupabaseClient(payload: SupabaseApplicationPayload) {
  try {
    // 1. Try 'applications' table
    const { data, error } = await supabase
      .from('applications')
      .upsert(payload, { onConflict: 'application_id' });

    if (!error) {
      return { success: true, table: 'applications', data };
    }

    // 2. Try 'apply_bookings' table
    const bookingPayload = {
      id: payload.id || payload.application_id,
      application_id: payload.application_id,
      job_id: payload.job_id,
      job_title: payload.job_title,
      company_name: payload.company_name,
      name: payload.seeker_name,
      email: payload.seeker_email,
      phone: payload.seeker_phone || '',
      resume_url: payload.resume_url,
      cover_letter: payload.cover_letter || '',
      education: payload.education_summary || '',
      cgpa: payload.cgpa || '',
      skills: payload.skills || [],
      experience_years: payload.experience_years || 0,
      portfolio_url: payload.portfolio_url || '',
      status: payload.status || 'Applied',
      applied_at: payload.applied_at || new Date().toISOString()
    };

    const { data: bData, error: bError } = await supabase
      .from('apply_bookings')
      .upsert(bookingPayload, { onConflict: 'application_id' });

    if (!bError) {
      return { success: true, table: 'apply_bookings', data: bData };
    }

    return { 
      success: false, 
      error: error.message || bError?.message || 'Table not found in schema cache' 
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Supabase network error' };
  }
}

/**
 * Saves posted job directly to Supabase client-side
 */
export async function saveJobToSupabaseClient(job: any) {
  try {
    const jobRecord = {
      id: job._id || job.id,
      title: job.title,
      company_id: job.companyId || job.company_id,
      company_name: job.companyName || job.company_name,
      company_logo: job.companyLogo || job.company_logo,
      location: job.location,
      work_mode: job.workMode || job.work_mode,
      job_type: job.jobType || job.job_type,
      experience_level: job.experienceLevel || job.experience_level,
      min_salary: Number(job.minSalary || job.min_salary) || 0,
      max_salary: Number(job.maxSalary || job.max_salary) || 0,
      currency: job.currency || 'INR',
      skills: Array.isArray(job.skills) ? job.skills : [],
      description: job.description,
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      status: job.status || 'active',
      posted_by: job.postedBy || job.posted_by,
      applicants_count: Number(job.applicantsCount || job.applicants_count) || 0,
      deadline: job.deadline,
      created_at: job.createdAt || job.created_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('jobs')
      .upsert(jobRecord, { onConflict: 'id' });

    if (!error) {
      return { success: true, table: 'jobs', data };
    }
    return { success: false, error: error.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Supabase network error' };
  }
}

/**
 * Deletes a job directly from Supabase client-side
 */
export async function deleteJobFromSupabaseClient(jobId: string) {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (!error) {
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Supabase delete network error' };
  }
}

/**
 * Check Supabase tables live status from frontend
 */
export async function checkSupabaseConnection() {
  try {
    const { error: sessionError } = await supabase.auth.getSession();
    
    // Check if applications & jobs tables exist
    const [appRes, bookRes, jobRes] = await Promise.all([
      supabase.from('applications').select('id').limit(1),
      supabase.from('apply_bookings').select('id').limit(1),
      supabase.from('jobs').select('id').limit(1)
    ]);

    return {
      connected: !sessionError,
      hasApplicationsTable: !appRes.error,
      hasApplyBookingsTable: !bookRes.error,
      hasJobsTable: !jobRes.error,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL
    };
  } catch (err: any) {
    return {
      connected: false,
      hasApplicationsTable: false,
      hasApplyBookingsTable: false,
      hasJobsTable: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      error: err.message
    };
  }
}
