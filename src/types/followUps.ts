export type FollowUpStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'RESCHEDULED';

export type FollowUpPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type FollowUpType =
  | 'Call'
  | 'Email'
  | 'WhatsApp'
  | 'Meeting'
  | 'Requirement Follow-up'
  | 'Proposal Follow-up'
  | 'General Follow-up';

export type FollowUpOutcome =
  | 'Interested'
  | 'Not Interested'
  | 'Callback Required'
  | 'Requirement Received'
  | 'Meeting Scheduled'
  | 'Proposal Requested'
  | 'No Response'
  | 'Other';

export interface FollowUpRecord {
  id: string;
  leadId: string;
  leadCode: string;
  companyName: string;
  contactName: string;
  contactDesignation?: string;
  contactPhone?: string;
  contactEmail?: string;
  service?: string;
  leadScore?: number;
  leadStatus?: string;
  type: FollowUpType;
  purpose: string;
  date: string; // YYYY-MM-DD or readable
  time: string; // e.g. 04:00 PM
  assignedTo: string;
  assignedAvatar?: string;
  assignedRole?: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  reminder?: string;
  notes?: string;
  outcome?: FollowUpOutcome;
  completionNotes?: string;
  completedAt?: string;
  rescheduleReason?: string;
  rescheduledToId?: string;
  createdAt: string;
  daysOverdue?: number;
}

export type FollowUpTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export interface FollowUpStats {
  today: number;
  upcoming: number;
  overdue: number;
  completed: number;
  highPriority: number;
}

// Tasks Model
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskRecord {
  id: string;
  taskName: string;
  description?: string;
  leadId?: string;
  leadCode?: string;
  companyName?: string;
  assignedTo: string;
  assignedAvatar?: string;
  priority: TaskPriority;
  dueDate: string;
  dueTime?: string;
  status: TaskStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

// Meetings Model
export type MeetingType =
  | 'Discovery Call'
  | 'Requirement Discussion'
  | 'Technical Discussion'
  | 'Demo'
  | 'Proposal Discussion'
  | 'Negotiation'
  | 'Internal Meeting'
  | 'Other';

export type MeetingStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled'
  | 'No Show';

export type MeetingLocation = 'Online' | 'Office' | 'Client Location' | 'Phone';

export type MeetingOutcome =
  | 'Positive'
  | 'Need More Discussion'
  | 'Requirement Received'
  | 'Proposal Requested'
  | 'Not Interested'
  | 'Follow-up Required'
  | 'Other';

export interface MeetingRecord {
  id: string;
  leadId: string;
  leadCode: string;
  companyName: string;
  contactName: string;
  contactDesignation?: string;
  contactPhone?: string;
  contactEmail?: string;
  title: string;
  meetingType: MeetingType;
  date: string;
  startTime: string;
  endTime: string;
  assignedEmployee: string;
  assignedAvatar?: string;
  location: MeetingLocation;
  meetingLink?: string;
  description?: string;
  notes?: string;
  status: MeetingStatus;
  outcome?: MeetingOutcome;
  outcomeNotes?: string;
  completedAt?: string;
}

export interface EmployeePerformance {
  name: string;
  avatar: string;
  role: string;
  assigned: number;
  today: number;
  upcoming: number;
  overdue: number;
  completed: number;
  completionRate: number; // percentage
}
