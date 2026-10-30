import { authFetch } from './apiClient';
import { DailyAttendanceRecord } from '../types/employees';

export interface AttendanceQueryParams {
  search?: string;
  department?: string;
  status?: string;
  employeeId?: string;
  datePreset?: string;
  startDate?: string;
  endDate?: string;
  workStatus?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AttendancePageResponse {
  content: DailyAttendanceRecord[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface AttendanceSummaryData {
  presentToday: number;
  absent: number;
  onLeave: number;
  late: number;
  halfDay?: number;
  currentlyWorking: number;
  totalEmployees: number;
  attendanceRate: number;
}

/**
 * Fetch server-side paginated, sorted, and filtered attendance records
 */
export async function fetchAttendanceRecords(
  params: AttendanceQueryParams = {}
): Promise<AttendancePageResponse> {
  const query = new URLSearchParams();

  if (params.search) query.append('search', params.search.trim());
  if (params.department && params.department !== 'All') query.append('department', params.department);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.employeeId) query.append('employeeId', params.employeeId);
  if (params.datePreset) query.append('datePreset', params.datePreset);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.workStatus) query.append('workStatus', params.workStatus);
  if (params.page !== undefined) query.append('page', String(params.page));
  if (params.size !== undefined) query.append('size', String(params.size));
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortDirection) query.append('sortDirection', params.sortDirection);

  const res = await authFetch(`/api/attendance?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch attendance records: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch real-time attendance telemetry summary for dashboard cards
 */
export async function fetchAttendanceSummary(
  params: { department?: string; status?: string; datePreset?: string; startDate?: string; endDate?: string } = {}
): Promise<AttendanceSummaryData> {
  const query = new URLSearchParams();
  if (params.department && params.department !== 'All') query.append('department', params.department);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.datePreset) query.append('datePreset', params.datePreset);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);

  const res = await authFetch(`/api/attendance/summary?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch attendance summary: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Record check-in timestamp
 */
export async function checkInAttendance(
  employeeId?: string,
  notes?: string
): Promise<DailyAttendanceRecord> {
  const res = await authFetch('/api/attendance/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: employeeId ? Number(employeeId) : undefined, notes }),
  });
  if (!res.ok) {
    throw new Error(`Check-in failed: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Record check-out timestamp
 */
export async function checkOutAttendance(
  employeeId?: string,
  notes?: string
): Promise<DailyAttendanceRecord> {
  const res = await authFetch('/api/attendance/check-out', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: employeeId ? Number(employeeId) : undefined, notes }),
  });
  if (!res.ok) {
    throw new Error(`Check-out failed: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Admin/Manager update of attendance record
 */
export async function updateAttendanceRecord(
  id: string,
  data: { status?: string; workStatus?: string; currentActivity?: string; notes?: string }
): Promise<DailyAttendanceRecord> {
  const res = await authFetch(`/api/attendance/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Update attendance failed: HTTP ${res.status}`);
  }
  return res.json();
}
