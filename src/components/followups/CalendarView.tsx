import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  Calendar as CalendarIcon,
  User,
} from 'lucide-react';
import { FollowUpRecord } from '../../types/followUps';
import { FollowUpTypeBadge } from './FollowUpTypeBadge';
import { FollowUpPriorityBadge } from './FollowUpPriorityBadge';
import { FollowUpStatusBadge } from './FollowUpStatusBadge';

interface CalendarViewProps {
  followUps: FollowUpRecord[];
  onOpenDetails: (item: FollowUpRecord) => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  followUps,
  onOpenDetails,
  onOpenComplete,
  onOpenReschedule,
}) => {
  // Current focused month: September 2026
  const [selectedDate, setSelectedDate] = React.useState<string>('2026-09-07');

  // Month metadata for September 2026:
  // Sep 1, 2026 was a Tuesday. 30 days in September.
  const daysInMonth = 30;
  const startDayOfWeek = 2; // 0 = Sun, 1 = Mon, 2 = Tue

  // Map of date string YYYY-MM-DD to follow-ups
  const dateMap: { [date: string]: FollowUpRecord[] } = {};
  followUps.forEach((item) => {
    if (!dateMap[item.date]) {
      dateMap[item.date] = [];
    }
    dateMap[item.date].push(item);
  });

  const selectedDayItems = dateMap[selectedDate] || [];

  return (
    <div id="followup-calendar-container" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar Grid (2 cols on Desktop) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#5B4DB7] dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">September 2026</h3>
          </div>

          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700 dark:text-slate-300">Sep 2026</span>
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Month days grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {/* Empty cells before start of month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 bg-slate-50/50 dark:bg-slate-950/40 rounded-lg" />
          ))}

          {/* Actual days 1 to 30 */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `2026-09-${String(dayNum).padStart(2, '0')}`;
            const items = dateMap[dateStr] || [];
            const isToday = dateStr === '2026-09-07';
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`h-16 sm:h-20 p-1.5 rounded-lg text-left flex flex-col justify-between border transition-all ${
                  isSelected
                    ? 'border-[#5B4DB7] bg-purple-50/60 dark:bg-purple-950/50 ring-2 ring-[#5B4DB7]/30 shadow-xs'
                    : isToday
                    ? 'border-purple-300 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/30'
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold text-xs ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center font-bold'
                        : isSelected
                        ? 'text-[#5B4DB7] dark:text-purple-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {items.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </div>

                {/* Mini dots / badges preview */}
                <div className="space-y-0.5 overflow-hidden">
                  {items.slice(0, 2).map((it) => (
                    <div
                      key={it.id}
                      className="text-[9px] truncate px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {it.time} {it.companyName.split(' ')[0]}
                    </div>
                  ))}
                  {items.length > 2 && (
                    <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold block">
                      +{items.length - 2} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel (1 col on Desktop) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Schedule for {selectedDate}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selectedDayItems.length} follow-up{selectedDayItems.length !== 1 ? 's' : ''} on this date
            </span>
          </div>

          {selectedDate === '2026-09-07' && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300">
              Today
            </span>
          )}
        </div>

        {selectedDayItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No scheduled follow-ups</p>
            <p>Click on another date with numbered badges to inspect tasks.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {selectedDayItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-950/80 hover:border-[#5B4DB7]/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-bold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
                    {item.time}
                  </span>
                  <FollowUpTypeBadge type={item.type} />
                  <FollowUpPriorityBadge priority={item.priority} size="sm" />
                </div>

                <div>
                  <Link
                    to={`/leads/${item.leadId}`}
                    className="font-bold text-xs text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-400 flex items-center gap-1"
                  >
                    <span>{item.companyName}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </Link>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                    {item.purpose}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-1 truncate">
                    <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{item.contactName}</span>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenComplete(item)}
                      className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      title="Mark Complete"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenReschedule(item)}
                      className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                      title="Reschedule"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDetails(item)}
                      className="text-[11px] font-medium text-[#5B4DB7] dark:text-purple-400 hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
