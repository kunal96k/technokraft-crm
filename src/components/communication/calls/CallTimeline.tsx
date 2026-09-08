import React from 'react';
import { CallRecord } from '../../../types/calls';
import { CallStatusBadge } from './CallStatusBadge';
import { CallResultBadge } from './CallResultBadge';
import { CallTypeBadge } from './CallTypeBadge';
import { Clock, Phone, Building2, User, CalendarPlus, ExternalLink, MessageSquare } from 'lucide-react';

interface CallTimelineProps {
  calls: CallRecord[];
  onView: (call: CallRecord) => void;
  onAddFollowUp: (call: CallRecord) => void;
  onOpenLead: (leadId: string) => void;
}

export const CallTimeline: React.FC<CallTimelineProps> = ({
  calls,
  onView,
  onAddFollowUp,
  onOpenLead,
}) => {
  // Group calls by date
  const groups: { [date: string]: CallRecord[] } = {};
  calls.forEach((call) => {
    const key = call.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(call);
  });

  const dates = Object.keys(groups);

  if (calls.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
        <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No calls in timeline</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Try changing the filters above</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dates.map((dateStr) => {
        const dateCalls = groups[dateStr];
        const isToday = dateStr.toLowerCase().includes('07 sep') || dateStr.toLowerCase().includes('today');

        return (
          <div key={dateStr} className="space-y-3">
            {/* Date Section Header */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  isToday
                    ? 'bg-[#5B4DB7] text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isToday ? "Today's Calls • 07 Sep 2026" : dateStr}
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {dateCalls.length} {dateCalls.length === 1 ? 'call' : 'calls'}
              </span>
            </div>

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {dateCalls.map((call) => {
                let dotColor = 'bg-blue-500 ring-blue-100 dark:ring-blue-950';
                if (call.status === 'completed') dotColor = 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950';
                if (call.status === 'missed') dotColor = 'bg-rose-500 ring-rose-100 dark:ring-rose-950';
                if (call.status === 'scheduled') dotColor = 'bg-indigo-500 ring-indigo-100 dark:ring-indigo-950';

                return (
                  <div key={call.id} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 top-3 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ring-4 shadow-2xs ${dotColor}`}
                    />

                    {/* Timeline Item Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs hover:border-[#5B4DB7]/40 dark:hover:border-purple-500/40 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                            {call.time}
                          </span>
                          <CallTypeBadge type={call.type} />
                          <CallStatusBadge status={call.status} />
                          {call.duration && call.duration !== '0m 00s' && (
                            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              Duration: {call.duration}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <CallResultBadge result={call.result} />
                        </div>
                      </div>

                      {/* Company & Contact Info */}
                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            <h4
                              onClick={() => onView(call)}
                              className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-400 cursor-pointer transition-colors"
                            >
                              {call.companyName}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                              ({call.leadCode})
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 pl-5">
                            <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{call.contactName}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-slate-500 dark:text-slate-400">{call.contactDesignation}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pl-5">
                            <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <span className="font-mono text-[11px]">{call.contactPhone}</span>
                          </div>
                        </div>

                        {/* Employee & Follow-up Details */}
                        <div className="space-y-1 sm:text-right flex flex-col justify-between">
                          <div className="flex sm:justify-end items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <span className="text-slate-400 dark:text-slate-500">Called by:</span>
                            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#5B4DB7] dark:text-purple-300 font-bold text-[10px] flex items-center justify-center">
                              {call.employeeAvatar}
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{call.employeeName}</span>
                          </div>

                          {call.nextFollowUp && (
                            <div className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-100/80 dark:border-indigo-800 sm:self-end">
                              <span className="font-medium">Next Follow-up: </span>
                              <strong className="font-bold">{call.nextFollowUp.date}</strong> at{' '}
                              <span>{call.nextFollowUp.time}</span> ({call.nextFollowUp.type})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes snippet */}
                      {call.notes && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                          <p className="line-clamp-2 leading-relaxed">{call.notes}</p>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenLead(call.leadId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Lead</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddFollowUp(call)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#5B4DB7] dark:text-purple-300 font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition-colors cursor-pointer"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          <span>Follow-up</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onView(call)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
