export type UserRole = 'job_seeker' | 'recruiter' | 'admin';

export type UserStatus = 'active' | 'suspended';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';

export type ExperienceLevel = 'Fresher' | '1-3 years' | '3-5 years' | '5+ years';

export type ApplicationStatus = 
  | 'Applied' 
  | 'Under Review' 
  | 'Shortlisted' 
  | 'Interview' 
  | 'Selected' 
  | 'Rejected';

export interface EducationEntry {
  degree: string;
  institution: string;
  field: string;
  startYear: string;
  endYear: string;
  cgpa: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface InternshipEntry {
  role: string;
  company: string;
  duration: string;
  learnings: string;
}

export interface SeekerProfile {
  title?: string;
  phone?: string;
  location?: string;
  education: EducationEntry[];
  cgpa?: string;
  skills: string[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  internships: InternshipEntry[];
  preferredRole?: string;
  preferredLocation?: string;
  expectedSalary?: number;
  resumeUrl?: string;
  resumeName?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  profile?: SeekerProfile;
  companyId?: string;
  designation?: string;
  department?: string;
}

export interface Company {
  _id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  industry: string;
  website: string;
  location: string;
  employeeCount: string;
  foundedYear: string;
  verified: boolean;
  recruiterId: string;
  contactEmail: string;
  benefits: string[];
  bannerImage?: string;
  openJobsCount?: number;
}

export interface MLMatchDetails {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  salaryScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  compatibilityTier: 'Exceptional Fit' | 'Strong Fit' | 'Moderate Fit' | 'Growth Opportunity';
}

export interface Job {
  _id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  location: string;
  workMode: WorkMode;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  minSalary: number;
  maxSalary: number;
  currency: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: 'active' | 'closed' | 'pending_approval';
  postedBy: string;
  applicantsCount: number;
  createdAt: string;
  deadline: string;
  isFeatured: boolean;
  isSaved?: boolean;
  hasApplied?: boolean;
  applicationId?: string;
  mlMatchScore?: number;
  mlMatchDetails?: MLMatchDetails;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  updatedAt: string;
  note?: string;
}

export interface InterviewDetails {
  scheduledDate: string;
  scheduledTime: string;
  meetingLink: string;
  type: string;
  interviewers: string;
  notes?: string;
}

export interface AppointmentLetter {
  letterId: string;
  issuedDate: string;
  joiningDate: string;
  salaryOffered: number;
  designation: string;
  workLocation: string;
  reportingManager: string;
  probationMonths: number;
  benefitsSummary: string[];
  notes?: string;
}

export interface Application {
  _id: string;
  applicationId: string; // APP-2026-8942
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  seekerPhone: string;
  resumeUrl: string;
  resumeName: string;
  coverLetter?: string;
  educationSummary: string;
  cgpa: string;
  skills: string[];
  experienceYears: number;
  portfolioUrl?: string;
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  interviewDetails?: InterviewDetails;
  appointmentLetter?: AppointmentLetter;
  mlMatchScore?: number;
  skillMatchBreakdown?: {
    matchedSkills: string[];
    missingSkills: string[];
    matchPercentage: number;
  };
  appliedAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'interview' | 'selection' | 'rejection' | 'job_alert' | 'job' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface SkillGapAnalysis {
  role: string;
  userSkillsCount: number;
  requiredSkills: { skill: string; status: 'mastered' | 'missing'; priority: 'High' | 'Medium' }[];
  missingCount: number;
  matchPercentage: number;
  recommendedCertifications: string[];
  suggestedProjects: string[];
}

export interface SalaryEstimate {
  min: number;
  max: number;
  median: number;
  currency: string;
  insights: string;
}

export interface AdminStats {
  metrics: {
    totalUsers: number;
    totalSeekers: number;
    totalRecruiters: number;
    totalCompanies: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    selectedCount: number;
    interviewCount: number;
    placementRate: number;
  };
  topSkills: { name: string; count: number }[];
  recentAudits: any[];
}
