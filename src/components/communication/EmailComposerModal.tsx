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
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';
import { MOCK_LEADS } from '../../data/mockLeads';
import {
  MOCK_EMAIL_TEMPLATES,
  resolveTemplateText,
} from '../../data/mockCommunication';
import {
  EmailAttachment,
  EmailRecord,
  EmailTemplate,
} from '../../types/communication';
import { Lead } from '../../types/leads';
import { EmailTemplateSelector } from './EmailTemplateSelector';
import { EmailVariablePreview } from './EmailVariablePreview';
import { AttachmentUploader } from './AttachmentUploader';
import { ScheduleEmailModal } from './ScheduleEmailModal';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (newEmail: EmailRecord) => void;
  onSaveDraft?: (draftEmail: EmailRecord) => void;
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
  defaultLeadId,
  defaultRecipientEmail,
  defaultSubject,
  defaultBody,
}) => {
  // Selected CRM Lead
  const [selectedLeadId, setSelectedLeadId] = useState<string>(defaultLeadId || 'lead-1');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Email form fields
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Template state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-1');

  // Attachments
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);

  // Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Status feedback toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync lead selection
  useEffect(() => {
    const lead = MOCK_LEADS.find((l) => l.id === selectedLeadId) || MOCK_LEADS[0];
    setSelectedLead(lead || null);

    if (lead) {
      setRecipientEmail(defaultRecipientEmail || lead.contact?.email || '');
      setRecipientName(lead.contact?.name || '');
    }
  }, [selectedLeadId, defaultRecipientEmail]);

  // Apply default template or custom defaults on first load
  useEffect(() => {
    if (defaultSubject) setSubject(defaultSubject);
    if (defaultBody) setBody(defaultBody);

    if (!defaultSubject && !defaultBody && selectedLead) {
      const defaultTpl = MOCK_EMAIL_TEMPLATES[0];
      setSubject(resolveTemplateText(defaultTpl.subject, selectedLead));
      setBody(resolveTemplateText(defaultTpl.body, selectedLead));
    }
  }, [selectedLead]);

  if (!isOpen) return null;

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLeadId = e.target.value;
    setSelectedLeadId(newLeadId);
    const newLead = MOCK_LEADS.find((l) => l.id === newLeadId);
    if (newLead) {
      setSelectedLead(newLead);
      setRecipientEmail(newLead.contact?.email || '');
      setRecipientName(newLead.contact?.name || '');

      // Re-apply selected template with new lead variables
      const currentTpl = MOCK_EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (currentTpl) {
        setSubject(resolveTemplateText(currentTpl.subject, newLead));
        setBody(resolveTemplateText(currentTpl.body, newLead));
      }
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplateId(template.id);
    setSubject(resolveTemplateText(template.subject, selectedLead));
    setBody(resolveTemplateText(template.body, selectedLead));
  };

  const handleInsertVariable = (variableTag: string) => {
    const resolved = resolveTemplateText(variableTag, selectedLead);
    setBody((prev) => `${prev} ${resolved}`);
  };

  const handleAddAttachment = (att: EmailAttachment) => {
    setAttachments((prev) => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    if (!recipientEmail || !subject) {
      alert('Please fill in the recipient email and subject.');
      return;
    }

    const newRecord: EmailRecord = {
      id: `email-${Date.now()}`,
      leadId: selectedLead?.id || 'lead-custom',
      leadCode: selectedLead?.leadCode || 'LD-2026-CUSTOM',
      companyName: selectedLead?.company?.name || 'Client Company',
      recipientName: recipientName || 'Valued Client',
      recipientEmail,
      cc: ccInput ? ccInput.split(',').map((s) => s.trim()) : undefined,
      bcc: bccInput ? bccInput.split(',').map((s) => s.trim()) : undefined,
      subject,
      body,
      status: 'sent',
      senderName: 'Rahul Patil',
      senderEmail: 'rahul.patil@technokraft.com',
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
    setToastMessage(`✓ Email dispatched successfully to ${recipientEmail}`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1200);
  };

  const handleConfirmSchedule = (dateStr: string, timeStr: string) => {
    const newRecord: EmailRecord = {
      id: `email-${Date.now()}`,
      leadId: selectedLead?.id || 'lead-custom',
      leadCode: selectedLead?.leadCode || 'LD-2026-CUSTOM',
      companyName: selectedLead?.company?.name || 'Client Company',
      recipientName: recipientName || 'Valued Client',
      recipientEmail,
      subject,
      body,
      status: 'scheduled',
      senderName: 'Rahul Patil',
      senderEmail: 'rahul.patil@technokraft.com',
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
    setToastMessage(`✓ Email scheduled for delivery on ${dateStr} at ${timeStr}`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1200);
  };

  const handleDraft = () => {
    const draftRecord: EmailRecord = {
      id: `email-draft-${Date.now()}`,
      leadId: selectedLead?.id || 'lead-custom',
      leadCode: selectedLead?.leadCode || 'LD-2026-CUSTOM',
      companyName: selectedLead?.company?.name || 'Client Company',
      recipientName: recipientName || 'Draft Recipient',
      recipientEmail,
      subject: subject || '(Untitled Draft)',
      body,
      status: 'draft',
      senderName: 'Rahul Patil',
      senderEmail: 'rahul.patil@technokraft.com',
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

    onSendEmail(draftRecord);
    setToastMessage('✓ Draft saved to local workspace');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Compose Business Email"
    >
      <div
        className="w-full max-w-4xl max-h-[96vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Compose B2B Email
              </h3>
              <p className="text-[11px] text-slate-500">
                Associated with CRM Lead & Contact records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close composer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* CRM Lead Selector Bar */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#5B4DB7]" />
                <span>Select Target CRM Lead</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Auto-fills recipient contact & company data
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Company / Lead Record
                </label>
                <select
                  value={selectedLeadId}
                  onChange={handleLeadChange}
                  className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                >
                  {MOCK_LEADS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.company.name} ({l.leadCode}) — {l.service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Primary Contact Person
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">
                    {selectedLead?.contact?.name} ({selectedLead?.contact?.designation})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Template Selector & Dynamic Variables Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <EmailTemplateSelector
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={handleTemplateSelect}
            />

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5B4DB7] hover:underline mb-2"
              >
                <span>{showCcBcc ? 'Hide CC / BCC' : '+ Add CC / BCC'}</span>
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 w-12 text-right">To:</span>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>

            {showCcBcc && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 w-12 text-right">CC:</span>
                  <input
                    type="text"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    placeholder="account-manager@technokraft.com, tech@client.com"
                    className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 w-12 text-right">BCC:</span>
                  <input
                    type="text"
                    value={bccInput}
                    onChange={(e) => setBccInput(e.target.value)}
                    placeholder="crm-archive@technokraft.com"
                    className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 w-12 text-right">Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Business subject line..."
                className="flex-1 text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>
          </div>

          {/* Email Body TextArea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message Body
            </label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Draft your personalized email here..."
              className="w-full text-xs leading-relaxed p-3.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
            />
          </div>

          {/* Attachment Uploader */}
          <AttachmentUploader
            attachments={attachments}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
          />
        </div>

        {/* Action Buttons Bar */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Sent via TechnoKraft Enterprise Mail System</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleDraft}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Schedule</span>
            </button>

            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Send Email</span>
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

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-60 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
