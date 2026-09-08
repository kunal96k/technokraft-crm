import React, { useState } from 'react';
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
  MOCK_LEAD_FUNNEL_STATS,
  MOCK_LEAD_SOURCES,
  MOCK_SERVICES,
  MOCK_MONTHLY_TRENDS,
  MOCK_PIPELINE_STAGES,
  MOCK_WIN_LOSS,
  MOCK_COMMUNICATIONS,
  MOCK_STALE_LEADS,
  MOCK_OVERDUE_FOLLOWUPS,
  MOCK_EMPLOYEES,
} from '../../data/mockReports';
import { DateRangePreset, RoleScope } from '../../types/reports';

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

  const handleResetFilters = () => {
    setDateRange('This Month');
    setSelectedEmployee('All Employees');
    setSelectedTeam('All Teams');
    setSelectedScope('Company Overview');
    setSelectedSource('All Sources');
    setSelectedService('All Services');
    setSelectedStatus('All Statuses');
  };

  const handleExport = (format: 'PDF' | 'Excel' | 'CSV') => {
    setExportToast(`Generating ${format} dossier for CRM Analytics...`);
    setTimeout(() => setExportToast(null), 3500);
  };

  // Filter sources & services if filtered
  const filteredSources =
    selectedSource === 'All Sources'
      ? MOCK_LEAD_SOURCES
      : MOCK_LEAD_SOURCES.filter((s) => s.source === selectedSource);

  const filteredServices =
    selectedService === 'All Services'
      ? MOCK_SERVICES
      : MOCK_SERVICES.filter((s) => s.service === selectedService);

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
        title="CRM Analytics"
        subtitle="Analyze leads, sales pipeline, communication and conversion trends."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Reports', path: '/reports/performance' },
          { label: 'CRM Analytics' },
        ]}
        actions={
          <ReportDateRange selected={dateRange} onChange={setDateRange} />
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

      {/* 8 Analytics KPI Cards */}
      <AnalyticsKpiCards />

      {/* 2-Column Section 1: Lead Funnel & Lead Source Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnel
          funnel={{
            leads: 1284,
            contacted: 910,
            interested: 320,
            qualified: 145,
            proposal: 72,
            won: 18,
          }}
          title="Lead Funnel & Progression Velocity"
          subtitle="Top-of-funnel generation through commercial contract execution"
        />
        <LeadSourceAnalytics sources={filteredSources} />
      </div>

      {/* 2-Column Section 2: Pipeline Analytics & Service Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineAnalytics stages={MOCK_PIPELINE_STAGES} />
        <ServiceAnalytics services={filteredServices} />
      </div>

      {/* 2-Column Section 3: Monthly Trends & Win/Loss Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendChart data={MOCK_MONTHLY_TRENDS} />
        <WinLossAnalysis data={MOCK_WIN_LOSS} />
      </div>

      {/* Communication & Multichannel Engagement */}
      <CommunicationAnalytics stats={MOCK_COMMUNICATIONS} />

      {/* Operational Bottlenecks: Stale Leads & Overdue Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaleLeadAnalysis stats={MOCK_STALE_LEADS} />
        <OverdueFollowupAnalysis stats={MOCK_OVERDUE_FOLLOWUPS} />
      </div>

      {/* Representative Benchmark & Comparison */}
      <EmployeeComparison employees={MOCK_EMPLOYEES} />
    </div>
  );
};
