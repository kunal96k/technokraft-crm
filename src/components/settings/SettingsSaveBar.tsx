import React from 'react';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';

interface SettingsSaveBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  saveLabel?: string;
}

export const SettingsSaveBar: React.FC<SettingsSaveBarProps> = ({
  hasChanges,
  onSave,
  onCancel,
  isSaving = false,
  saveLabel = 'Save Changes',
}) => {
  return (
    <div
      className={`sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
        hasChanges
          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60 shadow-lg shadow-amber-500/5 backdrop-blur-md'
          : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md'
      }`}
    >
      <div className="flex items-center gap-2 text-xs">
        {hasChanges ? (
          <>
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium text-amber-800 dark:text-amber-300">
              You have unsaved changes in this section.
            </span>
          </>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            All changes in this section are currently up to date.
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={!hasChanges || isSaving}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
            hasChanges
              ? 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className={`px-4 py-2 text-xs font-medium rounded-lg text-white transition-all flex items-center gap-1.5 shadow-xs ${
            hasChanges
              ? 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98] shadow-purple-500/20'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : saveLabel}
        </button>
      </div>
    </div>
  );
};
