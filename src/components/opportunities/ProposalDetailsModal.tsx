import React, { useState } from 'react';
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
  Trash2,
  Mail,
  Phone,
  Hash,
  Copy,
  ExternalLink,
  ShieldCheck,
  Printer,
  Server,
  Wrench,
  Edit3,
} from 'lucide-react';
import { ProposalRecord, ProposalStatus } from '../../types/opportunities';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { formatCurrencyINR } from '../../utils/currencyFormatters';
import {
  generateProposalPDF,
  printProposalDocument,
  resolveMilestones,
  resolveHostingSection,
  resolveServicesSection,
} from '../../utils/proposalPdfGenerator';
import { SendProposalEmailModal } from './SendProposalEmailModal';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface ProposalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalRecord | null;
  onStatusChange?: (id: string, newStatus: ProposalStatus) => void;
  onEdit?: (proposal: ProposalRecord) => void;
  onDelete?: (id: string) => void;
  onNotice?: (msg: string) => void;
}

export const ProposalDetailsModal: React.FC<ProposalDetailsModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onStatusChange,
  onEdit,
  onDelete,
  onNotice,
}) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen || !proposal) return null;

  const handleDownloadPDF = () => {
    generateProposalPDF(proposal);
    onNotice?.(`Quotation ${proposal.proposalCode}.pdf downloaded successfully.`);
  };

  const handlePrint = () => {
    printProposalDocument(proposal);
  };

  const handleCopyEmail = (emailText: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(emailText);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      onNotice?.('Recipient email address copied to clipboard');
    }
  };

  const handleDeleteConfirm = () => {
    onDelete?.(proposal.id);
    setIsDeleteConfirmOpen(false);
    onNotice?.(`Proposal ${proposal.proposalCode} deleted.`);
    onClose();
  };

  const clientEmail = proposal.contactEmail || 'Not Specified';
  const clientName = proposal.contactName || 'Primary Contact';
  const clientPhone = proposal.contactPhone;

  const milestones = resolveMilestones(proposal);
  const resolvedHosting = resolveHostingSection(proposal);
  const hostingEnabled = Boolean(resolvedHosting);
  const hostingSubtotal = resolvedHosting ? resolvedHosting.subtotal : 0;
  const resolvedServices = resolveServicesSection(proposal);
  const servicesEnabled = Boolean(resolvedServices);
  const servicesSubtotal = resolvedServices ? resolvedServices.subtotal : 0;
  const grandTotal = (proposal.amount || 0) + hostingSubtotal + servicesSubtotal;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
        <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 flex items-center justify-center font-bold shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black tracking-wide px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {proposal.proposalCode}
                  </span>
                  <ProposalStatusBadge status={proposal.status} size="xs" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mt-1">
                  {proposal.companyName}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5B4DB7] hover:bg-[#4D3FA5] text-white rounded-lg font-semibold cursor-pointer shadow-xs transition-colors"
                title="Download formatted Proposal PDF document"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-semibold cursor-pointer shadow-2xs transition-colors"
                title="Send quotation via email to client"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Send / Resend Email</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-semibold cursor-pointer shadow-2xs transition-colors"
                title="Browser print preview"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print</span>
              </button>

              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(proposal);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg font-semibold cursor-pointer shadow-2xs transition-colors"
                  title="Edit deliverables, milestones, hosting and quotation scope"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Proposal</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {proposal.status !== 'Accepted' && (
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange?.(proposal.id, 'Accepted');
                    onNotice?.(`Proposal ${proposal.proposalCode} marked Accepted!`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer shadow-2xs transition-colors"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Mark Rejected</span>
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-lg font-semibold cursor-pointer transition-colors"
                  title="Delete proposal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
            {/* 2-Column Prominent Info Cards (Client Target & Commercial Details) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Box: Client & Recipient Information */}
              <div className="p-4 bg-purple-50/50 dark:bg-slate-950/70 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-purple-100/80 dark:border-purple-900/30">
                  <span className="text-[10.5px] uppercase font-black tracking-wider text-[#5B4DB7] dark:text-purple-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Client Contact & Email Details</span>
                  </span>
                  {proposal.leadCode && (
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      {proposal.leadCode}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      Target Company
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>{proposal.companyName}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      Attention / Contact Person
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {clientName}
                    </span>
                  </div>

                  {/* Recipient Email with One-Click Copy */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      Direct Email Address (Delivery Destination)
                    </span>
                    <div className="mt-1 flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-purple-200/70 dark:border-purple-800/60">
                      <Mail className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400 shrink-0" />
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white flex-1 truncate">
                        {proposal.contactEmail || 'No email specified'}
                      </span>
                      {proposal.contactEmail && (
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(proposal.contactEmail || '')}
                          className="p-1 text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-300 rounded cursor-pointer transition-colors"
                          title="Copy email to clipboard"
                        >
                          {copiedEmail ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {clientPhone && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                        Contact Phone
                      </span>
                      <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{clientPhone}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Box: Commercial & Project Overview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#5B4DB7]" />
                    <span>Commercial & Project Scope</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Date: {proposal.sentDate || proposal.createdDate || 'Today'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      Opportunity / Deal Name
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {proposal.opportunityName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                        Domain Service
                      </span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                        {proposal.service}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                        Sales Representative
                      </span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                        {proposal.ownerName}
                      </span>
                    </div>
                  </div>

                  {/* Highlighted Commercial Amount */}
                  <div className="p-2.5 rounded-xl bg-purple-100/60 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wide text-purple-900 dark:text-purple-300 block">
                        Commercial Quotation Value
                      </span>
                      <span className="text-[10px] text-purple-700 dark:text-purple-400">
                        {hostingEnabled || servicesEnabled ? 'Grand Total (All Sections)' : 'Fixed Scope Milestones'}
                      </span>
                    </div>
                    <div className="font-mono text-base font-black text-[#5B4DB7] dark:text-purple-200">
                      {formatCurrencyINR(grandTotal)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Proposal Summary */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                <span>Proposal Executive Scope</span>
              </h4>
              <div className="p-3.5 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                {proposal.summary || 'Custom enterprise solution architecture and delivery.'}
              </div>
            </div>

            {/* Section 2: Commercial Deliverables & Milestones */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                <span>Commercial Deliverables & Milestone Schedule</span>
              </h4>

              {proposal.commercialDetails?.milestones && proposal.commercialDetails.milestones.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3.5">#</th>
                        <th className="py-2.5 px-3">Milestone Deliverable</th>
                        <th className="py-2.5 px-3 text-center">Milestone Schedule</th>
                        <th className="py-2.5 px-3.5 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {milestones.map((ms, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3.5 text-slate-400 font-bold font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {ms.title}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-400">
                            Phase {idx + 1} ({ms.percentage}%)
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrencyINR(ms.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                  Fixed Scope Software Development Deliverables
                </span>
                <div className="text-right flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold text-[10px] uppercase">
                    Dev Milestones Subtotal:
                  </span>
                  <span className="font-mono font-black text-sm text-[#5B4DB7] dark:text-purple-300">
                    {formatCurrencyINR(proposal.amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Cloud Infrastructure & Hosting (Optional) */}
            {hostingEnabled && resolvedHosting && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Cloud Infrastructure & Hosting (AWS EC2 / Server / Domain)</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sky-50 dark:bg-sky-950/50 text-[10px] uppercase font-bold text-sky-800 dark:text-sky-300 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3.5">#</th>
                        <th className="py-2.5 px-3">Resource / Description</th>
                        <th className="py-2.5 px-3 text-center">Provider</th>
                        <th className="py-2.5 px-3 text-center">Cycle</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3.5 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {resolvedHosting.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3.5 text-slate-400 font-bold font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {item.description}
                            {item.notes && <div className="text-[10px] text-slate-500 font-normal">{item.notes}</div>}
                          </td>
                          <td className="py-2 px-3 text-center font-medium text-slate-600 dark:text-slate-400">{item.provider || 'AWS'}</td>
                          <td className="py-2 px-3 text-center font-medium capitalize text-slate-600 dark:text-slate-400">{item.billingCycle}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrencyINR(item.unitCost)}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{item.quantity}</td>
                          <td className="py-2 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatCurrencyINR(item.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-[11px] text-slate-500 italic">{resolvedHosting.note || 'Billed separately per actual resource usage schedule.'}</span>
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
                    Hosting Subtotal: {formatCurrencyINR(hostingSubtotal)}
                  </span>
                </div>
              </div>
            )}

            {/* Section 4: Managed Services & AMC (Optional) */}
            {servicesEnabled && resolvedServices && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Managed Services & Annual Maintenance (AMC / SLA)</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-emerald-50 dark:bg-emerald-950/50 text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3.5">#</th>
                        <th className="py-2.5 px-3">Service Scope / SLA Description</th>
                        <th className="py-2.5 px-3 text-center">Cycle</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3.5 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {resolvedServices.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3.5 text-slate-400 font-bold font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {item.description}
                            {item.notes && <div className="text-[10px] text-slate-500 font-normal">{item.notes}</div>}
                          </td>
                          <td className="py-2 px-3 text-center font-medium capitalize text-slate-600 dark:text-slate-400">{item.billingCycle}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrencyINR(item.unitCost)}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{item.quantity}</td>
                          <td className="py-2 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatCurrencyINR(item.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-[11px] text-slate-500 italic">{resolvedServices.note || 'Quoted as optional ongoing support package.'}</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    Managed Services Subtotal: {formatCurrencyINR(servicesSubtotal)}
                  </span>
                </div>
              </div>
            )}

            {/* Grand Total Summary Card if multi-section */}
            {(hostingEnabled || servicesEnabled) && (
              <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/40 dark:from-purple-950/30 dark:to-slate-900/40 rounded-xl border border-purple-200 dark:border-purple-900/50 space-y-2">
                <div className="text-[11px] font-bold text-[#5B4DB7] dark:text-purple-300 uppercase tracking-wide">
                  Complete Commercial Breakdown
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/40">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Development Scope:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrencyINR(proposal.amount)}</span>
                  </div>
                  {hostingEnabled && (
                    <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-sky-100 dark:border-sky-900/40">
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 uppercase font-semibold block">Cloud Infrastructure:</span>
                      <span className="font-mono font-bold text-sky-700 dark:text-sky-300">{formatCurrencyINR(hostingSubtotal)}</span>
                    </div>
                  )}
                  {servicesEnabled && (
                    <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold block">Managed Services:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{formatCurrencyINR(servicesSubtotal)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-purple-200 dark:border-purple-800">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Grand Commercial Total:</span>
                  <span className="font-mono font-black text-sm text-[#5B4DB7] dark:text-purple-200">{formatCurrencyINR(grandTotal)}</span>
                </div>
              </div>
            )}

            {/* Section 3: Timeline */}
            {proposal.timelineDescription && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                  <span>Project Timeline & Delivery Horizon</span>
                </h4>
                <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  {proposal.timelineDescription}
                </div>
              </div>
            )}

            {/* Section 4: Transmission History */}
            {proposal.activityHistory && proposal.activityHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                  <span>Proposal Transmission Log & History</span>
                </h4>
                <div className="space-y-2">
                  {proposal.activityHistory.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          {act.description}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          By: {act.user}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {act.date} • {act.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">
                Target: <strong className="text-slate-700 dark:text-slate-300">{proposal.companyName}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Send Email Modal */}
      <SendProposalEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        proposal={proposal}
        onSentSuccess={(pId, recipient) => {
          onStatusChange?.(pId, 'Sent');
          onNotice?.(`Proposal ${proposal.proposalCode} emailed to ${recipient}`);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Proposal"
        message={`Are you sure you want to delete proposal quotation ${proposal.proposalCode}? This action cannot be undone.`}
        confirmLabel="Delete Proposal"
        cancelLabel="Keep Proposal"
        variant="danger"
        iconType="trash"
        itemDetails={[
          { label: 'Proposal Code', value: proposal.proposalCode },
          { label: 'Company', value: proposal.companyName },
          { label: 'Value', value: formatCurrencyINR(proposal.amount) },
          { label: 'Status', value: proposal.status },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
};
