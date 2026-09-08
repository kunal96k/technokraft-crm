import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  User,
  Sparkles,
} from 'lucide-react';
import { FollowUpRecord } from '../../types/followUps';
import { FollowUpTypeBadge } from './FollowUpTypeBadge';
import { FollowUpPriorityBadge } from './FollowUpPriorityBadge';
import { FollowUpStatusBadge } from './FollowUpStatusBadge';

interface TodayTimelineViewProps {
  followUps: FollowUpRecord[];
  onOpenDetails: (item: FollowUpRecord) => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
  onCancel: (id: string) => void;
}

export const TodayTimelineView: React.FC<TodayTimelineViewProps> = ({
  followUps,
  onOpenDetails,
  onOpenComplete,
  onOpenReschedule,
}) => {
  // Sort today's follow-ups chronologically
  const sorted = [...followUps].sort((a, b) => a.time.localeCompare(b.time));

  if (sorted.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          No Follow-ups for Today
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          You're all caught up for today. Check the Upcoming tab or schedule a new customer follow-up.
        </p>
      </div>
    );
  }

  return (
    <div id="today-timeline-container" className="space-y-4">
      <div className="flex items-center justify-between bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/80 rounded-xl p-3 text-xs text-purple-900 dark:text-purple-300">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
          <span className="font-semibold">Today's Schedule</span>
          <span className="text-purple-600 dark:text-purple-400">({sorted.length} scheduled items)</span>
        </div>
        <span className="font-medium text-slate-600 dark:text-slate-400">Monday, 07 September 2026</span>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-purple-200/80 dark:border-purple-900/60 space-y-4 ml-3 my-2">
        {sorted.map((item) => {
          const isDone = item.status === 'COMPLETED';

          return (
            <div key={item.id} className="relative group">
              {/* Timeline marker */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-xs transition-colors ${
                  isDone
                    ? 'bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900/50'
                    : item.status === 'IN_PROGRESS'
                    ? 'bg-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/50 animate-pulse'
                    : 'bg-[#5B4DB7] ring-2 ring-purple-200 dark:ring-purple-900/50'
                }`}
              />

              {/* Card content */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-[#5B4DB7]/50 dark:hover:border-purple-500/40 hover:shadow-xs transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800">
                      {item.time}
                    </span>
                    <FollowUpTypeBadge type={item.type} />
                    <FollowUpPriorityBadge priority={item.priority} size="sm" />
                    <FollowUpStatusBadge status={item.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {item.status !== 'COMPLETED' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenComplete(item)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenReschedule(item)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>Reschedule</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenDetails(item)}
                      className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Details
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/leads/${item.leadId}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-400 text-sm flex items-center gap-1"
                      >
                        <span>{item.companyName}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        {item.leadCode}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {item.purpose}
                    </p>

                    {item.notes && (
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-50/60 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.contactName}
                      </span>
                    </div>

                    {item.contactPhone && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{item.contactPhone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 text-[10px] font-bold flex items-center justify-center">
                        {item.assignedAvatar || item.assignedTo.substring(0, 2).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        Assigned: <strong className="text-slate-700 dark:text-slate-200">{item.assignedTo}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
