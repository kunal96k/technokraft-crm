import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Clock, ShieldCheck } from 'lucide-react';
import { INITIAL_AUDIT_LOGS } from '../../data/mockSettings';

export const AuditLogPreview: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-800/50">
            <History className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Configuration Audit History
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {INITIAL_AUDIT_LOGS.length} Revisions
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              System event audit trail tracking administrative updates & security changes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">{isExpanded ? 'Hide History' : 'View Audit Trail'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Recent Settings Changes
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" /> SOC2 Immutable Audit Protocol Ready
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {INITIAL_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {log.changedItem}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {log.module}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {log.details}
                  </p>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between text-[11px] text-slate-500 shrink-0">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    By: {log.actorName}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-2.5 h-2.5" />
                    {log.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
