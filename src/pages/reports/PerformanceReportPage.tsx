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
import { ActivityStatus } from '../../components/reports/ActivityStatus';
import { ActivityConversionAnalysis } from '../../components/reports/ActivityConversionAnalysis';
import {
  DateRangePreset,
  RoleScope,
  PerformanceReportResponse,
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPerformanceReport({
        dateRange,
        employee: selectedEmployee !== 'All Employees' ? selectedEmployee : undefined,
        team: selectedTeam !== 'All Teams' ? selectedTeam : undefined,
        scope: selectedScope,
      });
      setPerformanceData(data);
    } catch (err) {
      console.error('Failed to load performance report:', err);
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
      setExportToast(`✓ ${format} exported successfully!`);
      setTimeout(() => setExportToast(null), 3000);
    } catch {
      setExportToast(`✕ Failed to export ${format}`);
      setTimeout(() => setExportToast(null), 3000);
    }
  };

  const employees = performanceData?.employees || [];
  const kpis = performanceData?.kpis || {
    totalLeadsHandled: 0,
    totalWonDeals: 0,
    wonRevenueINR: 0,
    avgConversionRate: 0,
    totalCallsLogged: 0,
    totalEmailsSent: 0,
    followUpsCompleted: 0,
    avgResponseTimeHours: 0,
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
          <PerformanceKpiCards kpis={kpis} />

          {/* Top Performers and Target Achievement */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <TargetAchievementCard
                achievementRate={performanceData?.targetAchievementRate || 85}
                targetRevenue={performanceData?.targetRevenue || 5000000}
                achievedRevenue={kpis.wonRevenueINR}
              />
            </div>
            <div>
              <TopPerformers employees={employees} />
            </div>
          </div>

          {/* Activity Breakdown & Conversion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <EmployeeActivityChart employees={employees} />
            <ActivityConversionAnalysis />
          </div>

          {/* Employee Performance Detailed Table */}
          <EmployeePerformanceTable employees={employees} />
        </>
      )}
    </div>
  );
};
