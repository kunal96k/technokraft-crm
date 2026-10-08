import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  User,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  Flag,
  AlertCircle,
} from 'lucide-react';
import { FollowUpRecord, FollowUpPriority } from '../../types/followUps';
import { FollowUpStatusBadge } from './FollowUpStatusBadge';
import { FollowUpPriorityBadge } from './FollowUpPriorityBadge';
import { FollowUpTypeBadge } from './FollowUpTypeBadge';
import { FollowUpActionMenu } from './FollowUpActionMenu';
import { FollowUpEmptyState } from './FollowUpEmptyState';

interface FollowUpTableProps {
  followUps: FollowUpRecord[];
  selectedIds: string[];
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (id: string) => void;
  onOpenDetails: (item: FollowUpRecord) => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
  onCancel: (id: string) => void;
  onBulkComplete?: (ids: string[]) => void;
  onBulkReschedule?: (ids: string[]) => void;
  onBulkAssign?: (ids: string[]) => void;
  onBulkPriority?: (ids: string[], priority: FollowUpPriority) => void;
  onAction?: () => void;
  onResetFilters?: () => void;
  hasFilters?: boolean;
}

export const FollowUpTable: React.FC<FollowUpTableProps> = ({
  followUps,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onOpenDetails,
  onOpenComplete,
  onOpenReschedule,
  onCancel,
  onBulkComplete,
  onBulkReschedule,
  onBulkAssign,
  onBulkPriority,
  onAction,
  onResetFilters,
  hasFilters,
}) => {
  const isAllSelected = followUps.length > 0 && selectedIds.length === followUps.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < followUps.length;

  if (followUps.length === 0) {
    return (
      <FollowUpEmptyState
        hasFilters={hasFilters}
        onAction={onAction}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Bulk action bar if selected */}
      {selectedIds.length > 0 && (
        <div className="px-4 py-2.5 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-[#5B4DB7] dark:text-purple-300 font-semibold">
            <span>{selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center gap-2">
            {onBulkComplete && (
              <button
                type="button"
                onClick={() => onBulkComplete(selectedIds)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed</span>
              </button>
            )}
            {onBulkReschedule && (
              <button
                type="button"
                onClick={() => onBulkReschedule(selectedIds)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reschedule</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-[#5B4DB7] focus:ring-[#5B4DB7] cursor-pointer"
                />
              </th>
              <th className="p-3">Schedule Date & Time</th>
              <th className="p-3">Type</th>
              <th className="p-3">Lead / Company</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-12 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {followUps.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isOverdue = item.isOverdue || (item.status === 'OVERDUE');

              return (
                <tr
                  key={item.id}
                  onClick={() => onOpenDetails(item)}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
                  }`}
                >
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectOne(item.id)}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#5B4DB7] focus:ring-[#5B4DB7] cursor-pointer"
                    />
                  </td>

                  {/* Date & Time */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isOverdue
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                            : 'bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.scheduledDate}</span>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.scheduledTime || 'Flexible'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="p-3">
                    <FollowUpTypeBadge type={item.type} />
                  </td>

                  {/* Lead & Company */}
                  <td className="p-3">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.companyName || 'Lead Company'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{item.leadContactPerson || 'Client Contact'}</span>
                        {item.leadCode && (
                          <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.leadCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="p-3">
                    <FollowUpPriorityBadge priority={item.priority} />
                  </td>

                  {/* Assigned To */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {item.assignedToName?.charAt(0) || 'U'}
                      </div>
                      <span>{item.assignedToName || 'Unassigned'}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <FollowUpStatusBadge status={item.status} />
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <FollowUpActionMenu
                      followUp={item}
                      onOpenDetails={onOpenDetails}
                      onOpenComplete={onOpenComplete}
                      onOpenReschedule={onOpenReschedule}
                      onCancel={onCancel}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
