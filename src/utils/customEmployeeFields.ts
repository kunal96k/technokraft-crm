import { DEPARTMENTS, EMPLOYEE_ROLES } from '../types/employees';

export const CUSTOM_DEPARTMENTS_STORAGE_KEY = 'technokraft_custom_departments';
export const CUSTOM_ROLES_STORAGE_KEY = 'technokraft_custom_roles';

/**
 * Retrieve saved custom departments from localStorage
 */
export function getCustomDepartments(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_DEPARTMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((d): d is string => typeof d === 'string' && d.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

/**
 * Save a new custom department into localStorage if not already existing
 */
export function saveCustomDepartment(dept: string): string[] {
  const trimmed = dept.trim();
  if (!trimmed) return getCustomDepartments();
  const current = getCustomDepartments();
  const defaultExists = (DEPARTMENTS as readonly string[]).some(
    (d) => d.toLowerCase() === trimmed.toLowerCase()
  );
  if (!defaultExists && !current.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
    const updated = [...current, trimmed];
    try {
      localStorage.setItem(CUSTOM_DEPARTMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[customEmployeeFields] Failed to save custom department:', e);
    }
    return updated;
  }
  return current;
}

/**
 * Retrieve saved custom roles/designations from localStorage
 */
export function getCustomRoles(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ROLES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

/**
 * Save a new custom role/designation into localStorage if not already existing
 */
export function saveCustomRole(role: string): string[] {
  const trimmed = role.trim();
  if (!trimmed) return getCustomRoles();
  const current = getCustomRoles();
  const defaultExists = (EMPLOYEE_ROLES as readonly string[]).some(
    (r) => r.toLowerCase() === trimmed.toLowerCase()
  );
  if (!defaultExists && !current.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
    const updated = [...current, trimmed];
    try {
      localStorage.setItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[customEmployeeFields] Failed to save custom role:', e);
    }
    return updated;
  }
  return current;
}

/**
 * Combine default departments, custom saved departments, and any dynamic extras (e.g. from existing employees)
 */
export function getAllDepartments(extraDepts: (string | undefined | null)[] = []): string[] {
  const custom = getCustomDepartments();
  const extras = extraDepts.filter((d): d is string => typeof d === 'string' && d.trim().length > 0);
  const set = new Set<string>();

  // 1. Defaults first
  DEPARTMENTS.forEach((d) => set.add(d));
  // 2. Custom from localStorage
  custom.forEach((d) => set.add(d));
  // 3. Extra from existing employee records
  extras.forEach((d) => set.add(d));

  return Array.from(set);
}

/**
 * Combine default employee roles, custom saved roles, and any dynamic extras (e.g. from existing employees)
 */
export function getAllRoles(extraRoles: (string | undefined | null)[] = []): string[] {
  const custom = getCustomRoles();
  const extras = extraRoles.filter((r): r is string => typeof r === 'string' && r.trim().length > 0);
  const set = new Set<string>();

  // 1. Defaults first
  EMPLOYEE_ROLES.forEach((r) => set.add(r));
  // 2. Custom from localStorage
  custom.forEach((r) => set.add(r));
  // 3. Extra from existing employee records
  extras.forEach((r) => set.add(r));

  return Array.from(set);
}
