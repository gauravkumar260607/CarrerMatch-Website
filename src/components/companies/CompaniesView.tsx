import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, MapPin, Users, Calendar, ExternalLink, ArrowRight, Briefcase } from 'lucide-react';
import { Company, Job } from '../../types';
import { api } from '../../services/api';

interface CompaniesViewProps {
  onSelectJob: (job: Job) => void;
  onNavigateToJobsWithCompany?: (companyName: string) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  onSelectJob,
  onNavigateToJobsWithCompany
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [loadingCompanyJobs, setLoadingCompanyJobs] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.getCompanies();
        setCompanies(res.companies || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleSelectCompany = async (company: Company) => {
    setSelectedCompany(company);
    setLoadingCompanyJobs(true);
    try {
      const res = await api.getCompanyById(company._id);
      setCompanyJobs(res.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompanyJobs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
            Employer Network
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Verified Partner Enterprises
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Top tech organizations hiring students, freshers, and experienced engineers through verified recruitment pipelines.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading enterprise directories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companies.map(c => (
            <div
              key={c._id}
              onClick={() => handleSelectCompany(c)}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Banner / Cover photo */}
                <div className="h-28 bg-slate-100 overflow-hidden relative">
                  {c.bannerImage ? (
                    <img
                      src={c.bannerImage}
                      alt={c.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-800 to-indigo-950" />
                  )}
                </div>

                {/* Company Logo & Basic info */}
                <div className="p-5 pt-0 relative">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden -mt-7 shadow-md flex items-center justify-center p-1.5 mb-3">
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt={c.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                      {c.name}
                    </h3>
                    {c.verified && (
                      <span title="Verified Employer">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">{c.tagline}</p>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.location}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {c.employeeCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  {c.openJobsCount || 2} Open Positions
                </span>
                <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  View Org <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Company Drawer / Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shadow-sm">
                  {selectedCompany.logo ? (
                    <img
                      src={selectedCompany.logo}
                      alt={selectedCompany.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
                    {selectedCompany.name}
                    {selectedCompany.verified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCompany.tagline}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                {selectedCompany.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Industry</span>
                  <span className="font-medium text-slate-800">{selectedCompany.industry}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Headquarters</span>
                  <span className="font-medium text-slate-800">{selectedCompany.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Company Website</span>
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Company Perks & Culture</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCompany.benefits.map((b, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-medium">
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Open Job Listings at this company */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Current Open Roles</h4>
                {loadingCompanyJobs ? (
                  <div className="p-4 text-center text-slate-400">Loading open roles...</div>
                ) : companyJobs.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic">No roles open currently.</div>
                ) : (
                  <div className="space-y-2">
                    {companyJobs.map(job => (
                      <div
                        key={job._id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-100/80 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{job.title}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            ₹{(job.minSalary / 100000).toFixed(1)} - {(job.maxSalary / 100000).toFixed(1)} LPA · {job.workMode}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCompany(null);
                            onSelectJob(job);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
                        >
                          View Job
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
