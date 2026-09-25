import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Company, 
  Job, 
  Application, 
  Notification, 
  SavedJob, 
  SystemReport 
} from './types.js';

interface DatabaseSchema {
  users: User[];
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  notifications: Notification[];
  savedJobs: SavedJob[];
  reports: SystemReport[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'career_hub_db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbMemory: DatabaseSchema = {
  users: [],
  companies: [],
  jobs: [],
  applications: [],
  notifications: [],
  savedJobs: [],
  reports: []
};

// Common demo password hash for "password123"
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

function getInitialSeedData(): DatabaseSchema {
  const users: User[] = [
    {
      _id: 'usr_seeker_1',
      name: 'Aarav Sharma',
      email: 'seeker@careermatch.io',
      password: DEMO_PASSWORD_HASH,
      role: 'job_seeker',
      status: 'active',
      avatar: '/src/assets/images/avatar_seeker_student_1790177545046.jpg',
      createdAt: '2026-08-10T10:00:00.000Z',
      profile: {
        title: 'Full Stack Developer & CS Graduate',
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        cgpa: '8.85',
        skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Docker', 'Git', 'REST APIs', 'PostgreSQL'],
        education: [
          {
            degree: 'Bachelor of Technology (B.Tech)',
            institution: 'National Institute of Technology Karnataka (NITK)',
            field: 'Computer Science & Engineering',
            startYear: '2022',
            endYear: '2026',
            cgpa: '8.85 / 10'
          },
          {
            degree: 'Higher Secondary School Certificate (12th)',
            institution: 'Delhi Public School',
            field: 'Science (PCM & CS)',
            startYear: '2020',
            endYear: '2022',
            cgpa: '95.2%'
          }
        ],
        experience: [
          {
            title: 'Software Developer Intern',
            company: 'TechCorp Solutions',
            duration: 'Jan 2026 - Present (3 mos)',
            description: 'Built high-throughput REST microservices in Node.js and improved client-side rendering speed by 35% using React 19.'
          }
        ],
        internships: [
          {
            role: 'Frontend Engineering Intern',
            company: 'HyperScale Systems',
            duration: 'May 2025 - Jul 2025 (3 mos)',
            learnings: 'Engineered analytics dashboards with interactive charting, responsive layouts, and clean API caching.'
          }
        ],
        projects: [
          {
            title: 'Distributed Job Scheduling Engine',
            description: 'Scalable queuing system built with Node.js, Redis, and Docker with automatic worker re-balancing.',
            techStack: ['Node.js', 'Redis', 'Docker', 'TypeScript'],
            link: 'https://github.com/example/job-scheduler'
          },
          {
            title: 'Campus Placement & Skill Evaluator',
            description: 'Full-stack application allowing student batch analysis, skill gap reporting, and resume parsing.',
            techStack: ['React', 'MongoDB', 'Express', 'Tailwind CSS'],
            link: 'https://github.com/example/campus-placements'
          }
        ],
        preferredRole: 'Full Stack Developer',
        preferredLocation: 'Bangalore / Remote',
        expectedSalary: 750000,
        resumeUrl: 'https://careermatch.io/resumes/aarav_sharma_resume_2026.pdf',
        resumeName: 'Aarav_Sharma_Resume_CS_2026.pdf',
        bio: 'Passionate computer science student and fresher software engineer. Enthusiastic about robust backend architectures, sleek responsive user interfaces, and automated pipelines.',
        github: 'https://github.com/aaravsharma-dev',
        linkedin: 'https://linkedin.com/in/aaravsharma-tech',
        portfolio: 'https://aaravsharma.dev'
      }
    },
    {
      _id: 'usr_recruiter_1',
      name: 'Priya Menon',
      email: 'recruiter@careermatch.io',
      password: DEMO_PASSWORD_HASH,
      role: 'recruiter',
      status: 'active',
      avatar: '/src/assets/images/avatar_recruiter_tech_1790177531247.jpg',
      createdAt: '2026-07-15T09:30:00.000Z',
      companyId: 'comp_nexatech',
      designation: 'Director of Talent Acquisition',
      department: 'Engineering Recruitment'
    },
    {
      _id: 'usr_admin_1',
      name: 'Dr. Vikram Sethi',
      email: 'admin@careermatch.io',
      password: DEMO_PASSWORD_HASH,
      role: 'admin',
      status: 'active',
      avatar: '/src/assets/images/avatar_recruiter_tech_1790177531247.jpg',
      createdAt: '2026-06-01T08:00:00.000Z'
    }
  ];

  const companies: Company[] = [
    {
      _id: 'comp_nexatech',
      name: 'NexaTech Systems',
      logo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=128&auto=format&fit=crop&q=80',
      tagline: 'Empowering Next-Generation Cloud & Financial Infrastructure',
      description: 'NexaTech is a tier-1 enterprise software company specializing in ultra-low latency transaction systems, developer platforms, and cloud infrastructure.',
      industry: 'Enterprise Software & Cloud Platforms',
      website: 'https://nexatechsystems.io',
      location: 'Bangalore, Karnataka, India',
      employeeCount: '500-1000 employees',
      foundedYear: '2019',
      verified: true,
      recruiterId: 'usr_recruiter_1',
      contactEmail: 'careers@nexatechsystems.io',
      benefits: [
        'Comprehensive Health & Family Medical Coverage',
        'Competitive Stock Options (ESOPs)',
        'Hybrid & Flexible Work Model',
        'Annual Learning & Conference Stipend (₹1,00,000)',
        'Ergonomic Workstation & Hardware Budget'
      ],
      bannerImage: '/src/assets/images/company_tech_campus_1790177557242.jpg'
    },
    {
      _id: 'comp_apexcloud',
      name: 'ApexCloud Labs',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      tagline: 'Autonomous Kubernetes & DevOps Observability',
      description: 'ApexCloud provides real-time telemetry, automated container mesh scaling, and developer productivity tools trusted by over 200 global companies.',
      industry: 'DevOps & Cloud Observability',
      website: 'https://apexcloudlabs.io',
      location: 'Hyderabad, Telangana, India',
      employeeCount: '250-500 employees',
      foundedYear: '2021',
      verified: true,
      recruiterId: 'usr_recruiter_1',
      contactEmail: 'talent@apexcloudlabs.io',
      benefits: [
        '100% Remote-First Culture',
        'Generous Performance Bonuses',
        'Home Office Setup Reimbursement',
        'Wellness Allowance and Mental Health Support'
      ]
    },
    {
      _id: 'comp_datapulse',
      name: 'DataPulse AI',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
      tagline: 'Architecting Applied Intelligence for Enterprise Data',
      description: 'DataPulse AI builds enterprise foundational models and automated data ingestion pipelines for large-scale predictive workflows.',
      industry: 'Artificial Intelligence & Machine Learning',
      website: 'https://datapulse.ai',
      location: 'Pune, Maharashtra, India',
      employeeCount: '100-250 employees',
      foundedYear: '2022',
      verified: true,
      recruiterId: 'usr_recruiter_1',
      contactEmail: 'hiring@datapulse.ai',
      benefits: [
        'Top-Tier GPU Cloud Access',
        'Patent Filing Bonus Incentives',
        'Fast-Track Leadership Mentorship',
        'Flexible Hours'
      ]
    },
    {
      _id: 'comp_finstream',
      name: 'FinStream Global',
      logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
      tagline: 'Modern Global Remittance and Banking Infrastructure',
      description: 'FinStream powers cross-border financial transactions with cryptographic settlement networks and instant compliance automation.',
      industry: 'FinTech & Payments',
      website: 'https://finstream.global',
      location: 'Gurgaon, Haryana, India',
      employeeCount: '200-500 employees',
      foundedYear: '2020',
      verified: true,
      recruiterId: 'usr_recruiter_1',
      contactEmail: 'jobs@finstream.global',
      benefits: [
        'Annual Performance Incentive',
        'Comprehensive Insurance',
        'Relocation Assistance'
      ]
    }
  ];

  const jobs: Job[] = [
    {
      _id: 'job_nexatech_fullstack',
      title: 'Full Stack Software Engineer (React & Node.js)',
      companyId: 'comp_nexatech',
      companyName: 'NexaTech Systems',
      companyLogo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=128&auto=format&fit=crop&q=80',
      location: 'Bangalore, Karnataka',
      workMode: 'Hybrid',
      jobType: 'Full-time',
      experienceLevel: 'Fresher',
      minSalary: 650000,
      maxSalary: 950000,
      currency: 'INR',
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Git'],
      description: 'We are seeking an ambitious, detail-oriented Full Stack Engineer to join our Core Platform Engineering team. In this role, you will design and implement web applications, write high-performance REST APIs, and collaborate closely with our product architects.',
      responsibilities: [
        'Develop responsive, accessible, and high-performance user interfaces in React and TypeScript.',
        'Implement resilient backend microservices using Node.js, Express, and MongoDB.',
        'Write clean unit and integration tests to ensure fault-tolerant deployments.',
        'Participate in sprint architecture design, code reviews, and cross-team knowledge sharing.'
      ],
      requirements: [
        'B.Tech / B.E. or equivalent degree in Computer Science, IT, or related technical disciplines.',
        'Strong practical fluency in JavaScript / TypeScript, modern React patterns, and Node.js.',
        'Solid foundation in Data Structures, Algorithms, and Object-Oriented Design.',
        'Experience building full-stack web applications during academic projects or prior internships.'
      ],
      benefits: [
        'Health & Life Insurance coverage',
        'Annual performance bonus up to 15%',
        'Hybrid working schedule (2 days office, 3 days home)',
        'Upskilling allowance'
      ],
      status: 'active',
      postedBy: 'usr_recruiter_1',
      applicantsCount: 14,
      createdAt: '2026-09-01T10:00:00.000Z',
      deadline: '2026-10-15T23:59:59.000Z',
      isFeatured: true
    },
    {
      _id: 'job_apexcloud_frontend',
      title: 'Frontend Engineer (React / Next.js / TypeScript)',
      companyId: 'comp_apexcloud',
      companyName: 'ApexCloud Labs',
      companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      location: 'Remote, India',
      workMode: 'Remote',
      jobType: 'Full-time',
      experienceLevel: '1-3 years',
      minSalary: 1000000,
      maxSalary: 1450000,
      currency: 'INR',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Performance Optimization', 'Jest'],
      description: 'ApexCloud Labs is looking for a skilled Frontend Engineer passionate about crafting pixel-perfect, sub-second telemetry dashboards and developer productivity suites.',
      responsibilities: [
        'Build and maintain mission-critical cloud observability dashboards.',
        'Optimize client bundle sizes, render cycles, and web vitals for high-density tabular interfaces.',
        'Collaborate with UI/UX designers to translate Figma design systems into scalable components.'
      ],
      requirements: [
        '1+ years of professional experience in React and TypeScript.',
        'Deep understanding of state management, custom hooks, and Tailwind CSS.',
        'Demonstrated portfolio or GitHub repositories showcasing production web projects.'
      ],
      benefits: [
        '100% Remote flexibility',
        'Comprehensive health insurance',
        'Workstation setup stipend of ₹80,000'
      ],
      status: 'active',
      postedBy: 'usr_recruiter_1',
      applicantsCount: 22,
      createdAt: '2026-09-05T11:00:00.000Z',
      deadline: '2026-10-20T23:59:59.000Z',
      isFeatured: true
    },
    {
      _id: 'job_datapulse_ml_intern',
      title: 'AI / Machine Learning Engineer Intern',
      companyId: 'comp_datapulse',
      companyName: 'DataPulse AI',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
      location: 'Pune / Remote',
      workMode: 'Remote',
      jobType: 'Internship',
      experienceLevel: 'Fresher',
      minSalary: 360000,
      maxSalary: 480000,
      currency: 'INR',
      skills: ['Python', 'Machine Learning', 'PyTorch', 'Pandas', 'FastAPI', 'Docker'],
      description: 'Join DataPulse AI as an ML Research Intern. Work on fine-tuning LLMs, evaluating model embeddings, and building automated data normalization pipelines for enterprise customers.',
      responsibilities: [
        'Assist in preparing and cleaning large-scale tabular and text datasets.',
        'Run benchmark experiments comparing model architectures, latency, and context efficiency.',
        'Develop lightweight FastAPI wrappers to serve predictive endpoints.'
      ],
      requirements: [
        'Currently pursuing or recently completed degree in Computer Science, Data Science, or Mathematics.',
        'Hands-on experience with Python, PyTorch/TensorFlow, and Scikit-Learn.',
        'Strong mathematical intuition in Linear Algebra, Calculus, and Probability.'
      ],
      benefits: [
        'Monthly stipend ₹35,000 - ₹40,000',
        'Direct pre-placement offer (PPO) opportunity based on performance',
        'Mentorship from senior AI research scientists'
      ],
      status: 'active',
      postedBy: 'usr_recruiter_1',
      applicantsCount: 38,
      createdAt: '2026-09-08T09:00:00.000Z',
      deadline: '2026-10-10T23:59:59.000Z',
      isFeatured: false
    },
    {
      _id: 'job_finstream_backend',
      title: 'Junior Backend Engineer (Node.js & PostgreSQL)',
      companyId: 'comp_finstream',
      companyName: 'FinStream Global',
      companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
      location: 'Gurgaon, Haryana',
      workMode: 'On-site',
      jobType: 'Full-time',
      experienceLevel: 'Fresher',
      minSalary: 600000,
      maxSalary: 850000,
      currency: 'INR',
      skills: ['Node.js', 'PostgreSQL', 'Express', 'Redis', 'Docker', 'REST APIs'],
      description: 'FinStream is expanding its core ledger team. We are hiring proactive Junior Backend Engineers to build secure transaction gateways and high-reliability ledger services.',
      responsibilities: [
        'Develop bulletproof transaction processing APIs with database concurrency controls.',
        'Design optimized relational schemas and write efficient SQL queries.',
        'Implement automated testing and audit logging for security compliance.'
      ],
      requirements: [
        'Degree in Computer Science or related quantitative field.',
        'Proficiency in Node.js and SQL database modeling.',
        'High attention to detail regarding data integrity and security.'
      ],
      benefits: [
        'Annual health checks & insurance',
        'Relocation assistance to Gurgaon',
        'Catered lunch on campus'
      ],
      status: 'active',
      postedBy: 'usr_recruiter_1',
      applicantsCount: 19,
      createdAt: '2026-09-12T14:30:00.000Z',
      deadline: '2026-10-25T23:59:59.000Z',
      isFeatured: false
    },
    {
      _id: 'job_apexcloud_devops',
      title: 'Cloud DevOps & Infrastructure Specialist',
      companyId: 'comp_apexcloud',
      companyName: 'ApexCloud Labs',
      companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      location: 'Hyderabad, Telangana',
      workMode: 'Hybrid',
      jobType: 'Full-time',
      experienceLevel: '3-5 years',
      minSalary: 1800000,
      maxSalary: 2600000,
      currency: 'INR',
      skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Prometheus'],
      description: 'Lead Kubernetes orchestration, multi-region cluster reliability, and automated zero-downtime deployment pipelines for enterprise scale.',
      responsibilities: [
        'Architect robust infrastructure as code (IaC) using Terraform.',
        'Maintain multi-tenant Kubernetes clusters with proactive alert thresholds.',
        'Partner with product teams to streamline CI/CD delivery pipelines.'
      ],
      requirements: [
        '3+ years managing production cloud workloads on AWS or GCP.',
        'Hands-on expertise with Helm, Kubernetes operators, and Prometheus/Grafana.',
        'Strong scripting skills in Bash or Python.'
      ],
      benefits: [
        'Attractive equity stock grants',
        'Flexible hours & health benefits'
      ],
      status: 'active',
      postedBy: 'usr_recruiter_1',
      applicantsCount: 9,
      createdAt: '2026-09-15T08:00:00.000Z',
      deadline: '2026-10-30T23:59:59.000Z',
      isFeatured: true
    }
  ];

  const applications: Application[] = [
    {
      _id: 'app_1',
      applicationId: 'APP-2026-8941',
      jobId: 'job_nexatech_fullstack',
      jobTitle: 'Full Stack Software Engineer (React & Node.js)',
      companyId: 'comp_nexatech',
      companyName: 'NexaTech Systems',
      companyLogo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=128&auto=format&fit=crop&q=80',
      seekerId: 'usr_seeker_1',
      seekerName: 'Aarav Sharma',
      seekerEmail: 'seeker@careermatch.io',
      seekerPhone: '+91 98765 43210',
      resumeUrl: 'https://careermatch.io/resumes/aarav_sharma_resume_2026.pdf',
      resumeName: 'Aarav_Sharma_Resume_CS_2026.pdf',
      coverLetter: 'I am thrilled to apply for the Full Stack Software Engineer role at NexaTech Systems. With my solid academic foundation at NITK, hands-on experience in React, TypeScript, Node.js, and MongoDB, and my deep passion for cloud infrastructure, I am confident I will make an immediate contribution to your Core Platform team.',
      educationSummary: 'B.Tech in Computer Science & Engineering, NITK (2022-2026)',
      cgpa: '8.85 / 10',
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Docker', 'Git'],
      experienceYears: 0.5,
      portfolioUrl: 'https://aaravsharma.dev',
      status: 'Selected',
      statusHistory: [
        { status: 'Applied', updatedAt: '2026-09-02T10:15:00.000Z', note: 'Application submitted successfully with verified profile data.' },
        { status: 'Under Review', updatedAt: '2026-09-03T14:20:00.000Z', note: 'Profile screened by Talent Acquisition team.' },
        { status: 'Shortlisted', updatedAt: '2026-09-05T16:00:00.000Z', note: 'Candidate cleared technical skill bar with top score.' },
        { status: 'Interview', updatedAt: '2026-09-08T11:00:00.000Z', note: 'Round 1 System Design and Round 2 Coding rounds conducted.' },
        { status: 'Selected', updatedAt: '2026-09-12T15:30:00.000Z', note: 'Final selection approved by Engineering Director. Appointment letter issued.' }
      ],
      interviewDetails: {
        scheduledDate: '2026-09-10',
        scheduledTime: '11:00 AM - 12:30 PM IST',
        meetingLink: 'https://meet.google.com/nxt-eng-interview',
        type: 'Technical Architecture & Live Coding Round',
        interviewers: 'Rohan Mehta (Principal Architect) & Priya Menon (HR)',
        notes: 'Discussion focused on React component optimization, REST API concurrency, and schema design.'
      },
      appointmentLetter: {
        letterId: 'NXT-OFFER-2026-0428',
        issuedDate: 'September 12, 2026',
        joiningDate: 'October 1, 2026',
        salaryOffered: 850000,
        designation: 'Associate Full Stack Software Engineer',
        workLocation: 'Bangalore Technology Campus (Hybrid)',
        reportingManager: 'Mr. Rohan Mehta, VP of Engineering',
        probationMonths: 3,
        benefitsSummary: [
          'Annual Cost to Company (CTC): ₹8,50,000 per annum',
          'Fixed Component: ₹7,25,000 + Performance Incentive: ₹1,25,000',
          'Comprehensive Group Medical Health Insurance up to ₹5,00,000',
          'Company issued MacBook Pro 14" M3 Pro workstation'
        ],
        notes: 'We look forward to welcoming you to the NexaTech Systems family!'
      },
      mlMatchScore: 94,
      skillMatchBreakdown: {
        matchedSkills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Git'],
        missingSkills: [],
        matchPercentage: 100
      },
      appliedAt: '2026-09-02T10:15:00.000Z',
      updatedAt: '2026-09-12T15:30:00.000Z'
    },
    {
      _id: 'app_2',
      applicationId: 'APP-2026-8942',
      jobId: 'job_apexcloud_frontend',
      jobTitle: 'Frontend Engineer (React / Next.js / TypeScript)',
      companyId: 'comp_apexcloud',
      companyName: 'ApexCloud Labs',
      companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      seekerId: 'usr_seeker_1',
      seekerName: 'Aarav Sharma',
      seekerEmail: 'seeker@careermatch.io',
      seekerPhone: '+91 98765 43210',
      resumeUrl: 'https://careermatch.io/resumes/aarav_sharma_resume_2026.pdf',
      resumeName: 'Aarav_Sharma_Resume_CS_2026.pdf',
      coverLetter: 'I have hands-on experience building high performance dashboards in React 19, TypeScript, and Tailwind CSS. I would love to bring my front-end craft to ApexCloud.',
      educationSummary: 'B.Tech in CS, NITK (2022-2026)',
      cgpa: '8.85 / 10',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Performance Optimization'],
      experienceYears: 0.5,
      portfolioUrl: 'https://aaravsharma.dev',
      status: 'Interview',
      statusHistory: [
        { status: 'Applied', updatedAt: '2026-09-06T12:00:00.000Z' },
        { status: 'Under Review', updatedAt: '2026-09-07T10:00:00.000Z' },
        { status: 'Shortlisted', updatedAt: '2026-09-09T17:00:00.000Z' },
        { status: 'Interview', updatedAt: '2026-09-15T09:30:00.000Z', note: 'Technical deep-dive interview scheduled.' }
      ],
      interviewDetails: {
        scheduledDate: '2026-09-28',
        scheduledTime: '03:00 PM - 04:00 PM IST',
        meetingLink: 'https://zoom.us/j/9823482749',
        type: 'Frontend Architecture & State Machine Round',
        interviewers: 'Sneha Rao (Staff Frontend Engineer)',
        notes: 'Please keep an IDE ready for live component implementation.'
      },
      mlMatchScore: 88,
      skillMatchBreakdown: {
        matchedSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
        missingSkills: ['Jest'],
        matchPercentage: 80
      },
      appliedAt: '2026-09-06T12:00:00.000Z',
      updatedAt: '2026-09-15T09:30:00.000Z'
    },
    {
      _id: 'app_3',
      applicationId: 'APP-2026-8943',
      jobId: 'job_finstream_backend',
      jobTitle: 'Junior Backend Engineer (Node.js & PostgreSQL)',
      companyId: 'comp_finstream',
      companyName: 'FinStream Global',
      companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
      seekerId: 'usr_seeker_1',
      seekerName: 'Aarav Sharma',
      seekerEmail: 'seeker@careermatch.io',
      seekerPhone: '+91 98765 43210',
      resumeUrl: 'https://careermatch.io/resumes/aarav_sharma_resume_2026.pdf',
      resumeName: 'Aarav_Sharma_Resume_CS_2026.pdf',
      coverLetter: 'Excited about backend financial rails and robust database design.',
      educationSummary: 'B.Tech in CS, NITK (2022-2026)',
      cgpa: '8.85 / 10',
      skills: ['Node.js', 'PostgreSQL', 'Express', 'Docker', 'REST APIs'],
      experienceYears: 0.5,
      portfolioUrl: 'https://aaravsharma.dev',
      status: 'Shortlisted',
      statusHistory: [
        { status: 'Applied', updatedAt: '2026-09-13T10:00:00.000Z' },
        { status: 'Under Review', updatedAt: '2026-09-14T11:30:00.000Z' },
        { status: 'Shortlisted', updatedAt: '2026-09-18T16:00:00.000Z', note: 'Resume shortlisted for upcoming batch interviews.' }
      ],
      mlMatchScore: 85,
      skillMatchBreakdown: {
        matchedSkills: ['Node.js', 'PostgreSQL', 'Express', 'Docker', 'REST APIs'],
        missingSkills: ['Redis'],
        matchPercentage: 83
      },
      appliedAt: '2026-09-13T10:00:00.000Z',
      updatedAt: '2026-09-18T16:00:00.000Z'
    },
    {
      _id: 'app_4',
      applicationId: 'APP-2026-8944',
      jobId: 'job_datapulse_ml_intern',
      jobTitle: 'AI / Machine Learning Engineer Intern',
      companyId: 'comp_datapulse',
      companyName: 'DataPulse AI',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
      seekerId: 'usr_seeker_1',
      seekerName: 'Aarav Sharma',
      seekerEmail: 'seeker@careermatch.io',
      seekerPhone: '+91 98765 43210',
      resumeUrl: 'https://careermatch.io/resumes/aarav_sharma_resume_2026.pdf',
      resumeName: 'Aarav_Sharma_Resume_CS_2026.pdf',
      educationSummary: 'B.Tech in CS, NITK (2022-2026)',
      cgpa: '8.85 / 10',
      skills: ['Python', 'Docker', 'FastAPI'],
      experienceYears: 0.5,
      status: 'Under Review',
      statusHistory: [
        { status: 'Applied', updatedAt: '2026-09-14T09:00:00.000Z' },
        { status: 'Under Review', updatedAt: '2026-09-16T15:00:00.000Z', note: 'Application in queue for research panel assessment.' }
      ],
      mlMatchScore: 68,
      skillMatchBreakdown: {
        matchedSkills: ['Python', 'Docker', 'FastAPI'],
        missingSkills: ['Machine Learning', 'PyTorch', 'Pandas'],
        matchPercentage: 50
      },
      appliedAt: '2026-09-14T09:00:00.000Z',
      updatedAt: '2026-09-16T15:00:00.000Z'
    }
  ];

  const notifications: Notification[] = [
    {
      _id: 'notif_1',
      userId: 'usr_seeker_1',
      title: 'Congratulations! Official Appointment Letter Issued',
      message: 'NexaTech Systems has selected you for Associate Full Stack Software Engineer! Your appointment letter is ready for review and download.',
      type: 'selection',
      link: '/applications/app_1',
      read: false,
      createdAt: '2026-09-12T15:30:00.000Z'
    },
    {
      _id: 'notif_2',
      userId: 'usr_seeker_1',
      title: 'Interview Scheduled: ApexCloud Labs',
      message: 'Your Frontend Architecture round with Sneha Rao is scheduled for Sep 28, 2026 at 3:00 PM IST.',
      type: 'interview',
      link: '/applications/app_2',
      read: false,
      createdAt: '2026-09-15T09:30:00.000Z'
    },
    {
      _id: 'notif_3',
      userId: 'usr_recruiter_1',
      title: 'New High-Match Applicant: Aarav Sharma',
      message: 'A candidate with a 94% ML compatibility score applied for Full Stack Software Engineer.',
      type: 'application',
      link: '/recruiter/applications',
      read: true,
      createdAt: '2026-09-02T10:16:00.000Z'
    }
  ];

  const savedJobs: SavedJob[] = [
    {
      _id: 'save_1',
      userId: 'usr_seeker_1',
      jobId: 'job_nexatech_fullstack',
      savedAt: '2026-09-01T15:00:00.000Z'
    },
    {
      _id: 'save_2',
      userId: 'usr_seeker_1',
      jobId: 'job_apexcloud_frontend',
      savedAt: '2026-09-05T18:00:00.000Z'
    }
  ];

  const reports: SystemReport[] = [
    {
      _id: 'rep_1',
      type: 'platform_audit',
      title: 'Monthly Job Seeker Placement Rate Audit',
      description: 'Platform verification audit completed: 98.4% company authenticity index and 124 active recruiters verified.',
      reportedBy: 'system',
      status: 'resolved',
      createdAt: '2026-09-01T00:00:00.000Z'
    }
  ];

  return { users, companies, jobs, applications, notifications, savedJobs, reports };
}

// Load or initialize DB
export function initDB(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      dbMemory = JSON.parse(fileData);
      // Ensure all keys exist
      if (!dbMemory.users) dbMemory.users = [];
      if (!dbMemory.companies) dbMemory.companies = [];
      if (!dbMemory.jobs) dbMemory.jobs = [];
      if (!dbMemory.applications) dbMemory.applications = [];
      if (!dbMemory.notifications) dbMemory.notifications = [];
      if (!dbMemory.savedJobs) dbMemory.savedJobs = [];
      if (!dbMemory.reports) dbMemory.reports = [];
      console.log('Database loaded successfully from', DB_FILE);
    } else {
      console.log('Seeding initial CareerMatch database...');
      dbMemory = getInitialSeedData();
      persistDB();
    }
  } catch (err) {
    console.error('Error loading database, resetting with seed data:', err);
    dbMemory = getInitialSeedData();
    persistDB();
  }
}

export function persistDB(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbMemory, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// Collection helpers with MongoDB-like API
export const db = {
  users: {
    find: (predicate?: (u: User) => boolean) => predicate ? dbMemory.users.filter(predicate) : [...dbMemory.users],
    findOne: (predicate: (u: User) => boolean) => dbMemory.users.find(predicate) || null,
    insertOne: (user: User) => {
      dbMemory.users.push(user);
      persistDB();
      return user;
    },
    updateOne: (predicate: (u: User) => boolean, update: Partial<User>) => {
      const index = dbMemory.users.findIndex(predicate);
      if (index !== -1) {
        dbMemory.users[index] = { ...dbMemory.users[index], ...update };
        persistDB();
        return dbMemory.users[index];
      }
      return null;
    },
    deleteOne: (predicate: (u: User) => boolean) => {
      const initialLength = dbMemory.users.length;
      dbMemory.users = dbMemory.users.filter(u => !predicate(u));
      const deleted = dbMemory.users.length < initialLength;
      if (deleted) persistDB();
      return deleted;
    },
    countDocuments: (predicate?: (u: User) => boolean) => predicate ? dbMemory.users.filter(predicate).length : dbMemory.users.length
  },

  companies: {
    find: (predicate?: (c: Company) => boolean) => predicate ? dbMemory.companies.filter(predicate) : [...dbMemory.companies],
    findOne: (predicate: (c: Company) => boolean) => dbMemory.companies.find(predicate) || null,
    insertOne: (company: Company) => {
      dbMemory.companies.push(company);
      persistDB();
      return company;
    },
    updateOne: (predicate: (c: Company) => boolean, update: Partial<Company>) => {
      const index = dbMemory.companies.findIndex(predicate);
      if (index !== -1) {
        dbMemory.companies[index] = { ...dbMemory.companies[index], ...update };
        persistDB();
        return dbMemory.companies[index];
      }
      return null;
    },
    deleteOne: (predicate: (c: Company) => boolean) => {
      const initial = dbMemory.companies.length;
      dbMemory.companies = dbMemory.companies.filter(c => !predicate(c));
      const deleted = dbMemory.companies.length < initial;
      if (deleted) persistDB();
      return deleted;
    },
    countDocuments: (predicate?: (c: Company) => boolean) => predicate ? dbMemory.companies.filter(predicate).length : dbMemory.companies.length
  },

  jobs: {
    find: (predicate?: (j: Job) => boolean) => predicate ? dbMemory.jobs.filter(predicate) : [...dbMemory.jobs],
    findOne: (predicate: (j: Job) => boolean) => dbMemory.jobs.find(predicate) || null,
    insertOne: (job: Job) => {
      dbMemory.jobs.push(job);
      persistDB();
      return job;
    },
    updateOne: (predicate: (j: Job) => boolean, update: Partial<Job>) => {
      const index = dbMemory.jobs.findIndex(predicate);
      if (index !== -1) {
        dbMemory.jobs[index] = { ...dbMemory.jobs[index], ...update };
        persistDB();
        return dbMemory.jobs[index];
      }
      return null;
    },
    deleteOne: (predicate: (j: Job) => boolean) => {
      const initial = dbMemory.jobs.length;
      dbMemory.jobs = dbMemory.jobs.filter(j => !predicate(j));
      const deleted = dbMemory.jobs.length < initial;
      if (deleted) persistDB();
      return deleted;
    },
    countDocuments: (predicate?: (j: Job) => boolean) => predicate ? dbMemory.jobs.filter(predicate).length : dbMemory.jobs.length
  },

  applications: {
    find: (predicate?: (a: Application) => boolean) => predicate ? dbMemory.applications.filter(predicate) : [...dbMemory.applications],
    findOne: (predicate: (a: Application) => boolean) => dbMemory.applications.find(predicate) || null,
    insertOne: (application: Application) => {
      dbMemory.applications.push(application);
      persistDB();
      return application;
    },
    updateOne: (predicate: (a: Application) => boolean, update: Partial<Application>) => {
      const index = dbMemory.applications.findIndex(predicate);
      if (index !== -1) {
        dbMemory.applications[index] = { ...dbMemory.applications[index], ...update };
        persistDB();
        return dbMemory.applications[index];
      }
      return null;
    },
    deleteOne: (predicate: (a: Application) => boolean) => {
      const initial = dbMemory.applications.length;
      dbMemory.applications = dbMemory.applications.filter(a => !predicate(a));
      const deleted = dbMemory.applications.length < initial;
      if (deleted) persistDB();
      return deleted;
    },
    countDocuments: (predicate?: (a: Application) => boolean) => predicate ? dbMemory.applications.filter(predicate).length : dbMemory.applications.length
  },

  notifications: {
    find: (predicate?: (n: Notification) => boolean) => predicate ? dbMemory.notifications.filter(predicate) : [...dbMemory.notifications],
    insertOne: (notif: Notification) => {
      dbMemory.notifications.unshift(notif);
      persistDB();
      return notif;
    },
    updateMany: (predicate: (n: Notification) => boolean, update: Partial<Notification>) => {
      let count = 0;
      dbMemory.notifications = dbMemory.notifications.map(n => {
        if (predicate(n)) {
          count++;
          return { ...n, ...update };
        }
        return n;
      });
      if (count > 0) persistDB();
      return count;
    }
  },

  savedJobs: {
    find: (predicate?: (s: SavedJob) => boolean) => predicate ? dbMemory.savedJobs.filter(predicate) : [...dbMemory.savedJobs],
    findOne: (predicate: (s: SavedJob) => boolean) => dbMemory.savedJobs.find(predicate) || null,
    insertOne: (s: SavedJob) => {
      dbMemory.savedJobs.push(s);
      persistDB();
      return s;
    },
    deleteOne: (predicate: (s: SavedJob) => boolean) => {
      const initial = dbMemory.savedJobs.length;
      dbMemory.savedJobs = dbMemory.savedJobs.filter(s => !predicate(s));
      const deleted = dbMemory.savedJobs.length < initial;
      if (deleted) persistDB();
      return deleted;
    }
  },

  reports: {
    find: (predicate?: (r: SystemReport) => boolean) => predicate ? dbMemory.reports.filter(predicate) : [...dbMemory.reports],
    insertOne: (r: SystemReport) => {
      dbMemory.reports.unshift(r);
      persistDB();
      return r;
    },
    updateOne: (predicate: (r: SystemReport) => boolean, update: Partial<SystemReport>) => {
      const index = dbMemory.reports.findIndex(predicate);
      if (index !== -1) {
        dbMemory.reports[index] = { ...dbMemory.reports[index], ...update };
        persistDB();
        return dbMemory.reports[index];
      }
      return null;
    }
  }
};
