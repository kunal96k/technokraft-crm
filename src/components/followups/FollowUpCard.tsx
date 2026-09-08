import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  RotateCcw,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { FollowUpRecord } from '../../types/followUps';
import { FollowUpStatusBadge } from './FollowUpStatusBadge';
import { FollowUpPriorityBadge } from './FollowUpPriorityBadge';
import { FollowUpTypeBadge } from './FollowUpTypeBadge';

interface FollowUpCardProps {
  followUp: FollowUpRecord;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetails: (item: FollowUpRecord) => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
  onCancel: (id: string) => void;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  followUp,
  isSelected,
  onToggleSelect,
  onOpenDetails,
  onOpenComplete,
  onOpenReschedule,
  onCancel,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const isOverdue = followUp.status === 'OVERDUE' || (followUp.daysOverdue && followUp.daysOverdue > 0);

  return (
    <div
      id={`followup-card-${followUp.id}`}
      className={`p-4 rounded-xl border transition-all duration-150 relative ${
        isSelected
          ? 'border-[#5B4DB7] bg-purple-50/20 dark:bg-purple-950/30'
          : isOverdue
          ? 'border-red-200/90 dark:border-red-900/50 bg-red-50/10 dark:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
      }`}
    >
      {/* Top row: Checkbox, Type Badge, Priority & Status, Action Menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(followUp.id)}
            className="w-4 h-4 rounded text-[#5B4DB7] focus:ring-[#5B4DB7]/40 border-slate-300 dark:border-slate-700"
          />
          <FollowUpTypeBadge type={followUp.type} />
          <FollowUpPriorityBadge priority={followUp.priority} size="sm" />
        </div>

        <div className="flex items-center gap-1.5">
          <FollowUpStatusBadge status={followUp.status} size="sm" />
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenDetails(followUp);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  View Details
                </button>
                {followUp.status !== 'COMPLETED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onOpenComplete(followUp);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-medium"
                    >
                      Complete Follow-up
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onOpenReschedule(followUp);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300"
                    >
                      Reschedule
                    </button>
                  </>
                )}
                <Link
                  to={`/leads/${followUp.leadId}`}
                  className="block px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Open Lead Record
                </Link>
                {followUp.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onCancel(followUp.id);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-700 mt-1"
                  >
                    Cancel Follow-up
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company and Lead info */}
      <div className="mt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>{followUp.leadCode}</span>
          <span>•</span>
          <span className="text-slate-600 dark:text-slate-300 truncate">{followUp.service}</span>
        </div>
        <Link
          to={`/leads/${followUp.leadId}`}
          className="text-sm font-semibold text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-400 flex items-center gap-1 mt-0.5"
        >
          <span>{followUp.companyName}</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>

      {/* Purpose */}
      <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2">
        {followUp.purpose}
      </p>

      {/* Contact & Timing info */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2.5">
        <div className="flex items-center gap-1.5 truncate">
          <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="truncate">{followUp.contactName}</span>
        </div>

        <div className="flex items-center justify-end gap-1.5 font-medium text-slate-700 dark:text-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{followUp.time}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{followUp.date}</span>
        </div>

        <div className="flex items-center justify-end gap-1.5">
          <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 text-[10px] font-bold flex items-center justify-center">
            {followUp.assignedAvatar || followUp.assignedTo.substring(0, 2).toUpperCase()}
          </span>
          <span className="truncate text-slate-600 dark:text-slate-400 text-[11px]">{followUp.assignedTo}</span>
        </div>
      </div>

      {/* Overdue highlight indicator if applicable */}
      {isOverdue && followUp.status !== 'COMPLETED' && (
        <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>
            {followUp.daysOverdue === 0
              ? 'Overdue from earlier today'
              : `${followUp.daysOverdue} days overdue`}
          </span>
        </div>
      )}

      {/* Fast Action Buttons at bottom of card */}
      {followUp.status !== 'COMPLETED' && followUp.status !== 'CANCELLED' && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpenComplete(followUp)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenReschedule(followUp)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Reschedule</span>
          </button>
        </div>
      )}
    </div>
  );
};
