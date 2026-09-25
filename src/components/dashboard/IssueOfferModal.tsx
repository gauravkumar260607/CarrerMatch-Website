import React, { useState } from 'react';
import { X, Award, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Application } from '../../types';
import { api } from '../../services/api';

interface IssueOfferModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedApp: Application) => void;
}

export const IssueOfferModal: React.FC<IssueOfferModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !application) return null;

  const [designation, setDesignation] = useState(application.jobTitle);
  const [salaryOffered, setSalaryOffered] = useState('850000');
  const [joiningDate, setJoiningDate] = useState('October 1, 2026');
  const [reportingManager, setReportingManager] = useState('Mr. Rohan Mehta, VP of Engineering');
  const [workLocation, setWorkLocation] = useState('Bangalore Technology Campus (Hybrid)');
  const [probationMonths, setProbationMonths] = useState(3);
  const [notes, setNotes] = useState('We are delighted to extend this formal offer and welcome you to our core team!');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.issueAppointmentLetter(application._id, {
        designation,
        salaryOffered: parseInt(salaryOffered, 10),
        joiningDate,
        reportingManager,
        workLocation,
        probationMonths,
        notes,
        benefitsSummary: [
          `Annual Gross CTC: ₹${parseInt(salaryOffered, 10).toLocaleString('en-IN')}`,
          'Comprehensive Health, Hospitalization and Family Insurance Coverage up to ₹5,00,000',
          'Company provided high-performance engineering workstation & equipment',
          'Flexible Hybrid Work Schedule (2 days office, 3 days remote)'
        ]
      });

      onSuccess(res.application);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to issue appointment letter.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Issue Official Appointment Letter
              </h3>
              <p className="text-xs text-slate-500">
                Candidate: <strong>{application.seekerName}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Official Position Designation *
            </label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Annual CTC (INR) *
              </label>
              <input
                type="number"
                required
                value={salaryOffered}
                onChange={(e) => setSalaryOffered(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Reporting Date of Joining *
              </label>
              <input
                type="text"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                placeholder="e.g. October 1, 2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Reporting Manager
              </label>
              <input
                type="text"
                value={reportingManager}
                onChange={(e) => setReportingManager(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Probation Period (Months)
              </label>
              <input
                type="number"
                value={probationMonths}
                onChange={(e) => setProbationMonths(parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Primary Work Location
            </label>
            <input
              type="text"
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Welcome Message / Special Offer Note
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Generating Letter...' : 'Issue Appointment Letter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
