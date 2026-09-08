import React from 'react';
import { MessageSquare, Mail, Phone, ShieldAlert, Check } from 'lucide-react';
import { CommunicationConfigData } from '../../../types/settings';

interface CommunicationSettingsProps {
  data: CommunicationConfigData;
  onChange: (updated: CommunicationConfigData) => void;
}

export const CommunicationSettings: React.FC<CommunicationSettingsProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Communication Preferences
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure lead engagement channels, default outbound senders, and automated activity logging.
        </p>
      </div>

      {/* Security note */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          OAuth tokens and WhatsApp Business Cloud API keys are managed securely server-side. Sensitive API secrets are never transmitted or displayed in this interface.
        </p>
      </div>

      {/* Channel Toggles */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Enabled Channels
        </h4>

        {/* Email */}
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Outbound Email Messaging
              </span>
              <span className="text-[11px] text-slate-500">
                Enables 1-click email dispatch from lead files, proposals, and follow-ups.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60">
            Always Active
          </span>
        </div>

        {/* WhatsApp */}
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                WhatsApp Business Integration
              </span>
              <span className="text-[11px] text-slate-500">
                Direct WhatsApp chats and pre-approved template outreach via API.
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.whatsappEnabled}
              onChange={(e) => onChange({ ...data, whatsappEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Calls / Telecalling */}
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Call Logging & Telephony Tracker
              </span>
              <span className="text-[11px] text-slate-500">
                Prompts rep to log call outcomes, durations, and next steps immediately upon dialing.
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.callLoggingEnabled}
              onChange={(e) => onChange({ ...data, callLoggingEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Default Sender Configuration */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Company Outbound Email Sender
          </label>
          <input
            type="email"
            value={data.defaultEmailSender}
            onChange={(e) => onChange({ ...data, defaultEmailSender: e.target.value })}
            className="w-full sm:w-80 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>
    </div>
  );
};
