export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave' | 'Suspended';

export type EmploymentType = 'Full Time' | 'Part Time' | 'Contract' | 'Intern';

export type DepartmentType =
  | 'Development'
  | 'DevOps & Cloud'
  | 'QA / Testing'
  | 'UI/UX Design'
  | 'Project Management'
  | 'Sales'
  | 'Business Analysis'
  | 'HR'
  | 'Finance'
  | 'Administration'
  | 'Management';

export const DEPARTMENTS: DepartmentType[] = [
  'Development',
  'DevOps & Cloud',
  'QA / Testing',
  'UI/UX Design',
  'Project Management',
  'Sales',
  'Business Analysis',
  'HR',
  'Finance',
  'Administration',
  'Management',
];

export type EmployeeRole =
  | 'Software Developer'
  | 'Full Stack Developer'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'DevOps Engineer'
  | 'AWS / Cloud Engineer'
  | 'QA Engineer'
  | 'UI/UX Designer'
  | 'Solutions Architect'
  | 'Tech Lead'
  | 'Project Manager'
  | 'Developer Intern'
  | 'DevOps Intern'
  | 'QA Intern'
  | 'Business Analyst'
  | 'Sales Executive'
  | 'Sales Manager'
  | 'HR Executive'
  | 'Admin'
  | 'Manager';

export const EMPLOYEE_ROLES: EmployeeRole[] = [
  'Software Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'AWS / Cloud Engineer',
  'QA Engineer',
  'UI/UX Designer',
  'Solutions Architect',
  'Tech Lead',
  'Project Manager',
  'Developer Intern',
  'DevOps Intern',
  'QA Intern',
  'Business Analyst',
  'Sales Executive',
  'Sales Manager',
  'HR Executive',
  'Admin',
  'Manager',
];

export const MANAGERS: string[] = [];

export type CrmAccessRole =
  | 'Super Admin'
  | 'Admin'
  | 'Project Manager'
  | 'Tech Lead / Solutions Architect'
  | 'Software Developer'
  | 'DevOps / AWS Cloud Engineer'
  | 'QA / Test Automation Engineer'
  | 'UI/UX Designer'
  | 'Technical Intern'
  | 'Business Analyst'
  | 'Sales Manager'
  | 'Manager'
  | 'Sales Executive'
  | 'Employee';

export type WorkStatus = 'Working' | 'Break' | 'Logged Out' | 'Offline' | 'On Leave';

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Half Day'
  | 'Leave'
  | 'Late'
  | 'Holiday'
  | 'Early';

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
  halfDayDays?: number;
  workingDays: number;
  averageWorkingHours: string;
  totalWorkingHours: string;
  todayBreakTime?: string;
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

  // Work Shift Timing
  shiftStartTime?: string; // e.g. "10:00 AM" (Default: "10:00 AM")
  shiftEndTime?: string;   // e.g. "04:00 PM" (Default: "04:00 PM")

  // CRM Access & Login Credentials configuration
  crmAccess: boolean;
  accessRole: CrmAccessRole;
  isSuperAdmin?: boolean;
  allowedModules?: string[]; // IDs of sidebar navigation modules granted to this employee
  username?: string;
  password?: string;
  isPasswordSet?: boolean;
  forcePasswordReset?: boolean;
  isAccountLocked?: boolean;
  lastLoginAt?: string;
  lastLogoutAt?: string;

  // Live / Today status
  workStatus: WorkStatus;
  loginTime: string;
  logoutTime?: string;
  lastActivityTime: string;
  todayWorkingTime: string;
  todayBreakTime?: string;
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
  isDeleted?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
  forcePasswordReset?: boolean;
}

export interface DailyAttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  avatar: string;
  profilePhoto?: string;
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
  shiftStartTime?: string;
  shiftEndTime?: string;
  isSuperAdmin?: boolean;
}

export interface ManagerOption {
  id?: string;
  name: string;
  employeeCode?: string;
  role?: string;
  department?: string;
}

export interface EmployeeFilterOptions {
  departments: string[];
  roles: string[];
  accessRoles: string[];
  statuses: string[];
  workStatuses: string[];
  employmentTypes: string[];
  managers: ManagerOption[];
  crmAccessOptions: string[];
}

export interface EmployeeFiltersState {
  searchQuery: string;
  department: string;
  role: string;
  accessRole?: string;
  status: string;
  employmentType: string;
  manager: string;
  workStatus?: string;
  crmAccess?: string;
}

export interface AttendanceFiltersState {
  searchQuery: string;
  datePreset: 'Today' | 'This Week' | 'This Month' | 'Custom Range';
  startDate?: string;
  endDate?: string;
  employeeId: string;
  department: string;
  status: string;
}
