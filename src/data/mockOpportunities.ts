import { OpportunityRecord, ProposalRecord } from '../types/opportunities';

// Indian Rupee formatting helpers
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

export const MOCK_PROPOSALS: ProposalRecord[] = [
  {
    id: 'prop-1',
    proposalCode: 'PR-2026-00125',
    opportunityId: 'opp-1',
    opportunityName: 'Custom ERP Development',
    leadCode: 'LD-2026-00125',
    companyName: 'ABC Technologies Pvt Ltd',
    contactName: 'Nikita Patil',
    contactEmail: 'nikita.patil@abctechnologies.in',
    service: 'Custom Software Development',
    amount: 800000,
    createdDate: '07 Sep 2026',
    sentDate: '07 Sep 2026',
    validUntil: '30 Sep 2026',
    status: 'Sent',
    ownerName: 'Kunal Patil',
    summary:
      'Turnkey custom enterprise billing, client tenancy orchestrator, and real-time AWS/Azure resource meter integration.',
    commercialDetails: {
      milestones: [
        { title: 'Project Kickoff & Architecture Sign-off', percentage: 25, amount: 200000 },
        { title: 'Core Billing Engine & Multi-tenancy Module', percentage: 35, amount: 280000 },
        { title: 'Cloud Telemetry Connectors & User Acceptance', percentage: 25, amount: 200000 },
        { title: 'Deployment, Training & Final Handover', percentage: 15, amount: 120000 },
      ],
      paymentTerms: 'Net 15 days upon milestone milestone sign-off',
      taxes: '18% GST applicable as per standard Indian Tax norms',
    },
    timelineDescription: '14 Weeks from contract execution to production cutover.',
    activityHistory: [
      {
        date: '07 Sep 2026',
        time: '02:30 PM',
        description: 'Proposal delivered via official sales email to Nikita Patil.',
        user: 'Kunal Patil',
      },
      {
        date: '06 Sep 2026',
        time: '06:15 PM',
        description: 'Internal technical and pricing review approved by Solutions Architect.',
        user: 'Vikram Malhotra',
      },
    ],
  },
  {
    id: 'prop-2',
    proposalCode: 'PR-2026-00118',
    opportunityId: 'opp-4',
    opportunityName: 'Hospital Management & Patient Portal',
    leadCode: 'LD-2026-00118',
    companyName: 'Vertex Healthcare Systems',
    contactName: 'Dr. Sunita Deshmukh',
    contactEmail: 's.deshmukh@vertexhealthcare.org',
    service: 'Web Development',
    amount: 1000000,
    createdDate: '01 Sep 2026',
    sentDate: '02 Sep 2026',
    validUntil: '25 Sep 2026',
    status: 'Negotiation',
    ownerName: 'Shruti Raundal',
    summary:
      'HIPAA / ABDM compliant patient registration, OPD appointment scheduling, and doctor prescription management system.',
    commercialDetails: {
      milestones: [
        { title: 'UX Wireframes & ABDM Gateway Integration', percentage: 30, amount: 300000 },
        { title: 'EMR & Diagnostic Lab Connectors', percentage: 40, amount: 400000 },
        { title: 'Security Audit & Hospital Go-Live', percentage: 30, amount: 300000 },
      ],
      paymentTerms: 'Progressive milestone release against signed UAT certificate',
      taxes: '18% GST extra',
    },
    timelineDescription: '12 Weeks delivery schedule with pilot rollout in 2 branches.',
    activityHistory: [
      {
        date: '05 Sep 2026',
        time: '11:00 AM',
        description: 'Commercial negotiation meeting with Medical Director. Requested 5% discount on AMC.',
        user: 'Shruti Raundal',
      },
      {
        date: '02 Sep 2026',
        time: '04:00 PM',
        description: 'Proposal transmitted with ABDM security compliance deck.',
        user: 'Shruti Raundal',
      },
    ],
  },
  {
    id: 'prop-3',
    proposalCode: 'PR-2026-00109',
    opportunityId: 'opp-3',
    opportunityName: 'Smart Factory IoT & Shop-floor Analytics',
    leadCode: 'LD-2026-00109',
    companyName: 'NextGen Manufacturing',
    contactName: 'Anil Kulkarni',
    contactEmail: 'anil.k@nextgenmfg.co.in',
    service: 'AI / ML',
    amount: 600000,
    createdDate: '28 Aug 2026',
    sentDate: '29 Aug 2026',
    validUntil: '20 Sep 2026',
    status: 'Under Review',
    ownerName: 'Kunal Patil',
    summary:
      'Edge compute telematics and predictive machine failure anomaly detection model for 4 CNC milling lines.',
    commercialDetails: {
      milestones: [
        { title: 'Edge Hardware Setup & Telemetry Stream', percentage: 40, amount: 240000 },
        { title: 'Machine Learning Model Training & Dashboard', percentage: 40, amount: 240000 },
        { title: 'Factory Acceptance Testing & Training', percentage: 20, amount: 120000 },
      ],
      paymentTerms: '50% advance on PO, 50% on final factory sign-off',
      taxes: '18% GST extra',
    },
    timelineDescription: '8 Weeks sprint to deliver production inference pipeline.',
    activityHistory: [
      {
        date: '04 Sep 2026',
        time: '03:15 PM',
        description: 'Confirmed proposal is currently being reviewed by VP Operations.',
        user: 'Kunal Patil',
      },
    ],
  },
  {
    id: 'prop-4',
    proposalCode: 'PR-2026-00094',
    opportunityId: 'opp-5',
    opportunityName: 'Fleet Telematics & Cold-chain Tracker',
    leadCode: 'LD-2026-00094',
    companyName: 'Pioneer Logistics',
    contactName: 'Vikram Singhania',
    contactEmail: 'v.singhania@pioneerlogistics.in',
    service: 'Mobile App Development',
    amount: 500000,
    createdDate: '15 Aug 2026',
    sentDate: '18 Aug 2026',
    validUntil: '15 Sep 2026',
    status: 'Accepted',
    ownerName: 'Ankush Pandit',
    summary:
      'Driver mobile app and dispatcher web console for GPS live route monitoring and temperature excursion alerts.',
    commercialDetails: {
      milestones: [
        { title: 'Driver App Flutter Prototype', percentage: 50, amount: 250000 },
        { title: 'Backend Cloud Dispatcher & Fleet Rollout', percentage: 50, amount: 250000 },
      ],
      paymentTerms: 'Net 30 days post delivery',
      taxes: '18% GST inclusive',
    },
    timelineDescription: '6 Weeks total implementation.',
    activityHistory: [
      {
        date: '01 Sep 2026',
        time: '10:30 AM',
        description: 'Customer accepted proposal and issued Master Service Agreement.',
        user: 'Ankush Pandit',
      },
    ],
  },
  {
    id: 'prop-5',
    proposalCode: 'PR-2026-00088',
    opportunityId: 'opp-7',
    opportunityName: 'Cloud Migration & Kubernetes Modernization',
    leadCode: 'LD-2026-00088',
    companyName: 'OmniPay FinTech Solutions',
    contactName: 'Kavita Menon',
    contactEmail: 'kavita.m@omnipay.io',
    service: 'Cloud / DevOps',
    amount: 1800000,
    createdDate: '02 Sep 2026',
    sentDate: '03 Sep 2026',
    validUntil: '28 Sep 2026',
    status: 'Viewed',
    ownerName: 'Kunal Patil',
    summary:
      'Zero-downtime migration of legacy monolithic payment engine to AWS EKS with PCI-DSS audit hardening.',
    commercialDetails: {
      milestones: [
        { title: 'Terraform IaC & AWS Landing Zone', percentage: 30, amount: 540000 },
        { title: 'Containerization & CI/CD Pipeline', percentage: 40, amount: 720000 },
        { title: 'Cutover & PCI-DSS Certification Support', percentage: 30, amount: 540000 },
      ],
      paymentTerms: '30% advance, milestone payments every 30 days',
      taxes: '18% GST extra',
    },
    timelineDescription: '10 Weeks structured migration.',
    activityHistory: [
      {
        date: '04 Sep 2026',
        time: '04:45 PM',
        description: 'Client opened and downloaded proposal PDF from portal link.',
        user: 'Kunal Patil',
      },
    ],
  },
];

export const MOCK_OPPORTUNITIES: OpportunityRecord[] = [
  {
    id: 'opp-1',
    opportunityCode: 'OPP-2026-00125',
    name: 'Custom ERP Development',
    companyName: 'ABC Technologies Pvt Ltd',
    leadId: 'lead-1',
    leadCode: 'LD-2026-00125',
    contactName: 'Nikita Patil',
    contactDesignation: 'Chief Technology Officer (CTO)',
    contactEmail: 'nikita.patil@abctechnologies.in',
    contactPhone: '+91 98230 45612',
    service: 'Custom Software Development',
    stage: 'Proposal',
    estimatedValue: 800000,
    probability: 70,
    expectedCloseDate: '30 Sep 2026',
    priority: 'High',
    industry: 'IT & Cloud Infrastructure',
    requirement: {
      summary:
        'Needs custom multi-tenant billing & resource orchestration portal for their hybrid cloud clients.',
      problemStatement:
        'Current billing is manual across AWS, Azure, and private data center nodes, causing severe invoicing delays and revenue leakage.',
      expectedUsers: '1,200 external enterprise clients and 45 internal finance agents',
      timeline: '3 to 4 months',
      budget: '₹8,00,000 - ₹10,00,000',
      technicalRequirements:
        'Node.js microservices, PostgreSQL with partitioned time-series billing data, Docker containers on AWS ECS, OAuth2 Single Sign-on.',
      notes:
        'Client has scheduled a formal technical demo call for 10th September with their VP of Infrastructure.',
    },
    owner: {
      name: 'Kunal Patil',
      avatar: 'KP',
      role: 'Sales Manager',
      email: 'kunal.patil@technokraft.com',
    },
    businessAnalyst: {
      name: 'Pranav Jejurkar',
      role: 'Senior Business Analyst',
    },
    technicalReviewer: {
      name: 'Vikram Malhotra',
      role: 'Solutions Architect',
    },
    createdBy: {
      name: 'Kunal Patil',
      date: '02 Sep 2026',
    },
    proposalsCount: 1,
    activities: [
      {
        id: 'act-1',
        date: '07 Sep 2026',
        time: '02:30 PM',
        employeeName: 'Kunal Patil',
        type: 'PROPOSAL',
        title: 'Commercial Proposal PR-2026-00125 Sent',
        notes: 'Transmitted proposal for ₹8,00,000 with 14-week delivery roadmap.',
      },
      {
        id: 'act-2',
        date: '06 Sep 2026',
        time: '11:00 AM',
        employeeName: 'Pranav Jejurkar',
        type: 'NOTE',
        title: 'Requirement Document Finalized',
        notes: 'Architectural scope validated by Vikram Malhotra. Ready for commercial proposal.',
      },
      {
        id: 'act-3',
        date: '04 Sep 2026',
        time: '04:15 PM',
        employeeName: 'Kunal Patil',
        type: 'STAGE_CHANGE',
        title: 'Stage moved from Requirement Received to Proposal',
        notes: 'Requirement confirmed after technical discovery call with CTO Nikita Patil.',
      },
      {
        id: 'act-4',
        date: '02 Sep 2026',
        time: '10:00 AM',
        employeeName: 'Kunal Patil',
        type: 'CREATED',
        title: 'Opportunity Created from Qualified Lead LD-2026-00125',
        notes: 'Converted lead after qualification. Estimated deal size set to ₹8,00,000 with 70% probability.',
      },
    ],
    followUps: [
      {
        id: 'fu-1',
        date: '2026-09-10',
        time: '03:00 PM',
        type: 'Meeting',
        assignedTo: 'Kunal Patil',
        status: 'Pending',
        notes: 'Technical review meeting with CTO Nikita Patil and VP Infrastructure.',
      },
    ],
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-07T14:30:00Z',
  },
  {
    id: 'opp-2',
    opportunityCode: 'OPP-2026-00126',
    name: 'Hybrid Cloud Migration & Security Audit',
    companyName: 'Global IT Solutions',
    leadId: 'lead-2',
    leadCode: 'LD-2026-00126',
    contactName: 'Nitin Gadkari',
    contactDesignation: 'VP Infrastructure',
    contactEmail: 'nitin.g@globalitsolutions.com',
    contactPhone: '+91 97654 32109',
    service: 'Cloud / DevOps',
    stage: 'Qualified',
    estimatedValue: 450000,
    probability: 60,
    expectedCloseDate: '15 Oct 2026',
    priority: 'Medium',
    industry: 'Enterprise IT Services',
    requirement: {
      summary: 'Audit existing AWS workloads and migrate legacy on-prem Active Directory to Azure AD.',
      expectedUsers: '350 employees across 3 regional branches',
      timeline: '6 to 8 weeks',
      budget: '₹4,50,000',
      technicalRequirements: 'AWS IAM, Azure AD Connect, Terraform, SOC2 compliance policies.',
      notes: 'Customer looking for quick execution before their ISO 27001 annual recertification.',
    },
    owner: {
      name: 'Shruti Raundal',
      avatar: 'SR',
      role: 'Account Executive',
      email: 'shruti.raundal@technokraft.com',
    },
    businessAnalyst: {
      name: 'Pranav Jejurkar',
      role: 'Senior Business Analyst',
    },
    createdBy: {
      name: 'Shruti Raundal',
      date: '04 Sep 2026',
    },
    proposalsCount: 0,
    activities: [
      {
        id: 'act-21',
        date: '06 Sep 2026',
        time: '03:45 PM',
        employeeName: 'Shruti Raundal',
        type: 'CALL',
        title: 'Discovery Call Completed',
        notes: 'Verified compliance requirements. Nitin agreed to provide current cloud architecture diagram.',
      },
      {
        id: 'act-22',
        date: '04 Sep 2026',
        time: '02:30 PM',
        employeeName: 'Shruti Raundal',
        type: 'CREATED',
        title: 'Opportunity Created',
        notes: 'Opportunity logged under Cloud / DevOps with estimated value ₹4,50,000.',
      },
    ],
    followUps: [
      {
        id: 'fu-21',
        date: '2026-09-08',
        time: '11:00 AM',
        type: 'Call',
        assignedTo: 'Shruti Raundal',
        status: 'Pending',
        notes: 'Collect architectural diagram and confirm security audit checklist.',
      },
    ],
    createdAt: '2026-09-04T14:30:00Z',
    updatedAt: '2026-09-06T15:45:00Z',
  },
  {
    id: 'opp-3',
    opportunityCode: 'OPP-2026-00109',
    name: 'Smart Factory IoT & Shop-floor Analytics',
    companyName: 'NextGen Manufacturing',
    leadId: 'lead-3',
    leadCode: 'LD-2026-00109',
    contactName: 'Anil Kulkarni',
    contactDesignation: 'Director of Plant Operations',
    contactEmail: 'anil.k@nextgenmfg.co.in',
    contactPhone: '+91 99220 18342',
    service: 'AI / ML',
    stage: 'Requirement Received',
    estimatedValue: 1200000,
    probability: 65,
    expectedCloseDate: '20 Oct 2026',
    priority: 'High',
    industry: 'Industrial Automation & Auto Components',
    requirement: {
      summary:
        'Edge telematics and vibration anomaly detection for machine breakdown prevention in Chakan manufacturing facility.',
      problemStatement:
        'Unscheduled machine downtime on assembly line costs approximately ₹15L per month in idle labor and delayed dispatches.',
      expectedUsers: '18 shop-floor supervisors and 4 plant managers',
      timeline: '10 to 12 weeks',
      budget: '₹12,00,000',
      technicalRequirements:
        'MQTT telemetry stream, Python / PyTorch vibration anomaly model, Grafana dashboard, SMS alarm gateway.',
      notes: 'Initial site visit completed by Business Analyst Pranav Jejurkar on 30th August.',
    },
    owner: {
      name: 'Kunal Patil',
      avatar: 'KP',
      role: 'Sales Manager',
      email: 'kunal.patil@technokraft.com',
    },
    businessAnalyst: {
      name: 'Pranav Jejurkar',
      role: 'Senior Business Analyst',
    },
    technicalReviewer: {
      name: 'Vikram Malhotra',
      role: 'Solutions Architect',
    },
    createdBy: {
      name: 'Kunal Patil',
      date: '28 Aug 2026',
    },
    proposalsCount: 1,
    activities: [
      {
        id: 'act-31',
        date: '05 Sep 2026',
        time: '12:00 PM',
        employeeName: 'Pranav Jejurkar',
        type: 'NOTE',
        title: 'Detailed Technical Scope Sheet Prepared',
        notes: 'Finalized sensor protocol requirements and server edge hardware specs.',
      },
      {
        id: 'act-32',
        date: '28 Aug 2026',
        time: '11:15 AM',
        employeeName: 'Kunal Patil',
        type: 'CREATED',
        title: 'Opportunity Created from Qualified Lead',
        notes: 'Enterprise deal for ₹12,00,000 IoT analytics platform.',
      },
    ],
    followUps: [
      {
        id: 'fu-31',
        date: '2026-09-09',
        time: '02:00 PM',
        type: 'Meeting',
        assignedTo: 'Kunal Patil',
        status: 'Pending',
        notes: 'Commercial review meeting with Managing Director at factory premises.',
      },
    ],
    createdAt: '2026-08-28T11:15:00Z',
    updatedAt: '2026-09-05T12:00:00Z',
  },
  {
    id: 'opp-4',
    opportunityCode: 'OPP-2026-00118',
    name: 'Hospital Management & Patient Portal',
    companyName: 'Vertex Healthcare Systems',
    leadId: 'lead-4',
    leadCode: 'LD-2026-00118',
    contactName: 'Dr. Sunita Deshmukh',
    contactDesignation: 'Medical Director',
    contactEmail: 's.deshmukh@vertexhealthcare.org',
    contactPhone: '+91 98901 23456',
    service: 'Web Development',
    stage: 'Negotiation',
    estimatedValue: 1000000,
    probability: 85,
    expectedCloseDate: '25 Sep 2026',
    priority: 'Urgent',
    industry: 'Healthcare & Hospital Chain',
    requirement: {
      summary:
        'Complete digital transformation of patient OPD registration, electronic medical records, and diagnostic lab notifications.',
      problemStatement:
        'Patients experience long wait queues at reception desks and physical paper records frequently go missing between departments.',
      expectedUsers: '80 doctors, 140 nurses, and 15,000+ registered patients per month',
      timeline: '3 months',
      budget: '₹10,00,000',
      technicalRequirements:
        'React SPA, Node.js GraphQL API, PostgreSQL database with data-at-rest encryption, ABDM / Ayushman Bharat Digital Mission API compliance.',
      notes:
        'Customer asked for final revised commercial proposal with 3-year AMC terms. Closing expected this month.',
    },
    owner: {
      name: 'Shruti Raundal',
      avatar: 'SR',
      role: 'Account Executive',
      email: 'shruti.raundal@technokraft.com',
    },
    businessAnalyst: {
      name: 'Pranav Jejurkar',
      role: 'Senior Business Analyst',
    },
    createdBy: {
      name: 'Shruti Raundal',
      date: '20 Aug 2026',
    },
    proposalsCount: 1,
    activities: [
      {
        id: 'act-41',
        date: '05 Sep 2026',
        time: '11:00 AM',
        employeeName: 'Shruti Raundal',
        type: 'STAGE_CHANGE',
        title: 'Stage Moved to Negotiation',
        notes: 'Price discussion on AMC structure. Revised final value set at ₹10,00,000.',
      },
      {
        id: 'act-42',
        date: '02 Sep 2026',
        time: '04:00 PM',
        employeeName: 'Shruti Raundal',
        type: 'PROPOSAL',
        title: 'Commercial Proposal PR-2026-00118 Dispatched',
        notes: 'Sent formal proposal with ABDM architecture document.',
      },
    ],
    followUps: [
      {
        id: 'fu-41',
        date: '2026-09-08',
        time: '04:30 PM',
        type: 'Call',
        assignedTo: 'Shruti Raundal',
        status: 'Pending',
        notes: 'Final contract clause review call with Legal Head.',
      },
    ],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-05T11:00:00Z',
  },
  {
    id: 'opp-5',
    opportunityCode: 'OPP-2026-00094',
    name: 'Fleet Telematics & Cold-chain Tracker',
    companyName: 'Pioneer Logistics',
    leadId: 'lead-5',
    leadCode: 'LD-2026-00094',
    contactName: 'Vikram Singhania',
    contactDesignation: 'Managing Director',
    contactEmail: 'v.singhania@pioneerlogistics.in',
    contactPhone: '+91 98112 34567',
    service: 'Mobile App Development',
    stage: 'Won',
    estimatedValue: 500000,
    finalValue: 500000,
    probability: 100,
    expectedCloseDate: '01 Sep 2026',
    wonDate: '01 Sep 2026',
    wonNotes: 'Client signed Master Services Agreement and issued 50% mobilization advance cheque.',
    priority: 'Medium',
    industry: 'Supply Chain & Cold Logistics',
    requirement: {
      summary: 'Mobile telematics driver app and real-time reefer truck temperature logger.',
      expectedUsers: '120 refrigerated truck drivers and 12 centralized logistics dispatchers',
      timeline: '6 weeks',
      budget: '₹5,00,000',
      technicalRequirements: 'Flutter cross-platform app, BLE sensor gateway, Firebase Realtime Database.',
      notes: 'Deal closed successfully! Project Kickoff meeting held on 03 Sep 2026.',
    },
    owner: {
      name: 'Ankush Pandit',
      avatar: 'AP',
      role: 'Inside Sales Specialist',
      email: 'ankush.pandit@technokraft.com',
    },
    createdBy: {
      name: 'Ankush Pandit',
      date: '10 Aug 2026',
    },
    proposalsCount: 1,
    activities: [
      {
        id: 'act-51',
        date: '01 Sep 2026',
        time: '11:00 AM',
        employeeName: 'Ankush Pandit',
        type: 'STATUS',
        title: 'Opportunity Closed WON 🎉',
        notes: 'Final contract signed at ₹5,00,000. Project handed over to Engineering delivery team.',
      },
    ],
    followUps: [],
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-09-01T11:00:00Z',
  },
  {
    id: 'opp-6',
    opportunityCode: 'OPP-2026-00078',
    name: 'Fintech Micro-lending Mobile App',
    companyName: 'BrightEdge Solutions',
    leadId: 'lead-6',
    leadCode: 'LD-2026-00078',
    contactName: 'Sanjay Mehta',
    contactDesignation: 'Chief Product Officer',
    contactEmail: 'sanjay@brightedge.in',
    contactPhone: '+91 99300 44556',
    service: 'Mobile App Development',
    stage: 'Lost',
    estimatedValue: 1250000,
    probability: 0,
    expectedCloseDate: '25 Aug 2026',
    lossReason: 'Budget',
    lossNotes:
      'Client selected a low-cost overseas boutique agency that offered fixed-price development at 40% lower cost.',
    priority: 'High',
    industry: 'Financial Services & Microfinance',
    requirement: {
      summary: 'iOS and Android lending app with instant Aadhaar e-KYC and digital credit underwriting.',
      timeline: '3 months',
      budget: '₹7,00,000 (Mismatch with initial estimated ₹12.5L)',
      notes: 'Maintained polite relationship. Sanjay mentioned they may re-engage us for code auditing.',
    },
    owner: {
      name: 'Kunal Patil',
      avatar: 'KP',
      role: 'Sales Manager',
      email: 'kunal.patil@technokraft.com',
    },
    createdBy: {
      name: 'Kunal Patil',
      date: '01 Aug 2026',
    },
    proposalsCount: 1,
    activities: [
      {
        id: 'act-61',
        date: '25 Aug 2026',
        time: '05:30 PM',
        employeeName: 'Kunal Patil',
        type: 'STATUS',
        title: 'Opportunity Marked Lost',
        notes: 'Loss reason: Budget constraint. Customer selected cheaper boutique offshore team.',
      },
    ],
    followUps: [],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-25T17:30:00Z',
  },
  {
    id: 'opp-7',
    opportunityCode: 'OPP-2026-00088',
    name: 'Cloud Migration & Kubernetes Modernization',
    companyName: 'OmniPay FinTech Solutions',
    leadCode: 'LD-2026-00088',
    contactName: 'Kavita Menon',
    contactDesignation: 'Head of Engineering',
    contactEmail: 'kavita.m@omnipay.io',
    contactPhone: '+91 98450 78912',
    service: 'Cloud / DevOps',
    stage: 'Proposal',
    estimatedValue: 1800000,
    probability: 60,
    expectedCloseDate: '30 Oct 2026',
    priority: 'Urgent',
    industry: 'FinTech & Payments',
    requirement: {
      summary: 'Zero-downtime migration of transaction processing engine from on-prem to AWS EKS.',
      expectedUsers: '40 engineers and 1M daily payment transactions',
      timeline: '10 weeks',
      budget: '₹18,00,000',
      technicalRequirements: 'AWS EKS, Terraform, HashiCorp Vault, Datadog monitoring.',
    },
    owner: {
      name: 'Kunal Patil',
      avatar: 'KP',
      role: 'Sales Manager',
      email: 'kunal.patil@technokraft.com',
    },
    createdBy: {
      name: 'Kunal Patil',
      date: '15 Aug 2026',
    },
    proposalsCount: 1,
    activities: [
      {
        id: 'act-71',
        date: '03 Sep 2026',
        time: '04:00 PM',
        employeeName: 'Kunal Patil',
        type: 'PROPOSAL',
        title: 'Proposal PR-2026-00088 Sent',
        notes: 'Sent architecture blueprint and pricing breakdown.',
      },
    ],
    followUps: [
      {
        id: 'fu-71',
        date: '2026-09-12',
        time: '02:30 PM',
        type: 'Call',
        assignedTo: 'Kunal Patil',
        status: 'Pending',
        notes: 'Follow-up on architecture review with Kavita Menon.',
      },
    ],
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-09-03T16:00:00Z',
  },
  {
    id: 'opp-8',
    opportunityCode: 'OPP-2026-00130',
    name: 'Pharma Batch Serialization & Track-and-Trace',
    companyName: 'Apex Pharma Tech',
    leadCode: 'LD-2026-00130',
    contactName: 'Ramesh Patel',
    contactDesignation: 'Head of Quality Assurance',
    contactEmail: 'ramesh.patel@apexpharma.in',
    contactPhone: '+91 97123 45678',
    service: 'Custom Software Development',
    stage: 'Requirement Received',
    estimatedValue: 2500000,
    probability: 50,
    expectedCloseDate: '15 Nov 2026',
    priority: 'High',
    industry: 'Pharmaceutical Manufacturing',
    requirement: {
      summary:
        'Enterprise 2D barcode serialization system compliant with US-FDA DSCSA and Indian export regulations.',
      expectedUsers: '4 manufacturing plants and 220 packaging line operators',
      timeline: '4 months',
      budget: '₹25,00,000',
      technicalRequirements:
        'Industrial barcode camera integration, GS1 DataMatrix standards, audit-trail compliance (21 CFR Part 11).',
    },
    owner: {
      name: 'Shruti Raundal',
      avatar: 'SR',
      role: 'Account Executive',
      email: 'shruti.raundal@technokraft.com',
    },
    createdBy: {
      name: 'Shruti Raundal',
      date: '03 Sep 2026',
    },
    proposalsCount: 0,
    activities: [
      {
        id: 'act-81',
        date: '05 Sep 2026',
        time: '03:00 PM',
        employeeName: 'Pranav Jejurkar',
        type: 'NOTE',
        title: 'Requirement Gathering Workshop Completed',
        notes: 'Gathered FDA compliance and GS1 serialization specifications.',
      },
    ],
    followUps: [
      {
        id: 'fu-81',
        date: '2026-09-11',
        time: '11:30 AM',
        type: 'Meeting',
        assignedTo: 'Shruti Raundal',
        status: 'Pending',
        notes: 'Present technical architecture proposal to QA Board.',
      },
    ],
    createdAt: '2026-09-03T09:30:00Z',
    updatedAt: '2026-09-05T15:00:00Z',
  },
  {
    id: 'opp-9',
    opportunityCode: 'OPP-2026-00135',
    name: 'AI-Powered Customer Support Chatbot & Agent Copilot',
    companyName: 'Zen Logistics India',
    leadCode: 'LD-2026-00135',
    contactName: 'Manish Verma',
    contactDesignation: 'Chief Customer Officer',
    contactEmail: 'manish.v@zenlogistics.co',
    contactPhone: '+91 99870 12345',
    service: 'AI / ML',
    stage: 'Qualified',
    estimatedValue: 600000,
    probability: 55,
    expectedCloseDate: '28 Oct 2026',
    priority: 'Medium',
    industry: 'Logistics & Warehousing',
    requirement: {
      summary: 'Conversational AI chatbot integrated with WhatsApp and Zendesk for instant package tracking.',
      timeline: '6 weeks',
      budget: '₹6,00,000',
    },
    owner: {
      name: 'Ankush Pandit',
      avatar: 'AP',
      role: 'Inside Sales Specialist',
      email: 'ankush.pandit@technokraft.com',
    },
    createdBy: {
      name: 'Ankush Pandit',
      date: '05 Sep 2026',
    },
    proposalsCount: 0,
    activities: [
      {
        id: 'act-91',
        date: '06 Sep 2026',
        time: '10:15 AM',
        employeeName: 'Ankush Pandit',
        type: 'CALL',
        title: 'Lead Qualified into Opportunity',
        notes: 'Verified intent and monthly customer query volume (50k queries/month).',
      },
    ],
    followUps: [
      {
        id: 'fu-91',
        date: '2026-09-09',
        time: '12:00 PM',
        type: 'Demo',
        assignedTo: 'Ankush Pandit',
        status: 'Pending',
        notes: 'AI Copilot product demo with Customer Support Leads.',
      },
    ],
    createdAt: '2026-09-05T14:00:00Z',
    updatedAt: '2026-09-06T10:15:00Z',
  },
  {
    id: 'opp-10',
    opportunityCode: 'OPP-2026-00138',
    name: 'Next-Gen B2B eCommerce Marketplace Portal',
    companyName: 'Apex Industrial Supplies',
    leadCode: 'LD-2026-00138',
    contactName: 'Rajesh Kothari',
    contactDesignation: 'Managing Partner',
    contactEmail: 'rajesh@apexsupplies.in',
    contactPhone: '+91 98200 98765',
    service: 'Web Development',
    stage: 'Negotiation',
    estimatedValue: 1500000,
    probability: 80,
    expectedCloseDate: '05 Oct 2026',
    priority: 'High',
    industry: 'B2B Wholesale & Distribution',
    requirement: {
      summary: 'Custom B2B eCommerce ordering platform with tiered corporate pricing and credit line management.',
      expectedUsers: '800 distributor companies and 25 warehouse fulfillment staff',
      timeline: '3 to 4 months',
      budget: '₹15,00,000',
    },
    owner: {
      name: 'Kunal Patil',
      avatar: 'KP',
      role: 'Sales Manager',
      email: 'kunal.patil@technokraft.com',
    },
    createdBy: {
      name: 'Kunal Patil',
      date: '18 Aug 2026',
    },
    proposalsCount: 1,
    activities: [
      {
        id: 'act-101',
        date: '04 Sep 2026',
        time: '05:00 PM',
        employeeName: 'Kunal Patil',
        type: 'MEETING',
        title: 'Commercial Negotiation Meeting',
        notes: 'Negotiated payment terms to 4 milestone releases. Final contract draft in legal review.',
      },
    ],
    followUps: [
      {
        id: 'fu-101',
        date: '2026-09-08',
        time: '02:00 PM',
        type: 'Call',
        assignedTo: 'Kunal Patil',
        status: 'Pending',
        notes: 'Confirm signing date with Rajesh Kothari.',
      },
    ],
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-09-04T17:00:00Z',
  },
];

// LocalStorage helpers to support mutations across pages
const OPP_STORAGE_KEY = 'technokraft_crm_opportunities';
const PROP_STORAGE_KEY = 'technokraft_crm_proposals';

export const getStoredOpportunities = (): OpportunityRecord[] => {
  try {
    const raw = localStorage.getItem(OPP_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load opportunities from localStorage', e);
  }
  return MOCK_OPPORTUNITIES;
};

export const saveStoredOpportunities = (opps: OpportunityRecord[]): void => {
  try {
    localStorage.setItem(OPP_STORAGE_KEY, JSON.stringify(opps));
  } catch (e) {
    console.error('Failed to save opportunities to localStorage', e);
  }
};

export const getStoredProposals = (): ProposalRecord[] => {
  try {
    const raw = localStorage.getItem(PROP_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load proposals from localStorage', e);
  }
  return MOCK_PROPOSALS;
};

export const saveStoredProposals = (props: ProposalRecord[]): void => {
  try {
    localStorage.setItem(PROP_STORAGE_KEY, JSON.stringify(props));
  } catch (e) {
    console.error('Failed to save proposals to localStorage', e);
  }
};
