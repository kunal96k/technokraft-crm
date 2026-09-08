import React from 'react';
import { AlertTriangle, ExternalLink, GitMerge, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DuplicateLeadAlertProps {
  existingLeadCode: string;
  existingCompanyName: string;
  existingEmail: string;
  onDismiss: () => void;
  onMergeLater?: () => void;
}

export const DuplicateLeadAlert: React.FC<DuplicateLeadAlertProps> = ({
  existingLeadCode,
  existingCompanyName,
  existingEmail,
  onDismiss,
  onMergeLater,
}) => {
  return (
    <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-2xs animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
              Possible Duplicate Lead Found
            </h4>
            <span className="font-mono text-[10px] font-semibold bg-amber-200/70 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded">
              Match 95%
            </span>
          </div>

          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
            A lead with similar details already exists in TechnoKraft CRM:
          </p>

          <div className="mt-2 p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-200/80 dark:border-amber-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">{existingCompanyName}</span>
              <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">{existingEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Existing Record:</span>
              <span className="font-mono font-bold text-[#5B4DB7] dark:text-purple-400">{existingLeadCode}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
            <Link
              to="/leads/lead-1"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300/80 dark:bg-amber-900/80 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 font-semibold text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Existing Lead</span>
            </Link>

            <button
              type="button"
              onClick={onMergeLater}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 font-medium text-xs transition-colors"
            >
              <GitMerge className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Merge Later</span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 font-medium text-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Continue Anyway</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
