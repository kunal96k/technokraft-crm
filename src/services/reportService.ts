import {
  DateRangePreset,
  RoleScope,
  PerformanceReportResponse,
  EmployeePerformanceRecord,
  AnalyticsReportResponse,
} from '../types/reports';
import { authFetch } from './apiClient';

const API_BASE_URL = '/api/reports';

export interface PerformanceReportQueryParams {
  dateRange?: DateRangePreset | string;
  startDate?: string;
  endDate?: string;
  employee?: string;
  team?: string;
  scope?: RoleScope | string;
}

export interface AnalyticsReportQueryParams {
  dateRange?: DateRangePreset | string;
  startDate?: string;
  endDate?: string;
  employee?: string;
  team?: string;
  scope?: RoleScope | string;
  source?: string;
  service?: string;
  status?: string;
}

/**
 * Fetch overall sales performance report from Spring Boot backend
 */
export async function fetchPerformanceReport(
  params: PerformanceReportQueryParams = {}
): Promise<PerformanceReportResponse> {
  const query = new URLSearchParams();
  if (params.dateRange) query.append('dateRange', params.dateRange);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.employee && params.employee !== 'All Employees') query.append('employee', params.employee);
  if (params.team && params.team !== 'All Teams') query.append('team', params.team);
  if (params.scope) query.append('scope', params.scope);

  const res = await authFetch(`${API_BASE_URL}/performance?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch performance report: HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch individual employee performance detail by employee ID / code / name
 */
export async function fetchEmployeePerformanceById(
  employeeId: string,
  dateRange: string = 'This Month'
): Promise<EmployeePerformanceRecord> {
  const query = new URLSearchParams();
  if (dateRange) query.append('dateRange', dateRange);

  const res = await authFetch(
    `${API_BASE_URL}/performance/${encodeURIComponent(employeeId)}?${query.toString()}`,
    {
      headers: { Accept: 'application/json' },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch performance for employee ${employeeId}: HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch CRM analytics dashboard dataset
 */
export async function fetchAnalyticsReport(
  params: AnalyticsReportQueryParams = {}
): Promise<AnalyticsReportResponse> {
  const query = new URLSearchParams();
  if (params.dateRange) query.append('dateRange', params.dateRange);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.employee && params.employee !== 'All Employees') query.append('employee', params.employee);
  if (params.team && params.team !== 'All Teams') query.append('team', params.team);
  if (params.scope) query.append('scope', params.scope);
  if (params.source && params.source !== 'All Sources') query.append('source', params.source);
  if (params.service && params.service !== 'All Services') query.append('service', params.service);
  if (params.status && params.status !== 'All Statuses') query.append('status', params.status);

  const res = await authFetch(`${API_BASE_URL}/analytics?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch analytics report: HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Trigger backend report download (CSV format)
 */
export async function downloadReportFile(
  format: 'PDF' | 'Excel' | 'CSV' = 'CSV',
  reportType: 'Performance' | 'Analytics' | 'Complete Dossier' = 'Performance',
  params: PerformanceReportQueryParams = {}
): Promise<void> {
  const query = new URLSearchParams();
  query.append('format', format);
  query.append('reportType', reportType);
  if (params.dateRange) query.append('dateRange', params.dateRange);
  if (params.employee && params.employee !== 'All Employees') query.append('employee', params.employee);
  if (params.team && params.team !== 'All Teams') query.append('team', params.team);
  if (params.scope) query.append('scope', params.scope);

  const res = await authFetch(`${API_BASE_URL}/export?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to export report: HTTP ${res.status}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `crm_${reportType.toLowerCase().replace(/\s+/g, '_')}_${params.dateRange || 'report'}.${format === 'CSV' ? 'csv' : 'txt'}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
