import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Employee, EmployeeFiltersState } from '../../types/employees';
import { INITIAL_EMPLOYEES } from '../../data/mockEmployees';
import { EmployeeSummaryCards } from '../../components/employees/EmployeeSummaryCards';
import { EmployeeToolbar } from '../../components/employees/EmployeeToolbar';
import { EmployeeFilters } from '../../components/employees/EmployeeFilters';
import { EmployeeTable } from '../../components/employees/EmployeeTable';
import { EmployeeCard } from '../../components/employees/EmployeeCard';
import { EmployeeDetails } from '../../components/employees/EmployeeDetails';
import { AddEmployeeModal } from '../../components/employees/AddEmployeeModal';
import { DeactivateEmployeeModal } from '../../components/employees/DeactivateEmployeeModal';
import { Users, CheckCircle2 } from 'lucide-react';

const INITIAL_FILTERS: EmployeeFiltersState = {
  searchQuery: '',
  department: '',
  role: '',
  status: '',
  employmentType: '',
  manager: '',
  workStatus: '',
  crmAccess: '',
};

export const EmployeeListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [filters, setFilters] = useState<EmployeeFiltersState>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Drawer & Modal states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(() => {
    const empId = searchParams.get('employeeId');
    if (empId) {
      return INITIAL_EMPLOYEES.find((e) => e.id === empId) || null;
    }
    return null;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<Employee | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter logic
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesCode = emp.employeeCode.toLowerCase().includes(q);
        const matchesEmail = emp.email.toLowerCase().includes(q);
        const matchesRole = emp.role.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesEmail && !matchesRole) {
          return false;
        }
      }

      // Department
      if (filters.department && emp.department !== filters.department) {
        return false;
      }

      // Role
      if (filters.role && emp.role !== filters.role) {
        return false;
      }

      // Status
      if (filters.status && emp.status !== filters.status) {
        return false;
      }

      // Work Status
      if (filters.workStatus && emp.workStatus !== filters.workStatus) {
        return false;
      }

      // CRM Access
      if (filters.crmAccess) {
        const isAccessEnabled = filters.crmAccess === 'enabled';
        if (emp.crmAccess !== isAccessEnabled) {
          return false;
        }
      }

      return true;
    });
  }, [employees, filters]);

  // Card click filter shortcut
  const handleSummaryCardClick = (statusKey: string) => {
    if (statusKey === 'all') {
      setFilters(INITIAL_FILTERS);
    } else if (statusKey === 'Working') {
      setFilters({ ...INITIAL_FILTERS, workStatus: 'Working' });
    } else {
      setFilters({ ...INITIAL_FILTERS, status: statusKey });
    }
  };

  // Handle Save (Add or Edit)
  const handleSaveEmployee = (empData: Partial<Employee>) => {
    if (editingEmployee) {
      // Edit
      setEmployees((prev) =>
        prev.map((e) => (e.id === editingEmployee.id ? ({ ...e, ...empData } as Employee) : e))
      );
      if (selectedEmployee?.id === editingEmployee.id) {
        setSelectedEmployee((prev) => (prev ? ({ ...prev, ...empData } as Employee) : null));
      }
      showToast(`Updated employee profile for ${empData.name}`);
      setEditingEmployee(null);
    } else {
      // Add new
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name: empData.name || 'New Employee',
        firstName: empData.firstName || '',
        lastName: empData.lastName || '',
        employeeCode: empData.employeeCode || `EMP-00${employees.length + 1}`,
        avatar: empData.avatar || 'NE',
        email: empData.email || '',
        personalEmail: empData.personalEmail || '',
        phone: empData.phone || '',
        gender: empData.gender || 'Male',
        dateOfBirth: empData.dateOfBirth || '',
        department: empData.department || 'Sales',
        role: empData.role || 'Sales Executive',
        reportingManager: empData.reportingManager || 'Rajesh Mehta',
        employmentType: empData.employmentType || 'Full Time',
        joiningDate: empData.joiningDate || new Date().toISOString().split('T')[0],
        status: empData.status || 'Active',
        workStatus: 'Offline',
        todayAttendanceStatus: 'Present',
        loginTime: '—',
        logoutTime: '—',
        todayWorkingTime: '0h 00m',
        lastActivityTime: 'Just now',
        currentActivity: 'Onboarded to system',
        crmAccess: empData.crmAccess ?? true,
        accessRole: empData.accessRole || 'Sales Executive',
        workload: {
          assignedLeads: 0,
          openFollowUps: 0,
          overdueFollowUps: 0,
          openTasks: 0,
          upcomingMeetings: 0,
          openOpportunities: 0,
          pendingProposals: 0,
        },
        todayActivity: {
          calls: 0,
          emails: 0,
          whatsapp: 0,
          followUps: 0,
          meetings: 0,
          tasks: 0,
        },
        targets: empData.targets || {
          period: 'Monthly',
          monthlyRevenueTarget: 800000,
          monthlyLeadTarget: 40,
          monthlyCallTarget: 80,
          monthlyFollowUpTarget: 35,
          monthlyProposalTarget: 6,
          monthlyWonDealTarget: 3,
          achievedRevenue: 0,
          achievedLeads: 0,
          achievedCalls: 0,
          achievedFollowUps: 0,
          achievedProposals: 0,
          achievedWonDeals: 0,
          revenueAchievementRate: 0,
          overallStatus: 'On Track',
        },
        attendanceSummary: {
          presentDays: 1,
          absentDays: 0,
          leaveDays: 0,
          lateDays: 0,
          workingDays: 21,
          expectedDailyHours: '8h 00m',
          averageWorkingHours: '8h 00m',
          totalWorkingHours: '8h 00m',
          overtimeHours: '0h 00m',
          dailyRecords: [],
        },
        recentTimeline: [],
        createdAt: new Date().toISOString(),
      };

      setEmployees((prev) => [newEmp, ...prev]);
      showToast(`Added new employee ${newEmp.name} (${newEmp.employeeCode})`);
    }
  };

  // Deactivate handler
  const handleConfirmDeactivate = (emp: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, status: 'Inactive', workStatus: 'Offline' } : e))
    );
    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee((prev) => (prev ? { ...prev, status: 'Inactive', workStatus: 'Offline' } : null));
    }
    showToast(`Deactivated ${emp.name}. Past CRM records preserved.`);
    setDeactivatingEmployee(null);
  };

  // Activate handler
  const handleActivate = (emp: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, status: 'Active' } : e))
    );
    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee((prev) => (prev ? { ...prev, status: 'Active' } : null));
    }
    showToast(`Activated ${emp.name}. Employee can now log in and take assignments.`);
  };

  // Export CSV
  const handleExport = () => {
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

    const rows = filteredEmployees.map((e) => [
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
      e.workload.assignedLeads,
      e.workload.openFollowUps,
      e.targets.achievedRevenue,
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
    showToast('Exported employee directory to CSV');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Employees
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {employees.length} Staff
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage company employees, CRM system access, active pipeline workloads and monthly quota targets.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <EmployeeSummaryCards
        employees={employees}
        selectedFilter={filters.status || (filters.workStatus ? 'Working' : 'all')}
        onSelectFilter={handleSummaryCardClick}
      />

      {/* Toolbar */}
      <EmployeeToolbar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={employees.length}
        filteredCount={filteredEmployees.length}
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
          onChange={setFilters}
          onReset={() => setFilters(INITIAL_FILTERS)}
        />
      )}

      {/* View Content: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="hidden md:block">
          <EmployeeTable
            employees={filteredEmployees}
            onSelectEmployee={(emp) => setSelectedEmployee(emp)}
            onEditEmployee={(emp) => {
              setEditingEmployee(emp);
              setIsAddModalOpen(true);
            }}
            onDeactivateEmployee={(emp) => setDeactivatingEmployee(emp)}
            onActivateEmployee={handleActivate}
          />
        </div>
      ) : null}

      {/* Card Grid View (shown on mobile or when card mode selected) */}
      <div className={viewMode === 'table' ? 'md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
        {filteredEmployees.map((emp) => (
          <EmployeeCard
            key={emp.id}
            employee={emp}
            onSelect={(e) => setSelectedEmployee(e)}
            onEdit={(e) => {
              setEditingEmployee(e);
              setIsAddModalOpen(true);
            }}
            onDeactivate={(e) => setDeactivatingEmployee(e)}
            onActivate={handleActivate}
          />
        ))}
      </div>

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
              onDeactivate={(emp) => setDeactivatingEmployee(emp)}
              onActivate={handleActivate}
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

      {/* Deactivate Employee Modal */}
      <DeactivateEmployeeModal
        isOpen={!!deactivatingEmployee}
        employee={deactivatingEmployee}
        onClose={() => setDeactivatingEmployee(null)}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
};
