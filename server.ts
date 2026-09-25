import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, initDB } from './server/db.js';
import { 
  authenticateToken, 
  optionalAuth, 
  requireRole, 
  generateToken, 
  AuthenticatedRequest 
} from './server/auth.js';
import { 
  calculateMatchScore, 
  analyzeSkillGaps, 
  predictSalary 
} from './server/ml.js';
import { 
  User, 
  Company, 
  Job, 
  Application, 
  Notification, 
  ApplicationStatus 
} from './server/types.js';
import { 
  saveApplicationToSupabase, 
  saveJobToSupabase,
  deleteJobFromSupabase,
  checkSupabaseHealth, 
  syncQueuedApplications, 
  SUPABASE_SQL_SCHEMA, 
  SUPABASE_PROJECT_ID,
  SUPABASE_URL
} from './server/supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB file
initDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API ROUTING

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 2. Auth Endpoints
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Name, email, password, and role are required.' });
      return;
    }

    if (!['job_seeker', 'recruiter', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid user role specified.' });
      return;
    }

    const existingUser = db.users.findOne(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let companyId: string | undefined = undefined;

    if (role === 'recruiter') {
      const compId = `comp_${Date.now()}`;
      const newCompany: Company = {
        _id: compId,
        name: companyName || `${name}'s Company`,
        logo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=128&auto=format&fit=crop&q=80',
        tagline: 'Leading innovation in technology and talent.',
        description: 'Dynamic company hiring forward-thinking engineering and product talents.',
        industry: 'Information Technology & Services',
        website: 'https://example.com',
        location: 'Bangalore, India',
        employeeCount: '50-200 employees',
        foundedYear: '2023',
        verified: true,
        recruiterId: userId,
        contactEmail: email,
        benefits: ['Comprehensive Health Coverage', 'Hybrid Workplace', 'Skill Development Stipend']
      };
      db.companies.insertOne(newCompany);
      companyId = compId;
    }

    const newUser: User = {
      _id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
      companyId,
      profile: role === 'job_seeker' ? {
        title: 'Aspiring Professional',
        education: [],
        skills: ['JavaScript', 'Problem Solving'],
        experience: [],
        projects: [],
        internships: []
      } : undefined
    };

    db.users.insertOne(newUser);

    // Welcome notification
    db.notifications.insertOne({
      _id: `notif_${Date.now()}`,
      userId,
      title: 'Welcome to CareerMatch!',
      message: role === 'job_seeker' 
        ? 'Complete your profile with education, CGPA, and skills to unlock AI match scoring.' 
        : 'Welcome! You can now publish job listings and review top applicants.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    });

    const token = generateToken(newUser);
    const { password: _, ...userSafe } = newUser;

    res.status(201).json({ user: userSafe, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.users.findOne(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'This account has been suspended. Please contact support.' });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.password || '');
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    res.json({ user: userSafe, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { password: _, ...userSafe } = req.user;
  res.json({ user: userSafe });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const user = db.users.findOne(u => u.email.toLowerCase() === email.toLowerCase());
  // Always return success for security
  res.json({ 
    message: 'If that email exists in our records, a secure password reset link has been dispatched.',
    demoToken: user ? 'reset-demo-token-12345' : null 
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    res.status(400).json({ error: 'Email and new password are required.' });
    return;
  }

  const user = db.users.findOne(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.users.updateOne(u => u._id === user._id, { password: hashedPassword });

  res.json({ message: 'Password has been updated successfully. Please sign in.' });
});

// 3. User Profile
app.get('/api/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({ profile: user.profile || null, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

app.put('/api/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { name, avatar, profile } = req.body;

    const updatedUser = db.users.updateOne(u => u._id === user._id, {
      ...(name ? { name } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
      ...(profile ? { profile } : {})
    });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { password: _, ...userSafe } = updatedUser;
    res.json({ message: 'Profile updated successfully.', user: userSafe });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
});

// 4. Jobs Endpoints
app.get('/api/jobs', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { 
      search, 
      role, 
      company, 
      location, 
      workMode, 
      jobType, 
      experienceLevel, 
      minSalary, 
      maxSalary, 
      skill, 
      dateFilter,
      sortBy 
    } = req.query as Record<string, string>;

    let jobs = db.jobs.find(j => j.status === 'active');

    // Filters
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (role) {
      const r = role.toLowerCase();
      jobs = jobs.filter(j => j.title.toLowerCase().includes(r));
    }

    if (company) {
      const c = company.toLowerCase();
      jobs = jobs.filter(j => j.companyName.toLowerCase().includes(c));
    }

    if (location) {
      const l = location.toLowerCase();
      jobs = jobs.filter(j => j.location.toLowerCase().includes(l));
    }

    if (workMode && workMode !== 'All') {
      jobs = jobs.filter(j => j.workMode.toLowerCase() === workMode.toLowerCase());
    }

    if (jobType && jobType !== 'All') {
      jobs = jobs.filter(j => j.jobType.toLowerCase() === jobType.toLowerCase());
    }

    if (experienceLevel && experienceLevel !== 'All') {
      jobs = jobs.filter(j => j.experienceLevel.toLowerCase() === experienceLevel.toLowerCase());
    }

    if (minSalary) {
      const min = parseInt(minSalary, 10);
      if (!isNaN(min)) {
        jobs = jobs.filter(j => j.maxSalary >= min);
      }
    }

    if (maxSalary) {
      const max = parseInt(maxSalary, 10);
      if (!isNaN(max)) {
        jobs = jobs.filter(j => j.minSalary <= max);
      }
    }

    if (skill) {
      const s = skill.toLowerCase();
      jobs = jobs.filter(j => j.skills.some(jsk => jsk.toLowerCase().includes(s)));
    }

    if (dateFilter) {
      const now = new Date().getTime();
      if (dateFilter === 'today') {
        jobs = jobs.filter(j => now - new Date(j.createdAt).getTime() <= 24 * 60 * 60 * 1000);
      } else if (dateFilter === 'week') {
        jobs = jobs.filter(j => now - new Date(j.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000);
      } else if (dateFilter === 'month') {
        jobs = jobs.filter(j => now - new Date(j.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Attach ML match scores if user is authenticated job seeker
    const seekerProfile = req.user?.role === 'job_seeker' ? req.user.profile : undefined;
    const userSavedIds = req.user 
      ? db.savedJobs.find(s => s.userId === req.user!._id).map(s => s.jobId)
      : [];

    const enrichedJobs = jobs.map(j => {
      let mlMatch = undefined;
      if (seekerProfile) {
        mlMatch = calculateMatchScore(seekerProfile, j);
      }
      return {
        ...j,
        isSaved: userSavedIds.includes(j._id),
        mlMatchScore: mlMatch?.overallScore,
        mlMatchDetails: mlMatch
      };
    });

    // Sorting
    if (sortBy === 'salary_high') {
      enrichedJobs.sort((a, b) => b.maxSalary - a.maxSalary);
    } else if (sortBy === 'salary_low') {
      enrichedJobs.sort((a, b) => a.minSalary - b.minSalary);
    } else if (sortBy === 'match' && seekerProfile) {
      enrichedJobs.sort((a, b) => (b.mlMatchScore || 0) - (a.mlMatchScore || 0));
    } else {
      // Default newest
      enrichedJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({ jobs: enrichedJobs, total: enrichedJobs.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch jobs.' });
  }
});

app.get('/api/jobs/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const job = db.jobs.findOne(j => j._id === id);

  if (!job) {
    res.status(404).json({ error: 'Job posting not found.' });
    return;
  }

  const company = db.companies.findOne(c => c._id === job.companyId);
  const isSaved = req.user 
    ? !!db.savedJobs.findOne(s => s.userId === req.user!._id && s.jobId === id)
    : false;

  let mlMatch = undefined;
  if (req.user?.role === 'job_seeker' && req.user.profile) {
    mlMatch = calculateMatchScore(req.user.profile, job);
  }

  // Check if current user already applied
  const existingApp = req.user 
    ? db.applications.findOne(a => a.seekerId === req.user!._id && a.jobId === id)
    : null;

  res.json({
    job: {
      ...job,
      isSaved,
      hasApplied: !!existingApp,
      applicationId: existingApp?.applicationId,
      mlMatchScore: mlMatch?.overallScore,
      mlMatchDetails: mlMatch
    },
    company
  });
});

app.post('/api/jobs', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;

    // Ensure user has recruiter or admin rights (or auto-provision recruiter role if posting a job)
    if (user.role !== 'recruiter' && user.role !== 'admin') {
      user.role = 'recruiter';
      db.users.updateOne(u => u._id === user._id, { role: 'recruiter' });
    }

    const { 
      title, 
      location, 
      workMode, 
      jobType, 
      experienceLevel, 
      minSalary, 
      maxSalary, 
      skills, 
      description, 
      responsibilities, 
      requirements, 
      benefits,
      deadline 
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Job title is mandatory.' });
      return;
    }

    let company = user.companyId ? db.companies.findOne(c => c._id === user.companyId) : null;
    if (!company) {
      // Find company by recruiterId or fallback
      company = db.companies.findOne(c => c.recruiterId === user._id) || db.companies.find()[0];
    }

    const parsedSkills = Array.isArray(skills) 
      ? skills 
      : (typeof skills === 'string' && skills.trim() 
          ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) 
          : ['JavaScript', 'TypeScript', 'React']);

    const finalDescription = description && description.trim() 
      ? description 
      : `We are looking for a dedicated and skilled ${title} to join ${company?.name || 'our dynamic engineering organization'}. In this position, you will design, engineer, and deploy high-impact services using ${parsedSkills.slice(0, 3).join(', ')}.`;

    const newJob: Job = {
      _id: `job_${Date.now()}`,
      title,
      companyId: company?._id || 'comp_nexatech',
      companyName: company?.name || 'Enterprise Partner',
      companyLogo: company?.logo || 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=128&auto=format&fit=crop&q=80',
      location: location || 'Bangalore, India',
      workMode: workMode || 'Hybrid',
      jobType: jobType || 'Full-time',
      experienceLevel: experienceLevel || 'Fresher',
      minSalary: parseInt(minSalary, 10) || 600000,
      maxSalary: parseInt(maxSalary, 10) || 1200000,
      currency: 'INR',
      skills: parsedSkills,
      description: finalDescription,
      responsibilities: Array.isArray(responsibilities) 
        ? responsibilities 
        : (responsibilities ? responsibilities.split('\n').map((s: string) => s.trim()).filter(Boolean) : [
            'Develop responsive, modular client and server systems.',
            'Collaborate with product and quality assurance engineering teams.',
            'Contribute to production deployments and code reviews.'
          ]),
      requirements: Array.isArray(requirements) 
        ? requirements 
        : (requirements ? requirements.split('\n').map((s: string) => s.trim()).filter(Boolean) : [
            'Degree in Computer Science, Information Technology, or equivalent experience.',
            'Demonstrated proficiency in core technical competencies.',
            'Proactive problem-solving capabilities and team spirit.'
          ]),
      benefits: Array.isArray(benefits) 
        ? benefits 
        : (benefits ? benefits.split('\n').map((s: string) => s.trim()).filter(Boolean) : [
            'Comprehensive Family Medical Insurance',
            'Hybrid Work Arrangement',
            'Professional Learning Stipend'
          ]),
      status: 'active',
      postedBy: user._id,
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isFeatured: false
    };

    db.jobs.insertOne(newJob);

    // Save job into Supabase database backend
    const supabaseJobResult = await saveJobToSupabase(newJob);

    // 1. Notification for Recruiter who posted
    db.notifications.insertOne({
      _id: `notif_${Date.now()}_recruiter_${user._id}`,
      userId: user._id,
      title: `Job Published: ${newJob.title}`,
      message: `Your job posting for ${newJob.title} at ${newJob.companyName} is live and open for student applications.`,
      type: 'job',
      link: `/jobs`,
      read: false,
      createdAt: new Date().toISOString()
    });

    // 2. Notification for All Students / Job Seekers
    const studentSeekers = db.users.find(u => u.role === 'job_seeker');
    studentSeekers.forEach(student => {
      db.notifications.insertOne({
        _id: `notif_${Date.now()}_student_${student._id}_${Math.random().toString(36).substring(2, 6)}`,
        userId: student._id,
        title: `New Opening: ${newJob.title}`,
        message: `${newJob.companyName} is hiring for ${newJob.title} (${newJob.workMode}, ${newJob.location}). Check your match and apply!`,
        type: 'job',
        link: `/jobs`,
        read: false,
        createdAt: new Date().toISOString()
      });
    });

    res.status(201).json({ 
      message: 'Job posting published successfully and saved to Supabase.', 
      job: newJob,
      supabase: supabaseJobResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create job.' });
  }
});

app.put('/api/jobs/:id', authenticateToken, requireRole('recruiter', 'admin'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const user = req.user!;
  const job = db.jobs.findOne(j => j._id === id);

  if (!job) {
    res.status(404).json({ error: 'Job not found.' });
    return;
  }

  if (user.role !== 'admin' && job.postedBy !== user._id) {
    res.status(403).json({ error: 'You are not authorized to edit this job posting.' });
    return;
  }

  const updatedJob = db.jobs.updateOne(j => j._id === id, req.body);
  res.json({ message: 'Job updated successfully.', job: updatedJob });
});

app.delete('/api/jobs/:id', authenticateToken, requireRole('recruiter', 'admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const job = db.jobs.findOne(j => j._id === id);

    if (!job) {
      res.status(404).json({ error: 'Job not found.' });
      return;
    }

    // Both recruiters and platform admins have job management & deletion rights
    const canDelete = user.role === 'admin' || user.role === 'recruiter' || job.postedBy === user._id;
    if (!canDelete) {
      res.status(403).json({ error: 'You are not authorized to delete this job posting.' });
      return;
    }

    // 1. Delete from in-memory / JSON database
    db.jobs.deleteOne(j => j._id === id);
    while (db.savedJobs.findOne(s => s.jobId === id)) {
      db.savedJobs.deleteOne(s => s.jobId === id);
    }

    // 2. Delete from Supabase
    const supabaseResult = await deleteJobFromSupabase(id);

    // 3. Create notification for recruiter
    db.notifications.insertOne({
      _id: `notif_${Date.now()}_del_${user._id}`,
      userId: user._id,
      title: `Job Removed: ${job.title}`,
      message: `The job posting "${job.title}" has been deleted from CareerMatch and removed from Supabase.`,
      type: 'job',
      link: '/dashboard',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({ 
      message: `Job posting "${job.title}" deleted successfully and removed from Supabase.`,
      jobId: id,
      supabase: supabaseResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete job posting.' });
  }
});

// 5. Job Bookmarking / Save
app.post('/api/jobs/:id/save', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const existing = db.savedJobs.findOne(s => s.userId === userId && s.jobId === id);
  if (existing) {
    db.savedJobs.deleteOne(s => s._id === existing._id);
    res.json({ saved: false, message: 'Removed from saved jobs.' });
  } else {
    db.savedJobs.insertOne({
      _id: `save_${Date.now()}`,
      userId,
      jobId: id,
      savedAt: new Date().toISOString()
    });
    res.json({ saved: true, message: 'Job saved to your bookmarks.' });
  }
});

app.get('/api/saved-jobs', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id;
  const savedRecords = db.savedJobs.find(s => s.userId === userId);
  const jobIds = savedRecords.map(s => s.jobId);
  const jobs = db.jobs.find(j => jobIds.includes(j._id)).map(j => ({ ...j, isSaved: true }));
  res.json({ jobs });
});

// 6. Application Workflow
app.post('/api/jobs/:id/apply', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const job = db.jobs.findOne(j => j._id === id);

    if (!job) {
      res.status(404).json({ error: 'Job posting not found.' });
      return;
    }

    const { 
      name, 
      email, 
      phone, 
      resumeUrl, 
      resumeName, 
      coverLetter, 
      educationSummary, 
      cgpa, 
      skills, 
      experienceYears, 
      portfolioUrl 
    } = req.body;

    if (!name || !email || !phone || !resumeUrl) {
      res.status(400).json({ error: 'Full name, email, phone, and resume are required.' });
      return;
    }

    const seekerId = user?._id || `seeker_guest_${Date.now()}`;

    const existing = db.applications.findOne(a => 
      ((user && a.seekerId === user._id) || a.seekerEmail.toLowerCase() === email.toLowerCase()) && 
      a.jobId === id
    );

    if (existing) {
      res.status(400).json({ error: `You have already applied for this position (Application ID: ${existing.applicationId}).` });
      return;
    }

    // Generate unique human-readable Application ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `APP-2026-${randomNum}`;

    // Calculate ML match score
    const seekerProfile = user?.profile || {
      education: [],
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
      experience: [],
      projects: [],
      internships: [],
      cgpa: cgpa || '8.0'
    };

    const matchAnalysis = calculateMatchScore(seekerProfile, job);

    const newApp: Application = {
      _id: `app_${Date.now()}`,
      applicationId,
      jobId: job._id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      seekerId,
      seekerName: name,
      seekerEmail: email,
      seekerPhone: phone,
      resumeUrl,
      resumeName: resumeName || 'Resume.pdf',
      coverLetter,
      educationSummary: educationSummary || 'Bachelor of Technology in CS',
      cgpa: cgpa || user?.profile?.cgpa || '8.5 / 10',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : user?.profile?.skills || []),
      experienceYears: parseFloat(experienceYears) || 0,
      portfolioUrl,
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          updatedAt: new Date().toISOString(),
          note: 'Application successfully received and registered in career pipeline.'
        }
      ],
      mlMatchScore: matchAnalysis.overallScore,
      skillMatchBreakdown: {
        matchedSkills: matchAnalysis.matchedSkills,
        missingSkills: matchAnalysis.missingSkills,
        matchPercentage: matchAnalysis.skillScore
      },
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.applications.insertOne(newApp);
    db.jobs.updateOne(j => j._id === job._id, { applicantsCount: (job.applicantsCount || 0) + 1 });

    // Save directly to Supabase backend table
    const supabaseSyncResult = await saveApplicationToSupabase(newApp);

    // Send notification to applicant if logged in
    if (user?._id) {
      db.notifications.insertOne({
        _id: `notif_${Date.now()}_seeker`,
        userId: user._id,
        title: `Application Submitted: ${job.title}`,
        message: `Your application (${applicationId}) for ${job.title} at ${job.companyName} was submitted.`,
        type: 'application',
        link: `/applications/${newApp._id}`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    // Send notification to recruiter who posted
    db.notifications.insertOne({
      _id: `notif_${Date.now()}_recruiter`,
      userId: job.postedBy,
      title: `New Applicant for ${job.title}`,
      message: `${name} (${matchAnalysis.overallScore}% match) applied for ${job.title}.`,
      type: 'application',
      link: '/recruiter/applications',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ 
      message: 'Application submitted successfully!', 
      application: newApp,
      supabase: supabaseSyncResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit application.' });
  }
});

// Supabase Integration Management Endpoints
app.get('/api/supabase/status', async (_req, res) => {
  try {
    const health = await checkSupabaseHealth();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to check Supabase status' });
  }
});

app.post('/api/supabase/sync', async (_req, res) => {
  try {
    const syncRes = await syncQueuedApplications();
    res.json(syncRes);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to trigger Supabase sync' });
  }
});

app.get('/api/supabase/schema', (_req, res) => {
  res.json({
    projectId: SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    sqlSchema: SUPABASE_SQL_SCHEMA
  });
});

app.get('/api/applications', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  
  if (user.role === 'job_seeker') {
    const apps = db.applications.find(a => a.seekerId === user._id);
    apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    res.json({ applications: apps });
  } else if (user.role === 'recruiter') {
    // Find all jobs posted by recruiter or under their company
    const recruiterJobs = db.jobs.find(j => Boolean(j.postedBy === user._id || (user.companyId && j.companyId === user.companyId)));
    const jobIds = recruiterJobs.map(j => j._id);
    const apps = db.applications.find(a => Boolean(jobIds.includes(a.jobId) || (user.companyId && a.companyId === user.companyId)));
    apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    res.json({ applications: apps, jobs: recruiterJobs });
  } else {
    // Admin
    const apps = db.applications.find();
    apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    res.json({ applications: apps });
  }
});

app.get('/api/applications/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const user = req.user!;
  const application = db.applications.findOne(a => a._id === id || a.applicationId === id);

  if (!application) {
    res.status(404).json({ error: 'Application record not found.' });
    return;
  }

  // Access check
  if (user.role === 'job_seeker' && application.seekerId !== user._id) {
    res.status(403).json({ error: 'Unauthorized to view this application.' });
    return;
  }

  const job = db.jobs.findOne(j => j._id === application.jobId);
  const company = db.companies.findOne(c => c._id === application.companyId);

  res.json({ application, job, company });
});

// Update Application Status (Recruiter / Admin)
app.put('/api/applications/:id/status', authenticateToken, requireRole('recruiter', 'admin'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, note } = req.body as { status: ApplicationStatus; note?: string };

  const validStatuses: ApplicationStatus[] = [
    'Applied', 
    'Under Review', 
    'Shortlisted', 
    'Interview', 
    'Selected', 
    'Rejected'
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid application status provided.' });
    return;
  }

  const appRecord = db.applications.findOne(a => a._id === id);
  if (!appRecord) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  const updatedHistory = [
    ...appRecord.statusHistory,
    {
      status,
      updatedAt: new Date().toISOString(),
      note: note || `Status updated to ${status}.`
    }
  ];

  const updated = db.applications.updateOne(a => a._id === id, {
    status,
    statusHistory: updatedHistory,
    updatedAt: new Date().toISOString()
  });

  // Sync update to Supabase
  if (updated) {
    saveApplicationToSupabase(updated).catch(err => {
      console.warn('[Supabase] Failed to update status in Supabase:', err);
    });
  }

  // Notify applicant
  let notifType: Notification['type'] = 'application';
  if (status === 'Interview') notifType = 'interview';
  else if (status === 'Selected') notifType = 'selection';
  else if (status === 'Rejected') notifType = 'rejection';

  db.notifications.insertOne({
    _id: `notif_${Date.now()}`,
    userId: appRecord.seekerId,
    title: `Application Status: ${status}`,
    message: `Your application (${appRecord.applicationId}) for ${appRecord.jobTitle} at ${appRecord.companyName} is now marked as ${status}. ${note ? `Note: "${note}"` : ''}`,
    type: notifType,
    link: `/applications/${appRecord._id}`,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: `Application status updated to ${status}.`, application: updated });
});

// Schedule Interview (Recruiter / Admin)
app.put('/api/applications/:id/interview', authenticateToken, requireRole('recruiter', 'admin'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { scheduledDate, scheduledTime, meetingLink, type, interviewers, notes } = req.body;

  if (!scheduledDate || !scheduledTime || !meetingLink) {
    res.status(400).json({ error: 'Scheduled date, time, and meeting link are required.' });
    return;
  }

  const appRecord = db.applications.findOne(a => a._id === id);
  if (!appRecord) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  const interviewDetails = {
    scheduledDate,
    scheduledTime,
    meetingLink,
    type: type || 'Technical & Cultural Fit Assessment',
    interviewers: interviewers || 'Hiring Panel',
    notes: notes || 'Please ensure a quiet environment and working webcam/microphone.'
  };

  const updatedHistory = [
    ...appRecord.statusHistory,
    {
      status: 'Interview' as ApplicationStatus,
      updatedAt: new Date().toISOString(),
      note: `Interview scheduled on ${scheduledDate} at ${scheduledTime}. Link: ${meetingLink}`
    }
  ];

  const updated = db.applications.updateOne(a => a._id === id, {
    status: 'Interview',
    interviewDetails,
    statusHistory: updatedHistory,
    updatedAt: new Date().toISOString()
  });

  // Notify candidate
  db.notifications.insertOne({
    _id: `notif_${Date.now()}`,
    userId: appRecord.seekerId,
    title: `Interview Invitation: ${appRecord.jobTitle}`,
    message: `${appRecord.companyName} has scheduled an interview for ${scheduledDate} at ${scheduledTime}. Click to view details and meeting link.`,
    type: 'interview',
    link: `/applications/${appRecord._id}`,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: 'Interview scheduled and candidate notified.', application: updated });
});

// Issue Selection & Appointment Letter (Recruiter / Admin)
app.post('/api/applications/:id/appointment-letter', authenticateToken, requireRole('recruiter', 'admin'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { joiningDate, salaryOffered, designation, workLocation, reportingManager, probationMonths, notes, benefitsSummary } = req.body;

  if (!joiningDate || !salaryOffered || !designation) {
    res.status(400).json({ error: 'Joining date, offered salary, and designation are required.' });
    return;
  }

  const appRecord = db.applications.findOne(a => a._id === id);
  if (!appRecord) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  const letterId = `APPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const appointmentLetter = {
    letterId,
    issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    joiningDate,
    salaryOffered: parseInt(salaryOffered, 10),
    designation,
    workLocation: workLocation || 'Headquarters / Hybrid',
    reportingManager: reportingManager || 'Engineering Director',
    probationMonths: probationMonths || 3,
    benefitsSummary: benefitsSummary || [
      `Annual Fixed + Performance CTC: ₹${(parseInt(salaryOffered, 10)).toLocaleString('en-IN')}`,
      'Family Healthcare and Dental Insurance Coverage',
      'Flexible Work Arrangements & Learning Allowance'
    ],
    notes: notes || 'Welcome to the team! Please sign and upload the digital acceptance copy before joining.'
  };

  const updatedHistory = [
    ...appRecord.statusHistory,
    {
      status: 'Selected' as ApplicationStatus,
      updatedAt: new Date().toISOString(),
      note: `Candidate selected! Official Appointment Letter (${letterId}) issued.`
    }
  ];

  const updated = db.applications.updateOne(a => a._id === id, {
    status: 'Selected',
    appointmentLetter,
    statusHistory: updatedHistory,
    updatedAt: new Date().toISOString()
  });

  // Notify candidate
  db.notifications.insertOne({
    _id: `notif_${Date.now()}`,
    userId: appRecord.seekerId,
    title: 'Offer Issued: Official Appointment Letter Ready!',
    message: `Congratulations! ${appRecord.companyName} has issued your official appointment letter for ${designation}. View and download your letter now!`,
    type: 'selection',
    link: `/applications/${appRecord._id}`,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ message: 'Appointment letter issued successfully!', application: updated });
});

// 7. Companies Endpoints
app.get('/api/companies', (_req, res) => {
  const companies = db.companies.find();
  const jobs = db.jobs.find(j => j.status === 'active');
  const enriched = companies.map(c => ({
    ...c,
    openJobsCount: jobs.filter(j => j.companyId === c._id).length
  }));
  res.json({ companies: enriched });
});

app.get('/api/companies/:id', (req, res) => {
  const { id } = req.params;
  const company = db.companies.findOne(c => c._id === id);
  if (!company) {
    res.status(404).json({ error: 'Company not found.' });
    return;
  }
  const jobs = db.jobs.find(j => j.companyId === id && j.status === 'active');
  res.json({ company, jobs });
});

app.put('/api/companies/:id', authenticateToken, requireRole('recruiter', 'admin'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const user = req.user!;
  const company = db.companies.findOne(c => c._id === id);

  if (!company) {
    res.status(404).json({ error: 'Company not found.' });
    return;
  }

  if (user.role !== 'admin' && company.recruiterId !== user._id) {
    res.status(403).json({ error: 'Unauthorized to update this company profile.' });
    return;
  }

  const updated = db.companies.updateOne(c => c._id === id, req.body);
  res.json({ message: 'Company profile updated.', company: updated });
});

// 8. Notifications
app.get('/api/notifications', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id;
  const notifs = db.notifications.find(n => n.userId === userId);
  res.json({ notifications: notifs, unreadCount: notifs.filter(n => !n.read).length });
});

app.put('/api/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!._id;
  db.notifications.updateMany(n => n._id === id && n.userId === userId, { read: true });
  res.json({ success: true });
});

app.put('/api/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!._id;
  db.notifications.updateMany(n => n.userId === userId, { read: true });
  res.json({ success: true });
});

// 9. ML Intelligence & Predictive APIs
app.get('/api/ml/recommendations', authenticateToken, requireRole('job_seeker'), (req: AuthenticatedRequest, res) => {
  const profile = req.user!.profile;
  const allJobs = db.jobs.find(j => j.status === 'active');

  const scored = allJobs.map(job => {
    const match = calculateMatchScore(profile, job);
    return {
      job,
      matchScore: match.overallScore,
      skillScore: match.skillScore,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      compatibilityTier: match.compatibilityTier,
      strengths: match.strengths,
      recommendations: match.recommendations
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  res.json({ recommendations: scored.slice(0, 6) });
});

app.post('/api/ml/skill-gap', (req, res) => {
  const { skills, targetRole } = req.body;
  const skillList = Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []);
  const analysis = analyzeSkillGaps(skillList, targetRole || 'Full Stack Developer');
  res.json({ analysis });
});

app.post('/api/ml/salary-estimator', (req, res) => {
  const { role, experienceLevel, skillsCount } = req.body;
  const estimate = predictSalary(
    role || 'Full Stack Engineer', 
    experienceLevel || 'Fresher', 
    parseInt(skillsCount, 10) || 5
  );
  res.json({ estimate });
});

// 10. Admin Endpoints
app.get('/api/admin/stats', authenticateToken, requireRole('admin'), (_req, res) => {
  const totalUsers = db.users.countDocuments();
  const totalSeekers = db.users.countDocuments(u => u.role === 'job_seeker');
  const totalRecruiters = db.users.countDocuments(u => u.role === 'recruiter');
  const totalCompanies = db.companies.countDocuments();
  const totalJobs = db.jobs.countDocuments();
  const activeJobs = db.jobs.countDocuments(j => j.status === 'active');
  const totalApplications = db.applications.countDocuments();
  const selectedCount = db.applications.countDocuments(a => a.status === 'Selected');
  const interviewCount = db.applications.countDocuments(a => a.status === 'Interview');
  
  const placementRate = totalApplications > 0 ? Math.round((selectedCount / totalApplications) * 100) : 0;

  res.json({
    metrics: {
      totalUsers,
      totalSeekers,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      selectedCount,
      interviewCount,
      placementRate
    },
    topSkills: [
      { name: 'React', count: 48 },
      { name: 'TypeScript', count: 42 },
      { name: 'Node.js', count: 39 },
      { name: 'Python', count: 31 },
      { name: 'MongoDB', count: 28 },
      { name: 'Docker', count: 24 }
    ],
    recentAudits: db.reports.find().slice(0, 5)
  });
});

app.get('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  const { role, status, search } = req.query as Record<string, string>;
  let users = db.users.find();

  if (role) users = users.filter(u => u.role === role);
  if (status) users = users.filter(u => u.status === status);
  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  const safeUsers = users.map(({ password: _, ...rest }) => rest);
  res.json({ users: safeUsers });
});

app.put('/api/admin/users/:id/status', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    res.status(400).json({ error: 'Status must be active or suspended.' });
    return;
  }
  const updated = db.users.updateOne(u => u._id === id, { status });
  res.json({ message: 'User status updated.', user: updated });
});

app.put('/api/admin/users/:id/role', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['job_seeker', 'recruiter', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Invalid role.' });
    return;
  }
  const updated = db.users.updateOne(u => u._id === id, { role });
  res.json({ message: 'User role updated.', user: updated });
});

app.delete('/api/admin/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  db.users.deleteOne(u => u._id === id);
  res.json({ message: 'User removed from platform.' });
});

app.get('/api/admin/jobs', authenticateToken, requireRole('admin'), (_req, res) => {
  res.json({ jobs: db.jobs.find() });
});

app.put('/api/admin/jobs/:id/approval', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = db.jobs.updateOne(j => j._id === id, { status });
  res.json({ message: 'Job status updated.', job: updated });
});

app.put('/api/admin/jobs/:id/featured', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { isFeatured } = req.body;
  const updated = db.jobs.updateOne(j => j._id === id, { isFeatured });
  res.json({ message: 'Featured status updated.', job: updated });
});

app.get('/api/admin/reports', authenticateToken, requireRole('admin'), (_req, res) => {
  res.json({ reports: db.reports.find() });
});

// Setup dev server middlewares or static production serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev, attach Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`CareerMatch server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup failure:', err);
});
