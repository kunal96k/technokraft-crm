import React, { useState, useMemo } from 'react';
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
  Plus,
  CalendarCheck,
  Building2,
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

interface CalendarViewProps {
  followUps: FollowUpRecord[];
  onOpenDetails: (item: FollowUpRecord) => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
  onNewFollowUp?: (preselectedDate?: string) => void;
}

/**
 * Normalizes any date string (YYYY-MM-DD, DD MMM YYYY, Today, Tomorrow, ISO timestamp) into 'YYYY-MM-DD' strictly in IST
 */
function normalizeToISODate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) {
    return getTodayIST_YYYYMMDD();
  }
  const clean = dateStr.trim();
  const lower = clean.toLowerCase();

  if (lower === 'today') {
    return getTodayIST_YYYYMMDD();
  }
  if (lower === 'tomorrow') {
    return getTomorrowIST_YYYYMMDD();
  }
  if (lower === 'yesterday') {
    const today = getTodayIST_YYYYMMDD();
    const [y, m, d] = today.split('-').map(Number);
    const yest = new Date(y, m - 1, d - 1);
    return `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
  }

  // Check if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return clean.substring(0, 10);
  }

  // Try parsing dd MMM yyyy or similar date formats
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return getTodayIST_YYYYMMDD();
}

function formatDisplayDateHeading(isoDateStr: string): string {
  return formatISTDate(isoDateStr, 'long') || isoDateStr;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  followUps,
  onOpenDetails,
  onOpenComplete,
  onOpenReschedule,
  onNewFollowUp,
}) => {
  const todayISO = useMemo(() => getTodayIST_YYYYMMDD(), []);

  // Map of normalized YYYY-MM-DD to follow-up records
  const dateMap = useMemo(() => {
    const map: Record<string, FollowUpRecord[]> = {};
    followUps.forEach((item) => {
      const iso = normalizeToISODate(item.date);
      if (!map[iso]) {
        map[iso] = [];
      }
      map[iso].push(item);
    });
    return map;
  }, [followUps]);

  // Determine initial calendar month based on follow-ups or current date
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // If follow-ups exist, try focusing on the month of the first follow-up or today
    if (followUps.length > 0) {
      const firstIso = normalizeToISODate(followUps[0].date);
      const [y, m] = firstIso.split('-').map(Number);
      if (y && m) return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (followUps.length > 0) {
      return normalizeToISODate(followUps[0].date);
    }
    return new Date().toISOString().split('T')[0];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month metadata
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthShortName = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayISO);
  };

  const selectedDayItems = dateMap[selectedDate] || [];

  return (
    <div id="followup-calendar-container" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar Grid (2 cols on Desktop) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {monthName}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {followUps.length} follow-up{followUps.length !== 1 ? 's' : ''} recorded in total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <button
              type="button"
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-[#5B4DB7] dark:hover:text-purple-300 transition-colors cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700 dark:text-slate-300 text-xs select-none">
                {monthShortName}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-1.5 border-b border-slate-100 dark:border-slate-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="uppercase tracking-wider text-[11px] font-bold">
              {d}
            </div>
          ))}
        </div>

        {/* Month days grid */}
        <div className="grid grid-cols-7 gap-1.5 text-xs">
          {/* Empty cells before start of month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-16 sm:h-20 bg-slate-50/40 dark:bg-slate-950/30 rounded-lg border border-transparent"
            />
          ))}

          {/* Actual days in month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const items = dateMap[dateStr] || [];
            const isToday = dateStr === todayISO;
            const isSelected = dateStr === selectedDate;
            const hasUrgent = items.some((it) => it.priority === 'URGENT' || it.priority === 'HIGH');
            const isCompletedAll = items.length > 0 && items.every((it) => it.status === 'COMPLETED');

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`h-16 sm:h-20 p-1.5 rounded-xl text-left flex flex-col justify-between border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-[#5B4DB7] bg-purple-50/80 dark:bg-purple-950/60 ring-2 ring-[#5B4DB7]/40 shadow-xs'
                    : isToday
                    ? 'border-purple-300 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-950/30'
                    : items.length > 0
                    ? 'border-purple-200/60 dark:border-purple-900/40 bg-white dark:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xs'
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Day Number and Count Pill */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center font-bold text-[11px] shadow-xs'
                        : isSelected
                        ? 'text-[#5B4DB7] dark:text-purple-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {items.length > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isCompletedAll
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : hasUrgent
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                          : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {items.length}
                    </span>
                  )}
                </div>

                {/* Follow-up mini item chips */}
                <div className="space-y-0.5 overflow-hidden w-full">
                  {items.slice(0, 2).map((it) => (
                    <div
                      key={it.id}
                      className={`text-[9px] truncate px-1 py-0.5 rounded font-medium ${
                        it.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 line-through'
                          : it.priority === 'URGENT'
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                          : 'bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300'
                      }`}
                    >
                      {it.time ? it.time.split(' ')[0] : ''} {it.companyName || it.purpose}
                    </div>
                  ))}
                  {items.length > 2 && (
                    <span className="text-[9px] text-[#5B4DB7] dark:text-purple-400 font-bold block pl-0.5">
                      +{items.length - 2} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Schedule Inspector (1 col on Desktop) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Schedule for {formatDisplayDateHeading(selectedDate)}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedDayItems.length} follow-up{selectedDayItems.length !== 1 ? 's' : ''} on this date
              </span>
            </div>

            {selectedDate === todayISO && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300">
                Today
              </span>
            )}
          </div>

          {selectedDayItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                  No scheduled follow-ups
                </p>
                <p className="text-slate-400 dark:text-slate-500 mt-0.5">
                  Click on any highlighted calendar cell or schedule a new task.
                </p>
              </div>

              {onNewFollowUp && (
                <button
                  type="button"
                  onClick={() => onNewFollowUp(selectedDate)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4d3fa5] rounded-lg shadow-xs transition-colors cursor-pointer mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add for {selectedDate}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {selectedDayItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-950/90 hover:border-[#5B4DB7]/40 dark:hover:border-purple-600/40 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-[#5B4DB7] dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-200/70 dark:border-purple-900/60">
                      {formatISTTime(item.time)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <FollowUpTypeBadge type={item.type} />
                      <FollowUpPriorityBadge priority={item.priority} size="sm" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/leads/${item.leadId}`}
                        className="font-bold text-xs text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-400 flex items-center gap-1"
                      >
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{item.companyName}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </Link>
                      <FollowUpStatusBadge status={item.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                      {item.purpose}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {item.assignedAvatar || (item.assignedTo ? item.assignedTo.substring(0, 2).toUpperCase() : 'KP')}
                      </span>
                      <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                        {item.assignedTo || item.contactName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.status !== 'COMPLETED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenComplete(item)}
                            className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                            title="Mark Complete"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReschedule(item)}
                            className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition-colors cursor-pointer"
                            title="Reschedule"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenDetails(item)}
                        className="text-[11px] font-semibold text-[#5B4DB7] dark:text-purple-400 hover:underline px-1.5 py-0.5 rounded cursor-pointer"
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

        {/* Action button at bottom of panel */}
        {onNewFollowUp && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNewFollowUp(selectedDate)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Follow-up for {selectedDate}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
