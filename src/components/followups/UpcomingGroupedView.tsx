import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  User,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { FollowUpRecord } from '../../types/followUps';
import { FollowUpTypeBadge } from './FollowUpTypeBadge';
import { FollowUpPriorityBadge } from './FollowUpPriorityBadge';
import { FollowUpStatusBadge } from './FollowUpStatusBadge';

import {
  getTodayIST_YYYYMMDD,
  getTomorrowIST_YYYYMMDD,
  formatISTDate,
  formatISTTime,
} from '../../utils/dateUtils';
import { FollowUpEmptyState } from './FollowUpEmptyState';

interface UpcomingGroupedViewProps {
  followUps: FollowUpRecord[];
  onOpenDetails: (item: FollowUpRecord) => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
  onAction?: () => void;
}

export const UpcomingGroupedView: React.FC<UpcomingGroupedViewProps> = ({
  followUps,
  onOpenDetails,
  onOpenComplete,
  onOpenReschedule,
  onAction,
}) => {
  if (followUps.length === 0) {
    return (
      <FollowUpEmptyState
        module="followups"
        tab="upcoming"
        onAction={onAction}
      />
    );
  }
  // Dynamic groupings: Tomorrow, This Week, Next Week & Beyond strictly in IST
  const todayISO = getTodayIST_YYYYMMDD();
  const tomorrowISO = getTomorrowIST_YYYYMMDD();

  const [tY, tM, tD] = todayISO.split('-').map(Number);
  const endOfWeekDate = new Date(tY, tM - 1, tD + 7);
  const endOfWeekISO = `${endOfWeekDate.getFullYear()}-${String(endOfWeekDate.getMonth() + 1).padStart(2, '0')}-${String(endOfWeekDate.getDate()).padStart(2, '0')}`;

  const tomorrowFormatted = formatISTDate(tomorrowISO, 'medium');

  const tomorrowItems = followUps.filter(
    (f) => f.date === tomorrowISO || f.date?.toLowerCase() === 'tomorrow'
  );
  const thisWeekItems = followUps.filter(
    (f) => f.date && f.date > tomorrowISO && f.date <= endOfWeekISO
  );
  const nextWeekItems = followUps.filter(
    (f) => f.date && (f.date > endOfWeekISO || (!f.date.includes('-') && f.date.toLowerCase() !== 'tomorrow'))
  );

  const groups = [
    {
      id: 'tomorrow',
      title: `Tomorrow — ${tomorrowFormatted}`,
      badge: `${tomorrowItems.length} follow-ups`,
      items: tomorrowItems,
    },
    {
      id: 'this-week',
      title: 'This Week (Next 7 Days)',
      badge: `${thisWeekItems.length} follow-ups`,
      items: thisWeekItems,
    },
    {
      id: 'next-week',
      title: 'Next Week & Beyond',
      badge: `${nextWeekItems.length} follow-ups`,
      items: nextWeekItems,
    },
  ];

  return (
    <div id="upcoming-grouped-container" className="space-y-6">
      {groups.map((group) => (
        <div key={group.id} className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {group.title}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {group.badge}
            </span>
          </div>

          {group.items.length === 0 ? (
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
              No follow-ups scheduled for this period.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:border-[#5B4DB7]/40 dark:hover:border-purple-500/40 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                          {formatISTTime(item.time)}
                        </span>
                        <FollowUpTypeBadge type={item.type} />
                      </div>
                      <FollowUpPriorityBadge priority={item.priority} size="sm" />
                    </div>

                    <div className="mt-2.5">
                      <Link
                        to={`/leads/${item.leadId}`}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-400 flex items-center gap-1"
                      >
                        <span>{item.companyName}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {item.leadCode}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                      {item.purpose}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="truncate">{item.contactName}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenComplete(item)}
                        className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="Mark complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenReschedule(item)}
                        className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded hover:bg-purple-50 dark:hover:bg-purple-950/40"
                        title="Reschedule"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenDetails(item)}
                        className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
