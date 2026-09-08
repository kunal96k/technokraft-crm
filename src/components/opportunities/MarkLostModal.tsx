import React, { useState } from 'react';
import { X, AlertCircle, XCircle } from 'lucide-react';
import { OpportunityRecord, LossReason } from '../../types/opportunities';

interface MarkLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityRecord | null;
  onConfirmLost: (id: string, reason: LossReason, notes: string) => void;
}

export const MarkLostModal: React.FC<MarkLostModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onConfirmLost,
}) => {
  if (!isOpen || !opportunity) return null;

  const [reason, setReason] = useState<LossReason>('Budget');
  const [notes, setNotes] = useState<string>('');

  const lossReasons: LossReason[] = [
    'Budget',
    'Competitor',
    'No Requirement',
    'Timing',
    'No Response',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmLost(opportunity.id, reason, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="px-5 py-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">Mark Opportunity as Lost</h3>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                Record loss reason for competitive pipeline analytics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Company:</span>
              <strong className="text-slate-900 dark:text-white">{opportunity.companyName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Opportunity:</span>
              <strong className="text-slate-900 dark:text-white text-right">{opportunity.name}</strong>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Primary Loss Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as LossReason)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
            >
              {lossReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Loss Analysis / Client Feedback
            </label>
            <textarea
              rows={3}
              placeholder="Why did the customer decline? Who was the winning competitor or what budget constraints occurred?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            Note: This deal will not be deleted. It will remain in historical audit logs and pipeline reporting.
          </p>

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
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark Opportunity Lost</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
