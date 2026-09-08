import {
  LayoutDashboard,
  UsersRound,
  Send,
  CalendarClock,
  ChartNoAxesCombined,
  BarChart3,
  UserCheck,
  Settings,
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
        badge: '1,284',
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
        badge: '5',
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
        badge: '12',
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
        roles: ['Super Admin', 'Admin', 'Sales Manager'],
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
        id: 'settings',
        title: 'Settings',
        icon: Settings,
        roles: ['Super Admin', 'Admin', 'Sales Manager'],
        children: [
          {
            id: 'users-roles',
            title: 'Users & Roles',
            path: '/settings/users',
          },
          {
            id: 'general-settings',
            title: 'General Settings',
            path: '/settings/general',
          },
        ],
      },
    ],
  },
];

/**
 * Helper to check whether the current user role can view a module or navigation item.
 * Defaults to true if no specific role restriction is configured.
 */
export function canViewModule(item: NavigationItem, currentRole: UserRole): boolean {
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  return item.roles.includes(currentRole);
}

/**
 * Helper to check route accessibility for the given role
 */
export function canAccessRoute(path: string, currentRole: UserRole): boolean {
  for (const section of NAVIGATION_CONFIG) {
    for (const item of section.items) {
      if (item.path === path) {
        return canViewModule(item, currentRole);
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            const childRoles = child.roles || item.roles;
            if (!childRoles || childRoles.length === 0) return true;
            return childRoles.includes(currentRole);
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

export const SAMPLE_NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'New lead assigned',
    description: 'ABC Technologies (Cloud Migration) assigned to you',
    time: '10 mins ago',
    unread: true,
    type: 'lead' as const,
  },
  {
    id: 'n-2',
    title: 'Follow-up due in 30 mins',
    description: 'Follow-up call with XYZ Solutions scheduled at 12:00 PM',
    time: '25 mins ago',
    unread: true,
    type: 'followup' as const,
  },
  {
    id: 'n-3',
    title: 'Task overdue',
    description: 'Proposal revision for Global IT Services is past deadline',
    time: '1 hour ago',
    unread: true,
    type: 'task' as const,
  },
  {
    id: 'n-4',
    title: 'Requirement document received',
    description: 'Sneha Kulkarni uploaded RFP for NextGen Pvt Ltd',
    time: '3 hours ago',
    unread: false,
    type: 'requirement' as const,
  },
  {
    id: 'n-5',
    title: 'Proposal update',
    description: 'Client viewed Proposal #TK-2026-084 for $42.5K',
    time: 'Yesterday',
    unread: false,
    type: 'proposal' as const,
  },
];
