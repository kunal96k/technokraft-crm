import React, { useState } from 'react';
import { X, FileText, Sparkles, Copy, Check } from 'lucide-react';
import { MOCK_EMAIL_TEMPLATES } from '../../data/mockCommunication';
import { EmailTemplate } from '../../types/communication';

interface EmailTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplateForCompose?: (template: EmailTemplate) => void;
}

export const EmailTemplatesModal: React.FC<EmailTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplateForCompose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(MOCK_EMAIL_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(selectedTemplate.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Email Templates Library"
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Business Email Templates
              </h3>
              <p className="text-[11px] text-slate-500">
                Standardized B2B communication templates with CRM variable tags
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-column layout: template list on left, template preview on right */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* List */}
          <div className="p-3 overflow-y-auto max-h-[300px] md:max-h-none space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Available Templates ({MOCK_EMAIL_TEMPLATES.length})
            </div>
            {MOCK_EMAIL_TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-50 text-[#5B4DB7] font-semibold border border-purple-200'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="truncate pr-1">
                    <div className="truncate">{tpl.name}</div>
                    <div className="text-[10px] text-slate-400">{tpl.category}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">
                    {tpl.variables.length} vars
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="md:col-span-2 p-5 overflow-y-auto flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedTemplate.name}
                </h4>
                <span className="text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                  {selectedTemplate.category}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Subject Template
                </span>
                <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-800 border border-slate-200">
                  {selectedTemplate.subject}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Body Template
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[11px] text-[#5B4DB7] hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Body'}</span>
                  </button>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs font-mono text-slate-800 border border-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selectedTemplate.body}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Template Placeholders
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.variables.map((v) => (
                    <span
                      key={v}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
              {onSelectTemplateForCompose && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplateForCompose(selectedTemplate);
                    onClose();
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg shadow-xs"
                >
                  Use Template in Composer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
