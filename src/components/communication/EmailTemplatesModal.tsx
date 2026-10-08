import React, { useState, useEffect } from 'react';
import { X, FileText, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { EmailTemplate } from '../../types/communication';
import { fetchEmailTemplates } from '../../services/emailService';

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
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchEmailTemplates()
        .then((data) => {
          if (data && data.length > 0) {
            setTemplates(data);
            setSelectedTemplate(data[0]);
          } else {
            setTemplates([]);
            setSelectedTemplate(null);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!selectedTemplate) return;
    navigator.clipboard?.writeText(selectedTemplate.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Email Templates Library"
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-400 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Business Email Templates
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Standardized B2B communication templates with CRM variable tags
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-column layout: template list on left, template preview on right */}
        <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* List */}
          <div className="p-3 overflow-y-auto max-h-[300px] md:max-h-none space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1 flex items-center justify-between">
              <span>Available Templates ({templates.length})</span>
              {loading && <Loader2 className="w-3 h-3 animate-spin text-[#5B4DB7]" />}
            </div>
            {templates.length === 0 && !loading && (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No templates found in database.
              </div>
            )}
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800/60'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="truncate pr-1">
                    <div className="truncate">{tpl.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{tpl.category}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-shrink-0">
                    {tpl.variables.length} vars
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="md:col-span-2 p-5 overflow-y-auto flex flex-col justify-between space-y-4">
            {selectedTemplate ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedTemplate.name}
                  </h4>
                  <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded-full">
                    {selectedTemplate.category}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Subject Template
                  </span>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                    {selectedTemplate.subject}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Body Template
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[11px] text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy Body'}</span>
                    </button>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {selectedTemplate.body}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    Template Placeholders
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.variables.map((v) => (
                      <span
                        key={v}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No template selected or available.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
              {onSelectTemplateForCompose && selectedTemplate && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplateForCompose(selectedTemplate);
                    onClose();
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg shadow-xs cursor-pointer transition-colors"
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
