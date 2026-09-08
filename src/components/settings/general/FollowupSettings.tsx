import React from 'react';
import { CalendarClock, Bell, CheckCircle2, RotateCw } from 'lucide-react';
import { FollowupConfigData } from '../../../types/settings';

interface FollowupSettingsProps {
  data: FollowupConfigData;
  onChange: (updated: FollowupConfigData) => void;
}

export const FollowupSettings: React.FC<FollowupSettingsProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Follow-up & Task Preferences
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Controls reminder thresholds, default status assignments, and recurring cadence automation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Default Reminder */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Advance Reminder
          </label>
          <div className="relative">
            <select
              value={data.defaultReminder}
              onChange={(e) =>
                onChange({
                  ...data,
                  defaultReminder: e.target.value as FollowupConfigData['defaultReminder'],
                })
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="15 minutes">15 minutes before</option>
              <option value="30 minutes">30 minutes before</option>
              <option value="1 hour">1 hour before</option>
              <option value="1 day">1 day before</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            System notification sound and email trigger dispatched prior to scheduled meeting or call.
          </p>
        </div>

        {/* Default Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Follow-up Status
          </label>
          <select
            value={data.defaultStatus}
            onChange={(e) =>
              onChange({
                ...data,
                defaultStatus: e.target.value as 'Pending' | 'Scheduled',
              })
            }
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="Pending">Pending (Requires rep initiation)</option>
            <option value="Scheduled">Scheduled (Confirmed with client)</option>
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Initial status badge applied when creating reminders from lead cards.
          </p>
        </div>
      </div>

      {/* Auto-create next follow-up toggle */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center shrink-0">
            <RotateCw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block">
              Auto-Prompt Next Follow-up on Completion
            </span>
            <span className="text-[11px] text-slate-500">
              When a sales executive marks a follow-up complete, automatically opens a dialog to schedule the next touchpoint.
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.autoCreateNextFollowUp}
            onChange={(e) =>
              onChange({ ...data, autoCreateNextFollowUp: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>
    </div>
  );
};
