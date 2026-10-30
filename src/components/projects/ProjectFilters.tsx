import React, { useState } from 'react';
import { Search, Filter, X, RotateCcw, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { DeliveryProjectRecord } from '../../types/projects';
import { Employee } from '../../types/employees';
import { EmployeeSelect } from '../common/EmployeeSelect';

export interface ProjectFilterState {
  search: string;
  projectId: string;
  assigneeId: string;
  taskType: string;
  priority: string;
  status: string;
}

interface ProjectFiltersProps {
  filters: ProjectFilterState;
  onChange: (key: keyof ProjectFilterState, value: string) => void;
  onReset: () => void;
  projects: DeliveryProjectRecord[];
  employees: Employee[];
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onChange,
  onReset,
  projects,
  employees,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeCount = [
    filters.projectId !== 'ALL' && filters.projectId,
    filters.assigneeId !== 'ALL' && filters.assigneeId,
    filters.taskType !== 'ALL' && filters.taskType,
    filters.priority !== 'ALL' && filters.priority,
    filters.status !== 'ALL' && filters.status,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-2xs transition-colors duration-200 space-y-3">
      {/* Top row: Search + Project Select + Toggle Filter + Reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by key, title, assignee, or label..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Project Selector */}
        <div className="relative sm:w-72">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5B4DB7]" />
          <select
            value={filters.projectId}
            onChange={(e) => onChange('projectId', e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-[#5B4DB7] dark:text-purple-300 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
          >
            <option value="ALL">All Projects (Sprint Overview)</option>
            {projects.map((p) => (
              <option key={p.id} value={String(p.id)}>
                [{p.projectCode}] {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Expand Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            activeCount > 0 || isExpanded
              ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-[#5B4DB7] dark:text-purple-300'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#5B4DB7] text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        {/* Reset */}
        {(activeCount > 0 || filters.search) && (
          <button
            type="button"
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Expanded Filter Row */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
          {/* Assignee */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Assignee
            </label>
            <EmployeeSelect
              value={filters.assigneeId === 'ALL' ? '' : filters.assigneeId}
              valueField="id"
              placeholder="All Assignees"
              showAllOption="All Assignees"
              allowEmpty={true}
              onChange={(e: any) => {
                const val = typeof e === 'string' ? e : e?.target?.value;
                onChange('assigneeId', val || 'ALL');
              }}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Issue Type
            </label>
            <select
              value={filters.taskType}
              onChange={(e) => onChange('taskType', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Types</option>
              <option value="TASK">Task (Standard)</option>
              <option value="BUG">Bug / Defect</option>
              <option value="FEATURE">New Feature</option>
              <option value="SUBTASK">Subtask</option>
              <option value="SPIKE">Tech Spike</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => onChange('priority', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Status Stage
            </label>
            <select
              value={filters.status}
              onChange={(e) => onChange('status', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Stages</option>
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Development</option>
              <option value="INTERNAL_REVIEW">Code Review</option>
              <option value="QA_TESTING">QA & Testing</option>
              <option value="CLIENT_REVIEW">Client Demo</option>
              <option value="DEPLOYMENT">CI/CD & Deploy</option>
              <option value="COMPLETED">Done / Released</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
