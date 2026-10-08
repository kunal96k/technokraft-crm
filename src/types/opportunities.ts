export type OpportunityStage =
  | 'Qualified'
  | 'Requirement Received'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type OpportunityPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type OpportunityService =
  | 'Custom Software Development'
  | 'Web Development'
  | 'Mobile App Development'
  | 'Cloud / DevOps'
  | 'AI / ML'
  | 'Cybersecurity'
  | 'UI/UX'
  | 'IT Consulting'
  | 'Other';

export type LossReason =
  | 'Budget'
  | 'Competitor'
  | 'No Requirement'
  | 'Timing'
  | 'No Response'
  | 'Other';

export type ProposalStatus =
  | 'Draft'
  | 'Prepared'
  | 'Sent'
  | 'Viewed'
  | 'Under Review'
  | 'Negotiation'
  | 'Accepted'
  | 'Rejected'
  | 'Expired';

export interface OpportunityActivity {
  id: string;
  date: string;
  time: string;
  employeeName: string;
  employeeAvatar?: string;
  type: 'CREATED' | 'STAGE_CHANGE' | 'CALL' | 'EMAIL' | 'MEETING' | 'PROPOSAL' | 'NOTE' | 'STATUS';
  title: string;
  notes?: string;
}

export interface OpportunityFollowUp {
  id: string;
  date: string;
  time: string;
  type: 'Call' | 'Meeting' | 'Demo' | 'Email';
  assignedTo: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  notes?: string;
}

export interface OpportunityRequirement {
  summary: string;
  problemStatement?: string;
  expectedUsers?: string;
  timeline?: string;
  budget?: string;
  technicalRequirements?: string;
  notes?: string;
}

export interface OpportunityRecord {
  id: string;
  opportunityCode: string; // e.g. OPP-2026-0042
  name: string; // e.g. "Custom ERP Development"
  companyName: string; // e.g. "ABC Technologies Pvt Ltd"
  leadId?: string;
  leadCode?: string; // e.g. "LD-2026-00125"
  contactName: string;
  contactDesignation?: string;
  contactEmail?: string;
  contactPhone?: string;
  service: OpportunityService;
  stage: OpportunityStage;
  estimatedValue: number; // in INR rupees, e.g. 800000
  finalValue?: number; // when won
  probability: number; // 0 - 100 (%)
  expectedCloseDate: string; // e.g. "30 Sep 2026" or "2026-09-30"
  priority: OpportunityPriority;
  industry?: string;
  
  // Requirement breakdown
  requirement: OpportunityRequirement;

  // Assignment
  owner: {
    name: string;
    avatar: string;
    role: string;
    email: string;
  };
  businessAnalyst?: {
    name: string;
    role: string;
  };
  technicalReviewer?: {
    name: string;
    role: string;
  };
  createdBy: {
    name: string;
    date: string;
  };

  // Outcome
  wonDate?: string;
  wonNotes?: string;
  lossReason?: LossReason;
  lossNotes?: string;

  // Sub-entities
  proposalsCount?: number;
  activities: OpportunityActivity[];
  followUps: OpportunityFollowUp[];
  proposals?: ProposalRecord[];

  createdAt: string;
  updatedAt: string;
}

export interface ProposalMilestone {
  title: string;
  percentage: number;
  amount: number;
}

/** A single hosting/infrastructure line item (e.g. AWS EC2, S3, etc.) */
export interface HostingLineItem {
  id: string;
  description: string;   // e.g. "AWS EC2 t3.medium – 2 vCPU / 4 GB RAM"
  provider: string;      // e.g. "AWS", "GCP", "Azure", "Other"
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  unitCost: number;      // per unit / per month cost in INR
  quantity: number;      // number of instances or months
  totalCost: number;     // unitCost × quantity
  notes?: string;
}

/** A single managed-services or AMC line item */
export interface ServicesLineItem {
  id: string;
  description: string;   // e.g. "Application Support & Maintenance"
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  unitCost: number;
  quantity: number;
  totalCost: number;
  notes?: string;
}

export interface ProposalRecord {
  id: string;
  proposalCode: string; // e.g. "PR-2026-9182"
  opportunityId: string;
  opportunityName: string;
  leadCode?: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  service: OpportunityService;
  amount: number; // development amount in INR (excl. hosting/services)
  createdDate: string; // e.g. "2026-10-06"
  sentDate?: string;
  validUntil?: string;
  status: ProposalStatus;
  ownerName: string;
  summary: string;
  commercialDetails?: {
    milestones: ProposalMilestone[];
    paymentTerms?: string;
    taxes?: string;
    hostingSection?: {
      enabled: boolean;
      note?: string;
      items: HostingLineItem[];
      subtotal: number;
    };
    servicesSection?: {
      enabled: boolean;
      note?: string;
      items: ServicesLineItem[];
      subtotal: number;
    };
  };
  timelineDescription?: string;

  /** Optional: Hosting & Infrastructure section (AWS EC2, Domain, etc.) */
  hostingSection?: {
    enabled: boolean;
    note?: string; // e.g. "Hosting charges billed separately per actuals"
    items: HostingLineItem[];
    subtotal: number;
  };

  /** Optional: Managed Services / AMC section */
  servicesSection?: {
    enabled: boolean;
    note?: string;
    items: ServicesLineItem[];
    subtotal: number;
  };

  activityHistory?: {
    date: string;
    time: string;
    description: string;
    user: string;
  }[];
}

export interface PipelineFilterState {
  search: string;
  stage: string;
  assignedTo: string;
  service: string;
  probability: string;
  expectedClose: string;
  opportunityValue: string;
  industry: string;
}
