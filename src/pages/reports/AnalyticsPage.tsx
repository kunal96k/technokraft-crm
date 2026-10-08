import React, { useState, useEffect, useCallback } from 'react';
import { ReportHeader } from '../../components/reports/ReportHeader';
import { ReportDateRange } from '../../components/reports/ReportDateRange';
import { ReportFilters } from '../../components/reports/ReportFilters';
import { AnalyticsKpiCards } from '../../components/reports/AnalyticsKpiCards';
import { ConversionFunnel } from '../../components/reports/ConversionFunnel';
import { LeadSourceAnalytics } from '../../components/reports/LeadSourceAnalytics';
import { ServiceAnalytics } from '../../components/reports/ServiceAnalytics';
import { PipelineAnalytics } from '../../components/reports/PipelineAnalytics';
import { WinLossAnalysis } from '../../components/reports/WinLossAnalysis';
import { MonthlyTrendChart } from '../../components/reports/MonthlyTrendChart';
import { CommunicationAnalytics } from '../../components/reports/CommunicationAnalytics';
import { StaleLeadAnalysis } from '../../components/reports/StaleLeadAnalysis';
import { OverdueFollowupAnalysis } from '../../components/reports/OverdueFollowupAnalysis';
import { EmployeeComparison } from '../../components/reports/EmployeeComparison';
import {
  DateRangePreset,
  RoleScope,
  AnalyticsReportResponse,
  EmployeePerformanceRecord,
  EmployeeFunnel,
  WinLossStat,
} from '../../types/reports';
import {
  fetchAnalyticsReport,
  fetchPerformanceReport,
  downloadReportFile,
} from '../../services/reportService';
import { Loader2, RefreshCw } from 'lucide-react';

const DEFAULT_WIN_LOSS: WinLossStat = {
  wonCount: 0,
  lostCount: 0,
  openCount: 0,
  winRate: 0,
  lossReasons: [],
};

export const AnalyticsPage: React.FC = () => {
  // Global Analytics Filters
  const [dateRange, setDateRange] = useState<DateRangePreset>('This Month');
  const [selectedEmployee, setSelectedEmployee] = useState('All Employees');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [selectedScope, setSelectedScope] = useState<RoleScope>('Company Overview');
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Live Backend State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsReportResponse | null>(null);
  const [employees, setEmployees] = useState<EmployeePerformanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, perfRes] = await Promise.all([
        fetchAnalyticsReport({
          dateRange,
          employee: selectedEmployee,
          team: selectedTeam,
          scope: selectedScope,
          source: selectedSource,
          service: selectedService,
          status: selectedStatus,
        }),
        fetchPerformanceReport({
          dateRange,
          employee: selectedEmployee,
          team: selectedTeam,
          scope: selectedScope,
        }),
      ]);

      setAnalyticsData(analyticsRes);
      setEmployees(perfRes.employees || []);
    } catch (err) {
      console.error('Failed to load CRM analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    dateRange,
    selectedEmployee,
    selectedTeam,
    selectedScope,
    selectedSource,
    selectedService,
    selectedStatus,
  ]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleResetFilters = () => {
    setDateRange('This Month');
    setSelectedEmployee('All Employees');
    setSelectedTeam('All Teams');
    setSelectedScope('Company Overview');
    setSelectedSource('All Sources');
    setSelectedService('All Services');
    setSelectedStatus('All Statuses');
  };

  const handleExport = async (format: 'PDF' | 'Excel' | 'CSV') => {
    setExportToast(`Generating ${format} report for CRM Analytics...`);
    try {
      await downloadReportFile(format, 'Analytics', {
        dateRange,
        employee: selectedEmployee,
        team: selectedTeam,
        scope: selectedScope,
      });
      setExportToast(`✓ ${format} downloaded successfully!`);
    } catch (err) {
      console.error('Export failed:', err);
      setExportToast(`Exporting ${format} failed. Please try again.`);
    } finally {
      setTimeout(() => setExportToast(null), 3500);
    }
  };

  // Convert conversion funnel stages into structured EmployeeFunnel object
  let leadsCount = 0;
  let contactedCount = 0;
  let interestedCount = 0;
  let qualifiedCount = 0;
  let proposalCount = 0;
  let wonCount = 0;

  if (analyticsData?.conversionFunnel && analyticsData.conversionFunnel.length >= 6) {
    leadsCount = analyticsData.conversionFunnel[0].count;
    contactedCount = analyticsData.conversionFunnel[1].count;
    interestedCount = analyticsData.conversionFunnel[2].count;
    qualifiedCount = analyticsData.conversionFunnel[3].count;
    proposalCount = analyticsData.conversionFunnel[4].count;
    wonCount = analyticsData.conversionFunnel[5].count;
  }

  const funnelData: EmployeeFunnel = {
    leads: leadsCount,
    contacted: contactedCount,
    interested: interestedCount,
    qualified: qualifiedCount,
    proposal: proposalCount,
    won: wonCount,
  };

  const totalLeads = funnelData.leads;
  const interested = funnelData.interested;
  const qualified = funnelData.qualified;
  const won = funnelData.won;
  const proposals = funnelData.proposal;
  const opportunities = (analyticsData?.pipelineStages || []).reduce((sum, s) => sum + s.count, 0);
  const pipelineValue = (analyticsData?.pipelineStages || []).reduce((sum, s) => sum + s.value, 0);
  const winRate = analyticsData?.winLoss?.winRate || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert for Exports */}
      {exportToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Page Header */}
      <ReportHeader
        title="CRM Analytics"
        subtitle="Analyze leads, sales pipeline, communication and conversion trends."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Reports', path: '/reports/performance' },
          { label: 'CRM Analytics' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAnalyticsData}
              title="Refresh Analytics"
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#5B4DB7]' : ''}`} />
            </button>
            <ReportDateRange selected={dateRange} onChange={setDateRange} />
          </div>
        }
        onExport={handleExport}
      />

      {/* Analytics Comprehensive Filter Bar */}
      <ReportFilters
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        selectedScope={selectedScope}
        onScopeChange={setSelectedScope}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        selectedService={selectedService}
        onServiceChange={setSelectedService}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onReset={handleResetFilters}
        isAnalytics={true}
      />

      {isLoading && !analyticsData ? (
        <div className="p-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Aggregating CRM analytics and revenue intelligence from database...
          </p>
        </div>
      ) : (
        <>
          {/* 8 Analytics KPI Cards */}
          <AnalyticsKpiCards
            totalLeads={totalLeads}
            interested={interested}
            qualified={qualified}
            opportunities={opportunities}
            proposals={proposals}
            won={won}
            pipelineValue={pipelineValue}
            winRate={winRate}
          />

          {/* 2-Column Section 1: Lead Funnel & Lead Source Attribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConversionFunnel
              funnel={funnelData}
              title="Lead Funnel & Progression Velocity"
              subtitle="Top-of-funnel generation through commercial contract execution"
            />
            <LeadSourceAnalytics sources={analyticsData?.leadSources || []} />
          </div>

          {/* 2-Column Section 2: Pipeline Analytics & Service Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PipelineAnalytics stages={analyticsData?.pipelineStages || []} />
            <ServiceAnalytics services={analyticsData?.services || []} />
          </div>

          {/* 2-Column Section 3: Monthly Trends & Win/Loss Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyTrendChart data={analyticsData?.monthlyTrends || []} />
            <WinLossAnalysis data={analyticsData?.winLoss || DEFAULT_WIN_LOSS} />
          </div>

          {/* Communication & Multichannel Engagement */}
          <CommunicationAnalytics stats={analyticsData?.communications || []} />

          {/* Operational Bottlenecks: Stale Leads & Overdue Follow-ups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StaleLeadAnalysis stats={analyticsData?.staleLeads || []} />
            <OverdueFollowupAnalysis stats={analyticsData?.overdueFollowUps || []} />
          </div>

          {/* Representative Benchmark & Comparison */}
          {employees.length > 0 && <EmployeeComparison employees={employees} />}
        </>
      )}
    </div>
  );
};
