import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Clock,
  Save,
  UserCheck,
  Building,
  Mail,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Eye,
  Edit3,
  BookmarkPlus,
  Sparkles,
  Lock,
  Plus,
} from 'lucide-react';
import {
  resolveTemplateText,
} from '../../services/emailService';
import {
  EmailAttachment,
  EmailRecord,
  EmailTemplate,
} from '../../types/communication';
import { Lead } from '../../types/leads';
import { sendB2BEmail } from '../../services/leadService';
import { fetchEmailTemplates } from '../../services/emailService';
import { LeadSearchSelect } from '../common/LeadSearchSelect';
import { EmailTemplateSelector } from './EmailTemplateSelector';
import { EmailVariablePreview } from './EmailVariablePreview';
import { AttachmentUploader } from './AttachmentUploader';
import { ScheduleEmailModal } from './ScheduleEmailModal';
import { CreateTemplateModal } from './CreateTemplateModal';
import { useAuth } from '../../context/AuthContext';
import { EmployeeAvatar } from '../common/EmployeeAvatar';
import { renderBrandedEmailHtml } from '../../utils/emailTemplateRenderer';

const DEFAULT_SMTP_EMAIL = (import.meta.env?.VITE_SMTP_FROM_EMAIL as string) || 'info@technokraftservices.com';
const DEFAULT_SMTP_NAME = (import.meta.env?.VITE_SMTP_FROM_NAME as string) || 'TechnoKraft Services';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (newEmail: EmailRecord) => void;
  onSaveDraft?: (draftEmail: EmailRecord) => void;
  initialLead?: Lead | null;
  defaultLeadId?: string;
  defaultRecipientEmail?: string;
  defaultSubject?: string;
  defaultBody?: string;
}

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({
  isOpen,
  onClose,
  onSendEmail,
  onSaveDraft,
  initialLead,
  defaultLeadId,
  defaultRecipientEmail,
  defaultSubject,
  defaultBody,
}) => {
  const { user } = useAuth();

  // Selected CRM Lead
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    defaultLeadId || (initialLead?.id ? String(initialLead.id) : '')
  );
  const [selectedLead, setSelectedLead] = useState<Lead | null>(initialLead || null);

  // Email form fields
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail || initialLead?.contact?.email || '');
  const [recipientName, setRecipientName] = useState(initialLead?.contact?.name || '');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccList, setCcList] = useState<string[]>([]);
  const [bccList, setBccList] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');

  // Helper functions for CC & BCC chip management
  const addCcEmails = (raw: string) => {
    if (!raw) return;
    const items = raw
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.includes('@'));
    if (items.length > 0) {
      setCcList((prev) => Array.from(new Set([...prev, ...items])));
      setCcInput('');
    }
  };

  const removeCcEmail = (emailToRemove: string) => {
    setCcList((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const addBccEmails = (raw: string) => {
    if (!raw) return;
    const items = raw
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.includes('@'));
    if (items.length > 0) {
      setBccList((prev) => Array.from(new Set([...prev, ...items])));
      setBccInput('');
    }
  };

  const removeBccEmail = (emailToRemove: string) => {
    setBccList((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const getFinalCcList = (): string[] | undefined => {
    const pending = ccInput
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.includes('@'));
    const combined = Array.from(new Set([...ccList, ...pending]));
    return combined.length > 0 ? combined : undefined;
  };

  const getFinalBccList = (): string[] | undefined => {
    const pending = bccInput
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.includes('@'));
    const combined = Array.from(new Set([...bccList, ...pending]));
    return combined.length > 0 ? combined : undefined;
  };
  const [subject, setSubject] = useState(defaultSubject || '');
  const [body, setBody] = useState(defaultBody || '');

  // Template state
  const [availableTemplates, setAvailableTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [composerTab, setComposerTab] = useState<'edit' | 'preview'>('edit');

  // Attachments
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);

  // Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Status feedback & loading
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Load templates
  useEffect(() => {
    fetchEmailTemplates().then((tpls) => {
      if (tpls && tpls.length > 0) {
        setAvailableTemplates(tpls);
      }
    });
  }, []);

  // Sync when initialLead or defaultRecipientEmail changes
  useEffect(() => {
    if (initialLead) {
      setSelectedLead(initialLead);
      setSelectedLeadId(String(initialLead.id));
      setRecipientEmail(defaultRecipientEmail || initialLead.contact?.email || '');
      setRecipientName(initialLead.contact?.name || '');
    }
  }, [initialLead, defaultRecipientEmail, user]);

  // Apply default template or custom defaults on first load
  useEffect(() => {
    if (defaultSubject) setSubject(defaultSubject);
    if (defaultBody) setBody(defaultBody);
  }, [defaultSubject, defaultBody]);

  if (!isOpen) return null;

  const handleLeadSelected = (newLeadId: string, newLead: Lead | null) => {
    setSelectedLeadId(newLeadId);
    setSelectedLead(newLead);
    if (newLead) {
      setRecipientEmail(newLead.contact?.email || '');
      setRecipientName(newLead.contact?.name || '');

      // Re-apply selected template with new lead variables if one is selected
      if (selectedTemplateId) {
        const currentTpl = availableTemplates.find((t) => t.id === selectedTemplateId);
        if (currentTpl) {
          setSubject(resolveTemplateText(currentTpl.subject, newLead));
          setBody(resolveTemplateText(currentTpl.body, newLead));
        }
      }
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplateId(template.id);
    setSubject(resolveTemplateText(template.subject, selectedLead));
    setBody(resolveTemplateText(template.body, selectedLead));
  };

  const handleCustomTemplateCreated = (newTpl: EmailTemplate) => {
    setAvailableTemplates((prev) => [newTpl, ...prev]);
    setSelectedTemplateId(newTpl.id);
    setSubject(resolveTemplateText(newTpl.subject, selectedLead));
    setBody(resolveTemplateText(newTpl.body, selectedLead));
    setToastType('success');
    setToastMessage(`Custom template "${newTpl.name}" applied`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleInsertVariable = (variableTag: string) => {
    const resolved = resolveTemplateText(variableTag, selectedLead);
    if (!resolved) return;
    setBody((prev) => (prev ? `${prev} ${resolved}` : resolved));
  };

  const handleAddAttachment = (att: EmailAttachment) => {
    setAttachments((prev) => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = async () => {
    if (!recipientEmail || !subject) {
      alert('Please fill in the recipient email and subject.');
      return;
    }

    setIsSending(true);
    try {
      const formattedAttachments = attachments.map((att) => ({
        id: att.id,
        name: att.name,
        fileName: att.name,
        filePath: att.filePath,
        fileSize: att.size,
        fileType: att.type,
        base64Content: att.base64Content,
      }));

      const senderName = DEFAULT_SMTP_NAME;
      const senderEmail = DEFAULT_SMTP_EMAIL;
      const senderAvatar = 'TS';
      const senderProfilePhoto = undefined;

      const finalCc = getFinalCcList();
      const finalBcc = getFinalBccList();

      const res = await sendB2BEmail({
        leadId: selectedLead?.id,
        leadCode: selectedLead?.leadCode,
        recipientEmail,
        recipientName: recipientName || selectedLead?.contact?.name || 'Valued Client',
        cc: finalCc,
        bcc: finalBcc,
        subject,
        body,
        senderName,
        senderEmail,
        senderAvatar,
        senderProfilePhoto,
        status: 'sent',
        attachments: formattedAttachments,
      });

      if (res.success) {
        const newRecord: EmailRecord = {
          id: res.emailId || `email-${Date.now()}`,
          leadId: selectedLead?.id || 'lead-custom',
          leadCode: selectedLead?.leadCode || 'LD-2026-CUSTOM',
          companyName: selectedLead?.company?.name || 'Client Company',
          recipientName: recipientName || 'Valued Client',
          recipientEmail,
          recipientAvatar: (selectedLead?.contact as any)?.avatar,
          recipientProfilePhoto: (selectedLead?.contact as any)?.profilePhoto,
          cc: finalCc,
          bcc: finalBcc,
          subject,
          body,
          status: 'sent',
          senderName,
          senderEmail,
          senderAvatar,
          senderProfilePhoto,
          date: 'Today',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString(),
          attachments,
          tracking: {
            sent: true,
            delivered: true,
            opened: false,
            replied: false,
          },
        };

        onSendEmail(newRecord);
        setToastType('success');
        setToastMessage(`Email dispatched successfully via SMTP to ${recipientEmail}`);
        setShowToast(true);
        window.dispatchEvent(new Event('crm-leads-updated'));
        setTimeout(() => {
          setShowToast(false);
          onClose();
        }, 1200);
      } else {
        setToastType('error');
        setToastMessage(`Email dispatch failed: ${res.message || res.error || 'Server error'}`);
        setShowToast(true);
      }
    } catch (err: any) {
      console.error('Email send error:', err);
      setToastType('error');
      setToastMessage(`Email error: ${err?.message || 'Failed to dispatch email'}`);
      setShowToast(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmSchedule = async (dateStr: string, timeStr: string) => {
    setIsSending(true);
    try {
      const formattedAttachments = attachments.map((att) => ({
        id: att.id,
        name: att.name,
        fileName: att.name,
        filePath: att.filePath,
        fileSize: att.size,
        fileType: att.type,
        base64Content: att.base64Content,
      }));

      const senderName = DEFAULT_SMTP_NAME;
      const senderEmail = DEFAULT_SMTP_EMAIL;
      const senderAvatar = 'TS';
      const senderProfilePhoto = undefined;

      const finalCc = getFinalCcList();
      const finalBcc = getFinalBccList();

      const res = await sendB2BEmail({
        leadId: selectedLead?.id,
        leadCode: selectedLead?.leadCode,
        recipientEmail,
        recipientName: recipientName || selectedLead?.contact?.name || 'Valued Client',
        cc: finalCc,
        bcc: finalBcc,
        subject,
        body,
        senderName,
        senderEmail,
        senderAvatar,
        senderProfilePhoto,
        status: 'scheduled',
        scheduledFor: `${dateStr}, ${timeStr}`,
        attachments: formattedAttachments,
      });

      const newRecord: EmailRecord = {
        id: res.emailId || `email-${Date.now()}`,
        leadId: selectedLead?.id || 'lead-custom',
        leadCode: selectedLead?.leadCode || 'LD-2026-CUSTOM',
        companyName: selectedLead?.company?.name || 'Client Company',
        recipientName: recipientName || 'Valued Client',
        recipientEmail,
        recipientAvatar: (selectedLead?.contact as any)?.avatar,
        recipientProfilePhoto: (selectedLead?.contact as any)?.profilePhoto,
        cc: finalCc,
        bcc: finalBcc,
        subject,
        body,
        status: 'scheduled',
        senderName,
        senderEmail,
        senderAvatar,
        senderProfilePhoto,
        date: dateStr,
        time: timeStr,
        timestamp: new Date().toISOString(),
        scheduledFor: `${dateStr}, ${timeStr}`,
        attachments,
        tracking: {
          sent: false,
          delivered: false,
          opened: false,
          replied: false,
        },
      };

      onSendEmail(newRecord);
      setToastType('success');
      setToastMessage(`Email scheduled for delivery on ${dateStr} at ${timeStr}`);
      setShowToast(true);
      window.dispatchEvent(new Event('crm-leads-updated'));
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setToastType('error');
      setToastMessage(`Schedule error: ${err?.message || 'Failed to schedule email'}`);
      setShowToast(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleDraft = async () => {
    setIsSending(true);
    try {
      const formattedAttachments = attachments.map((att) => ({
        id: att.id,
        name: att.name,
        fileName: att.name,
        filePath: att.filePath,
        fileSize: att.size,
        fileType: att.type,
        base64Content: att.base64Content,
      }));

      const senderName = DEFAULT_SMTP_NAME;
      const senderEmail = DEFAULT_SMTP_EMAIL;
      const senderAvatar = 'TS';
      const senderProfilePhoto = undefined;

      const finalCc = getFinalCcList();
      const finalBcc = getFinalBccList();

      const res = await sendB2BEmail({
        leadId: selectedLead?.id,
        leadCode: selectedLead?.leadCode,
        recipientEmail: recipientEmail || 'draft@lead.local',
        recipientName: recipientName || 'Draft Recipient',
        cc: finalCc,
        bcc: finalBcc,
        subject: subject || '(Untitled Draft)',
        body,
        senderName,
        senderEmail,
        senderAvatar,
        senderProfilePhoto,
        status: 'draft',
        attachments: formattedAttachments,
      });

      const draftRecord: EmailRecord = {
        id: res.emailId || `email-draft-${Date.now()}`,
        leadId: selectedLead?.id || 'lead-custom',
        leadCode: selectedLead?.leadCode || 'LD-2026-CUSTOM',
        companyName: selectedLead?.company?.name || 'Client Company',
        recipientName: recipientName || 'Draft Recipient',
        recipientEmail,
        recipientAvatar: (selectedLead?.contact as any)?.avatar,
        recipientProfilePhoto: (selectedLead?.contact as any)?.profilePhoto,
        cc: finalCc,
        bcc: finalBcc,
        subject: subject || '(Untitled Draft)',
        body,
        status: 'draft',
        senderName,
        senderEmail,
        senderAvatar,
        senderProfilePhoto,
        date: 'Today',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        attachments,
        tracking: {
          sent: false,
          delivered: false,
          opened: false,
          replied: false,
        },
      };

      if (onSaveDraft) {
        onSaveDraft(draftRecord);
      } else {
        onSendEmail(draftRecord);
      }
      setToastType('success');
      setToastMessage('Draft saved successfully');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setToastType('error');
      setToastMessage(`Draft error: ${err?.message || 'Failed to save draft'}`);
      setShowToast(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Compose Business Email"
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-400 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Compose B2B Email
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Associated with CRM Lead & Contact records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close composer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* CRM Lead Selector Bar */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <LeadSearchSelect
              label="Select Target CRM Lead / Client"
              value={selectedLeadId}
              initialLead={selectedLead}
              onChange={handleLeadSelected}
              placeholder="Search by company, contact, phone, email, or lead code (10K+ leads)..."
              showMetaPreview={true}
              helperText="Selecting a client auto-fills recipient contact & company data in email templates"
            />
          </div>

          {/* Template Selector & Dynamic Variables Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <EmailTemplateSelector
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={handleTemplateSelect}
              onCreateNewTemplate={() => setIsCreateTemplateModalOpen(true)}
              className="flex-1"
            />

            <div className="flex items-center gap-2 pb-0.5">
              <button
                type="button"
                onClick={() => setIsCreateTemplateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0A2558] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors shadow-2xs cursor-pointer"
                title="Create custom template or save current email draft"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                <span>Save as Template</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-850 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <span>{showCcBcc ? 'Hide CC/BCC' : 'CC/BCC'}</span>
                {(ccList.length > 0 || bccList.length > 0) && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-[#5B4DB7] dark:text-purple-300 rounded-full">
                    {ccList.length + bccList.length}
                  </span>
                )}
                {showCcBcc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Dynamic Variable Chips Bar */}
          <EmailVariablePreview
            lead={selectedLead}
            onInsertVariable={handleInsertVariable}
          />

          {/* Recipient inputs */}
          <div className="space-y-2">
            {/* Fixed Production SMTP Sender (Read-only, non-editable) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:w-12 sm:text-right">From:</span>
              <div className="flex-1 flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs cursor-default select-none shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#0A2558] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    TS
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {DEFAULT_SMTP_NAME}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate">
                    &lt;{DEFAULT_SMTP_EMAIL}&gt;
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex-shrink-0">
                  <Lock className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                  <span>Production SMTP</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 text-right">To:</span>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 text-xs px-3 py-2 bg-white dark:bg-slate-850 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 dark:focus:ring-purple-400/40"
                  required
                />
                {recipientName && (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex-shrink-0">
                    <EmployeeAvatar
                      name={recipientName}
                      email={recipientEmail}
                      size="xs"
                      isClient={true}
                    />
                    <span className="font-medium truncate max-w-[140px]">{recipientName}</span>
                  </div>
                )}
              </div>
            </div>

            {showCcBcc && (
              <>
                {/* CC Multi-Email Input with Chips */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:w-12 sm:text-right pt-2 flex-shrink-0">
                    CC:
                  </span>
                  <div className="flex-1 flex flex-wrap items-center gap-1.5 p-1.5 bg-white dark:bg-slate-850 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-[#5B4DB7]/40 dark:focus-within:ring-purple-400/40 min-h-[38px] transition-all">
                    {ccList.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 dark:bg-purple-950/70 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs"
                      >
                        <Mail className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400 flex-shrink-0" />
                        <span className="font-mono text-[11px]">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeCcEmail(email)}
                          className="text-purple-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer ml-0.5"
                          title={`Remove ${email}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={ccInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes(',') || val.includes(';')) {
                          addCcEmails(val);
                        } else {
                          setCcInput(val);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
                          e.preventDefault();
                          addCcEmails(ccInput);
                        } else if (e.key === 'Backspace' && !ccInput && ccList.length > 0) {
                          removeCcEmail(ccList[ccList.length - 1]);
                        }
                      }}
                      onBlur={() => {
                        if (ccInput.trim()) {
                          addCcEmails(ccInput);
                        }
                      }}
                      placeholder={
                        ccList.length === 0
                          ? 'Add CC emails (paste or press Enter / comma)...'
                          : 'Add another CC...'
                      }
                      className="flex-1 min-w-[200px] text-xs bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none px-2 py-1"
                    />
                    {ccInput.trim() && (
                      <button
                        type="button"
                        onClick={() => addCcEmails(ccInput)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-md transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* BCC Multi-Email Input with Chips */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:w-12 sm:text-right pt-2 flex-shrink-0">
                    BCC:
                  </span>
                  <div className="flex-1 flex flex-wrap items-center gap-1.5 p-1.5 bg-white dark:bg-slate-850 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-[#5B4DB7]/40 dark:focus-within:ring-purple-400/40 min-h-[38px] transition-all">
                    {bccList.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <span className="font-mono text-[11px]">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeBccEmail(email)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer ml-0.5"
                          title={`Remove ${email}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={bccInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes(',') || val.includes(';')) {
                          addBccEmails(val);
                        } else {
                          setBccInput(val);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
                          e.preventDefault();
                          addBccEmails(bccInput);
                        } else if (e.key === 'Backspace' && !bccInput && bccList.length > 0) {
                          removeBccEmail(bccList[bccList.length - 1]);
                        }
                      }}
                      onBlur={() => {
                        if (bccInput.trim()) {
                          addBccEmails(bccInput);
                        }
                      }}
                      placeholder={
                        bccList.length === 0
                          ? 'Add BCC emails (paste or press Enter / comma)...'
                          : 'Add another BCC...'
                      }
                      className="flex-1 min-w-[200px] text-xs bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none px-2 py-1"
                    />
                    {bccInput.trim() && (
                      <button
                        type="button"
                        onClick={() => addBccEmails(bccInput)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-12 text-right">Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Business subject line..."
                className="flex-1 text-xs font-medium px-3 py-2 bg-white dark:bg-slate-850 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 dark:focus:ring-purple-400/40"
                required
              />
            </div>
          </div>

          {/* Email Body TextArea / Live Branded Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Message Body
              </label>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setComposerTab('edit')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    composerTab === 'edit'
                      ? 'bg-white dark:bg-slate-700 text-[#0A2558] dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Plain Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setComposerTab('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    composerTab === 'preview'
                      ? 'bg-white dark:bg-slate-700 text-[#0A2558] dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <Eye className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
                  <span>Branded Preview</span>
                </button>
              </div>
            </div>

            {composerTab === 'edit' ? (
              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Draft your personalized email here..."
                className="w-full text-xs leading-relaxed p-3.5 bg-white dark:bg-slate-850 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 dark:focus:ring-purple-400/40"
              />
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 overflow-y-auto max-h-96">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                  <span>Official TechnoKraft Corporate Email Layout with Header &amp; Footer</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Live Preview</span>
                </div>
                <div
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                  dangerouslySetInnerHTML={{
                    __html: renderBrandedEmailHtml({
                      subject: subject || 'Business Communication',
                      body: body || 'No body content entered yet.',
                      senderName: 'TechnoKraft Consulting Team',
                      recipientEmail: recipientEmail || 'client@example.com',
                      companyName: selectedLead?.company?.name,
                      leadCode: selectedLead?.leadCode,
                    }),
                  }}
                />
              </div>
            )}
          </div>

          {/* Attachment Uploader */}
          <AttachmentUploader
            attachments={attachments}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
            leadId={selectedLead?.id ? String(selectedLead.id) : undefined}
          />
        </div>

        {/* Action Buttons Bar */}
        <div className="flex-shrink-0 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Sent via TechnoKraft Enterprise Mail System</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleDraft}
              disabled={isSending}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              disabled={isSending}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Schedule</span>
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Send Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Email Dialog */}
      <ScheduleEmailModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirmSchedule={handleConfirmSchedule}
      />

      {/* Create Custom Template Modal */}
      {isCreateTemplateModalOpen && (
        <CreateTemplateModal
          isOpen={isCreateTemplateModalOpen}
          onClose={() => setIsCreateTemplateModalOpen(false)}
          onTemplateCreated={handleCustomTemplateCreated}
          initialSubject={subject}
          initialBody={body}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-6 right-6 z-60 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            toastType === 'error' ? 'bg-rose-600' : 'bg-slate-900'
          }`}
        >
          {toastType === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-200 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
