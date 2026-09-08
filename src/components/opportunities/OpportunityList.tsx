import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit2,
  CalendarClock,
  FileText,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowUpDown,
  Calendar,
} from 'lucide-react';
import { OpportunityRecord, OpportunityStage } from '../../types/opportunities';
import { OpportunityStageBadge } from './OpportunityStageBadge';
import { OpportunityValue } from './OpportunityValue';
import { ProbabilityIndicator } from './ProbabilityIndicator';

interface OpportunityListProps {
  opportunities: OpportunityRecord[];
  onMoveStage?: (id: string, newStage: OpportunityStage) => void;
  onEdit?: (opp: OpportunityRecord) => void;
  onAddFollowUp?: (opp: OpportunityRecord) => void;
  onCreateProposal?: (opp: OpportunityRecord) => void;
  onMarkWon?: (opp: OpportunityRecord) => void;
  onMarkLost?: (opp: OpportunityRecord) => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({
  opportunities,
  onMoveStage,
  onEdit,
  onAddFollowUp,
  onCreateProposal,
  onMarkWon,
  onMarkLost,
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<'value' | 'prob' | 'date'>('value');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: 'value' | 'prob' | 'date') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sorted = [...opportunities].sort((a, b) => {
    let diff = 0;
    if (sortField === 'value') {
      diff = a.estimatedValue - b.estimatedValue;
    } else if (sortField === 'prob') {
      diff = a.probability - b.probability;
    } else if (sortField === 'date') {
      diff = a.expectedCloseDate.localeCompare(b.expectedCloseDate);
    }
    return sortAsc ? diff : -diff;
  });

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs overflow-hidden transition-colors duration-200">
      {/* DESKTOP DATA TABLE (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Opportunity & Company</th>
              <th className="py-3.5 px-3 font-semibold">Lead</th>
              <th className="py-3.5 px-3 font-semibold">Service</th>
              <th className="py-3.5 px-3 font-semibold">Stage</th>
              <th
                onClick={() => handleSort('value')}
                className="py-3.5 px-3 font-semibold cursor-pointer hover:text-slate-800 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Value</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('prob')}
                className="py-3.5 px-3 font-semibold cursor-pointer hover:text-slate-800 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Probability</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('date')}
                className="py-3.5 px-3 font-semibold cursor-pointer hover:text-slate-800 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Expected Close</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-3 font-semibold">Assigned To</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.length > 0 ? (
              sorted.map((opp) => (
                <tr
                  key={opp.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
                >
                  {/* Opportunity & Company */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#5B4DB7] dark:group-hover:text-purple-400 transition-colors leading-tight">
                      {opp.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {opp.companyName}
                    </div>
                  </td>

                  {/* Lead Code */}
                  <td className="py-3 px-3">
                    {opp.leadCode ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads/${opp.leadId || opp.leadCode}`);
                        }}
                        className="inline-flex font-mono text-[11px] text-[#5B4DB7] dark:text-purple-300 hover:underline font-semibold bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded"
                      >
                        {opp.leadCode}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>

                  {/* Service */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[140px] block">
                      {opp.service}
                    </span>
                  </td>

                  {/* Stage */}
                  <td className="py-3 px-3">
                    <OpportunityStageBadge stage={opp.stage} size="sm" />
                  </td>

                  {/* Value */}
                  <td className="py-3 px-3">
                    <OpportunityValue value={opp.estimatedValue} compact={true} size="sm" />
                  </td>

                  {/* Probability */}
                  <td className="py-3 px-3">
                    <ProbabilityIndicator probability={opp.probability} showBar={true} size="sm" />
                  </td>

                  {/* Expected Close */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{opp.expectedCloseDate}</span>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center text-[10px] font-bold">
                        {opp.owner.avatar || opp.owner.name.charAt(0)}
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[90px]">
                        {opp.owner.name}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/opportunities/${opp.id}`)}
                        title="View Opportunity"
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit?.(opp)}
                        title="Edit Opportunity"
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddFollowUp?.(opp)}
                        title="Add Follow-up"
                        className="p-1.5 text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                      </button>
                      {opp.stage !== 'Won' && opp.stage !== 'Lost' && (
                        <button
                          type="button"
                          onClick={() => onCreateProposal?.(opp)}
                          title="Create Proposal"
                          className="p-1.5 text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  No opportunities match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST CARDS (< md) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {sorted.length > 0 ? (
          sorted.map((opp) => (
            <div
              key={opp.id}
              className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors space-y-2.5"
              onClick={() => navigate(`/opportunities/${opp.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {opp.companyName}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{opp.name}</h4>
                </div>
                <OpportunityStageBadge stage={opp.stage} size="xs" />
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60">
                <OpportunityValue value={opp.estimatedValue} compact={true} size="sm" />
                <ProbabilityIndicator probability={opp.probability} showBar={true} size="sm" />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  Close: <strong className="text-slate-700 dark:text-slate-300">{opp.expectedCloseDate}</strong>
                </span>
                <span>
                  Owner: <strong className="text-slate-700 dark:text-slate-300">{opp.owner.name}</strong>
                </span>
              </div>

              <div
                className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold cursor-pointer"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onAddFollowUp?.(opp)}
                  className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-[#5B4DB7] dark:text-indigo-300 rounded-md text-xs font-semibold cursor-pointer"
                >
                  Follow-up
                </button>
                {opp.stage !== 'Won' && opp.stage !== 'Lost' && (
                  <button
                    type="button"
                    onClick={() => onCreateProposal?.(opp)}
                    className="px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-md text-xs font-semibold cursor-pointer"
                  >
                    Proposal
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No opportunities found.
          </div>
        )}
      </div>
    </div>
  );
};
