export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave' | 'Suspended';

export type EmploymentType = 'Full Time' | 'Part Time' | 'Contract' | 'Intern';

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
  | 'Management';

export type EmployeeRole =
  | 'Sales Executive'
  | 'Business Analyst'
  | 'Sales Manager'
  | 'Project Manager'
  | 'Software Developer'
  | 'QA Engineer'
  | 'DevOps Engineer'
  | 'UI/UX Designer'
  | 'HR Executive'
  | 'Admin'
  | 'Manager';

export type CrmAccessRole =
  | 'Employee'
  | 'Sales Executive'
  | 'Business Analyst'
  | 'Manager'
  | 'Admin';

export type WorkStatus = 'Working' | 'Break' | 'Logged Out' | 'Offline' | 'On Leave';

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Half Day'
  | 'Leave'
  | 'Late'
  | 'Holiday';

export type TargetMetricStatus = 'Achieved' | 'On Track' | 'At Risk' | 'Below Target';

export interface EmployeeWorkload {
  assignedLeads: number;
  openFollowUps: number;
  overdueFollowUps: number;
  openTasks: number;
  upcomingMeetings: number;
  openOpportunities: number;
  pendingProposals: number;
}

export interface EmployeeTodayActivity {
  calls: number;
  emails: number;
  whatsapp: number;
  followUps: number;
  meetings: number;
  tasks: number;
}

export interface ActivityTimelineItem {
  id: string;
  time: string;
  type: 'call' | 'followup' | 'email' | 'lead' | 'meeting' | 'proposal' | 'task';
  title: string;
  companyName: string;
  result?: string;
  note?: string;
}

export interface EmployeeTargetConfig {
  period: 'Monthly';
  monthlyRevenueTarget: number;
  monthlyLeadTarget: number;
  monthlyCallTarget: number;
  monthlyFollowUpTarget: number;
  monthlyProposalTarget: number;
  monthlyWonDealTarget: number;

  achievedRevenue: number;
  achievedLeads: number;
  achievedCalls: number;
  achievedFollowUps: number;
  achievedProposals: number;
  achievedWonDeals: number;

  revenueAchievementRate: number;
  overallStatus: TargetMetricStatus;
}

export interface EmployeeAttendanceDay {
  dayNumber: number;
  dayLabel: string; // 'Mon', 'Tue'
  date: string; // '2026-09-01'
  status: AttendanceStatus;
  loginTime?: string;
  logoutTime?: string;
  workingHours?: string;
  notes?: string;
}

export interface EmployeeMonthlyAttendanceSummary {
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  workingDays: number;
  averageWorkingHours: string;
  totalWorkingHours: string;
  expectedDailyHours: string;
  overtimeHours: string;
  dailyRecords: EmployeeAttendanceDay[];
}

export interface Employee {
  id: string;
  employeeCode: string; // e.g. 'EMP-0012'
  firstName: string;
  lastName: string;
  name: string;
  avatar: string;
  profilePhoto?: string;
  email: string;
  personalEmail?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  department: DepartmentType | string;
  role: EmployeeRole | string;
  managerId?: string;
  reportingManager: string;
  employmentType: EmploymentType;
  joiningDate: string;
  status: EmployeeStatus;

  // CRM Access configuration
  crmAccess: boolean;
  accessRole: CrmAccessRole;

  // Live / Today status
  workStatus: WorkStatus;
  loginTime: string;
  logoutTime?: string;
  lastActivityTime: string;
  todayWorkingTime: string;
  currentActivity: string;
  todayAttendanceStatus: AttendanceStatus;

  // Connected CRM Workload
  workload: EmployeeWorkload;

  // Connected CRM Today Activity
  todayActivity: EmployeeTodayActivity;

  // Activity Timeline
  recentTimeline: ActivityTimelineItem[];

  // Configured Targets
  targets: EmployeeTargetConfig;

  // Monthly Attendance
  attendanceSummary: EmployeeMonthlyAttendanceSummary;

  createdAt: string;
}

export interface DailyAttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  avatar: string;
  date: string;
  loginTime: string;
  logoutTime: string;
  workingHours: string;
  workingMinutes: number;
  breakTime: string;
  breakMinutes: number;
  sessionDuration: string;
  status: AttendanceStatus;
  currentActivity: string;
  workStatus: WorkStatus;
}

export interface EmployeeFiltersState {
  searchQuery: string;
  department: string;
  role: string;
  status: string;
  employmentType: string;
  manager: string;
  workStatus?: string;
  crmAccess?: string;
}

export interface AttendanceFiltersState {
  searchQuery: string;
  datePreset: 'Today' | 'This Week' | 'This Month' | 'Custom Range';
  employeeId: string;
  department: string;
  status: string;
}
