import React, { useState, useEffect, useCallback } from 'react';
import { ReportHeader } from '../../components/reports/ReportHeader';
import { ReportDateRange } from '../../components/reports/ReportDateRange';
import { ReportFilters } from '../../components/reports/ReportFilters';
import { PerformanceKpiCards } from '../../components/reports/PerformanceKpiCards';
import { TargetAchievementCard } from '../../components/reports/TargetAchievementCard';
import { EmployeePerformanceTable } from '../../components/reports/EmployeePerformanceTable';
import { TopPerformers } from '../../components/reports/TopPerformers';
import { TeamPerformance } from '../../components/reports/TeamPerformance';
import { EmployeeActivityChart } from '../../components/reports/EmployeeActivityChart';
import { ActivityConversionAnalysis } from '../../components/reports/ActivityConversionAnalysis';
import { EmployeePerformanceDetailView } from '../../components/reports/EmployeePerformanceDetailView';
import {
  DateRangePreset,
  RoleScope,
  PerformanceReportResponse,
  EmployeePerformanceRecord,
} from '../../types/reports';
import {
  fetchPerformanceReport,
  downloadReportFile,
} from '../../services/reportService';
import { Loader2 } from 'lucide-react';

export const PerformanceReportPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangePreset>('This Month');
  const [selectedEmployee, setSelectedEmployee] = useState('All Employees');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [selectedScope, setSelectedScope] = useState<RoleScope>('Company Overview');
  const [exportToast, setExportToast] = useState<string | null>(null);

  const [performanceData, setPerformanceData] = useState<PerformanceReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDetailEmployee, setSelectedDetailEmployee] = useState<EmployeePerformanceRecord | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPerformanceReport({
        dateRange,
        employee: selectedEmployee !== 'All Employees' ? selectedEmployee : undefined,
        team: selectedTeam !== 'All Teams' ? selectedTeam : undefined,
        scope: selectedScope,
      });
      // Ensure employees is always an array to prevent filter() crashes
      setPerformanceData({
        ...data,
        employees: Array.isArray(data?.employees) ? data.employees : [],
        topPerformers: Array.isArray(data?.topPerformers) ? data.topPerformers : [],
        activityConversions: Array.isArray(data?.activityConversions) ? data.activityConversions : [],
      });
    } catch (err) {
      console.error('Failed to load performance report:', err);
      // Set safe empty default to prevent component crashes
      setPerformanceData({
        teamSummary: {
          totalTeamMembers: 0,
          leadsAssigned: 0,
          calls: 0,
          emails: 0,
          whatsapp: 0,
          followUps: 0,
          meetings: 0,
          qualified: 0,
          proposals: 0,
          won: 0,
          pipelineValue: 0,
          wonValue: 0,
          targetRevenue: 0,
          achievedRevenue: 0,
          avgAchievementRate: 0,
        },
        employees: [],
        topPerformers: [],
        targetAchievements: [],
        activityConversions: [],
        dateRange: dateRange,
        generatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, selectedEmployee, selectedTeam, selectedScope]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async (format: 'PDF' | 'Excel' | 'CSV') => {
    try {
      await downloadReportFile(format, 'Performance', {
        dateRange,
        employee: selectedEmployee,
        team: selectedTeam,
        scope: selectedScope,
      });
      setExportToast(`${format} exported successfully!`);
      setTimeout(() => setExportToast(null), 3000);
    } catch {
      setExportToast(`Failed to export ${format}`);
      setTimeout(() => setExportToast(null), 3000);
    }
  };

  const employees = performanceData?.employees || [];
  const teamSummary = performanceData?.teamSummary;
  const kpis = {
    totalLeadsHandled: teamSummary?.leadsAssigned ?? 0,
    totalWonDeals: teamSummary?.won ?? 0,
    wonRevenueINR: teamSummary?.wonValue ?? 0,
    avgConversionRate: teamSummary?.avgAchievementRate ?? 0,
    totalCallsLogged: teamSummary?.calls ?? 0,
    totalEmailsSent: teamSummary?.emails ?? 0,
    followUpsCompleted: teamSummary?.followUps ?? 0,
    avgResponseTimeHours: 2.4,
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
          <span>{exportToast}</span>
        </div>
      )}

      {/* Report Header */}
      <ReportHeader
        title="Employee Performance & Target Analysis"
        description="Monitor individual team output, pipeline conversions, target achievements, and commercial revenue generation"
        onExport={handleExport}
        onRefresh={loadData}
        isRefreshing={isLoading}
      />

      {/* Date Range Selector */}
      <ReportDateRange selected={dateRange} onChange={setDateRange} />

      {/* Filters Strip */}
      <ReportFilters
        selectedEmployee={selectedEmployee}
        selectedTeam={selectedTeam}
        selectedScope={selectedScope}
        onEmployeeChange={setSelectedEmployee}
        onTeamChange={setSelectedTeam}
        onScopeChange={setSelectedScope}
      />

      {isLoading && !performanceData ? (
        <div className="p-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-9 h-9 text-[#5B4DB7] animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Calculating employee performance metrics...
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <PerformanceKpiCards
            employees={employees}
            selectedEmployeeName={selectedEmployee}
            kpis={kpis}
          />

          {/* Department & Team Summary */}
          {teamSummary && (
            <TeamPerformance
              summary={teamSummary}
              selectedTeam={selectedTeam}
            />
          )}

          {/* Top Performers and Target Achievement */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <TargetAchievementCard
                employees={employees}
                selectedEmployeeName={selectedEmployee}
              />
            </div>
            <div>
              <TopPerformers
                performers={performanceData?.topPerformers}
                employees={employees}
                onSelectEmployeeName={(name) => setSelectedEmployee(name)}
              />
            </div>
          </div>

          {/* Activity Breakdown & Conversion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <EmployeeActivityChart
              employees={employees}
              employeeName={selectedEmployee}
            />
            <ActivityConversionAnalysis
              employees={employees}
              conversions={performanceData?.activityConversions}
              onSelectEmployee={(emp) => setSelectedDetailEmployee(emp)}
            />
          </div>

          {/* Employee Performance Detailed Table */}
          <EmployeePerformanceTable
            employees={employees}
            onSelectEmployee={(emp) => setSelectedDetailEmployee(emp)}
          />
        </>
      )}

      {/* Employee Detail Modal */}
      {selectedDetailEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-auto">
            <EmployeePerformanceDetailView
              employee={selectedDetailEmployee}
              onClose={() => setSelectedDetailEmployee(null)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
