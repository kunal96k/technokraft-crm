import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Employee,
  AttendanceFiltersState,
  DailyAttendanceRecord,
} from '../../types/employees';
import * as employeeService from '../../services/employeeService';
import {
  fetchAttendanceRecords,
  fetchAttendanceSummary,
  AttendanceSummaryData,
} from '../../services/attendanceService';
import { AttendanceSummaryCards } from '../../components/attendance/AttendanceSummaryCards';
import { CurrentlyWorking } from '../../components/attendance/CurrentlyWorking';
import { AttendanceToolbar } from '../../components/attendance/AttendanceToolbar';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';
import { AttendanceCard } from '../../components/attendance/AttendanceCard';
import { AttendanceDetailsModal } from '../../components/attendance/AttendanceDetailsModal';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const INITIAL_ATTENDANCE_FILTERS: AttendanceFiltersState = {
  datePreset: 'Today',
  startDate: '',
  endDate: '',
  searchQuery: '',
  department: '',
  status: '',
  employeeId: '',
};

export const AttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Reference employees for Currently Working Reps and modal info
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Server-side attendance records & summary
  const [records, setRecords] = useState<DailyAttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummaryData | null>(null);

  // Pagination & Sorting state
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);

  // Filters state
  const [filters, setFilters] = useState<AttendanceFiltersState>(() => {
    const empParam = searchParams.get('employeeId');
    return {
      ...INITIAL_ATTENDANCE_FILTERS,
      employeeId: empParam || '',
    };
  });

  // Selected Employee for Attendance Details Modal
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState<Employee | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load employee roster for telemetry & detail lookups
  const loadEmployeesRoster = useCallback(async () => {
    try {
      const res = await employeeService.fetchEmployees({ size: 200 });
      setEmployees(res.content || []);
    } catch (err) {
      console.error('[AttendancePage] Failed to fetch employee roster:', err);
    }
  }, []);

  // Fetch Attendance Records from Spring Boot API with server-side pagination & filtering
  const loadAttendanceData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsTableLoading(true);
    }

    try {
      const isCustom = filters.datePreset === 'Custom Range';
      const customStart = isCustom && filters.startDate ? filters.startDate : undefined;
      const customEnd = isCustom && filters.endDate ? filters.endDate : undefined;

      const [recordsRes, summaryRes] = await Promise.all([
        fetchAttendanceRecords({
          page,
          size: pageSize,
          search: filters.searchQuery || undefined,
          department: filters.department || undefined,
          status: filters.status || undefined,
          employeeId: filters.employeeId || undefined,
          datePreset: filters.datePreset || undefined,
          startDate: customStart,
          endDate: customEnd,
          sortBy,
          sortDirection,
        }),
        fetchAttendanceSummary({
          department: filters.department || undefined,
          status: filters.status || undefined,
          datePreset: filters.datePreset || undefined,
          startDate: customStart,
          endDate: customEnd,
        }),
      ]);

      const totalElems =
        recordsRes.page?.totalElements ??
        recordsRes.totalElements ??
        recordsRes.content?.length ??
        0;
      const totalPgs =
        recordsRes.page?.totalPages ??
        recordsRes.totalPages ??
        Math.max(1, Math.ceil(totalElems / pageSize));

      setRecords(recordsRes.content || []);
      setTotalElements(totalElems);
      setTotalPages(Math.max(1, totalPgs));
      setSummary(summaryRes);
    } catch (err) {
      console.error('[AttendancePage] Failed to fetch server attendance:', err);
      showToast('Failed to load attendance records from server');
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  }, [page, pageSize, filters, sortBy, sortDirection]);

  // Initial load
  useEffect(() => {
    loadEmployeesRoster();
    loadAttendanceData(true);
  }, [loadEmployeesRoster, loadAttendanceData]);

  // Periodic background telemetry refresh (every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      loadAttendanceData(false);
    }, 30000);
    return () => clearInterval(timer);
  }, [loadAttendanceData]);

  // Auto-open modal if employeeId is present in URL params
  useEffect(() => {
    const empParam = searchParams.get('employeeId');
    if (!empParam) return;

    const findAndOpen = async () => {
      let emp = employees.find((e) => String(e.id) === String(empParam)) || null;
      if (!emp) {
        try {
          emp = await employeeService.fetchEmployeeById(empParam);
        } catch (err) {
          console.warn('[AttendancePage] Could not load employee for modal:', err);
        }
      }
      if (emp) {
        setSelectedEmployeeForModal(emp);
      }
    };
    findAndOpen();
  }, [searchParams, employees]);

  // Handle Sort Toggle
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  // Handle Filter Change (Resets to page 0)
  const handleFilterChange = (newFilters: AttendanceFiltersState) => {
    setFilters(newFilters);
    setPage(0);
  };

  // Handle summary card shortcut filter
  const handleSummaryCardFilter = (statusKey: string) => {
    setPage(0);
    if (statusKey === 'Working') {
      // Toggle back to all or view live working reps
      setFilters((prev) => ({
        ...prev,
        status: prev.status === '' ? '' : '',
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        status: prev.status === statusKey ? '' : statusKey,
      }));
    }
  };

  // Open modal from record
  const handleViewDetails = async (rec: DailyAttendanceRecord) => {
    let emp = employees.find((e) => String(e.id) === String(rec.employeeId)) || null;
    if (!emp && rec.employeeId) {
      try {
        emp = await employeeService.fetchEmployeeById(rec.employeeId);
      } catch {
        // Fallback to synthetic object
      }
    }

    if (emp) {
      setSelectedEmployeeForModal({
        ...emp,
        todayBreakTime: rec.breakTime || emp.todayBreakTime || '0m',
        todayWorkingTime: rec.workingHours || emp.todayWorkingTime,
        todayAttendanceStatus: rec.status || emp.todayAttendanceStatus,
        loginTime: rec.loginTime || emp.loginTime,
        logoutTime: rec.logoutTime || emp.logoutTime,
        currentActivity: rec.currentActivity || emp.currentActivity,
      });
    } else {
      // Construct lightweight fallback Employee object if not in database
      const fallbackEmp = {
        id: rec.employeeId,
        employeeCode: rec.employeeCode,
        name: rec.employeeName,
        firstName: rec.employeeName.split(' ')[0] || '',
        lastName: rec.employeeName.split(' ').slice(1).join(' ') || '',
        role: rec.employeeRole,
        department: rec.department,
        email: '',
        phone: '',
        avatar: rec.avatar,
        status: 'Active',
        employmentType: 'Full-time',
        joiningDate: rec.date,
        location: 'Nashik HQ',
        workStatus: rec.workStatus,
        todayAttendanceStatus: rec.status,
        todayWorkingTime: rec.workingHours,
        todayBreakTime: rec.breakTime || '0m',
        loginTime: rec.loginTime,
        logoutTime: rec.logoutTime,
        currentActivity: rec.currentActivity,
      } as unknown as Employee;
      setSelectedEmployeeForModal(fallbackEmp);
    }
  };

  // Export CSV
  const handleExport = () => {
    const headers = [
      'Employee Code',
      'Employee Name',
      'Department',
      'Role',
      'Date',
      'Login Time',
      'Logout Time',
      'Working Hours',
      'Break Time',
      'Status',
      'Current Activity',
    ];

    const rows = records.map((r) => [
      r.employeeCode,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${r.employeeRole}"`,
      r.date,
      r.loginTime,
      r.logoutTime,
      r.workingHours,
      r.breakTime,
      r.status,
      `"${r.currentActivity}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TechnoKraft_Attendance_${filters.datePreset}_Page${page + 1}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${records.length} records to CSV`);
  };

  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="space-y-6 pb-12">
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
              Attendance
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {totalElements} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track employee attendance, login sessions and working hours in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadEmployeesRoster();
            loadAttendanceData(false);
          }}
          disabled={isLoading || isTableLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          title="Refresh attendance telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(isLoading || isTableLoading) ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin mx-auto mb-2" />
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            Loading Attendance Sessions...
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <AttendanceSummaryCards
            employees={employees}
            summary={summary}
            selectedFilter={filters.status}
            onSelectFilter={handleSummaryCardFilter}
          />

          {/* Currently Working Live Telemetry Section */}
          <CurrentlyWorking
            employees={employees}
            onSelectEmployee={(emp) => setSelectedEmployeeForModal(emp)}
          />

          {/* Attendance Toolbar */}
          <AttendanceToolbar
            filters={filters}
            onChange={handleFilterChange}
            onReset={() => handleFilterChange(INITIAL_ATTENDANCE_FILTERS)}
            employees={employees}
            onExport={handleExport}
          />

          {/* Attendance Table (Desktop) */}
          <div className="relative">
            {isTableLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center z-10 rounded-xl">
                <Loader2 className="w-6 h-6 text-[#5B4DB7] animate-spin" />
              </div>
            )}

            <div className="hidden md:block">
              <AttendanceTable
                records={records}
                onViewDetails={handleViewDetails}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </div>

            {/* Attendance Cards (Mobile) */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
              {records.map((rec) => (
                <AttendanceCard
                  key={rec.id}
                  record={rec}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Server-Side Pagination Bar */}
            {totalElements > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                {/* Entries Info */}
                <div className="text-slate-500 dark:text-slate-400">
                  Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startItem}</span> to{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{endItem}</span> of{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{totalElements}</span> records
                </div>

                {/* Page Controls */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* Rows per page selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(0);
                      }}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Page Navigation Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage(0)}
                      disabled={page === 0}
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="First page"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <span className="px-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      Page <span className="font-semibold">{page + 1}</span> of{' '}
                      <span className="font-semibold">{totalPages}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(totalPages - 1)}
                      disabled={page >= totalPages - 1}
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Last page"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Attendance Details Modal */}
      <AttendanceDetailsModal
        isOpen={!!selectedEmployeeForModal}
        employee={selectedEmployeeForModal}
        onClose={() => setSelectedEmployeeForModal(null)}
      />
    </div>
  );
};
