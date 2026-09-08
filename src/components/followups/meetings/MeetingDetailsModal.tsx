import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Phone,
  User,
  Building2,
  FileText,
} from 'lucide-react';
import { MeetingRecord } from '../../../types/followUps';

interface MeetingDetailsModalProps {
  isOpen: boolean;
  meeting: MeetingRecord | null;
  onClose: () => void;
  onOpenComplete: (meeting: MeetingRecord) => void;
  onCancelMeeting: (meetingId: string) => void;
}

export const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
  isOpen,
  meeting,
  onClose,
  onOpenComplete,
  onCancelMeeting,
}) => {
  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        id="meeting-details-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {meeting.leadCode}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
              {meeting.meetingType}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {meeting.title}
            </h3>
            <Link
              to={`/leads/${meeting.leadId}`}
              className="text-[#5B4DB7] dark:text-purple-400 font-semibold flex items-center gap-1 mt-0.5"
            >
              <span>{meeting.companyName}</span>
              <ExternalLink className="w-3 h-3 text-[#5B4DB7]/60 dark:text-purple-400" />
            </Link>
          </div>

          {/* Time & Location Banner */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Date & Time</span>
              <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                {meeting.date}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                {meeting.startTime} – {meeting.endTime}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Format & Location</span>
              <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 mt-0.5">
                {meeting.location === 'Online' ? (
                  <Video className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                )}
                {meeting.location}
              </span>
              {meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <span>Launch Google Meet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Description & Agenda */}
          {meeting.description && (
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Agenda & Discussion Topics
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {meeting.description}
              </p>
            </div>
          )}

          {/* Contact and Host details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                Customer Attendee
              </span>
              <div className="font-bold text-slate-900 dark:text-white">{meeting.contactName}</div>
              <div className="text-slate-500 dark:text-slate-400">{meeting.contactDesignation || 'Contact'}</div>
              {meeting.contactPhone && (
                <div className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{meeting.contactPhone}</div>
              )}
            </div>

            <div className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                TechnoKraft Host
              </span>
              <div className="font-bold text-slate-900 dark:text-white">{meeting.assignedEmployee}</div>
              <div className="text-slate-500 dark:text-slate-400">Account Executive / Lead Host</div>
            </div>
          </div>

          {/* Completed Minutes if available */}
          {meeting.status === 'Completed' && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-1 text-emerald-950 dark:text-emerald-300">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Outcome: {meeting.outcome}</span>
              </div>
              {meeting.outcomeNotes && (
                <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-1">
                  Minutes: "{meeting.outcomeNotes}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-2">
          {meeting.status !== 'Cancelled' && (
            <button
              type="button"
              onClick={() => {
                onCancelMeeting(meeting.id);
                onClose();
              }}
              className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Cancel Meeting
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {meeting.status !== 'Completed' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenComplete(meeting);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Complete & Log Minutes
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
