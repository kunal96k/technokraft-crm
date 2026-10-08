import React, { useState } from 'react';
import { LeadActivity, Lead } from '../../types/leads';
import {
  X,
  Phone,
  Mail,
  FileText,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  CalendarPlus,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: LeadActivity | null;
  lead?: Lead | null;
  onLogFollowUp?: () => void;
  onLogCall?: () => void;
  onSendEmail?: () => void;
}

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  isOpen,
  onClose,
  activity,
  lead,
  onLogFollowUp,
  onLogCall,
  onSendEmail,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activity) return null;

  const handleCopyNote = () => {
    if (!activity.notes) return;
    navigator.clipboard.writeText(activity.notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Activity type styling and icons
  const getActivityMeta = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'CALL':
        return {
          label: 'Call Log',
          icon: Phone,
          badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
          accentColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'EMAIL':
        return {
          label: 'Email Dispatch',
          icon: Mail,
          badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          iconBg: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300',
          accentColor: 'text-sky-600 dark:text-sky-400',
        };
      case 'NOTE':
        return {
          label: 'Team Note',
          icon: FileText,
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
          accentColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'FOLLOWUP':
        return {
          label: 'Follow-up Event',
          icon: Calendar,
          badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          iconBg: 'bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300',
          accentColor: 'text-[#5B4DB7] dark:text-purple-400',
        };
      case 'STATUS_CHANGE':
        return {
          label: 'Status Transition',
          icon: Sparkles,
          badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          iconBg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
          accentColor: 'text-indigo-600 dark:text-indigo-400',
        };
      case 'WHATSAPP':
        return {
          label: 'WhatsApp Message',
          icon: MessageSquare,
          badgeBg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
          iconBg: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300',
          accentColor: 'text-green-600 dark:text-green-400',
        };
      default:
        return {
          label: 'System Activity',
          icon: CheckCircle2,
          badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
          accentColor: 'text-slate-600 dark:text-slate-400',
        };
    }
  };

  const meta = getActivityMeta(activity.activityType);
  const IconComponent = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-slate-950/60 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${meta.iconBg} flex items-center justify-center shadow-2xs`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${meta.badgeBg}`}>
                  {meta.label}
                </span>
                {activity.result && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {activity.result}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                Activity & Note Details
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Main Title & Time Meta */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                {activity.title}
              </h4>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[11px] shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activity.date || 'Today'}</span>
                {activity.time && (
                  <>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activity.time}</span>
                  </>
                )}
              </div>
            </div>

            {/* Author / Logged By Meta */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-[#5B4DB7]/10 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 font-bold text-[10px] flex items-center justify-center border border-[#5B4DB7]/20">
                  {activity.employeeAvatar || (activity.employeeName ? activity.employeeName[0] : 'U')}
                </div>
                <span>
                  Logged by: <strong className="text-slate-800 dark:text-slate-100 font-semibold">{activity.employeeName || 'System User'}</strong>
                </span>
              </div>

              {activity.activityType === 'CALL' && (
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>Call Logged to Timeline</span>
                </span>
              )}
            </div>
          </div>

          {/* Lead Context Bar (if available) */}
          {lead && (
            <div className="p-3 bg-purple-50/50 dark:bg-slate-950/40 border border-purple-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{lead.company?.name}</span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                    ({lead.leadCode})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                {lead.contact?.name && (
                  <span>
                    Contact: <strong className="text-slate-800 dark:text-slate-200">{lead.contact.name}</strong>
                  </span>
                )}
                {lead.service && (
                  <span className="px-2 py-0.5 rounded bg-purple-100/70 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 font-semibold">
                    {lead.service}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Note / Detailed Content Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                <span>Notes & Discussion Summary</span>
              </label>

              {activity.notes && (
                <button
                  type="button"
                  onClick={handleCopyNote}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Note</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 leading-relaxed font-normal min-h-[90px] whitespace-pre-wrap">
              {activity.notes && activity.notes.trim().length > 0 ? (
                activity.notes
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic">
                  No additional conversation notes recorded for this activity.
                </span>
              )}
            </div>
          </div>

          {/* Quick Context Tips */}
          {activity.result === 'Interested' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Positive interaction: Client showed interest. Recommend scheduling a formal follow-up or demo.</span>
            </div>
          )}

          {(activity.result === 'Requirement Received' || activity.result === 'Proposal Requested') && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>High intent milestone: Ready for Proposal / Opportunity pipeline advancement.</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50/70 dark:bg-slate-950/60 rounded-b-2xl">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Database record ID #{activity.id || 'sync'}</span>
          </div>

          <div className="flex items-center gap-2 justify-end flex-wrap">
            {onLogCall && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogCall();
                }}
                className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Log Call</span>
              </button>
            )}

            {onLogFollowUp && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogFollowUp();
                }}
                className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Schedule Follow-up</span>
              </button>
            )}

            {onSendEmail && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSendEmail();
                }}
                className="px-3.5 py-2 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer min-h-[38px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
