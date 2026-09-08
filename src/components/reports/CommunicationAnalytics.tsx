import React from 'react';
import { PhoneCall, Mail, MessageSquare, Video, CalendarCheck, CheckCircle } from 'lucide-react';
import { CommunicationStat } from '../../types/reports';

interface CommunicationAnalyticsProps {
  stats: CommunicationStat[];
}

export const CommunicationAnalytics: React.FC<CommunicationAnalyticsProps> = ({ stats }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Calls':
        return PhoneCall;
      case 'Emails':
        return Mail;
      case 'WhatsApp':
        return MessageSquare;
      case 'Meetings':
        return Video;
      default:
        return CalendarCheck;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'Calls':
        return { text: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'Emails':
        return { text: 'text-sky-600', bg: 'bg-sky-50' };
      case 'WhatsApp':
        return { text: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'Meetings':
        return { text: 'text-purple-600', bg: 'bg-purple-50' };
      default:
        return { text: 'text-amber-600', bg: 'bg-amber-50' };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
            <PhoneCall className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Communication & Touchpoint Engagement</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Multichannel outreach volume and positive recipient response rates</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Outreach Telemetry</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((item) => {
          const Icon = getIcon(item.type);
          const color = getColor(item.type);

          return (
            <div
              key={item.type}
              className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.type}</span>
                  <div
                    className={`w-6 h-6 rounded-md ${color.bg} ${color.text} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {item.total.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {item.outcomeNote}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Success Rate</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono">{item.successRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${item.successRate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
