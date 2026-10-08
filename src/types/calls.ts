export type CallType = 'outbound' | 'inbound' | 'missed';

export type CallStatus = 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'failed';

export type CallResult =
  | 'Connected'
  | 'Interested'
  | 'Not Interested'
  | 'Callback Required'
  | 'Callback Requested'
  | 'Requirement Received'
  | 'Meeting Requested'
  | 'Proposal Requested'
  | 'Qualified'
  | 'Scheduled'
  | 'No Response'
  | 'Wrong Number'
  | 'Busy'
  | 'Busy / No Answer'
  | 'Other';

export type NextActionType = 'none' | 'followup' | 'meeting' | 'email';

export interface NextFollowUpDetails {
  date: string;
  time: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Demo' | 'Document' | 'General';
  assignedTo: string;
}

export interface CallRecord {
  id: string;
  callCode: string;
  leadId: string;
  leadCode: string;
  companyName: string;
  companyWebsite?: string;
  contactId?: string;
  contactName: string;
  contactDesignation: string;
  contactPhone: string;
  contactEmail?: string;
  employeeId?: string;
  employeeName: string;
  employeeRole: string;
  employeeAvatar: string;
  type: CallType;
  status: CallStatus;
  date: string; // e.g. '07 Sep 2026' or '2026-09-07'
  time: string; // e.g. '11:30 AM'
  timestamp?: string;
  startTime?: string;
  endTime?: string;
  duration: string; // e.g. '12m 34s', '0m 00s' for scheduled/missed
  durationSeconds?: number;
  result?: CallResult;
  notes: string;
  purpose?: string;
  reminder?: string;
  nextAction?: NextActionType;
  nextFollowUp?: NextFollowUpDetails;
  service: string;
  leadStatus: string;
  leadScore: number;
  opportunityCreated?: boolean;
  recordingAvailable?: boolean;
  followUpRequired?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CallSummaryStats {
  callsToday: number;
  scheduled: number;
  completed: number;
  missed: number;
  followUpRequired: number;
}

export interface EmployeeCallStats {
  employeeName: string;
  role: string;
  avatar: string;
  callsToday: number;
  completed: number;
  missed: number;
  followUpRequired: number;
}

export type CallFilterTab = 'all' | 'today' | 'scheduled' | 'completed' | 'missed';

export interface CallFiltersState {
  search: string;
  tab: CallFilterTab;
  dateRange: 'all' | 'today' | 'yesterday' | 'last7days' | 'thisMonth';
  employee: string;
  callType: string;
  status: string;
  result: string;
  leadStatus: string;
  service: string;
}
