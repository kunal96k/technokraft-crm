import { LucideIcon } from 'lucide-react';

export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Business Analyst'
  | 'Technical Team'
  | 'Project Manager'
  | 'Employee';

export interface NavigationChildItem {
  id: string;
  title: string;
  path: string;
  badge?: string | number;
  roles?: UserRole[];
  permission?: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  path?: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: 'purple' | 'red' | 'green' | 'amber' | 'blue';
  roles?: UserRole[];
  permission?: string;
  children?: NavigationChildItem[];
}

export interface NavigationSection {
  id: string;
  sectionTitle?: string;
  roles?: UserRole[];
  items: NavigationItem[];
}

export interface UserProfile {
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'lead' | 'followup' | 'task' | 'requirement' | 'proposal' | 'system';
}

export interface QuickActionItem {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  actionKey: string;
  path?: string;
}
