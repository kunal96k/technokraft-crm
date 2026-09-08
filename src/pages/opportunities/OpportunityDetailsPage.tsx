import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  Calendar,
  IndianRupee,
  Briefcase,
  FileText,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Edit2,
  Plus,
  Clock,
  Phone,
  Mail,
  Layers,
  Sparkles,
  Download,
  Send,
  Eye,
  ChevronDown,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import {
  OpportunityRecord,
  OpportunityStage,
  ProposalRecord,
  OpportunityFollowUp,
  LossReason,
} from '../../types/opportunities';
import { OpportunityStageBadge } from '../../components/opportunities/OpportunityStageBadge';
import { OpportunityValue } from '../../components/opportunities/OpportunityValue';
import { ProbabilityIndicator } from '../../components/opportunities/ProbabilityIndicator';
import { ProposalStatusBadge } from '../../components/opportunities/ProposalStatusBadge';
import { OpportunityForm } from '../../components/opportunities/OpportunityForm';
import { MarkWonModal } from '../../components/opportunities/MarkWonModal';
import { MarkLostModal } from '../../components/opportunities/MarkLostModal';
import { AddFollowUpModal } from '../../components/opportunities/AddFollowUpModal';
import { CreateProposalModal } from '../../components/opportunities/CreateProposalModal';
import { ProposalDetailsModal } from '../../components/opportunities/ProposalDetailsModal';
import {
  getStoredOpportunities,
  saveStoredOpportunities,
  getStoredProposals,
  saveStoredProposals,
  formatCurrencyINR,
  formatLakhsINR,
} from '../../data/mockOpportunities';

export const OpportunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<OpportunityRecord | null>(null);
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'requirements' | 'proposals' | 'followups' | 'activities'
  >('overview');

  // Move stage dropdown
  const [showStageDropdown, setShowStageDropdown] = useState(false);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isWonOpen, setIsWonOpen] = useState(false);
  const [isLostOpen, setIsLostOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalRecord | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const opps = getStoredOpportunities();
    const found = opps.find((o) => o.id === id || o.opportunityCode === id);
    if (found) {
      setOpportunity(found);
    }

    const allProps = getStoredProposals();
    const linked = allProps.filter(
      (p) =>
        p.opportunityId === id ||
        (found && p.opportunityName.toLowerCase() === found.name.toLowerCase()) ||
        (found && p.companyName.toLowerCase() === found.companyName.toLowerCase())
    );
    setProposals(linked);
  }, [id]);

  if (!opportunity) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Opportunity Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          The requested opportunity record does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => navigate('/opportunities/pipeline')}
          className="mt-4 px-4 py-2 bg-[#5B4DB7] text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Return to Pipeline
        </button>
      </div>
    );
  }

  const handleUpdateOpportunity = (updated: OpportunityRecord) => {
    setOpportunity(updated);
    const opps = getStoredOpportunities();
    const nextOpps = opps.map((o) => (o.id === updated.id ? updated : o));
    saveStoredOpportunities(nextOpps);
  };

  // Move stage
  const handleMoveStage = (newStage: OpportunityStage) => {
    setShowStageDropdown(false);
    const prob =
      newStage === 'Won'
        ? 100
        : newStage === 'Lost'
        ? 0
        : newStage === 'Negotiation'
        ? 85
        : newStage === 'Proposal'
        ? 60
        : newStage === 'Requirement Received'
        ? 40
        : 25;

    const newActivity = {
      id: `act-${Date.now()}`,
      date: '07 Sep 2026',
      time: '04:15 PM',
      employeeName: opportunity.owner.name,
      type: 'STAGE_CHANGE' as const,
      title: `Moved from ${opportunity.stage} to ${newStage}`,
      notes: `Stage updated with recalculated win probability of ${prob}%.`,
    };

    const updated: OpportunityRecord = {
      ...opportunity,
      stage: newStage,
      probability: prob,
      activities: [newActivity, ...opportunity.activities],
      updatedAt: new Date().toISOString(),
    };

    handleUpdateOpportunity(updated);
    showToast(`Stage updated to ${newStage}`);
  };

  // Confirm Won
  const handleConfirmWon = (
    oppId: string,
    finalVal: number,
    closingDate: string,
    notes: string
  ) => {
    const updated: OpportunityRecord = {
      ...opportunity,
      stage: 'Won',
      probability: 100,
      estimatedValue: finalVal,
      wonDate: closingDate,
      wonNotes: notes,
      activities: [
        {
          id: `act-${Date.now()}`,
          date: closingDate,
          time: '05:00 PM',
          employeeName: opportunity.owner.name,
          type: 'WON',
          title: `Deal Closed & Won! Final Value: ₹${finalVal.toLocaleString('en-IN')}`,
          notes,
        },
        ...opportunity.activities,
      ],
      updatedAt: new Date().toISOString(),
    };

    handleUpdateOpportunity(updated);
    showToast(`Opportunity marked as WON!`);
  };

  // Confirm Lost
  const handleConfirmLost = (oppId: string, reason: LossReason, notes: string) => {
    const updated: OpportunityRecord = {
      ...opportunity,
      stage: 'Lost',
      probability: 0,
      lossReason: reason,
      lossNotes: notes,
      activities: [
        {
          id: `act-${Date.now()}`,
          date: '07 Sep 2026',
          time: '05:30 PM',
          employeeName: opportunity.owner.name,
          type: 'LOST',
          title: `Opportunity Closed as Lost (${reason})`,
          notes: notes || 'No comments provided.',
        },
        ...opportunity.activities,
      ],
      updatedAt: new Date().toISOString(),
    };

    handleUpdateOpportunity(updated);
    showToast(`Opportunity archived as Lost (${reason})`);
  };

  // Add Follow Up
  const handleAddFollowUp = (oppId: string, fu: OpportunityFollowUp) => {
    const updated: OpportunityRecord = {
      ...opportunity,
      followUps: [fu, ...opportunity.followUps],
      activities: [
        {
          id: `act-${Date.now()}`,
          date: '07 Sep 2026',
          time: '04:00 PM',
          employeeName: fu.assignedTo,
          type: 'FOLLOW_UP',
          title: `Follow-up Scheduled: ${fu.type} on ${fu.date} at ${fu.time}`,
          notes: fu.notes,
        },
        ...opportunity.activities,
      ],
      updatedAt: new Date().toISOString(),
    };

    handleUpdateOpportunity(updated);
    showToast(`Follow-up scheduled for ${fu.date}`);
  };

  // Save proposal
  const handleSaveProposal = (proposal: ProposalRecord) => {
    const currentProps = getStoredProposals();
    const updatedProps = [proposal, ...currentProps];
    saveStoredProposals(updatedProps);
    setProposals([proposal, ...proposals]);

    const shouldAdvance =
      opportunity.stage === 'Qualified' || opportunity.stage === 'Requirement Received';
    const updated: OpportunityRecord = {
      ...opportunity,
      stage: shouldAdvance ? 'Proposal' : opportunity.stage,
      probability: shouldAdvance ? 60 : opportunity.probability,
      proposalsCount: (opportunity.proposalsCount || 0) + 1,
      activities: [
        {
          id: `act-${Date.now()}`,
          date: proposal.sentDate,
          time: '03:45 PM',
          employeeName: proposal.ownerName,
          type: 'PROPOSAL_SENT',
          title: `Commercial Proposal ${proposal.proposalCode} Created`,
          notes: `Amount: ₹${proposal.amount.toLocaleString('en-IN')}, Valid until: ${proposal.validUntil}.`,
        },
        ...opportunity.activities,
      ],
    };

    handleUpdateOpportunity(updated);
    showToast(`Proposal ${proposal.proposalCode} created!`);
  };

  const stagesList: OpportunityStage[] = [
    'Qualified',
    'Requirement Received',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost',
  ];

  const stageStepIndex = [
    'Qualified',
    'Requirement Received',
    'Proposal',
    'Negotiation',
    'Won',
  ].indexOf(opportunity.stage);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/opportunities/pipeline')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#5B4DB7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities Pipeline</span>
        </button>

        <div className="flex items-center gap-2">
          {opportunity.leadCode && (
            <Link
              to={`/leads/${opportunity.leadId || opportunity.leadCode}`}
              className="text-xs font-mono font-semibold text-[#5B4DB7] hover:underline bg-purple-50 px-2 py-1 rounded-md border border-purple-100"
            >
              Lead: {opportunity.leadCode}
            </Link>
          )}
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            {opportunity.opportunityCode}
          </span>
        </div>
      </div>

      {/* TOP HEADER CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {opportunity.companyName}
              </span>
              <OpportunityStageBadge stage={opportunity.stage} size="sm" />
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {opportunity.service}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {opportunity.name}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Contact: <strong className="text-slate-800">{opportunity.contactName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Close: <strong className="text-slate-800">{opportunity.expectedCloseDate}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center text-[9px] font-bold">
                  {opportunity.owner.name.charAt(0)}
                </div>
                <span>
                  Owner: <strong className="text-slate-800">{opportunity.owner.name}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Deal Financials Highlight */}
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Deal Value</div>
              <div className="font-mono text-xl sm:text-2xl font-black text-slate-900">
                {formatCurrencyINR(opportunity.estimatedValue)}
              </div>
              <div className="text-[10px] text-slate-500">
                Weighted:{' '}
                <strong className="font-mono text-slate-700">
                  {formatLakhsINR((opportunity.estimatedValue * opportunity.probability) / 100)}
                </strong>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                Probability
              </div>
              <ProbabilityIndicator probability={opportunity.probability} showBar={true} size="md" />
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
          {/* Move Stage Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStageDropdown(!showStageDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <span>Move Stage: {opportunity.stage}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showStageDropdown && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                {stagesList.map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    disabled={stg === opportunity.stage}
                    onClick={() => handleMoveStage(stg)}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      stg === opportunity.stage
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span>{stg}</span>
                    {stg === opportunity.stage && <span className="text-[11px] text-[#5B4DB7]">Current</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFollowUpOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-indigo-50 hover:text-[#5B4DB7] text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Add Follow-up</span>
            </button>

            {opportunity.stage !== 'Won' && opportunity.stage !== 'Lost' && (
              <button
                type="button"
                onClick={() => setIsProposalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B4DB7] border border-purple-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Create Proposal</span>
              </button>
            )}

            {opportunity.stage !== 'Won' && opportunity.stage !== 'Lost' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsWonOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Won</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLostOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Mark Lost</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Visual Stage Progression Stepper */}
        {opportunity.stage !== 'Lost' ? (
          <div className="pt-2">
            <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold">
              {['Qualified', 'Requirement Received', 'Proposal', 'Negotiation', 'Won'].map(
                (stg, idx) => {
                  const isPassed = stageStepIndex >= idx;
                  const isCurrent = opportunity.stage === stg;
                  return (
                    <div key={stg} className="space-y-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCurrent
                            ? 'bg-[#5B4DB7]'
                            : isPassed
                            ? 'bg-purple-300'
                            : 'bg-slate-200'
                        }`}
                      />
                      <span
                        className={`truncate block ${
                          isCurrent
                            ? 'text-[#5B4DB7] font-extrabold'
                            : isPassed
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {stg}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>
                Deal closed as <strong>Lost</strong> ({opportunity.lossReason || 'Budget'}).
              </span>
            </div>
            {opportunity.lossNotes && (
              <span className="text-rose-700 italic">{opportunity.lossNotes}</span>
            )}
          </div>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'requirements', label: 'Requirements' },
          {
            id: 'proposals',
            label: `Proposals (${proposals.length})`,
          },
          {
            id: 'followups',
            label: `Follow-ups (${opportunity.followUps.length})`,
          },
          {
            id: 'activities',
            label: `Activities (${opportunity.activities.length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#5B4DB7] text-[#5B4DB7] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT AREAS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Column 1 & 2: Company & Contact & Financials */}
          <div className="lg:col-span-2 space-y-5">
            {/* Company Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5B4DB7]" />
                <span>Company & Account Information</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Company Name</span>
                  <span className="font-bold text-slate-800">{opportunity.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Industry</span>
                  <span className="font-medium text-slate-700">{opportunity.industry || 'IT & Tech'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Service Domain</span>
                  <span className="font-medium text-slate-700">{opportunity.service}</span>
                </div>
              </div>
            </div>

            {/* Key Contact Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#5B4DB7]" />
                <span>Primary Customer Contact</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Contact Name</span>
                  <span className="font-bold text-slate-800">{opportunity.contactName}</span>
                  <span className="text-[11px] text-slate-500 block">
                    {opportunity.contactDesignation || 'Stakeholder'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Email</span>
                  <div className="flex items-center gap-1 text-slate-700 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{opportunity.contactEmail || 'Not provided'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Phone</span>
                  <div className="flex items-center gap-1 text-slate-700 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{opportunity.contactPhone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Financials Detailed */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#5B4DB7]" />
                <span>Commercial Terms & Pipeline Forecast</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Total Deal Value
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {formatCurrencyINR(opportunity.estimatedValue)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Win Probability
                  </span>
                  <span className="font-bold text-[#5B4DB7] text-sm">{opportunity.probability}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Weighted Value
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatCurrencyINR(
                      Math.round((opportunity.estimatedValue * opportunity.probability) / 100)
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Priority
                  </span>
                  <span className="font-bold text-slate-800 text-sm">{opportunity.priority || 'High'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Team Assignment & Timelines */}
          <div className="space-y-5">
            {/* Team Assignment Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#5B4DB7]" />
                <span>Account Team Assignment</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center text-xs font-bold">
                    {opportunity.owner.avatar || opportunity.owner.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{opportunity.owner.name}</div>
                    <div className="text-[11px] text-slate-500">Sales Owner (Primary)</div>
                  </div>
                </div>

                {opportunity.businessAnalyst && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold">
                      BA
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{opportunity.businessAnalyst.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {opportunity.businessAnalyst.role || 'Business Analyst'}
                      </div>
                    </div>
                  </div>
                )}

                {opportunity.technicalReviewer && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold">
                      TA
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{opportunity.technicalReviewer.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {opportunity.technicalReviewer.role || 'Technical Reviewer'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Horizons Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs text-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5B4DB7]" />
                <span>Pipeline Milestone Dates</span>
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Created On:</span>
                  <span className="font-bold text-slate-800">{opportunity.createdBy.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Expected Close:</span>
                  <span className="font-bold text-[#5B4DB7]">{opportunity.expectedCloseDate}</span>
                </div>
                {opportunity.wonDate && (
                  <div className="flex justify-between text-emerald-700">
                    <span className="font-semibold">Won On:</span>
                    <span className="font-bold">{opportunity.wonDate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Last Modified:</span>
                  <span className="text-slate-600">
                    {new Date(opportunity.updatedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REQUIREMENTS */}
      {activeTab === 'requirements' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-2xs text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5B4DB7]" />
              <span>Customer Requirements & Discovery Scope</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="text-xs font-semibold text-[#5B4DB7] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Requirements</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Requirement Summary
              </span>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium leading-relaxed">
                {opportunity.requirement.summary || 'No summary available.'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Business Problem Statement
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  {opportunity.requirement.problemStatement || 'Not specified.'}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Expected Users / Load
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  {opportunity.requirement.expectedUsers || 'Not specified.'}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Estimated Timeline
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  {opportunity.requirement.timeline || 'Not specified.'}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Customer Budget
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-mono font-bold">
                  {opportunity.requirement.budget || 'Not specified.'}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Technical Specifications & Architecture
              </span>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-mono text-[11px]">
                {opportunity.requirement.technicalRequirements || 'Standard modern stack requested.'}
              </div>
            </div>

            {opportunity.requirement.notes && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Discovery & Engagement Notes
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 italic">
                  {opportunity.requirement.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROPOSALS */}
      {activeTab === 'proposals' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Commercial Proposals</h3>
              <p className="text-xs text-slate-500">
                Official quotation packages and contracts dispatched to {opportunity.companyName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsProposalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Proposal</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Proposal ID</th>
                  <th className="py-3 px-3">Amount (₹)</th>
                  <th className="py-3 px-3">Sent Date</th>
                  <th className="py-3 px-3">Valid Until</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposals.length > 0 ? (
                  proposals.map((prop) => (
                    <tr
                      key={prop.id}
                      onClick={() => setSelectedProposal(prop)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#5B4DB7]">
                        {prop.proposalCode}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {formatCurrencyINR(prop.amount)}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{prop.sentDate}</td>
                      <td className="py-3 px-3 text-slate-600">{prop.validUntil}</td>
                      <td className="py-3 px-3">
                        <ProposalStatusBadge status={prop.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-700">{prop.ownerName}</td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedProposal(prop)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast(`Downloading ${prop.proposalCode}.pdf...`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No proposals generated yet for this opportunity. Click "Create Proposal" above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Follow-ups & Next Actions</h3>
              <p className="text-xs text-slate-500">
                Scheduled client touchpoints, calls, technical demos, and status checks
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFollowUpOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Follow-up</span>
            </button>
          </div>

          <div className="space-y-3">
            {opportunity.followUps.length > 0 ? (
              opportunity.followUps.map((fu) => (
                <div
                  key={fu.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{fu.type}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          fu.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fu.status}
                      </span>
                    </div>
                    <p className="text-slate-700">{fu.notes}</p>
                    <span className="text-[11px] text-slate-400">Assigned: {fu.assignedTo}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {fu.date} • {fu.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No follow-ups recorded yet. Click "Add Follow-up" to schedule a client meeting or call.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Activity History & Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Complete timeline of deal progression, stage movements, and commercial transactions
            </p>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200">
            {opportunity.activities.map((act) => (
              <div key={act.id} className="relative flex items-start gap-4 text-xs">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#5B4DB7] text-[#5B4DB7] flex items-center justify-center font-bold z-10 shrink-0 shadow-2xs">
                  {act.type === 'WON' ? '🏆' : act.type === 'LOST' ? '✕' : '•'}
                </div>
                <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900">{act.title}</h4>
                    <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {act.date} • {act.time}
                    </span>
                  </div>
                  {act.notes && <p className="text-slate-600 mt-1">{act.notes}</p>}
                  <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
                    Logged by: <strong>{act.employeeName}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      <OpportunityForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={(updatedOpp) => {
          handleUpdateOpportunity(updatedOpp);
          showToast('Opportunity updated successfully.');
        }}
        initialOpportunity={opportunity}
      />

      <MarkWonModal
        isOpen={isWonOpen}
        onClose={() => setIsWonOpen(false)}
        opportunity={opportunity}
        onConfirmWon={handleConfirmWon}
      />

      <MarkLostModal
        isOpen={isLostOpen}
        onClose={() => setIsLostOpen(false)}
        opportunity={opportunity}
        onConfirmLost={handleConfirmLost}
      />

      <AddFollowUpModal
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        opportunity={opportunity}
        onAddFollowUp={handleAddFollowUp}
      />

      <CreateProposalModal
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        opportunity={opportunity}
        onSaveProposal={handleSaveProposal}
      />

      <ProposalDetailsModal
        isOpen={!!selectedProposal}
        onClose={() => setSelectedProposal(null)}
        proposal={selectedProposal}
        onStatusChange={(propId, status) => {
          const updatedProps = proposals.map((p) => (p.id === propId ? { ...p, status } : p));
          setProposals(updatedProps);
          saveStoredProposals(updatedProps);
          if (selectedProposal && selectedProposal.id === propId) {
            setSelectedProposal({ ...selectedProposal, status });
          }
        }}
        onNotice={(msg) => showToast(msg)}
      />
    </div>
  );
};
