import React, { useState } from 'react';
import { X, CalendarClock, Plus } from 'lucide-react';
import { OpportunityRecord, OpportunityFollowUp } from '../../types/opportunities';

interface AddFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityRecord | null;
  onAddFollowUp: (id: string, followUp: OpportunityFollowUp) => void;
}

export const AddFollowUpModal: React.FC<AddFollowUpModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onAddFollowUp,
}) => {
  if (!isOpen || !opportunity) return null;

  const [date, setDate] = useState<string>('2026-09-10');
  const [time, setTime] = useState<string>('03:00 PM');
  const [type, setType] = useState<'Call' | 'Meeting' | 'Demo' | 'Email'>('Call');
  const [assignedTo, setAssignedTo] = useState<string>(opportunity.owner.name);
  const [notes, setNotes] = useState<string>('Follow up on commercial proposal and timeline.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFu: OpportunityFollowUp = {
      id: `fu-${Date.now()}`,
      date,
      time,
      type,
      assignedTo,
      status: 'Pending',
      notes,
    };
    onAddFollowUp(opportunity.id, newFu);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Follow-up</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Opportunity:</div>
            <div className="font-bold text-slate-800 dark:text-white">{opportunity.name} ({opportunity.companyName})</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Follow-up Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
              <input
                type="text"
                required
                placeholder="e.g. 03:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Action Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'Call' | 'Meeting' | 'Demo' | 'Email')}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none cursor-pointer"
              >
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Demo">Demo</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned To</label>
              <input
                type="text"
                required
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Agenda / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Follow-up</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
