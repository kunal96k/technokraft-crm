/**
 * TechnoKraft CRM Security & Confidentiality Utility
 * 
 * Provides centralized helper functions to safeguard the System Administrator
 * and Super Admin accounts across all modules (Employees, Attendance, Settings).
 * 
 * Note:
 * - Siddhant Dadel (siddhantdadel10@gmail.com) is the ONE AND ONLY Superior Root Super Admin.
 *   The Superior Super Admin has full, unrestricted access to manage, edit, activate, deactivate,
 *   or delete any user in the system (including other Super Admins).
 * - Regular 'Admin' is NOT Super Admin and must never be treated as Super Admin.
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
]);

/**
 * Returns true if the user is the ONE AND ONLY Superior Root Super Admin.
 * Has unrestricted full authority over all users, including other Super Admins.
 */
export const isSuperiorSuperAdmin = (entity?: SecurityUserLike | null): boolean => {
  if (!entity) return false;
  const email = (entity.email || '').trim().toLowerCase();
  const username = (entity.username || '').trim().toLowerCase();
  return (
    email === 'siddhantdadel10@gmail.com' ||
    username === 'siddhantdadel' ||
    username === 'siddhantdadel10'
  );
};

/**
 * Checks if a given record, employee, or attendance entry belongs to any Super Admin account.
 */
export const isSuperAdminRecord = (entity?: SecurityUserLike | null): boolean => {
  if (!entity) return false;

  // 1. Explicit boolean flag if supplied by backend DTO
  if (entity.isSuperAdmin === true || (entity as any).is_super_admin === true) {
    return true;
  }

  // 2. Exact accessRole matching against Super Admin.
  const accessRole = (entity.accessRole || '').trim().toLowerCase();
  if (SUPER_ADMIN_ROLES.has(accessRole)) {
    return true;
  }

  // 3. Known Super Admin accounts: Siddhant Dadel (Superior Super Admin) and Kunal Patil
  const email = (entity.email || '').trim().toLowerCase();
  const username = (entity.username || '').trim().toLowerCase();
  if (
    email === 'siddhantdadel10@gmail.com' ||
    username === 'siddhantdadel' ||
    username === 'siddhantdadel10' ||
    email === 'kunalpatil192001@gmail.com' ||
    username === 'kunal11' ||
    username === 'kunall11'
  ) {
    return true;
  }

  return false;
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
  // Superior Super Admin sees EVERYTHING unmasked
  if (isSuperiorSuperAdmin(currentUser)) return false;
  // If target is Super Admin / System Admin, and current user is NOT Super Admin / System Admin -> MASK
  return isSuperAdminRecord(target) && !isCurrentUserSuperAdmin(currentUser);
};
