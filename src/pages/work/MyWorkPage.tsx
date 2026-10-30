import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  FolderKanban,
  Kanban,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Flame,
  Bug,
  Sparkles,
  Loader2,
  RefreshCw,
  Send,
  Check,
  Briefcase,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProjectTaskRecord, MyWorkSummaryRecord, TaskStatus } from '../../types/projects';
import { fetchMyWorkSummary, fetchMyTasks, updateTaskStatus } from '../../services/taskService';
import { TaskDetailsModal } from '../../components/projects/TaskDetailsModal';

export const MyWorkPage: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Team Member';
  const userRole = user?.role || user?.accessRole || 'Developer / Intern';
  const employeeId = user?.id ? Number(user.id) : undefined;

  const [summary, setSummary] = useState<MyWorkSummaryRecord | null>(null);
  const [tasks, setTasks] = useState<ProjectTaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_PROGRESS' | 'TODO' | 'REVIEW' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const loadMyWork = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, tasksData] = await Promise.all([
        fetchMyWorkSummary(employeeId).catch(() => null),
        fetchMyTasks(employeeId),
      ]);
      setSummary(sumData);
      setTasks(tasksData);
    } catch (err: any) {
      console.error('Failed to load my work:', err);
      setError(err.message || 'Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyWork();
  }, [employeeId]);

  // Handle 1-click status transitions
  const handleQuickTransition = async (
    e: React.MouseEvent,
    taskId: number,
    nextStatus: TaskStatus
  ) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
      await updateTaskStatus(taskId, nextStatus);
      // Refresh summary
      fetchMyWorkSummary(employeeId).then((res) => setSummary(res)).catch(() => {});
    } catch (err: any) {
      console.error('Failed to change status:', err);
      loadMyWork(); // rollback
    }
  };

  // Filter tasks based on activeTab and searchQuery
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === 'IN_PROGRESS' && t.status !== 'IN_PROGRESS') return false;
      if (activeTab === 'TODO' && t.status !== 'TODO' && t.status !== 'BACKLOG') return false;
      if (
        activeTab === 'REVIEW' &&
        t.status !== 'INTERNAL_REVIEW' &&
        t.status !== 'QA_TESTING' &&
        t.status !== 'CLIENT_REVIEW'
      )
        return false;
      if (activeTab === 'COMPLETED' && t.status !== 'COMPLETED') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKey = t.taskKey?.toLowerCase().includes(q);
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchProject = t.projectName?.toLowerCase().includes(q);
        if (!matchKey && !matchTitle && !matchProject) return false;
      }
      return true;
    });
  }, [tasks, activeTab, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter((t) => t.status === 'TODO' || t.status === 'BACKLOG').length;
    const review = tasks.filter(
      (t) =>
        t.status === 'INTERNAL_REVIEW' ||
        t.status === 'QA_TESTING' ||
        t.status === 'CLIENT_REVIEW'
    ).length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const overdue = summary?.overdueTasks || 0;
    return { total, inProgress, todo, review, completed, overdue };
  }, [tasks, summary]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Work"
        description={`Personal task queue and sprint deliverables for ${userName} (${userRole}).`}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadMyWork}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              title="Refresh my tasks"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span>All Projects</span>
            </Link>
            <Link
              to="/projects/board"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Kanban className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Kanban Board</span>
            </Link>
          </div>
        }
      />

      {/* Focus Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('ALL')}
          className={`bg-white dark:bg-slate-900 border p-4 rounded-2xl shadow-2xs cursor-pointer transition-all ${
            activeTab === 'ALL'
              ? 'border-[#5B4DB7] ring-2 ring-[#5B4DB7]/20'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Assigned to Me
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {counts.total}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total active work items</p>
        </div>

        <div
          onClick={() => setActiveTab('IN_PROGRESS')}
          className={`bg-white dark:bg-slate-900 border p-4 rounded-2xl shadow-2xs cursor-pointer transition-all ${
            activeTab === 'IN_PROGRESS'
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {counts.inProgress}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Currently executing</p>
        </div>

        <div
          onClick={() => setActiveTab('REVIEW')}
          className={`bg-white dark:bg-slate-900 border p-4 rounded-2xl shadow-2xs cursor-pointer transition-all ${
            activeTab === 'REVIEW'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Waiting Review / QA
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {counts.review}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Under peer or QA validation</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Due Soon / Overdue
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {counts.overdue}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Requires prompt attention</p>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#5B4DB7] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Tasks ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            In Progress ({counts.inProgress})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TODO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'TODO'
                ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            To Do ({counts.todo})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'REVIEW'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            In Review ({counts.review})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Completed ({counts.completed})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search my tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
          />
        </div>
      </div>

      {/* Task List / Workspace */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Loading assigned sprint tasks...
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-2xs">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No tasks in this view
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Great job! You have no pending sprint tasks under this filter.
            </p>
            <div className="pt-2">
              <Link
                to="/projects/board"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#5B4DB7] bg-purple-50 dark:bg-purple-950/60 rounded-xl hover:bg-purple-100"
              >
                <span>Browse Team Kanban</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#5B4DB7]/40"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900">
                    {task.taskKey}
                  </span>

                  {task.projectName && (
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>{task.projectName}</span>
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : task.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#5B4DB7] transition-colors">
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:self-center">
                {/* 1-Click Action Button depending on current status */}
                {(task.status === 'TODO' || task.status === 'BACKLOG') && (
                  <button
                    type="button"
                    onClick={(e) => handleQuickTransition(e, task.id, 'IN_PROGRESS')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Start Task</span>
                  </button>
                )}

                {task.status === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    onClick={(e) => handleQuickTransition(e, task.id, 'INTERNAL_REVIEW')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Review</span>
                  </button>
                )}

                {task.status === 'INTERNAL_REVIEW' && (
                  <button
                    type="button"
                    onClick={(e) => handleQuickTransition(e, task.id, 'QA_TESTING')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pass to QA</span>
                  </button>
                )}

                {task.status === 'QA_TESTING' && (
                  <button
                    type="button"
                    onClick={(e) => handleQuickTransition(e, task.id, 'CLIENT_REVIEW')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Pass to Client Demo</span>
                  </button>
                )}

                {task.status === 'CLIENT_REVIEW' && (
                  <button
                    type="button"
                    onClick={(e) => handleQuickTransition(e, task.id, 'COMPLETED')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Mark Complete</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedTaskId(task.id)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TASK DETAILS MODAL */}
      {selectedTaskId && (
        <TaskDetailsModal
          isOpen={!!selectedTaskId}
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => {
            loadMyWork();
          }}
        />
      )}
    </div>
  );
};

export default MyWorkPage;
