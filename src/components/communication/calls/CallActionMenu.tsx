import React, { useState, useRef, useEffect } from 'react';
import { CallRecord } from '../../../types/calls';
import {
  MoreVertical,
  Eye,
  Edit2,
  CalendarPlus,
  CalendarCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface CallActionMenuProps {
  call: CallRecord;
  onView: (call: CallRecord) => void;
  onEdit: (call: CallRecord) => void;
  onAddFollowUp: (call: CallRecord) => void;
  onScheduleMeeting: (call: CallRecord) => void;
  onOpenLead: (leadId: string) => void;
  onCreateOpportunity?: (call: CallRecord) => void;
}

export const CallActionMenu: React.FC<CallActionMenuProps> = ({
  call,
  onView,
  onEdit,
  onAddFollowUp,
  onScheduleMeeting,
  onOpenLead,
  onCreateOpportunity,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isOpportunityEligible =
    call.result === 'Requirement Received' || call.result === 'Proposal Requested';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
        title="More Actions"
        aria-label="Call action menu"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 animate-in fade-in-50 zoom-in-95 text-xs text-slate-700 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="py-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onView(call);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 font-medium cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>View Details</span>
            </button>

            {call.status === 'scheduled' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onEdit(call);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 font-medium cursor-pointer transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Edit Call</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onAddFollowUp(call);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 flex items-center gap-2 font-medium text-[#5B4DB7] dark:text-purple-300 cursor-pointer transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-300" />
              <span>Add Follow-up</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onScheduleMeeting(call);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 font-medium cursor-pointer transition-colors"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Schedule Meeting</span>
            </button>
          </div>

          {isOpportunityEligible && onCreateOpportunity && (
            <div className="py-0.5 bg-purple-50/50 dark:bg-purple-950/30">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onCreateOpportunity(call);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-purple-100/60 dark:hover:bg-purple-950/60 flex items-center gap-2 font-semibold text-[#5B4DB7] dark:text-purple-300 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-300" />
                <span>Create Opportunity</span>
              </button>
            </div>
          )}

          <div className="py-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onOpenLead(call.leadId);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 font-medium text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Open Lead</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
