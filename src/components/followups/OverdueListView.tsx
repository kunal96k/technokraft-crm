import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Phone,
  Mail,
  User,
  ShieldAlert,
} from 'lucide-react';
import { FollowUpRecord } from '../../types/followUps';
import { FollowUpTypeBadge } from './FollowUpTypeBadge';
import { FollowUpPriorityBadge } from './FollowUpPriorityBadge';
import { FollowUpStatusBadge } from './FollowUpStatusBadge';

interface OverdueListViewProps {
  followUps: FollowUpRecord[];
  onOpenDetails: (item: FollowUpRecord) => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
  onCancel: (id: string) => void;
}

export const OverdueListView: React.FC<OverdueListViewProps> = ({
  followUps,
  onOpenDetails,
  onOpenComplete,
  onOpenReschedule,
}) => {
  if (followUps.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-emerald-200 p-12 text-center bg-emerald-50/10">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          No Overdue Follow-ups!
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Great job! All scheduled communications and deliverables are on track.
        </p>
      </div>
    );
  }

  return (
    <div id="overdue-list-container" className="space-y-4">
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-red-50/90 border border-red-200 rounded-xl text-xs text-red-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-red-800 text-sm">
              OVERDUE FOLLOW-UPS ({followUps.length})
            </h4>
            <p className="text-red-700/80 text-xs">
              These client contacts missed their scheduled SLA window. Please complete or reschedule immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Cards List */}
      <div className="space-y-3">
        {followUps.map((item) => {
          const daysOverdueText =
            item.daysOverdue === 0
              ? 'Missed earlier today'
              : item.daysOverdue === 1
              ? '1 day overdue'
              : `${item.daysOverdue || 2} days overdue`;

          return (
            <div
              key={item.id}
              className="bg-white border-2 border-red-200/80 hover:border-red-400 rounded-xl p-4 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{daysOverdueText}</span>
                  </span>
                  <FollowUpTypeBadge type={item.type} />
                  <FollowUpPriorityBadge priority={item.priority} size="sm" />
                  <span className="text-xs text-slate-500 font-mono">
                    Scheduled: {item.date} at {item.time}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/leads/${item.leadId}`}
                      className="text-base font-bold text-slate-900 hover:text-[#5B4DB7] flex items-center gap-1"
                    >
                      <span>{item.companyName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <span className="font-mono text-xs text-slate-400">
                      {item.leadCode}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium mt-1">
                    {item.purpose}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.contactName}</span>
                    {item.contactDesignation && ` (${item.contactDesignation})`}
                  </span>
                  {item.contactPhone && (
                    <span className="font-mono text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{item.contactPhone}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span>Owner: <strong>{item.assignedTo}</strong></span>
                  </span>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex sm:flex-col md:flex-row items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => onOpenComplete(item)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenReschedule(item)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reschedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDetails(item)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                  title="View Details"
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
