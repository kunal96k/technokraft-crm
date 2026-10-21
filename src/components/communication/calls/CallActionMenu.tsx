import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CallRecord } from '../../../types/calls';
import {
  MoreVertical,
  Eye,
  Edit2,
  CalendarPlus,
  CalendarCheck,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface CallActionMenuProps {
  call: CallRecord;
  onView: (call: CallRecord) => void;
  onEdit: (call: CallRecord) => void;
  onAddFollowUp: (call: CallRecord) => void;
  onScheduleMeeting: (call: CallRecord) => void;
  onOpenLead: (leadId: string) => void;
  onCreateOpportunity?: (call: CallRecord) => void;
  onDelete?: (call: CallRecord) => void;
  onComplete?: (call: CallRecord) => void;
}

export const CallActionMenu: React.FC<CallActionMenuProps> = ({
  call,
  onView,
  onEdit,
  onAddFollowUp,
  onScheduleMeeting,
  onOpenLead,
  onCreateOpportunity,
  onDelete,
  onComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192; // 12rem = 192px (w-48)
    const estimatedMenuHeight = 240;

    // Check if there is enough space below the button in the viewport
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenUpwards = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      width: `${menuWidth}px`,
    };

    if (shouldOpenUpwards) {
      style.bottom = `${window.innerHeight - rect.top + 4}px`;
    } else {
      style.top = `${rect.bottom + 4}px`;
    }

    // Align right edge of menu to right edge of button, with safety margins
    const idealLeft = rect.right - menuWidth;
    style.left = `${Math.max(10, Math.min(window.innerWidth - menuWidth - 10, idealLeft))}px`;

    setMenuStyle(style);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const isOpportunityEligible =
    call.result === 'Requirement Received' || call.result === 'Proposal Requested';

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!isOpen) {
            calculatePosition();
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }}
        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
          isOpen ? 'bg-slate-100 dark:bg-slate-800 text-[#5B4DB7] dark:text-purple-400 ring-2 ring-[#5B4DB7]/20' : ''
        }`}
        title="More Actions"
        aria-label="Call action menu"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 animate-in fade-in-50 zoom-in-95 text-xs text-slate-700 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800 select-none"
          >
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

              {call.status === 'scheduled' && onComplete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onComplete(call);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-semibold cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Mark Completed</span>
                </button>
              )}

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
              {call.leadId && (
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
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onDelete(call);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-semibold cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  <span>Delete Call</span>
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
