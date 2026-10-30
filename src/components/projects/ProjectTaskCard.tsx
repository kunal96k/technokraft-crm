import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Calendar,
  Clock,
  Briefcase,
  GripVertical,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Bug,
  Sparkles,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Eye,
  Send,
  Check,
  UserCheck,
} from 'lucide-react';
import { ProjectTaskRecord, TaskStatus, TaskPriority, TaskType } from '../../types/projects';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

interface ProjectTaskCardProps {
  task: ProjectTaskRecord;
  onSelectTask?: (task: ProjectTaskRecord) => void;
  onMoveStage?: (id: number, newStage: TaskStatus, defectNotes?: string) => void;
  onDelete?: (task: ProjectTaskRecord) => void;
  isDragging?: boolean;
  isDragOverlay?: boolean;
  dragHandleProps?: Record<string, any>;
}

const ALL_STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'BACKLOG', label: 'Backlog' },
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'INTERNAL_REVIEW', label: 'Code Review' },
  { id: 'QA_TESTING', label: 'QA & Testing' },
  { id: 'CLIENT_REVIEW', label: 'Client Demo' },
  { id: 'DEPLOYMENT', label: 'Deployment / CI/CD' },
  { id: 'COMPLETED', label: 'Done / Released' },
];

export const ProjectTaskCard: React.FC<ProjectTaskCardProps> = ({
  task,
  onSelectTask,
  onMoveStage,
  onDelete,
  isDragging = false,
  isDragOverlay = false,
  dragHandleProps,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showStageSubmenu, setShowStageSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowStageSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'BUG':
        return <Bug className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'FEATURE':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'SPIKE':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
      case 'URGENT':
        return (
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
            {priority === 'URGENT' ? 'Urgent' : 'Critical'}
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/60">
            Medium
          </span>
        );
      default:
        return (
          <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            Low
          </span>
        );
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  const curIdx = ALL_STATUSES.findIndex((s) => s.id === task.status);
  const canMoveBack = curIdx > 0;
  const canMoveForward = curIdx < ALL_STATUSES.length - 1;

  const handleAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveForward && onMoveStage) {
      onMoveStage(task.id, ALL_STATUSES[curIdx + 1].id);
    }
  };

  const handleStepBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveBack && onMoveStage) {
      onMoveStage(task.id, ALL_STATUSES[curIdx - 1].id);
    }
  };

  return (
    <div
      onClick={() => onSelectTask?.(task)}
      className={`group relative rounded-xl p-3.5 border transition-all duration-200 select-none cursor-pointer ${
        isDragOverlay
          ? 'bg-white dark:bg-slate-800 border-[#5B4DB7] shadow-2xl rotate-1 ring-2 ring-[#5B4DB7]/40'
          : isDragging
          ? 'opacity-30 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
          : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:border-[#5B4DB7]/50 dark:hover:border-[#5B4DB7]/60'
      }`}
    >
      {/* Top Bar: Drag Handle, Type & Key, Priority, 3-dot Menu */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors -ml-1"
            title="Drag to reorder or move stage"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {getTaskTypeIcon(task.taskType)}

          <span className="font-mono text-[11px] font-bold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-900 truncate">
            {task.taskKey}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {getPriorityBadge(task.priority)}

          {/* Context 3-dot Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
                setShowStageSubmenu(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100 font-medium"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onSelectTask?.(task);
                  }}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-[#5B4DB7]" />
                  <span>View / Edit Details</span>
                </button>

                {/* Move Stage Submenu Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStageSubmenu(!showStageSubmenu)}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                      <span>Move to Stage</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  {showStageSubmenu && (
                    <div className="absolute right-full top-0 mr-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-40 max-h-56 overflow-y-auto">
                      {ALL_STATUSES.map((stg) => (
                        <button
                          key={stg.id}
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setShowStageSubmenu(false);
                            onMoveStage?.(task.id, stg.id);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-[11px] hover:bg-purple-50 dark:hover:bg-slate-700 flex items-center justify-between ${
                            task.status === stg.id
                              ? 'font-bold text-[#5B4DB7] dark:text-purple-300'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{stg.label}</span>
                          {task.status === stg.id && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {onDelete && (
                  <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(task);
                      }}
                      className="w-full px-3 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Task</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed mb-1.5 group-hover:text-[#5B4DB7] dark:group-hover:text-purple-300 transition-colors">
        {task.title}
      </h4>

      {/* Project, Linked Lead & Defect tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {task.projectName && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700 max-w-[170px] truncate">
            <Briefcase className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            <span className="truncate">{task.projectName}</span>
          </div>
        )}
        {task.leadName && (
          <div className="flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/60 max-w-[150px] truncate" title={`Lead: ${task.leadName} (${task.leadCode || ''})`}>
            <UserCheck className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">{task.leadName}</span>
          </div>
        )}
        {task.defectNotes && (
          <div className="flex items-center gap-1 text-[10px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/60" title={`Defect Note: ${task.defectNotes}`}>
            <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
            <span>Defect Note</span>
          </div>
        )}
      </div>

      {/* Metadata Row: Assignee, Due Date, Est Hours */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
        {/* Assignee Avatar & Name */}
        <div className="flex items-center gap-1.5 min-w-0 max-w-[130px]">
          <EmployeeAvatar
            name={task.assigneeName || 'Unassigned'}
            avatar={task.assigneeAvatar}
            size="xs"
            className="shrink-0"
          />
          <span className="text-slate-700 dark:text-slate-300 truncate font-medium text-[11px]">
            {task.assigneeName || 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Estimated Hours */}
          {task.estimatedHours !== undefined && task.estimatedHours > 0 && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400"
              title={`Estimated: ${task.estimatedHours} hours`}
            >
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{task.estimatedHours}h</span>
            </span>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                isOverdue
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title={isOverdue ? 'Overdue!' : `Due ${task.dueDate}`}
            >
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Hover Step Controls (Bottom Bar) */}
      <div className="pt-2 mt-1.5 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity text-[10px]">
        {canMoveBack ? (
          <button
            type="button"
            onClick={handleStepBack}
            className="flex items-center gap-0.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-semibold cursor-pointer transition-colors"
            title={`Step back to ${ALL_STATUSES[curIdx - 1]?.label}`}
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Back</span>
          </button>
        ) : (
          <span />
        )}

        {canMoveForward && (
          <button
            type="button"
            onClick={handleAdvance}
            className="flex items-center gap-0.5 text-[#5B4DB7] dark:text-purple-300 hover:text-[#4E41A2] font-bold cursor-pointer transition-colors ml-auto"
            title={`Advance to ${ALL_STATUSES[curIdx + 1]?.label}`}
          >
            <span>Advance</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
