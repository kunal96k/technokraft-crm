import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { Lead } from '../../types/leads';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadScoreBadge } from './LeadScoreBadge';
import { LeadPriorityBadge } from './LeadPriorityBadge';
import { LeadActionMenu } from './LeadActionMenu';

interface LeadMobileCardProps {
  lead: Lead;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onAction?: (action: string, lead: Lead) => void;
}

export const LeadMobileCard: React.FC<LeadMobileCardProps> = ({
  lead,
  isSelected,
  onToggleSelect,
  onAction,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/leads/${lead.id}`)}
      className={`p-4 rounded-xl border bg-white transition-all shadow-2xs cursor-pointer ${
        isSelected
          ? 'border-[#5B4DB7] ring-1 ring-[#5B4DB7] bg-purple-50/20'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Header: Checkbox + Lead ID + Action Menu */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleSelect(lead.id)}
            className="w-4 h-4 rounded border-slate-300 text-[#5B4DB7] focus:ring-[#5B4DB7] cursor-pointer"
            aria-label={`Select ${lead.leadCode}`}
          />
          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70">
            {lead.leadCode}
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <LeadPriorityBadge priority={lead.priority} />
          <LeadActionMenu lead={lead} onAction={onAction} />
        </div>
      </div>

      {/* Company Name & Website */}
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#5B4DB7] leading-snug">
          {lead.company.name}
        </h3>
        {lead.company.website && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            <Globe className="w-3 h-3" />
            <span>{lead.company.website}</span>
          </div>
        )}
      </div>

      {/* Contact Person & Designation */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 mb-3 text-xs">
        <div className="font-semibold text-slate-800">{lead.contact.name}</div>
        <div className="text-[11px] text-slate-500">{lead.contact.designation}</div>
      </div>

      {/* Service Tag */}
      <div className="mb-3">
        <span className="inline-block text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200/70">
          {lead.service}
        </span>
      </div>

      {/* Status & Score */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <LeadStatusBadge status={lead.status} />
        <LeadScoreBadge score={lead.score} showLabel={false} />
      </div>

      {/* Assigned & Follow-up Details */}
      <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Assigned:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-purple-100 text-[#5B4DB7] text-[9px] font-bold flex items-center justify-center">
              {lead.assignedEmployee.avatar}
            </div>
            <span className="font-medium text-slate-800">{lead.assignedEmployee.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Next Follow-up:</span>
          {lead.nextFollowUp ? (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                lead.nextFollowUp.isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-700'
              }`}
            >
              {lead.nextFollowUp.isOverdue ? (
                <AlertCircle className="w-3 h-3 text-rose-500" />
              ) : (
                <Calendar className="w-3 h-3 text-slate-400" />
              )}
              {lead.nextFollowUp.displayString}
            </span>
          ) : (
            <span className="text-slate-400 text-[11px] italic">None</span>
          )}
        </div>
      </div>

      {/* Touch-Friendly Action Button */}
      <div className="mt-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(`/leads/${lead.id}`)}
          className="w-full py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-[#5B4DB7] border border-slate-200 hover:border-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>View Lead Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
