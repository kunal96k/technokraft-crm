import React from 'react';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';

interface SettingsSaveBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onCancel?: () => void;
  onDiscard?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
}

export const SettingsSaveBar: React.FC<SettingsSaveBarProps> = ({
  hasChanges,
  onSave,
  onCancel,
  onDiscard,
  isSaving = false,
  saveLabel = 'Save Changes',
}) => {
  if (!hasChanges) {
    return null;
  }

  const handleCancelClick = onCancel || onDiscard || (() => {});

  return (
    <div
      className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 bg-amber-50/95 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 shadow-xl shadow-amber-500/10 backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in"
    >
      <div className="flex items-center gap-2 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-semibold text-amber-900 dark:text-amber-200">
          You have unsaved changes in this section.
        </span>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={handleCancelClick}
          disabled={isSaving}
          className="px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Discard Changes
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all flex items-center gap-1.5 shadow-xs bg-[#5B4DB7] hover:bg-[#4d3fa5] active:scale-[0.98] shadow-purple-500/20 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : saveLabel}
        </button>
      </div>
    </div>
  );
};

