import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Briefcase, 
  ArrowRight, 
  Award,
  BookOpen,
  DollarSign,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Job, SkillGapAnalysis, SalaryEstimate } from '../../types';

interface MLIntelligenceHubProps {
  onOpenJobDetail: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

export const MLIntelligenceHub: React.FC<MLIntelligenceHubProps> = ({
  onOpenJobDetail,
  onApplyJob
}) => {
  const { user } = useAuth();

  // Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Skill Gap Analyzer state
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [customSkillsInput, setCustomSkillsInput] = useState(
    user?.profile?.skills?.join(', ') || 'React, TypeScript, Node.js, Express, MongoDB'
  );
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [analyzingGap, setAnalyzingGap] = useState(false);

  // Salary Predictor state
  const [salaryRole, setSalaryRole] = useState('Full Stack Developer');
  const [salaryExp, setSalaryExp] = useState('Fresher');
  const [salarySkillsCount, setSalarySkillsCount] = useState(6);
  const [salaryEstimate, setSalaryEstimate] = useState<SalaryEstimate | null>(null);
  const [predictingSalary, setPredictingSalary] = useState(false);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await api.getMLRecommendations();
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAnalyzeGap = async () => {
    setAnalyzingGap(true);
    try {
      const skillsArray = customSkillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const res = await api.analyzeSkillGap(skillsArray, targetRole);
      setSkillGapAnalysis(res.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingGap(false);
    }
  };

  const handlePredictSalary = async () => {
    setPredictingSalary(true);
    try {
      const res = await api.estimateSalary({
        role: salaryRole,
        experienceLevel: salaryExp,
        skillsCount: salarySkillsCount
      });
      setSalaryEstimate(res.estimate);
    } catch (err) {
      console.error(err);
    } finally {
      setPredictingSalary(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    handleAnalyzeGap();
    handlePredictSalary();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Career Matching Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Intelligent ML Career Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Multi-dimensional candidate scoring powered by skill ontology analysis, curriculum alignment, industry demand forecasting, and predictive market salary estimation.
          </p>
        </div>
      </div>

      {/* Grid of Sections: 1. Recommendations | 2. Skill Gap | 3. Salary Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Top AI Job Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  AI Candidate Compatibility Recommendations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by compatibility matching profile skills, CGPA, and career goals.
                </p>
              </div>

              <button
                onClick={fetchRecommendations}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Refresh
              </button>
            </div>

            {loadingRecs ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Computing multi-factor ML compatibility scores...
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active recommendations. Ensure skills are added to your profile!
              </div>
            ) : (
              <div className="space-y-3.5">
                {recommendations.map(({ job, matchScore, compatibilityTier, matchedSkills, missingSkills, strengths }) => (
                  <div
                    key={job._id}
                    className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 
                          onClick={() => onOpenJobDetail(job)}
                          className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition-colors"
                        >
                          {job.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {job.companyName} · {job.location} ({job.workMode})
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-xs text-indigo-700 bg-white border border-indigo-100 px-2 py-0.5 rounded shadow-sm">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          {matchScore}% Match
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                          {compatibilityTier}
                        </span>
                      </div>
                    </div>

                    {/* Matched vs Missing Skills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-emerald-800 block mb-1">
                          ✓ Matched Skills ({matchedSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {matchedSkills.map((s: string) => (
                            <span key={s} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-amber-800 block mb-1">
                          ⚠ Missing Skills ({missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {missingSkills.length > 0 ? (
                            missingSkills.map((s: string) => (
                              <span key={s} className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-600">None! Complete overlap.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                        ₹{(job.minSalary / 100000).toFixed(1)} - {(job.maxSalary / 100000).toFixed(1)} LPA
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenJobDetail(job)}
                          className="px-3 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onApplyJob(job)}
                          className="px-3.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
                        >
                          Quick Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skill Gap Analysis Deep-Dive */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Target Role Skill Gap Analyzer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate candidate readiness against industry benchmarks for specialized engineering profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Role Benchmark</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none"
                >
                  <option value="Full Stack Developer">Full Stack Developer (MERN/TypeScript)</option>
                  <option value="Frontend Engineer">Frontend Engineer (React/Tailwind/State)</option>
                  <option value="Backend Engineer">Backend Engineer (Node/Microservices/SQL)</option>
                  <option value="AI / ML Engineer">AI / ML Engineer (Python/PyTorch/LLMs)</option>
                  <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer (Docker/K8s/CI)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Candidate Active Skills</label>
                <input
                  type="text"
                  value={customSkillsInput}
                  onChange={(e) => setCustomSkillsInput(e.target.value)}
                  placeholder="React, TypeScript, Node.js..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <button
              onClick={handleAnalyzeGap}
              disabled={analyzingGap}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {analyzingGap ? 'Analyzing Gap...' : 'Run Gap Analysis'}
            </button>

            {skillGapAnalysis && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Role Match: <strong className="font-mono text-indigo-700 text-sm">{skillGapAnalysis.matchPercentage}%</strong>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {skillGapAnalysis.missingCount} Missing Competencies
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${skillGapAnalysis.matchPercentage}%` }}
                  />
                </div>

                {/* Skills tags breakdown */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 block uppercase">
                    Competency Status Grid:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {skillGapAnalysis.requiredSkills.map(s => (
                      <span
                        key={s.skill}
                        className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                          s.status === 'mastered'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {s.status === 'mastered' ? '✓' : '!'} {s.skill}
                        <span className="text-[9px] opacity-75 font-mono">({s.priority})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Projects & Certifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Recommended Upskilling Courses:
                    </h5>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {skillGapAnalysis.recommendedCertifications.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Suggested Portfolio Projects:
                    </h5>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {skillGapAnalysis.suggestedProjects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Predictive Market Salary Estimator */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Salary & CTC Predictor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Forecast expected market remuneration packages based on role demand and skills count.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Engineering Role</label>
                <select
                  value={salaryRole}
                  onChange={(e) => setSalaryRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={salaryExp}
                  onChange={(e) => setSalaryExp(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                >
                  <option value="Fresher">Fresher / Campus Graduate (0-1 yr)</option>
                  <option value="1-3 years">Junior Associate (1-3 years)</option>
                  <option value="3-5 years">Mid-Level Engineer (3-5 years)</option>
                  <option value="5+ years">Senior / Tech Lead (5+ years)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Verified Skill Breadth</span>
                  <span className="font-mono text-indigo-600">{salarySkillsCount} Core Skills</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  value={salarySkillsCount}
                  onChange={(e) => setSalarySkillsCount(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <button
                onClick={handlePredictSalary}
                disabled={predictingSalary}
                className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {predictingSalary ? 'Estimating...' : 'Calculate CTC Estimate'}
              </button>

              {salaryEstimate && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 pt-3">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Forecasted Median Market CTC
                    </span>
                    <div className="text-2xl font-black text-emerald-800 font-mono tabular-nums mt-1">
                      ₹{(salaryEstimate.median / 100000).toFixed(2)} LPA
                    </div>
                    <span className="text-[11px] text-emerald-700 font-mono">
                      (₹{salaryEstimate.median.toLocaleString('en-IN')} / year)
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">P25 Lower Range</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{(salaryEstimate.min / 100000).toFixed(1)} LPA
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">P75 Top Range</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{(salaryEstimate.max / 100000).toFixed(1)} LPA
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    "{salaryEstimate.insights}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
