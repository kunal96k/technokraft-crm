import React, { useState } from 'react';
import { CallRecord } from '../../../types/calls';
import { Lead } from '../../../types/leads';
import { X, Sparkles, Building2, User, IndianRupee, Calendar, CheckCircle2 } from 'lucide-react';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: CallRecord;
  onSuccess: (opportunityName: string) => void;
}

export const CreateOpportunityModal: React.FC<CreateOpportunityModalProps> = ({
  isOpen,
  onClose,
  call,
  onSuccess,
}) => {
  const [opportunityName, setOpportunityName] = useState(
    `${call.companyName} — ${call.service || 'Enterprise Project'}`
  );
  const [dealValue, setDealValue] = useState('₹45,00,000');
  const [stage, setStage] = useState('Requirement Analysis');
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-10-15');
  const [owner, setOwner] = useState(call.employeeName || 'Kunal Patil');
  const [opportunityNotes, setOpportunityNotes] = useState(call.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(opportunityName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-purple-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-purple-50/70 dark:bg-slate-950/60 sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-200 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Create Opportunity from Call</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Promote requirement outcome into the active sales pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Origin Card */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Originating Call Outcome
              </span>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{call.callCode}</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white">{call.companyName}</p>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              Contact: {call.contactName} ({call.contactDesignation}) • Result: <strong>{call.result}</strong>
            </p>
          </div>

          {/* Opportunity Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Opportunity Name</label>
            <input
              type="text"
              required
              value={opportunityName}
              onChange={(e) => setOpportunityName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />
          </div>

          {/* Deal Value & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deal Value (Est.)</label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="Requirement Analysis">Requirement Analysis</option>
                <option value="Solution Scoping">Solution Scoping</option>
                <option value="Proposal Preparation">Proposal Preparation</option>
                <option value="Commercial Negotiation">Commercial Negotiation</option>
              </select>
            </div>
          </div>

          {/* Expected Close Date & Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Close Date</label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Opportunity Owner</label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="Kunal Patil">Kunal Patil (Sales Manager)</option>
                <option value="Shruti Raundal">Shruti Raundal (Senior Sales Executive)</option>
                <option value="Pranav Jejurkar">Pranav Jejurkar (Business Analyst)</option>
                <option value="Ankush Pandit">Ankush Pandit (Sales Executive)</option>
                <option value="Rohan Patil">Rohan Patil (Enterprise BDM)</option>
              </select>
            </div>
          </div>

          {/* Scope Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Scope & Handover Notes</label>
            <textarea
              rows={3}
              value={opportunityNotes}
              onChange={(e) => setOpportunityNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[44px] flex items-center justify-center cursor-pointer order-2 sm:order-1 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-xl font-semibold shadow-md min-h-[44px] flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Opportunity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
