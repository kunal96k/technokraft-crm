import React from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Calendar, Clock } from 'lucide-react';
import {
  FollowUpRecord,
  FollowUpOutcome,
  FollowUpType,
} from '../../types/followUps';

interface CompleteFollowUpModalProps {
  isOpen: boolean;
  followUp: FollowUpRecord | null;
  onClose: () => void;
  onComplete: (
    followUpId: string,
    outcome: FollowUpOutcome,
    completionNotes: string,
    nextFollowUp?: {
      type: FollowUpType;
      purpose: string;
      date: string;
      time: string;
      notes?: string;
    }
  ) => void;
}

export const CompleteFollowUpModal: React.FC<CompleteFollowUpModalProps> = ({
  isOpen,
  followUp,
  onClose,
  onComplete,
}) => {
  const [outcome, setOutcome] = React.useState<FollowUpOutcome>('Interested');
  const [notes, setNotes] = React.useState('');
  const [hasNextAction, setHasNextAction] = React.useState<boolean>(false);
  const [nextType, setNextType] = React.useState<FollowUpType>('Call');
  const [nextPurpose, setNextPurpose] = React.useState('');
  const [nextDate, setNextDate] = React.useState('2026-09-10');
  const [nextTime, setNextTime] = React.useState('02:00 PM');
  const [nextNotes, setNextNotes] = React.useState('');
  const [error, setError] = React.useState('');

  if (!isOpen || !followUp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) {
      setError('Please select an outcome.');
      return;
    }

    let nextFollowUpData;
    if (hasNextAction) {
      if (!nextPurpose.trim()) {
        setError('Please specify purpose for next follow-up.');
        return;
      }
      nextFollowUpData = {
        type: nextType,
        purpose: nextPurpose,
        date: nextDate,
        time: nextTime,
        notes: nextNotes,
      };
    }

    onComplete(followUp.id, outcome, notes, nextFollowUpData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        id="complete-followup-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Complete Follow-up
              </h3>
              <p className="text-xs text-slate-500">
                Log the client communication outcome and schedule the next milestone.
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

          {/* Lead Context Summary Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {followUp.companyName}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {followUp.leadCode}
              </span>
            </div>
            <div className="text-slate-600">
              <span>Contact: <strong>{followUp.contactName}</strong></span>
              {followUp.contactDesignation && (
                <span className="text-slate-400"> ({followUp.contactDesignation})</span>
              )}
            </div>
            <div className="text-slate-700 font-medium pt-1 border-t border-slate-200/60">
              Purpose: <span className="font-normal text-slate-600">{followUp.purpose}</span>
            </div>
          </div>

          {/* Outcome selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Communication Outcome *
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as FollowUpOutcome)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              required
            >
              <option value="Interested">Interested — Proceeding with discussion</option>
              <option value="Requirement Received">Requirement Received — RFP / Specs shared</option>
              <option value="Meeting Scheduled">Meeting Scheduled — Demo / Technical session set</option>
              <option value="Proposal Requested">Proposal Requested — Commercial quote required</option>
              <option value="Callback Required">Callback Required — Client asked to call later</option>
              <option value="No Response">No Response — Left voicemail / ping</option>
              <option value="Not Interested">Not Interested — Budget / timing mismatch</option>
              <option value="Other">Other outcome</option>
            </select>
          </div>

          {/* Completion Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Discussion Summary & Key Takeaways
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Spoke with Rahul; reviewed architectural diagram. Agreed on moving to POC demo..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Next Action Radio */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-semibold text-slate-700 mb-2">
              Next Scheduled Action
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="nextActionRadio"
                  checked={!hasNextAction}
                  onChange={() => setHasNextAction(false)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium">
                  No immediate next follow-up required
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="nextActionRadio"
                  checked={hasNextAction}
                  onChange={() => {
                    setHasNextAction(true);
                    if (!nextPurpose) {
                      setNextPurpose(`Follow up on: ${followUp.companyName}`);
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium">
                  Schedule next follow-up now
                </span>
              </label>
            </div>
          </div>

          {/* Expanded next action fields */}
          {hasNextAction && (
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/80 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B4DB7]">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Next Follow-up Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Follow-up Type
                  </label>
                  <select
                    value={nextType}
                    onChange={(e) => setNextType(e.target.value as FollowUpType)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Proposal Follow-up">Proposal Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Next Purpose *
                  </label>
                  <input
                    type="text"
                    value={nextPurpose}
                    onChange={(e) => setNextPurpose(e.target.value)}
                    placeholder="e.g. Present commercial quotation"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={nextTime}
                    onChange={(e) => setNextTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Complete Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
