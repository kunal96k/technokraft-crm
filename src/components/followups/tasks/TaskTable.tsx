import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  CheckSquare,
  PlayCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import { TaskRecord, TaskStatus } from '../../../types/followUps';
import { FollowUpPriorityBadge } from '../FollowUpPriorityBadge';

interface TaskTableProps {
  tasks: TaskRecord[];
  onToggleStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onToggleStatus,
  onDeleteTask,
}) => {
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Done
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            <PlayCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            In Progress
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
            Overdue
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'TODO':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            To Do
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
          <tr>
            <th className="py-3 px-3 w-8 text-center">Status</th>
            <th className="py-3 px-3 min-w-[240px]">Task Name & Scope</th>
            <th className="py-3 px-3 min-w-[180px]">Related Lead</th>
            <th className="py-3 px-3 min-w-[130px]">Assigned To</th>
            <th className="py-3 px-3 min-w-[90px]">Priority</th>
            <th className="py-3 px-3 min-w-[130px]">Due Date</th>
            <th className="py-3 px-3 text-right min-w-[100px]">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';

            return (
              <tr
                key={task.id}
                className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                  isCompleted ? 'bg-slate-50/40 dark:bg-slate-950/30 opacity-75' : ''
                }`}
              >
                {/* Fast Toggle Checkbox */}
                <td className="py-3 px-3 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      onToggleStatus(
                        task.id,
                        isCompleted ? 'TODO' : 'COMPLETED'
                      )
                    }
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 hover:border-[#5B4DB7] dark:hover:border-purple-400 text-transparent hover:text-slate-300'
                    }`}
                    title={isCompleted ? 'Mark To Do' : 'Mark Completed'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </td>

                {/* Task Name & Scope */}
                <td className="py-3 px-3">
                  <span
                    className={`font-semibold text-slate-900 dark:text-white block ${
                      isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {task.taskName}
                  </span>
                  {task.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {task.description}
                    </p>
                  )}
                </td>

                {/* Related Lead */}
                <td className="py-3 px-3">
                  {task.companyName ? (
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 block">
                        {task.leadCode}
                      </span>
                      <Link
                        to={`/leads/${task.leadId}`}
                        className="font-medium text-slate-800 dark:text-slate-200 hover:text-[#5B4DB7] dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
                      >
                        <span className="truncate">{task.companyName}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                      </Link>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">Internal Team</span>
                  )}
                </td>

                {/* Assigned To */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#5B4DB7] dark:text-purple-300 text-[10px] font-bold flex items-center justify-center">
                      {task.assignedAvatar || task.assignedTo.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate text-slate-700 dark:text-slate-300">{task.assignedTo}</span>
                  </div>
                </td>

                {/* Priority */}
                <td className="py-3 px-3">
                  <FollowUpPriorityBadge priority={task.priority} size="sm" />
                </td>

                {/* Due Date & Time */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{task.dueDate}</span>
                  </div>
                  {task.dueTime && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      {task.dueTime}
                    </span>
                  )}
                </td>

                {/* Status & Actions */}
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getStatusBadge(task.status)}
                    {task.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(task.id, 'COMPLETED')}
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded cursor-pointer transition-colors"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
