import React, { useState } from 'react';
import { Clock, Calendar, X, CheckCircle2 } from 'lucide-react';

interface ScheduleEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSchedule: (dateStr: string, timeStr: string) => void;
}

export const ScheduleEmailModal: React.FC<ScheduleEmailModalProps> = ({
  isOpen,
  onClose,
  onConfirmSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-09-07');
  const [selectedTime, setSelectedTime] = useState('16:30');

  if (!isOpen) return null;

  const presets = [
    { label: 'Today, 04:30 PM', date: '2026-09-07', time: '16:30' },
    { label: 'Tomorrow, 10:00 AM', date: '2026-09-08', time: '10:00' },
    { label: 'Tomorrow, 02:30 PM', date: '2026-09-08', time: '14:30' },
    { label: 'Next Monday, 09:30 AM', date: '2026-09-14', time: '09:30' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSchedule(selectedDate, selectedTime);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Schedule Email Dispatch"
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Schedule Email Delivery</h3>
              <p className="text-[11px] text-slate-500">Pick a future dispatch timestamp for the lead</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Quick Suggestions
            </label>
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
                    }}
                    className={`px-3 py-2 text-xs font-medium text-left rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#5B4DB7] bg-purple-50 text-[#5B4DB7] font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dispatch Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dispatch Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 bg-white"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-lg text-[11px] text-amber-800 flex items-start gap-2">
            <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
            <span>
              The email will be placed into the outgoing scheduler queue and sent automatically at the chosen local time.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg shadow-xs transition-colors"
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
