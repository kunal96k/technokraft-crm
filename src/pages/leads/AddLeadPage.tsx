import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Phone,
  Layers,
  FileText,
  UserCheck,
  Paperclip,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  UploadCloud,
  File,
  X,
  Check,
  Sparkles,
  Loader2,
  RotateCcw,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DuplicateLeadAlert } from '../../components/leads/DuplicateLeadAlert';
import { createLead, updateLead, fetchLeadById, fetchLeads, uploadAttachment, deleteAttachment } from '../../services/leadService';
import { Lead, LeadSource, TechnoKraftService, LeadStatus, LeadPriority } from '../../types/leads';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { EmployeeSelect } from '../../components/common/EmployeeSelect';

type TabKey = 'company' | 'contact' | 'classification' | 'requirement' | 'assignment';

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
    label: '1. Company Information',
    shortLabel: 'Company',
    icon: Building2,
    description: 'Corporate client profile and location details',
  },
  {
    key: 'contact',
    label: '2. Primary Contact',
    shortLabel: 'Contact',
    icon: Phone,
    description: 'Key stakeholder or decision maker details',
  },
  {
    key: 'classification',
    label: '3. Lead Classification',
    shortLabel: 'Classification',
    icon: Layers,
    description: 'Service, source, pipeline status, and priority',
  },
  {
    key: 'requirement',
    label: '4. Scope & Requirement',
    shortLabel: 'Requirements',
    icon: FileText,
    description: 'Project requirements, budget, and timeline',
  },
  {
    key: 'assignment',
    label: '5. Team & Attachments',
    shortLabel: 'Assignment',
    icon: UserCheck,
    description: 'Ownership, follow-up scheduling, and files',
  },
];

export const AddLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState<boolean>(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<TabKey>('company');
  const [completedTabs, setCompletedTabs] = useState<Record<TabKey, boolean>>({
    company: false,
    contact: false,
    classification: false,
    requirement: false,
    assignment: false,
  });

  // Form State - 1. Company
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('');
  const [companyLinkedIn, setCompanyLinkedIn] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // Form State - 2. Contact
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [contactLinkedIn, setContactLinkedIn] = useState('');

  // Form State - 3. Classification
  const [leadSource, setLeadSource] = useState<LeadSource>('LinkedIn');
  const [service, setService] = useState<TechnoKraftService>('Custom Software Development');
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [priority, setPriority] = useState<LeadPriority>('HIGH');
  const [leadScore, setLeadScore] = useState(75);

  // Form State - 4. Requirement
  const [requirementSummary, setRequirementSummary] = useState('');
  const [businessProblem, setBusinessProblem] = useState('');
  const [expectedTimeline, setExpectedTimeline] = useState('3 to 4 months');
  const [budgetRange, setBudgetRange] = useState('₹25L - ₹40L');
  const [currentTech, setCurrentTech] = useState('');
  const [numberOfUsers, setNumberOfUsers] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Form State - 5. Assignment & Schedule
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [assignedBA, setAssignedBA] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-09-25');
  const [followUpTime, setFollowUpTime] = useState('11:00');

  // Attachments
  const [attachments, setAttachments] = useState<
    { id?: string; name: string; size: string; type: string; url?: string; file?: File }[]
  >([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved draft info from localStorage
  const [savedDraftInfo, setSavedDraftInfo] = useState<{ savedAt: string; companyName?: string } | null>(null);

  // Feedback and UI States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Check for saved local draft on mount
  useEffect(() => {
    if (!editId) {
      try {
        const raw = localStorage.getItem('crm_lead_draft');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.companyName || parsed.contactPerson || parsed.savedAt)) {
            setSavedDraftInfo({
              savedAt: parsed.savedAt || 'earlier session',
              companyName: parsed.companyName || 'Untitled Lead',
            });
          }
        }
      } catch {}
    }
  }, [editId]);

  // Fetch existing lead if in edit mode
  useEffect(() => {
    if (editId) {
      setIsLoadingLead(true);
      fetchLeadById(editId)
        .then((lead) => {
          if (lead) {
            setEditingLead(lead);

            // 1. Company
            setCompanyName(lead.company?.name || '');
            setWebsite(lead.company?.website || '');
            setIndustry(lead.company?.industry || '');
            setCompanySize(lead.company?.companySize || '');
            setCountry(lead.company?.country || 'India');
            setState(lead.company?.state || 'Maharashtra');
            setCity(lead.company?.city || '');
            setCompanyLinkedIn(lead.company?.linkedIn || '');
            setCompanyDescription(lead.company?.description || '');

            // 2. Contact
            setContactPerson(lead.contact?.name || '');
            setDesignation(lead.contact?.designation || '');
            setEmail(lead.contact?.email || '');
            setPhone(lead.contact?.phone || '');
            setAlternatePhone(lead.contact?.alternatePhone || '');
            setContactLinkedIn(lead.contact?.linkedIn || '');

            // 3. Classification
            if (lead.source) setLeadSource(lead.source);
            if (lead.service) setService(lead.service);
            if (lead.status) setStatus(lead.status);
            if (lead.priority) setPriority(lead.priority);
            if (typeof lead.score === 'number') setLeadScore(lead.score);

            // 4. Requirement
            setRequirementSummary(lead.requirement?.summary || '');
            setBusinessProblem(lead.requirement?.problemStatement || '');
            setExpectedTimeline(lead.requirement?.expectedTimeline || '3 to 4 months');
            setBudgetRange(lead.requirement?.budgetRange || '₹25L - ₹40L');
            setCurrentTech(lead.requirement?.currentTech || '');
            setNumberOfUsers(lead.requirement?.numberOfUsers || '');
            setAdditionalNotes(lead.requirement?.additionalNotes || '');

            // 5. Assignment
            if (lead.assignedEmployee?.name) {
              setAssignedEmployee(lead.assignedEmployee.name);
            }
            if (lead.assignedBA?.name) {
              setAssignedBA(lead.assignedBA.name);
            }
            if (lead.nextFollowUp?.date) {
              setFollowUpDate(lead.nextFollowUp.date);
            }
            if (lead.nextFollowUp?.time) {
              setFollowUpTime(lead.nextFollowUp.time);
            }

            // Attachments
            if (lead.attachments && lead.attachments.length > 0) {
              setAttachments(
                lead.attachments.map((a) => ({
                  name: a.name,
                  size: a.size,
                  type: a.type,
                }))
              );
            }

            setCompletedTabs({
              company: true,
              contact: true,
              classification: true,
              requirement: true,
              assignment: true,
            });
          } else {
            setErrorMessage(`Lead with ID ${editId} not found in database.`);
          }
        })
        .catch((err) => {
          console.error('Failed to load lead for editing:', err);
          setErrorMessage('Failed to load lead details from database.');
        })
        .finally(() => {
          setIsLoadingLead(false);
        });
    }
  }, [editId]);

  // Current tab index
  const currentTabIndex = TABS.findIndex((t) => t.key === activeTab);
  const progressPercent = Math.round(((currentTabIndex + 1) / TABS.length) * 100);

  const [existingLeads, setExistingLeads] = useState<Lead[]>([]);
  const [duplicateMatch, setDuplicateMatch] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads({ size: 100 }).then((res) => {
      if (res && res.content) {
        setExistingLeads(res.content);
      }
    }).catch(() => {});
  }, []);

  // Duplicate Check
  const checkDuplicate = (comp: string, mail: string) => {
    if (editId) return; // Skip duplicate warning in edit mode
    const cleanComp = comp.trim().toLowerCase();
    const cleanMail = mail.trim().toLowerCase();

    if (!cleanComp && !cleanMail) {
      setShowDuplicateWarning(false);
      setDuplicateMatch(null);
      return;
    }

    const match = existingLeads.find((l) => {
      const existingComp = l.company?.name?.trim().toLowerCase() || '';
      const existingMail = l.contact?.email?.trim().toLowerCase() || '';
      const matchComp = cleanComp.length > 2 && existingComp.includes(cleanComp);
      const matchMail = cleanMail.length > 4 && existingMail.includes(cleanMail);
      return matchComp || matchMail;
    });

    if (match) {
      setDuplicateMatch(match);
      setShowDuplicateWarning(true);
    } else {
      setShowDuplicateWarning(false);
      setDuplicateMatch(null);
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

  // Step Validation
  const validateTab = (tab: TabKey): boolean => {
    const errs: Record<string, string> = {};

    if (tab === 'company') {
      if (!companyName.trim()) {
        errs.companyName = 'Company name is required.';
      }
    } else if (tab === 'contact') {
      if (!contactPerson.trim()) {
        errs.contactPerson = 'Contact person name is required.';
      }
      if (!email.trim() && !phone.trim()) {
        errs.email = 'Either email or phone number is required.';
        errs.phone = 'Either phone number or email is required.';
      } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errs.email = 'Please enter a valid email address.';
      }
    } else if (tab === 'classification') {
      if (!leadSource) errs.leadSource = 'Lead source is required.';
      if (!service) errs.service = 'Interested service is required.';
    }

    setErrors(errs);
    const isValid = Object.keys(errs).length === 0;

    if (isValid) {
      setCompletedTabs((prev) => ({ ...prev, [tab]: true }));
    }
    return isValid;
  };

  // Tab Navigation handlers
  const handleTabClick = (targetTab: TabKey) => {
    // Check validation of current tab before jumping forward
    const targetIdx = TABS.findIndex((t) => t.key === targetTab);
    if (targetIdx > currentTabIndex && !editId) {
      if (!validateTab(activeTab)) return;
    }
    setActiveTab(targetTab);
  };

  const handleNextTab = () => {
    if (!validateTab(activeTab)) return;

    if (currentTabIndex < TABS.length - 1) {
      const nextTab = TABS[currentTabIndex + 1].key;
      setActiveTab(nextTab);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      const prevTab = TABS[currentTabIndex - 1].key;
      setActiveTab(prevTab);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  // Save full form to localStorage
  const handleSaveDraft = () => {
    try {
      const draftData = {
        companyName,
        website,
        industry,
        companySize,
        country,
        state,
        city,
        companyLinkedIn,
        companyDescription,
        contactPerson,
        designation,
        email,
        phone,
        alternatePhone,
        contactLinkedIn,
        leadSource,
        service,
        status,
        priority,
        leadScore,
        requirementSummary,
        businessProblem,
        expectedTimeline,
        budgetRange,
        currentTech,
        numberOfUsers,
        additionalNotes,
        assignedEmployee,
        assignedBA,
        followUpDate,
        followUpTime,
        attachments: attachments.map((a) => ({ id: a.id, name: a.name, size: a.size, type: a.type, url: a.url })),
        savedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      };
      localStorage.setItem('crm_lead_draft', JSON.stringify(draftData));
      setSavedDraftInfo(null);
      toast.success(`Draft saved to workspace (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`, 'Draft Saved');
      setSuccessMessage(`Draft for "${companyName || 'Lead'}" saved to local workspace. You can safely resume anytime.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      console.error('Failed to save draft:', e);
      toast.error('Could not save draft to local storage');
    }
  };

  // Restore draft from localStorage
  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem('crm_lead_draft');
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.companyName !== undefined) setCompanyName(d.companyName);
      if (d.website !== undefined) setWebsite(d.website);
      if (d.industry !== undefined) setIndustry(d.industry);
      if (d.companySize !== undefined) setCompanySize(d.companySize);
      if (d.country !== undefined) setCountry(d.country);
      if (d.state !== undefined) setState(d.state);
      if (d.city !== undefined) setCity(d.city);
      if (d.companyLinkedIn !== undefined) setCompanyLinkedIn(d.companyLinkedIn);
      if (d.companyDescription !== undefined) setCompanyDescription(d.companyDescription);
      if (d.contactPerson !== undefined) setContactPerson(d.contactPerson);
      if (d.designation !== undefined) setDesignation(d.designation);
      if (d.email !== undefined) setEmail(d.email);
      if (d.phone !== undefined) setPhone(d.phone);
      if (d.alternatePhone !== undefined) setAlternatePhone(d.alternatePhone);
      if (d.contactLinkedIn !== undefined) setContactLinkedIn(d.contactLinkedIn);
      if (d.leadSource !== undefined) setLeadSource(d.leadSource);
      if (d.service !== undefined) setService(d.service);
      if (d.status !== undefined) setStatus(d.status);
      if (d.priority !== undefined) setPriority(d.priority);
      if (d.leadScore !== undefined) setLeadScore(d.leadScore);
      if (d.requirementSummary !== undefined) setRequirementSummary(d.requirementSummary);
      if (d.businessProblem !== undefined) setBusinessProblem(d.businessProblem);
      if (d.expectedTimeline !== undefined) setExpectedTimeline(d.expectedTimeline);
      if (d.budgetRange !== undefined) setBudgetRange(d.budgetRange);
      if (d.currentTech !== undefined) setCurrentTech(d.currentTech);
      if (d.numberOfUsers !== undefined) setNumberOfUsers(d.numberOfUsers);
      if (d.additionalNotes !== undefined) setAdditionalNotes(d.additionalNotes);
      if (d.assignedEmployee !== undefined) setAssignedEmployee(d.assignedEmployee);
      if (d.assignedBA !== undefined) setAssignedBA(d.assignedBA);
      if (d.followUpDate !== undefined) setFollowUpDate(d.followUpDate);
      if (d.followUpTime !== undefined) setFollowUpTime(d.followUpTime);
      if (Array.isArray(d.attachments)) setAttachments(d.attachments);

      setSavedDraftInfo(null);
      toast.info('Draft restored successfully', 'Draft Loaded');
      setSuccessMessage('Previous draft loaded into form.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e) {
      console.error('Failed to restore draft:', e);
      toast.error('Failed to restore draft');
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('crm_lead_draft');
    setSavedDraftInfo(null);
    toast.info('Saved draft removed');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileType = (filename: string, mimeType?: string): string => {
    const ext = filename.split('.').pop()?.toUpperCase();
    if (ext && ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'PNG', 'JPG', 'JPEG', 'ZIP', 'TXT', 'CSV'].includes(ext)) {
      return ext;
    }
    return mimeType || 'FILE';
  };

  const handleAddFiles = (files: FileList | globalThis.File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const newItems = fileList.map((file) => ({
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name, file.type),
      file,
    }));

    setAttachments((prev) => [...prev, ...newItems]);
    toast.info(
      `${fileList.length} file(s) attached. They will be uploaded when you click '${editId ? 'Save & Update Lead' : 'Submit & Create Lead'}'.`,
      'Files Attached'
    );
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
      e.target.value = ''; // reset
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required steps
    if (!validateTab('company')) {
      setActiveTab('company');
      return;
    }
    if (!validateTab('contact')) {
      setActiveTab('contact');
      return;
    }
    if (!validateTab('classification')) {
      setActiveTab('classification');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      company: {
        name: companyName,
        website,
        industry,
        companySize,
        country,
        state,
        city,
        linkedIn: companyLinkedIn,
        description: companyDescription,
      },
      contact: {
        name: contactPerson,
        designation,
        email,
        phone,
        alternatePhone,
        linkedIn: contactLinkedIn,
      },
      requirement: {
        summary: requirementSummary,
        problemStatement: businessProblem,
        expectedTimeline,
        budgetRange,
        currentTech,
        numberOfUsers,
        additionalNotes,
      },
      service,
      source: leadSource,
      status,
      priority,
      score: leadScore,
      assignedEmployeeName: assignedEmployee,
      assignedBAName: assignedBA,
      createdByName: editingLead?.createdBy?.name || authUser?.name || 'System Admin',
      createdByEmail: editingLead?.createdBy?.email || authUser?.email || '',
      createdByRole: editingLead?.createdBy?.role || authUser?.accessRole || authUser?.role || 'Sales Manager',
      updatedByName: authUser?.name || editingLead?.updatedBy?.name || editingLead?.createdBy?.name || 'Admin',
      updatedByEmail: authUser?.email || '',
      updatedByRole: authUser?.accessRole || authUser?.role || 'Sales Manager',
      initialFollowUpDate: followUpDate,
      initialFollowUpTime: followUpTime,
      initialFollowUpNotes: 'Scheduled discovery discussion',
      attachments: attachments.map((a) => ({
        name: a.name,
        size: a.size,
        type: a.type,
      })),
    };

    setErrorMessage(null);
    try {
      if (editId) {
        const result = await updateLead(editId, payload);
        if (result.success && result.lead) {
          // Upload any newly staged raw files attached to this lead
          const newFilesToUpload = attachments.filter((a) => a.file);
          if (newFilesToUpload.length > 0) {
            for (const att of newFilesToUpload) {
              if (att.file) {
                try {
                  await uploadAttachment(att.file, editId);
                } catch (uploadErr) {
                  console.error('Failed to upload file:', att.name, uploadErr);
                }
              }
            }
          }

          localStorage.removeItem('crm_lead_draft');
          toast.success(`Lead ${result.lead.leadCode || editId} (${result.lead.company?.name || companyName}) updated successfully!`, 'Lead Updated');
          setSuccessMessage(`Lead ${result.lead.leadCode || editId} updated successfully in database! Redirecting...`);
          window.dispatchEvent(new Event('crm-leads-updated'));
          setTimeout(() => {
            navigate(`/leads/${editId}`);
          }, 800);
        } else {
          const err = result.error || 'Failed to update lead. Please check the fields and try again.';
          toast.error(err, 'Update Failed');
          setErrorMessage(err);
        }
      } else {
        const result = await createLead(payload);
        if (result.success && result.lead) {
          // Upload any newly staged raw files attached to this new lead
          const newFilesToUpload = attachments.filter((a) => a.file);
          if (newFilesToUpload.length > 0) {
            for (const att of newFilesToUpload) {
              if (att.file) {
                try {
                  await uploadAttachment(att.file, String(result.lead.id), result.lead.leadCode);
                } catch (uploadErr) {
                  console.error('Failed to upload file:', att.name, uploadErr);
                }
              }
            }
          }

          localStorage.removeItem('crm_lead_draft');
          toast.success(`Lead ${result.lead.leadCode || ''} registered in CRM database!`, 'Lead Created');
          setSuccessMessage(`Lead ${result.lead.leadCode || ''} created successfully in database! Redirecting...`);
          window.dispatchEvent(new Event('crm-leads-updated'));
          setTimeout(() => {
            navigate('/leads');
          }, 800);
        } else {
          const err = result.error || 'Failed to create lead. Please check the fields and try again.';
          toast.error(err, 'Creation Failed');
          setErrorMessage(err);
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Network error communicating with backend server';
      toast.error(errMsg, 'Network Error');
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingLead) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-3 max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin" />
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Loading lead details for editing from database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title={
          editId
            ? `Edit Lead: ${editingLead?.leadCode || editId} ${companyName ? `(${companyName})` : ''}`
            : 'Add New Lead'
        }
        description={
          editId
            ? 'Update lead information, requirements, and team assignments in the CRM system.'
            : 'Create and assign a new B2B sales lead for TechnoKraft Services.'
        }
        actions={
          <Link
            to={editId ? `/leads/${editId}` : '/leads'}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Return</span>
          </Link>
        }
      />

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-xl text-xs font-semibold flex items-center justify-between gap-2.5 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <X className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Duplicate Lead Detection Alert Banner */}
      {showDuplicateWarning && duplicateMatch && (
        <DuplicateLeadAlert
          existingLeadId={duplicateMatch.id}
          existingLeadCode={duplicateMatch.leadCode || (duplicateMatch.id ? `LD-${duplicateMatch.id}` : 'LD-PREV')}
          existingCompanyName={duplicateMatch.company?.name || 'Existing Client Company'}
          existingEmail={duplicateMatch.contact?.email || 'N/A'}
          onDismiss={() => setShowDuplicateWarning(false)}
          onMergeLater={() => {
            setShowDuplicateWarning(false);
            setSuccessMessage(`Marked for review & merge with ${duplicateMatch.leadCode || `LD-${duplicateMatch.id}`}`);
          }}
        />
      )}

      {/* Saved Draft Alert Banner */}
      {savedDraftInfo && !editId && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Unsaved Draft Found: </span>
              <span>
                "{savedDraftInfo.companyName || 'Untitled Lead'}" saved at {savedDraftInfo.savedAt}.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5B4DB7] text-white hover:bg-[#4E41A2] rounded-lg font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Draft</span>
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          </div>
        </div>
      )}

      {/* STEPPER / TAB NAVIGATION BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-2xs">
        {/* Progress header */}
        <div className="flex items-center justify-between text-xs mb-3 px-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
            Step {currentTabIndex + 1} of {TABS.length}:{' '}
            <strong className="text-[#5B4DB7] dark:text-purple-400">{TABS[currentTabIndex].shortLabel}</strong>
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {progressPercent}% Completed
          </span>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3.5">
          <div
            className="bg-[#5B4DB7] dark:bg-purple-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Desktop Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;
            const isCompleted = completedTabs[tab.key] || idx < currentTabIndex;

            let tabClasses =
              'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800';
            let badgeClasses = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';

            if (isActive) {
              tabClasses =
                'border-[#5B4DB7] dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 ring-2 ring-purple-400/20 font-bold';
              badgeClasses = 'bg-[#5B4DB7] dark:bg-purple-600 text-white';
            } else if (isCompleted) {
              tabClasses =
                'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-semibold';
              badgeClasses = 'bg-emerald-600 text-white';
            }

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all text-left cursor-pointer ${tabClasses}`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${badgeClasses}`}
                >
                  {isCompleted && !isActive ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{tab.shortLabel}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT FORM */}
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && (e.target as HTMLInputElement).type !== 'submit') {
            e.preventDefault();
          }
        }}
        className="space-y-6"
      >
        {/* ========================================================= */}
        {/* TAB 1: COMPANY INFORMATION */}
        {/* ========================================================= */}
        {activeTab === 'company' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Company Information</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Corporate client profile and location details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Company Name (Required) */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  placeholder="e.g. Apex Enterprise Solutions Pvt Ltd"
                  className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                    errors.companyName
                      ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.companyName}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://apexsolutions.com"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Industry Sector</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Size</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>
              </div>

              {/* Company LinkedIn */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company LinkedIn Profile</label>
                <input
                  type="text"
                  value={companyLinkedIn}
                  onChange={(e) => setCompanyLinkedIn(e.target.value)}
                  placeholder="e.g. linkedin.com/company/apex-solutions"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              {/* Company Description */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Background</label>
                <textarea
                  rows={3}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="Brief business summary or market positioning..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRIMARY CONTACT */}
        {/* ========================================================= */}
        {activeTab === 'contact' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Primary Contact Person</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Key stakeholder or decision maker details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Contact Name (Required) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                    errors.contactPerson
                      ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.contactPerson && (
                  <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.contactPerson}</p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation / Role</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Chief Technology Officer / IT Director"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              {/* Email (Required) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="e.g. kunal.patil@apexsolutions.com"
                  className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                    errors.email
                      ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.email && (
                  <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Phone (Required) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                    errors.phone
                      ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.phone && (
                  <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alternate Phone / Direct Desk</label>
                <input
                  type="tel"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  placeholder="e.g. +91 20 6712 3456"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              {/* Contact LinkedIn */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={contactLinkedIn}
                  onChange={(e) => setContactLinkedIn(e.target.value)}
                  placeholder="e.g. linkedin.com/in/kunal-patil-cto"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LEAD CLASSIFICATION & SERVICE */}
        {/* ========================================================= */}
        {activeTab === 'classification' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">3. Lead Classification & Service</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">TechnoKraft offering, source channel, and qualification parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Lead Source */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Source <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Interested Service <span className="text-rose-500">*</span>
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as TechnoKraftService)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
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
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Initial Lead Score: <strong className="text-[#5B4DB7] dark:text-purple-400">{leadScore} / 100</strong>
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {leadScore >= 81 ? '🔥 Very Hot' : leadScore >= 61 ? '⚡ Hot' : 'Warm'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={leadScore}
                  onChange={(e) => setLeadScore(Number(e.target.value))}
                  className="w-full accent-[#5B4DB7] dark:accent-purple-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BUSINESS REQUIREMENT */}
        {/* ========================================================= */}
        {activeTab === 'requirement' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">4. Business Requirements & Scope</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Project requirements, budget expectations, and target timeline</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Requirement Summary</label>
                <textarea
                  rows={3}
                  value={requirementSummary}
                  onChange={(e) => setRequirementSummary(e.target.value)}
                  placeholder="Summarize the core technical deliverable or business software needed..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Problem Statement / Pain Points</label>
                <textarea
                  rows={2}
                  value={businessProblem}
                  onChange={(e) => setBusinessProblem(e.target.value)}
                  placeholder="What bottlenecks or issues is the client facing currently?"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Budget Range (INR)</label>
                <input
                  type="text"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  placeholder="e.g. ₹20L - ₹35L"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Delivery Timeline</label>
                <input
                  type="text"
                  value={expectedTimeline}
                  onChange={(e) => setExpectedTimeline(e.target.value)}
                  placeholder="e.g. 3 to 4 months"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Tech Stack (If Any)</label>
                <input
                  type="text"
                  value={currentTech}
                  onChange={(e) => setCurrentTech(e.target.value)}
                  placeholder="e.g. Java Spring, MySQL, React"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Users / Scale</label>
                <input
                  type="text"
                  value={numberOfUsers}
                  onChange={(e) => setNumberOfUsers(e.target.value)}
                  placeholder="e.g. 500 internal agents or 50,000 public users"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ASSIGNMENT, SCHEDULE & ATTACHMENTS */}
        {/* ========================================================= */}
        {activeTab === 'assignment' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Team Allocation Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">5. Internal Team Assignment & Scheduling</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Allocate lead ownership and schedule the immediate follow-up task</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Sales Executive</label>
                  <EmployeeSelect
                    value={assignedEmployee}
                    onChange={(e) => setAssignedEmployee(e.target.value)}
                    placeholder="Select Sales Executive / Unassigned"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Business Analyst (BA)</label>
                  <EmployeeSelect
                    value={assignedBA}
                    onChange={(e) => setAssignedBA(e.target.value)}
                    placeholder="Select Business Analyst / Unassigned"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Next Follow-up Time</label>
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>
              </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center flex-shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">6. Scope & RFP Attachments</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Attach client briefs, NDA, technical diagrams, or RFP documents</p>
                  </div>
                </div>
                {attachments.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                    {attachments.length} attached
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                onClick={(e) => e.stopPropagation()}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.csv,.txt"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleFileDrop}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#5B4DB7] dark:hover:border-purple-400 rounded-xl p-6 text-center bg-slate-50/70 dark:bg-slate-950/40 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all cursor-pointer group"
              >
                <div className="max-w-xs mx-auto space-y-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100/80 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Drag & drop files here, or <span className="text-[#5B4DB7] dark:text-purple-400 underline">browse files</span>
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      PDF, DOCX, XLSX, PNG, JPG, ZIP (up to 25 MB each)
                    </p>
                  </div>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Attached Files ({attachments.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {attachments.map((file, idx) => {
                      const ext = file.type?.toUpperCase() || 'FILE';
                      let badgeColor = 'bg-purple-100 dark:bg-purple-950 text-[#5B4DB7] dark:text-purple-300 border-purple-200 dark:border-purple-800';
                      if (ext === 'PDF') badgeColor = 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
                      if (ext === 'DOC' || ext === 'DOCX') badgeColor = 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                      if (ext === 'XLS' || ext === 'XLSX' || ext === 'CSV') badgeColor = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                      if (ext === 'PNG' || ext === 'JPG' || ext === 'JPEG') badgeColor = 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800';

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor} flex-shrink-0`}>
                              {ext}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">{file.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachments((prev) => prev.filter((_, i) => i !== idx));
                              toast.info(`Removed ${file.name}`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                            title="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM STEPPER CONTROLS & ACTION BAR */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          {/* Left Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentTabIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrevTab}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <Link
                to={editId ? `/leads/${editId}` : '/leads'}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Cancel</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              Save Draft
            </button>
          </div>

          {/* Right Actions: Next Step OR Submit Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {currentTabIndex < TABS.length - 1 ? (
              <button
                type="button"
                onClick={handleNextTab}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg transition-colors shadow-xs cursor-pointer w-full sm:w-auto"
              >
                <span>Next: {TABS[currentTabIndex + 1].shortLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer w-full sm:w-auto disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{editId ? 'Saving Changes...' : 'Creating Lead...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editId ? 'Save & Update Lead' : 'Submit & Create Lead'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
