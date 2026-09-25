import { SeekerProfile, Job } from './types.js';

// Normalized skill synonyms for robust semantic matching
const SKILL_SYNONYMS: Record<string, string[]> = {
  'react': ['reactjs', 'react.js', 'react native', 'next.js', 'nextjs'],
  'node': ['nodejs', 'node.js', 'express', 'express.js', 'nest', 'nestjs'],
  'javascript': ['js', 'es6', 'typescript', 'ts'],
  'typescript': ['ts', 'javascript'],
  'python': ['python3', 'django', 'fastapi', 'flask', 'pandas', 'numpy'],
  'database': ['sql', 'postgresql', 'postgres', 'mysql', 'mongodb', 'redis'],
  'mongodb': ['nosql', 'mongoose', 'mongo'],
  'sql': ['postgresql', 'mysql', 'sqlite', 'rdbms', 'postgres'],
  'aws': ['amazon web services', 'cloud', 's3', 'ec2', 'lambda'],
  'docker': ['containerization', 'kubernetes', 'k8s', 'devops'],
  'machine learning': ['ml', 'deep learning', 'ai', 'data science', 'pytorch', 'tensorflow', 'scikit-learn'],
  'ui/ux': ['figma', 'wireframing', 'prototyping', 'user research', 'tailwind', 'css'],
  'tailwind': ['tailwindcss', 'css', 'styled-components'],
  'git': ['github', 'gitlab', 'version control']
};

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim().replace(/[-_.]/g, '');
}

function skillsMatch(seekerSkill: string, requiredSkill: string): boolean {
  const normSeeker = normalizeSkill(seekerSkill);
  const normReq = normalizeSkill(requiredSkill);

  if (normSeeker === normReq) return true;
  if (normSeeker.includes(normReq) || normReq.includes(normSeeker)) return true;

  for (const [key, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    const keyNorm = normalizeSkill(key);
    const synNorms = synonyms.map(normalizeSkill);
    const group = [keyNorm, ...synNorms];

    const seekerInGroup = group.some(s => s === normSeeker || normSeeker.includes(s));
    const reqInGroup = group.some(s => s === normReq || normReq.includes(s));

    if (seekerInGroup && reqInGroup) return true;
  }

  return false;
}

export interface MatchScoreResult {
  overallScore: number; // 0 - 100
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

export function calculateMatchScore(profile: SeekerProfile | undefined, job: Job): MatchScoreResult {
  if (!profile) {
    return {
      overallScore: 50,
      skillScore: 50,
      experienceScore: 50,
      educationScore: 50,
      salaryScore: 50,
      matchedSkills: [],
      missingSkills: job.skills,
      strengths: ['Standard applicant baseline'],
      recommendations: ['Complete your profile skills to unlock accurate ML match scoring.'],
      compatibilityTier: 'Moderate Fit'
    };
  }

  const seekerSkills = profile.skills || [];
  const requiredSkills = job.skills || [];

  // 1. Skill Match Analysis
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of requiredSkills) {
    const isMatched = seekerSkills.some(userSkill => skillsMatch(userSkill, req));
    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const skillScore = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 80;

  // 2. Experience Match Analysis
  let experienceScore = 70;
  const userExperienceCount = (profile.experience?.length || 0) + (profile.internships?.length || 0);

  if (job.experienceLevel === 'Fresher') {
    experienceScore = 95; // Freshers and students get high points
    if (profile.internships && profile.internships.length > 0) experienceScore = 100;
  } else if (job.experienceLevel === '1-3 years') {
    if (userExperienceCount >= 1) experienceScore = 90;
    else if (profile.internships && profile.internships.length >= 2) experienceScore = 80;
    else experienceScore = 65;
  } else if (job.experienceLevel === '3-5 years') {
    if (profile.experience && profile.experience.length >= 2) experienceScore = 90;
    else experienceScore = 60;
  } else {
    // 5+ years
    if (profile.experience && profile.experience.length >= 3) experienceScore = 90;
    else experienceScore = 55;
  }

  // 3. Education & CGPA Score
  let educationScore = 75;
  const cgpaValue = parseFloat(profile.cgpa || '7.5');
  if (!isNaN(cgpaValue)) {
    if (cgpaValue >= 9.0) educationScore = 98;
    else if (cgpaValue >= 8.0) educationScore = 90;
    else if (cgpaValue >= 7.0) educationScore = 82;
    else educationScore = 72;
  }
  if (profile.education && profile.education.length > 0) {
    educationScore = Math.min(100, educationScore + 5);
  }

  // 4. Salary Alignment
  let salaryScore = 85;
  if (profile.expectedSalary && job.minSalary && job.maxSalary) {
    if (profile.expectedSalary >= job.minSalary && profile.expectedSalary <= job.maxSalary) {
      salaryScore = 100;
    } else if (profile.expectedSalary < job.minSalary) {
      salaryScore = 95; // Within employer budget
    } else if (profile.expectedSalary <= job.maxSalary * 1.15) {
      salaryScore = 75;
    } else {
      salaryScore = 55;
    }
  }

  // Weighted overall calculation: 45% skills, 25% experience, 15% education, 15% salary/fit
  const overall = Math.round(
    skillScore * 0.45 +
    experienceScore * 0.25 +
    educationScore * 0.15 +
    salaryScore * 0.15
  );

  const clampedOverall = Math.max(20, Math.min(99, overall));

  // Strengths and recommendations
  const strengths: string[] = [];
  const recommendations: string[] = [];

  if (matchedSkills.length >= 3) {
    strengths.push(`Core competencies aligned: ${matchedSkills.slice(0, 3).join(', ')}`);
  }
  if (experienceScore >= 85) {
    strengths.push('Experience level strongly matches role seniority expectations.');
  }
  if (educationScore >= 85) {
    strengths.push(`Solid academic track record (CGPA: ${profile.cgpa || '8.2+'}).`);
  }

  if (missingSkills.length > 0) {
    recommendations.push(`Acquire high-demand target skill: ${missingSkills.slice(0, 2).join(' and ')} to maximize candidate rating.`);
  }
  if (!profile.projects || profile.projects.length < 2) {
    recommendations.push('Add at least 2 hands-on portfolio projects demonstrating full lifecycle execution.');
  }

  let tier: MatchScoreResult['compatibilityTier'] = 'Moderate Fit';
  if (clampedOverall >= 85) tier = 'Exceptional Fit';
  else if (clampedOverall >= 70) tier = 'Strong Fit';
  else if (clampedOverall >= 50) tier = 'Moderate Fit';
  else tier = 'Growth Opportunity';

  return {
    overallScore: clampedOverall,
    skillScore,
    experienceScore,
    educationScore,
    salaryScore,
    matchedSkills,
    missingSkills,
    strengths: strengths.length ? strengths : ['General foundational alignment with company stack'],
    recommendations: recommendations.length ? recommendations : ['Review company engineering principles prior to interview'],
    compatibilityTier: tier
  };
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

export function analyzeSkillGaps(seekerSkills: string[], targetRole: string): SkillGapAnalysis {
  const normSeeker = seekerSkills.map(normalizeSkill);

  // Role standard skill profiles
  const roleSkillProfiles: Record<string, { high: string[]; medium: string[] }> = {
    'Full Stack Developer': {
      high: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs'],
      medium: ['Docker', 'AWS', 'Tailwind CSS', 'Git', 'Jest']
    },
    'Frontend Engineer': {
      high: ['React', 'TypeScript', 'Next.js', 'CSS/Tailwind', 'JavaScript'],
      medium: ['Performance Optimization', 'Figma', 'GraphQL', 'Vite', 'State Management']
    },
    'Backend Engineer': {
      high: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'System Design'],
      medium: ['Docker', 'Redis', 'Microservices', 'CI/CD', 'Kafka']
    },
    'Data Scientist / ML Engineer': {
      high: ['Python', 'Machine Learning', 'Pandas', 'SQL', 'PyTorch'],
      medium: ['Data Visualization', 'Docker', 'FastAPI', 'Cloud Deployments', 'Statistics']
    }
  };

  const selectedProfile = roleSkillProfiles[targetRole] || roleSkillProfiles['Full Stack Developer'];

  const results: SkillGapAnalysis['requiredSkills'] = [];
  let masteredCount = 0;

  for (const s of selectedProfile.high) {
    const isMastered = normSeeker.some(us => us.includes(normalizeSkill(s)) || normalizeSkill(s).includes(us));
    if (isMastered) masteredCount++;
    results.push({
      skill: s,
      status: isMastered ? 'mastered' : 'missing',
      priority: 'High'
    });
  }

  for (const s of selectedProfile.medium) {
    const isMastered = normSeeker.some(us => us.includes(normalizeSkill(s)) || normalizeSkill(s).includes(us));
    if (isMastered) masteredCount++;
    results.push({
      skill: s,
      status: isMastered ? 'mastered' : 'missing',
      priority: 'Medium'
    });
  }

  const total = results.length;
  const matchPercentage = Math.round((masteredCount / total) * 100);

  return {
    role: targetRole,
    userSkillsCount: seekerSkills.length,
    requiredSkills: results,
    missingCount: total - masteredCount,
    matchPercentage,
    recommendedCertifications: [
      'AWS Certified Developer Associate',
      'Meta Professional Frontend / Backend Certificate',
      'MongoDB Certified Developer Associate'
    ],
    suggestedProjects: [
      'Build a real-time collaborative workspace with WebSockets & Redis',
      'Architect an end-to-end e-commerce engine with payment webhooks and role RBAC',
      'Develop an automated CI/CD pipeline deploying containerized microservices to cloud'
    ]
  };
}

export function predictSalary(role: string, experienceLevel: string, skillsCount: number): {
  min: number;
  max: number;
  median: number;
  currency: string;
  insights: string;
} {
  let baseMin = 450000;
  let baseMax = 700000;

  if (experienceLevel === 'Fresher') {
    baseMin = 450000;
    baseMax = 800000;
  } else if (experienceLevel === '1-3 years') {
    baseMin = 750000;
    baseMax = 1400000;
  } else if (experienceLevel === '3-5 years') {
    baseMin = 1300000;
    baseMax = 2200000;
  } else {
    // 5+ years
    baseMin = 2000000;
    baseMax = 3800000;
  }

  // Bonus for modern stack skills count
  const skillBonus = Math.min(skillsCount * 25000, 250000);
  const min = baseMin + skillBonus;
  const max = baseMax + skillBonus;
  const median = Math.round((min + max) / 2);

  return {
    min,
    max,
    median,
    currency: 'INR',
    insights: `Market compensation based on current tech index for ${experienceLevel} ${role} with ${skillsCount} verified competencies.`
  };
}
