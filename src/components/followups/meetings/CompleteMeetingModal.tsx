import React from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Calendar, Clock } from 'lucide-react';
import {
  MeetingRecord,
  MeetingOutcome,
  FollowUpType,
} from '../../../types/followUps';

interface CompleteMeetingModalProps {
  isOpen: boolean;
  meeting: MeetingRecord | null;
  onClose: () => void;
  onComplete: (
    meetingId: string,
    outcome: MeetingOutcome,
    outcomeNotes: string,
    nextFollowUp?: {
      type: FollowUpType;
      purpose: string;
      date: string;
      time: string;
      notes?: string;
    }
  ) => void;
}

export const CompleteMeetingModal: React.FC<CompleteMeetingModalProps> = ({
  isOpen,
  meeting,
  onClose,
  onComplete,
}) => {
  const [outcome, setOutcome] = React.useState<MeetingOutcome>('Positive');
  const [outcomeNotes, setOutcomeNotes] = React.useState('');
  const [createNextFollowUp, setCreateNextFollowUp] = React.useState(true);
  const [followUpType, setFollowUpType] = React.useState<FollowUpType>('Proposal Follow-up');
  const [followUpPurpose, setFollowUpPurpose] = React.useState('');
  const [followUpDate, setFollowUpDate] = React.useState('2026-09-10');
  const [followUpTime, setFollowUpTime] = React.useState('03:00 PM');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (meeting) {
      setFollowUpPurpose(`Follow up with ${meeting.contactName} on meeting deliverables`);
    }
  }, [meeting]);

  if (!isOpen || !meeting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) {
      setError('Please select meeting outcome.');
      return;
    }

    let nextFollowUp;
    if (createNextFollowUp) {
      if (!followUpPurpose.trim()) {
        setError('Please enter purpose for the next follow-up.');
        return;
      }
      nextFollowUp = {
        type: followUpType,
        purpose: followUpPurpose,
        date: followUpDate,
        time: followUpTime,
        notes: `Scheduled following meeting: "${meeting.title}"`,
      };
    }

    onComplete(meeting.id, outcome, outcomeNotes, nextFollowUp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        id="complete-meeting-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Log Meeting Outcome & Minutes
              </h3>
              <p className="text-xs text-slate-500">
                Record decisions, client feedback, and automatically schedule the next pipeline step.
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

          {/* Meeting Context */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {meeting.title}
              </span>
              <span className="font-mono text-slate-500 text-[10px]">
                {meeting.leadCode}
              </span>
            </div>
            <div className="text-slate-600">
              <span>{meeting.companyName} • </span>
              <span>Host: <strong>{meeting.assignedEmployee}</strong></span>
            </div>
          </div>

          {/* Outcome Dropdown */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Meeting Outcome *
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as MeetingOutcome)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              required
            >
              <option value="Positive">Positive — High interest in TechnoKraft offering</option>
              <option value="Requirement Received">Requirement Received — RFP / Specs shared</option>
              <option value="Proposal Requested">Proposal Requested — Commercial quote required</option>
              <option value="Need More Discussion">Need More Discussion — Another technical sync needed</option>
              <option value="Follow-up Required">Follow-up Required — Next checkpoint agreed</option>
              <option value="Not Interested">Not Interested — Out of budget or timing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Minutes / Outcome Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Meeting Minutes & Key Decisions
            </label>
            <textarea
              rows={3}
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              placeholder="e.g. Discussed micro-frontend timeline. Client confirmed budget allocated for Q3..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Next Action Box */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 mb-2">
              <input
                type="checkbox"
                checked={createNextFollowUp}
                onChange={(e) => setCreateNextFollowUp(e.target.checked)}
                className="w-4 h-4 rounded text-[#5B4DB7] focus:ring-[#5B4DB7]/40 border-slate-300"
              />
              <span>Create follow-up task automatically from this meeting</span>
            </label>

            {createNextFollowUp && (
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/80 space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Follow-up Type
                    </label>
                    <select
                      value={followUpType}
                      onChange={(e) => setFollowUpType(e.target.value as FollowUpType)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="Proposal Follow-up">Proposal Follow-up</option>
                      <option value="Call">Call</option>
                      <option value="Meeting">Next Meeting</option>
                      <option value="Email">Email</option>
                      <option value="Requirement Follow-up">Requirement Follow-up</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Purpose *
                    </label>
                    <input
                      type="text"
                      value={followUpPurpose}
                      onChange={(e) => setFollowUpPurpose(e.target.value)}
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
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

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
              Complete Meeting & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
