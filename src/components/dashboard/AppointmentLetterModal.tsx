import React from 'react';
import { X, Download, Printer, Award, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Application, Company } from '../../types';
import { generateAppointmentLetterPDF } from '../../utils/pdfGenerator';

interface AppointmentLetterModalProps {
  application: Application | null;
  company?: Company;
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentLetterModal: React.FC<AppointmentLetterModalProps> = ({
  application,
  company,
  isOpen,
  onClose
}) => {
  if (!isOpen || !application) return null;

  const letter = application.appointmentLetter;
  const companyName = company?.name || application.companyName;
  const companyTagline = company?.tagline || 'Leading Enterprise Innovation';
  const companyLocation = company?.location || 'Bangalore, Karnataka, India';

  const handleDownload = () => {
    generateAppointmentLetterPDF(application, company);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Official Appointment & Selection Letter
              </h3>
              <p className="text-[11px] text-slate-500">
                Reference ID: {letter?.letterId || 'APPT-VERIFIED'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Print letter"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Print Document</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Official PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formatted Letter Document Canvas */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-slate-100/70 flex justify-center">
          <div 
            id="printable-appointment-letter"
            className="w-full max-w-2xl bg-white p-8 sm:p-12 shadow-md border border-slate-200 rounded-xl space-y-6 text-slate-800 text-xs sm:text-sm font-sans"
          >
            {/* Corporate Letterhead */}
            <div className="border-b border-slate-200 pb-5 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase">
                  {companyName}
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">{companyTagline}</p>
                <p className="text-xs text-slate-500">{companyLocation}</p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Authentic Offer
                </span>
                <p className="text-xs font-mono text-slate-500 mt-2 tabular-nums">
                  Ref: {letter?.letterId}
                </p>
                <p className="text-xs text-slate-500">
                  Date: {letter?.issuedDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Candidate Addressee */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Details</span>
              <p className="font-bold text-slate-900 text-base">{application.seekerName}</p>
              <p className="text-xs text-slate-600">Email: {application.seekerEmail}</p>
              <p className="text-xs text-slate-600">Contact: {application.seekerPhone}</p>
              <p className="text-xs text-slate-500 font-mono">Application Reference: {application.applicationId}</p>
            </div>

            {/* Letter Subject */}
            <div className="p-3 bg-slate-50 border-l-4 border-slate-900 rounded-r-lg">
              <p className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                SUBJECT: LETTER OF APPOINTMENT AND FORMAL OFFER OF EMPLOYMENT
              </p>
            </div>

            {/* Opening Text */}
            <div className="space-y-3 leading-relaxed text-slate-700">
              <p>
                Dear <strong>{application.seekerName}</strong>,
              </p>
              <p>
                On behalf of <strong>{companyName}</strong>, we are pleased to offer you the full-time regular position of <strong>{letter?.designation || application.jobTitle}</strong>. 
                Following your rigorous evaluation, interviews, and portfolio review, our leadership team was exceedingly impressed with your technical capabilities, academic pedigree, and passion for engineering excellence.
              </p>
            </div>

            {/* Key Terms of Employment Table/Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm border-b border-slate-200 pb-2">
                Summary of Employment Terms
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Designation</span>
                  <span className="font-semibold text-slate-900">{letter?.designation || application.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Cost to Company (CTC)</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm tabular-nums">
                    ₹{(letter?.salaryOffered || 850000).toLocaleString('en-IN')} per annum
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date of Joining</span>
                  <span className="font-semibold text-slate-900">{letter?.joiningDate || 'Immediate'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Probation Period</span>
                  <span className="font-semibold text-slate-900">{letter?.probationMonths || 3} Months</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Reporting Manager</span>
                  <span className="font-semibold text-slate-900">{letter?.reportingManager || 'Engineering Director'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Work Location</span>
                  <span className="font-semibold text-slate-900">{letter?.workLocation || 'Bangalore Campus / Hybrid'}</span>
                </div>
              </div>
            </div>

            {/* Benefits & Allowances */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Compensation & Benefits Package:</h4>
              <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                {(letter?.benefitsSummary || [
                  `Annual Gross Remuneration Package of ₹${(letter?.salaryOffered || 850000).toLocaleString('en-IN')} per annum`,
                  'Comprehensive Group Medical & Hospitalization Insurance for self and immediate dependents',
                  'High-Performance workstation, ergonomic equipment allowance, and home office stipend',
                  'Annual training and professional conference budget'
                ]).map((b, idx) => (
                  <li key={idx} className="leading-relaxed">{b}</li>
                ))}
              </ul>
            </div>

            {/* Notes & Acceptance instructions */}
            <p className="text-xs text-slate-600 leading-relaxed italic border-t border-slate-100 pt-4">
              "{letter?.notes || 'We are excited to have you join our team and make high-impact contributions to our core products!'}"
            </p>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please sign and return the duplicate copy of this appointment letter within seven (7) days of issuance to confirm your acceptance of the offer.
            </p>

            {/* Signatures & Execution */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
              <div>
                <p className="font-bold text-slate-900 uppercase">For {companyName}</p>
                <div className="h-12 border-b border-slate-300 mt-4 flex items-end pb-1 font-mono text-indigo-700 italic">
                  Priya Menon (HR Director)
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Authorized Talent & HR Officer</p>
              </div>

              <div>
                <p className="font-bold text-slate-900 uppercase">Candidate Acceptance</p>
                <div className="h-12 border-b border-slate-300 mt-4 flex items-end pb-1 font-mono text-slate-800">
                  {application.seekerName}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Signature & Acceptance Date</p>
              </div>
            </div>

            <div className="pt-4 text-center text-[10px] text-slate-400">
              Digitally certified appointment record issued via CareerMatch Intelligent Career Hub.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
