import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportHeader } from '../../components/reports/ReportHeader';
import { ReportDateRange } from '../../components/reports/ReportDateRange';
import { ReportFilters } from '../../components/reports/ReportFilters';
import { PerformanceKpiCards } from '../../components/reports/PerformanceKpiCards';
import { EmployeePerformanceTable } from '../../components/reports/EmployeePerformanceTable';
import { EmployeePerformanceCard } from '../../components/reports/EmployeePerformanceCard';
import { TargetAchievementCard } from '../../components/reports/TargetAchievementCard';
import { TeamPerformance } from '../../components/reports/TeamPerformance';
import { TopPerformers } from '../../components/reports/TopPerformers';
import { ActivityStatus } from '../../components/reports/ActivityStatus';
import { ActivityConversionAnalysis } from '../../components/reports/ActivityConversionAnalysis';
import { EmployeePerformanceDetailView } from '../../components/reports/EmployeePerformanceDetailView';
import {
  MOCK_EMPLOYEES,
  MOCK_TEAM_SUMMARY,
} from '../../data/mockReports';
import {
  DateRangePreset,
  RoleScope,
  EmployeePerformanceRecord,
} from '../../types/reports';

export const PerformanceReportPage: React.FC = () => {
  const navigate = useNavigate();

  // Filter States
  const [dateRange, setDateRange] = useState<DateRangePreset>('This Month');
  const [selectedEmployee, setSelectedEmployee] = useState('All Employees');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [selectedScope, setSelectedScope] = useState<RoleScope>('All Employees');
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] =
    useState<EmployeePerformanceRecord | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Filter employees
  const filteredEmployees = MOCK_EMPLOYEES.filter((emp) => {
    if (selectedEmployee !== 'All Employees' && emp.name !== selectedEmployee) {
      return false;
    }
    if (selectedTeam !== 'All Teams' && emp.team !== selectedTeam) {
      return false;
    }
    if (selectedScope === 'My Performance') {
      return emp.name === 'Kunal Patil'; // simulate current logged in rep
    }
    if (selectedScope === 'My Team') {
      return emp.team === 'Enterprise Sales';
    }
    return true;
  });

  const handleResetFilters = () => {
    setSelectedEmployee('All Employees');
    setSelectedTeam('All Teams');
    setSelectedScope('All Employees');
    setDateRange('This Month');
  };

  const handleExport = (format: 'PDF' | 'Excel' | 'CSV') => {
    setExportToast(`Generating ${format} export for ${dateRange}...`);
    setTimeout(() => setExportToast(null), 3500);
  };

  const handleSelectEmployee = (emp: EmployeePerformanceRecord) => {
    setSelectedEmployeeForModal(emp);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert for Simulated Exports */}
      {exportToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Page Header */}
      <ReportHeader
        title="Performance Report"
        subtitle="Track employee activity, productivity and target achievement."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Reports', path: '/reports/performance' },
          { label: 'Performance Report' },
        ]}
        actions={
          <ReportDateRange selected={dateRange} onChange={setDateRange} />
        }
        onExport={handleExport}
      />

      {/* Global Filter Bar */}
      <ReportFilters
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        selectedScope={selectedScope}
        onScopeChange={setSelectedScope}
        onReset={handleResetFilters}
      />

      {/* KPI Cards (6 Cards) */}
      <PerformanceKpiCards
        employees={filteredEmployees}
        selectedEmployeeName={selectedEmployee}
      />

      {/* Team Performance Summary (Shown for Management / Admin / Team views) */}
      {selectedScope !== 'My Performance' && (
        <TeamPerformance
          summary={MOCK_TEAM_SUMMARY}
          selectedTeam={selectedTeam}
        />
      )}

      {/* Desktop 2-Column: Target Achievement + (Top Performers & Activity Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TargetAchievementCard
            employees={filteredEmployees.length > 0 ? filteredEmployees : MOCK_EMPLOYEES}
            selectedEmployeeName={selectedEmployee}
          />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <TopPerformers
            onSelectEmployeeName={(name) => {
              const found = MOCK_EMPLOYEES.find((e) => e.name === name);
              if (found) setSelectedEmployeeForModal(found);
            }}
          />
          <ActivityStatus
            employees={filteredEmployees.slice(0, 4)}
            onSelectEmployee={handleSelectEmployee}
          />
        </div>
      </div>

      {/* Activity → Conversion Yield Matrix */}
      <ActivityConversionAnalysis
        employees={filteredEmployees}
        onSelectEmployee={handleSelectEmployee}
      />

      {/* Employee Performance Matrix Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Individual Employee Performance Directory
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredEmployees.length} active team members
          </span>
        </div>

        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block">
          <EmployeePerformanceTable
            employees={filteredEmployees}
            onSelectEmployee={handleSelectEmployee}
          />
        </div>

        {/* Mobile Cards View (shown only on mobile) */}
        <div className="md:hidden space-y-3">
          {filteredEmployees.map((emp) => (
            <EmployeePerformanceCard
              key={emp.id}
              employee={emp}
              onSelect={handleSelectEmployee}
            />
          ))}
        </div>
      </div>

      {/* Employee Detail Modal/Drawer */}
      {selectedEmployeeForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
            <EmployeePerformanceDetailView
              employee={selectedEmployeeForModal}
              onClose={() => setSelectedEmployeeForModal(null)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
