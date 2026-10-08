import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, X, Sparkles } from 'lucide-react';

interface ScheduleEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSchedule: (dateStr: string, timeStr: string) => void;
}

const STORAGE_KEY = 'crm_last_scheduled_dispatch';

const formatDateToISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatTimeToHHMM = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getLatestDefaultDateTime = () => {
  const now = new Date();
  // Target 30 mins ahead rounded up to nearest 15 mins
  const target = new Date(now.getTime() + 30 * 60 * 1000);
  const minutes = target.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  target.setMinutes(roundedMinutes, 0, 0);

  // If evening after 18:30, default to tomorrow 10:00 AM
  if (now.getHours() >= 18 || (now.getHours() === 18 && now.getMinutes() > 0)) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return {
      date: formatDateToISO(tomorrow),
      time: '10:00',
    };
  }

  return {
    date: formatDateToISO(target),
    time: formatTimeToHHMM(target),
  };
};

export const ScheduleEmailModal: React.FC<ScheduleEmailModalProps> = ({
  isOpen,
  onClose,
  onConfirmSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateToISO(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>('16:30');
  const [isSavedRestored, setIsSavedRestored] = useState<boolean>(false);

  const todayStr = useMemo(() => formatDateToISO(new Date()), []);

  // Compute dynamic presets based on live date
  const presets = useMemo(() => {
    const now = new Date();
    const currentIso = formatDateToISO(now);

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowIso = formatDateToISO(tomorrow);

    // Next Monday calculation
    const nextMonday = new Date(now);
    const dayOfWeek = nextMonday.getDay();
    const daysUntilNextMonday = ((1 - dayOfWeek + 7) % 7) || 7;
    nextMonday.setDate(nextMonday.getDate() + daysUntilNextMonday);
    const nextMondayIso = formatDateToISO(nextMonday);

    const currentHour = now.getHours();
    const todayLabel = currentHour < 16 ? 'Today, 04:30 PM' : 'Today, in 1 Hour';
    const todayTime = currentHour < 16 ? '16:30' : formatTimeToHHMM(new Date(now.getTime() + 60 * 60 * 1000));

    return [
      { label: todayLabel, date: currentIso, time: todayTime },
      { label: 'Tomorrow, 10:00 AM', date: tomorrowIso, time: '10:00' },
      { label: 'Tomorrow, 02:30 PM', date: tomorrowIso, time: '14:30' },
      { label: 'Next Monday, 09:30 AM', date: nextMondayIso, time: '09:30' },
    ];
  }, []);

  // On modal open: restore last scheduled data or initialize with latest dynamic time
  useEffect(() => {
    if (!isOpen) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.date && parsed?.time && parsed.date >= todayStr) {
          setSelectedDate(parsed.date);
          setSelectedTime(parsed.time);
          setIsSavedRestored(true);
          return;
        }
      }
    } catch {}

    const defaults = getLatestDefaultDateTime();
    setSelectedDate(defaults.date);
    setSelectedTime(defaults.time);
    setIsSavedRestored(false);
  }, [isOpen, todayStr]);

  if (!isOpen) return null;

  const saveState = (date: string, time: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date, time }));
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveState(selectedDate, selectedTime);
    onConfirmSchedule(selectedDate, selectedTime);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Schedule Email Dispatch"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-400 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Email Delivery</h3>
                {isSavedRestored && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Last Used</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Pick a future dispatch timestamp for the lead</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Quick Suggestions
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Live dynamic presets</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const isSelected = selectedDate === p.date && selectedTime === p.time;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setSelectedDate(p.date);
                      setSelectedTime(p.time);
                      saveState(p.date, p.time);
                    }}
                    className={`px-3 py-2 text-xs font-medium text-left rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#5B4DB7] dark:border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 font-semibold shadow-2xs ring-1 ring-[#5B4DB7]/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Dispatch Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    saveState(e.target.value, selectedTime);
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 dark:focus:ring-purple-400/40 bg-white dark:bg-slate-850 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Dispatch Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  saveState(selectedDate, e.target.value);
                }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 dark:focus:ring-purple-400/40 bg-white dark:bg-slate-850 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 rounded-lg text-[11px] text-purple-900 dark:text-purple-300 flex items-start gap-2">
            <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#5B4DB7] dark:text-purple-400" />
            <span>
              The email will be placed into the outgoing scheduler queue and sent automatically at the chosen timestamp.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Schedule Email</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

