import { 
  Job, 
  Application, 
  Company, 
  Notification, 
  SkillGapAnalysis, 
  SalaryEstimate, 
  AdminStats, 
  User, 
  SeekerProfile, 
  ApplicationStatus 
} from '../types';

const TOKEN_KEY = 'careermatch_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string; role: string; companyName?: string }) =>
    apiFetch<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (credentials: { email: string; password: string }) =>
    apiFetch<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  getMe: () => apiFetch<{ user: User }>('/api/auth/me'),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string; demoToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (payload: { email: string; newPassword: string }) =>
    apiFetch<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Profile
  getProfile: () => apiFetch<{ profile: SeekerProfile; user: Partial<User> }>('/api/profile'),
  updateProfile: (payload: { name?: string; avatar?: string; profile?: Partial<SeekerProfile> }) =>
    apiFetch<{ message: string; user: User }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Jobs
  getJobs: (params: Record<string, string | number | undefined> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    return apiFetch<{ jobs: Job[]; total: number }>(`/api/jobs${qs ? `?${qs}` : ''}`);
  },

  getJobById: (id: string) => apiFetch<{ job: Job; company: Company }>(`/api/jobs/${id}`),

  createJob: (jobData: Partial<Job>) =>
    apiFetch<{ message: string; job: Job }>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    }),

  updateJob: (id: string, jobData: Partial<Job>) =>
    apiFetch<{ message: string; job: Job }>(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    }),

  deleteJob: (id: string) =>
    apiFetch<{ message: string }>(`/api/jobs/${id}`, {
      method: 'DELETE'
    }),

  toggleSaveJob: (id: string) =>
    apiFetch<{ saved: boolean; message: string }>(`/api/jobs/${id}/save`, {
      method: 'POST'
    }),

  getSavedJobs: () => apiFetch<{ jobs: Job[] }>('/api/saved-jobs'),

  // Applications
  applyJob: (jobId: string, applicationData: {
    name: string;
    email: string;
    phone: string;
    resumeUrl: string;
    resumeName?: string;
    coverLetter?: string;
    educationSummary: string;
    cgpa: string;
    skills: string[];
    experienceYears: number;
    portfolioUrl?: string;
  }) =>
    apiFetch<{ message: string; application: Application }>(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData)
    }),

  getApplications: () =>
    apiFetch<{ applications: Application[]; jobs?: Job[] }>('/api/applications'),

  getApplicationById: (id: string) =>
    apiFetch<{ application: Application; job: Job; company: Company }>(`/api/applications/${id}`),

  updateApplicationStatus: (id: string, payload: { status: ApplicationStatus; note?: string }) =>
    apiFetch<{ message: string; application: Application }>(`/api/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  scheduleInterview: (id: string, payload: {
    scheduledDate: string;
    scheduledTime: string;
    meetingLink: string;
    type?: string;
    interviewers?: string;
    notes?: string;
  }) =>
    apiFetch<{ message: string; application: Application }>(`/api/applications/${id}/interview`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  issueAppointmentLetter: (id: string, payload: {
    joiningDate: string;
    salaryOffered: number;
    designation: string;
    workLocation?: string;
    reportingManager?: string;
    probationMonths?: number;
    notes?: string;
    benefitsSummary?: string[];
  }) =>
    apiFetch<{ message: string; application: Application }>(`/api/applications/${id}/appointment-letter`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Companies
  getCompanies: () => apiFetch<{ companies: Company[] }>('/api/companies'),
  getCompanyById: (id: string) => apiFetch<{ company: Company; jobs: Job[] }>(`/api/companies/${id}`),
  updateCompany: (id: string, data: Partial<Company>) =>
    apiFetch<{ message: string; company: Company }>(`/api/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Notifications
  getNotifications: () =>
    apiFetch<{ notifications: Notification[]; unreadCount: number }>('/api/notifications'),

  markNotificationRead: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT'
    }),

  markAllNotificationsRead: () =>
    apiFetch<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT'
    }),

  // ML Intelligence
  getMLRecommendations: () =>
    apiFetch<{
      recommendations: {
        job: Job;
        matchScore: number;
        skillScore: number;
        matchedSkills: string[];
        missingSkills: string[];
        compatibilityTier: string;
        strengths: string[];
        recommendations: string[];
      }[];
    }>('/api/ml/recommendations'),

  analyzeSkillGap: (skills: string[], targetRole: string) =>
    apiFetch<{ analysis: SkillGapAnalysis }>('/api/ml/skill-gap', {
      method: 'POST',
      body: JSON.stringify({ skills, targetRole })
    }),

  estimateSalary: (payload: { role: string; experienceLevel: string; skillsCount: number }) =>
    apiFetch<{ estimate: SalaryEstimate }>('/api/ml/salary-estimator', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Admin
  getAdminStats: () => apiFetch<AdminStats>('/api/admin/stats'),
  getAdminUsers: (params: { role?: string; status?: string; search?: string } = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<{ users: User[] }>(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },
  updateUserStatus: (id: string, status: 'active' | 'suspended') =>
    apiFetch<{ message: string; user: User }>(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  updateUserRole: (id: string, role: string) =>
    apiFetch<{ message: string; user: User }>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    }),
  deleteUser: (id: string) =>
    apiFetch<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE'
    }),
  getAdminJobs: () => apiFetch<{ jobs: Job[] }>('/api/admin/jobs'),
  updateJobApproval: (id: string, status: string) =>
    apiFetch<{ message: string; job: Job }>(`/api/admin/jobs/${id}/approval`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  toggleJobFeatured: (id: string, isFeatured: boolean) =>
    apiFetch<{ message: string; job: Job }>(`/api/admin/jobs/${id}/featured`, {
      method: 'PUT',
      body: JSON.stringify({ isFeatured })
    }),

  // Supabase Backend Integration
  getSupabaseStatus: () =>
    apiFetch<{
      connected: boolean;
      projectId: string;
      url: string;
      hasApplicationsTable: boolean;
      hasApplyBookingsTable: boolean;
      pendingSyncCount: number;
      message: string;
    }>('/api/supabase/status'),

  syncSupabase: () =>
    apiFetch<{
      syncedCount: number;
      remainingQueueCount: number;
      errors: string[];
    }>('/api/supabase/sync', {
      method: 'POST'
    }),

  getSupabaseSchema: () =>
    apiFetch<{
      projectId: string;
      url: string;
      sqlSchema: string;
    }>('/api/supabase/schema')
};
