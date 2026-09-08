import React, { useState } from 'react';
import { X, CheckCircle2, Trophy, IndianRupee } from 'lucide-react';
import { OpportunityRecord } from '../../types/opportunities';
import { formatCurrencyINR } from '../../data/mockOpportunities';

interface MarkWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityRecord | null;
  onConfirmWon: (id: string, finalValue: number, closingDate: string, notes: string) => void;
}

export const MarkWonModal: React.FC<MarkWonModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onConfirmWon,
}) => {
  if (!isOpen || !opportunity) return null;

  const [finalValue, setFinalValue] = useState<string>(String(opportunity.estimatedValue));
  const [closingDate, setClosingDate] = useState<string>('2026-09-07');
  const [notes, setNotes] = useState<string>(
    'Client accepted commercial terms. Contract signed and advance invoice initiated.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = parseInt(finalValue.replace(/[^0-9]/g, ''), 10) || opportunity.estimatedValue;
    onConfirmWon(opportunity.id, numVal, closingDate, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">Mark Opportunity as Won?</h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Celebrate closure & transition to service delivery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 rounded-md cursor-pointer"
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
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Service:</span>
              <span className="text-slate-700 dark:text-slate-300">{opportunity.service}</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Final Closed Value (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="number"
                required
                value={finalValue}
                onChange={(e) => setFinalValue(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Estimated: {formatCurrencyINR(opportunity.estimatedValue)}
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Closing Date</label>
            <input
              type="date"
              required
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Closure Notes / Remarks</label>
            <textarea
              rows={3}
              placeholder="e.g. Approved scope, payment milestones agreed, key customer contact..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Mark Won</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
