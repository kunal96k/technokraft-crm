import { authFetch } from './apiClient';
import {
  AuditLogItem,
  AuditLogSearchParams,
  AuditLogSummaryData,
  AuditLogPageResponse,
} from '../types/auditLog';

const AUDIT_LOGS_API_URL = '/api/audit-logs';

/**
 * Fetch paginated, filtered, and sorted audit logs from backend via JPA Specifications.
 */
export async function fetchAuditLogs(
  params: AuditLogSearchParams = {}
): Promise<AuditLogPageResponse> {
  const query = new URLSearchParams();

  if (params.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }
  if (params.module && params.module !== 'all') {
    query.set('module', params.module);
  }
  if (params.action && params.action !== 'all') {
    query.set('action', params.action);
  }
  if (params.actorId) {
    query.set('actorId', String(params.actorId));
  }
  if (params.actorUsername && params.actorUsername.trim()) {
    query.set('actorUsername', params.actorUsername.trim());
  }
  if (params.entityType && params.entityType !== 'all') {
    query.set('entityType', params.entityType);
  }
  if (params.entityId && params.entityId.trim()) {
    query.set('entityId', params.entityId.trim());
  }
  if (params.severity && params.severity !== 'all') {
    query.set('severity', params.severity);
  }
  if (typeof params.success === 'boolean') {
    query.set('success', String(params.success));
  }
  if (params.fromDate) {
    query.set('fromDate', params.fromDate);
  }
  if (params.toDate) {
    query.set('toDate', params.toDate);
  }

  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 50));
  query.set('sortBy', params.sortBy || 'createdAt');
  query.set('sortDirection', params.sortDirection || 'desc');

  const res = await authFetch(`${AUDIT_LOGS_API_URL}?${query.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Access denied. Audit logs are restricted to Super Admin / System Administrator only.');
    }
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Failed to fetch audit logs: HTTP ${res.status}`);
  }

  const data = await res.json();
  const pageMeta = data.page || data;
  const content: AuditLogItem[] = Array.isArray(data.content)
    ? data.content
    : (Array.isArray(data) ? data : []);
  const totalElements = typeof pageMeta.totalElements === 'number'
    ? pageMeta.totalElements
    : (typeof data.totalElements === 'number' ? data.totalElements : content.length);
  const totalPages = typeof pageMeta.totalPages === 'number'
    ? pageMeta.totalPages
    : (typeof data.totalPages === 'number' ? data.totalPages : Math.max(1, Math.ceil(totalElements / (params.size || 50))));

  return {
    content,
    totalElements,
    totalPages,
    size: typeof pageMeta.size === 'number' ? pageMeta.size : (params.size ?? 50),
    number: typeof pageMeta.number === 'number' ? pageMeta.number : (params.page ?? 0),
    first: Boolean(data.first),
    last: Boolean(data.last),
    empty: Boolean(data.empty ?? (content.length === 0)),
  };
}

/**
 * Fetch 24h & aggregate audit summary statistics.
 */
export async function fetchAuditLogSummary(): Promise<AuditLogSummaryData> {
  const res = await authFetch(`${AUDIT_LOGS_API_URL}/summary`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Access denied. Audit logs are restricted to Super Admin / System Administrator only.');
    }
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Failed to fetch audit log summary: HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Fetch a single audit log entry by ID.
 */
export async function fetchAuditLogById(id: number | string): Promise<AuditLogItem | null> {
  const res = await authFetch(`${AUDIT_LOGS_API_URL}/${id}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    if (res.status === 403) {
      throw new Error('Access denied. Audit logs are restricted to Super Admin / System Administrator only.');
    }
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Failed to fetch audit log #${id}: HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Helper to export audit logs to CSV or JSON format in the browser.
 */
export function exportAuditLogsToFile(items: AuditLogItem[], format: 'csv' | 'json', filenamePrefix = 'crm_audit_logs'): void {
  if (!items || items.length === 0) return;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${filenamePrefix}_${timestamp}.${format}`;

  let blob: Blob;
  if (format === 'json') {
    blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json;charset=utf-8;' });
  } else {
    // CSV headers
    const headers = [
      'ID',
      'Timestamp',
      'Actor Name',
      'Actor Username',
      'Actor Role',
      'Module',
      'Action',
      'Severity',
      'Success',
      'Description',
      'Entity Type',
      'Entity ID',
      'Entity Label',
      'IP Address',
      'HTTP Status',
      'Error Message',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = items.map((item) => [
      escapeCsv(item.id),
      escapeCsv(item.createdAt),
      escapeCsv(item.actorName),
      escapeCsv(item.actorUsername),
      escapeCsv(item.actorRole),
      escapeCsv(item.module),
      escapeCsv(item.action),
      escapeCsv(item.severity),
      escapeCsv(item.success ? 'TRUE' : 'FALSE'),
      escapeCsv(item.description),
      escapeCsv(item.entityType),
      escapeCsv(item.entityId),
      escapeCsv(item.entityLabel),
      escapeCsv(item.ipAddress),
      escapeCsv(item.httpStatus),
      escapeCsv(item.errorMessage),
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
