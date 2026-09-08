import React from 'react';
import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { OpportunityRecord, OpportunityStage } from '../../types/opportunities';
import { DraggableOpportunityCard } from './DraggableOpportunityCard';
import { formatLakhsINR } from '../../data/mockOpportunities';

interface PipelineColumnProps {
  stage: OpportunityStage;
  opportunities: OpportunityRecord[];
  onMoveStage?: (id: string, newStage: OpportunityStage) => void;
  onEdit?: (opp: OpportunityRecord) => void;
  onAddFollowUp?: (opp: OpportunityRecord) => void;
  onCreateProposal?: (opp: OpportunityRecord) => void;
  onMarkWon?: (opp: OpportunityRecord) => void;
  onMarkLost?: (opp: OpportunityRecord) => void;
  onQuickAdd?: (stage: OpportunityStage) => void;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({
  stage,
  opportunities,
  onMoveStage,
  onEdit,
  onAddFollowUp,
  onCreateProposal,
  onMarkWon,
  onMarkLost,
  onQuickAdd,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: {
      stage,
    },
  });

  const totalValue = opportunities.reduce((acc, curr) => acc + curr.estimatedValue, 0);

  const getStageHeaderStyles = (s: OpportunityStage) => {
    switch (s) {
      case 'Qualified':
        return {
          barColor: 'bg-sky-500',
          badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
        };
      case 'Requirement Received':
        return {
          barColor: 'bg-blue-500',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
        };
      case 'Proposal':
        return {
          barColor: 'bg-purple-500',
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
        };
      case 'Negotiation':
        return {
          barColor: 'bg-amber-500',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        };
      case 'Won':
        return {
          barColor: 'bg-emerald-500',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        };
      case 'Lost':
        return {
          barColor: 'bg-rose-500',
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
        };
      default:
        return {
          barColor: 'bg-slate-400',
          badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        };
    }
  };

  const styles = getStageHeaderStyles(stage);

  return (
    <div
      ref={setNodeRef}
      className={`w-[300px] flex-shrink-0 flex flex-col rounded-xl border p-3 h-full max-h-[calc(100vh-250px)] transition-all duration-200 ${
        isOver
          ? 'bg-purple-50/70 dark:bg-purple-950/30 border-[#5B4DB7] dark:border-purple-400 ring-2 ring-[#5B4DB7]/30 dark:ring-purple-400/30'
          : 'bg-slate-50/80 dark:bg-[#151F32]/80 border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Column Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full ${styles.barColor} shrink-0`} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
              {stage}
            </h3>
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono ${styles.badgeColor}`}
            >
              {opportunities.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onQuickAdd?.(stage)}
            title={`Add Opportunity to ${stage}`}
            className="p-1 text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total stage value */}
        <div className="flex items-baseline justify-between text-xs mt-1">
          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">Stage Value:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {formatLakhsINR(totalValue)}
          </span>
        </div>
      </div>

      {/* Cards List with vertical scroll within column */}
      <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1 min-h-[160px]">
        {opportunities.length > 0 ? (
          opportunities.map((opp) => (
            <DraggableOpportunityCard
              key={opp.id}
              opportunity={opp}
              onMoveStage={onMoveStage}
              onEdit={onEdit}
              onAddFollowUp={onAddFollowUp}
              onCreateProposal={onCreateProposal}
              onMarkWon={onMarkWon}
              onMarkLost={onMarkLost}
            />
          ))
        ) : (
          <div
            className={`h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-slate-400 dark:text-slate-500 text-xs text-center p-3 transition-colors ${
              isOver
                ? 'border-[#5B4DB7] dark:border-purple-400 bg-purple-50/30 dark:bg-purple-950/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>{isOver ? 'Drop to move here' : 'No opportunities in this stage'}</span>
            {!isOver && (
              <button
                type="button"
                onClick={() => onQuickAdd?.(stage)}
                className="mt-2 text-xs font-semibold text-[#5B4DB7] dark:text-purple-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Opportunity</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
