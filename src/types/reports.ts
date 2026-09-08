export type DateRangePreset =
  | 'Today'
  | 'This Week'
  | 'This Month'
  | 'Last Month'
  | 'This Quarter'
  | 'This Year'
  | 'Custom Range';

export type RoleScope =
  | 'Company Overview'
  | 'My Team'
  | 'All Employees'
  | 'My Performance';

export type TargetStatus = 'On Track' | 'At Risk' | 'Achieved' | 'Below Target';

export type EmployeeActivityStatus = 'Active' | 'Needs Attention' | 'Inactive';

export interface TargetMetric {
  metric: string;
  target: number;
  achieved: number;
  achievementRate: number;
  unit?: string;
  isCurrency?: boolean;
  status: TargetStatus;
}

export interface ActivityDayTrend {
  date: string;
  dayLabel: string;
  calls: number;
  emails: number;
  followUps: number;
  meetings: number;
  tasks: number;
  total: number;
}

export interface EmployeeFunnel {
  leads: number;
  contacted: number;
  interested: number;
  qualified: number;
  proposal: number;
  won: number;
}

export interface EmployeePerformanceRecord {
  id: string;
  name: string;
  avatar: string;
  role: string;
  team: string;
  email: string;
  phone: string;
  leadsAssigned: number;
  leadsContacted: number;
  calls: number;
  emails: number;
  whatsapp: number;
  followUps: number;
  meetings: number;
  qualified: number;
  proposals: number;
  won: number;
  lost: number;
  pipelineValue: number;
  wonValue: number;
  targetRevenue: number;
  achievedRevenue: number;
  targetAchievementRate: number;
  conversionRate: number;
  status: EmployeeActivityStatus;
  lastActivityTime: string;
  nextFollowUpTime: string;
  targetMetrics: TargetMetric[];
  dailyActivityTrend: ActivityDayTrend[];
  funnel: EmployeeFunnel;
}

export interface TeamPerformanceSummary {
  totalTeamMembers: number;
  leadsAssigned: number;
  calls: number;
  emails: number;
  whatsapp: number;
  followUps: number;
  meetings: number;
  qualified: number;
  proposals: number;
  won: number;
  pipelineValue: number;
  wonValue: number;
  targetRevenue: number;
  achievedRevenue: number;
  avgAchievementRate: number;
}

export interface LeadSourceStat {
  source: string;
  leads: number;
  percentage: number;
  interested: number;
  qualified: number;
  won: number;
  revenue: number;
  conversionRate: number;
  color: string;
}

export interface ServiceStat {
  service: string;
  leads: number;
  qualified: number;
  opportunities: number;
  proposals: number;
  won: number;
  pipelineValue: number;
  wonValue: number;
  conversionRate: number;
}

export interface FunnelStageStat {
  stage: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  percentageOfTop: number;
}

export interface PipelineStageStat {
  stage: string;
  count: number;
  value: number;
  probability: number;
  weightedValue: number;
  color: string;
}

export interface WinLossStat {
  wonCount: number;
  lostCount: number;
  openCount: number;
  winRate: number;
  lossReasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

export interface MonthlyTrendStat {
  month: string;
  leadsGenerated: number;
  qualified: number;
  won: number;
  pipelineValue: number;
  revenue: number;
}

export interface CommunicationStat {
  type: 'Calls' | 'Emails' | 'WhatsApp' | 'Meetings' | 'Follow-ups';
  total: number;
  responded: number;
  outcomeNote: string;
  successRate: number;
}

export interface StaleLeadStat {
  duration: '3+ Days' | '7+ Days' | '14+ Days' | '30+ Days';
  count: number;
  description: string;
  leadsSample: {
    leadCode: string;
    companyName: string;
    ownerName: string;
    lastContactDate: string;
    daysInactive: number;
  }[];
}

export interface OverdueFollowUpStat {
  employeeName: string;
  employeeRole: string;
  employeeAvatar: string;
  overdueCount: number;
  pendingTotal: number;
  earliestDueDate: string;
}

export interface ExportReportOptions {
  format: 'PDF' | 'Excel' | 'CSV';
  reportType: 'Performance' | 'Analytics' | 'Complete Dossier';
  dateRange: string;
  includeCharts: boolean;
}
