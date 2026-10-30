import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Users,
  Kanban,
  Layers,
  ArrowRight,
  Briefcase,
  Calendar,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  IndianRupee,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DeliveryProjectRecord, ProjectSummaryRecord } from '../../types/projects';
import { fetchProjectsPaginated, fetchProjectSummary, deleteProject } from '../../services/projectService';
import { CreateProjectModal } from '../../components/projects/CreateProjectModal';
import { EditProjectModal } from '../../components/projects/EditProjectModal';
import { EmployeeAvatar } from '../../components/common/EmployeeAvatar';

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DeliveryProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Server-Side Pagination State (0-indexed for Spring Data)
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(9);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Global KPI Summary from Server
  const [summary, setSummary] = useState<ProjectSummaryRecord | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit & Delete modal states
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<DeliveryProjectRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<DeliveryProjectRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenEdit = (project: DeliveryProjectRecord) => {
    setSelectedProjectForEdit(project);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (project: DeliveryProjectRecord) => {
    setProjectToDelete(project);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteProject(projectToDelete.id);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      await loadProjects();
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setDeleteError(err?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProjectUpdated = (updatedProject: DeliveryProjectRecord) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? { ...p, ...updatedProject } : p))
    );
    loadProjects();
  };

  // Load paginated projects and global aggregates
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pagedRes, summaryRes] = await Promise.all([
        fetchProjectsPaginated({
          page: currentPage,
          size: pageSize,
          search: searchTerm,
          status: statusFilter,
          sortBy,
          sortDirection,
        }),
        fetchProjectSummary().catch(() => null),
      ]);

      setProjects(pagedRes.content || []);
      setTotalElements(pagedRes.totalElements || 0);
      setTotalPages(Math.max(1, pagedRes.totalPages || 1));
      if (summaryRes) {
        setSummary(summaryRes);
      }
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, sortBy, sortDirection]);

  // Live debounced search & filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(0);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const [newSortBy, newDir] = val.split(':');
    setSortBy(newSortBy);
    setSortDirection((newDir as 'asc' | 'desc') || 'desc');
    setCurrentPage(0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSortBy('createdAt');
    setSortDirection('desc');
    setCurrentPage(0);
  };

  // KPI counts: prefer global summary from server
  const kpiTotal = summary?.total ?? totalElements;
  const kpiInDev = summary?.inDevelopment ?? projects.filter((p) => p.status === 'ACTIVE' || p.status === 'PLANNING').length;
  const kpiInReview = summary?.inReview ?? projects.filter((p) => p.status === 'CLIENT_REVIEW').length;
  const kpiCompleted = summary?.completed ?? projects.filter((p) => p.status === 'COMPLETED').length;

  // Pagination display counters
  const fromRecord = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const toRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate numbered pages with ellipses (...)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push('...');
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            In Development
          </span>
        );
      case 'PLANNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Planning & Architecture
          </span>
        );
      case 'CLIENT_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            QA & Client Review
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3 h-3 stroke-[3]" />
            Delivered / Live
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            On Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  const isFiltered = searchTerm.trim() !== '' || statusFilter !== 'ALL' || sortBy !== 'createdAt' || sortDirection !== 'desc';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Projects"
        description="Monitor client deliverables, Jira-style task execution, and team progress from Closed Won deals."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadProjects}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Refresh projects list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/projects/board"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Kanban className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span>Kanban Board</span>
            </Link>
            <Link
              to="/work/my-tasks"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>My Work</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-xl transition-all shadow-xs cursor-pointer hover:shadow-md"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Project</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Overview with Quick-Filter Clicking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => handleStatusFilter('ALL')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-white dark:bg-slate-900 border-[#5B4DB7] ring-2 ring-[#5B4DB7]/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Active Projects</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {kpiTotal}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Initiated from Closed Won deals</p>
        </div>

        <div
          onClick={() => handleStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
            statusFilter === 'ACTIVE' || statusFilter === 'PLANNING'
              ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">In Development</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {kpiInDev}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Assigned to Devs & Interns</p>
        </div>

        <div
          onClick={() => handleStatusFilter(statusFilter === 'CLIENT_REVIEW' ? 'ALL' : 'CLIENT_REVIEW')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
            statusFilter === 'CLIENT_REVIEW'
              ? 'bg-white dark:bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">QA & Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {kpiInReview}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Awaiting internal test sign-off</p>
        </div>

        <div
          onClick={() => handleStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
            statusFilter === 'COMPLETED'
              ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Delivered / Live</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {kpiCompleted}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Completed & client verified</p>
        </div>
      </div>

      {/* Filter, Search, and Sort Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by client, name, code..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters, Sorting, and Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNING">Planning & Architecture</option>
              <option value="ACTIVE">In Development</option>
              <option value="CLIENT_REVIEW">Client Review / QA</option>
              <option value="COMPLETED">Delivered / Live</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
            <select
              value={`${sortBy}:${sortDirection}`}
              onChange={handleSortChange}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
              <option value="projectCode:asc">Code (Asc)</option>
              <option value="projectCode:desc">Code (Desc)</option>
              <option value="targetDate:asc">Due Date (Earliest)</option>
              <option value="budget:desc">Budget (High to Low)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Project Grid / Content with Server-Side Pagination */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading delivery projects...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-6 text-center">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">Failed to load projects</h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
          <button
            type="button"
            onClick={loadProjects}
            className="mt-3 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-2xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center mx-auto shadow-inner">
              <Briefcase className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Delivery Projects Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isFiltered
                  ? 'No projects match your active search or filter criteria. Try clearing filters.'
                  : 'When a sales opportunity reaches Closed Won, you can automatically initiate a delivery project, or create one manually now.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              {isFiltered ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Clear All Filters</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Create New Project</span>
                  </button>
                  <Link
                    to="/opportunities/pipeline"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <span>View Sales Pipeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Projects Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const totalTasks = project.totalTasks || 0;
              const completedTasks = project.completedTasks || 0;
              const progressPct =
                totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-[#5B4DB7]/40"
                >
                  {/* Card Header & Content */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
                        {project.projectCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(project.status)}
                        <div className="flex items-center ml-1 border-l border-slate-200 dark:border-slate-800 pl-1.5 gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(project);
                            }}
                            className="p-1 text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Edit project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDelete(project);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#5B4DB7] transition-colors cursor-pointer line-clamp-1"
                        title={project.name}
                      >
                        {project.name}
                      </h3>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{project.companyName || project.clientName || 'Direct Client'}</span>
                        </p>
                        {project.budget !== undefined && project.budget !== null && project.budget > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/60 shrink-0 font-mono"
                            title="Project Budget"
                          >
                            <IndianRupee className="w-2.5 h-2.5 stroke-[2.5]" />
                            <span>{project.budget.toLocaleString('en-IN')}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-2 rounded-xl">
                        {project.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Sprint Delivery</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {progressPct}% ({completedTasks}/{totalTasks} tasks)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#5B4DB7] to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata Chips */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Due: {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 min-w-0"
                        title={`PM: ${project.projectManagerName || 'Unassigned'}`}
                      >
                        {project.projectManagerName ? (
                          <EmployeeAvatar
                            name={project.projectManagerName}
                            avatar={project.projectManagerAvatar}
                            size="xs"
                            className="shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate font-medium">PM: {project.projectManagerName || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Buttons */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      to={`/projects/${project.id}/board`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-xl transition-colors cursor-pointer"
                    >
                      <Kanban className="w-3.5 h-3.5" />
                      <span>Board</span>
                    </Link>

                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#5B4DB7] dark:hover:text-[#5B4DB7] transition-colors"
                    >
                      <span>View Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Server-Side Pagination Footer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
            {/* Left: Counter info */}
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="font-semibold text-slate-900 dark:text-white font-mono">{fromRecord}</strong> to{' '}
                <strong className="font-semibold text-slate-900 dark:text-white font-mono">{toRecord}</strong> of{' '}
                <strong className="font-semibold text-slate-900 dark:text-white font-mono">{totalElements}</strong> projects
              </span>
            </div>

            {/* Right: Controls & Page numbers */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Page Size Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0 || loading}
                  title="First Page"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                {/* Prev Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0 || loading}
                  title="Previous Page"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span key={`dots-${idx}`} className="px-1 text-slate-400 select-none text-xs">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(p);
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#5B4DB7] text-white shadow-xs'
                            : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1 || loading}
                  title="Next Page"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(0, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1 || loading}
                  title="Last Page"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            loadProjects();
          }}
        />
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && selectedProjectForEdit && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProjectForEdit(null);
          }}
          project={selectedProjectForEdit}
          onUpdated={handleProjectUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Project</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete this project?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-900">
                  {projectToDelete.projectCode}
                </span>
                <span className="font-bold text-slate-900 dark:text-white truncate">{projectToDelete.name}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Client: {projectToDelete.companyName || 'N/A'}
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{deleteError}</span>
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This action will soft-delete the project and archive all associated data from active delivery views.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProjectToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsListPage;
