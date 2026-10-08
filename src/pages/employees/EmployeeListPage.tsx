import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Employee, EmployeeFiltersState } from '../../types/employees';
import { EmployeeSummaryCards } from '../../components/employees/EmployeeSummaryCards';
import { EmployeeToolbar } from '../../components/employees/EmployeeToolbar';
import { EmployeeFilters } from '../../components/employees/EmployeeFilters';
import { EmployeeTable, SortField, SortOrder } from '../../components/employees/EmployeeTable';
import { EmployeeCard } from '../../components/employees/EmployeeCard';
import { EmployeeDetails } from '../../components/employees/EmployeeDetails';
import { AddEmployeeModal } from '../../components/employees/AddEmployeeModal';
import { DeactivateEmployeeModal } from '../../components/employees/DeactivateEmployeeModal';
import { ResetPasswordModal } from '../../components/employees/ResetPasswordModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import {
  Users,
  CheckCircle2,
  RefreshCw,
  Loader2,
  UserPlus,
  SearchX,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import * as employeeService from '../../services/employeeService';
import { EmployeeSummaryData } from '../../services/employeeService';

const INITIAL_FILTERS: EmployeeFiltersState = {
  searchQuery: '',
  department: '',
  role: '',
  status: 'active_pool', // Default to active operational force (Active, On Leave - excludes Inactive and Suspended)
  employmentType: '',
  manager: '',
  workStatus: '',
  crmAccess: '',
};

export const EmployeeListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [summary, setSummary] = useState<EmployeeSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<EmployeeFiltersState>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Server-side pagination states (default 25 records per page)
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Drawer & Modal states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<Employee | null>(null);
  const [resettingPasswordEmployee, setResettingPasswordEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadSummary = useCallback(async () => {
    try {
      const data = await employeeService.fetchEmployeeSummary();
      setSummary(data);
    } catch (err) {
      console.error('[EmployeeListPage] Error loading summary:', err);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await employeeService.fetchEmployees({
        search: filters.searchQuery || undefined,
        department: filters.department || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        workStatus: filters.workStatus || undefined,
        crmAccess: filters.crmAccess || undefined,
        employmentType: filters.employmentType || undefined,
        manager: filters.manager || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: sortField,
        sortDirection: sortOrder,
      });

      setEmployees(res.content || []);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);

      const empId = searchParams.get('employeeId');
      if (empId) {
        const found = res.content.find((e) => e.id === empId || e.employeeCode === empId);
        if (found) setSelectedEmployee(found);
      }
    } catch (err) {
      console.error('[EmployeeListPage] Error loading employees:', err);
      showToast('Failed to load employees from server');
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize, sortField, sortOrder, searchParams]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(0);
  };

  const handleFilterChange = (newFilters: EmployeeFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleSearchChange = (q: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: q }));
    setCurrentPage(0);
  };

  const handleTabChange = (statusKey: string) => {
    setFilters((prev) => ({ ...prev, status: statusKey, workStatus: '' }));
    setCurrentPage(0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.department ||
    filters.role ||
    (filters.status && filters.status !== 'active_pool') ||
    filters.workStatus ||
    filters.crmAccess ||
    filters.employmentType ||
    filters.manager
  );

  // Card click filter shortcut
  const handleSummaryCardClick = (statusKey: string) => {
    if (statusKey === 'all') {
      handleTabChange('all');
    } else if (statusKey === 'Working') {
      setFilters((prev) => ({ ...prev, status: 'all', workStatus: 'Working' }));
      setCurrentPage(0);
    } else if (statusKey === 'Active') {
      handleTabChange('Active');
    } else if (statusKey === 'Inactive') {
      handleTabChange('Inactive');
    } else if (statusKey === 'Present') {
      handleTabChange('all');
    } else {
      handleTabChange(statusKey);
    }
  };

  // Handle Save (Add or Edit)
  const handleSaveEmployee = async (empData: Partial<Employee>) => {
    try {
      if (editingEmployee) {
        // Edit existing
        const updated = await employeeService.updateEmployee(editingEmployee.id, empData);
        if (updated) {
          showToast(`Updated employee profile for ${updated.name}`);
        } else {
          showToast('Employee updated successfully');
        }
        setEditingEmployee(null);
        setIsAddModalOpen(false);
        await Promise.all([loadEmployees(), loadSummary()]);
      } else {
        // Add new
        const created = await employeeService.createEmployee(empData);
        if (created) {
          showToast(`Added new employee ${created.name} (${created.employeeCode})`);
        } else {
          showToast('Employee added successfully');
        }
        setIsAddModalOpen(false);
        await Promise.all([loadEmployees(), loadSummary()]);
      }
    } catch (err: any) {
      console.error('[EmployeeListPage] Save error:', err);
      showToast(err.message || 'Failed to save employee profile');
    }
  };

  // Deactivate handler
  const handleConfirmDeactivate = async (emp: Employee) => {
    try {
      await employeeService.updateEmployeeStatus(emp.id, 'Inactive');
      showToast(`Deactivated ${emp.name}. Past CRM records preserved.`);
      setDeactivatingEmployee(null);
      if (selectedEmployee?.id === emp.id) {
        setSelectedEmployee((prev) => (prev ? { ...prev, status: 'Inactive', workStatus: 'Logged Out' } : null));
      }
      await Promise.all([loadEmployees(), loadSummary()]);
    } catch (err) {
      console.error('[EmployeeListPage] Deactivation failed:', err);
      showToast('Failed to deactivate employee');
    }
  };

  // Soft Delete handler
  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    try {
      const ok = await employeeService.deleteEmployee(deletingEmployee.id);
      if (ok) {
        showToast(`Employee ${deletingEmployee.name} (${deletingEmployee.employeeCode}) soft-deleted successfully.`);
        if (selectedEmployee?.id === deletingEmployee.id) {
          setSelectedEmployee(null);
        }
        setDeletingEmployee(null);
        await Promise.all([loadEmployees(), loadSummary()]);
      } else {
        showToast('Failed to delete employee. Please try again.');
      }
    } catch (err: any) {
      console.error('[EmployeeListPage] Delete failed:', err);
      showToast(err.message || 'Error soft-deleting employee');
    }
  };

  // Activate handler
  const handleActivate = async (emp: Employee) => {
    try {
      await employeeService.updateEmployeeStatus(emp.id, 'Active');
      showToast(`Activated ${emp.name}. Employee can now log in and take assignments.`);
      if (selectedEmployee?.id === emp.id) {
        setSelectedEmployee((prev) => (prev ? { ...prev, status: 'Active', workStatus: 'Working' } : null));
      }
      await Promise.all([loadEmployees(), loadSummary()]);
    } catch (err) {
      console.error('[EmployeeListPage] Activation failed:', err);
      showToast('Failed to activate employee');
    }
  };

  // Export CSV of filtered list (fetches full filtered dataset)
  const handleExport = async () => {
    try {
      showToast('Preparing export...');
      const fullRes = await employeeService.fetchEmployees({
        search: filters.searchQuery || undefined,
        department: filters.department || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        workStatus: filters.workStatus || undefined,
        crmAccess: filters.crmAccess || undefined,
        employmentType: filters.employmentType || undefined,
        manager: filters.manager || undefined,
        page: 0,
        size: 2000,
        sortBy: sortField,
        sortDirection: sortOrder,
      });

      const records = fullRes.content || [];
      const headers = [
        'Employee Code',
        'Name',
        'Department',
        'Role',
        'Status',
        'Work Status',
        'Email',
        'Phone',
        'Reporting Manager',
        'Joining Date',
        'Assigned Leads',
        'Open Follow-ups',
        'Achieved Revenue (INR)',
      ];

      const rows = records.map((e) => [
        e.employeeCode,
        `"${e.name}"`,
        `"${e.department}"`,
        `"${e.role}"`,
        e.status,
        e.workStatus,
        e.email,
        e.phone,
        `"${e.reportingManager}"`,
        e.joiningDate,
        e.workload?.assignedLeads || 0,
        e.workload?.openFollowUps || 0,
        e.targets?.achievedRevenue || 0,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `TechnoKraft_Employees_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported ${records.length} employees to CSV`);
    } catch (err) {
      console.error('[EmployeeListPage] Export error:', err);
      showToast('Failed to export employee records');
    }
  };

  // Calculate pagination boundaries
  const fromRecord = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const toRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers array with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push('...');
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div id="crm-employees-page" className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Employees
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {summary?.total ?? totalElements} Staff Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage company employees, CRM system access, active pipeline workloads and monthly quota targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              loadEmployees();
              loadSummary();
            }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Refresh employee data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingEmployee(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Using global summary data) */}
      <EmployeeSummaryCards
        employees={employees}
        summary={summary}
        selectedFilter={filters.status || (filters.workStatus ? 'Working' : 'active_pool')}
        onSelectFilter={handleSummaryCardClick}
      />

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-850 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('active_pool')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filters.status === 'active_pool' || (!filters.status && !filters.workStatus)
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active Staff (Default)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px]">
            {filters.status === 'active_pool' ? totalElements : (summary?.active ?? 0)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filters.status === 'all'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>All Roster</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
            {summary?.total ?? totalElements}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('On Leave')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filters.status === 'On Leave'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>On Leave</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('Inactive')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filters.status === 'Inactive'
              ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Deactivated / Inactive</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px]">
            {summary?.inactive ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('Suspended')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filters.status === 'Suspended'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Suspended</span>
        </button>
      </div>

      {/* Toolbar */}
      <EmployeeToolbar
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFilterCount={
          [
            filters.department,
            filters.role,
            filters.status && filters.status !== 'active_pool' ? filters.status : '',
            filters.workStatus,
            filters.crmAccess,
            filters.employmentType,
            filters.manager,
          ].filter(Boolean).length
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddEmployee={() => {
          setEditingEmployee(null);
          setIsAddModalOpen(true);
        }}
        onExport={handleExport}
      />

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <EmployeeFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={() => handleFilterChange(INITIAL_FILTERS)}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin mx-auto mb-2" />
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            Loading Live Employee Directory...
          </p>
        </div>
      ) : employees.length === 0 ? (
        /* Empty State */
        <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center relative overflow-hidden shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center mx-auto mb-4">
            {hasActiveFilters ? (
              <SearchX className="w-8 h-8 text-amber-500" />
            ) : (
              <Users className="w-8 h-8 text-[#5B4DB7] dark:text-purple-400" />
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {hasActiveFilters ? 'No Matching Employees Found' : 'No Employees in Database'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
            {hasActiveFilters
              ? 'No employee profiles match your active filters or search term. Try resetting the filters.'
              : 'Your employee directory is empty. Click below to add your first employee to the CRM.'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => handleFilterChange(INITIAL_FILTERS)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditingEmployee(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>
      ) : (
        /* View Content: Table or Cards with Server Pagination */
        <div className="space-y-4">
          {viewMode === 'table' ? (
            <div className="hidden md:block">
              <EmployeeTable
                employees={employees}
                onView={(emp) => setSelectedEmployee(emp)}
                onEdit={(emp) => {
                  setEditingEmployee(emp);
                  setIsAddModalOpen(true);
                }}
                onResetPassword={(emp) => setResettingPasswordEmployee(emp)}
                onViewPerformance={(emp) => setSelectedEmployee(emp)}
                onViewAttendance={(emp) => setSelectedEmployee(emp)}
                onDeactivate={(emp) => setDeactivatingEmployee(emp)}
                onActivate={handleActivate}
                onDelete={(emp) => setDeletingEmployee(emp)}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
          ) : null}

          {/* Card Grid View (shown on mobile or when card mode selected) */}
          <div className={viewMode === 'table' ? 'md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
            {employees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onSelect={(e) => setSelectedEmployee(e)}
                onEdit={(e) => {
                  setEditingEmployee(e);
                  setIsAddModalOpen(true);
                }}
                onResetPassword={(e) => setResettingPasswordEmployee(e)}
                onDeactivate={(e) => setDeactivatingEmployee(e)}
                onActivate={handleActivate}
                onDelete={(e) => setDeletingEmployee(e)}
              />
            ))}
          </div>

          {/* Server-Side Pagination Footer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-xs">
            {/* Left: Counter info */}
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="font-semibold text-slate-900 dark:text-white font-mono">{fromRecord}</strong> to{' '}
                <strong className="font-semibold text-slate-900 dark:text-white font-mono">{toRecord}</strong> of{' '}
                <strong className="font-semibold text-slate-900 dark:text-white font-mono">{totalElements}</strong> employees
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
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25 (Default)</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0 || isLoading}
                  title="First Page"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                {/* Prev Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0 || isLoading}
                  title="Previous Page"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
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
                        disabled={isLoading}
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
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  title="Next Page"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(0, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  title="Last Page"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in Details Drawer for Selected Employee */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
            <EmployeeDetails
              employee={selectedEmployee}
              onClose={() => setSelectedEmployee(null)}
              onEdit={(emp) => {
                setEditingEmployee(emp);
                setIsAddModalOpen(true);
              }}
              onResetPassword={(emp) => setResettingPasswordEmployee(emp)}
              onDeactivate={(emp) => setDeactivatingEmployee(emp)}
              onActivate={handleActivate}
              onDelete={(emp) => setDeletingEmployee(emp)}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        initialEmployee={editingEmployee}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={!!resettingPasswordEmployee}
        employee={resettingPasswordEmployee}
        onClose={() => setResettingPasswordEmployee(null)}
        onSuccess={(updated) => {
          showToast(`Login password updated successfully for ${updated.name}`);
          if (selectedEmployee?.id === updated.id) {
            setSelectedEmployee(updated);
          }
          loadEmployees();
          loadSummary();
        }}
      />

      {/* Deactivate Employee Modal */}
      <DeactivateEmployeeModal
        isOpen={!!deactivatingEmployee}
        employee={deactivatingEmployee}
        onClose={() => setDeactivatingEmployee(null)}
        onConfirm={handleConfirmDeactivate}
      />

      {/* Soft Delete Employee Confirmation Modal */}
      {deletingEmployee && (
        <ConfirmationModal
          isOpen={!!deletingEmployee}
          title="Soft Delete Employee"
          message={`Are you sure you want to soft delete ${deletingEmployee.name} (${deletingEmployee.employeeCode})? Their account status will be changed to Inactive and removed from the active employee directory, while preserving historical audit logs and CRM data.`}
          confirmLabel="Soft Delete Employee"
          cancelLabel="Cancel"
          variant="danger"
          iconType="trash"
          itemDetails={[
            { label: 'Employee Name', value: deletingEmployee.name },
            { label: 'Employee Code', value: deletingEmployee.employeeCode },
            { label: 'Department', value: deletingEmployee.department },
            { label: 'Current Role', value: deletingEmployee.role },
          ]}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingEmployee(null)}
        />
      )}
    </div>
  );
};
