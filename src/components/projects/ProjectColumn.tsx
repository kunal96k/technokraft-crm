import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Clock } from 'lucide-react';
import { ProjectTaskRecord, TaskStatus } from '../../types/projects';
import { DraggableProjectTaskCard } from './DraggableProjectTaskCard';

export interface ProjectColumnDef {
  id: TaskStatus;
  name: string;
  badgeBg: string;
  badgeText: string;
  color: string;
  border: string;
}

interface ProjectColumnProps {
  column: ProjectColumnDef;
  tasks: ProjectTaskRecord[];
  onSelectTask?: (task: ProjectTaskRecord) => void;
  onMoveStage?: (id: number, newStage: TaskStatus, defectNotes?: string) => void;
  onDelete?: (task: ProjectTaskRecord) => void;
  onQuickAdd?: (status: TaskStatus) => void;
}

export const ProjectColumn: React.FC<ProjectColumnProps> = ({
  column,
  tasks,
  onSelectTask,
  onMoveStage,
  onDelete,
  onQuickAdd,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { status: column.id },
  });

  const totalEstimatedHours = tasks.reduce(
    (sum, t) => sum + (t.estimatedHours || 0),
    0
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[300px] shrink-0 h-full bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOver
          ? 'border-[#5B4DB7] ring-2 ring-[#5B4DB7]/30 bg-purple-50/20 dark:bg-purple-950/20 shadow-md'
          : 'border-slate-200/80 dark:border-slate-800 shadow-2xs'
      }`}
    >
      {/* Column Header - Pinned at top */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 shrink-0 bg-slate-100 dark:bg-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${column.badgeBg} ${column.badgeText} border border-current/10 truncate`}
          >
            {column.name}
          </span>
          <span
            className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs"
            title={`${tasks.length} tasks in ${column.name}`}
          >
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onQuickAdd?.(column.id)}
          title={`Add Task to ${column.name}`}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-header: Column Hours & Counts */}
      <div className="px-3.5 py-1.5 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200/40 dark:border-slate-800/40 shrink-0">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Total Effort:</span>
        </span>
        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
          {totalEstimatedHours > 0 ? `${totalEstimatedHours} hrs` : '0 hrs'}
        </span>
      </div>

      {/* Cards Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col justify-center items-center rounded-xl border border-dashed border-slate-300/80 dark:border-slate-800 p-6 text-center min-h-[140px] text-slate-400 dark:text-slate-500 text-xs">
            <p className="font-medium">No tasks in {column.name}</p>
            <button
              type="button"
              onClick={() => onQuickAdd?.(column.id)}
              className="mt-2 text-[11px] font-semibold text-[#5B4DB7] dark:text-purple-300 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableProjectTaskCard
              key={task.id}
              task={task}
              onSelectTask={onSelectTask}
              onMoveStage={onMoveStage}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
