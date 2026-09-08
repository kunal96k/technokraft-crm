import {
  EmailRecord,
  EmailTemplate,
  WhatsAppConversation,
  WhatsAppTemplate,
  CommunicationStats,
} from '../types/communication';
import { Lead } from '../types/leads';

export const MOCK_COMMUNICATION_STATS: CommunicationStats = {
  sentToday: 86,
  scheduled: 14,
  replies: 23,
  failed: 3,
  whatsappSentToday: 186,
  whatsappActiveConversations: 42,
};

export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Initial Introduction',
    category: 'Outreach',
    subject: 'TechnoKraft Services LLP — Introduction & {{service}} Capabilities',
    body: `Dear {{contact_name}},

Thank you for connecting with TechnoKraft Services LLP. We are an enterprise software engineering and cloud consulting firm specializing in {{service}} for forward-thinking organizations.

Based on our preliminary review of {{company_name}}, we believe our engineering team can help streamline your digital infrastructure and accelerate delivery.

Would you be open for a brief 15-minute introductory call this week to discuss your current challenges and potential synergies?

Looking forward to hearing from you.

Regards,
{{employee_name}}
TechnoKraft Services LLP
Website: https://technokraft.com`,
    variables: ['contact_name', 'service', 'company_name', 'employee_name'],
  },
  {
    id: 'tpl-2',
    name: 'Lead Follow-up',
    category: 'Follow-up',
    subject: 'Following up on our recent conversation — {{company_name}} & TechnoKraft',
    body: `Dear {{contact_name}},

I wanted to follow up on our previous conversation regarding {{service}} at {{company_name}}.

We understand that you are evaluating timelines and architectural feasibility. Have you had an opportunity to review the key points we discussed?

I would be glad to address any queries or set up a technical deep-dive session with our solutions architect.

Please let me know a suitable time that works for you.

Regards,
{{employee_name}}
TechnoKraft Services LLP`,
    variables: ['contact_name', 'service', 'company_name', 'employee_name'],
  },
  {
    id: 'tpl-3',
    name: 'Requirement Follow-up',
    category: 'Discovery',
    subject: 'Requirement clarification for {{service}} — Ref: {{lead_id}}',
    body: `Dear {{contact_name}},

Thank you for sharing your initial requirements with TechnoKraft Services.

To help our technical architecture team prepare an accurate scope and commercial estimate for {{service}}, we would appreciate your inputs on a few key points:

1. Target deployment timeline and primary milestones.
2. Current tech stack integration constraints.
3. Expected concurrent user volume and scalability benchmarks.

Requirement Reference:
{{requirement}}

We can also schedule a quick 20-minute call to walk through these specifications together.

Regards,
{{employee_name}}
TechnoKraft Services LLP`,
    variables: ['contact_name', 'service', 'lead_id', 'requirement', 'employee_name'],
  },
  {
    id: 'tpl-4',
    name: 'Meeting Confirmation',
    category: 'Scheduling',
    subject: 'Meeting Confirmation: TechnoKraft Services & {{company_name}}',
    body: `Dear {{contact_name}},

This email confirms our scheduled discussion to review {{service}} requirements for {{company_name}}.

Meeting Details:
• Topic: Technical Discovery & Architecture Review
• Reference: {{lead_id}}
• Participants: {{contact_name}} ({{designation}}), {{employee_name}} (TechnoKraft Services)

A calendar invitation with the video conference link has been dispatched to your email ({{recipient_email}}).

Please let us know if you need to reschedule or invite additional team members.

Regards,
{{employee_name}}
TechnoKraft Services LLP`,
    variables: ['contact_name', 'service', 'company_name', 'lead_id', 'designation', 'employee_name', 'recipient_email'],
  },
  {
    id: 'tpl-5',
    name: 'Proposal Submission',
    category: 'Proposal',
    subject: 'Technical & Commercial Proposal: {{service}} for {{company_name}}',
    body: `Dear {{contact_name}},

Following our detailed technical discovery sessions, we are pleased to submit our formal Technical & Commercial Proposal for {{service}} for {{company_name}} (Ref: {{lead_id}}).

Key Highlights of the Proposal:
• Modular microservices architecture ensuring high reliability and zero downtime.
• Comprehensive agile delivery roadmap with bi-weekly sprint demos.
• Dedicated DevOps CI/CD pipeline, QA automation, and post-launch SLA coverage.

The complete proposal document has been attached for your review.

We would love to schedule a 30-minute walkthrough with your executive team at your convenience.

Regards,
{{employee_name}}
TechnoKraft Services LLP`,
    variables: ['contact_name', 'service', 'company_name', 'lead_id', 'employee_name'],
  },
  {
    id: 'tpl-6',
    name: 'Proposal Follow-up',
    category: 'Proposal',
    subject: 'Follow-up on Technical Proposal — {{company_name}}',
    body: `Dear {{contact_name}},

I am following up regarding the {{service}} proposal we submitted for {{company_name}} last week (Ref: {{lead_id}}).

Have you and the management team had a chance to go through the document? If you have any technical questions or would like to adjust the sprint milestones or commercial terms, our team is ready to assist.

Looking forward to your thoughts.

Regards,
{{employee_name}}
TechnoKraft Services LLP`,
    variables: ['contact_name', 'service', 'company_name', 'lead_id', 'employee_name'],
  },
  {
    id: 'tpl-7',
    name: 'Thank You',
    category: 'General',
    subject: 'Thank you for choosing TechnoKraft Services LLP — {{company_name}}',
    body: `Dear {{contact_name}},

On behalf of the entire team at TechnoKraft Services LLP, I would like to express our sincere appreciation for your trust and partnership with us on {{service}}.

We are committed to delivering an exceptional solution that drives measurable value for {{company_name}}. Our project manager will reach out shortly with onboarding details.

Thank you once again!

Warm regards,
{{employee_name}}
TechnoKraft Services LLP`,
    variables: ['contact_name', 'service', 'company_name', 'employee_name'],
  },
  {
    id: 'tpl-8',
    name: 'Custom',
    category: 'General',
    subject: 'Update regarding {{service}} — {{company_name}}',
    body: `Dear {{contact_name}},

Write your personalized message here...

Regards,
{{employee_name}}
TechnoKraft Services LLP`,
    variables: ['contact_name', 'service', 'company_name', 'employee_name'],
  },
];

export const MOCK_EMAILS: EmailRecord[] = [
  {
    id: 'email-1',
    leadId: 'lead-1',
    leadCode: 'LD-2026-00125',
    companyName: 'ABC Technologies Pvt Ltd',
    recipientName: 'Nikita Patil',
    recipientEmail: 'nikita.patil@abctechnologies.in',
    cc: ['tech-team@abctechnologies.in'],
    subject: 'Custom Software Development Proposal — Cloud Management Portal',
    body: `Dear Nikita,

Thank you for discussing your software requirements with TechnoKraft Services.

Following our discovery call today, we have assembled the initial architectural overview and cost estimation for the multi-tenant billing & resource orchestration portal.

Key Modules Included:
1. Multi-cloud cost aggregation engine (AWS & Azure APIs)
2. Automated invoice generation and ledger reconciliation
3. Role-based tenant dashboards with drill-down consumption metrics
4. High availability deployment on Kubernetes

Please find the detailed proposal attached (PDF). Let us know your thoughts and when we can schedule a walkthrough with your technical committee.

Regards,
Kunal Patil
Sales Manager | TechnoKraft Services LLP`,
    status: 'sent',
    senderName: 'Kunal Patil',
    senderEmail: 'kunal.patil@technokraft.com',
    date: 'Today',
    time: '11:42 AM',
    timestamp: '2026-09-07T11:42:00',
    attachments: [
      { id: 'att-1', name: 'ABC_Tech_Software_Proposal_v1.pdf', size: '2.4 MB', type: 'application/pdf' },
      { id: 'att-2', name: 'Architecture_Diagram_Draft.png', size: '850 KB', type: 'image/png' },
    ],
    tracking: {
      sent: true,
      delivered: true,
      opened: true,
      replied: false,
      openedAt: 'Today, 11:58 AM',
    },
  },
  {
    id: 'email-2',
    leadId: 'lead-2',
    leadCode: 'LD-2026-00148',
    companyName: 'Global IT Solutions',
    recipientName: 'Shruti Raundal',
    recipientEmail: 'priya.shah@globalitsol.com',
    subject: 'Requirement clarification on Cloud / DevOps migration',
    body: `Dear Priya,

Thank you for the detailed discussion regarding Global IT Solutions' planned cloud infrastructure migration.

Our senior DevOps architect has reviewed your current on-premise footprint. We would like to clarify if you have existing CI/CD automation in GitLab, or if you would prefer TechnoKraft to construct end-to-end GitHub Actions pipelines with Terraform infrastructure-as-code.

We have scheduled our discovery follow-up for tomorrow. Looking forward to your response.

Regards,
Ankush Pandit
Senior Account Executive | TechnoKraft Services LLP`,
    status: 'reply_received',
    senderName: 'Ankush Pandit',
    senderEmail: 'ankush.pandit@technokraft.com',
    date: 'Today',
    time: '10:15 AM',
    timestamp: '2026-09-07T10:15:00',
    attachments: [],
    tracking: {
      sent: true,
      delivered: true,
      opened: true,
      replied: true,
      openedAt: 'Today, 10:22 AM',
      repliedAt: 'Today, 10:48 AM',
    },
  },
  {
    id: 'email-3',
    leadId: 'lead-3',
    leadCode: 'LD-2026-00098',
    companyName: 'NextGen Manufacturing',
    recipientName: 'Vikram Deshmukh',
    recipientEmail: 'vikram.d@nextgenmfg.co.in',
    subject: 'TechnoKraft B2B Portal Demo & Scope Presentation',
    body: `Dear Vikram,

As discussed during our preliminary alignment meeting, our frontend team has prepared an interactive wireframe of the distributor ordering and inventory sync portal.

We will conduct a 30-minute demonstration covering:
- ERP database connector integration
- Barcode scanner interface for warehouse operators
- Real-time stock alerts and automated reordering thresholds

The meeting invite has been sent. Looking forward to our call.

Regards,
Kunal Patil
Sales Manager | TechnoKraft Services LLP`,
    status: 'scheduled',
    senderName: 'Kunal Patil',
    senderEmail: 'kunal.patil@technokraft.com',
    date: 'Today',
    time: '04:30 PM',
    timestamp: '2026-09-07T16:30:00',
    scheduledFor: 'Today, 04:30 PM',
    attachments: [
      { id: 'att-3', name: 'NextGen_Portal_Milestones.pdf', size: '1.8 MB', type: 'application/pdf' },
    ],
    tracking: {
      sent: false,
      delivered: false,
      opened: false,
      replied: false,
    },
  },
  {
    id: 'email-4',
    leadId: 'lead-4',
    leadCode: 'LD-2026-00177',
    companyName: 'Vertex Healthcare Systems',
    recipientName: 'Ananya Iyer',
    recipientEmail: 'ananya.iyer@vertexhealth.com',
    subject: 'Draft: HIPAA-Compliant AI Diagnostics Pipeline Scope & Security SLA',
    body: `Dear Ananya,

Our technical research group has completed the feasibility review for the AI image classification model integration.

Draft Notes:
- Model deployment on private VPC with strict encryption at rest and in transit.
- Integration with your existing DICOM medical imaging repository.
- Guaranteed 99.95% API uptime SLA with failover cluster.

(Draft saved - pending review with technical team lead prior to dispatch).

Regards,
Ankush Pandit
Senior Account Executive | TechnoKraft Services LLP`,
    status: 'draft',
    senderName: 'Ankush Pandit',
    senderEmail: 'ankush.pandit@technokraft.com',
    date: 'Yesterday',
    time: '05:20 PM',
    timestamp: '2026-09-06T17:20:00',
    attachments: [],
    tracking: {
      sent: false,
      delivered: false,
      opened: false,
      replied: false,
    },
  },
  {
    id: 'email-5',
    leadId: 'lead-5',
    leadCode: 'LD-2026-00192',
    companyName: 'Pioneer Logistics',
    recipientName: 'Manish Gupta',
    recipientEmail: 'm.gupta@pioneerlogistics-test.in',
    subject: 'Fleet Telematics & Mobile App Modernization Inquiry',
    body: `Dear Manish,

We attempted to dispatch the technical specification outline for your mobile driver application and GPS tracking system.

However, the recipient mail exchange server returned a 550 Mailbox Unreachable error. Please verify the contact email address with the account representative.

Regards,
Automated Delivery Daemon / TechnoKraft CRM`,
    status: 'failed',
    senderName: 'Kunal Patil',
    senderEmail: 'kunal.patil@technokraft.com',
    date: '05 Sep 2026',
    time: '02:15 PM',
    timestamp: '2026-09-05T14:15:00',
    errorMessage: '550 5.1.1 User unknown / Mailbox disabled by host',
    attachments: [],
    tracking: {
      sent: true,
      delivered: false,
      opened: false,
      replied: false,
    },
  },
  {
    id: 'email-6',
    leadId: 'lead-1',
    leadCode: 'LD-2026-00125',
    companyName: 'ABC Technologies Pvt Ltd',
    recipientName: 'Nikita Patil',
    recipientEmail: 'nikita.patil@abctechnologies.in',
    subject: 'TechnoKraft Services LLP — Introduction & Custom Software Capabilities',
    body: `Dear Nikita,

Thank you for connecting with TechnoKraft Services LLP. We are an enterprise software engineering and cloud consulting firm specializing in Custom Software Development for forward-thinking organizations.

Based on our preliminary review of ABC Technologies Pvt Ltd, we believe our engineering team can help streamline your digital infrastructure and accelerate delivery.

Would you be open for a brief 15-minute introductory call this week to discuss your current challenges and potential synergies?

Regards,
Kunal Patil
TechnoKraft Services LLP`,
    status: 'delivered',
    senderName: 'Kunal Patil',
    senderEmail: 'kunal.patil@technokraft.com',
    date: '02 Sep 2026',
    time: '09:30 AM',
    timestamp: '2026-09-02T09:30:00',
    attachments: [],
    tracking: {
      sent: true,
      delivered: true,
      opened: true,
      replied: true,
      openedAt: '02 Sep 2026, 09:45 AM',
      repliedAt: '02 Sep 2026, 11:20 AM',
    },
  },
];

export const MOCK_WHATSAPP_CONVERSATIONS: WhatsAppConversation[] = [
  {
    id: 'wa-conv-1',
    leadId: 'lead-1',
    leadCode: 'LD-2026-00125',
    contactName: 'Nikita Patil',
    contactPhone: '+91 98230 45612',
    contactDesignation: 'Chief Technology Officer (CTO)',
    companyName: 'ABC Technologies Pvt Ltd',
    companyWebsite: 'abctechnologies.in',
    service: 'Custom Software Development',
    leadStatus: 'INTERESTED',
    leadScore: 82,
    assignedEmployee: 'Kunal Patil',
    nextFollowUp: 'Today, 04:00 PM',
    unreadCount: 2,
    lastMessage: 'Yes, please send the proposal and cloud cost estimates.',
    lastActivityTime: '10:42 AM',
    messages: [
      {
        id: 'msg-1',
        sender: 'contact',
        senderName: 'Nikita Patil',
        text: 'Hello Kunal, we are interested in developing a custom ERP and billing orchestration system.',
        timestamp: '2026-09-07T10:32:00',
        time: '10:32 AM',
        status: 'read',
        type: 'text',
      },
      {
        id: 'msg-2',
        sender: 'employee',
        senderName: 'Kunal Patil',
        text: 'Thank you Nikita. TechnoKraft specializes in multi-tenant cloud portals. Could you please share your timeline constraints and current database stack?',
        timestamp: '2026-09-07T10:35:00',
        time: '10:35 AM',
        status: 'read',
        type: 'text',
      },
      {
        id: 'msg-3',
        sender: 'contact',
        senderName: 'Nikita Patil',
        text: 'We are on AWS and PostgreSQL right now. Need delivery in 3-4 months before our Q4 audit.',
        timestamp: '2026-09-07T10:38:00',
        time: '10:38 AM',
        status: 'read',
        type: 'text',
      },
      {
        id: 'msg-4',
        sender: 'employee',
        senderName: 'Kunal Patil',
        text: 'Understood. We have built similar architectures handling 100K+ monthly invoices. I am preparing the formal proposal and can dispatch it via email within an hour.',
        timestamp: '2026-09-07T10:40:00',
        time: '10:40 AM',
        status: 'read',
        type: 'text',
      },
      {
        id: 'msg-5',
        sender: 'contact',
        senderName: 'Nikita Patil',
        text: 'Yes, please send the proposal and cloud cost estimates.',
        timestamp: '2026-09-07T10:42:00',
        time: '10:42 AM',
        status: 'read',
        type: 'text',
      },
    ],
  },
  {
    id: 'wa-conv-2',
    leadId: 'lead-2',
    leadCode: 'LD-2026-00148',
    contactName: 'Shruti Raundal',
    contactPhone: '+91 97654 32189',
    contactDesignation: 'VP of Engineering',
    companyName: 'Global IT Solutions',
    companyWebsite: 'globalitsolutions.com',
    service: 'Cloud / DevOps',
    leadStatus: 'QUALIFIED',
    leadScore: 78,
    assignedEmployee: 'Ankush Pandit',
    nextFollowUp: 'Tomorrow, 11:30 AM',
    unreadCount: 0,
    lastMessage: "Let's schedule a Zoom meeting for tomorrow at 11:30 AM.",
    lastActivityTime: 'Yesterday',
    messages: [
      {
        id: 'msg-21',
        sender: 'employee',
        senderName: 'Ankush Pandit',
        text: 'Hi Shruti, Ankush from TechnoKraft Services here. Following up on your cloud DevOps audit request.',
        timestamp: '2026-09-06T14:10:00',
        time: '02:10 PM',
        status: 'read',
        type: 'text',
      },
      {
        id: 'msg-22',
        sender: 'contact',
        senderName: 'Shruti Raundal',
        text: 'Hi Ankush! Yes, our infrastructure team reviewed your credentials. We want to do an automated security scan first.',
        timestamp: '2026-09-06T14:25:00',
        time: '02:25 PM',
        status: 'read',
        type: 'text',
      },
      {
        id: 'msg-23',
        sender: 'contact',
        senderName: 'Shruti Raundal',
        text: "Let's schedule a Zoom meeting for tomorrow at 11:30 AM.",
        timestamp: '2026-09-06T14:30:00',
        time: '02:30 PM',
        status: 'read',
        type: 'text',
      },
      {
        id: 'msg-24',
        sender: 'employee',
        senderName: 'Ankush Pandit',
        text: 'Confirmed Priya! Calendar invitation sent to priya.shah@globalitsol.com with the agenda attached.',
        timestamp: '2026-09-06T14:35:00',
        time: '02:35 PM',
        status: 'read',
        type: 'text',
      },
    ],
  },
  {
    id: 'wa-conv-3',
    leadId: 'lead-3',
    leadCode: 'LD-2026-00098',
    contactName: 'Vikram Deshmukh',
    contactPhone: '+91 94220 11234',
    contactDesignation: 'Director of Operations',
    companyName: 'NextGen Manufacturing',
    companyWebsite: 'nextgenmfg.co.in',
    service: 'Web Development',
    leadStatus: 'PROPOSAL SENT',
    leadScore: 91,
    assignedEmployee: 'Kunal Patil',
    nextFollowUp: '09 Sep 2026, 03:00 PM',
    unreadCount: 0,
    lastMessage: 'Received the portal demo link. Reviewing with our warehouse head.',
    lastActivityTime: '05 Sep',
    messages: [
      {
        id: 'msg-31',
        sender: 'employee',
        senderName: 'Kunal Patil',
        text: 'Hello Vikram sir, here is the preview link for the distributor portal prototype we discussed.',
        timestamp: '2026-09-05T11:00:00',
        time: '11:00 AM',
        status: 'read',
        type: 'text',
      },
      {
        id: 'msg-32',
        sender: 'contact',
        senderName: 'Vikram Deshmukh',
        text: 'Received the portal demo link. Reviewing with our warehouse head.',
        timestamp: '2026-09-05T11:45:00',
        time: '11:45 AM',
        status: 'read',
        type: 'text',
      },
    ],
  },
  {
    id: 'wa-conv-4',
    leadId: 'lead-4',
    leadCode: 'LD-2026-00177',
    contactName: 'Ananya Iyer',
    contactPhone: '+91 98450 78901',
    contactDesignation: 'Head of Digital Transformation',
    companyName: 'Vertex Healthcare Systems',
    companyWebsite: 'vertexhealth.com',
    service: 'AI / ML',
    leadStatus: 'NEGOTIATION',
    leadScore: 74,
    assignedEmployee: 'Ankush Pandit',
    nextFollowUp: '10 Sep 2026, 02:00 PM',
    unreadCount: 1,
    lastMessage: 'Can you include HIPAA compliance audit certification in the contract?',
    lastActivityTime: '04 Sep',
    messages: [
      {
        id: 'msg-41',
        sender: 'contact',
        senderName: 'Ananya Iyer',
        text: 'Can you include HIPAA compliance audit certification in the contract?',
        timestamp: '2026-09-04T16:05:00',
        time: '04:05 PM',
        status: 'delivered',
        type: 'text',
      },
    ],
  },
];

export const MOCK_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'wa-tpl-1',
    name: 'Initial Introduction',
    category: 'Outreach',
    text: `Hello {{contact_name}}, this is {{employee_name}} from TechnoKraft Services LLP. We provide specialized {{service}} for growing enterprises like {{company_name}}. Would you be available for a brief discussion this week?`,
    variables: ['contact_name', 'employee_name', 'service', 'company_name'],
  },
  {
    id: 'wa-tpl-2',
    name: 'Requirement Follow-up',
    category: 'Follow-up',
    text: `Hi {{contact_name}}, following up on our discussion regarding {{service}} for {{company_name}} (Ref: {{lead_id}}). Did you get a chance to review the scope outline? Let us know if you need any adjustments.`,
    variables: ['contact_name', 'service', 'company_name', 'lead_id'],
  },
  {
    id: 'wa-tpl-3',
    name: 'Meeting Confirmation',
    category: 'Scheduling',
    text: `Hi {{contact_name}}, confirming our upcoming discovery call for {{company_name}} today. We will walk through the {{service}} roadmap. Meeting link has been dispatched to your email.`,
    variables: ['contact_name', 'company_name', 'service'],
  },
  {
    id: 'wa-tpl-4',
    name: 'Proposal Follow-up',
    category: 'Proposal',
    text: `Dear {{contact_name}}, we have dispatched the formal {{service}} commercial proposal to your email (Ref: {{lead_id}}). Please let us know when we can address any questions for {{company_name}}.`,
    variables: ['contact_name', 'service', 'lead_id', 'company_name'],
  },
  {
    id: 'wa-tpl-5',
    name: 'Thank You',
    category: 'General',
    text: `Thank you {{contact_name}} and the {{company_name}} team for your time today. We are looking forward to collaborating with you on {{service}}!`,
    variables: ['contact_name', 'company_name', 'service'],
  },
];

export function resolveTemplateText(
  text: string,
  lead?: Lead | null,
  employeeName: string = 'Kunal Patil'
): string {
  if (!lead) {
    return text
      .replace(/{{employee_name}}/g, employeeName)
      .replace(/{{assigned_employee}}/g, employeeName);
  }

  return text
    .replace(/{{contact_name}}/g, lead.contact?.name || 'Valued Client')
    .replace(/{{company_name}}/g, lead.company?.name || 'Company')
    .replace(/{{company_website}}/g, lead.company?.website || 'company.com')
    .replace(/{{designation}}/g, lead.contact?.designation || 'Lead')
    .replace(/{{service}}/g, lead.service || 'IT Services')
    .replace(/{{lead_id}}/g, lead.leadCode || 'LD-XXXX')
    .replace(/{{recipient_email}}/g, lead.contact?.email || 'contact@example.com')
    .replace(/{{requirement}}/g, lead.requirement?.summary || 'Custom software development & cloud architecture')
    .replace(/{{employee_name}}/g, lead.assignedEmployee?.name || employeeName)
    .replace(/{{assigned_employee}}/g, lead.assignedEmployee?.name || employeeName);
}
