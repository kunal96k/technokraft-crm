import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Employee,
  AttendanceFiltersState,
  DailyAttendanceRecord,
} from '../../types/employees';
import { INITIAL_EMPLOYEES, getTodayAttendanceRecords } from '../../data/mockEmployees';
import { AttendanceSummaryCards } from '../../components/attendance/AttendanceSummaryCards';
import { CurrentlyWorking } from '../../components/attendance/CurrentlyWorking';
import { AttendanceToolbar } from '../../components/attendance/AttendanceToolbar';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';
import { AttendanceCard } from '../../components/attendance/AttendanceCard';
import { AttendanceDetailsModal } from '../../components/attendance/AttendanceDetailsModal';
import { Calendar, CheckCircle2 } from 'lucide-react';

const INITIAL_ATTENDANCE_FILTERS: AttendanceFiltersState = {
  datePreset: 'Today',
  searchQuery: '',
  department: '',
  status: '',
  employeeId: '',
};

export const AttendancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  // Generate today's records
  const allRecords = useMemo(() => getTodayAttendanceRecords(employees), [employees]);

  // Filters
  const [filters, setFilters] = useState<AttendanceFiltersState>(() => {
    const empParam = searchParams.get('employeeId');
    return {
      ...INITIAL_ATTENDANCE_FILTERS,
      employeeId: empParam || '',
    };
  });

  // Selected Employee for Attendance Details Modal
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState<Employee | null>(
    () => {
      const empParam = searchParams.get('employeeId');
      if (empParam) {
        return employees.find((e) => e.id === empParam) || null;
      }
      return null;
    }
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = rec.employeeName.toLowerCase().includes(q);
        const matchesCode = rec.employeeCode.toLowerCase().includes(q);
        const matchesRole = rec.employeeRole.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesRole) return false;
      }

      if (filters.department && rec.department !== filters.department) {
        return false;
      }

      if (filters.status && rec.status !== filters.status) {
        return false;
      }

      if (filters.employeeId && rec.employeeId !== filters.employeeId) {
        return false;
      }

      return true;
    });
  }, [allRecords, filters]);

  // Handle card click filter shortcut
  const handleSummaryCardFilter = (statusKey: string) => {
    if (statusKey === 'Working') {
      // Show currently working reps
      const workingIds = new Set(
        employees.filter((e) => e.workStatus === 'Working').map((e) => e.id)
      );
      setFilters({ ...INITIAL_ATTENDANCE_FILTERS });
    } else {
      setFilters({
        ...INITIAL_ATTENDANCE_FILTERS,
        status: statusKey,
      });
    }
  };

  // Open modal from record
  const handleViewDetails = (rec: DailyAttendanceRecord) => {
    const emp = employees.find((e) => e.id === rec.employeeId) || null;
    setSelectedEmployeeForModal(emp);
  };

  // Export
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

    const rows = filteredRecords.map((r) => [
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
    link.setAttribute('download', `TechnoKraft_Attendance_${filters.datePreset}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filters.datePreset} attendance records to CSV`);
  };

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
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance
          </h1>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Today: 07 Sep 2026
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track employee attendance, login sessions and working hours.
        </p>
      </div>

      {/* Summary Cards */}
      <AttendanceSummaryCards
        employees={employees}
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
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_ATTENDANCE_FILTERS)}
        employees={employees}
        onExport={handleExport}
      />

      {/* Attendance Table (Desktop) */}
      <div className="hidden md:block">
        <AttendanceTable
          records={filteredRecords}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Attendance Cards (Mobile) */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredRecords.map((rec) => (
          <AttendanceCard
            key={rec.id}
            record={rec}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Attendance Details Modal */}
      <AttendanceDetailsModal
        isOpen={!!selectedEmployeeForModal}
        employee={selectedEmployeeForModal}
        onClose={() => setSelectedEmployeeForModal(null)}
      />
    </div>
  );
};
