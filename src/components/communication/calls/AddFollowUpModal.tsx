import React, { useState } from 'react';
import { CallRecord } from '../../../types/calls';
import { X, CalendarPlus, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';

interface AddFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: CallRecord;
  onSuccess: (updatedCall: CallRecord) => void;
}

export const AddFollowUpModal: React.FC<AddFollowUpModalProps> = ({
  isOpen,
  onClose,
  call,
  onSuccess,
}) => {
  const [date, setDate] = useState('2026-09-09');
  const [time, setTime] = useState('11:00 AM');
  const [type, setType] = useState<'Call' | 'Email' | 'Meeting' | 'Demo' | 'Document'>('Email');
  const [assignedTo, setAssignedTo] = useState(call.employeeName || 'Kunal Patil');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCall: CallRecord = {
      ...call,
      nextAction: 'followup',
      nextFollowUp: {
        date,
        time,
        type,
        assignedTo,
      },
    };

    onSuccess(updatedCall);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between shrink-0 bg-purple-50/70 sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-200 text-[#5B4DB7] flex items-center justify-center">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Schedule Follow-up</h3>
              <p className="text-xs text-slate-500">Connect this call to an action item</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Lead / Target
            </span>
            <p className="font-bold text-slate-900">{call.companyName}</p>
            <p className="text-slate-600 text-[11px]">
              Contact: {call.contactName} ({call.contactDesignation})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="11:00 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as 'Call' | 'Email' | 'Meeting' | 'Demo' | 'Document')
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs min-h-[44px]"
              >
                <option value="Email">Email Follow-up</option>
                <option value="Call">Phone Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Demo">Technical Demo</option>
                <option value="Document">Send Proposal</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned To</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs min-h-[44px]"
              >
                <option value="Kunal Patil">Kunal Patil</option>
                <option value="Priya Shah">Priya Shah</option>
                <option value="Amit Mehta">Amit Mehta</option>
                <option value="Sneha Kulkarni">Sneha Kulkarni</option>
                <option value="Rohan Patil">Rohan Patil</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Action Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Send updated pricing sheet and follow up via phone..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-xl font-semibold shadow-md min-h-[44px] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Follow-up</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
