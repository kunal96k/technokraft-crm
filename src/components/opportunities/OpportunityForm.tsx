import React, { useState, useEffect } from 'react';
import { X, Building2, Briefcase, FileText, UserCheck, Check, Sparkles } from 'lucide-react';
import {
  OpportunityRecord,
  OpportunityService,
  OpportunityStage,
  OpportunityPriority,
} from '../../types/opportunities';
import { MOCK_LEADS } from '../../data/mockLeads';

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
  if (!isOpen) return null;

  // SECTION 1: Lead / Company
  const [selectedLeadId, setSelectedLeadId] = useState(
    initialOpportunity?.leadId || initialOpportunity?.leadCode || ''
  );
  const [companyName, setCompanyName] = useState(initialOpportunity?.companyName || '');
  const [contactName, setContactName] = useState(initialOpportunity?.contactName || '');
  const [contactDesignation, setContactDesignation] = useState(
    initialOpportunity?.contactDesignation || ''
  );
  const [contactEmail, setContactEmail] = useState(initialOpportunity?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(initialOpportunity?.contactPhone || '');
  const [industry, setIndustry] = useState(initialOpportunity?.industry || 'IT & Software');

  // SECTION 2: Opportunity Info
  const [name, setName] = useState(initialOpportunity?.name || '');
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
    initialOpportunity?.probability !== undefined ? initialOpportunity.probability : 70
  );
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    initialOpportunity?.expectedCloseDate || '2026-09-30'
  );
  const [priority, setPriority] = useState<OpportunityPriority>(
    initialOpportunity?.priority || 'High'
  );

  // SECTION 3: Requirement
  const [requirementSummary, setRequirementSummary] = useState(
    initialOpportunity?.requirement.summary || ''
  );
  const [businessProblem, setBusinessProblem] = useState(
    initialOpportunity?.requirement.problemStatement || ''
  );
  const [expectedUsers, setExpectedUsers] = useState(
    initialOpportunity?.requirement.expectedUsers || ''
  );
  const [timeline, setTimeline] = useState(initialOpportunity?.requirement.timeline || '3 months');
  const [budget, setBudget] = useState(
    initialOpportunity?.requirement.budget || '₹8,00,000 - ₹10,00,000'
  );
  const [technicalRequirements, setTechnicalRequirements] = useState(
    initialOpportunity?.requirement.technicalRequirements || ''
  );
  const [requirementNotes, setRequirementNotes] = useState(
    initialOpportunity?.requirement.notes || ''
  );

  // SECTION 4: Assignment
  const [ownerName, setOwnerName] = useState(
    initialOpportunity?.owner.name || 'Kunal Patil'
  );
  const [businessAnalystName, setBusinessAnalystName] = useState(
    initialOpportunity?.businessAnalyst?.name || 'Amit Shah'
  );
  const [technicalReviewerName, setTechnicalReviewerName] = useState(
    initialOpportunity?.technicalReviewer?.name || 'Vikram Malhotra'
  );

  // Auto-populate when Lead is picked
  const handleLeadChange = (leadVal: string) => {
    setSelectedLeadId(leadVal);
    const found = MOCK_LEADS.find((l) => l.id === leadVal || l.leadCode === leadVal);
    if (found) {
      setCompanyName(found.company.name);
      setContactName(found.contact.name);
      setContactDesignation(found.contact.designation);
      setContactEmail(found.contact.email);
      setContactPhone(found.contact.phone);
      setIndustry(found.company.industry);
      if (!name) {
        setName(`${found.company.name} - ${found.service}`);
      }
      if (found.service) {
        setService(found.service as OpportunityService);
      }
      if (found.requirement?.summary) {
        setRequirementSummary(found.requirement.summary);
      }
      if (found.requirement?.problemStatement) {
        setBusinessProblem(found.requirement.problemStatement);
      }
      if (found.requirement?.budgetRange) {
        setBudget(found.requirement.budgetRange);
      }
    }
  };

  const handleSubmit = (isDraft = false) => {
    if (!companyName.trim() || !name.trim() || !contactName.trim()) {
      alert('Please fill out the required fields (Opportunity Name, Company, Contact).');
      return;
    }

    const numericVal = parseInt(estimatedValue.replace(/[^0-9]/g, ''), 10) || 0;

    const newOpp: OpportunityRecord = {
      id: initialOpportunity?.id || `opp-${Date.now()}`,
      opportunityCode:
        initialOpportunity?.opportunityCode ||
        `OPP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      name,
      companyName,
      leadId: selectedLeadId,
      leadCode:
        MOCK_LEADS.find((l) => l.id === selectedLeadId || l.leadCode === selectedLeadId)
          ?.leadCode || (selectedLeadId ? selectedLeadId : undefined),
      contactName,
      contactDesignation,
      contactEmail,
      contactPhone,
      service,
      stage: isDraft ? 'Qualified' : stage,
      estimatedValue: numericVal,
      probability,
      expectedCloseDate,
      priority,
      industry,
      requirement: {
        summary: requirementSummary,
        problemStatement: businessProblem,
        expectedUsers,
        timeline,
        budget,
        technicalRequirements,
        notes: requirementNotes,
      },
      owner: {
        name: ownerName,
        avatar: ownerName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
        role: 'Sales Manager',
        email: `${ownerName.toLowerCase().replace(' ', '.')}@technokraft.com`,
      },
      businessAnalyst: businessAnalystName
        ? {
            name: businessAnalystName,
            role: 'Senior Business Analyst',
          }
        : undefined,
      technicalReviewer: technicalReviewerName
        ? {
            name: technicalReviewerName,
            role: 'Solutions Architect',
          }
        : undefined,
      createdBy: initialOpportunity?.createdBy || {
        name: 'Kunal Patil',
        date: '07 Sep 2026',
      },
      activities: initialOpportunity?.activities || [
        {
          id: `act-${Date.now()}`,
          date: '07 Sep 2026',
          time: '12:00 PM',
          employeeName: ownerName,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5B4DB7]">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialOpportunity ? 'Edit Opportunity' : 'New Sales Opportunity'}
              </h2>
              <p className="text-xs text-slate-500">
                TechnoKraft Services B2B Pipeline Qualification & Deal Scoping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* SECTION 1: LEAD & COMPANY */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#5B4DB7]" />
                <span>Section 1: Lead & Company Information</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">* Required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Related Lead Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Related Lead <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => handleLeadChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose Existing Qualified Lead --</option>
                  {MOCK_LEADS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.leadCode} — {l.company.name} ({l.service})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Selecting a lead automatically populates company, contact, and requirement data.
                </p>
              </div>

              {/* Company Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Technologies Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>

              {/* Contact Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Contact Person <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nikita Patil"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Chief Technology Officer (CTO)"
                  value={contactDesignation}
                  onChange={(e) => setContactDesignation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. nikita.patil@abctechnologies.in"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98230 45612"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: OPPORTUNITY INFORMATION */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#5B4DB7]" />
                <span>Section 2: Opportunity & Deal Information</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opportunity Name */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Opportunity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom ERP Development"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>

              {/* Service */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Service <span className="text-rose-500">*</span>
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as OpportunityService)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                >
                  {services.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sales Stage */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sales Stage <span className="text-rose-500">*</span>
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as OpportunityStage)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                >
                  {stages.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Value (INR) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimated Value (₹ INR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 800000"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  e.g. 800000 = ₹8,00,000 (8 Lakhs)
                </p>
              </div>

              {/* Probability */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Probability %</label>
                  <span className="font-mono font-bold text-[#5B4DB7]">{probability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={probability}
                  onChange={(e) => setProbability(Number(e.target.value))}
                  className="w-full accent-[#5B4DB7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Expected Close Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expected Close Date</label>
                <input
                  type="date"
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as OpportunityPriority)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: REQUIREMENT */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#5B4DB7]" />
                <span>Section 3: Customer Requirements & Scope</span>
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Requirement Summary</label>
                <textarea
                  rows={2}
                  placeholder="Summary of the customer's project scope and business objectives..."
                  value={requirementSummary}
                  onChange={(e) => setRequirementSummary(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Problem</label>
                  <input
                    type="text"
                    placeholder="Pain points or operational bottlenecks..."
                    value={businessProblem}
                    onChange={(e) => setBusinessProblem(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Users</label>
                  <input
                    type="text"
                    placeholder="e.g. 500 internal employees + 10,000 customers"
                    value={expectedUsers}
                    onChange={(e) => setExpectedUsers(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Timeline</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 to 4 months"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹8,00,000 - ₹10,00,000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technical Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Tech stack preferences, third-party integrations, compliance (e.g. Node, React, AWS, HIPAA, ABDM)..."
                  value={technicalRequirements}
                  onChange={(e) => setTechnicalRequirements(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes</label>
                <input
                  type="text"
                  placeholder="Additional context from sales/technical discovery..."
                  value={requirementNotes}
                  onChange={(e) => setRequirementNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: ASSIGNMENT */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#5B4DB7]" />
                <span>Section 4: Team Assignment</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Sales Owner * */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sales Owner <span className="text-rose-500">*</span>
                </label>
                <select
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none cursor-pointer"
                >
                  <option value="Kunal Patil">Kunal Patil (Sales Manager)</option>
                  <option value="Priya Sharma">Priya Sharma (Account Exec)</option>
                  <option value="Sneha Kulkarni">Sneha Kulkarni (Inside Sales)</option>
                  <option value="Rohan Deshmukh">Rohan Deshmukh (Sales Director)</option>
                </select>
              </div>

              {/* Business Analyst */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Analyst</label>
                <select
                  value={businessAnalystName}
                  onChange={(e) => setBusinessAnalystName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none cursor-pointer"
                >
                  <option value="">None</option>
                  <option value="Amit Shah">Amit Shah (Sr BA)</option>
                  <option value="Ananya Roy">Ananya Roy (Technical BA)</option>
                </select>
              </div>

              {/* Technical Reviewer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Technical Reviewer</label>
                <select
                  value={technicalReviewerName}
                  onChange={(e) => setTechnicalReviewerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none cursor-pointer"
                >
                  <option value="">None</option>
                  <option value="Vikram Malhotra">Vikram Malhotra (Solutions Architect)</option>
                  <option value="Sameer Joshi">Sameer Joshi (Principal Cloud Engineer)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Form Buttons */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between sm:rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {initialOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
