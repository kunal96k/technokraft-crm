import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Eye,
  Edit3,
  Plus,
  Loader2,
  Tag,
  Save,
} from 'lucide-react';
import { EmailTemplate } from '../../types/communication';
import { createEmailTemplate, updateEmailTemplate } from '../../services/emailService';
import { renderBrandedEmailHtml } from '../../utils/emailTemplateRenderer';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when a template is successfully created */
  onTemplateCreated?: (template: EmailTemplate) => void;
  /** Called when a template is successfully updated */
  onTemplateUpdated?: (template: EmailTemplate) => void;
  /** When provided, the modal operates in EDIT mode pre-filled with this template */
  editTemplate?: EmailTemplate | null;
  initialSubject?: string;
  initialBody?: string;
}

const TEMPLATE_VARIABLES = [
  { key: 'contact_name', label: 'Contact Name' },
  { key: 'company_name', label: 'Company' },
  { key: 'service', label: 'Service' },
  { key: 'employee_name', label: 'Assigned Employee' },
  { key: 'lead_id', label: 'Lead ID' },
  { key: 'requirement', label: 'Requirement Summary' },
  { key: 'designation', label: 'Designation' },
  { key: 'recipient_email', label: 'Recipient Email' },
];

const PRESET_CATEGORIES = [
  'Outreach',
  'Follow-up',
  'Proposal',
  'Discovery',
  'Meeting',
  'Scheduling',
  'Closing',
  'General',
];

const DEFAULT_BODY =
  'Dear {{contact_name}},\n\nThank you for reaching out to TechnoKraft Services LLP regarding {{service}} for {{company_name}}.\n\nWe would be delighted to schedule a brief discovery consultation with our solution architects.\n\nLooking forward to collaborating with your team.\n\nRegards,\n{{employee_name}}\nTechnoKraft Services LLP';

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  onTemplateCreated,
  onTemplateUpdated,
  editTemplate = null,
  initialSubject = '',
  initialBody = '',
}) => {
  const isEditMode = editTemplate != null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Outreach');
  const [customCategory, setCustomCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate fields when modal opens — either from editTemplate or from initial* props
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && editTemplate) {
      setName(editTemplate.name);
      // If the category is not in PRESET_CATEGORIES, switch to custom
      if (PRESET_CATEGORIES.includes(editTemplate.category)) {
        setCategory(editTemplate.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(editTemplate.category);
      }
      setSubject(editTemplate.subject);
      setBody(editTemplate.body);
    } else {
      setName('');
      setCategory('Outreach');
      setCustomCategory('');
      setSubject(initialSubject);
      setBody(initialBody || DEFAULT_BODY);
    }

    setActiveTab('edit');
    setErrorMsg('');
  }, [isOpen, editTemplate]);

  if (!isOpen) return null;

  const insertVariable = (key: string) => {
    const placeholder = `{{${key}}}`;
    setBody((prev) => `${prev} ${placeholder}`);
  };

  const handleSave = async () => {
    if (!name.trim()) { setErrorMsg('Please enter a template name.'); return; }
    if (!subject.trim()) { setErrorMsg('Please provide a subject line.'); return; }
    if (!body.trim()) { setErrorMsg('Please write template body text.'); return; }

    setErrorMsg('');
    setIsSaving(true);

    try {
      const usedVars = TEMPLATE_VARIABLES.filter(
        (v) => subject.includes(`{{${v.key}}}`) || body.includes(`{{${v.key}}}`)
      ).map((v) => v.key);

      const finalCategory =
        category === 'Custom' && customCategory.trim()
          ? customCategory.trim()
          : category;

      const payload: Partial<EmailTemplate> = {
        name: name.trim(),
        category: finalCategory,
        subject: subject.trim(),
        body: body.trim(),
        variables: usedVars.length > 0 ? usedVars : ['contact_name', 'employee_name', 'service'],
        isDefault: isEditMode ? editTemplate!.isDefault : false,
      };

      if (isEditMode && editTemplate) {
        // UPDATE existing template
        const updated = await updateEmailTemplate(editTemplate.id, payload);
        if (updated) {
          onTemplateUpdated?.(updated);
          onClose();
        } else {
          setErrorMsg('Failed to update template. Please try again.');
        }
      } else {
        // CREATE new template
        const created = await createEmailTemplate(payload);
        if (created) {
          onTemplateCreated?.(created);
          onClose();
        } else {
          setErrorMsg('Failed to save template. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Save template error:', err);
      setErrorMsg(err?.message || 'Error occurred while saving template.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewHtml = renderBrandedEmailHtml({
    subject: subject || 'Template Subject Preview',
    body: body || 'Template body preview...',
    senderName: 'TechnoKraft Consulting Team',
    recipientEmail: 'client@example.com',
    category: category === 'Custom' && customCategory ? customCategory : category,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isEditMode ? 'Edit Email Template' : 'Create Custom Email Template'}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A2558] to-[#4f46e5] text-white flex items-center justify-center shadow-xs">
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditMode ? `Edit Template: ${editTemplate!.name}` : 'Create Custom Email Template'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEditMode
                  ? 'Modify this template — changes apply immediately across the CRM'
                  : 'Craft a reusable B2B template with official TechnoKraft branding, header & footer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-white dark:bg-slate-700 text-[#0A2558] dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-[#0A2558] dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Branded Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {activeTab === 'edit' ? (
            <div className="space-y-4">
              {/* Template Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Template Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Enterprise Architecture Pitch"
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Category
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                    >
                      {PRESET_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="Custom">+ Custom Category</option>
                    </select>
                    {category === 'Custom' && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="New category..."
                        className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Appears in header banner and email subject
                  </span>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="TechnoKraft Services LLP — {{service}} Proposal for {{company_name}}"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 font-medium"
                />
              </div>

              {/* Variable Chips Bar */}
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                <div className="text-[11px] font-bold text-[#0A2558] dark:text-purple-300 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Click to Insert CRM Smart Variables into Body:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => insertVariable(v.key)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-[#0A2558] dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100/60 dark:hover:bg-purple-900/60 transition-colors shadow-2xs cursor-pointer"
                      title={`Insert {{${v.key}}}`}
                    >
                      <Plus className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                      <span>{`{{${v.key}}}`}</span>
                      <span className="text-[10px] text-slate-400 font-sans">({v.label})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Message Body Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Draft your template body content..."
                  className="w-full text-xs font-mono leading-relaxed p-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                />
              </div>
            </div>
          ) : (
            /* Live Branded Email Preview */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span>
                  Official TechnoKraft B2B Email Layout (with Header, Logo, Signature &amp; Footer)
                </span>
                <span className="font-semibold text-[#0A2558] dark:text-purple-300">
                  Inbox Preview
                </span>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-2 sm:p-4">
                <div
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {isEditMode
              ? 'Edits apply immediately — default templates can also be edited.'
              : 'Saved templates are immediately available across the CRM. Max 25 templates.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#0A2558] to-[#4f46e5] hover:opacity-95 rounded-lg shadow-xs transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEditMode ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  {isEditMode ? <Save className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isEditMode ? 'Save Changes' : 'Save Template to Library'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
