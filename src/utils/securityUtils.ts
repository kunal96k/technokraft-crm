/**
 * TechnoKraft CRM Security & Confidentiality Utility
 * 
 * Provides centralized helper functions to safeguard the System Administrator
 * and Super Admin accounts across all modules (Employees, Attendance, Settings).
 * 
 * Note:
 * - System Administrator and Super Admin are the same root administrative role.
 * - Regular 'Admin' is NOT Super Admin and must never be treated as Super Admin.
 * - Never use hardcoded strings (usernames, emails, or codes) since these can be
 *   configured dynamically in production via environment variables (app.superadmin).
 */

export interface SecurityUserLike {
  isSuperAdmin?: boolean | null;
  accessRole?: string | null;
  role?: string | null;
  username?: string | null;
  email?: string | null;
  employeeCode?: string | null;
  employeeName?: string | null;
  employeeRole?: string | null;
}

const SUPER_ADMIN_ROLES = new Set([
  'super admin',
  'superadmin',
  'super_admin',
  'system administrator',
  'system admin',
]);

/**
 * Checks if a given record, employee, or attendance entry belongs to the primary
 * System Administrator or Super Admin account.
 */
export const isSuperAdminRecord = (entity?: SecurityUserLike | null): boolean => {
  if (!entity) return false;

  // 1. Explicit boolean flag if supplied by backend DTO
  if (entity.isSuperAdmin === true || (entity as any).is_super_admin === true) {
    return true;
  }

  // 2. Exact role / accessRole matching against System Administrator & Super Admin.
  // CRITICAL: Regular 'Admin' is NOT Super Admin! Do not use role.includes('admin').
  const accessRole = (entity.accessRole || '').trim().toLowerCase();
  const role = (entity.role || entity.employeeRole || '').trim().toLowerCase();

  return SUPER_ADMIN_ROLES.has(accessRole) || SUPER_ADMIN_ROLES.has(role);
};

/**
 * Checks if the currently logged-in user is a Super Admin or System Administrator.
 */
export const isCurrentUserSuperAdmin = (currentUser?: SecurityUserLike | null): boolean => {
  if (!currentUser) return false;
  return isSuperAdminRecord(currentUser);
};

/**
 * Returns true if the target record should be blurred/masked for the current user
 * for security & confidentiality reasons.
 */
export const shouldMaskForSecurity = (
  target?: SecurityUserLike | null,
  currentUser?: SecurityUserLike | null
): boolean => {
  if (!target) return false;
  // If target is Super Admin / System Admin, and current user is NOT Super Admin / System Admin -> MASK
  return isSuperAdminRecord(target) && !isCurrentUserSuperAdmin(currentUser);
};
