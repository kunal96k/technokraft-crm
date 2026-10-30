export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'CLIENT_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED';

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'INTERNAL_REVIEW'
  | 'QA_TESTING'
  | 'CLIENT_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'DEPLOYMENT'
  | 'COMPLETED';

export type TaskType = 'TASK' | 'BUG' | 'FEATURE' | 'REQUIREMENT' | 'IMPROVEMENT' | 'SPIKE' | 'SUBTASK';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';

export type ProjectMemberRole =
  | 'PROJECT_MANAGER'
  | 'TECH_LEAD'
  | 'DEVELOPER'
  | 'INTERN'
  | 'QA_ENGINEER'
  | 'UI_UX_DESIGNER';

export interface ProjectMemberRecord {
  id: number;
  projectId: number;
  employeeId: number;
  employeeName: string;
  employeeEmail?: string;
  employeeAvatar?: string;
  employeeCode?: string;
  projectRole: ProjectMemberRole | string;
  assignedDate: string;
  isActive: boolean;
  activeTaskCount?: number;
}

export interface TaskCommentRecord {
  id: number;
  taskId: number;
  employeeId?: number;
  employeeName: string;
  employeeAvatar?: string;
  employeeRole?: string;
  commentText: string;
  createdAt: string;
}

export interface TaskAttachmentRecord {
  id: number;
  taskId: number;
  fileName: string;
  storedFileName: string;
  fileSize?: string;
  fileType?: string;
  downloadUrl: string;
  uploadedById?: number;
  uploadedByName?: string;
  uploadedAt: string;
}

export interface TaskActivityRecord {
  id: number;
  taskId: number;
  employeeId?: number;
  employeeName: string;
  activityType: string;
  fromValue?: string;
  toValue?: string;
  notes?: string;
  createdAt: string;
}

export interface ProjectTaskRecord {
  id: number;
  taskKey: string;
  projectId: number;
  projectName?: string;
  projectCode?: string;
  companyName?: string;
  title: string;
  description?: string;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  reporterId?: number;
  reporterName?: string;
  assigneeId?: number;
  assigneeName?: string;
  assigneeRole?: string;
  assigneeAvatar?: string;
  estimatedHours?: number;
  loggedHours?: number;
  dueDate?: string;
  completedAt?: string;
  orderIndex?: number;
  labels?: string;
  leadId?: number;
  leadCode?: string;
  leadName?: string;
  defectNotes?: string;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt?: string;
  comments?: TaskCommentRecord[];
  attachments?: TaskAttachmentRecord[];
  activityHistory?: TaskActivityRecord[];
}

export interface DeliveryProjectRecord {
  id: number;
  projectCode: string;
  name: string;
  opportunityId?: number;
  opportunityCode?: string;
  companyName: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceType?: string;
  description?: string;
  projectManagerId?: number;
  projectManagerName?: string;
  projectManagerAvatar?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget?: number;
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  repositoryUrl?: string;
  stagingUrl?: string;
  productionUrl?: string;
  ciCdNotes?: string;
  totalTasks?: number;
  completedTasks?: number;
  inProgressTasks?: number;
  reviewTasks?: number;
  pendingTasks?: number;
  bugsCount?: number;
  progressPercentage?: number;
  membersCount?: number;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  members?: ProjectMemberRecord[];
  recentTasks?: ProjectTaskRecord[];
}

export interface MyWorkSummaryRecord {
  employeeId: number;
  employeeName: string;
  employeeRole: string;
  totalAssigned: number;
  inProgressCount: number;
  reviewCount: number;
  overdueCount: number;
  completedCount: number;
  assignedTasks: ProjectTaskRecord[];
  inProgressTasks: ProjectTaskRecord[];
  reviewTasks: ProjectTaskRecord[];
  overdueTasks: ProjectTaskRecord[];
}

export interface ProjectQueryParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ProjectsPageResponse {
  content: DeliveryProjectRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface ProjectSummaryRecord {
  total: number;
  inDevelopment: number;
  inReview: number;
  completed: number;
  onHold: number;
  totalBudget?: number;
}
