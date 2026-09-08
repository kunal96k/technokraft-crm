import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  User,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Briefcase,
} from 'lucide-react';
import { FollowUpRecord } from '../../types/followUps';
import { FollowUpStatusBadge } from './FollowUpStatusBadge';
import { FollowUpPriorityBadge } from './FollowUpPriorityBadge';
import { FollowUpTypeBadge } from './FollowUpTypeBadge';

interface FollowUpDetailModalProps {
  isOpen: boolean;
  followUp: FollowUpRecord | null;
  onClose: () => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
  onCancel: (id: string) => void;
}

export const FollowUpDetailModal: React.FC<FollowUpDetailModalProps> = ({
  isOpen,
  followUp,
  onClose,
  onOpenComplete,
  onOpenReschedule,
  onCancel,
}) => {
  if (!isOpen || !followUp) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        id="followup-detail-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {followUp.leadCode}
            </span>
            <FollowUpTypeBadge type={followUp.type} />
            <FollowUpStatusBadge status={followUp.status} size="sm" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Company Title */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {followUp.companyName}
              </h3>
              <FollowUpPriorityBadge priority={followUp.priority} />
            </div>
            {followUp.service && (
              <p className="text-purple-700 font-medium text-xs mt-0.5">
                Service: {followUp.service}
              </p>
            )}
          </div>

          {/* Goal / Purpose */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Purpose & Objective
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {followUp.purpose}
            </p>
            {followUp.notes && (
              <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-200/60 mt-1">
                Notes: "{followUp.notes}"
              </p>
            )}
          </div>

          {/* Timing & Reminders */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-purple-50/40 rounded-xl border border-purple-100">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Scheduled Date</span>
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#5B4DB7]" />
                {followUp.date}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Scheduled Time</span>
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#5B4DB7]" />
                {followUp.time}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Reminder</span>
              <span className="font-medium text-slate-700 text-xs block mt-0.5">
                {followUp.reminder || 'None'}
              </span>
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Contact Information
            </span>
            <div className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="font-semibold block">{followUp.contactName}</span>
                  <span className="text-[11px] text-slate-400 block">
                    {followUp.contactDesignation || 'Primary Contact'}
                  </span>
                </div>
              </div>
              {followUp.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono text-xs">{followUp.contactPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Owner Details */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-[#5B4DB7] text-xs font-bold flex items-center justify-center">
                {followUp.assignedAvatar || followUp.assignedTo.substring(0, 2).toUpperCase()}
              </span>
              <div>
                <span className="font-bold text-slate-800 block">
                  {followUp.assignedTo}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {followUp.assignedRole || 'Sales Rep'}
                </span>
              </div>
            </div>
            <Link
              to={`/leads/${followUp.leadId}`}
              className="flex items-center gap-1 text-xs font-semibold text-[#5B4DB7] hover:underline"
            >
              <span>View Full Lead</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Past Outcome if completed */}
          {followUp.status === 'COMPLETED' && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Outcome: {followUp.outcome || 'Completed Successfully'}</span>
              </div>
              {followUp.completionNotes && (
                <p className="text-xs text-emerald-800/90 mt-1">
                  "{followUp.completionNotes}"
                </p>
              )}
            </div>
          )}

          {/* Reschedule trail if rescheduled */}
          {followUp.status === 'RESCHEDULED' && (
            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span>Rescheduled</span>
              </div>
              {followUp.rescheduleReason && (
                <p className="text-xs text-purple-800/90 mt-1">
                  Reason: "{followUp.rescheduleReason}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          {followUp.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={() => {
                onCancel(followUp.id);
                onClose();
              }}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Cancel Follow-up
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {followUp.status !== 'COMPLETED' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReschedule(followUp);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenComplete(followUp);
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Mark Complete
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
