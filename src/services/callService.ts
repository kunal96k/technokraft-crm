import { CallRecord, CallSummaryStats, CallType, CallStatus, CallResult, CallFiltersState } from '../types/calls';
import { authFetch } from './apiClient';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string)?.replace(/\/leads$/, '') || '';
const CALLS_API_URL = `${API_BASE_URL}/api/calls`;

export interface FetchCallsParams {
  tab?: string;
  status?: string;
  type?: string;
  result?: string;
  employee?: string;
  leadStatus?: string;
  service?: string;
  dateRange?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CallsPageResponse {
  content: CallRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  isBackendConnected: boolean;
}

function normalizeCallRecord(c: any): CallRecord {
  const idStr = String(c.id || `call-${Date.now()}`);
  return {
    id: idStr,
    callCode: c.callCode || `CALL-${idStr.padStart(4, '0')}`,
    leadId: c.leadId ? String(c.leadId) : '',
    leadCode: c.leadCode || '',
    companyName: c.companyName || 'Client Company',
    companyWebsite: c.companyWebsite || '',
    contactId: c.contactId || '',
    contactName: c.contactName || 'Valued Client',
    contactDesignation: c.contactDesignation || 'Decision Maker',
    contactPhone: c.contactPhone || '',
    contactEmail: c.contactEmail || '',
    employeeId: c.employeeId || '',
    employeeName: c.employeeName || 'Sales Representative',
    employeeRole: c.employeeRole || 'Sales Executive',
    employeeAvatar: c.employeeAvatar || 'KP',
    type: (c.type as CallType) || 'outbound',
    status: (c.status as CallStatus) || 'completed',
    date: c.date || (c.createdAt ? c.createdAt.split('T')[0] : 'Today'),
    time: c.time || '11:00 AM',
    timestamp: c.timestamp || `${c.date || ''} ${c.time || ''}`.trim(),
    startTime: c.startTime || '',
    endTime: c.endTime || '',
    duration: c.duration || (c.status === 'scheduled' ? '00m 00s' : '05m 30s'),
    durationSeconds: typeof c.durationSeconds === 'number' ? c.durationSeconds : (c.status === 'scheduled' ? 0 : 330),
    result: (c.result as CallResult) || (c.status === 'scheduled' ? 'Scheduled' : 'Connected'),
    notes: c.notes || '',
    purpose: c.purpose || '',
    reminder: c.reminder || '',
    nextAction: c.nextAction || 'none',
    nextFollowUp: c.nextFollowUp || undefined,
    service: c.service || 'IT Services',
    leadStatus: c.leadStatus || 'NEW',
    leadScore: typeof c.leadScore === 'number' ? c.leadScore : 50,
    opportunityCreated: Boolean(c.opportunityCreated),
    recordingAvailable: Boolean(c.recordingAvailable),
    followUpRequired: Boolean(c.followUpRequired || c.nextAction !== 'none'),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

/**
 * Fetch filtered and paginated calls from backend MySQL database
 */
export async function fetchCalls(params: FetchCallsParams = {}): Promise<CallsPageResponse> {
  const query = new URLSearchParams();
  if (params.tab && params.tab !== 'all') query.append('tab', params.tab);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.type && params.type !== 'all') query.append('type', params.type);
  if (params.result && params.result !== 'all') query.append('result', params.result);
  if (params.employee && params.employee !== 'all') query.append('employee', params.employee);
  if (params.leadStatus && params.leadStatus !== 'all') query.append('leadStatus', params.leadStatus);
  if (params.service && params.service !== 'all') query.append('service', params.service);
  if (params.dateRange && params.dateRange !== 'all') query.append('dateRange', params.dateRange);
  if (params.search?.trim()) query.append('search', params.search.trim());
  query.append('page', String(params.page ?? 0));
  query.append('size', String(params.size ?? 100));
  query.append('sortBy', params.sortBy || 'id');
  query.append('sortDirection', params.sortDirection || 'desc');

  try {
    const res = await fetch(`${CALLS_API_URL}?${query.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const content: CallRecord[] = (data.content || []).map(normalizeCallRecord);

    return {
      content,
      totalElements: data.totalElements || content.length,
      totalPages: data.totalPages || 1,
      number: data.number || 0,
      size: data.size || params.size || 50,
      isBackendConnected: true,
    };
  } catch (error) {
    console.error('Failed to fetch calls from backend API:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      number: 0,
      size: params.size || 50,
      isBackendConnected: false,
    };
  }
}

/**
 * Fetch live call stats from backend
 */
export async function fetchCallStats(): Promise<CallSummaryStats & { totalCalls: number; isBackendConnected: boolean }> {
  try {
    const res = await authFetch(`${CALLS_API_URL}/stats`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      totalCalls: data.totalCalls || 0,
      callsToday: data.callsToday || 0,
      scheduled: data.scheduled || 0,
      completed: data.completed || 0,
      missed: data.missed || 0,
      followUpRequired: data.followUpRequired || 0,
      isBackendConnected: true,
    };
  } catch (error) {
    console.error('Failed to fetch call stats from backend API:', error);
    return {
      totalCalls: 0,
      callsToday: 0,
      scheduled: 0,
      completed: 0,
      missed: 0,
      followUpRequired: 0,
      isBackendConnected: false,
    };
  }
}

/**
 * Backward compatible fetchAllCallRecords
 */
export async function fetchAllCallRecords(): Promise<{ calls: CallRecord[]; stats: CallSummaryStats }> {
  const [callsRes, statsRes] = await Promise.all([
    fetchCalls({ size: 100 }),
    fetchCallStats(),
  ]);

  return {
    calls: callsRes.content,
    stats: {
      callsToday: statsRes.callsToday,
      scheduled: statsRes.scheduled,
      completed: statsRes.completed,
      missed: statsRes.missed,
      followUpRequired: statsRes.followUpRequired,
    },
  };
}

/**
 * Fetch call details by ID
 */
export async function fetchCallById(id: string | number): Promise<CallRecord | null> {
  const cleanId = String(id).replace(/^call-(act-|sched-|fu-)?/, '');
  try {
    const res = await authFetch(`${CALLS_API_URL}/${cleanId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return normalizeCallRecord(data);
  } catch (error) {
    console.error(`Failed to fetch call details for ID: ${id}:`, error);
    return null;
  }
}

/**
 * Log a new completed or active call record
 */
export async function logCallApi(callData: Partial<CallRecord>): Promise<CallRecord> {
  const payload = {
    leadId: callData.leadId,
    leadCode: callData.leadCode,
    companyName: callData.companyName,
    companyWebsite: callData.companyWebsite,
    contactId: callData.contactId,
    contactName: callData.contactName,
    contactDesignation: callData.contactDesignation,
    contactPhone: callData.contactPhone,
    contactEmail: callData.contactEmail,
    employeeId: callData.employeeId,
    employeeName: callData.employeeName,
    employeeRole: callData.employeeRole,
    employeeAvatar: callData.employeeAvatar,
    type: callData.type || 'outbound',
    status: callData.status || 'completed',
    date: callData.date,
    time: callData.time,
    startTime: callData.startTime,
    endTime: callData.endTime,
    duration: callData.duration,
    durationSeconds: callData.durationSeconds,
    result: callData.result || 'Connected',
    notes: callData.notes,
    purpose: callData.purpose,
    reminder: callData.reminder,
    nextAction: callData.nextAction || 'none',
    nextFollowUp: callData.nextFollowUp,
    service: callData.service,
    leadStatus: callData.leadStatus,
    leadScore: callData.leadScore,
    opportunityCreated: callData.opportunityCreated,
    recordingAvailable: callData.recordingAvailable,
    followUpRequired: callData.followUpRequired,
  };

  const res = await authFetch(CALLS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to log call: HTTP ${res.status}`);
  }

  const data = await res.json();
  const normalized = normalizeCallRecord(data);
  window.dispatchEvent(new Event('crm-calls-updated'));
  window.dispatchEvent(new Event('crm-leads-updated'));
  return normalized;
}

/**
 * Schedule a future call
 */
export async function scheduleCallApi(callData: Partial<CallRecord>): Promise<CallRecord> {
  const payload = {
    leadId: callData.leadId,
    leadCode: callData.leadCode,
    companyName: callData.companyName,
    companyWebsite: callData.companyWebsite,
    contactId: callData.contactId,
    contactName: callData.contactName,
    contactDesignation: callData.contactDesignation,
    contactPhone: callData.contactPhone,
    contactEmail: callData.contactEmail,
    employeeId: callData.employeeId,
    employeeName: callData.employeeName,
    employeeRole: callData.employeeRole,
    employeeAvatar: callData.employeeAvatar,
    type: callData.type || 'outbound',
    status: 'scheduled',
    date: callData.date,
    time: callData.time,
    duration: '00m 00s',
    durationSeconds: 0,
    result: 'Scheduled',
    notes: callData.notes,
    purpose: callData.purpose,
    reminder: callData.reminder,
    nextAction: 'none',
    service: callData.service,
    leadStatus: callData.leadStatus,
    leadScore: callData.leadScore,
    followUpRequired: true,
  };

  const res = await authFetch(`${CALLS_API_URL}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to schedule call: HTTP ${res.status}`);
  }

  const data = await res.json();
  const normalized = normalizeCallRecord(data);
  window.dispatchEvent(new Event('crm-calls-updated'));
  window.dispatchEvent(new Event('crm-leads-updated'));
  return normalized;
}

/**
 * Update an existing call record
 */
export async function updateCallApi(id: string | number, callData: Partial<CallRecord>): Promise<CallRecord> {
  const cleanId = String(id).replace(/^call-(act-|sched-|fu-)?/, '');
  const res = await authFetch(`${CALLS_API_URL}/${cleanId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(callData),
  });

  if (!res.ok) {
    throw new Error(`Failed to update call: HTTP ${res.status}`);
  }

  const data = await res.json();
  const normalized = normalizeCallRecord(data);
  window.dispatchEvent(new Event('crm-calls-updated'));
  return normalized;
}

/**
 * Mark a scheduled call as completed
 */
export async function completeCallApi(
  id: string | number,
  completionData?: { result?: string; notes?: string; duration?: string; durationSeconds?: number }
): Promise<CallRecord> {
  const cleanId = String(id).replace(/^call-(act-|sched-|fu-)?/, '');
  const res = await authFetch(`${CALLS_API_URL}/${cleanId}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(completionData || {}),
  });

  if (!res.ok) {
    throw new Error(`Failed to complete call: HTTP ${res.status}`);
  }

  const data = await res.json();
  const normalized = normalizeCallRecord(data);
  window.dispatchEvent(new Event('crm-calls-updated'));
  return normalized;
}

/**
 * Delete a single call record
 */
export async function deleteCallApi(id: string | number): Promise<boolean> {
  const cleanId = String(id).replace(/^call-(act-|sched-|fu-)?/, '');
  try {
    const res = await authFetch(`${CALLS_API_URL}/${cleanId}`, {
      method: 'DELETE',
    });
    if (!res.ok) return false;
    window.dispatchEvent(new Event('crm-calls-updated'));
    return true;
  } catch (error) {
    console.error(`Failed to delete call ID: ${id}:`, error);
    return false;
  }
}

/**
 * Bulk delete call records
 */
export async function bulkDeleteCallsApi(ids: (string | number)[]): Promise<number> {
  const cleanIds = ids
    .map((id) => Number(String(id).replace(/^call-(act-|sched-|fu-)?/, '')))
    .filter((id) => !isNaN(id));

  if (cleanIds.length === 0) return 0;

  try {
    const res = await authFetch(`${CALLS_API_URL}/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(cleanIds),
    });

    if (!res.ok) return 0;
    const data = await res.json();
    window.dispatchEvent(new Event('crm-calls-updated'));
    return data.deletedCount || cleanIds.length;
  } catch (error) {
    console.error('Failed to bulk delete calls:', error);
    return 0;
  }
}

/**
 * Bulk assign call records to an employee
 */
export async function bulkAssignCallsApi(
  ids: (string | number)[],
  employeeName: string,
  employeeRole: string = 'Sales Representative'
): Promise<number> {
  const cleanIds = ids
    .map((id) => Number(String(id).replace(/^call-(act-|sched-|fu-)?/, '')))
    .filter((id) => !isNaN(id));

  if (cleanIds.length === 0) return 0;

  try {
    const res = await authFetch(`${CALLS_API_URL}/bulk-assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ids: cleanIds,
        employeeName,
        employeeRole,
      }),
    });

    if (!res.ok) return 0;
    const data = await res.json();
    window.dispatchEvent(new Event('crm-calls-updated'));
    return data.assignedCount || cleanIds.length;
  } catch (error) {
    console.error('Failed to bulk assign calls:', error);
    return 0;
  }
}
