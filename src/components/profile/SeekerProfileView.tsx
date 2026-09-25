import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Briefcase, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { SeekerProfile, EducationEntry, ExperienceEntry, ProjectEntry, InternshipEntry } from '../../types';

export const SeekerProfileView: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [title, setTitle] = useState(user?.profile?.title || 'Full Stack Software Engineer');
  const [location, setLocation] = useState(user?.profile?.location || 'Bangalore, India');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [cgpa, setCgpa] = useState(user?.profile?.cgpa || '8.85');
  const [preferredRole, setPreferredRole] = useState(user?.profile?.preferredRole || 'Full Stack Developer');
  const [preferredLocation, setPreferredLocation] = useState(user?.profile?.preferredLocation || 'Bangalore / Remote');
  const [expectedSalary, setExpectedSalary] = useState(String(user?.profile?.expectedSalary || 900000));
  const [resumeUrl, setResumeUrl] = useState(user?.profile?.resumeUrl || '');
  const [github, setGithub] = useState(user?.profile?.github || '');
  const [linkedin, setLinkedin] = useState(user?.profile?.linkedin || '');
  const [portfolio, setPortfolio] = useState(user?.profile?.portfolio || '');

  // Skills
  const [skills, setSkills] = useState<string[]>(user?.profile?.skills || [
    'React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Docker'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Education list
  const [educationList, setEducationList] = useState<EducationEntry[]>(
    user?.profile?.education || [
      {
        degree: 'Bachelor of Technology',
        institution: 'National Institute of Technology Karnataka (NITK)',
        field: 'Computer Science & Engineering',
        startYear: '2022',
        endYear: '2026',
        cgpa: '8.85 / 10'
      }
    ]
  );

  // Projects list
  const [projectsList, setProjectsList] = useState<ProjectEntry[]>(
    user?.profile?.projects || [
      {
        title: 'CareerMatch Platform',
        description: 'Intelligent full-stack recruitment portal with ML compatibility scoring and dynamic PDF appointment letters.',
        techStack: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
        link: 'https://github.com/aarav/careermatch'
      }
    ]
  );

  // Internships list
  const [internshipsList, setInternshipsList] = useState<InternshipEntry[]>(
    user?.profile?.internships || [
      {
        role: 'Full Stack Engineering Intern',
        company: 'CloudScale Systems',
        duration: 'May 2025 - July 2025 (3 Months)',
        learnings: 'Developed microservices in Express, optimized MongoDB indexes, and created responsive dashboard components.'
      }
    ]
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
      {
        degree: 'Master of Science',
        institution: 'Indian Institute of Technology (IIT)',
        field: 'Data Science & Artificial Intelligence',
        startYear: '2026',
        endYear: '2028',
        cgpa: '9.0 / 10'
      }
    ]);
  };

  const handleAddProject = () => {
    setProjectsList([
      ...projectsList,
      {
        title: 'Real-Time Collaborative Code Editor',
        description: 'WebRTC and WebSocket synchronized multi-cursor browser IDE for pair programming.',
        techStack: ['React', 'WebSockets', 'Tailwind CSS'],
        link: 'https://github.com/aarav/collab-editor'
      }
    ]);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await api.updateProfile({
        name,
        profile: {
          title,
          phone,
          location,
          bio,
          cgpa,
          skills,
          education: educationList,
          projects: projectsList,
          internships: internshipsList,
          preferredRole,
          preferredLocation,
          expectedSalary: parseInt(expectedSalary, 10) || 850000,
          resumeUrl,
          resumeName: `${name.replace(/\s+/g, '_')}_Resume_2026.pdf`,
          github,
          linkedin,
          portfolio
        }
      });

      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
            Academic & Professional Portfolio
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Candidate Profile & Resume Builder
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Recruiters use your verified CGPA, skills, projects, and internships for automated candidate ranking.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-center"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Changes...' : 'Save Profile'}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile saved successfully! Your ML compatibility scores across listings have been updated.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Basic Personal Details */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <User className="w-4 h-4 text-indigo-600" />
          Personal & Contact Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Professional Title / Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full Stack Developer | Final Year CS Student"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location / Current City</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Professional Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your academic background, passions, and engineering mindset..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. Education & CGPA */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Education Credentials & CGPA
          </h3>
          <button
            onClick={handleAddEducation}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Degree
          </button>
        </div>

        <div className="space-y-3">
          {educationList.map((edu, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs relative">
              {educationList.length > 1 && (
                <button
                  onClick={() => setEducationList(educationList.filter((_, i) => i !== idx))}
                  className="absolute right-3 top-3 text-slate-400 hover:text-rose-600"
                  title="Remove education"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Degree Title</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[idx].degree = e.target.value;
                      setEducationList(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">University / Institute</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[idx].institution = e.target.value;
                      setEducationList(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Field of Study / Major</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[idx].field = e.target.value;
                      setEducationList(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={edu.endYear}
                      onChange={(e) => {
                        const updated = [...educationList];
                        updated[idx].endYear = e.target.value;
                        setEducationList(updated);
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">CGPA / %</label>
                    <input
                      type="text"
                      value={edu.cgpa}
                      onChange={(e) => {
                        const updated = [...educationList];
                        updated[idx].cgpa = e.target.value;
                        setCgpa(e.target.value);
                        setEducationList(updated);
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-indigo-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Skills Inventory */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Code className="w-4 h-4 text-indigo-600" />
          Technical & Functional Skills Inventory
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a skill (e.g. Next.js, Redis, AWS, GraphQL) and press Enter..."
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleAddSkill}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-xs transition-colors"
            >
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-rose-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 4. Projects Showcase */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            Engineering Projects Portfolio
          </h3>
          <button
            onClick={handleAddProject}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Project
          </button>
        </div>

        <div className="space-y-3">
          {projectsList.map((project, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs relative">
              <button
                onClick={() => setProjectsList(projectsList.filter((_, i) => i !== idx))}
                className="absolute right-3 top-3 text-slate-400 hover:text-rose-600"
                title="Remove project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => {
                      const updated = [...projectsList];
                      updated[idx].title = e.target.value;
                      setProjectsList(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Live URL / GitHub Repository</label>
                  <input
                    type="url"
                    value={project.link || ''}
                    onChange={(e) => {
                      const updated = [...projectsList];
                      updated[idx].link = e.target.value;
                      setProjectsList(updated);
                    }}
                    placeholder="https://github.com/..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Project Description & Architecture</label>
                <textarea
                  rows={2}
                  value={project.description}
                  onChange={(e) => {
                    const updated = [...projectsList];
                    updated[idx].description = e.target.value;
                    setProjectsList(updated);
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Internships & Work Experience */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          Internships & Practical Experience
        </h3>

        <div className="space-y-3">
          {internshipsList.map((intern, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Internship Role</label>
                  <input
                    type="text"
                    value={intern.role}
                    onChange={(e) => {
                      const updated = [...internshipsList];
                      updated[idx].role = e.target.value;
                      setInternshipsList(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={intern.company}
                    onChange={(e) => {
                      const updated = [...internshipsList];
                      updated[idx].company = e.target.value;
                      setInternshipsList(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Duration Window</label>
                  <input
                    type="text"
                    value={intern.duration}
                    onChange={(e) => {
                      const updated = [...internshipsList];
                      updated[idx].duration = e.target.value;
                      setInternshipsList(updated);
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">Key Responsibilities & Deliverables</label>
                <textarea
                  rows={2}
                  value={intern.learnings}
                  onChange={(e) => {
                    const updated = [...internshipsList];
                    updated[idx].learnings = e.target.value;
                    setInternshipsList(updated);
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Career Preferences & Target CTC */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Career Preferences & Target CTC
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preferred Role</label>
            <input
              type="text"
              value={preferredRole}
              onChange={(e) => setPreferredRole(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preferred Location</label>
            <input
              type="text"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expected CTC (INR / yr)</label>
            <input
              type="number"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Resume link */}
        <div className="pt-2">
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Verified Resume Document Link (Google Drive / Cloudflare / Direct PDF)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
            />
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                Test Link <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-3">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};
