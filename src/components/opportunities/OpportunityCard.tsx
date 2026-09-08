import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Calendar,
  User,
  ArrowRight,
  FileText,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  Briefcase,
  Layers,
  GripVertical,
} from 'lucide-react';
import { OpportunityRecord, OpportunityStage } from '../../types/opportunities';
import { OpportunityValue } from './OpportunityValue';
import { ProbabilityIndicator } from './ProbabilityIndicator';
import { OpportunityStageBadge } from './OpportunityStageBadge';

interface OpportunityCardProps {
  opportunity: OpportunityRecord;
  onMoveStage?: (id: string, newStage: OpportunityStage) => void;
  onEdit?: (opp: OpportunityRecord) => void;
  onAddFollowUp?: (opp: OpportunityRecord) => void;
  onCreateProposal?: (opp: OpportunityRecord) => void;
  onMarkWon?: (opp: OpportunityRecord) => void;
  onMarkLost?: (opp: OpportunityRecord) => void;
  isDragging?: boolean;
  isDragOverlay?: boolean;
  dragHandleProps?: Record<string, any>;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onMoveStage,
  onEdit,
  onAddFollowUp,
  onCreateProposal,
  onMarkWon,
  onMarkLost,
  isDragging = false,
  isDragOverlay = false,
  dragHandleProps,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showStageSubmenu, setShowStageSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowStageSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stages: OpportunityStage[] = [
    'Qualified',
    'Requirement Received',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost',
  ];

  return (
    <div
      className={`bg-white dark:bg-[#1E293B] rounded-xl border p-4 shadow-2xs transition-all duration-200 relative group flex flex-col justify-between ${
        isDragOverlay
          ? 'border-[#5B4DB7] dark:border-purple-400 shadow-2xl scale-[1.02] rotate-1 ring-2 ring-[#5B4DB7]/20 dark:ring-purple-400/30 cursor-grabbing'
          : isDragging
          ? 'border-dashed border-[#5B4DB7]/60 dark:border-purple-400/60 bg-purple-50/20 dark:bg-purple-950/20 shadow-none'
          : 'border-slate-200/90 dark:border-slate-700/80 hover:shadow-md hover:border-[#5B4DB7]/40 dark:hover:border-purple-500/40'
      }`}
    >
      {/* Top Header: Drag Handle + Company + Action dropdown */}
      <div>
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            title="Drag to change stage"
            className="mt-0.5 text-slate-300 dark:text-slate-600 hover:text-[#5B4DB7] dark:hover:text-purple-400 cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors touch-none shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <span
              onClick={() => navigate(`/opportunities/${opportunity.id}`)}
              className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-400 truncate block cursor-pointer"
              title={opportunity.companyName}
            >
              {opportunity.companyName}
            </span>
            <h4
              onClick={() => navigate(`/opportunities/${opportunity.id}`)}
              className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug cursor-pointer hover:text-[#5B4DB7] dark:hover:text-purple-400 line-clamp-2 mt-0.5"
            >
              {opportunity.name}
            </h4>
          </div>

          {/* Action Menu button */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              aria-label="Opportunity actions"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-30 text-xs font-medium text-slate-700 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-750 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/opportunities/${opportunity.id}`);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>View Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit?.(opportunity);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Edit Opportunity</span>
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStageSubmenu(!showStageSubmenu)}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Move Stage</span>
                      </span>
                      <span className="text-[10px] text-slate-400">▸</span>
                    </button>

                    {showStageSubmenu && (
                      <div className="absolute left-full top-0 ml-1 w-44 bg-white dark:bg-[#1E293B] rounded-lg border border-slate-200 dark:border-slate-700 shadow-md py-1 z-40">
                        {stages.map((stg) => (
                          <button
                            key={stg}
                            type="button"
                            disabled={stg === opportunity.stage}
                            onClick={() => {
                              setShowMenu(false);
                              setShowStageSubmenu(false);
                              onMoveStage?.(opportunity.id, stg);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${
                              stg === opportunity.stage
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span>{stg}</span>
                            {stg === opportunity.stage && <span className="text-[10px]">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onAddFollowUp?.(opportunity);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <CalendarClock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Add Follow-up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onCreateProposal?.(opportunity);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Create Proposal</span>
                  </button>
                </div>

                {opportunity.stage !== 'Won' && opportunity.stage !== 'Lost' && (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onMarkWon?.(opportunity);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Mark as Won</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onMarkLost?.(opportunity);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Mark as Lost</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Service & Lead Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            <Briefcase className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span className="truncate max-w-[150px]">{opportunity.service}</span>
          </span>

          {opportunity.leadCode && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/leads/${opportunity.leadId || opportunity.leadCode}`);
              }}
              className="inline-flex items-center text-[10px] font-mono font-semibold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              title="View original Lead"
            >
              {opportunity.leadCode}
            </span>
          )}
        </div>

        {/* Financial Value + Probability */}
        <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-lg p-2.5 border border-slate-100 dark:border-slate-700/60 mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Deal Value</div>
            <OpportunityValue
              value={opportunity.estimatedValue}
              probability={opportunity.probability}
              showWeighted={true}
              size="md"
            />
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-0.5">Win Prob.</div>
            <ProbabilityIndicator probability={opportunity.probability} showBar={true} size="sm" />
          </div>
        </div>
      </div>

      {/* Card Footer: Expected Close + Assigned Owner */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5" title={`Expected Close: ${opportunity.expectedCloseDate}`}>
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="truncate">Close: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{opportunity.expectedCloseDate}</strong></span>
          </div>

          <div className="flex items-center gap-1.5" title={`Owner: ${opportunity.owner.name}`}>
            <div className="w-5 h-5 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center text-[10px] font-bold">
              {opportunity.owner.avatar || opportunity.owner.name.charAt(0)}
            </div>
            <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[80px]">
              {opportunity.owner.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Quick Action buttons for fast touch interaction */}
        <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/opportunities/${opportunity.id}`)}
            className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg text-center transition-colors cursor-pointer"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onAddFollowUp?.(opportunity)}
            className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-[#5B4DB7] dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg text-center transition-colors cursor-pointer"
          >
            Follow-up
          </button>
          {opportunity.stage !== 'Won' && opportunity.stage !== 'Lost' && (
            <button
              type="button"
              onClick={() => onCreateProposal?.(opportunity)}
              className="py-1.5 px-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              title="Create Proposal"
            >
              + Proposal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
