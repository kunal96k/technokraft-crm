export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CALLBACK'
  | 'INTERESTED'
  | 'QUALIFIED'
  | 'REQUIREMENT_PENDING'
  | 'REQUIREMENT_RECEIVED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'NOT_INTERESTED';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LeadSource =
  | 'LinkedIn'
  | 'Cold Calling'
  | 'Website'
  | 'Referral'
  | 'IndiaMART'
  | 'Google Search'
  | 'Email Campaign'
  | 'Existing Customer'
  | 'Event'
  | 'Other';

export type TechnoKraftService =
  | 'Custom Software Development'
  | 'Web Development'
  | 'Mobile App Development'
  | 'Cloud / DevOps'
  | 'AI / ML Solutions'
  | 'Cybersecurity'
  | 'UI/UX Design'
  | 'IT Consulting'
  | 'Digital Marketing / SEO'
  | 'Enterprise ERP / CRM'
  | 'Other';

export interface CompanyInfo {
  name: string;
  website: string;
  industry: string;
  companySize: string;
  country: string;
  state: string;
  city: string;
  linkedIn?: string;
  description?: string;
}

export interface ContactInfo {
  name: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  linkedIn?: string;
}

export interface BusinessRequirement {
  summary: string;
  problemStatement?: string;
  expectedTimeline: string;
  budgetRange: string;
  currentTech?: string;
  numberOfUsers?: string;
  additionalNotes?: string;
}

export interface LeadActivity {
  id: string;
  date: string;
  time: string;
  employeeName: string;
  employeeAvatar?: string;
  activityType: 'CALL' | 'EMAIL' | 'WHATSAPP' | 'STATUS_CHANGE' | 'FOLLOWUP' | 'NOTE' | 'CREATED';
  title: string;
  result?: string;
  notes?: string;
}

export interface FollowUpSchedule {
  id: string;
  date: string;
  time: string;
  type: 'Call' | 'Meeting' | 'Demo' | 'Email';
  assignedTo: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
  notes?: string;
}

export interface Lead {
  id: string;
  leadCode: string; // e.g., LD-2026-00125
  company: CompanyInfo;
  contact: ContactInfo;
  service: TechnoKraftService;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  score: number; // 0 - 100
  assignedEmployee: {
    name: string;
    avatar: string;
    role: string;
    email: string;
  };
  assignedBA?: {
    name: string;
    role: string;
  };
  createdBy: {
    name: string;
    date: string;
  };
  nextFollowUp?: {
    date: string;
    time: string;
    isOverdue?: boolean;
    displayString: string;
  };
  lastActivity: {
    date: string;
    summary: string;
  };
  requirement: BusinessRequirement;
  activities: LeadActivity[];
  followUps: FollowUpSchedule[];
  attachments?: {
    id: string;
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
  }[];
}

export interface LeadFilterState {
  search: string;
  status: string;
  source: string;
  service: string;
  assignedTo: string;
  priority: string;
  dateRange: string;
}
