import { Employee, EmployeeFiltersState, DailyAttendanceRecord } from '../types/employees';
import { authFetch } from './apiClient';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string)?.replace(/\/leads$/, '') || '';
const EMPLOYEES_API_URL = `${API_BASE_URL}/api/employees`;

export interface EmployeeQueryParams {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  workStatus?: string;
  crmAccess?: string;
  employmentType?: string;
  manager?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface EmployeesPageResponse {
  content: Employee[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  isBackendConnected: boolean;
}

export interface EmployeeSummaryData {
  total: number;
  active: number;
  presentToday: number;
  currentlyWorking: number;
  inactive: number;
  departmentCounts?: Record<string, number>;
  roleCounts?: Record<string, number>;
  isBackendConnected: boolean;
}

/**
 * Fetch paginated, filtered, sorted employees from Spring Boot backend
 */
export async function fetchEmployees(params: EmployeeQueryParams = {}): Promise<EmployeesPageResponse> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.append('search', params.search.trim());
  if (params.department && params.department !== 'all') query.append('department', params.department);
  if (params.role && params.role !== 'all') query.append('role', params.role);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.workStatus && params.workStatus !== 'all') query.append('workStatus', params.workStatus);
  if (params.crmAccess && params.crmAccess !== 'all') query.append('crmAccess', params.crmAccess);
  if (params.employmentType && params.employmentType !== 'all') query.append('employmentType', params.employmentType);
  if (params.manager && params.manager !== 'all') query.append('manager', params.manager);
  query.append('page', String(params.page ?? 0));
  query.append('size', String(params.size ?? 25));
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortDirection) query.append('sortDirection', params.sortDirection);

  try {
    const res = await authFetch(`${EMPLOYEES_API_URL}?${query.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const pageMeta = data.page || data;
    const content: Employee[] = data.content || [];

    return {
      content,
      totalElements: typeof pageMeta.totalElements === 'number' ? pageMeta.totalElements : content.length,
      totalPages: typeof pageMeta.totalPages === 'number' ? pageMeta.totalPages : 1,
      number: typeof pageMeta.number === 'number' ? pageMeta.number : (params.page ?? 0),
      size: typeof pageMeta.size === 'number' ? pageMeta.size : (params.size ?? 25),
      isBackendConnected: true,
    };
  } catch (error) {
    console.error('[EmployeeService] Failed to fetch employees:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      number: params.page ?? 0,
      size: params.size ?? 25,
      isBackendConnected: false,
    };
  }
}

/**
 * Fetch employee summary statistics for summary metric cards
 */
export async function fetchEmployeeSummary(): Promise<EmployeeSummaryData> {
  try {
    const res = await authFetch(`${EMPLOYEES_API_URL}/summary`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return {
      total: data.total || 0,
      active: data.active || 0,
      presentToday: data.presentToday || 0,
      currentlyWorking: data.currentlyWorking || 0,
      inactive: data.inactive || 0,
      departmentCounts: data.departmentCounts || {},
      roleCounts: data.roleCounts || {},
      isBackendConnected: true,
    };
  } catch (error) {
    console.error('[EmployeeService] Failed to fetch summary:', error);
    return {
      total: 0,
      active: 0,
      presentToday: 0,
      currentlyWorking: 0,
      inactive: 0,
      departmentCounts: {},
      roleCounts: {},
      isBackendConnected: false,
    };
  }
}

/**
 * Fetch single employee by ID
 */
export async function fetchEmployeeById(id: string | number): Promise<Employee | null> {
  const cleanId = String(id).replace(/^emp-/, '');
  try {
    const res = await authFetch(`${EMPLOYEES_API_URL}/${cleanId}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`[EmployeeService] Failed to fetch employee ${id}:`, error);
    return null;
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(payload: Partial<Employee>): Promise<Employee | null> {
  try {
    const res = await authFetch(EMPLOYEES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('[EmployeeService] Failed to create employee:', error);
    throw error;
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: string | number, payload: Partial<Employee>): Promise<Employee | null> {
  const cleanId = String(id).replace(/^emp-/, '');
  try {
    const res = await authFetch(`${EMPLOYEES_API_URL}/${cleanId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`[EmployeeService] Failed to update employee ${id}:`, error);
    throw error;
  }
}

/**
 * Update employee status (Active, Inactive, On Leave, Suspended)
 */
export async function updateEmployeeStatus(id: string | number, status: string): Promise<Employee | null> {
  const cleanId = String(id).replace(/^emp-/, '');
  try {
    const res = await authFetch(`${EMPLOYEES_API_URL}/${cleanId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`[EmployeeService] Failed to update employee status ${id}:`, error);
    return null;
  }
}

/**
 * Reset employee login password
 */
export async function resetEmployeePassword(
  id: string | number,
  newPassword: string,
  forcePasswordReset: boolean = true
): Promise<Employee | null> {
  const cleanId = String(id).replace(/^emp-/, '');
  try {
    const res = await authFetch(`${EMPLOYEES_API_URL}/${cleanId}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ newPassword, forcePasswordReset }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`[EmployeeService] Failed to reset password for employee ${id}:`, error);
    throw error;
  }
}

/**
 * Toggle account locked status
 */
export async function toggleAccountLock(id: string | number, locked: boolean): Promise<Employee | null> {
  const cleanId = String(id).replace(/^emp-/, '');
  try {
    const res = await authFetch(`${EMPLOYEES_API_URL}/${cleanId}/lock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ locked }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`[EmployeeService] Failed to toggle lock for employee ${id}:`, error);
    throw error;
  }
}

/**
 * Soft-delete an employee
 */
export async function deleteEmployee(id: string | number): Promise<boolean> {
  const cleanId = String(id).replace(/^emp-/, '');
  try {
    const res = await authFetch(`${EMPLOYEES_API_URL}/${cleanId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error(`[EmployeeService] Failed to delete employee ${id}:`, error);
    return false;
  }
}

/**
 * Fetch all active employees from backend master employee list
 */
export async function fetchActiveEmployees(): Promise<Employee[]> {
  try {
    const res = await fetchEmployees({ status: 'Active', size: 1000, sortBy: 'name', sortDirection: 'asc' });
    const list = res.content || [];
    return list.filter((e) => e.status === 'Active' && !e.isDeleted);
  } catch (error) {
    console.error('[EmployeeService] Failed to fetch active employees:', error);
    return [];
  }
}

/**
 * Generate daily attendance records from real database employees
 */
export const getTodayAttendanceRecords = (sourceEmployees: Employee[] = []): DailyAttendanceRecord[] => {
  return sourceEmployees.map((emp) => {
    let logoutTime = emp.logoutTime || '—';
    let workingMinutes = 0;
    let breakTime = '0m';
    let breakMinutes = 0;
    let session = emp.todayWorkingTime || '0h 00m';

    if (emp.todayAttendanceStatus === 'Present' || emp.todayAttendanceStatus === 'Late') {
      workingMinutes = emp.todayAttendanceStatus === 'Present' ? 480 : 420;
      breakTime = '45m';
      breakMinutes = 45;
      if (emp.workStatus === 'Working') {
        logoutTime = 'Active (Working)';
      } else if (emp.logoutTime) {
        logoutTime = emp.logoutTime;
      }
    } else if (emp.todayAttendanceStatus === 'Half Day') {
      workingMinutes = 240;
      breakTime = '20m';
      breakMinutes = 20;
    } else {
      workingMinutes = 0;
      breakTime = '0m';
      breakMinutes = 0;
      session = emp.todayWorkingTime || '0h 00m';
    }

    return {
      id: `att-${emp.id}`,
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      employeeName: emp.name,
      employeeRole: emp.role,
      department: emp.department,
      avatar: emp.avatar,
      date: new Date().toISOString().split('T')[0],
      loginTime: emp.loginTime || '—',
      logoutTime,
      workingHours: emp.todayWorkingTime || '—',
      workingMinutes,
      breakTime,
      breakMinutes,
      sessionDuration: session,
      status: emp.todayAttendanceStatus || 'Absent',
      currentActivity: emp.currentActivity || '—',
      workStatus: emp.workStatus || 'Offline',
    };
  });
};
