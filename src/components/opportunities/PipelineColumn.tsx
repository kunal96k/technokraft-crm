import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { OpportunityRecord, OpportunityStage } from '../../types/opportunities';
import { DraggableOpportunityCard } from './DraggableOpportunityCard';
import { formatCurrencyINR } from '../../utils/currencyFormatters';

interface PipelineColumnProps {
  stage: OpportunityStage;
  stageName: string;
  stageColor: string;
  stageBorder: string;
  stageBadgeBg: string;
  stageBadgeText: string;
  opportunities: OpportunityRecord[];
  onMoveStage: (id: string, newStage: OpportunityStage) => void;
  onEdit: (opp: OpportunityRecord) => void;
  onAddFollowUp: (opp: OpportunityRecord) => void;
  onCreateProposal: (opp: OpportunityRecord) => void;
  onMarkWon: (opp: OpportunityRecord) => void;
  onMarkLost: (opp: OpportunityRecord) => void;
  onDelete: (opp: OpportunityRecord) => void;
  onQuickAdd: (stage: OpportunityStage) => void;
  onViewStageInList?: (stage: OpportunityStage) => void;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({
  stage,
  stageName,
  stageBadgeBg,
  stageBadgeText,
  opportunities,
  onMoveStage,
  onEdit,
  onAddFollowUp,
  onCreateProposal,
  onMarkWon,
  onMarkLost,
  onDelete,
  onQuickAdd,
  onViewStageInList,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { stage },
  });

  // Windowing state: start with 10 deals
  const [visibleLimit, setVisibleLimit] = React.useState<number>(10);

  const isTerminal = stage === 'Won' || stage === 'Lost';
  const columnTotalValue = opportunities.reduce(
    (sum, o) => sum + (o.estimatedValue || 0),
    0
  );

  const visibleOpportunities = opportunities.slice(0, visibleLimit);
  const hasMore = opportunities.length > visibleLimit;
  const hiddenCount = opportunities.length - visibleLimit;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[300px] shrink-0 h-full bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOver
          ? 'border-[#5B4DB7] ring-2 ring-[#5B4DB7]/30 bg-purple-50/20 dark:bg-purple-950/20 shadow-md'
          : 'border-slate-200/80 dark:border-slate-800 shadow-2xs'
      }`}
    >
      {/* Column Header - Pinned at top */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 shrink-0 bg-slate-100 dark:bg-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${stageBadgeBg} ${stageBadgeText} border border-current/10 truncate`}
          >
            {stageName}
          </span>
          <span
            className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs"
            title={`${opportunities.length} total deals in this stage`}
          >
            {opportunities.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onQuickAdd(stage)}
          title={`Add Deal to ${stageName}`}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-header: Column Value Sum */}
      <div className="px-3.5 py-1.5 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200/40 dark:border-slate-800/40 shrink-0">
        <span>Total Pipeline:</span>
        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
          {formatCurrencyINR(columnTotalValue)}
        </span>
      </div>

      {/* Column Cards Container: Internal vertical scroll with sleek scrollbar */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto min-h-0">
        {visibleOpportunities.map((opp) => (
          <DraggableOpportunityCard
            key={opp.id}
            opportunity={opp}
            onMoveStage={onMoveStage}
            onEdit={onEdit}
            onAddFollowUp={onAddFollowUp}
            onCreateProposal={onCreateProposal}
            onMarkWon={onMarkWon}
            onMarkLost={onMarkLost}
            onDelete={onDelete}
          />
        ))}

        {opportunities.length === 0 && (
          <div className="h-28 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-3 text-center">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Drop deals here
            </p>
            <button
              type="button"
              onClick={() => onQuickAdd(stage)}
              className="mt-1 text-[10px] text-[#5B4DB7] dark:text-purple-400 hover:underline font-semibold cursor-pointer"
            >
              + Quick Add
            </button>
          </div>
        )}

        {/* ACTIVE STAGES WINDOWING CONTROLS */}
        {!isTerminal && opportunities.length > 10 && (
          <div className="pt-1">
            {hasMore ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVisibleLimit((prev) => prev + 10)}
                  className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                >
                  + Load 10 More ({hiddenCount} left)
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleLimit(opportunities.length)}
                  className="py-1.5 px-2 bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Show All"
                >
                  All ({opportunities.length})
                </button>
              </div>
            ) : visibleLimit > 10 ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setVisibleLimit(10)}
                  className="text-[11px] text-slate-500 hover:text-[#5B4DB7] dark:hover:text-purple-400 font-semibold cursor-pointer"
                >
                  Collapse to Top 10
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* TERMINAL STAGES (WON & LOST) ARCHIVE CONTROLS */}
        {isTerminal && opportunities.length > 0 && (
          <div className="p-2.5 bg-white/90 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-2 shadow-2xs mt-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {hasMore
                ? `Showing ${visibleLimit} recent. +${hiddenCount} older ${stage === 'Won' ? 'won' : 'lost'} deals archived.`
                : `Showing all ${opportunities.length} ${stage === 'Won' ? 'won' : 'lost'} deals.`}
            </p>
            <div className="flex items-center gap-1.5 justify-center">
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisibleLimit((prev) => prev + 10)}
                  className="py-1 px-2 text-[10px] bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-md transition-colors cursor-pointer"
                >
                  + Load 10 More
                </button>
              )}
              {onViewStageInList && (
                <button
                  type="button"
                  onClick={() => onViewStageInList(stage)}
                  className="py-1 px-2.5 text-[10px] bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 font-bold rounded-md border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                >
                  View in List View ➔
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
