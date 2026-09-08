import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Mail,
  MessageSquare,
  CalendarCheck,
  CheckSquare,
  FileText,
  UserPlus,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Employee } from '../../types/employees';

interface EmployeeActivityProps {
  employee: Employee;
}

export const EmployeeActivity: React.FC<EmployeeActivityProps> = ({ employee }) => {
  const navigate = useNavigate();

  const activityStats = [
    {
      label: 'Calls Logged',
      count: employee.todayActivity.calls,
      icon: PhoneCall,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      path: '/communication/calls',
    },
    {
      label: 'Emails Sent',
      count: employee.todayActivity.emails,
      icon: Mail,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      path: '/communication/emails',
    },
    {
      label: 'WhatsApp Chats',
      count: employee.todayActivity.whatsapp,
      icon: MessageSquare,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      path: '/communication/whatsapp',
    },
    {
      label: 'Follow-ups Done',
      count: employee.todayActivity.followUps,
      icon: CalendarCheck,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      path: '/follow-ups',
    },
    {
      label: 'Meetings Attended',
      count: employee.todayActivity.meetings,
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      path: '/follow-ups/meetings',
    },
    {
      label: 'Tasks Finished',
      count: employee.todayActivity.tasks,
      icon: CheckSquare,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40',
      path: '/follow-ups/tasks',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-blue-500" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-purple-500" />;
      case 'followup':
        return <CalendarCheck className="w-3.5 h-3.5 text-amber-500" />;
      case 'meeting':
        return <Clock className="w-3.5 h-3.5 text-indigo-500" />;
      case 'proposal':
        return <FileText className="w-3.5 h-3.5 text-emerald-500" />;
      case 'lead':
        return <UserPlus className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Today's Activity Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today's Logged Work Metrics
          </h4>
          <span className="text-[11px] text-slate-400">
            Live updates from CRM communication logs
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {activityStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <button
                key={stat.label}
                type="button"
                onClick={() => navigate(stat.path)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.bgColor} ${stat.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-purple-500 transition-colors" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {stat.count}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {stat.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real CRM Activity Timeline */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Recent CRM Activity Timeline
          </h4>
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Chronological audit feed
          </span>
        </div>

        {employee.recentTimeline.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No activity logged yet today for this employee.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {employee.recentTimeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:border-purple-500 transition-colors">
                  {getActivityIcon(item.type)}
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {item.companyName}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.time}
                    </span>
                  </div>

                  {item.result && (
                    <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50 mb-1.5">
                      Result: {item.result}
                    </div>
                  )}

                  {item.note && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
