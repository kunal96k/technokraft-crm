import {
  LayoutDashboard,
  UsersRound,
  Send,
  CalendarClock,
  ChartNoAxesCombined,
  FolderKanban,
  CheckSquare,
  BarChart3,
  UserCheck,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { NavigationSection, NavigationItem, UserRole } from '../types/navigation';

export const NAVIGATION_CONFIG: NavigationSection[] = [
  {
    id: 'crm-main',
    sectionTitle: 'CRM',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'leads',
        title: 'Leads',
        icon: UsersRound,
        badgeColor: 'purple',
        children: [
          {
            id: 'leads-list',
            title: 'Leads List',
            path: '/leads',
          },
          {
            id: 'add-lead',
            title: 'Add Lead',
            path: '/leads/add',
          },
          {
            id: 'bulk-import',
            title: 'Bulk Import',
            path: '/leads/import',
          },
        ],
      },
    ],
  },
  {
    id: 'communication-section',
    sectionTitle: 'COMMUNICATION',
    items: [
      {
        id: 'communication',
        title: 'Communication',
        icon: Send,
        badgeColor: 'blue',
        children: [
          {
            id: 'emails',
            title: 'Emails',
            path: '/communication/emails',
          },
          {
            id: 'whatsapp',
            title: 'WhatsApp',
            path: '/communication/whatsapp',
          },
          {
            id: 'calls',
            title: 'Calls',
            path: '/communication/calls',
          },
        ],
      },
    ],
  },
  {
    id: 'activity-section',
    sectionTitle: 'ACTIVITY',
    items: [
      {
        id: 'follow-ups',
        title: 'Follow-ups',
        icon: CalendarClock,
        badgeColor: 'amber',
        children: [
          {
            id: 'follow-ups-list',
            title: 'Follow-ups',
            path: '/follow-ups',
          },
          {
            id: 'tasks',
            title: 'Tasks',
            path: '/follow-ups/tasks',
          },
          {
            id: 'meetings',
            title: 'Meetings',
            path: '/follow-ups/meetings',
          },
        ],
      },
    ],
  },
  {
    id: 'sales-section',
    sectionTitle: 'SALES',
    items: [
      {
        id: 'opportunities',
        title: 'Opportunities',
        icon: ChartNoAxesCombined,
        children: [
          {
            id: 'pipeline',
            title: 'Pipeline',
            path: '/opportunities/pipeline',
          },
          {
            id: 'proposals',
            title: 'Proposals',
            path: '/opportunities/proposals',
          },
        ],
      },
    ],
  },
  {
    id: 'delivery-section',
    sectionTitle: 'DELIVERY & PROJECTS',
    items: [
      {
        id: 'projects',
        title: 'Projects',
        icon: FolderKanban,
        badgeColor: 'blue',
        children: [
          {
            id: 'projects-list',
            title: 'All Projects',
            path: '/projects',
          },
          {
            id: 'kanban-board',
            title: 'Kanban Board',
            path: '/projects/board',
          },
        ],
      },
      {
        id: 'my-work',
        title: 'My Work',
        path: '/work/my-tasks',
        icon: CheckSquare,
        badgeColor: 'green',
      },
    ],
  },
  {
    id: 'reports-section',
    sectionTitle: 'REPORTS',
    items: [
      {
        id: 'reports',
        title: 'Reports',
        icon: BarChart3,
        children: [
          {
            id: 'performance-report',
            title: 'Performance Report',
            path: '/reports/performance',
          },
          {
            id: 'analytics',
            title: 'Analytics',
            path: '/reports/analytics',
          },
        ],
      },
    ],
  },
  {
    id: 'admin-section',
    sectionTitle: 'ADMINISTRATION',
    items: [
      {
        id: 'employees',
        title: 'Employees',
        icon: UserCheck,
        roles: ['Super Admin', 'Admin', 'Sales Manager', 'Manager'],
        children: [
          {
            id: 'employee-list',
            title: 'Employee List',
            path: '/employees',
          },
          {
            id: 'attendance',
            title: 'Attendance',
            path: '/employees/attendance',
          },
        ],
      },
      {
        id: 'audit-logs',
        title: 'Audit Logs',
        path: '/audit-logs',
        icon: ShieldCheck,
        roles: ['Super Admin'],
      },
      {
        id: 'settings',
        title: 'Settings',
        path: '/settings/general',
        icon: Settings,
        roles: ['Super Admin', 'Admin', 'Sales Manager', 'Manager'],
      },
    ],
  },
];

/**
 * Helper to check whether the current user role can view a module or navigation item.
 * Defaults to true if no specific role restriction is configured.
 */
export function canViewModule(
  item: NavigationItem,
  currentRole: UserRole | string,
  allowedModules?: string[]
): boolean {
  const normRole = (currentRole || '').trim().toLowerCase();
  const isSuperOrSystemAdmin =
    normRole === 'super admin' ||
    normRole === 'superadmin' ||
    normRole === 'system administrator' ||
    normRole === 'system admin';

  // Audit Logs is STRICTLY restricted to Super Admin / System Administrator ONLY
  if (item.id === 'audit-logs') {
    return isSuperOrSystemAdmin;
  }

  if (isSuperOrSystemAdmin) {
    return true;
  }
  // When allowedModules is explicitly configured for this user, it dictates link access
  if (allowedModules !== undefined && allowedModules !== null && Array.isArray(allowedModules) && allowedModules.length > 0) {
    if (item.id === 'projects' || item.id === 'my-work') {
      return allowedModules.includes('projects');
    }
    return allowedModules.includes(item.id);
  }
  // Fallback to role-based restrictions
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  return item.roles.some((r) => {
    const nr = r.toLowerCase();
    if (nr === normRole) return true;
    if ((nr === 'sales manager' || nr === 'manager') && (normRole === 'sales manager' || normRole === 'manager')) return true;
    if (normRole === 'admin' && nr === 'admin') return true;
    return false;
  });
}

/**
 * Helper to check route accessibility for the given role and allowed modules.
 */
export function canAccessRoute(
  path: string,
  currentRole: UserRole | string,
  allowedModules?: string[]
): boolean {
  for (const section of NAVIGATION_CONFIG) {
    for (const item of section.items) {
      if (item.path === path) {
        return canViewModule(item, currentRole, allowedModules);
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            return canViewModule(item, currentRole, allowedModules);
          }
        }
      }
    }
  }
  return true;
}

export const INITIAL_USER_PROFILE = {
  name: 'Manager',
  initials: 'MP',
  email: 'manager@technokraft.com',
  role: 'Sales Manager' as UserRole,
  department: 'Sales & Business Development',
};

