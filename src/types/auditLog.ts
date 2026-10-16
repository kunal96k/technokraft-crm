export interface AuditLogItem {
  id: number;
  actorId?: number | null;
  actorName?: string | null;
  actorUsername?: string | null;
  actorRole?: string | null;
  module: string;
  action: string;
  description?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  entityLabel?: string | null;
  oldValues?: string | null;
  newValues?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  httpStatus?: number | null;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | string;
  success: boolean;
  errorMessage?: string | null;
  createdAt: string;
}

export interface AuditLogSearchParams {
  search?: string;
  module?: string;
  action?: string;
  actorId?: number;
  actorUsername?: string;
  entityType?: string;
  entityId?: string;
  severity?: string;
  success?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AuditLogSummaryData {
  totalLogs: number;
  logsLast24h: number;
  criticalLast24h: number;
  warningLast24h: number;
  failedLast24h: number;
}

export interface AuditLogPageResponse {
  content: AuditLogItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
