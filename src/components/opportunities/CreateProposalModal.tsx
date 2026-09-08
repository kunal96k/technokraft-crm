import React, { useState } from 'react';
import { X, FileText, Plus, IndianRupee } from 'lucide-react';
import { OpportunityRecord, ProposalRecord, OpportunityService } from '../../types/opportunities';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityRecord | null;
  onSaveProposal: (proposal: ProposalRecord) => void;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onSaveProposal,
}) => {
  if (!isOpen || !opportunity) return null;

  const [companyName, setCompanyName] = useState(opportunity.companyName);
  const [contactName, setContactName] = useState(opportunity.contactName);
  const [contactEmail, setContactEmail] = useState(
    opportunity.contactEmail || 'contact@client.com'
  );
  const [amount, setAmount] = useState<string>(String(opportunity.estimatedValue));
  const [validUntil, setValidUntil] = useState<string>('2026-09-30');
  const [summary, setSummary] = useState(
    opportunity.requirement.summary ||
      `TechnoKraft Services technical and commercial proposal for ${opportunity.name}.`
  );
  const [timelineDescription, setTimelineDescription] = useState(
    opportunity.requirement.timeline || '12 Weeks development schedule.'
  );
  const [paymentTerms, setPaymentTerms] = useState(
    'Net 15 days upon milestone completion and UAT sign-off.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || opportunity.estimatedValue;

    const newProp: ProposalRecord = {
      id: `prop-${Date.now()}`,
      proposalCode: `PR-2026-00${Math.floor(100 + Math.random() * 900)}`,
      opportunityId: opportunity.id,
      opportunityName: opportunity.name,
      leadCode: opportunity.leadCode,
      companyName,
      contactName,
      contactEmail,
      service: opportunity.service,
      amount: numAmount,
      createdDate: '07 Sep 2026',
      sentDate: '07 Sep 2026',
      validUntil,
      status: 'Sent',
      ownerName: opportunity.owner.name,
      summary,
      commercialDetails: {
        milestones: [
          { title: 'Project Kickoff & Technical Architecture', percentage: 30, amount: Math.round(numAmount * 0.3) },
          { title: 'Alpha Milestone & Core Modules Build', percentage: 40, amount: Math.round(numAmount * 0.4) },
          { title: 'Production UAT, Cloud Cutover & Handover', percentage: 30, amount: Math.round(numAmount * 0.3) },
        ],
        paymentTerms,
        taxes: '18% GST extra as applicable',
      },
      timelineDescription,
      activityHistory: [
        {
          date: '07 Sep 2026',
          time: '03:30 PM',
          description: `Commercial Proposal generated for ${opportunity.name} at ₹${numAmount.toLocaleString('en-IN')}.`,
          user: opportunity.owner.name,
        },
      ],
    };

    onSaveProposal(newProp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Proposal</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Generate formal commercial quotation for {opportunity.companyName}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-700 dark:text-slate-300 max-h-[80vh] overflow-y-auto">
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100/80 dark:border-indigo-900/50 space-y-1">
            <div className="text-[11px] text-[#5B4DB7] dark:text-purple-300 font-semibold">Related Opportunity:</div>
            <div className="font-bold text-slate-900 dark:text-white">{opportunity.name}</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              Service: <strong>{opportunity.service}</strong> • Lead: <strong>{opportunity.leadCode || 'N/A'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Commercial Amount (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Valid Until Date</label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Executive Summary</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Project Timeline</label>
            <input
              type="text"
              value={timelineDescription}
              onChange={(e) => setTimelineDescription(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment & Milestone Terms</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate & Dispatch Proposal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
