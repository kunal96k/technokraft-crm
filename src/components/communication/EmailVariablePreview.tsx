import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';
import { Lead } from '../../types/leads';

interface EmailVariablePreviewProps {
  lead?: Lead | null;
  onInsertVariable?: (variableTag: string) => void;
  className?: string;
}

export const EmailVariablePreview: React.FC<EmailVariablePreviewProps> = ({
  lead,
  onInsertVariable,
  className = '',
}) => {
  const [copiedVar, setCopiedVar] = React.useState<string | null>(null);

  const variables = [
    { tag: '{{contact_name}}', label: 'Contact', value: lead?.contact?.name || (lead ? '—' : 'Select a lead') },
    { tag: '{{company_name}}', label: 'Company', value: lead?.company?.name || (lead ? '—' : 'Select a lead') },
    { tag: '{{designation}}', label: 'Designation', value: lead?.contact?.designation || (lead ? '—' : 'Select a lead') },
    { tag: '{{service}}', label: 'Service', value: lead?.service || (lead ? '—' : 'Select a lead') },
    { tag: '{{lead_id}}', label: 'Lead ID', value: lead?.leadCode || (lead?.id ? `LD-${lead.id}` : 'Select a lead') },
    { tag: '{{requirement}}', label: 'Requirement', value: lead?.requirement?.summary ? (lead.requirement.summary.length > 42 ? `${lead.requirement.summary.slice(0, 42)}...` : lead.requirement.summary) : (lead ? 'Custom software development' : 'Select a lead') },
    { tag: '{{recipient_email}}', label: 'Email', value: lead?.contact?.email || (lead ? '—' : 'Select a lead') },
    { tag: '{{employee_name}}', label: 'Sender', value: lead?.assignedEmployee?.name || 'CRM User' },
  ];

  const handleCopy = (tag: string) => {
    if (onInsertVariable) {
      onInsertVariable(tag);
    }
    navigator.clipboard?.writeText(tag);
    setCopiedVar(tag);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  return (
    <div className={`p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50 rounded-xl space-y-2 text-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-[#5B4DB7] dark:text-purple-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CRM Dynamic Variables</span>
        </div>
        {lead ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle className="w-3 h-3" />
            <span>Resolved from {lead.leadCode}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/60">
            <AlertTriangle className="w-3 h-3" />
            <span>Select a lead to resolve</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
        {variables.map((item) => (
          <button
            key={item.tag}
            type="button"
            onClick={() => handleCopy(item.tag)}
            className="flex items-center justify-between p-1.5 rounded-md bg-white dark:bg-slate-900 border border-purple-200/70 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-600 text-left transition-colors group cursor-pointer"
            title={`Click to insert ${item.tag}`}
          >
            <div className="min-w-0 pr-1">
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 block truncate font-semibold">
                {item.tag}
              </span>
              <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 block truncate">
                {item.value}
              </span>
            </div>
            <div className="text-slate-300 dark:text-slate-600 group-hover:text-[#5B4DB7] dark:group-hover:text-purple-400 flex-shrink-0">
              {copiedVar === item.tag ? (
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">
        Click any variable chip to insert into subject or message body.
      </p>
    </div>
  );
};
