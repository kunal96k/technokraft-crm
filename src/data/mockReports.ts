import {
  EmployeePerformanceRecord,
  TeamPerformanceSummary,
  LeadSourceStat,
  ServiceStat,
  FunnelStageStat,
  PipelineStageStat,
  WinLossStat,
  MonthlyTrendStat,
  CommunicationStat,
  StaleLeadStat,
  OverdueFollowUpStat,
} from '../types/reports';

export const formatCurrencyINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatLakhsINR = (amount: number): string => {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 1)} Cr`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${l.toFixed(l % 1 === 0 ? 0 : 1)} L`;
  }
  return formatCurrencyINR(amount);
};

export const MOCK_EMPLOYEES: EmployeePerformanceRecord[] = [
  {
    id: 'emp-1',
    name: 'Rahul Patil',
    avatar: 'RP',
    role: 'Sales Executive',
    team: 'Enterprise Sales',
    email: 'rahul.patil@technokraft.com',
    phone: '+91 98230 45612',
    leadsAssigned: 42,
    leadsContacted: 38,
    calls: 86,
    emails: 54,
    whatsapp: 32,
    followUps: 38,
    meetings: 12,
    qualified: 14,
    proposals: 6,
    won: 3,
    lost: 2,
    pipelineValue: 1850000,
    wonValue: 780000,
    targetRevenue: 1000000,
    achievedRevenue: 780000,
    targetAchievementRate: 82, // 82%
    conversionRate: 7.1,
    status: 'Active',
    lastActivityTime: 'Today 12:10 PM',
    nextFollowUpTime: '04:00 PM',
    targetMetrics: [
      { metric: 'Leads Handled', target: 50, achieved: 42, achievementRate: 84, unit: 'leads', status: 'On Track' },
      { metric: 'Outbound Calls', target: 100, achieved: 86, achievementRate: 86, unit: 'calls', status: 'On Track' },
      { metric: 'Follow-ups Completed', target: 40, achieved: 38, achievementRate: 95, unit: 'follow-ups', status: 'Achieved' },
      { metric: 'Qualified Leads', target: 15, achieved: 14, achievementRate: 93, unit: 'leads', status: 'On Track' },
      { metric: 'Commercial Proposals', target: 8, achieved: 6, achievementRate: 75, unit: 'proposals', status: 'At Risk' },
      { metric: 'Won Deals', target: 4, achieved: 3, achievementRate: 75, unit: 'deals', status: 'On Track' },
      { metric: 'Monthly Revenue', target: 1000000, achieved: 780000, achievementRate: 78, isCurrency: true, status: 'On Track' },
    ],
    dailyActivityTrend: [
      { date: '1 Sep', dayLabel: 'Mon', calls: 12, emails: 8, followUps: 6, meetings: 2, tasks: 4, total: 32 },
      { date: '2 Sep', dayLabel: 'Tue', calls: 18, emails: 10, followUps: 8, meetings: 3, tasks: 5, total: 44 },
      { date: '3 Sep', dayLabel: 'Wed', calls: 14, emails: 9, followUps: 7, meetings: 2, tasks: 3, total: 35 },
      { date: '4 Sep', dayLabel: 'Thu', calls: 16, emails: 11, followUps: 9, meetings: 2, tasks: 6, total: 44 },
      { date: '5 Sep', dayLabel: 'Fri', calls: 15, emails: 8, followUps: 5, meetings: 2, tasks: 4, total: 34 },
      { date: '6 Sep', dayLabel: 'Sat', calls: 6, emails: 4, followUps: 2, meetings: 0, tasks: 1, total: 13 },
      { date: '7 Sep', dayLabel: 'Sun', calls: 5, emails: 4, followUps: 1, meetings: 1, tasks: 2, total: 13 },
    ],
    funnel: {
      leads: 128,
      contacted: 104,
      interested: 62,
      qualified: 42,
      proposal: 18,
      won: 6,
    },
  },
  {
    id: 'emp-2',
    name: 'Priya Shah',
    avatar: 'PS',
    role: 'Sales Executive',
    team: 'Inside Sales',
    email: 'priya.shah@technokraft.com',
    phone: '+91 98450 12389',
    leadsAssigned: 38,
    leadsContacted: 35,
    calls: 72,
    emails: 48,
    whatsapp: 28,
    followUps: 32,
    meetings: 9,
    qualified: 11,
    proposals: 5,
    won: 2,
    lost: 1,
    pipelineValue: 1420000,
    wonValue: 730000,
    targetRevenue: 800000,
    achievedRevenue: 730000,
    targetAchievementRate: 91,
    conversionRate: 5.3,
    status: 'Active',
    lastActivityTime: 'Today 11:42 AM',
    nextFollowUpTime: '02:00 PM',
    targetMetrics: [
      { metric: 'Leads Handled', target: 40, achieved: 38, achievementRate: 95, unit: 'leads', status: 'Achieved' },
      { metric: 'Outbound Calls', target: 80, achieved: 72, achievementRate: 90, unit: 'calls', status: 'On Track' },
      { metric: 'Follow-ups Completed', target: 35, achieved: 32, achievementRate: 91, unit: 'follow-ups', status: 'On Track' },
      { metric: 'Qualified Leads', target: 12, achieved: 11, achievementRate: 92, unit: 'leads', status: 'On Track' },
      { metric: 'Commercial Proposals', target: 6, achieved: 5, achievementRate: 83, unit: 'proposals', status: 'On Track' },
      { metric: 'Won Deals', target: 3, achieved: 2, achievementRate: 67, unit: 'deals', status: 'At Risk' },
      { metric: 'Monthly Revenue', target: 800000, achieved: 730000, achievementRate: 91, isCurrency: true, status: 'Achieved' },
    ],
    dailyActivityTrend: [
      { date: '1 Sep', dayLabel: 'Mon', calls: 10, emails: 7, followUps: 5, meetings: 1, tasks: 3, total: 26 },
      { date: '2 Sep', dayLabel: 'Tue', calls: 15, emails: 9, followUps: 6, meetings: 2, tasks: 4, total: 36 },
      { date: '3 Sep', dayLabel: 'Wed', calls: 12, emails: 8, followUps: 5, meetings: 2, tasks: 3, total: 30 },
      { date: '4 Sep', dayLabel: 'Thu', calls: 14, emails: 10, followUps: 7, meetings: 1, tasks: 5, total: 37 },
      { date: '5 Sep', dayLabel: 'Fri', calls: 13, emails: 9, followUps: 6, meetings: 2, tasks: 3, total: 33 },
      { date: '6 Sep', dayLabel: 'Sat', calls: 5, emails: 3, followUps: 2, meetings: 1, tasks: 1, total: 12 },
      { date: '7 Sep', dayLabel: 'Sun', calls: 3, emails: 2, followUps: 1, meetings: 0, tasks: 1, total: 7 },
    ],
    funnel: {
      leads: 110,
      contacted: 92,
      interested: 52,
      qualified: 34,
      proposal: 14,
      won: 5,
    },
  },
  {
    id: 'emp-3',
    name: 'Amit Mehta',
    avatar: 'AM',
    role: 'Business Analyst',
    team: 'Solutions & BA',
    email: 'amit.mehta@technokraft.com',
    phone: '+91 97123 90812',
    leadsAssigned: 45,
    leadsContacted: 40,
    calls: 68,
    emails: 41,
    whatsapp: 22,
    followUps: 35,
    meetings: 15,
    qualified: 13,
    proposals: 4,
    won: 2,
    lost: 3,
    pipelineValue: 1650000,
    wonValue: 620000,
    targetRevenue: 700000,
    achievedRevenue: 620000,
    targetAchievementRate: 88,
    conversionRate: 4.4,
    status: 'Needs Attention',
    lastActivityTime: 'Yesterday 05:20 PM',
    nextFollowUpTime: 'Tomorrow',
    targetMetrics: [
      { metric: 'Discovery Scopes', target: 40, achieved: 35, achievementRate: 88, unit: 'specs', status: 'On Track' },
      { metric: 'Tech Consultation Calls', target: 70, achieved: 68, achievementRate: 97, unit: 'calls', status: 'Achieved' },
      { metric: 'Requirement Follow-ups', target: 35, achieved: 35, achievementRate: 100, unit: 'follow-ups', status: 'Achieved' },
      { metric: 'Qualified Architecture', target: 15, achieved: 13, achievementRate: 87, unit: 'leads', status: 'On Track' },
      { metric: 'Solution Proposals', target: 5, achieved: 4, achievementRate: 80, unit: 'proposals', status: 'On Track' },
      { metric: 'Won Deals Support', target: 3, achieved: 2, achievementRate: 67, unit: 'deals', status: 'At Risk' },
      { metric: 'Assisted Revenue', target: 700000, achieved: 620000, achievementRate: 88, isCurrency: true, status: 'On Track' },
    ],
    dailyActivityTrend: [
      { date: '1 Sep', dayLabel: 'Mon', calls: 9, emails: 6, followUps: 5, meetings: 3, tasks: 2, total: 25 },
      { date: '2 Sep', dayLabel: 'Tue', calls: 14, emails: 7, followUps: 7, meetings: 4, tasks: 4, total: 36 },
      { date: '3 Sep', dayLabel: 'Wed', calls: 11, emails: 8, followUps: 6, meetings: 3, tasks: 3, total: 31 },
      { date: '4 Sep', dayLabel: 'Thu', calls: 13, emails: 9, followUps: 6, meetings: 3, tasks: 3, total: 34 },
      { date: '5 Sep', dayLabel: 'Fri', calls: 12, emails: 7, followUps: 7, meetings: 2, tasks: 2, total: 30 },
      { date: '6 Sep', dayLabel: 'Sat', calls: 5, emails: 2, followUps: 2, meetings: 0, tasks: 1, total: 10 },
      { date: '7 Sep', dayLabel: 'Sun', calls: 4, emails: 2, followUps: 2, meetings: 0, tasks: 1, total: 9 },
    ],
    funnel: {
      leads: 95,
      contacted: 84,
      interested: 48,
      qualified: 31,
      proposal: 12,
      won: 4,
    },
  },
  {
    id: 'emp-4',
    name: 'Sneha Kulkarni',
    avatar: 'SK',
    role: 'Sales Executive',
    team: 'Enterprise Sales',
    email: 'sneha.kulkarni@technokraft.com',
    phone: '+91 99345 88120',
    leadsAssigned: 34,
    leadsContacted: 32,
    calls: 64,
    emails: 39,
    whatsapp: 25,
    followUps: 29,
    meetings: 8,
    qualified: 10,
    proposals: 4,
    won: 2,
    lost: 1,
    pipelineValue: 1280000,
    wonValue: 640000,
    targetRevenue: 750000,
    achievedRevenue: 640000,
    targetAchievementRate: 85,
    conversionRate: 5.9,
    status: 'Active',
    lastActivityTime: 'Today 01:15 PM',
    nextFollowUpTime: '04:30 PM',
    targetMetrics: [
      { metric: 'Leads Handled', target: 35, achieved: 34, achievementRate: 97, unit: 'leads', status: 'Achieved' },
      { metric: 'Outbound Calls', target: 70, achieved: 64, achievementRate: 91, unit: 'calls', status: 'On Track' },
      { metric: 'Follow-ups Completed', target: 30, achieved: 29, achievementRate: 97, unit: 'follow-ups', status: 'Achieved' },
      { metric: 'Qualified Leads', target: 12, achieved: 10, achievementRate: 83, unit: 'leads', status: 'On Track' },
      { metric: 'Commercial Proposals', target: 5, achieved: 4, achievementRate: 80, unit: 'proposals', status: 'On Track' },
      { metric: 'Won Deals', target: 3, achieved: 2, achievementRate: 67, unit: 'deals', status: 'At Risk' },
      { metric: 'Monthly Revenue', target: 750000, achieved: 640000, achievementRate: 85, isCurrency: true, status: 'On Track' },
    ],
    dailyActivityTrend: [
      { date: '1 Sep', dayLabel: 'Mon', calls: 9, emails: 5, followUps: 4, meetings: 1, tasks: 2, total: 21 },
      { date: '2 Sep', dayLabel: 'Tue', calls: 13, emails: 8, followUps: 6, meetings: 2, tasks: 3, total: 32 },
      { date: '3 Sep', dayLabel: 'Wed', calls: 10, emails: 6, followUps: 4, meetings: 1, tasks: 3, total: 24 },
      { date: '4 Sep', dayLabel: 'Thu', calls: 12, emails: 7, followUps: 6, meetings: 2, tasks: 4, total: 31 },
      { date: '5 Sep', dayLabel: 'Fri', calls: 12, emails: 7, followUps: 5, meetings: 1, tasks: 3, total: 28 },
      { date: '6 Sep', dayLabel: 'Sat', calls: 4, emails: 3, followUps: 2, meetings: 1, tasks: 1, total: 11 },
      { date: '7 Sep', dayLabel: 'Sun', calls: 4, emails: 3, followUps: 2, meetings: 0, tasks: 1, total: 10 },
    ],
    funnel: {
      leads: 85,
      contacted: 74,
      interested: 41,
      qualified: 26,
      proposal: 10,
      won: 4,
    },
  },
  {
    id: 'emp-5',
    name: 'Rohan Patil',
    avatar: 'RP',
    role: 'Sales Executive',
    team: 'Inside Sales',
    email: 'rohan.patil@technokraft.com',
    phone: '+91 98112 34509',
    leadsAssigned: 31,
    leadsContacted: 27,
    calls: 58,
    emails: 36,
    whatsapp: 21,
    followUps: 24,
    meetings: 6,
    qualified: 8,
    proposals: 3,
    won: 1,
    lost: 2,
    pipelineValue: 980000,
    wonValue: 380000,
    targetRevenue: 600000,
    achievedRevenue: 380000,
    targetAchievementRate: 63,
    conversionRate: 3.2,
    status: 'Needs Attention',
    lastActivityTime: 'Today 10:15 AM',
    nextFollowUpTime: '03:15 PM',
    targetMetrics: [
      { metric: 'Leads Handled', target: 35, achieved: 31, achievementRate: 89, unit: 'leads', status: 'On Track' },
      { metric: 'Outbound Calls', target: 70, achieved: 58, achievementRate: 83, unit: 'calls', status: 'On Track' },
      { metric: 'Follow-ups Completed', target: 30, achieved: 24, achievementRate: 80, unit: 'follow-ups', status: 'Below Target' },
      { metric: 'Qualified Leads', target: 10, achieved: 8, achievementRate: 80, unit: 'leads', status: 'On Track' },
      { metric: 'Commercial Proposals', target: 4, achieved: 3, achievementRate: 75, unit: 'proposals', status: 'At Risk' },
      { metric: 'Won Deals', target: 2, achieved: 1, achievementRate: 50, unit: 'deals', status: 'Below Target' },
      { metric: 'Monthly Revenue', target: 600000, achieved: 380000, achievementRate: 63, isCurrency: true, status: 'Below Target' },
    ],
    dailyActivityTrend: [
      { date: '1 Sep', dayLabel: 'Mon', calls: 8, emails: 5, followUps: 3, meetings: 1, tasks: 2, total: 19 },
      { date: '2 Sep', dayLabel: 'Tue', calls: 11, emails: 7, followUps: 5, meetings: 1, tasks: 2, total: 26 },
      { date: '3 Sep', dayLabel: 'Wed', calls: 9, emails: 5, followUps: 4, meetings: 1, tasks: 2, total: 21 },
      { date: '4 Sep', dayLabel: 'Thu', calls: 11, emails: 7, followUps: 4, meetings: 1, tasks: 3, total: 26 },
      { date: '5 Sep', dayLabel: 'Fri', calls: 10, emails: 6, followUps: 4, meetings: 1, tasks: 2, total: 23 },
      { date: '6 Sep', dayLabel: 'Sat', calls: 5, emails: 3, followUps: 2, meetings: 1, tasks: 1, total: 12 },
      { date: '7 Sep', dayLabel: 'Sun', calls: 4, emails: 3, followUps: 2, meetings: 0, tasks: 1, total: 10 },
    ],
    funnel: {
      leads: 72,
      contacted: 60,
      interested: 32,
      qualified: 19,
      proposal: 7,
      won: 2,
    },
  },
];

export const MOCK_TEAM_SUMMARY: TeamPerformanceSummary = {
  totalTeamMembers: 12,
  leadsAssigned: 480,
  calls: 720,
  emails: 430,
  whatsapp: 280,
  followUps: 380,
  meetings: 98,
  qualified: 126,
  proposals: 48,
  won: 18,
  pipelineValue: 8500000, // ₹85 L
  wonValue: 3150000, // ₹31.5 L
  targetRevenue: 4200000, // ₹42 L
  achievedRevenue: 3450000, // ₹34.5 L
  avgAchievementRate: 82.1,
};

export const MOCK_TOP_PERFORMERS = [
  { rank: 1, name: 'Rahul Patil', role: 'Sales Executive', achievementRate: 92, wonDeals: 3, revenue: 780000, avatar: 'RP' },
  { rank: 2, name: 'Priya Shah', role: 'Sales Executive', achievementRate: 89, wonDeals: 2, revenue: 730000, avatar: 'PS' },
  { rank: 3, name: 'Amit Mehta', role: 'Business Analyst', achievementRate: 86, wonDeals: 2, revenue: 620000, avatar: 'AM' },
];

export const MOCK_LEAD_FUNNEL_STATS: FunnelStageStat[] = [
  { stage: 'New Leads', count: 1284, conversionRate: 100, dropOffRate: 0, percentageOfTop: 100 },
  { stage: 'Contacted', count: 910, conversionRate: 70.9, dropOffRate: 29.1, percentageOfTop: 70.9 },
  { stage: 'Interested', count: 320, conversionRate: 35.2, dropOffRate: 64.8, percentageOfTop: 24.9 },
  { stage: 'Qualified', count: 145, conversionRate: 45.3, dropOffRate: 54.7, percentageOfTop: 11.3 },
  { stage: 'Proposal', count: 72, conversionRate: 49.7, dropOffRate: 50.3, percentageOfTop: 5.6 },
  { stage: 'Won Deals', count: 18, conversionRate: 25.0, dropOffRate: 75.0, percentageOfTop: 1.4 },
];

export const MOCK_LEAD_SOURCES: LeadSourceStat[] = [
  { source: 'LinkedIn', leads: 410, percentage: 32, interested: 115, qualified: 52, won: 7, revenue: 1650000, conversionRate: 1.7, color: '#0A66C2' },
  { source: 'Cold Calling', leads: 308, percentage: 24, interested: 68, qualified: 28, won: 3, revenue: 620000, conversionRate: 1.0, color: '#5B4DB7' },
  { source: 'Website', leads: 231, percentage: 18, interested: 62, qualified: 31, won: 4, revenue: 980000, conversionRate: 1.7, color: '#10B981' },
  { source: 'Referral', leads: 128, percentage: 10, interested: 42, qualified: 21, won: 3, revenue: 840000, conversionRate: 2.3, color: '#F59E0B' },
  { source: 'IndiaMART', leads: 103, percentage: 8, interested: 21, qualified: 8, won: 1, revenue: 250000, conversionRate: 1.0, color: '#EC4899' },
  { source: 'Email Campaign', leads: 64, percentage: 5, interested: 12, qualified: 5, won: 0, revenue: 0, conversionRate: 0.0, color: '#6366F1' },
  { source: 'Existing Customer', leads: 40, percentage: 3, interested: 0, qualified: 0, won: 0, revenue: 0, conversionRate: 0.0, color: '#8B5CF6' },
];

export const MOCK_SERVICES: ServiceStat[] = [
  { service: 'Custom Software Development', leads: 320, qualified: 42, opportunities: 24, proposals: 14, won: 6, pipelineValue: 1850000, wonValue: 1250000, conversionRate: 1.9 },
  { service: 'Web Development', leads: 280, qualified: 31, opportunities: 16, proposals: 9, won: 4, pipelineValue: 1220000, wonValue: 720000, conversionRate: 1.4 },
  { service: 'Mobile App Development', leads: 210, qualified: 24, opportunities: 12, proposals: 7, won: 3, pipelineValue: 980000, wonValue: 560000, conversionRate: 1.4 },
  { service: 'Cloud / DevOps', leads: 175, qualified: 20, opportunities: 9, proposals: 5, won: 2, pipelineValue: 840000, wonValue: 420000, conversionRate: 1.1 },
  { service: 'AI / ML', leads: 115, qualified: 14, opportunities: 6, proposals: 4, won: 2, pipelineValue: 760000, wonValue: 480000, conversionRate: 1.7 },
  { service: 'Cybersecurity', leads: 85, qualified: 8, opportunities: 3, proposals: 2, won: 1, pipelineValue: 340000, wonValue: 180000, conversionRate: 1.2 },
  { service: 'UI/UX Design', leads: 65, qualified: 4, opportunities: 1, proposals: 1, won: 0, pipelineValue: 120000, wonValue: 0, conversionRate: 0.0 },
  { service: 'IT Consulting', leads: 34, qualified: 2, opportunities: 1, proposals: 0, won: 0, pipelineValue: 90000, wonValue: 0, conversionRate: 0.0 },
];

export const MOCK_MONTHLY_TRENDS: MonthlyTrendStat[] = [
  { month: 'Apr', leadsGenerated: 180, qualified: 22, won: 2, pipelineValue: 850000, revenue: 420000 },
  { month: 'May', leadsGenerated: 195, qualified: 25, won: 3, pipelineValue: 1100000, revenue: 580000 },
  { month: 'Jun', leadsGenerated: 210, qualified: 28, won: 3, pipelineValue: 1250000, revenue: 640000 },
  { month: 'Jul', leadsGenerated: 235, qualified: 32, won: 4, pipelineValue: 1450000, revenue: 780000 },
  { month: 'Aug', leadsGenerated: 220, qualified: 30, won: 3, pipelineValue: 1380000, revenue: 710000 },
  { month: 'Sep', leadsGenerated: 244, qualified: 38, won: 5, pipelineValue: 1850000, revenue: 980000 },
];

export const MOCK_PIPELINE_STAGES: PipelineStageStat[] = [
  { stage: 'Qualified', count: 42, value: 1800000, probability: 40, weightedValue: 720000, color: '#8B5CF6' },
  { stage: 'Proposal', count: 18, value: 1500000, probability: 65, weightedValue: 975000, color: '#3B82F6' },
  { stage: 'Negotiation', count: 8, value: 1200000, probability: 80, weightedValue: 960000, color: '#F59E0B' },
  { stage: 'Won', count: 6, value: 850000, probability: 100, weightedValue: 850000, color: '#10B981' },
];

export const MOCK_WIN_LOSS: WinLossStat = {
  wonCount: 18,
  lostCount: 32,
  openCount: 72,
  winRate: 36.0, // 18 / (18 + 32) = 36%
  lossReasons: [
    { reason: 'Budget & Pricing', count: 12, percentage: 37.5 },
    { reason: 'Competitor Selected', count: 8, percentage: 25.0 },
    { reason: 'No Requirement / Dropped', count: 5, percentage: 15.6 },
    { reason: 'Timeline Mismatch', count: 3, percentage: 9.4 },
    { reason: 'No Response / Ghosted', count: 3, percentage: 9.4 },
    { reason: 'Other Technical Limitations', count: 1, percentage: 3.1 },
  ],
};

export const MOCK_COMMUNICATIONS: CommunicationStat[] = [
  { type: 'Calls', total: 860, responded: 520, outcomeNote: '60.5% answered; 128 callbacks logged', successRate: 60.5 },
  { type: 'Emails', total: 540, responded: 286, outcomeNote: '53.0% opened; 94 direct replies', successRate: 53.0 },
  { type: 'WhatsApp', total: 420, responded: 345, outcomeNote: '82.1% read; fastest turnaround', successRate: 82.1 },
  { type: 'Meetings', total: 120, responded: 108, outcomeNote: '90.0% attendance; 42 demos conducted', successRate: 90.0 },
  { type: 'Follow-ups', total: 380, responded: 325, outcomeNote: '85.5% on-time completion rate', successRate: 85.5 },
];

export const MOCK_STALE_LEADS: StaleLeadStat[] = [
  {
    duration: '3+ Days',
    count: 24,
    description: 'Leads with last salesperson activity between 3 to 6 days ago',
    leadsSample: [
      { leadCode: 'LD-2026-00142', companyName: 'Apex Logistics Ltd', ownerName: 'Rahul Patil', lastContactDate: '04 Sep 2026', daysInactive: 3 },
      { leadCode: 'LD-2026-00143', companyName: 'Sunbeam Tech', ownerName: 'Priya Shah', lastContactDate: '04 Sep 2026', daysInactive: 3 },
      { leadCode: 'LD-2026-00145', companyName: 'Delta Pharma', ownerName: 'Amit Mehta', lastContactDate: '03 Sep 2026', daysInactive: 4 },
    ],
  },
  {
    duration: '7+ Days',
    count: 12,
    description: 'Leads with no logged communication or notes for a full week',
    leadsSample: [
      { leadCode: 'LD-2026-00130', companyName: 'Nova FinTech Corp', ownerName: 'Sneha Kulkarni', lastContactDate: '31 Aug 2026', daysInactive: 7 },
      { leadCode: 'LD-2026-00132', companyName: 'Omicron Engineering', ownerName: 'Rohan Patil', lastContactDate: '30 Aug 2026', daysInactive: 8 },
    ],
  },
  {
    duration: '14+ Days',
    count: 5,
    description: 'High risk cold leads requiring immediate management reassignment',
    leadsSample: [
      { leadCode: 'LD-2026-00118', companyName: 'Kaveri Textiles Pune', ownerName: 'Rohan Patil', lastContactDate: '24 Aug 2026', daysInactive: 14 },
      { leadCode: 'LD-2026-00115', companyName: 'Urban AgriTech', ownerName: 'Amit Mehta', lastContactDate: '22 Aug 2026', daysInactive: 16 },
    ],
  },
];

export const MOCK_OVERDUE_FOLLOWUPS: OverdueFollowUpStat[] = [
  { employeeName: 'Amit Mehta', employeeRole: 'Business Analyst', employeeAvatar: 'AM', overdueCount: 4, pendingTotal: 12, earliestDueDate: '05 Sep 2026' },
  { employeeName: 'Rohan Patil', employeeRole: 'Sales Executive', employeeAvatar: 'RP', overdueCount: 3, pendingTotal: 8, earliestDueDate: '06 Sep 2026' },
  { employeeName: 'Rahul Patil', employeeRole: 'Sales Executive', employeeAvatar: 'RP', overdueCount: 2, pendingTotal: 14, earliestDueDate: '06 Sep 2026' },
  { employeeName: 'Priya Shah', employeeRole: 'Sales Executive', employeeAvatar: 'PS', overdueCount: 1, pendingTotal: 10, earliestDueDate: '07 Sep 2026' },
  { employeeName: 'Sneha Kulkarni', employeeRole: 'Sales Executive', employeeAvatar: 'SK', overdueCount: 0, pendingTotal: 9, earliestDueDate: 'None' },
];
