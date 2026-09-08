import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Phone,
  Layers,
  FileText,
  UserCheck,
  Paperclip,
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  File,
  X,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DuplicateLeadAlert } from '../../components/leads/DuplicateLeadAlert';
import { TechnoKraftService, LeadSource, LeadStatus, LeadPriority } from '../../types/leads';

export const AddLeadPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('');
  const [companyLinkedIn, setCompanyLinkedIn] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // Contact
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [contactLinkedIn, setContactLinkedIn] = useState('');

  // Lead Info
  const [leadSource, setLeadSource] = useState<LeadSource>('LinkedIn');
  const [service, setService] = useState<TechnoKraftService>('Custom Software Development');
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [priority, setPriority] = useState<LeadPriority>('HIGH');
  const [assignedEmployee, setAssignedEmployee] = useState('Kunal Patil');
  const [leadScore, setLeadScore] = useState(75);

  // Business Requirement
  const [requirementSummary, setRequirementSummary] = useState('');
  const [businessProblem, setBusinessProblem] = useState('');
  const [expectedTimeline, setExpectedTimeline] = useState('3 to 4 months');
  const [budgetRange, setBudgetRange] = useState('₹25L - ₹40L');
  const [currentTech, setCurrentTech] = useState('');
  const [numberOfUsers, setNumberOfUsers] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Assignment
  const [assignedBA, setAssignedBA] = useState('Pranav Jejurkar');
  const [followUpDate, setFollowUpDate] = useState('2026-09-08');
  const [followUpTime, setFollowUpTime] = useState('11:00');

  // Attachments
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Duplicate warning detection
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const checkDuplicate = (comp: string, mail: string) => {
    if (
      comp.toLowerCase().includes('abc tech') ||
      comp.toLowerCase().includes('abctechnologies') ||
      mail.toLowerCase().includes('nikita.patil@abctechnologies')
    ) {
      setShowDuplicateWarning(true);
    }
  };

  const handleCompanyNameChange = (val: string) => {
    setCompanyName(val);
    if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: '' }));
    checkDuplicate(val, email);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
    checkDuplicate(companyName, val);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!companyName.trim()) {
      errs.companyName = 'Company name is required.';
    }
    if (!contactPerson.trim()) {
      errs.contactPerson = 'Contact person name is required.';
    }
    if (!email.trim() && !phone.trim()) {
      errs.email = 'Either email or phone is required.';
      errs.phone = 'Either phone or email is required.';
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!leadSource) {
      errs.leadSource = 'Lead source is required.';
    }
    if (!service) {
      errs.service = 'Interested service is required.';
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // scroll to first error
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setSuccessMessage('Lead created successfully! Redirecting to Leads List...');
    setTimeout(() => {
      navigate('/leads');
    }, 1800);
  };

  const handleSaveDraft = () => {
    setSuccessMessage('Draft saved locally. You can resume editing anytime.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((f: globalThis.File) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Add New Lead"
        description="Create and assign a new B2B sales lead for TechnoKraft Services."
        actions={
          <Link
            to="/leads"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Return</span>
          </Link>
        }
      />

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Duplicate Lead Detection Alert Banner */}
      {showDuplicateWarning && (
        <DuplicateLeadAlert
          existingLeadCode="LD-2026-00125"
          existingCompanyName="ABC Technologies Pvt Ltd"
          existingEmail="nikita.patil@abctechnologies.in"
          onDismiss={() => setShowDuplicateWarning(false)}
          onMergeLater={() => {
            setShowDuplicateWarning(false);
            setSuccessMessage('Marked for review & merge with LD-2026-00125');
          }}
        />
      )}

      {/* Main Multi-Section Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: COMPANY INFORMATION */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">1. Company Information</h2>
              <p className="text-xs text-slate-500">Corporate client profile and location details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Company Name (Required) */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                placeholder="e.g. Apex Enterprise Solutions Pvt Ltd"
                className={`w-full px-3 py-2.5 bg-slate-50 focus:bg-white border rounded-lg text-xs text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                  errors.companyName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.companyName && (
                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.companyName}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. apexsolutions.com"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="">Select Industry</option>
                <option value="IT & Software">IT & Software</option>
                <option value="FinTech & Banking">FinTech & Banking</option>
                <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                <option value="Manufacturing & Auto">Manufacturing & Auto</option>
                <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                <option value="Retail & E-commerce">Retail & E-commerce</option>
                <option value="Education / EdTech">Education / EdTech</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="">Select Employee Count</option>
                <option value="1-50 employees">1-50 employees (Startup)</option>
                <option value="50-250 employees">50-250 employees (Mid-market)</option>
                <option value="250-1000 employees">250-1,000 employees (Enterprise)</option>
                <option value="1000+ employees">1,000+ employees (Large Enterprise)</option>
              </select>
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune"
                  className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
            </div>

            {/* Company LinkedIn */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Company LinkedIn Profile</label>
              <input
                type="text"
                value={companyLinkedIn}
                onChange={(e) => setCompanyLinkedIn(e.target.value)}
                placeholder="e.g. linkedin.com/company/apex-solutions"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            {/* Company Description */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Company Background</label>
              <textarea
                rows={2}
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                placeholder="Brief business summary or market positioning..."
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT PERSON INFORMATION */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">2. Primary Contact Person</h2>
              <p className="text-xs text-slate-500">Key stakeholder or decision maker details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Contact Name (Required) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Person Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => {
                  setContactPerson(e.target.value);
                  if (errors.contactPerson) setErrors((prev) => ({ ...prev, contactPerson: '' }));
                }}
                placeholder="e.g. Kunal Patil"
                className={`w-full px-3 py-2.5 bg-slate-50 focus:bg-white border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                  errors.contactPerson ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.contactPerson && (
                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.contactPerson}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation / Role</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Chief Technology Officer / IT Director"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            {/* Email (Required) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Corporate Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="e.g. kunal.patil@apexsolutions.com"
                className={`w-full px-3 py-2.5 bg-slate-50 focus:bg-white border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                  errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.email && (
                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Phone (Required) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone / Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="e.g. +91 98230 11223"
                className={`w-full px-3 py-2.5 bg-slate-50 focus:bg-white border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                  errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.phone && (
                <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Alternate Phone */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alternate Phone / Direct Desk</label>
              <input
                type="tel"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                placeholder="e.g. +91 20 6712 3456"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            {/* Contact LinkedIn */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={contactLinkedIn}
                onChange={(e) => setContactLinkedIn(e.target.value)}
                placeholder="e.g. linkedin.com/in/kunal-patil-cto"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: LEAD INFORMATION & SERVICE */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">3. Lead Classification & Service</h2>
              <p className="text-xs text-slate-500">TechnoKraft offering, source channel, and qualification parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Lead Source */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lead Source <span className="text-rose-500">*</span>
              </label>
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="LinkedIn">LinkedIn Outreach</option>
                <option value="Cold Calling">Cold Calling</option>
                <option value="Website">TechnoKraft Website Inbound</option>
                <option value="Referral">Client / Partner Referral</option>
                <option value="IndiaMART">IndiaMART B2B</option>
                <option value="Google Search">Google Search (Inbound)</option>
                <option value="Email Campaign">Email Marketing Campaign</option>
                <option value="Existing Customer">Existing Customer (Upsell)</option>
                <option value="Event">Conference / Industry Event</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Interested Service */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Interested Service <span className="text-rose-500">*</span>
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as TechnoKraftService)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="Custom Software Development">Custom Software Development</option>
                <option value="Web Development">Web Application Development</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Cloud / DevOps">Cloud Architecture & DevOps</option>
                <option value="AI / ML Solutions">AI / ML & Intelligent Systems</option>
                <option value="Cybersecurity">Cybersecurity & VAPT Audits</option>
                <option value="UI/UX Design">UI/UX & Product Design</option>
                <option value="IT Consulting">Strategic IT Consulting</option>
                <option value="Enterprise ERP / CRM">Enterprise ERP / CRM Implementation</option>
                <option value="Other">Other IT Services</option>
              </select>
            </div>

            {/* Initial Status */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CALLBACK">Callback Scheduled</option>
                <option value="INTERESTED">Interested</option>
                <option value="QUALIFIED">Qualified</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="URGENT">Urgent (Immediate follow-up)</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            {/* Lead Score Slider */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Initial Lead Score: <strong className="text-[#5B4DB7]">{leadScore} / 100</strong>
                </label>
                <span className="text-[11px] text-slate-500">
                  {leadScore >= 81 ? '🔥 Very Hot' : leadScore >= 61 ? '⚡ Hot' : 'Warm'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={leadScore}
                onChange={(e) => setLeadScore(Number(e.target.value))}
                className="w-full accent-[#5B4DB7] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: BUSINESS REQUIREMENT */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">4. Business Requirements & Scope</h2>
              <p className="text-xs text-slate-500">Project requirements, budget expectations, and target timeline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Requirement Summary</label>
              <textarea
                rows={3}
                value={requirementSummary}
                onChange={(e) => setRequirementSummary(e.target.value)}
                placeholder="Summarize the core technical deliverable or business software needed..."
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Budget Range (INR)</label>
              <input
                type="text"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                placeholder="e.g. ₹20L - ₹35L"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Delivery Timeline</label>
              <input
                type="text"
                value={expectedTimeline}
                onChange={(e) => setExpectedTimeline(e.target.value)}
                placeholder="e.g. 3 to 4 months"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Tech Stack (If Any)</label>
              <input
                type="text"
                value={currentTech}
                onChange={(e) => setCurrentTech(e.target.value)}
                placeholder="e.g. Java Spring, MySQL, React"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Users / Scale</label>
              <input
                type="text"
                value={numberOfUsers}
                onChange={(e) => setNumberOfUsers(e.target.value)}
                placeholder="e.g. 500 internal agents or 50,000 public users"
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: ASSIGNMENT & NEXT FOLLOW-UP */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">5. Internal Team Assignment</h2>
              <p className="text-xs text-slate-500">Allocate lead ownership and schedule the immediate follow-up task</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Sales Executive</label>
              <select
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="Kunal Patil">Kunal Patil (Sales Manager)</option>
                <option value="Shruti Raundal">Shruti Raundal (Sales Executive)</option>
                <option value="Ankush Pandit">Ankush Pandit (Sales Executive)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Business Analyst (BA)</label>
              <select
                value={assignedBA}
                onChange={(e) => setAssignedBA(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="Pranav Jejurkar">Pranav Jejurkar (Senior BA)</option>
                <option value="Rohan Joshi">Rohan Joshi (BA - Cloud/Tech)</option>
                <option value="Unassigned">Assign Later</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Time</label>
              <input
                type="time"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: ATTACHMENTS */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">6. RFP & Scope Attachments</h2>
              <p className="text-xs text-slate-500">Attach client briefs, NDA, technical diagrams, or RFP documents</p>
            </div>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-300 hover:border-[#5B4DB7] rounded-xl p-6 text-center bg-slate-50/70 transition-colors cursor-pointer"
          >
            <div className="max-w-xs mx-auto space-y-2">
              <UploadCloud className="w-8 h-8 text-[#5B4DB7] mx-auto" />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supported formats: PDF, DOCX, XLSX, PNG, JPG (up to 25 MB)
                </p>
              </div>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2 pt-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-[#5B4DB7]" />
                    <span className="font-medium text-slate-800">{file.name}</span>
                    <span className="text-slate-400">({file.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM FORM ACTIONS */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <Link
            to="/leads"
            className="w-full sm:w-auto px-4 py-2.5 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg transition-colors shadow-xs"
            >
              Create Lead
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
