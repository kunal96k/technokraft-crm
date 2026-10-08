import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Phone,
  Briefcase,
  FileText,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Save,
} from 'lucide-react';
import {
  OpportunityRecord,
  OpportunityService,
  OpportunityStage,
  OpportunityPriority,
} from '../../types/opportunities';
import { Lead } from '../../types/leads';
import { EmployeeSelect } from '../common/EmployeeSelect';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { LeadSearchSelect } from '../common/LeadSearchSelect';
import { useAuth } from '../../context/AuthContext';

type TabKey = 'company' | 'contact' | 'commercials' | 'requirements' | 'assignment';

interface TabConfig {
  key: TabKey;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: TabConfig[] = [
  {
    key: 'company',
    label: '1. Deal & Company',
    shortLabel: 'Company',
    icon: Building2,
    description: 'Opportunity name, client company profile & lead linkage',
  },
  {
    key: 'contact',
    label: '2. Primary Contact',
    shortLabel: 'Contact',
    icon: Phone,
    description: 'Primary customer decision-maker and communication details',
  },
  {
    key: 'commercials',
    label: '3. Pipeline & Commercials',
    shortLabel: 'Commercials',
    icon: Briefcase,
    description: 'Deal stage, estimated contract value, probability & closing target',
  },
  {
    key: 'requirements',
    label: '4. Scope & Requirements',
    shortLabel: 'Scope',
    icon: FileText,
    description: 'Customer project requirements, scope, timeline and target budget',
  },
  {
    key: 'assignment',
    label: '5. Team Assignment',
    shortLabel: 'Team',
    icon: UserCheck,
    description: 'Sales owner, business analyst, and technical reviewer assignments',
  },
];

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: OpportunityRecord) => void;
  initialOpportunity?: OpportunityRecord | null;
  defaultStage?: OpportunityStage;
}

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOpportunity,
  defaultStage = 'Qualified',
}) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('company');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDraftMode, setPendingDraftMode] = useState(false);

  // TAB 1: Company & Deal Name
  const [name, setName] = useState(initialOpportunity?.name || '');
  const [selectedLeadId, setSelectedLeadId] = useState(
    initialOpportunity?.leadId || initialOpportunity?.leadCode || ''
  );
  const [selectedLeadObj, setSelectedLeadObj] = useState<Lead | null>(null);
  const [companyName, setCompanyName] = useState(initialOpportunity?.companyName || '');
  const [industry, setIndustry] = useState(initialOpportunity?.industry || 'IT & Software');

  // TAB 2: Primary Contact
  const [contactName, setContactName] = useState(initialOpportunity?.contactName || '');
  const [contactDesignation, setContactDesignation] = useState(
    initialOpportunity?.contactDesignation || ''
  );
  const [contactEmail, setContactEmail] = useState(initialOpportunity?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(initialOpportunity?.contactPhone || '');

  // TAB 3: Commercials & Pipeline
  const [service, setService] = useState<OpportunityService>(
    initialOpportunity?.service || 'Custom Software Development'
  );
  const [stage, setStage] = useState<OpportunityStage>(
    initialOpportunity?.stage || defaultStage
  );
  const [estimatedValue, setEstimatedValue] = useState<string>(
    initialOpportunity?.estimatedValue ? String(initialOpportunity.estimatedValue) : '800000'
  );
  const [probability, setProbability] = useState<number>(
    initialOpportunity?.probability !== undefined ? initialOpportunity.probability : 50
  );
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    initialOpportunity?.expectedCloseDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<OpportunityPriority>(
    initialOpportunity?.priority || 'High'
  );

  // TAB 4: Requirements & Scope
  const [requirementSummary, setRequirementSummary] = useState(
    initialOpportunity?.requirement?.summary || ''
  );
  const [businessProblem, setBusinessProblem] = useState(
    initialOpportunity?.requirement?.problemStatement || ''
  );
  const [expectedUsers, setExpectedUsers] = useState(
    initialOpportunity?.requirement?.expectedUsers || ''
  );
  const [timeline, setTimeline] = useState(initialOpportunity?.requirement?.timeline || '3 months');
  const [budget, setBudget] = useState(
    initialOpportunity?.requirement?.budget || '₹8,00,000 - ₹12,00,000'
  );
  const [technicalRequirements, setTechnicalRequirements] = useState(
    initialOpportunity?.requirement?.technicalRequirements || ''
  );
  const [requirementNotes, setRequirementNotes] = useState(
    initialOpportunity?.requirement?.notes || ''
  );

  // TAB 5: Team Assignment
  const [ownerName, setOwnerName] = useState(
    initialOpportunity?.owner?.name || authUser?.name || ''
  );
  const [businessAnalystName, setBusinessAnalystName] = useState(
    initialOpportunity?.businessAnalyst?.name || ''
  );
  const [technicalReviewerName, setTechnicalReviewerName] = useState(
    initialOpportunity?.technicalReviewer?.name || ''
  );

  // Form Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab('company');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-populate when Lead is picked
  const handleLeadChange = (leadVal: string, leadObj?: Lead | null) => {
    setSelectedLeadId(leadVal);
    setSelectedLeadObj(leadObj || null);
    if (leadObj) {
      if (leadObj.company?.name) setCompanyName(leadObj.company.name);
      if (leadObj.contact?.name) setContactName(leadObj.contact.name);
      if (leadObj.contact?.designation) setContactDesignation(leadObj.contact.designation);
      if (leadObj.contact?.email) setContactEmail(leadObj.contact.email);
      if (leadObj.contact?.phone) setContactPhone(leadObj.contact.phone);
      if (leadObj.company?.industry) setIndustry(leadObj.company.industry);
      if (!name) {
        setName(`${leadObj.company?.name || 'Client'} - ${leadObj.service || 'Consulting'}`);
      }
      if (leadObj.service) {
        setService(leadObj.service as OpportunityService);
      }
      if (leadObj.requirement?.summary) {
        setRequirementSummary(leadObj.requirement.summary);
      }
      if (leadObj.requirement?.problemStatement) {
        setBusinessProblem(leadObj.requirement.problemStatement);
      }
      if (leadObj.requirement?.budgetRange) {
        setBudget(leadObj.requirement.budgetRange);
      }
    }
  };

  const validateTab = (tab: TabKey): boolean => {
    const errs: Record<string, string> = {};

    if (tab === 'company') {
      if (!name.trim()) errs.name = 'Opportunity name is required';
      if (!companyName.trim()) errs.companyName = 'Company name is required';
    }

    if (tab === 'contact') {
      if (!contactName.trim()) errs.contactName = 'Primary contact name is required';
      if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
        errs.contactEmail = 'Enter a valid email address';
      }
    }

    if (tab === 'commercials') {
      const num = parseInt(estimatedValue.replace(/[^0-9]/g, ''), 10);
      if (isNaN(num) || num < 0) {
        errs.estimatedValue = 'Please enter a valid estimated value';
      }
    }

    if (tab === 'assignment') {
      if (!ownerName.trim()) {
        errs.ownerName = 'Please select or enter the sales owner';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateTab(activeTab)) return;

    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].key);
    }
  };

  const handlePrev = () => {
    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].key);
    }
  };

  const handleTriggerSave = (isDraft = false) => {
    // Validate required overall fields
    const overallErrs: Record<string, string> = {};
    if (!name.trim()) overallErrs.name = 'Opportunity name is required';
    if (!companyName.trim()) overallErrs.companyName = 'Company name is required';
    if (!contactName.trim()) overallErrs.contactName = 'Contact person is required';

    if (Object.keys(overallErrs).length > 0) {
      setErrors(overallErrs);
      if (overallErrs.name || overallErrs.companyName) {
        setActiveTab('company');
      } else if (overallErrs.contactName) {
        setActiveTab('contact');
      }
      return;
    }

    setPendingDraftMode(isDraft);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    setIsConfirmOpen(false);

    const numericVal = parseInt(estimatedValue.replace(/[^0-9]/g, ''), 10) || 0;
    const leadCodeToUse =
      selectedLeadObj?.leadCode ||
      initialOpportunity?.leadCode ||
      (selectedLeadId ? selectedLeadId : undefined);

    const ownerInitials = ownerName
      ? ownerName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'SO';

    const currentFormattedDate = new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

    const newOpp: OpportunityRecord = {
      id: initialOpportunity?.id || `opp-${Date.now()}`,
      opportunityCode:
        initialOpportunity?.opportunityCode ||
        `OPP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      name: name.trim(),
      companyName: companyName.trim(),
      leadId: selectedLeadId || undefined,
      leadCode: leadCodeToUse,
      contactName: contactName.trim(),
      contactDesignation: contactDesignation.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      service,
      stage: pendingDraftMode ? 'Qualified' : stage,
      estimatedValue: numericVal,
      probability,
      expectedCloseDate,
      priority,
      industry,
      requirement: {
        summary: requirementSummary.trim(),
        problemStatement: businessProblem.trim() || undefined,
        expectedUsers: expectedUsers.trim() || undefined,
        timeline: timeline.trim() || undefined,
        budget: budget.trim() || undefined,
        technicalRequirements: technicalRequirements.trim() || undefined,
        notes: requirementNotes.trim() || undefined,
      },
      owner: {
        name: ownerName.trim() || 'Sales Team',
        avatar: ownerInitials,
        role: 'Sales Manager',
        email: `${(ownerName || 'sales').toLowerCase().replace(/\s+/g, '.')}@technokraft.com`,
      },
      businessAnalyst: businessAnalystName
        ? {
            name: businessAnalystName.trim(),
            role: 'Senior Business Analyst',
          }
        : undefined,
      technicalReviewer: technicalReviewerName
        ? {
            name: technicalReviewerName.trim(),
            role: 'Solutions Architect',
          }
        : undefined,
      createdBy: initialOpportunity?.createdBy || {
        name: authUser?.name || 'CRM System',
        date: currentFormattedDate,
      },
      activities: initialOpportunity?.activities || [
        {
          id: `act-${Date.now()}`,
          date: currentFormattedDate,
          time: '12:00 PM',
          employeeName: ownerName || 'Sales Team',
          type: 'CREATED',
          title: 'Opportunity Created in Sales Pipeline',
          notes: `Initial deal value ₹${numericVal.toLocaleString('en-IN')} with ${probability}% win probability.`,
        },
      ],
      followUps: initialOpportunity?.followUps || [],
      proposalsCount: initialOpportunity?.proposalsCount || 0,
      createdAt: initialOpportunity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newOpp);
    onClose();
  };

  const services: OpportunityService[] = [
    'Custom Software Development',
    'Web Development',
    'Mobile App Development',
    'Cloud / DevOps',
    'AI / ML',
    'Cybersecurity',
    'UI/UX',
    'IT Consulting',
    'Other',
  ];

  const stages: OpportunityStage[] = [
    'Qualified',
    'Requirement Received',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost',
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 my-auto">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/70 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-[#5B4DB7] dark:text-purple-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {initialOpportunity ? 'Edit Opportunity' : 'New Sales Opportunity'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill details across tabs to structure deal pipeline & commercial terms
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs Navigation Switch Bar */}
          <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/80 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-thin">
            <nav className="flex space-x-2 min-w-max" aria-label="Tabs">
              {TABS.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      if (validateTab(activeTab)) {
                        setActiveTab(tab.key);
                      }
                    }}
                    className={`flex items-center gap-2 py-2 px-3.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-[#5B4DB7] dark:text-purple-300 shadow-sm border border-slate-200/80 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#5B4DB7] dark:text-purple-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Subtitle Banner */}
          <div className="px-6 py-2 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#5B4DB7] dark:text-purple-300">
              {TABS.find((t) => t.key === activeTab)?.description}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-medium">
              Step {TABS.findIndex((t) => t.key === activeTab) + 1} of {TABS.length}
            </span>
          </div>

          {/* Scrollable Tab Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
            {/* TAB 1: DEAL & COMPANY */}
            {activeTab === 'company' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Opportunity Name */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Opportunity Title / Deal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter opportunity name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      className={`w-full bg-white dark:bg-slate-800 border rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none ${
                        errors.name
                          ? 'border-rose-400 text-rose-900 dark:text-rose-200'
                          : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}
                    />
                    {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* Related Lead Selector */}
                  <div className="sm:col-span-2">
                    <LeadSearchSelect
                      label="Linked Lead Record (Optional)"
                      value={selectedLeadId}
                      initialLeadName={
                        initialOpportunity?.companyName
                          ? `${initialOpportunity.companyName}${
                              initialOpportunity.leadCode ? ` (${initialOpportunity.leadCode})` : ''
                            }`
                          : undefined
                      }
                      onChange={(leadId, leadObj) => handleLeadChange(leadId, leadObj)}
                      placeholder="Type company name, lead code, email to link..."
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Selecting an existing lead automatically populates company, contact, and requirement data.
                    </p>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Client Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: '' }));
                      }}
                      className={`w-full bg-white dark:bg-slate-800 border rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none ${
                        errors.companyName
                          ? 'border-rose-400 text-rose-900 dark:text-rose-200'
                          : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}
                    />
                    {errors.companyName && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.companyName}</p>
                    )}
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Industry Vertical
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none cursor-pointer"
                    >
                      <option value="IT & Software">IT & Software</option>
                      <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Fintech">Fintech</option>
                      <option value="Retail & E-commerce">Retail & E-commerce</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Education">Education</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRIMARY CONTACT */}
            {activeTab === 'contact' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact Name */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Contact Person <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter contact name"
                      value={contactName}
                      onChange={(e) => {
                        setContactName(e.target.value);
                        if (errors.contactName) setErrors((prev) => ({ ...prev, contactName: '' }));
                      }}
                      className={`w-full bg-white dark:bg-slate-800 border rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none ${
                        errors.contactName
                          ? 'border-rose-400 text-rose-900 dark:text-rose-200'
                          : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}
                    />
                    {errors.contactName && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.contactName}</p>
                    )}
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      placeholder="Enter designation"
                      value={contactDesignation}
                      onChange={(e) => setContactDesignation(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={contactEmail}
                      onChange={(e) => {
                        setContactEmail(e.target.value);
                        if (errors.contactEmail) setErrors((prev) => ({ ...prev, contactEmail: '' }));
                      }}
                      className={`w-full bg-white dark:bg-slate-800 border rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none ${
                        errors.contactEmail
                          ? 'border-rose-400 text-rose-900 dark:text-rose-200'
                          : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}
                    />
                    {errors.contactEmail && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.contactEmail}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PIPELINE & COMMERCIALS */}
            {activeTab === 'commercials' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      TechnoKraft Service Line <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value as OpportunityService)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none cursor-pointer"
                    >
                      {services.map((svc) => (
                        <option key={svc} value={svc}>
                          {svc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stage */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sales Pipeline Stage <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => {
                        const newStg = e.target.value as OpportunityStage;
                        setStage(newStg);
                        // Auto-adjust default probability according to stage
                        if (newStg === 'Qualified') setProbability(25);
                        else if (newStg === 'Requirement Received') setProbability(40);
                        else if (newStg === 'Proposal') setProbability(60);
                        else if (newStg === 'Negotiation') setProbability(85);
                        else if (newStg === 'Won') setProbability(100);
                        else if (newStg === 'Lost') setProbability(0);
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none cursor-pointer"
                    >
                      {stages.map((stg) => (
                        <option key={stg} value={stg}>
                          {stg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estimated Value */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Deal Value (₹ INR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Enter estimated value"
                      value={estimatedValue}
                      onChange={(e) => {
                        setEstimatedValue(e.target.value);
                        if (errors.estimatedValue) setErrors((prev) => ({ ...prev, estimatedValue: '' }));
                      }}
                      className={`w-full bg-white dark:bg-slate-800 border rounded-lg p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none ${
                        errors.estimatedValue
                          ? 'border-rose-400 text-rose-900 dark:text-rose-200'
                          : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}
                    />
                    {errors.estimatedValue ? (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.estimatedValue}</p>
                    ) : (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        e.g. 1500000 = ₹15,00,000 (15 Lakhs)
                      </p>
                    )}
                  </div>

                  {/* Win Probability */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Win Probability %
                      </label>
                      <span className="font-mono font-bold text-[#5B4DB7] dark:text-purple-400">
                        {probability}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={probability}
                      onChange={(e) => setProbability(Number(e.target.value))}
                      className="w-full accent-[#5B4DB7] dark:accent-purple-400 cursor-pointer mt-1"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                      <span>0% (Cold)</span>
                      <span>50% (Expected)</span>
                      <span>100% (Closed)</span>
                    </div>
                  </div>

                  {/* Expected Close Date */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Expected Close Date
                    </label>
                    <input
                      type="date"
                      value={expectedCloseDate}
                      onChange={(e) => setExpectedCloseDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as OpportunityPriority)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SCOPE & REQUIREMENTS */}
            {activeTab === 'requirements' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Requirement Summary & Objectives
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter requirement summary..."
                    value={requirementSummary}
                    onChange={(e) => setRequirementSummary(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Business Problem / Pain Points
                    </label>
                    <input
                      type="text"
                      placeholder="Enter business problem or pain points..."
                      value={businessProblem}
                      onChange={(e) => setBusinessProblem(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Expected User Scope
                    </label>
                    <input
                      type="text"
                      placeholder="Enter expected user count or scope..."
                      value={expectedUsers}
                      onChange={(e) => setExpectedUsers(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Project Timeline
                    </label>
                    <input
                      type="text"
                      placeholder="Enter timeline (e.g. 3 months)..."
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Budget Range
                    </label>
                    <input
                      type="text"
                      placeholder="Enter target budget range..."
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Technical Architecture & Integrations
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter technical requirements or architecture specifications..."
                    value={technicalRequirements}
                    onChange={(e) => setTechnicalRequirements(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discovery Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Enter internal notes..."
                    value={requirementNotes}
                    onChange={(e) => setRequirementNotes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: TEAM ASSIGNMENT */}
            {activeTab === 'assignment' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Sales Owner */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lead Sales Owner <span className="text-rose-500">*</span>
                    </label>
                    <EmployeeSelect
                      value={ownerName}
                      onChange={(e) => {
                        setOwnerName(e.target.value);
                        if (errors.ownerName) setErrors((prev) => ({ ...prev, ownerName: '' }));
                      }}
                      placeholder="Select sales owner"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none cursor-pointer"
                    />
                    {errors.ownerName && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.ownerName}</p>
                    )}
                  </div>

                  {/* Business Analyst */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Business Analyst (BA)
                    </label>
                    <EmployeeSelect
                      value={businessAnalystName}
                      onChange={(e) => setBusinessAnalystName(e.target.value)}
                      placeholder="None / Unassigned"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Technical Reviewer */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Solutions Architect / Reviewer
                    </label>
                    <EmployeeSelect
                      value={technicalReviewerName}
                      onChange={(e) => setTechnicalReviewerName(e.target.value)}
                      placeholder="None / Unassigned"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Deal Summary Verification
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    You are configuring <strong>{name || 'Untitled Opportunity'}</strong> for client{' '}
                    <strong>{companyName || 'Not Specified'}</strong> with an estimated pipeline value of{' '}
                    <strong>
                      ₹{parseInt(estimatedValue.replace(/[^0-9]/g, ''), 10).toLocaleString('en-IN') || '0'}
                    </strong>{' '}
                    under <strong>{service}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer with Stepper Controls */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'company' && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              {activeTab !== 'assignment' ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleTriggerSave(true)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerSave(false)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{initialOpportunity ? 'Update Opportunity' : 'Create Opportunity'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Saving */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title={initialOpportunity ? 'Confirm Opportunity Update' : 'Confirm Opportunity Creation'}
        message={`Are you sure you want to ${
          initialOpportunity ? 'update' : 'create'
        } opportunity "${name}" for client "${companyName}" with estimated value ₹${(
          parseInt(estimatedValue.replace(/[^0-9]/g, ''), 10) || 0
        ).toLocaleString('en-IN')}?`}
        confirmLabel={initialOpportunity ? 'Yes, Update Deal' : 'Yes, Create Deal'}
        variant="primary"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};
