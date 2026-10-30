import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  Kanban,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  FolderKanban,
  Users,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckSquare,
  ShieldAlert,
} from 'lucide-react';
import {
  DeliveryProjectRecord,
  ProjectTaskRecord,
  TaskStatus,
} from '../../types/projects';
import { fetchProjects } from '../../services/projectService';
import {
  fetchProjectTasks,
  updateTaskStatus,
  deleteTask as deleteTaskApi,
} from '../../services/taskService';
import { fetchEmployees } from '../../services/employeeService';
import { Employee } from '../../types/employees';
import { ProjectBoard, WORKFLOW_COLUMNS_CONFIG } from '../../components/projects/ProjectBoard';
import { ProjectSummaryCards } from '../../components/projects/ProjectSummaryCards';
import { ProjectFilters, ProjectFilterState } from '../../components/projects/ProjectFilters';
import { CreateTaskModal } from '../../components/projects/CreateTaskModal';
import { TaskDetailsModal } from '../../components/projects/TaskDetailsModal';
import { DefectNotesModal } from '../../components/projects/DefectNotesModal';
import { DeleteTaskModal } from '../../components/projects/DeleteTaskModal';

const ORDERED_STATUS_LIST: TaskStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'INTERNAL_REVIEW',
  'QA_TESTING',
  'CLIENT_REVIEW',
  'DEPLOYMENT',
  'COMPLETED',
];

export const ProjectKanbanPage: React.FC = () => {
  const { id: routeProjectId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<DeliveryProjectRecord[]>([]);
  const [tasks, setTasks] = useState<ProjectTaskRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Filter State
  const [filters, setFilters] = useState<ProjectFilterState>({
    search: '',
    projectId: routeProjectId || 'ALL',
    assigneeId: 'ALL',
    taskType: 'ALL',
    priority: 'ALL',
    status: 'ALL',
  });

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('TODO');
  const [selectedTask, setSelectedTask] = useState<ProjectTaskRecord | null>(null);

  // Defect / Rejection Modal state
  const [defectTarget, setDefectTarget] = useState<{
    task: ProjectTaskRecord;
    targetStatus: TaskStatus;
  } | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ProjectTaskRecord | null>(null);

  // Sync routeProjectId with filters
  useEffect(() => {
    if (routeProjectId) {
      setFilters((prev) => ({ ...prev, projectId: routeProjectId }));
    }
  }, [routeProjectId]);

  // Load Projects and Employees
  const loadInitialMetadata = useCallback(async () => {
    try {
      const [projList, empList] = await Promise.all([
        fetchProjects(),
        fetchEmployees({ size: 100 }).catch(() => ({ content: [] })),
      ]);
      setProjects(projList);
      setEmployees(empList.content || []);

      if (routeProjectId) {
        setFilters((prev) => ({ ...prev, projectId: routeProjectId }));
      } else if (projList.length > 0 && filters.projectId === 'ALL') {
        // default to all
      }
    } catch (err: any) {
      console.error('Failed to load project metadata:', err);
    }
  }, [routeProjectId]);

  useEffect(() => {
    loadInitialMetadata();
  }, [loadInitialMetadata]);

  // Load Tasks based on selected project
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (filters.projectId === 'ALL') {
        // Aggregate tasks from active projects
        const projList = projects.length > 0 ? projects : await fetchProjects();
        if (projList.length > 0) {
          const promises = projList.slice(0, 10).map((p) =>
            fetchProjectTasks(p.id).catch(() => [])
          );
          const results = await Promise.all(promises);
          setTasks(results.flat());
        } else {
          setTasks([]);
        }
      } else {
        const data = await fetchProjectTasks(filters.projectId);
        setTasks(data);
      }
    } catch (err: any) {
      console.error('Failed to load project tasks:', err);
      setError(err?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [filters.projectId, projects]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Global event listener to refresh board
  useEffect(() => {
    const handleSync = () => {
      loadTasks();
    };
    window.addEventListener('crm-tasks-updated', handleSync);
    window.addEventListener('crm-projects-updated', handleSync);
    return () => {
      window.removeEventListener('crm-tasks-updated', handleSync);
      window.removeEventListener('crm-projects-updated', handleSync);
    };
  }, [loadTasks]);

  // Move stage logic (Handles forward move & backward defect prompt)
  const handleMoveStage = async (
    taskId: number,
    newStatus: TaskStatus,
    defectNotes?: string
  ) => {
    const sourceTask = tasks.find((t) => t.id === taskId);
    if (!sourceTask || sourceTask.status === newStatus) return;

    const sourceIdx = ORDERED_STATUS_LIST.indexOf(sourceTask.status);
    const targetIdx = ORDERED_STATUS_LIST.indexOf(newStatus);

    // If moving backward (e.g. from Review/QA to In Progress/Todo) and no notes yet, prompt for defect notes!
    if (targetIdx < sourceIdx && !defectNotes && (sourceTask.status === 'INTERNAL_REVIEW' || sourceTask.status === 'QA_TESTING' || sourceTask.status === 'CLIENT_REVIEW')) {
      setDefectTarget({ task: sourceTask, targetStatus: newStatus });
      return;
    }

    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              defectNotes: defectNotes || t.defectNotes,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    try {
      await updateTaskStatus(taskId, newStatus, defectNotes);
      window.dispatchEvent(new Event('crm-tasks-updated'));
    } catch (err) {
      console.error('Failed to update task status:', err);
      loadTasks(); // rollback on error
    }
  };

  // Confirm Defect notes from modal
  const handleConfirmDefect = (notes: string) => {
    if (!defectTarget) return;
    handleMoveStage(defectTarget.task.id, defectTarget.targetStatus, notes);
    setDefectTarget(null);
  };

  // Confirm delete task
  const handleConfirmDelete = async (taskId: number) => {
    try {
      await deleteTaskApi(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      window.dispatchEvent(new Event('crm-tasks-updated'));
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task from database.');
    }
  };

  // Filter application
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchKey = t.taskKey?.toLowerCase().includes(q);
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchAssignee = t.assigneeName?.toLowerCase().includes(q);
        const matchProject = t.projectName?.toLowerCase().includes(q);
        const matchLabels = t.labels?.toLowerCase().includes(q);
        const matchLead = t.leadName?.toLowerCase().includes(q) || t.leadCode?.toLowerCase().includes(q);
        if (!matchKey && !matchTitle && !matchAssignee && !matchProject && !matchLabels && !matchLead) {
          return false;
        }
      }

      // Assignee
      if (filters.assigneeId !== 'ALL' && String(t.assigneeId) !== filters.assigneeId) {
        return false;
      }

      // Type
      if (filters.taskType !== 'ALL' && t.taskType !== filters.taskType) {
        return false;
      }

      // Priority
      if (filters.priority !== 'ALL' && t.priority !== filters.priority) {
        return false;
      }

      // Status
      if (filters.status !== 'ALL' && t.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalCount = tasks.length;
    const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const reviewCount = tasks.filter(
      (t) =>
        t.status === 'INTERNAL_REVIEW' ||
        t.status === 'QA_TESTING' ||
        t.status === 'CLIENT_REVIEW'
    ).length;
    const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
    const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

    return {
      totalCount,
      inProgressCount,
      reviewCount,
      completedCount,
      totalHours: Math.round(totalHours * 10) / 10,
    };
  }, [tasks]);

  const handleFilterChange = (key: keyof ProjectFilterState, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'projectId') {
        if (value !== 'ALL') {
          navigate(`/projects/${value}/board`);
        } else {
          navigate('/projects/board');
        }
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      projectId: routeProjectId || 'ALL',
      assigneeId: 'ALL',
      taskType: 'ALL',
      priority: 'ALL',
      status: 'ALL',
    });
  };

  const handleQuickAdd = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setIsCreateOpen(true);
  };

  const currentProject = projects.find((p) => String(p.id) === filters.projectId);

  return (
    <div className="space-y-5">
      {/* Page Header matching PipelinePage */}
      <PageHeader
        title={currentProject ? `${currentProject.name} — Work Board` : 'Project Work Board'}
        description={
          currentProject
            ? `Client: ${currentProject.companyName || currentProject.clientName || 'Direct'} • PM: ${currentProject.projectManagerName || 'Unassigned'} • Code: ${currentProject.projectCode}`
            : 'Jira-style sprint execution, QA defect tracking, and developer handoffs across active delivery projects'
        }
        actions={
          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              type="button"
              onClick={loadTasks}
              title="Refresh Work Board"
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#5B4DB7]' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-700 text-[#5B4DB7] dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-[#5B4DB7] dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>

            {/* Links */}
            <Link
              to="/projects"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span>Projects ({projects.length})</span>
            </Link>

            <Link
              to="/work/my-tasks"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>My Tasks</span>
            </Link>

            {/* Create Task Button */}
            <button
              type="button"
              onClick={() => {
                setCreateDefaultStatus('TODO');
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Task</span>
            </button>
          </div>
        }
      />

      {/* 5 Summary KPI Cards */}
      <ProjectSummaryCards
        totalCount={kpis.totalCount}
        inProgressCount={kpis.inProgressCount}
        reviewCount={kpis.reviewCount}
        completedCount={kpis.completedCount}
        totalHours={kpis.totalHours}
        activeFilterStatus={filters.status !== 'ALL' ? filters.status : undefined}
        onSelectStatus={(stg) =>
          handleFilterChange('status', filters.status === stg ? 'ALL' : stg || 'ALL')
        }
      />

      {/* Filter and Search Bar */}
      <ProjectFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        projects={projects}
        employees={employees}
      />

      {/* Main Board View vs List View */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Syncing project work board...
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-8 text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
            Failed to Load Project Tasks
          </h4>
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          <button
            type="button"
            onClick={loadTasks}
            className="px-4 py-2 bg-white border border-rose-300 text-rose-700 text-xs font-bold rounded-xl hover:bg-rose-50 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board with full drag & drop */
        <ProjectBoard
          tasks={filteredTasks}
          onMoveStage={handleMoveStage}
          onSelectTask={(task) => setSelectedTask(task)}
          onDelete={(task) => setDeleteTarget(task)}
          onQuickAdd={handleQuickAdd}
        />
      ) : (
        /* List View Mode */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Linked Lead</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Est. Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No tasks match the active filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                      {task.taskKey}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-semibold">
                      {task.title}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">
                      {task.projectName || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {task.leadName ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-900">
                          {task.leadName}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.assigneeName || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-[10px]">
                      {task.priority}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {task.status.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isCreateOpen && (
        <CreateTaskModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          defaultProjectId={
            filters.projectId !== 'ALL' ? Number(filters.projectId) : undefined
          }
          defaultStatus={createDefaultStatus}
          onTaskCreated={() => {
            setIsCreateOpen(false);
            loadTasks();
          }}
        />
      )}

      {/* TASK DETAILS MODAL / DRAWER */}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={!!selectedTask}
          taskId={selectedTask?.id || null}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={() => {
            loadTasks();
          }}
        />
      )}

      {/* DEFECT / REVISION NOTES MODAL */}
      {defectTarget && (
        <DefectNotesModal
          isOpen={!!defectTarget}
          task={defectTarget?.task || null}
          targetStatus={defectTarget?.targetStatus || 'TODO'}
          onClose={() => setDefectTarget(null)}
          onConfirm={handleConfirmDefect}
        />
      )}

      {/* DELETE TASK CONFIRMATION MODAL */}
      {deleteTarget && (
        <DeleteTaskModal
          isOpen={!!deleteTarget}
          task={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default ProjectKanbanPage;
