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
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { stage },
  });

  const columnTotalValue = opportunities.reduce(
    (sum, o) => sum + (o.estimatedValue || 0),
    0
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[300px] shrink-0 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border transition-all duration-200 ${
        isOver
          ? 'border-[#5B4DB7] ring-2 ring-[#5B4DB7]/30 bg-purple-50/20 dark:bg-purple-950/20 shadow-md'
          : 'border-slate-200/80 dark:border-slate-800 shadow-2xs'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${stageBadgeBg} ${stageBadgeText} border border-current/10 truncate`}
          >
            {stageName}
          </span>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
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

      {/* Column Cards Container: Clean natural layout without inner scroll trap */}
      <div className="p-3 space-y-3 flex-1 min-h-[140px]">
        {opportunities.map((opp) => (
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
      </div>
    </div>
  );
};
