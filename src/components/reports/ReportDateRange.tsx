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

const PRESETS: { id: DateRangePreset; label: string; periodText: string }[] = [
  { id: 'Today', label: 'Today', periodText: '07 Sep 2026' },
  { id: 'This Week', label: 'This Week', periodText: '01 Sep – 07 Sep 2026' },
  { id: 'This Month', label: 'This Month', periodText: '01 Sep – 30 Sep 2026' },
  { id: 'Last Month', label: 'Last Month', periodText: '01 Aug – 31 Aug 2026' },
  { id: 'This Quarter', label: 'This Quarter', periodText: 'Q3 (Jul – Sep 2026)' },
  { id: 'This Year', label: 'This Year', periodText: 'FY 2026–27' },
  { id: 'Custom Range', label: 'Custom Range', periodText: 'Specific dates' },
];

export const ReportDateRange: React.FC<ReportDateRangeProps> = ({
  selected,
  onChange,
  customStartDate = '2026-09-01',
  customEndDate = '2026-09-07',
  onCustomChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(customStartDate);
  const [endDate, setEndDate] = useState(customEndDate);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPreset = PRESETS.find((p) => p.id === selected) || PRESETS[2];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
      >
        <Calendar className="w-3.5 h-3.5 text-[#5B4DB7]" />
        <span>Date: {currentPreset.label}</span>
        <span className="text-[11px] text-slate-400 font-normal hidden md:inline">
          ({currentPreset.periodText})
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Select Reporting Window
          </div>
          <div className="py-1">
            {PRESETS.map((preset) => (
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
                    ? 'bg-purple-50 text-[#5B4DB7] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-[10px] text-slate-400">{preset.periodText}</div>
                </div>
                {selected === preset.id && <Check className="w-3.5 h-3.5 text-[#5B4DB7]" />}
              </button>
            ))}
          </div>

          {selected === 'Custom Range' && (
            <div className="p-3 bg-slate-50 space-y-2">
              <div className="text-[11px] font-semibold text-slate-700">Custom Date Range</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-medium mb-1">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-medium mb-1">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-800"
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
