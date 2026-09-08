import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  CalendarPlus,
  Building,
  User,
  Phone,
  Briefcase,
  ShieldCheck,
  Clock,
  Award,
  Globe,
  Plus,
} from 'lucide-react';
import { WhatsAppConversation } from '../../../types/communication';

interface LeadInfoPanelProps {
  conversation: WhatsAppConversation | null;
  onCloseMobile?: () => void;
  className?: string;
}

export const LeadInfoPanel: React.FC<LeadInfoPanelProps> = ({
  conversation,
  onCloseMobile,
  className = '',
}) => {
  const navigate = useNavigate();

  if (!conversation) return null;

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs text-slate-800 ${className}`}
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-[#5B4DB7]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            CRM Lead Summary
          </h3>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close lead panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Company & Score */}
        <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
              {conversation.leadCode}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#5B4DB7]">
              <Award className="w-3.5 h-3.5" />
              <span>Score: {conversation.leadScore}/100</span>
            </div>
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            {conversation.companyName}
          </h4>
          {conversation.companyWebsite && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{conversation.companyWebsite}</span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contact Information
          </div>
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
            <div className="flex items-start gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{conversation.contactName}</div>
                <div className="text-[11px] text-slate-500">{conversation.contactDesignation}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
              <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="font-mono text-slate-700">{conversation.contactPhone}</span>
            </div>
          </div>
        </div>

        {/* Pipeline & Assignment */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pipeline & Owner
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-0.5">Stage</span>
              <span className="font-bold text-slate-800 text-xs">{conversation.leadStatus}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-0.5">Assigned To</span>
              <span className="font-bold text-slate-800 text-xs truncate block">
                {conversation.assignedEmployee}
              </span>
            </div>
          </div>
        </div>

        {/* Next Follow-up Banner */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Next Scheduled Follow-up</span>
          </div>
          <p className="text-xs font-bold text-amber-900">
            {conversation.nextFollowUp}
          </p>
          <p className="text-[10px] text-amber-700">
            Automated calendar reminder dispatched to {conversation.assignedEmployee}.
          </p>
        </div>

        {/* Primary Connected CRM Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => navigate(`/leads/${conversation.leadId}`)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg shadow-xs transition-colors"
          >
            <span>View Full Lead Record</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/follow-ups')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
