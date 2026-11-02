import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { DateRangePreset } from '../../types/reports';

interface ReportDateRangeProps {
  selected: DateRangePreset;
  onChange: (range: DateRangePreset) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomChange?: (start: string, end: string) => void;
}

const formatDayDisplay = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const getDynamicPresets = (customStart?: string, customEnd?: string) => {
  const now = new Date();

  // Today
  const todayStr = formatDayDisplay(now);

  // This Week (Monday to Sunday)
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const thisWeekStr = `${formatDayDisplay(monday)} – ${formatDayDisplay(sunday)}`;

  // This Month (01 to end of month)
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const thisMonthStr = `${formatDayDisplay(firstOfMonth)} – ${formatDayDisplay(lastOfMonth)}`;

  // Last Month
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthStr = `${formatDayDisplay(firstOfLastMonth)} – ${formatDayDisplay(lastOfLastMonth)}`;

  // This Quarter
  const qMonth = Math.floor(now.getMonth() / 3) * 3;
  const firstOfQuarter = new Date(now.getFullYear(), qMonth, 1);
  const lastOfQuarter = new Date(now.getFullYear(), qMonth + 3, 0);
  const quarterNum = Math.floor(now.getMonth() / 3) + 1;
  const quarterStr = `Q${quarterNum} (${firstOfQuarter.toLocaleString('en-US', { month: 'short' })} – ${lastOfQuarter.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()})`;

  // This Year
  const thisYearStr = `01 Jan – 31 Dec ${now.getFullYear()}`;

  // Custom Range
  let customStr = 'Specific dates';
  if (customStart && customEnd) {
    try {
      const s = new Date(customStart);
      const e = new Date(customEnd);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        customStr = `${formatDayDisplay(s)} – ${formatDayDisplay(e)}`;
      }
    } catch {}
  }

  return [
    { id: 'Today' as DateRangePreset, label: 'Today', periodText: todayStr },
    { id: 'This Week' as DateRangePreset, label: 'This Week', periodText: thisWeekStr },
    { id: 'This Month' as DateRangePreset, label: 'This Month', periodText: thisMonthStr },
    { id: 'Last Month' as DateRangePreset, label: 'Last Month', periodText: lastMonthStr },
    { id: 'This Quarter' as DateRangePreset, label: 'This Quarter', periodText: quarterStr },
    { id: 'This Year' as DateRangePreset, label: 'This Year', periodText: thisYearStr },
    { id: 'All Time' as DateRangePreset, label: 'All Time', periodText: 'All Historical Records' },
    { id: 'Custom Range' as DateRangePreset, label: 'Custom Range', periodText: customStr },
  ];
};

export const ReportDateRange: React.FC<ReportDateRangeProps> = ({
  selected,
  onChange,
  customStartDate,
  customEndDate,
  onCustomChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const todayIso = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(customStartDate || '2026-09-01');
  const [endDate, setEndDate] = useState(customEndDate || todayIso);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customStartDate) setStartDate(customStartDate);
    if (customEndDate) setEndDate(customEndDate);
  }, [customStartDate, customEndDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const presets = getDynamicPresets(startDate, endDate);
  const currentPreset = presets.find((p) => p.id === selected) || presets[5]; // Default to This Year

  const handleApplyCustom = () => {
    if (onCustomChange) {
      onCustomChange(startDate, endDate);
    }
    onChange('Custom Range');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
      >
        <Calendar className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
        <span>Date: {currentPreset.label}</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal hidden md:inline">
          ({currentPreset.periodText})
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-72 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100 dark:divide-slate-700">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Select Reporting Window
          </div>
          <div className="py-1">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onChange(preset.id);
                  if (preset.id !== 'Custom Range') {
                    setIsOpen(false);
                  }
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  selected === preset.id
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div>
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{preset.periodText}</div>
                </div>
                {selected === preset.id && <Check className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />}
              </button>
            ))}
          </div>

          {selected === 'Custom Range' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 space-y-2">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Custom Date Range</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full mt-2 py-1.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
