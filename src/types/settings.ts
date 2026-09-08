export type UserStatus = 'Active' | 'Inactive' | 'Pending Invitation' | 'Locked';

export type UserRoleType =
  | 'Super Admin'
  | 'Admin'
  | 'Manager'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Business Analyst'
  | 'Employee'
  | string;

export type DepartmentType =
  | 'Sales'
  | 'Business Analysis'
  | 'Development'
  | 'QA / Testing'
  | 'DevOps'
  | 'UI/UX'
  | 'HR'
  | 'Finance'
  | 'Administration'
  | 'Management'
  | string;

export interface CrmUser {
  id: string;
  employeeId: string; // e.g. EMP-0012
  name: string;
  email: string;
  avatar: string;
  role: UserRoleType;
  department: DepartmentType;
  reportingManager?: string;
  status: UserStatus;
  crmAccess: boolean;
  lastLogin: string; // e.g. "Today 09:18 AM"
  lastActivity: string; // e.g. "Today 12:08 PM"
  createdDate: string; // e.g. "12 Jan 2025"
  dateAdded?: string;
  invitationSentAt?: string;
}

export type CrmModule =
  | 'Dashboard'
  | 'Leads'
  | 'Calls'
  | 'Emails'
  | 'WhatsApp'
  | 'Follow-ups'
  | 'Tasks'
  | 'Meetings'
  | 'Opportunities'
  | 'Proposals'
  | 'Reports'
  | 'Employees'
  | 'Settings';

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  userCount: number;
  description: string;
  status: 'Active' | 'Inactive';
  isSystem: boolean; // cannot be deleted
  permissions: Record<CrmModule, ModulePermission>;
}

// ---------------- General Settings Types ---------------- //

export interface CompanySettingsData {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  logoUrl: string;
}

export interface CrmPreferencesData {
  defaultLeadStatus: string;
  defaultLeadOwner: string;
  defaultOpportunityStage: string;
  defaultCurrency: string;
  defaultDateFormat: string;
  defaultTimezone: string;
}

export interface LeadStatusConfig {
  id: string;
  name: string;
  description: string;
  active: boolean;
  order: number;
  isSystem: boolean;
  color: string;
}

export interface LeadSourceConfig {
  id: string;
  name: string;
  active: boolean;
  isSystem: boolean;
}

export interface LeadPriorityConfig {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

export interface PipelineStageConfig {
  id: string;
  name: string;
  probability: number;
  order: number;
  active: boolean;
  isSystem: boolean;
}

export interface CommunicationConfigData {
  defaultEmailSender: string;
  defaultSignature: string;
  whatsappEnabled: boolean;
  callLoggingEnabled: boolean;
}

export interface FollowupConfigData {
  defaultReminder: '15 minutes' | '30 minutes' | '1 hour' | '1 day';
  defaultStatus: 'Pending' | 'Scheduled';
  autoCreateNextFollowUp: boolean;
}

export interface NotificationTypePreference {
  id: string;
  name: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

export interface EmailConfigData {
  provider: string; // e.g. "SMTP"
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: number;
  encryption: 'TLS' | 'SSL' | 'None';
  username: string;
  passwordMasked: string;
  signatureText: string;
}

export interface AppearanceConfigData {
  theme: 'Light' | 'Dark' | 'System' | 'light' | 'dark' | 'system';
  density: 'Comfortable' | 'Compact' | 'comfortable' | 'compact';
}

export interface GeneralSettingsState {
  company: CompanySettingsData;
  crm: CrmPreferencesData;
  leadStatuses: LeadStatusConfig[];
  leadSources: LeadSourceConfig[];
  pipelineStages: PipelineStageConfig[];
  communication: CommunicationConfigData;
  followups: FollowupConfigData;
  notifications: NotificationTypePreference[];
  email: EmailConfigData;
  appearance: AppearanceConfigData;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  module: string;
  changedItem: string;
  details: string;
}
