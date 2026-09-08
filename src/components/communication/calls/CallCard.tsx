import React from 'react';
import { CallRecord } from '../../../types/calls';
import { CallStatusBadge } from './CallStatusBadge';
import { CallResultBadge } from './CallResultBadge';
import { CallTypeBadge } from './CallTypeBadge';
import { CallActionMenu } from './CallActionMenu';
import { Clock, Phone, Building2, User, Sparkles } from 'lucide-react';

interface CallCardProps {
  call: CallRecord;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onView: (call: CallRecord) => void;
  onEdit: (call: CallRecord) => void;
  onAddFollowUp: (call: CallRecord) => void;
  onScheduleMeeting: (call: CallRecord) => void;
  onOpenLead: (leadId: string) => void;
  onCreateOpportunity?: (call: CallRecord) => void;
}

export const CallCard: React.FC<CallCardProps> = ({
  call,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  onAddFollowUp,
  onScheduleMeeting,
  onOpenLead,
  onCreateOpportunity,
}) => {
  const isOpportunityEligible =
    call.result === 'Requirement Received' || call.result === 'Proposal Requested';

  return (
    <div
      className={`bg-white rounded-xl border transition-all p-4 space-y-3.5 shadow-2xs ${
        isSelected ? 'border-[#5B4DB7] ring-1 ring-[#5B4DB7] bg-purple-50/20' : 'border-slate-200/90'
      }`}
    >
      {/* Top Bar: Checkbox + Time + Status + Action Menu */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(call.id)}
            className="w-4 h-4 rounded text-[#5B4DB7] focus:ring-[#5B4DB7] border-slate-300 cursor-pointer"
            aria-label={`Select call with ${call.companyName}`}
          />
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {call.date} • {call.time}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <CallStatusBadge status={call.status} size="sm" />
          <CallActionMenu
            call={call}
            onView={onView}
            onEdit={onEdit}
            onAddFollowUp={onAddFollowUp}
            onScheduleMeeting={onScheduleMeeting}
            onOpenLead={onOpenLead}
            onCreateOpportunity={onCreateOpportunity}
          />
        </div>
      </div>

      {/* Company & Contact */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            onClick={() => onView(call)}
            className="text-sm font-bold text-slate-900 hover:text-[#5B4DB7] cursor-pointer flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{call.companyName}</span>
          </h4>
          <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0">
            {call.leadCode}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 pl-5.5">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800">{call.contactName}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{call.contactDesignation}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 pl-5.5">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-mono text-[11px]">{call.contactPhone}</span>
        </div>
      </div>

      {/* Call Direction, Duration & Result */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <CallTypeBadge type={call.type} />
          {call.duration && call.duration !== '0m 00s' && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{call.duration}</span>
            </span>
          )}
        </div>

        <CallResultBadge result={call.result} />
      </div>

      {/* Caller / Employee */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-100 text-[#5B4DB7] font-bold text-[10px] flex items-center justify-center">
            {call.employeeAvatar}
          </div>
          <span className="font-medium text-slate-700">{call.employeeName}</span>
        </div>

        {call.nextFollowUp && (
          <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            Next: {call.nextFollowUp.date}
          </span>
        )}
      </div>

      {/* Bottom Action Buttons (44px min-height for touch targets) */}
      <div className="pt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onView(call)}
          className="flex-1 min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>View</span>
        </button>

        <button
          type="button"
          onClick={() => onAddFollowUp(call)}
          className="flex-1 min-h-[44px] px-3 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>Follow-up</span>
        </button>

        {isOpportunityEligible && onCreateOpportunity && (
          <button
            type="button"
            onClick={() => onCreateOpportunity(call)}
            className="min-h-[44px] px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
            title="Create Opportunity"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Opportunity</span>
          </button>
        )}
      </div>
    </div>
  );
};
