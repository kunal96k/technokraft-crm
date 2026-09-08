import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  ArrowUpDown,
  Phone,
  Mail,
  Eye,
} from 'lucide-react';
import { FollowUpRecord, FollowUpPriority } from '../../types/followUps';
import { FollowUpStatusBadge } from './FollowUpStatusBadge';
import { FollowUpPriorityBadge } from './FollowUpPriorityBadge';
import { FollowUpTypeBadge } from './FollowUpTypeBadge';

interface FollowUpTableProps {
  followUps: FollowUpRecord[];
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onOpenDetails: (item: FollowUpRecord) => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
  onCancel: (id: string) => void;
  onBulkComplete?: () => void;
  onBulkReschedule?: () => void;
  onBulkAssign?: (assignee: string) => void;
  onBulkPriority?: (priority: FollowUpPriority) => void;
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
}) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [showBulkAssignDropdown, setShowBulkAssignDropdown] = React.useState(false);
  const [showBulkPriorityDropdown, setShowBulkPriorityDropdown] = React.useState(false);

  const isAllSelected =
    followUps.length > 0 && selectedIds.length === followUps.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < followUps.length;

  React.useEffect(() => {
    const handleOutside = () => {
      setActiveMenuId(null);
      setShowBulkAssignDropdown(false);
      setShowBulkPriorityDropdown(false);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  return (
    <div id="followups-table-container" className="space-y-2">
      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5B4DB7] dark:text-purple-300">
            <span className="w-5 h-5 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center text-[10px]">
              {selectedIds.length}
            </span>
            <span>{selectedIds.length} follow-up{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {onBulkComplete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBulkComplete();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-2xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Complete</span>
              </button>
            )}

            {onBulkReschedule && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBulkReschedule();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Reschedule</span>
              </button>
            )}

            {/* Bulk Assign Menu */}
            {onBulkAssign && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBulkAssignDropdown(!showBulkAssignDropdown);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Reassign</span>
                </button>
                {showBulkAssignDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 py-1 text-xs">
                    {['Kunal Patil', 'Shruti Raundal', 'Pranav Jejurkar', 'Ankush Pandit', 'Rohan Patil'].map((emp) => (
                      <button
                        key={emp}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBulkAssignDropdown(false);
                          onBulkAssign(emp);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        {emp}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bulk Priority Menu */}
            {onBulkPriority && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBulkPriorityDropdown(!showBulkPriorityDropdown);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span>Priority</span>
                </button>
                {showBulkPriorityDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 py-1 text-xs">
                    {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as FollowUpPriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBulkPriorityDropdown(false);
                          onBulkPriority(p);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase font-medium"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
          <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="Select all follow-ups"
                  className="w-4 h-4 rounded text-[#5B4DB7] focus:ring-[#5B4DB7]/40 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 whitespace-nowrap min-w-[130px]">
                Date & Time
              </th>
              <th className="py-3 px-3 min-w-[180px]">Lead / Company</th>
              <th className="py-3 px-3 min-w-[150px]">Contact</th>
              <th className="py-3 px-3 min-w-[110px]">Type</th>
              <th className="py-3 px-3 min-w-[220px]">Purpose</th>
              <th className="py-3 px-3 min-w-[120px]">Assigned To</th>
              <th className="py-3 px-3 min-w-[90px]">Priority</th>
              <th className="py-3 px-3 min-w-[110px]">Status</th>
              <th className="py-3 px-3 text-right min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {followUps.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isOverdue = item.status === 'OVERDUE' || (item.daysOverdue && item.daysOverdue > 0);

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group ${
                    isSelected
                      ? 'bg-purple-50/30 dark:bg-purple-950/30'
                      : isOverdue && item.status !== 'COMPLETED'
                      ? 'bg-red-50/15 dark:bg-red-950/20'
                      : ''
                  }`}
                >
                  {/* Selection checkbox */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectOne(item.id)}
                      className="w-4 h-4 rounded text-[#5B4DB7] focus:ring-[#5B4DB7]/40 border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{item.time}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{item.date}</span>
                    </div>
                    {isOverdue && item.status !== 'COMPLETED' && (
                      <div className="text-[10px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>
                          {item.daysOverdue === 0 ? 'Due today' : `${item.daysOverdue}d overdue`}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Lead / Company */}
                  <td className="py-3 px-3">
                    <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {item.leadCode}
                    </div>
                    <Link
                      to={`/leads/${item.leadId}`}
                      className="font-semibold text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-400 flex items-center gap-1 line-clamp-1"
                    >
                      <span className="truncate">{item.companyName}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-[#5B4DB7] dark:group-hover:text-purple-400" />
                    </Link>
                    {item.service && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                        {item.service}
                      </span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.contactName}
                    </div>
                    {item.contactDesignation && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.contactDesignation}
                      </div>
                    )}
                    {item.contactPhone && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {item.contactPhone}
                      </div>
                    )}
                  </td>

                  {/* Follow-up Type */}
                  <td className="py-3 px-3">
                    <FollowUpTypeBadge type={item.type} />
                  </td>

                  {/* Purpose */}
                  <td className="py-3 px-3">
                    <p
                      className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 max-w-xs cursor-pointer hover:text-[#5B4DB7] dark:hover:text-purple-400"
                      onClick={() => onOpenDetails(item)}
                      title={item.purpose}
                    >
                      {item.purpose}
                    </p>
                    {item.reminder && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 italic block mt-0.5">
                        ⏰ {item.reminder}
                      </span>
                    )}
                  </td>

                  {/* Assigned To */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {item.assignedAvatar || item.assignedTo.substring(0, 2).toUpperCase()}
                      </span>
                      <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                        {item.assignedTo}
                      </span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-3">
                    <FollowUpPriorityBadge priority={item.priority} size="sm" />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <FollowUpStatusBadge status={item.status} size="sm" />
                  </td>

                  {/* Actions column */}
                  <td className="py-3 px-3 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick complete button on hover */}
                      {item.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => onOpenComplete(item)}
                          className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                          title="Complete Follow-up"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Context Menu Dropdown */}
                    {activeMenuId === item.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-3 top-10 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-30 py-1.5 text-left text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onOpenDetails(item);
                          }}
                          className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                          <span>View Details</span>
                        </button>

                        {item.status !== 'COMPLETED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onOpenComplete(item);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Mark Completed</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onOpenReschedule(item);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center gap-2"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              <span>Reschedule</span>
                            </button>
                          </>
                        )}

                        <Link
                          to={`/leads/${item.leadId}`}
                          className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                          <span>Open Lead</span>
                        </Link>

                        {item.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onCancel(item.id);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-700 mt-1 flex items-center gap-2"
                          >
                            <span>Cancel Follow-up</span>
                          </button>
                        )}
                      </div>
                    )}
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
