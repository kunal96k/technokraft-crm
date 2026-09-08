import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Plus,
  ArrowRight,
  Sparkles,
  Download,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { OpportunitySummaryCards } from '../../components/opportunities/OpportunitySummaryCards';
import { PipelineFilters } from '../../components/opportunities/PipelineFilters';
import { PipelineBoard } from '../../components/opportunities/PipelineBoard';
import { OpportunityList } from '../../components/opportunities/OpportunityList';
import { OpportunityForm } from '../../components/opportunities/OpportunityForm';
import { MarkWonModal } from '../../components/opportunities/MarkWonModal';
import { MarkLostModal } from '../../components/opportunities/MarkLostModal';
import { AddFollowUpModal } from '../../components/opportunities/AddFollowUpModal';
import { CreateProposalModal } from '../../components/opportunities/CreateProposalModal';
import {
  OpportunityRecord,
  OpportunityStage,
  PipelineFilterState,
  ProposalRecord,
  OpportunityFollowUp,
  LossReason,
} from '../../types/opportunities';
import {
  getStoredOpportunities,
  saveStoredOpportunities,
  getStoredProposals,
  saveStoredProposals,
} from '../../data/mockOpportunities';

export const PipelinePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Filters State
  const [filters, setFilters] = useState<PipelineFilterState>({
    search: '',
    stage: '',
    assignedTo: '',
    service: '',
    probability: '',
    opportunityValue: '',
    industry: '',
    expectedClose: '',
  });

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<OpportunityRecord | null>(null);
  const [formDefaultStage, setFormDefaultStage] = useState<OpportunityStage>('Qualified');

  const [wonTarget, setWonTarget] = useState<OpportunityRecord | null>(null);
  const [lostTarget, setLostTarget] = useState<OpportunityRecord | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<OpportunityRecord | null>(null);
  const [proposalTarget, setProposalTarget] = useState<OpportunityRecord | null>(null);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    const loaded = getStoredOpportunities();
    setOpportunities(loaded);

    // If query params specify action
    if (searchParams.get('action') === 'new') {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const handleUpdateOpportunities = (updated: OpportunityRecord[]) => {
    setOpportunities(updated);
    saveStoredOpportunities(updated);
  };

  // Move stage
  const handleMoveStage = (id: string, newStage: OpportunityStage) => {
    const updated = opportunities.map((opp) => {
      if (opp.id === id) {
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
          employeeName: 'Kunal Patil',
          type: 'STAGE_CHANGE' as const,
          title: `Moved from ${opp.stage} to ${newStage}`,
          notes: `Stage updated with recalculated win probability of ${prob}%.`,
        };

        return {
          ...opp,
          stage: newStage,
          probability: prob,
          activities: [newActivity, ...opp.activities],
          updatedAt: new Date().toISOString(),
        };
      }
      return opp;
    });

    handleUpdateOpportunities(updated);
    showToast(`Opportunity stage updated to "${newStage}"`);
  };

  // Confirm Won
  const handleConfirmWon = (
    id: string,
    finalValue: number,
    closingDate: string,
    notes: string
  ) => {
    const updated = opportunities.map((opp) => {
      if (opp.id === id) {
        const newAct = {
          id: `act-${Date.now()}`,
          date: closingDate,
          time: '05:00 PM',
          employeeName: opp.owner.name,
          type: 'WON' as const,
          title: `Deal Closed & Won! Final Value: ₹${finalValue.toLocaleString('en-IN')}`,
          notes,
        };

        return {
          ...opp,
          stage: 'Won' as OpportunityStage,
          probability: 100,
          estimatedValue: finalValue,
          wonDate: closingDate,
          wonNotes: notes,
          activities: [newAct, ...opp.activities],
          updatedAt: new Date().toISOString(),
        };
      }
      return opp;
    });

    handleUpdateOpportunities(updated);
    showToast(`Congratulations! Deal marked as WON.`);
  };

  // Confirm Lost
  const handleConfirmLost = (id: string, reason: LossReason, notes: string) => {
    const updated = opportunities.map((opp) => {
      if (opp.id === id) {
        const newAct = {
          id: `act-${Date.now()}`,
          date: '07 Sep 2026',
          time: '05:30 PM',
          employeeName: opp.owner.name,
          type: 'LOST' as const,
          title: `Deal Marked as Lost (${reason})`,
          notes: notes || 'No detailed feedback provided.',
        };

        return {
          ...opp,
          stage: 'Lost' as OpportunityStage,
          probability: 0,
          lossReason: reason,
          lossNotes: notes,
          activities: [newAct, ...opp.activities],
          updatedAt: new Date().toISOString(),
        };
      }
      return opp;
    });

    handleUpdateOpportunities(updated);
    showToast(`Opportunity archived as Lost (${reason})`);
  };

  // Add Follow Up
  const handleAddFollowUp = (id: string, followUp: OpportunityFollowUp) => {
    const updated = opportunities.map((opp) => {
      if (opp.id === id) {
        return {
          ...opp,
          followUps: [followUp, ...opp.followUps],
          activities: [
            {
              id: `act-${Date.now()}`,
              date: '07 Sep 2026',
              time: '04:00 PM',
              employeeName: followUp.assignedTo,
              type: 'FOLLOW_UP' as const,
              title: `Follow-up Scheduled: ${followUp.type} on ${followUp.date} at ${followUp.time}`,
              notes: followUp.notes,
            },
            ...opp.activities,
          ],
          updatedAt: new Date().toISOString(),
        };
      }
      return opp;
    });

    handleUpdateOpportunities(updated);
    showToast(`Follow-up scheduled for ${followUp.date}`);
  };

  // Save new / edited Opportunity
  const handleSaveOpportunity = (opp: OpportunityRecord) => {
    const exists = opportunities.some((o) => o.id === opp.id);
    let updated: OpportunityRecord[];
    if (exists) {
      updated = opportunities.map((o) => (o.id === opp.id ? opp : o));
      showToast(`Opportunity "${opp.name}" updated successfully.`);
    } else {
      updated = [opp, ...opportunities];
      showToast(`Opportunity "${opp.name}" created.`);
    }
    handleUpdateOpportunities(updated);
  };

  // Save generated proposal
  const handleSaveProposal = (proposal: ProposalRecord) => {
    const currentProps = getStoredProposals();
    const updatedProps = [proposal, ...currentProps];
    saveStoredProposals(updatedProps);

    // Update opportunity proposal count and move stage to Proposal if earlier
    const updatedOpps = opportunities.map((opp) => {
      if (opp.id === proposal.opportunityId) {
        const shouldAdvance = opp.stage === 'Qualified' || opp.stage === 'Requirement Received';
        return {
          ...opp,
          stage: shouldAdvance ? ('Proposal' as OpportunityStage) : opp.stage,
          probability: shouldAdvance ? 60 : opp.probability,
          proposalsCount: (opp.proposalsCount || 0) + 1,
          activities: [
            {
              id: `act-${Date.now()}`,
              date: proposal.sentDate,
              time: '03:45 PM',
              employeeName: proposal.ownerName,
              type: 'PROPOSAL_SENT' as const,
              title: `Commercial Proposal ${proposal.proposalCode} Generated`,
              notes: `Amount: ₹${proposal.amount.toLocaleString('en-IN')}, Valid until: ${proposal.validUntil}.`,
            },
            ...opp.activities,
          ],
        };
      }
      return opp;
    });

    handleUpdateOpportunities(updatedOpps);
    showToast(`Proposal ${proposal.proposalCode} generated & saved!`);
  };

  // Filter application
  const filteredOpportunities = opportunities.filter((opp) => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchSearch =
        opp.name.toLowerCase().includes(q) ||
        opp.companyName.toLowerCase().includes(q) ||
        opp.contactName.toLowerCase().includes(q) ||
        (opp.leadCode && opp.leadCode.toLowerCase().includes(q)) ||
        opp.service.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // Stage
    if (filters.stage && opp.stage !== filters.stage) {
      return false;
    }

    // Owner
    if (filters.assignedTo && opp.owner.name !== filters.assignedTo) {
      return false;
    }

    // Service
    if (filters.service && opp.service !== filters.service) {
      return false;
    }

    // Probability
    if (filters.probability === 'high' && opp.probability < 70) return false;
    if (filters.probability === 'medium' && (opp.probability < 40 || opp.probability >= 70))
      return false;
    if (filters.probability === 'low' && opp.probability >= 40) return false;

    // Value Range
    if (filters.opportunityValue === 'under5L' && opp.estimatedValue >= 500000) return false;
    if (
      filters.opportunityValue === '5Lto15L' &&
      (opp.estimatedValue < 500000 || opp.estimatedValue > 1500000)
    )
      return false;
    if (filters.opportunityValue === 'above15L' && opp.estimatedValue <= 1500000) return false;

    // Industry
    if (filters.industry && opp.industry !== filters.industry) {
      return false;
    }

    return true;
  });

  // Calculate metrics
  const totalCount = opportunities.length;
  const qualifiedCount = opportunities.filter((o) => o.stage === 'Qualified').length;
  const proposalCount = opportunities.filter((o) => o.stage === 'Proposal').length;
  const negotiationCount = opportunities.filter((o) => o.stage === 'Negotiation').length;
  const pipelineValue = opportunities
    .filter((o) => o.stage !== 'Lost')
    .reduce((sum, o) => sum + o.estimatedValue, 0);

  const uniqueOwners = Array.from(new Set(opportunities.map((o) => o.owner.name)));
  const uniqueIndustries = Array.from(
    new Set(opportunities.map((o) => o.industry).filter(Boolean) as string[])
  );

  return (
    <div className="space-y-5">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200 border border-transparent dark:border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Opportunities Pipeline"
        description="Track active qualified leads, technical requirements, proposals, and deal progressions"
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-700 text-[#5B4DB7] dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-[#5B4DB7] dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => {
                setEditingOpportunity(null);
                setFormDefaultStage('Qualified');
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Opportunity</span>
            </button>
          </div>
        }
      />

      {/* 5 Summary Cards */}
      <OpportunitySummaryCards
        totalCount={totalCount}
        qualifiedCount={qualifiedCount}
        proposalCount={proposalCount}
        negotiationCount={negotiationCount}
        pipelineValue={pipelineValue}
        activeFilterStage={filters.stage}
        onSelectStage={(stg) => setFilters((prev) => ({ ...prev, stage: stg }))}
      />

      {/* Search & Filters */}
      <PipelineFilters
        filters={filters}
        onChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
        onReset={() =>
          setFilters({
            search: '',
            stage: '',
            assignedTo: '',
            service: '',
            probability: '',
            opportunityValue: '',
            industry: '',
            expectedClose: '',
          })
        }
        uniqueOwners={uniqueOwners}
        uniqueIndustries={uniqueIndustries}
      />

      {/* Main Pipeline Board or List View */}
      {viewMode === 'board' ? (
        <PipelineBoard
          opportunities={filteredOpportunities}
          onMoveStage={handleMoveStage}
          onEdit={(opp) => {
            setEditingOpportunity(opp);
            setIsFormOpen(true);
          }}
          onAddFollowUp={(opp) => setFollowUpTarget(opp)}
          onCreateProposal={(opp) => setProposalTarget(opp)}
          onMarkWon={(opp) => setWonTarget(opp)}
          onMarkLost={(opp) => setLostTarget(opp)}
          onQuickAdd={(stg) => {
            setEditingOpportunity(null);
            setFormDefaultStage(stg);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <OpportunityList
          opportunities={filteredOpportunities}
          onMoveStage={handleMoveStage}
          onEdit={(opp) => {
            setEditingOpportunity(opp);
            setIsFormOpen(true);
          }}
          onAddFollowUp={(opp) => setFollowUpTarget(opp)}
          onCreateProposal={(opp) => setProposalTarget(opp)}
          onMarkWon={(opp) => setWonTarget(opp)}
          onMarkLost={(opp) => setLostTarget(opp)}
        />
      )}

      {/* Modal: Create/Edit Opportunity */}
      <OpportunityForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOpportunity(null);
        }}
        onSave={handleSaveOpportunity}
        initialOpportunity={editingOpportunity}
        defaultStage={formDefaultStage}
      />

      {/* Modal: Mark Won */}
      <MarkWonModal
        isOpen={!!wonTarget}
        onClose={() => setWonTarget(null)}
        opportunity={wonTarget}
        onConfirmWon={handleConfirmWon}
      />

      {/* Modal: Mark Lost */}
      <MarkLostModal
        isOpen={!!lostTarget}
        onClose={() => setLostTarget(null)}
        opportunity={lostTarget}
        onConfirmLost={handleConfirmLost}
      />

      {/* Modal: Add Follow Up */}
      <AddFollowUpModal
        isOpen={!!followUpTarget}
        onClose={() => setFollowUpTarget(null)}
        opportunity={followUpTarget}
        onAddFollowUp={handleAddFollowUp}
      />

      {/* Modal: Create Proposal */}
      <CreateProposalModal
        isOpen={!!proposalTarget}
        onClose={() => setProposalTarget(null)}
        opportunity={proposalTarget}
        onSaveProposal={handleSaveProposal}
      />
    </div>
  );
};
