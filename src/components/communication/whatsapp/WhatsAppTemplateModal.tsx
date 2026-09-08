import React, { useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { MOCK_WHATSAPP_TEMPLATES } from '../../../data/mockCommunication';
import { WhatsAppConversation, WhatsAppTemplate } from '../../../types/communication';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation?: WhatsAppConversation | null;
  onSelectTemplate: (resolvedText: string) => void;
}

export const WhatsAppTemplateModal: React.FC<WhatsAppTemplateModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const resolveText = (tpl: WhatsAppTemplate) => {
    return tpl.text
      .replace(/{{contact_name}}/g, conversation?.contactName || 'Valued Client')
      .replace(/{{company_name}}/g, conversation?.companyName || 'Company')
      .replace(/{{service}}/g, conversation?.service || 'IT Services')
      .replace(/{{lead_id}}/g, conversation?.leadCode || 'LD-XXXX')
      .replace(/{{employee_name}}/g, conversation?.assignedEmployee || 'Rahul Patil');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="WhatsApp Quick Templates"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quick WhatsApp Templates
              </h3>
              <p className="text-[11px] text-slate-500">
                Personalized with {conversation?.contactName} ({conversation?.companyName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {MOCK_WHATSAPP_TEMPLATES.map((tpl) => {
            const resolved = resolveText(tpl);
            return (
              <div
                key={tpl.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#5B4DB7]/50 bg-slate-50/40 hover:bg-purple-50/20 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {tpl.name}
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                    {tpl.category}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                  {resolved}
                </p>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(resolved);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg shadow-xs transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Insert & Send</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
