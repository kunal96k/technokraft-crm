import React from 'react';
import {
  X,
  FileText,
  Building2,
  User,
  Calendar,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Download,
  Send,
  RotateCcw,
  Clock,
  Briefcase,
  Layers,
} from 'lucide-react';
import { ProposalRecord, ProposalStatus } from '../../types/opportunities';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { formatCurrencyINR } from '../../data/mockOpportunities';

interface ProposalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalRecord | null;
  onStatusChange?: (id: string, newStatus: ProposalStatus) => void;
  onNotice?: (msg: string) => void;
}

export const ProposalDetailsModal: React.FC<ProposalDetailsModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onStatusChange,
  onNotice,
}) => {
  if (!isOpen || !proposal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5B4DB7] border border-purple-100 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#5B4DB7]">
                  {proposal.proposalCode}
                </span>
                <ProposalStatusBadge status={proposal.status} size="xs" />
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {proposal.companyName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNotice?.(`Downloading ${proposal.proposalCode}.pdf...`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onNotice?.(`Re-sending ${proposal.proposalCode} to ${proposal.contactEmail || proposal.contactName}...`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>Send / Resend</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {proposal.status !== 'Accepted' && (
              <button
                type="button"
                onClick={() => {
                  onStatusChange?.(proposal.id, 'Accepted');
                  onNotice?.(`Proposal ${proposal.proposalCode} marked Accepted!`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Accepted</span>
              </button>
            )}
            {proposal.status !== 'Rejected' && (
              <button
                type="button"
                onClick={() => {
                  onStatusChange?.(proposal.id, 'Rejected');
                  onNotice?.(`Proposal ${proposal.proposalCode} marked Rejected`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Mark Rejected</span>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {/* Top Key Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Opportunity</div>
              <div className="font-bold text-slate-900 mt-0.5 truncate">{proposal.opportunityName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Commercial Amount</div>
              <div className="font-mono font-bold text-slate-900 mt-0.5 text-sm">
                {formatCurrencyINR(proposal.amount)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Valid Until</div>
              <div className="font-semibold text-slate-800 mt-0.5">{proposal.validUntil}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Sales Owner</div>
              <div className="font-semibold text-slate-800 mt-0.5">{proposal.ownerName}</div>
            </div>
          </div>

          {/* Section 1: Proposal Summary */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span>Proposal Executive Summary</span>
            </h4>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
              {proposal.summary}
            </div>
          </div>

          {/* Section 2: Commercial Details */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span>Commercial Terms & Milestone Schedule</span>
            </h4>

            {proposal.commercialDetails?.milestones && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Milestone Deliverable</th>
                      <th className="py-2 px-3 text-center">Share</th>
                      <th className="py-2 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {proposal.commercialDetails.milestones.map((ms, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-medium text-slate-800">{ms.title}</td>
                        <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600">
                          {ms.percentage}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrencyINR(ms.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block">Payment Terms:</span>
                <span className="text-slate-800 font-medium">
                  {proposal.commercialDetails?.paymentTerms || 'Net 15 days upon milestone sign-off'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Taxes & GST:</span>
                <span className="text-slate-800 font-medium">
                  {proposal.commercialDetails?.taxes || '18% GST extra as applicable'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Timeline */}
          {proposal.timelineDescription && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5B4DB7]" />
                <span>Project Timeline & Delivery Horizon</span>
              </h4>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
                {proposal.timelineDescription}
              </div>
            </div>
          )}

          {/* Section 4: Activity History */}
          {proposal.activityHistory && proposal.activityHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#5B4DB7]" />
                <span>Proposal Transmission Log & History</span>
              </h4>
              <div className="space-y-2">
                {proposal.activityHistory.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <p className="text-slate-800 font-medium">{act.description}</p>
                      <span className="text-[10px] text-slate-400">By: {act.user}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {act.date} • {act.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
