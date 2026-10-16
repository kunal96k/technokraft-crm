import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  CalendarPlus,
  Building,
  User,
  Phone,
  Clock,
  Award,
  Globe,
} from 'lucide-react';
import { EmployeeAvatar } from '../../common/EmployeeAvatar';
import { EmployeeSelect } from '../../common/EmployeeSelect';
import { UserCheck, Loader2 } from 'lucide-react';

interface LeadInfoPanelProps {
  conversation: WhatsAppConversation | null;
  onCloseMobile?: () => void;
  onReassign?: (newEmployeeName: string) => void;
  className?: string;
}

export const LeadInfoPanel: React.FC<LeadInfoPanelProps> = ({
  conversation,
  onCloseMobile,
  onReassign,
  className = '',
}) => {
  const navigate = useNavigate();
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!conversation) return null;

  return (
    <div
      className={`flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs text-slate-800 dark:text-slate-200 ${className}`}
    >
      {/* Panel Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            CRM Lead Summary
          </h3>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close lead panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content (Scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Company & Score */}
        <div className="p-3 bg-purple-50/40 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/60 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-700">
              {conversation.leadCode}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#5B4DB7] dark:text-purple-400">
              <Award className="w-3.5 h-3.5" />
              <span>Score: {conversation.leadScore}/100</span>
            </div>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {conversation.companyName}
          </h4>
          {conversation.companyWebsite && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span className="truncate">{conversation.companyWebsite}</span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Contact Information
          </div>
          <div className="p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <EmployeeAvatar
                name={conversation.contactName}
                size="sm"
                showRing={true}
                isClient={true}
                className="mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-white truncate">{conversation.contactName}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{conversation.contactDesignation}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{conversation.contactPhone}</span>
            </div>
          </div>
        </div>

        {/* Pipeline & Assignment */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Pipeline & Owner
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-0.5">Stage</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">{conversation.leadStatus}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Assigned To</span>
                {onReassign && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmployeeName(conversation.assignedEmployee);
                      setIsReassignModalOpen(true);
                    }}
                    className="text-[10px] font-semibold text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <EmployeeAvatar
                  name={conversation.assignedEmployee}
                  avatar={conversation.assignedEmployeeAvatar}
                  profilePhoto={conversation.assignedEmployeeProfilePhoto}
                  email={conversation.assignedEmployeeEmail}
                  size="xs"
                  showRing={true}
                />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">
                  {conversation.assignedEmployee}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Follow-up Banner */}
        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Next Scheduled Follow-up</span>
          </div>
          <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
            {conversation.nextFollowUp}
          </p>
          <p className="text-[10px] text-amber-700 dark:text-amber-400">
            Automated calendar reminder dispatched to {conversation.assignedEmployee}.
          </p>
        </div>

        {/* Primary Connected CRM Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => navigate(`/leads/${conversation.leadId}`)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg shadow-xs transition-colors"
          >
            <span>View Full Lead Record</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/follow-ups')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Reassign Active Employee Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-[#5B4DB7] dark:text-purple-300 rounded-xl">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Reassign Conversation</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Active employees only
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReassignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedEmployeeName.trim()) return;
                setIsSubmitting(true);
                try {
                  if (onReassign) {
                    await onReassign(selectedEmployeeName.trim());
                  }
                  setIsReassignModalOpen(false);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Active Employee
                </label>
                <EmployeeSelect
                  value={selectedEmployeeName}
                  onChange={(e) => {
                    const val = typeof e === 'string' ? e : e.target.value;
                    setSelectedEmployeeName(val);
                  }}
                  placeholder="Select active employee..."
                  className="w-full text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedEmployeeName}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
