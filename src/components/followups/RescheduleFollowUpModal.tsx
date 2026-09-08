import React from 'react';
import { X, RotateCcw, AlertCircle, Calendar, Clock } from 'lucide-react';
import { FollowUpRecord } from '../../types/followUps';

interface RescheduleFollowUpModalProps {
  isOpen: boolean;
  followUp: FollowUpRecord | null;
  onClose: () => void;
  onReschedule: (
    followUpId: string,
    newDate: string,
    newTime: string,
    reason: string
  ) => void;
}

export const RescheduleFollowUpModal: React.FC<RescheduleFollowUpModalProps> = ({
  isOpen,
  followUp,
  onClose,
  onReschedule,
}) => {
  const [newDate, setNewDate] = React.useState('2026-09-09');
  const [newTime, setNewTime] = React.useState('11:00 AM');
  const [reason, setReason] = React.useState('Customer requested later date/time');
  const [customReason, setCustomReason] = React.useState('');
  const [error, setError] = React.useState('');

  if (!isOpen || !followUp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      setError('Please select a new date.');
      return;
    }
    const finalReason = reason === 'Other' ? customReason : reason;
    if (!finalReason.trim()) {
      setError('Please select or specify a reschedule reason.');
      return;
    }

    onReschedule(followUp.id, newDate, newTime, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        id="reschedule-followup-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-purple-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#5B4DB7] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reschedule Follow-up
              </h3>
              <p className="text-xs text-slate-500">
                Update date, time, and preserve audit reason trail.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current schedule banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {followUp.companyName}
              </span>
              <span className="font-mono text-slate-500 text-[10px]">
                {followUp.leadCode}
              </span>
            </div>
            <p className="text-slate-600 truncate">{followUp.purpose}</p>
            <div className="flex items-center gap-3 text-[11px] text-purple-700 font-medium pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Current: {followUp.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {followUp.time}
              </span>
            </div>
          </div>

          {/* New Date & Time Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Date *
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Time *
              </label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 11:30 AM"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>
          </div>

          {/* Reschedule Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reschedule Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
            >
              <option value="Customer requested later date/time">Customer requested later date/time</option>
              <option value="Customer was unavailable / out of office">Customer was unavailable / out of office</option>
              <option value="Internal technical team conflict">Internal technical team conflict</option>
              <option value="Awaiting procurement / board approval before call">Awaiting procurement / board approval before call</option>
              <option value="No response after multiple attempts">No response after multiple attempts</option>
              <option value="Other">Other custom reason</option>
            </select>
          </div>

          {reason === 'Other' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Specify Reason
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe reason..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4d3fa5] rounded-lg shadow-xs"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
