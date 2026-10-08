import {
  CrmUser,
  RoleDefinition,
  CompanySettingsData,
  CrmPreferencesData,
  LeadStatusConfig,
  LeadSourceConfig,
  PipelineStageConfig,
  CommunicationConfigData,
  FollowupConfigData,
  NotificationTypePreference,
  EmailConfigData,
  AppearanceConfigData,
  GeneralSettingsState,
  AuditLogEntry,
  CrmModule,
  ModulePermission,
} from '../types/settings';

// Helper to generate full permission set
function createFullPermissions(view = true, create = true, edit = true, del = true, exp = true): ModulePermission {
  return { view, create, edit, delete: del, export: exp };
}

const ALL_MODULES: CrmModule[] = [
  'Dashboard',
  'Leads',
  'Calls',
  'Emails',
  'WhatsApp',
  'Follow-ups',
  'Tasks',
  'Meetings',
  'Opportunities',
  'Proposals',
  'Reports',
  'Employees',
  'Settings',
];

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'role-admin',
    name: 'Admin',
    userCount: 0,
    description: 'Full administrative access across all CRM modules, employee profiles, and system settings.',
    status: 'Active',
    isSystem: true,
    permissions: ALL_MODULES.reduce((acc, mod) => {
      acc[mod] = createFullPermissions(true, true, true, true, true);
      return acc;
    }, {} as Record<CrmModule, ModulePermission>),
  },
  {
    id: 'role-sales-manager',
    name: 'Sales Manager',
    userCount: 0,
    description: 'Manages sales teams, assigns pipelines, views consolidated reports and staff workloads.',
    status: 'Active',
    isSystem: true,
    permissions: {
      Dashboard: createFullPermissions(true, false, false, false, true),
      Leads: createFullPermissions(true, true, true, true, true),
      Calls: createFullPermissions(true, true, true, false, true),
      Emails: createFullPermissions(true, true, true, false, true),
      WhatsApp: createFullPermissions(true, true, true, false, true),
      'Follow-ups': createFullPermissions(true, true, true, true, true),
      Tasks: createFullPermissions(true, true, true, true, true),
      Meetings: createFullPermissions(true, true, true, true, true),
      Opportunities: createFullPermissions(true, true, true, true, true),
      Proposals: createFullPermissions(true, true, true, true, true),
      Reports: createFullPermissions(true, true, true, false, true),
      Employees: createFullPermissions(true, true, true, false, true),
      Settings: createFullPermissions(true, false, false, false, false),
    },
  },
  {
    id: 'role-sales-executive',
    name: 'Sales Executive',
    userCount: 0,
    description: 'Can manage assigned leads, log outbound activities, create proposals, and view personal metrics.',
    status: 'Active',
    isSystem: true,
    permissions: {
      Dashboard: createFullPermissions(true, false, false, false, false),
      Leads: createFullPermissions(true, true, true, false, true),
      Calls: createFullPermissions(true, true, true, false, false),
      Emails: createFullPermissions(true, true, false, false, false),
      WhatsApp: createFullPermissions(true, true, false, false, false),
      'Follow-ups': createFullPermissions(true, true, true, false, false),
      Tasks: createFullPermissions(true, true, true, false, false),
      Meetings: createFullPermissions(true, true, true, false, false),
      Opportunities: createFullPermissions(true, true, true, false, false),
      Proposals: createFullPermissions(true, true, true, false, true),
      Reports: createFullPermissions(true, false, false, false, false),
      Employees: createFullPermissions(false, false, false, false, false),
      Settings: createFullPermissions(false, false, false, false, false),
    },
  },
  {
    id: 'role-manager',
    name: 'Manager',
    userCount: 0,
    description: 'Departmental manager with team supervisory, reporting and approval privileges.',
    status: 'Active',
    isSystem: true,
    permissions: {
      Dashboard: createFullPermissions(true, false, false, false, true),
      Leads: createFullPermissions(true, true, true, false, true),
      Calls: createFullPermissions(true, true, false, false, false),
      Emails: createFullPermissions(true, true, false, false, false),
      WhatsApp: createFullPermissions(true, true, false, false, false),
      'Follow-ups': createFullPermissions(true, true, true, false, false),
      Tasks: createFullPermissions(true, true, true, true, true),
      Meetings: createFullPermissions(true, true, true, false, true),
      Opportunities: createFullPermissions(true, true, true, false, true),
      Proposals: createFullPermissions(true, true, true, false, true),
      Reports: createFullPermissions(true, true, true, false, true),
      Employees: createFullPermissions(true, false, false, false, false),
      Settings: createFullPermissions(false, false, false, false, false),
    },
  },
  {
    id: 'role-business-analyst',
    name: 'Business Analyst',
    userCount: 0,
    description: 'Gathers requirements, produces technical proposals, and tracks conversion analytics.',
    status: 'Active',
    isSystem: true,
    permissions: {
      Dashboard: createFullPermissions(true, false, false, false, true),
      Leads: createFullPermissions(true, false, false, false, true),
      Calls: createFullPermissions(true, false, false, false, false),
      Emails: createFullPermissions(true, false, false, false, false),
      WhatsApp: createFullPermissions(true, false, false, false, false),
      'Follow-ups': createFullPermissions(true, false, false, false, false),
      Tasks: createFullPermissions(true, true, true, false, false),
      Meetings: createFullPermissions(true, true, true, false, false),
      Opportunities: createFullPermissions(true, false, true, false, true),
      Proposals: createFullPermissions(true, true, true, false, true),
      Reports: createFullPermissions(true, false, false, false, true),
      Employees: createFullPermissions(false, false, false, false, false),
      Settings: createFullPermissions(false, false, false, false, false),
    },
  },
  {
    id: 'role-employee',
    name: 'Employee',
    userCount: 0,
    description: 'Basic CRM access for non-sales personnel to log work sessions, meetings, and view updates.',
    status: 'Active',
    isSystem: true,
    permissions: {
      Dashboard: createFullPermissions(true, false, false, false, false),
      Leads: createFullPermissions(false, false, false, false, false),
      Calls: createFullPermissions(false, false, false, false, false),
      Emails: createFullPermissions(false, false, false, false, false),
      WhatsApp: createFullPermissions(false, false, false, false, false),
      'Follow-ups': createFullPermissions(false, false, false, false, false),
      Tasks: createFullPermissions(true, false, true, false, false),
      Meetings: createFullPermissions(true, false, false, false, false),
      Opportunities: createFullPermissions(false, false, false, false, false),
      Proposals: createFullPermissions(false, false, false, false, false),
      Reports: createFullPermissions(false, false, false, false, false),
      Employees: createFullPermissions(false, false, false, false, false),
      Settings: createFullPermissions(false, false, false, false, false),
    },
  },
];

export const INITIAL_USERS: CrmUser[] = [];

export const INITIAL_COMPANY_SETTINGS: CompanySettingsData = {
  companyName: 'TechnoKraft Services LLP',
  companyEmail: 'info@technokraftservices.com',
  companyPhone: '+91 93701 74424',
  website: 'https://www.technokraftservices.com',
  address: "3rd Floor, Kanchwala Avenue, Above Viju's Dabeli, Thatte Nagar Marg, College Road",
  city: 'Nashik',
  state: 'Maharashtra',
  country: 'India',
  timezone: 'Asia/Kolkata',
  currency: 'INR (₹)',
  dateFormat: 'DD/MM/YYYY',
  logoUrl: '',
};

export const INITIAL_CRM_PREFERENCES: CrmPreferencesData = {
  defaultLeadStatus: 'New',
  defaultLeadOwner: 'Sales Team',
  defaultOpportunityStage: 'Qualified',
  defaultCurrency: 'INR (₹)',
  defaultDateFormat: 'DD/MM/YYYY',
  defaultTimezone: 'Asia/Kolkata',
};

export const INITIAL_LEAD_STATUSES: LeadStatusConfig[] = [
  { id: 'ls-1', name: 'New', description: 'Freshly sourced lead awaiting first contact', active: true, order: 1, isSystem: true, color: 'blue' },
  { id: 'ls-2', name: 'Contacted', description: 'Initial outreach made via call or email', active: true, order: 2, isSystem: true, color: 'purple' },
  { id: 'ls-3', name: 'Interested', description: 'Lead expressed interest in cloud/IT services', active: true, order: 3, isSystem: false, color: 'amber' },
  { id: 'ls-4', name: 'Qualified', description: 'BANT criteria met; qualified for sales pitch', active: true, order: 4, isSystem: true, color: 'indigo' },
  { id: 'ls-5', name: 'Proposal', description: 'Formal commercial quote or scope of work delivered', active: true, order: 5, isSystem: true, color: 'cyan' },
  { id: 'ls-6', name: 'Negotiation', description: 'Commercial terms or pricing being negotiated', active: true, order: 6, isSystem: false, color: 'orange' },
  { id: 'ls-7', name: 'Won', description: 'Deal signed and payment received', active: true, order: 7, isSystem: true, color: 'emerald' },
  { id: 'ls-8', name: 'Lost', description: 'Lead dropped, opted out, or chose competitor', active: true, order: 8, isSystem: true, color: 'rose' },
];

export const INITIAL_LEAD_SOURCES: LeadSourceConfig[] = [
  { id: 'src-1', name: 'LinkedIn', active: true, isSystem: true },
  { id: 'src-2', name: 'Cold Calling', active: true, isSystem: true },
  { id: 'src-3', name: 'Website', active: true, isSystem: true },
  { id: 'src-4', name: 'Referral', active: true, isSystem: true },
  { id: 'src-5', name: 'IndiaMART', active: true, isSystem: false },
  { id: 'src-6', name: 'Email Campaign', active: true, isSystem: false },
  { id: 'src-7', name: 'Existing Customer', active: true, isSystem: false },
  { id: 'src-8', name: 'Other', active: true, isSystem: true },
];

export const INITIAL_PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: 'stg-1', name: 'Qualified', probability: 40, order: 1, active: true, isSystem: true },
  { id: 'stg-2', name: 'Requirement Received', probability: 50, order: 2, active: true, isSystem: false },
  { id: 'stg-3', name: 'Proposal', probability: 65, order: 3, active: true, isSystem: true },
  { id: 'stg-4', name: 'Negotiation', probability: 80, order: 4, active: true, isSystem: true },
  { id: 'stg-5', name: 'Won', probability: 100, order: 5, active: true, isSystem: true },
  { id: 'stg-6', name: 'Lost', probability: 0, order: 6, active: true, isSystem: true },
];

export const INITIAL_COMMUNICATION_CONFIG: CommunicationConfigData = {
  defaultEmailSender: 'info@technokraftservices.com',
  defaultSignature: `Regards,\n\nTechnoKraft Services LLP\nWebsite: https://www.technokraftservices.com\nPhone: +91 93701 74424`,
  whatsappEnabled: true,
  callLoggingEnabled: true,
};

export const INITIAL_FOLLOWUP_CONFIG: FollowupConfigData = {
  defaultReminder: '30 minutes',
  defaultStatus: 'Pending',
  autoCreateNextFollowUp: true,
};

export const INITIAL_NOTIFICATIONS_CONFIG: NotificationTypePreference[] = [
  { id: 'notif-1', name: 'Follow-up Due', description: 'Triggered when a scheduled lead follow-up is due', email: true, inApp: true },
  { id: 'notif-2', name: 'Follow-up Overdue', description: 'High-priority alert when a follow-up passes scheduled time', email: true, inApp: true },
  { id: 'notif-3', name: 'New Lead Assigned', description: 'Notifies sales rep when a new inbound lead is assigned', email: true, inApp: true },
  { id: 'notif-4', name: 'Opportunity Updated', description: 'Notifies stakeholders when deal stage or value changes', email: false, inApp: true },
  { id: 'notif-5', name: 'Proposal Sent', description: 'Alert when a formal client proposal is delivered', email: true, inApp: true },
  { id: 'notif-6', name: 'Meeting Reminder', description: 'Advance reminder before client discovery or demo calls', email: true, inApp: true },
  { id: 'notif-7', name: 'Task Due', description: 'Reminder when internal CRM tasks reach deadline', email: false, inApp: true },
  { id: 'notif-8', name: 'Employee Assignment', description: 'Alert when employee workload or account ownership shifts', email: true, inApp: true },
];

export const INITIAL_EMAIL_CONFIG: EmailConfigData = {
  provider: 'SMTP',
  senderName: 'TechnoKraft Services',
  senderEmail: 'info@technokraftservices.com',
  smtpHost: 'smtp.technokraftservices.com',
  smtpPort: 587,
  encryption: 'TLS',
  username: 'info@technokraftservices.com',
  passwordMasked: '••••••••••••',
  signatureText: `Regards,\n\nTechnoKraft Services LLP\nWebsite: https://www.technokraftservices.com\nPhone: +91 93701 74424`,
};

export const INITIAL_APPEARANCE_CONFIG: AppearanceConfigData = {
  theme: 'system',
  density: 'comfortable',
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// LocalStorage helpers for persistence
const STORAGE_KEYS = {
  USERS: 'technokraft_crm_users',
  ROLES: 'technokraft_crm_roles',
  COMPANY: 'technokraft_crm_company',
  CRM_PREF: 'technokraft_crm_preferences',
  LEAD_STATUS: 'technokraft_crm_lead_statuses',
  LEAD_SOURCES: 'technokraft_crm_lead_sources',
  PIPELINE: 'technokraft_crm_pipeline',
  COMMUNICATION: 'technokraft_crm_communication',
  FOLLOWUP: 'technokraft_crm_followup',
  NOTIFICATIONS: 'technokraft_crm_notifications',
  EMAIL: 'technokraft_crm_email',
  APPEARANCE: 'technokraft_crm_appearance',
  AUDIT: 'technokraft_crm_audit',
};

export function getStoredUsers(): CrmUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: CrmUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users', e);
  }
}

export function getStoredRoles(): RoleDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROLES);
    return raw ? JSON.parse(raw) : INITIAL_ROLES;
  } catch {
    return INITIAL_ROLES;
  }
}

export function saveStoredRoles(roles: RoleDefinition[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  } catch (e) {
    console.error('Error saving roles', e);
  }
}

export function getStoredCompanySettings(): CompanySettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY);
    return raw ? JSON.parse(raw) : INITIAL_COMPANY_SETTINGS;
  } catch {
    return INITIAL_COMPANY_SETTINGS;
  }
}

export function saveStoredCompanySettings(data: CompanySettingsData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving company settings', e);
  }
}

export function getStoredCrmPreferences(): CrmPreferencesData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CRM_PREF);
    return raw ? JSON.parse(raw) : INITIAL_CRM_PREFERENCES;
  } catch {
    return INITIAL_CRM_PREFERENCES;
  }
}

export function saveStoredCrmPreferences(data: CrmPreferencesData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CRM_PREF, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving crm preferences', e);
  }
}

export function getStoredLeadStatuses(): LeadStatusConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAD_STATUS);
    return raw ? JSON.parse(raw) : INITIAL_LEAD_STATUSES;
  } catch {
    return INITIAL_LEAD_STATUSES;
  }
}

export function saveStoredLeadStatuses(data: LeadStatusConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEAD_STATUS, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving lead statuses', e);
  }
}

export function getStoredLeadSources(): LeadSourceConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAD_SOURCES);
    return raw ? JSON.parse(raw) : INITIAL_LEAD_SOURCES;
  } catch {
    return INITIAL_LEAD_SOURCES;
  }
}

export function saveStoredLeadSources(data: LeadSourceConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEAD_SOURCES, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving lead sources', e);
  }
}

export function getStoredPipelineStages(): PipelineStageConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PIPELINE);
    return raw ? JSON.parse(raw) : INITIAL_PIPELINE_STAGES;
  } catch {
    return INITIAL_PIPELINE_STAGES;
  }
}

export function saveStoredPipelineStages(data: PipelineStageConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PIPELINE, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving pipeline stages', e);
  }
}

export function getStoredCommunicationConfig(): CommunicationConfigData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNICATION);
    return raw ? JSON.parse(raw) : INITIAL_COMMUNICATION_CONFIG;
  } catch {
    return INITIAL_COMMUNICATION_CONFIG;
  }
}

export function saveStoredCommunicationConfig(data: CommunicationConfigData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMMUNICATION, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving communication config', e);
  }
}

export function getStoredFollowupConfig(): FollowupConfigData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWUP);
    return raw ? JSON.parse(raw) : INITIAL_FOLLOWUP_CONFIG;
  } catch {
    return INITIAL_FOLLOWUP_CONFIG;
  }
}

export function saveStoredFollowupConfig(data: FollowupConfigData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FOLLOWUP, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving followup config', e);
  }
}

export function getStoredNotificationsConfig(): NotificationTypePreference[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS_CONFIG;
  } catch {
    return INITIAL_NOTIFICATIONS_CONFIG;
  }
}

export function saveStoredNotificationsConfig(data: NotificationTypePreference[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving notifications config', e);
  }
}

export function getStoredEmailConfig(): EmailConfigData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMAIL);
    return raw ? JSON.parse(raw) : INITIAL_EMAIL_CONFIG;
  } catch {
    return INITIAL_EMAIL_CONFIG;
  }
}

export function saveStoredEmailConfig(data: EmailConfigData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMAIL, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving email config', e);
  }
}

export function getStoredAppearanceConfig(): AppearanceConfigData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPEARANCE);
    return raw ? JSON.parse(raw) : INITIAL_APPEARANCE_CONFIG;
  } catch {
    return INITIAL_APPEARANCE_CONFIG;
  }
}

export function saveStoredAppearanceConfig(data: AppearanceConfigData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPEARANCE, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving appearance config', e);
  }
}

export const loadUsers = getStoredUsers;
export const saveUsers = saveStoredUsers;
export const loadRoles = getStoredRoles;
export const saveRoles = saveStoredRoles;

export const INITIAL_GENERAL_SETTINGS: GeneralSettingsState = {
  company: INITIAL_COMPANY_SETTINGS,
  crm: INITIAL_CRM_PREFERENCES,
  leadStatuses: INITIAL_LEAD_STATUSES,
  leadSources: INITIAL_LEAD_SOURCES,
  pipelineStages: INITIAL_PIPELINE_STAGES,
  communication: INITIAL_COMMUNICATION_CONFIG,
  followups: INITIAL_FOLLOWUP_CONFIG,
  notifications: INITIAL_NOTIFICATIONS_CONFIG,
  email: INITIAL_EMAIL_CONFIG,
  appearance: INITIAL_APPEARANCE_CONFIG,
};

export function loadGeneralSettings(): GeneralSettingsState {
  return {
    company: getStoredCompanySettings(),
    crm: getStoredCrmPreferences(),
    leadStatuses: getStoredLeadStatuses(),
    leadSources: getStoredLeadSources(),
    pipelineStages: getStoredPipelineStages(),
    communication: getStoredCommunicationConfig(),
    followups: getStoredFollowupConfig(),
    notifications: getStoredNotificationsConfig(),
    email: getStoredEmailConfig(),
    appearance: getStoredAppearanceConfig(),
  };
}

export function saveGeneralSettings(settings: GeneralSettingsState): void {
  saveStoredCompanySettings(settings.company);
  saveStoredCrmPreferences(settings.crm);
  saveStoredLeadStatuses(settings.leadStatuses);
  saveStoredLeadSources(settings.leadSources);
  saveStoredPipelineStages(settings.pipelineStages);
  saveStoredCommunicationConfig(settings.communication);
  saveStoredFollowupConfig(settings.followups);
  saveStoredNotificationsConfig(settings.notifications);
  saveStoredEmailConfig(settings.email);
  saveStoredAppearanceConfig(settings.appearance);
}
