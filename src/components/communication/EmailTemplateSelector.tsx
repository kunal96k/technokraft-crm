import React from 'react';
import { Sparkles, FileText, ChevronDown } from 'lucide-react';
import { EmailTemplate } from '../../types/communication';
import { MOCK_EMAIL_TEMPLATES } from '../../data/mockCommunication';

interface EmailTemplateSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (template: EmailTemplate) => void;
  className?: string;
}

export const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = MOCK_EMAIL_TEMPLATES.find((t) => t.id === e.target.value);
    if (found) {
      onSelectTemplate(found);
    }
  };

  const selectedTemplate = MOCK_EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="email-template-select"
          className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5B4DB7]" />
          <span>Email Template</span>
        </label>
        {selectedTemplate && (
          <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            Category: {selectedTemplate.category}
          </span>
        )}
      </div>

      <div className="relative">
        <select
          id="email-template-select"
          value={selectedTemplateId}
          onChange={handleChange}
          className="w-full appearance-none text-xs font-medium px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 pr-9 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7]"
        >
          <option value="">-- Choose an Email Template --</option>
          {MOCK_EMAIL_TEMPLATES.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name} ({tpl.category})
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};
