import React, { useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { WhatsAppConversation, WhatsAppTemplate } from '../../../types/communication';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation?: WhatsAppConversation | null;
  onSelectTemplate: (resolvedText: string) => void;
  templates?: WhatsAppTemplate[];
}

export const WhatsAppTemplateModal: React.FC<WhatsAppTemplateModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onSelectTemplate,
  templates = [],
}) => {
  if (!isOpen) return null;

  const resolveText = (tpl: WhatsAppTemplate) => {
    return tpl.text
      .replace(/{{contact_name}}/g, conversation?.contactName || 'Valued Client')
      .replace(/{{company_name}}/g, conversation?.companyName || 'Company')
      .replace(/{{service}}/g, conversation?.service || 'IT Services')
      .replace(/{{lead_id}}/g, conversation?.leadCode || 'LD-XXXX')
      .replace(/{{employee_name}}/g, conversation?.assignedEmployee || 'Kunal Patil');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="WhatsApp Quick Templates"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-400 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Quick WhatsApp Templates
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personalized with {conversation?.contactName} ({conversation?.companyName})
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

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {templates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No quick WhatsApp templates available.
            </div>
          ) : (
            templates.map((tpl) => {
              const resolved = resolveText(tpl);
              return (
                <div
                  key={tpl.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#5B4DB7]/50 dark:hover:border-purple-500/50 bg-slate-50/40 dark:bg-slate-950/50 hover:bg-purple-50/20 dark:hover:bg-purple-950/30 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded-full">
                      {tpl.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {resolved}
                  </p>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTemplate(resolved);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Insert & Send</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
