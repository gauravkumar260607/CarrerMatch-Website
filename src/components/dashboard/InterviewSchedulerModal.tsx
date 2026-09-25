import React, { useState } from 'react';
import { X, Calendar, Video, Clock, User, AlertCircle } from 'lucide-react';
import { Application } from '../../types';
import { api } from '../../services/api';

interface InterviewSchedulerModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedApp: Application) => void;
}

export const InterviewSchedulerModal: React.FC<InterviewSchedulerModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !application) return null;

  const [date, setDate] = useState('2026-09-28');
  const [time, setTime] = useState('02:30 PM - 03:30 PM IST');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/nxt-eng-interview');
  const [interviewType, setInterviewType] = useState('Technical Architecture & Coding Round');
  const [interviewers, setInterviewers] = useState('Principal Architect & Engineering Lead');
  const [notes, setNotes] = useState('Please keep an IDE ready for live component implementation and system discussion.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.scheduleInterview(application._id, {
        scheduledDate: date,
        scheduledTime: time,
        meetingLink,
        type: interviewType,
        interviewers,
        notes
      });
      onSuccess(res.application);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
              Interview Scheduling
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Schedule Candidate Interview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidate: <strong>{application.seekerName}</strong> ({application.jobTitle})
            </p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Interview Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Time Window *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 11:00 AM - 12:00 PM IST"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Video Meeting Link (Google Meet / Zoom / Teams) *
            </label>
            <div className="relative">
              <Video className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Round Focus & Type
            </label>
            <input
              type="text"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              placeholder="e.g. Round 1: React & System Design"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Interviewers / Panel
            </label>
            <input
              type="text"
              value={interviewers}
              onChange={(e) => setInterviewers(e.target.value)}
              placeholder="Names and roles of the interview panel"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Instructions & Preparation Notes for Candidate
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
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {submitting ? 'Scheduling...' : 'Schedule & Notify Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
