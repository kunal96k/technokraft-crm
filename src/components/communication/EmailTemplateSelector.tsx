import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { EmailTemplate } from '../../types/communication';
import { fetchEmailTemplates } from '../../services/emailService';

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
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    fetchEmailTemplates().then((data) => {
      if (data && data.length > 0) {
        setTemplates(data);
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = templates.find((t) => t.id === e.target.value);
    if (found) {
      onSelectTemplate(found);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="email-template-select"
          className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
          <span>Email Template</span>
        </label>
        {selectedTemplate && (
          <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
            Category: {selectedTemplate.category}
          </span>
        )}
      </div>

      <div className="relative">
        <select
          id="email-template-select"
          value={selectedTemplateId}
          onChange={handleChange}
          className="w-full appearance-none text-xs font-medium px-3.5 py-2.5 bg-white dark:bg-slate-850 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 pr-9 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 dark:focus:ring-purple-400/40 focus:border-[#5B4DB7] dark:focus:border-purple-500 cursor-pointer"
        >
          <option value="">-- Choose an Email Template --</option>
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name} ({tpl.category})
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};
