import {
  FollowUpRecord,
  FollowUpStats,
  EmployeePerformance,
  FollowUpTab,
  FollowUpOutcome,
  FollowUpPriority,
} from '../types/followUps';
import { authFetch } from './apiClient';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string)?.replace(/\/leads$/, '') || '';
const FOLLOWUPS_API_URL = `${API_BASE_URL}/api/followups`;

export interface FollowUpQueryParams {
  tab?: FollowUpTab | string;
  status?: string;
  priority?: string;
  type?: string;
  assignedTo?: string;
  service?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface FollowUpsPageResponse {
  content: FollowUpRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  isBackendConnected: boolean;
}

export interface FollowUpStatsResponse extends FollowUpStats {
  total: number;
  tabCounts: Record<string, number>;
  isBackendConnected: boolean;
}

/**
 * Fetch filtered, sorted, paginated follow-ups from Spring Boot backend
 */
export async function fetchFollowUps(params: FollowUpQueryParams = {}): Promise<FollowUpsPageResponse> {
  const query = new URLSearchParams();
  if (params.tab && params.tab !== 'all') query.append('tab', params.tab);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
  if (params.type && params.type !== 'all') query.append('type', params.type);
  if (params.assignedTo && params.assignedTo !== 'all') query.append('assignedTo', params.assignedTo);
  if (params.service && params.service !== 'all') query.append('service', params.service);
  if (params.search?.trim()) query.append('search', params.search.trim());
  query.append('page', String(params.page ?? 0));
  query.append('size', String(params.size ?? 100));

  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}?${query.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const pageMeta = data.page || data;
    const content: FollowUpRecord[] = data.content || [];

    return {
      content,
      totalElements: typeof pageMeta.totalElements === 'number' ? pageMeta.totalElements : content.length,
      totalPages: typeof pageMeta.totalPages === 'number' ? pageMeta.totalPages : 1,
      number: typeof pageMeta.number === 'number' ? pageMeta.number : 0,
      size: typeof pageMeta.size === 'number' ? pageMeta.size : (params.size ?? 100),
      isBackendConnected: true,
    };
  } catch (error) {
    console.error('[FollowUpService] Failed to fetch follow-ups:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      number: params.page ?? 0,
      size: params.size ?? 100,
      isBackendConnected: false,
    };
  }
}

/**
 * Fetch live follow-up summary statistics
 */
export async function fetchFollowUpStats(): Promise<FollowUpStatsResponse> {
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/stats`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return {
      today: data.today || 0,
      upcoming: data.upcoming || 0,
      overdue: data.overdue || 0,
      completed: data.completed || 0,
      highPriority: data.highPriority || 0,
      total: data.total || 0,
      tabCounts: data.tabCounts || {
        all: data.total || 0,
        today: data.today || 0,
        upcoming: data.upcoming || 0,
        overdue: data.overdue || 0,
        completed: data.completed || 0,
      },
      isBackendConnected: true,
    };
  } catch (error) {
    console.error('[FollowUpService] Failed to fetch follow-up stats:', error);
    return {
      today: 0,
      upcoming: 0,
      overdue: 0,
      completed: 0,
      highPriority: 0,
      total: 0,
      tabCounts: { all: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 },
      isBackendConnected: false,
    };
  }
}

/**
 * Fetch team accountability performance breakdown
 */
export async function fetchTeamPerformance(): Promise<EmployeePerformance[]> {
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/team-performance`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[FollowUpService] Failed to fetch team performance:', error);
    return [];
  }
}

/**
 * Create a new follow-up in the database
 */
export async function createFollowUp(payload: Partial<FollowUpRecord>): Promise<FollowUpRecord | null> {
  try {
    const res = await authFetch(FOLLOWUPS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[FollowUpService] Failed to create follow-up:', error);
    return null;
  }
}

/**
 * Mark follow-up as completed
 */
export async function completeFollowUp(
  id: string | number,
  completionNotes?: string,
  outcome?: string
): Promise<FollowUpRecord | null> {
  const cleanId = String(id).replace(/^fu-/, '');
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/${cleanId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ completionNotes, outcome }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`[FollowUpService] Failed to complete follow-up ${id}:`, error);
    return null;
  }
}

/**
 * Reschedule follow-up to new date and time
 */
export async function rescheduleFollowUp(
  id: string | number,
  date: string,
  time?: string,
  reason?: string
): Promise<FollowUpRecord | null> {
  const cleanId = String(id).replace(/^fu-/, '');
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/${cleanId}/reschedule`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ date, time, reason }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`[FollowUpService] Failed to reschedule follow-up ${id}:`, error);
    return null;
  }
}

/**
 * Update an existing follow-up
 */
export async function updateFollowUp(
  id: string | number,
  payload: Partial<FollowUpRecord>
): Promise<FollowUpRecord | null> {
  const cleanId = String(id).replace(/^fu-/, '');
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/${cleanId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`[FollowUpService] Failed to update follow-up ${id}:`, error);
    return null;
  }
}

/**
 * Cancel a follow-up (marks status as CANCELLED in database)
 */
export async function cancelFollowUp(id: string | number): Promise<boolean> {
  const result = await updateFollowUp(id, { status: 'CANCELLED' });
  return result !== null;
}

/**
 * Delete a follow-up
 */
export async function deleteFollowUp(id: string | number): Promise<boolean> {
  const cleanId = String(id).replace(/^fu-/, '');
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/${cleanId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error(`[FollowUpService] Failed to delete follow-up ${id}:`, error);
    return false;
  }
}

/**
 * Bulk complete follow-ups
 */
export async function bulkCompleteFollowUps(ids: (string | number)[]): Promise<number> {
  const numericIds = ids.map((id) => Number(String(id).replace(/^fu-/, ''))).filter((n) => !isNaN(n));
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/bulk-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(numericIds),
    });

    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    console.error('[FollowUpService] Bulk complete failed:', error);
    return 0;
  }
}

/**
 * Bulk reschedule follow-ups
 */
export async function bulkRescheduleFollowUps(
  ids: (string | number)[],
  date: string,
  time?: string
): Promise<number> {
  const numericIds = ids.map((id) => Number(String(id).replace(/^fu-/, ''))).filter((n) => !isNaN(n));
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/bulk-reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: numericIds, date, time: time || '11:00' }),
    });

    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    console.error('[FollowUpService] Bulk reschedule failed:', error);
    return 0;
  }
}

/**
 * Bulk reassign follow-ups
 */
export async function bulkReassignFollowUps(
  ids: (string | number)[],
  newAssignee: string
): Promise<number> {
  const numericIds = ids.map((id) => Number(String(id).replace(/^fu-/, ''))).filter((n) => !isNaN(n));
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/bulk-reassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: numericIds, newAssignee }),
    });

    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    console.error('[FollowUpService] Bulk reassign failed:', error);
    return 0;
  }
}

/**
 * Bulk update follow-ups priority
 */
export async function bulkUpdateFollowUpPriority(
  ids: (string | number)[],
  priority: string
): Promise<number> {
  const numericIds = ids.map((id) => Number(String(id).replace(/^fu-/, ''))).filter((n) => !isNaN(n));
  try {
    const res = await authFetch(`${FOLLOWUPS_API_URL}/bulk-priority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: numericIds, priority }),
    });

    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    console.error('[FollowUpService] Bulk update priority failed:', error);
    return 0;
  }
}

