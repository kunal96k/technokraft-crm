import React from 'react';
import { Check } from 'lucide-react';
import { LeadStatus } from '../../types/leads';

interface LeadStageStepperProps {
  currentStatus: LeadStatus;
  onSelectStage?: (status: LeadStatus) => void;
}

const STAGES: { status: LeadStatus; label: string }[] = [
  { status: 'NEW', label: 'New' },
  { status: 'CONTACTED', label: 'Contacted' },
  { status: 'INTERESTED', label: 'Interested' },
  { status: 'QUALIFIED', label: 'Qualified' },
  { status: 'REQUIREMENT_RECEIVED', label: 'Requirement' },
  { status: 'PROPOSAL', label: 'Proposal' },
  { status: 'NEGOTIATION', label: 'Negotiation' },
  { status: 'WON', label: 'Won' },
];

export const LeadStageStepper: React.FC<LeadStageStepperProps> = ({
  currentStatus,
  onSelectStage,
}) => {
  const getStageIndex = (status: LeadStatus) => {
    const idx = STAGES.findIndex((s) => s.status === status);
    if (idx !== -1) return idx;
    if (status === 'CALLBACK') return 1;
    if (status === 'REQUIREMENT_PENDING') return 4;
    if (status === 'LOST' || status === 'NOT_INTERESTED') return -1;
    return 0;
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Lead Pipeline Lifecycle
        </span>
        <span className="text-xs font-medium text-slate-500">
          Current Stage:{' '}
          <strong className="text-[#5B4DB7] font-semibold uppercase">{currentStatus}</strong>
        </span>
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden lg:flex items-center justify-between gap-1 relative">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          let pillClass = 'bg-slate-100 text-slate-500 border-slate-200';
          let circleClass = 'bg-slate-200 text-slate-600';

          if (isCompleted) {
            pillClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            circleClass = 'bg-emerald-500 text-white';
          } else if (isCurrent) {
            pillClass = 'bg-[#5B4DB7] text-white border-[#5B4DB7] shadow-xs ring-2 ring-purple-300/50';
            circleClass = 'bg-white text-[#5B4DB7] font-bold';
          }

          return (
            <React.Fragment key={stage.status}>
              <button
                type="button"
                onClick={() => onSelectStage && onSelectStage(stage.status)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${pillClass}`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${circleClass}`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </span>
                <span className="truncate">{stage.label}</span>
              </button>

              {idx < STAGES.length - 1 && (
                <div
                  className={`h-0.5 w-2 flex-shrink-0 ${
                    idx < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile & Tablet Compact / Stepper */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={stage.status}
              type="button"
              onClick={() => onSelectStage && onSelectStage(stage.status)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isCurrent
                  ? 'bg-[#5B4DB7] text-white border-[#5B4DB7]'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {isCompleted ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <span className="text-[10px] font-mono">{idx + 1}.</span>
              )}
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
