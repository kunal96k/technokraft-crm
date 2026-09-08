import React, { useState } from 'react';
import { AlertOctagon, RotateCcw, AlertTriangle } from 'lucide-react';
import { ConfirmationDialog } from '../ConfirmationDialog';

interface DangerZoneProps {
  onResetToDefaults: () => void;
}

export const DangerZone: React.FC<DangerZoneProps> = ({ onResetToDefaults }) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  return (
    <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 p-5 space-y-4">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
          <AlertOctagon className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Administrative Danger Zone
          </h4>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-900 dark:text-white block">
              Reset CRM Configuration to Defaults
            </span>
            <p className="text-[11px] text-slate-500 max-w-lg">
              Reverts lead stages, email defaults, reminder intervals, and notification preferences back to TechnoKraft corporate baseline defaults. Historical lead records will be untouched.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfirmModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Defaults
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmModalOpen}
        title="Reset CRM Settings to System Defaults?"
        message="This action will restore standard stages, reminders, and company preferences. Current custom modifications in this browser session will be reverted."
        confirmText="Confirm Reset"
        variant="danger"
        onConfirm={() => {
          setConfirmModalOpen(false);
          onResetToDefaults();
        }}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
};
