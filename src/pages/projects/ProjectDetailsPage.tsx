import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  FolderKanban,
  Kanban,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  IndianRupee,
  Plus,
  ArrowLeft,
  ExternalLink,
  Github,
  Globe,
  Figma,
  FileText,
  AlertCircle,
  Briefcase,
  Layers,
  CheckSquare,
  ShieldAlert,
  Loader2,
  UserPlus,
  Trash2,
  Edit3,
  TrendingUp,
} from 'lucide-react';
import {
  DeliveryProjectRecord,
  ProjectMemberRecord,
  ProjectTaskRecord,
  TaskStatus,
} from '../../types/projects';
import {
  fetchProjectById,
  fetchProjectMembers,
  addProjectMember,
  removeProjectMember,
  updateProject,
  deleteProject,
} from '../../services/projectService';
import { fetchProjectTasks } from '../../services/taskService';
import { fetchEmployees } from '../../services/employeeService';
import { Employee } from '../../types/employees';
import { CreateTaskModal } from '../../components/projects/CreateTaskModal';
import { TaskDetailsModal } from '../../components/projects/TaskDetailsModal';
import { EditProjectModal } from '../../components/projects/EditProjectModal';
import { EmployeeAvatar } from '../../components/common/EmployeeAvatar';
import { EmployeeSelect } from '../../components/common/EmployeeSelect';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<DeliveryProjectRecord | null>(null);
  const [members, setMembers] = useState<ProjectMemberRecord[]>([]);
  const [tasks, setTasks] = useState<ProjectTaskRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'team' | 'overview'>('tasks');

  // Modals
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTaskRecord | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState('DEVELOPER');
  const [submittingMember, setSubmittingMember] = useState(false);

  // Filters for tasks tab
  const [taskFilterStatus, setTaskFilterStatus] = useState('ALL');
  const [taskFilterType, setTaskFilterType] = useState('ALL');
  const [taskSearch, setTaskSearch] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [projData, membersData, tasksData, empData] = await Promise.all([
        fetchProjectById(id),
        fetchProjectMembers(id),
        fetchProjectTasks(id),
        fetchEmployees({ status: 'Active', size: 200 }).catch(() => ({ content: [] })),
      ]);
      setProject(projData);
      setMembers(membersData);
      setTasks(tasksData);
      setEmployees(empData.content || []);
    } catch (err: any) {
      console.error('Failed to load project details:', err);
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!project || !id) return;
    try {
      const updated = await updateProject(id, { status: newStatus as any });
      setProject(updated);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedEmployeeId) {
      alert('Please select an active employee or intern.');
      return;
    }
    try {
      setSubmittingMember(true);
      await addProjectMember(id, Number(selectedEmployeeId), selectedRole);
      await loadData();
      setIsAddMemberOpen(false);
      setSelectedEmployeeId('');
    } catch (err: any) {
      alert('Failed to add team member: ' + err.message);
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleRemoveMember = async (member: ProjectMemberRecord) => {
    if (!id) return;
    if (!window.confirm(`Are you sure you want to remove ${member.employeeName} from the project?`)) return;
    try {
      if (member.id && member.id > 0) {
        await removeProjectMember(id, member.id);
      }
      await loadData();
    } catch (err: any) {
      alert('Failed to remove member: ' + err.message);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !id) return;
    if (!window.confirm(`Are you sure you want to delete project "${project.name}" (${project.projectCode})?`)) return;
    try {
      setIsDeletingProject(true);
      await deleteProject(id);
      navigate('/projects');
    } catch (err: any) {
      alert('Failed to delete project: ' + err.message);
    } finally {
      setIsDeletingProject(false);
    }
  };

  // Merge explicit members from project_members with any task assignees and project manager
  const combinedMembers = useMemo(() => {
    const memberMap = new Map<number, ProjectMemberRecord>();

    // 1. Add members from backend project_members
    members.forEach((m) => {
      if (m.employeeId) {
        memberMap.set(m.employeeId, { ...m });
      }
    });

    // 2. Ensure Project Manager is included if present
    if (project?.projectManagerId && !memberMap.has(project.projectManagerId)) {
      memberMap.set(project.projectManagerId, {
        id: -project.projectManagerId,
        projectId: project.id,
        employeeId: project.projectManagerId,
        employeeName: project.projectManagerName || 'Project Manager',
        employeeAvatar: project.projectManagerAvatar,
        projectRole: 'PROJECT_MANAGER',
        assignedDate: project.createdAt || new Date().toISOString(),
        isActive: true,
      });
    }

    // 3. Ensure all task assignees are included
    tasks.forEach((t) => {
      if (t.assigneeId && !t.isDeleted) {
        if (!memberMap.has(t.assigneeId)) {
          const emp = employees.find((e) => e.id === t.assigneeId);
          memberMap.set(t.assigneeId, {
            id: -t.assigneeId,
            projectId: project?.id || (id ? Number(id) : 0),
            employeeId: t.assigneeId,
            employeeName: t.assigneeName || emp?.name || 'Assignee',
            employeeAvatar: t.assigneeAvatar || emp?.avatar,
            employeeEmail: emp?.email,
            employeeCode: emp?.employeeCode,
            projectRole: t.assigneeRole || (emp?.role?.toUpperCase().includes('INTERN') ? 'INTERN' : 'DEVELOPER'),
            assignedDate: t.createdAt || new Date().toISOString(),
            isActive: true,
          });
        }
      }
    });

    // 4. Calculate task counts accurately for each member
    return Array.from(memberMap.values()).map((m) => {
      const activeTasks = tasks.filter(
        (t) => t.assigneeId === m.employeeId && !t.isDeleted && t.status !== 'COMPLETED'
      ).length;
      return {
        ...m,
        activeTaskCount: activeTasks,
      };
    });
  }, [members, project, tasks, employees, id]);

  const filteredTasks = tasks.filter((t) => {
    if (taskFilterStatus !== 'ALL' && t.status !== taskFilterStatus) return false;
    if (taskFilterType !== 'ALL' && t.taskType !== taskFilterType) return false;
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      const matchKey = t.taskKey?.toLowerCase().includes(q);
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchAssignee = t.assigneeName?.toLowerCase().includes(q);
      if (!matchKey && !matchTitle && !matchAssignee) return false;
    }
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center space-y-3 shadow-2xs">
        <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Loading project hub...
        </p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B4DB7] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-6 text-center">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
            Project Not Found
          </h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
            {error || 'The requested delivery project could not be located.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#5B4DB7] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Delivery Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditProjectOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#5B4DB7]" />
            <span>Edit Project</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteProject}
            disabled={isDeletingProject}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <Link
            to={`/projects/${project.id}/board`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-xl transition-colors shadow-2xs"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsCreateTaskOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-xl transition-all shadow-xs cursor-pointer hover:shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Project Master Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-900">
                {project.projectCode}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {project.companyName || project.clientName || 'Direct Client'}
              </span>
              {project.opportunityCode && (
                <Link
                  to={`/opportunities/${project.opportunityId}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md hover:underline"
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Deal {project.opportunityCode}</span>
                </Link>
              )}
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {project.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Project Status:
            </span>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-[#5B4DB7] dark:text-purple-300 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            >
              <option value="PLANNING">Planning & Architecture</option>
              <option value="ACTIVE">In Development</option>
              <option value="CLIENT_REVIEW">QA & Client Review</option>
              <option value="COMPLETED">Delivered / Live</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
        </div>

        {/* Quick External Links (Repository, Figma, Staging) */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap text-xs">
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#5B4DB7] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Git Repository</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
          {project.figmaUrl && (
            <a
              href={project.figmaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#5B4DB7] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Figma className="w-3.5 h-3.5 text-rose-500" />
              <span>UI/UX Designs</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
          {project.stagingUrl && (
            <a
              href={project.stagingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#5B4DB7] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>Staging Preview</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Delivery Target</span>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'TBD'}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Sprint Progress</span>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {progressPercent}% ({completedCount}/{tasks.length} tasks)
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Team Allocation</span>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {combinedMembers.length} Members & Interns
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
            {project.projectManagerName ? (
              <EmployeeAvatar
                name={project.projectManagerName}
                avatar={project.projectManagerAvatar}
                size="sm"
                className="shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : null}
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 block">Project Manager</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {project.projectManagerName || 'Unassigned'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-[#5B4DB7] text-[#5B4DB7] dark:text-purple-300'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Work Tasks ({tasks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'team'
              ? 'border-[#5B4DB7] text-[#5B4DB7] dark:text-purple-300'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Allocation & Interns ({combinedMembers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#5B4DB7] text-[#5B4DB7] dark:text-purple-300'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Architecture & Brief</span>
        </button>
      </div>

      {/* TAB CONTENT: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Search tasks by key, title, or assignee..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full sm:w-72 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={taskFilterStatus}
                onChange={(e) => setTaskFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Statuses</option>
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="INTERNAL_REVIEW">Internal Review</option>
                <option value="QA_TESTING">QA Testing</option>
                <option value="CLIENT_REVIEW">Client Review</option>
                <option value="DEPLOYMENT">Deployment</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={taskFilterType}
                onChange={(e) => setTaskFilterType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Types</option>
                <option value="FEATURE">Feature</option>
                <option value="BUG">Bug / Defect</option>
                <option value="TASK">Task</option>
                <option value="SUBTASK">Subtask</option>
                <option value="SPIKE">Tech Spike</option>
              </select>

              <button
                type="button"
                onClick={() => setIsCreateTaskOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-xl transition-colors shadow-2xs cursor-pointer ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Tasks Table */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-10 text-center shadow-2xs space-y-3">
              <CheckSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No tasks found</h4>
              <p className="text-xs text-slate-500">Create a task to assign work to interns and developers.</p>
              <button
                type="button"
                onClick={() => setIsCreateTaskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] rounded-xl shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Key</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Est. Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredTasks.map((task) => (
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
                      <td className="px-4 py-3">
                        {task.assigneeName ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5B4DB7] text-[10px] font-bold flex items-center justify-center">
                              {task.assigneeName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[120px]">{task.assigneeName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : task.priority === 'MEDIUM'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: TEAM & INTERNS */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Assigned Team & Intern Roster
              </h3>
              <p className="text-xs text-slate-500">
                Allocate developers, interns, QA testers, and UI/UX designers to this project.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Assign Member / Intern</span>
            </button>
          </div>

          {combinedMembers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-10 text-center shadow-2xs space-y-3">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No team members allocated</h4>
              <p className="text-xs text-slate-500">Assign developers, interns, or leads to start collaborating on tasks.</p>
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] rounded-xl shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Assign Member / Intern</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {combinedMembers.map((member) => {
                const isPM = (project && project.projectManagerId === member.employeeId) || member.projectRole === 'PROJECT_MANAGER';
                return (
                  <div
                    key={`${member.id}-${member.employeeId}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <EmployeeAvatar
                        name={member.employeeName}
                        avatar={member.employeeAvatar}
                        size="md"
                        className="shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {member.employeeName}
                          </h4>
                          {isPM && (
                            <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                              PM
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            member.projectRole === 'PROJECT_MANAGER'
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300'
                              : member.projectRole === 'INTERN'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : member.projectRole === 'QA_ENGINEER'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : member.projectRole === 'UI_UX_DESIGNER'
                              ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300'
                              : member.projectRole === 'TECH_LEAD'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {member.projectRole}
                          </span>
                          {member.activeTaskCount !== undefined && member.activeTaskCount > 0 && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {member.activeTaskCount} {member.activeTaskCount === 1 ? 'task' : 'tasks'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isPM && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                        title="Remove from project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ARCHITECTURE & BRIEF */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5B4DB7]" />
              <span>Scope of Work & Requirements</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {project.description || 'No detailed scope of work provided for this project.'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5B4DB7]" />
              <span>Project Metadata & Commercials</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contract / Budget Value:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-0.5 font-mono">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span>{project.budget ? project.budget.toLocaleString('en-IN') : '0'}</span>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Start Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not Set'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Estimated Delivery Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'Not Set'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Linked Opportunity:</span>
                <span className="font-semibold text-[#5B4DB7]">
                  {project.opportunityCode || 'Direct Project'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TEAM MEMBER */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150 overflow-visible relative">
            <div className="px-5 py-4 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/50 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple-950 dark:text-purple-200">
                Assign Team Member / Intern
              </h3>
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-5 space-y-4 text-xs overflow-visible">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Select Employee / Intern <span className="text-rose-500">*</span>
                </label>
                <EmployeeSelect
                  value={selectedEmployeeId ? String(selectedEmployeeId) : ''}
                  valueField="id"
                  align="full"
                  placeholder="Search active employee or intern..."
                  allowEmpty={false}
                  onSelectEmployee={(emp) => {
                    if (emp) {
                      setSelectedEmployeeId(emp.id);
                      if (emp.role) {
                        const r = emp.role.toUpperCase();
                        if (r.includes('INTERN')) setSelectedRole('INTERN');
                        else if (r.includes('QA') || r.includes('TEST')) setSelectedRole('QA_ENGINEER');
                        else if (r.includes('DESIGN') || r.includes('UI')) setSelectedRole('UI_UX_DESIGNER');
                        else if (r.includes('LEAD')) setSelectedRole('TECH_LEAD');
                        else if (r.includes('PM') || r.includes('MANAGER')) setSelectedRole('PROJECT_MANAGER');
                        else setSelectedRole('DEVELOPER');
                      }
                    } else {
                      setSelectedEmployeeId('');
                    }
                  }}
                  onChange={(e: any) => {
                    const val = typeof e === 'string' ? e : e?.target?.value;
                    setSelectedEmployeeId(val ? Number(val) : '');
                  }}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Project Role <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                >
                  <option value="DEVELOPER">Developer</option>
                  <option value="INTERN">Intern</option>
                  <option value="TECH_LEAD">Tech Lead</option>
                  <option value="QA_ENGINEER">QA Engineer</option>
                  <option value="UI_UX_DESIGNER">UI/UX Designer</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMember}
                  className="px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {submittingMember ? 'Assigning...' : 'Assign to Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROJECT MODAL */}
      {isEditProjectOpen && project && (
        <EditProjectModal
          isOpen={isEditProjectOpen}
          onClose={() => setIsEditProjectOpen(false)}
          project={project}
          onUpdated={(updated) => {
            setProject(updated);
            loadData();
          }}
        />
      )}

      {/* CREATE TASK MODAL */}
      {isCreateTaskOpen && (
        <CreateTaskModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          defaultProjectId={project.id}
          onTaskCreated={() => {
            setIsCreateTaskOpen(false);
            loadData();
          }}
        />
      )}

      {/* TASK DETAILS DRAWER / MODAL */}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={!!selectedTask}
          taskId={selectedTask?.id || null}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;
