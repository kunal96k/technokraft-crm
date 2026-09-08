import React from 'react';
import {
  Plus,
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  Bell,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { TaskTable } from '../../components/followups/tasks/TaskTable';
import { CreateTaskModal } from '../../components/followups/tasks/CreateTaskModal';
import { MOCK_TASKS } from '../../data/mockFollowUps';
import { TaskRecord, TaskStatus, TaskPriority } from '../../types/followUps';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = React.useState<TaskRecord[]>(MOCK_TASKS);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    showToast(`Task status updated to ${newStatus}.`);
  };

  const handleCreateTask = (newTaskData: Omit<TaskRecord, 'id' | 'createdAt'>) => {
    const newTask: TaskRecord = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Created task: "${newTask.taskName}".`);
  };

  // Metrics
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const overdueCount = tasks.filter((t) => t.status === 'OVERDUE').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  // Filtered
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = t.taskName.toLowerCase().includes(q);
      const matchesDesc = t.description?.toLowerCase().includes(q);
      const matchesCompany = t.companyName?.toLowerCase().includes(q);
      const matchesAssignee = t.assignedTo.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc && !matchesCompany && !matchesAssignee) {
        return false;
      }
    }
    return true;
  });

  return (
    <div id="crm-tasks-page" className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-top-2 duration-200">
          <Bell className="w-4 h-4 text-[#5B4DB7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Tasks"
        description="Manage action items, documentation deadlines, and team deliverables across leads."
        showDateBadge={true}
        actions={
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        }
      />

      {/* Mini metric counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'TODO' ? 'ALL' : 'TODO')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'TODO'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 ring-2 ring-amber-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">To Do</span>
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{todoCount}</div>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')
          }
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/80 ring-2 ring-blue-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Progress</span>
            <PlayCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{inProgressCount}</div>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')
          }
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'OVERDUE'
              ? 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-700/80 ring-2 ring-red-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{overdueCount}</div>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')
          }
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'COMPLETED'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 ring-2 ring-emerald-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</div>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, lead, or assignee..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="OVERDUE">Overdue</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setSearchQuery('');
              }}
              className="text-purple-700 dark:text-purple-400 hover:underline text-xs font-semibold px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Task Table */}
      <TaskTable
        tasks={filteredTasks}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
