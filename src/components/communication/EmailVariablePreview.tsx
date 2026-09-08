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
    { tag: '{{contact_name}}', label: 'Contact', value: lead?.contact?.name || 'Rahul Sharma' },
    { tag: '{{company_name}}', label: 'Company', value: lead?.company?.name || 'ABC Technologies Pvt Ltd' },
    { tag: '{{designation}}', label: 'Designation', value: lead?.contact?.designation || 'CTO' },
    { tag: '{{service}}', label: 'Service', value: lead?.service || 'Custom Software Development' },
    { tag: '{{lead_id}}', label: 'Lead ID', value: lead?.leadCode || 'LD-2026-00125' },
    { tag: '{{requirement}}', label: 'Requirement', value: lead?.requirement?.summary ? lead.requirement.summary.slice(0, 45) + '...' : 'Multi-tenant cloud billing portal...' },
    { tag: '{{employee_name}}', label: 'Sender', value: lead?.assignedEmployee?.name || 'Rahul Patil' },
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
    <div className={`p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-2 text-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-[#5B4DB7]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CRM Dynamic Variables</span>
        </div>
        {lead ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>Resolved from {lead.leadCode}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
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
            className="flex items-center justify-between p-1.5 rounded-md bg-white border border-purple-200/70 hover:border-purple-400 text-left transition-colors group"
            title={`Click to insert ${item.tag}`}
          >
            <div className="min-w-0 pr-1">
              <span className="text-[10px] font-mono text-purple-600 block truncate">
                {item.tag}
              </span>
              <span className="text-[11px] font-medium text-slate-800 block truncate">
                {item.value}
              </span>
            </div>
            <div className="text-slate-300 group-hover:text-[#5B4DB7] flex-shrink-0">
              {copiedVar === item.tag ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-500">
        Click any variable chip to insert into subject or message body.
      </p>
    </div>
  );
};
