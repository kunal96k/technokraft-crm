import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Globe, AlertCircle, Calendar } from 'lucide-react';
import { Lead } from '../../types/leads';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadPriorityBadge } from './LeadPriorityBadge';
import { LeadScoreBadge } from './LeadScoreBadge';
import { LeadActionMenu } from './LeadActionMenu';

interface LeadTableProps {
  leads: Lead[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onAction?: (action: string, lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  sortField,
  sortOrder,
  onSort,
  onAction,
}) => {
  const navigate = useNavigate();
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < leads.length;

  const renderSortHeader = (label: string, field: string) => (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider text-[11px]"
    >
      <span>{label}</span>
      <ArrowUpDown
        className={`w-3 h-3 ${sortField === field ? 'text-[#5B4DB7]' : 'text-slate-400'}`}
      />
    </button>
  );

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse min-w-[1050px]">
        <thead className="bg-slate-50/90 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/90 dark:border-slate-800 select-none">
          <tr>
            <th className="w-10 py-3.5 pl-4 pr-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isPartiallySelected;
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#5B4DB7] focus:ring-[#5B4DB7] cursor-pointer"
                aria-label="Select all leads"
              />
            </th>
            <th className="py-3.5 px-3 whitespace-nowrap">{renderSortHeader('Lead ID', 'leadCode')}</th>
            <th className="py-3.5 px-3 min-w-[190px]">{renderSortHeader('Company', 'company')}</th>
            <th className="py-3.5 px-3 min-w-[160px]">Contact</th>
            <th className="py-3.5 px-3 min-w-[150px]">Service</th>
            <th className="py-3.5 px-2.5">Source</th>
            <th className="py-3.5 px-3">{renderSortHeader('Score', 'score')}</th>
            <th className="py-3.5 px-3">{renderSortHeader('Status', 'status')}</th>
            <th className="py-3.5 px-2.5">Priority</th>
            <th className="py-3.5 px-3 min-w-[140px]">{renderSortHeader('Assigned', 'assigned')}</th>
            <th className="py-3.5 px-3 min-w-[150px]">{renderSortHeader('Next Follow-up', 'followUp')}</th>
            <th className="w-12 py-3.5 pr-4 pl-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-sans">
          {leads.map((lead) => {
            const isSelected = selectedIds.includes(lead.id);

            return (
              <tr
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className={`cursor-pointer transition-colors group ${
                  isSelected ? 'bg-purple-50/40 dark:bg-purple-950/30 hover:bg-purple-50/60 dark:hover:bg-purple-950/40' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Checkbox */}
                <td
                  className="py-3 pl-4 pr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(lead.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(lead.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#5B4DB7] focus:ring-[#5B4DB7] cursor-pointer"
                    aria-label={`Select lead ${lead.leadCode}`}
                  />
                </td>

                {/* Lead ID */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200 text-[11.5px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700 group-hover:border-purple-200 dark:group-hover:border-purple-800 group-hover:bg-purple-50/50 dark:group-hover:bg-purple-950/40 transition-colors">
                    {lead.leadCode}
                  </span>
                </td>

                {/* Company Name & Website */}
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900 dark:text-white text-xs hover:text-[#5B4DB7] dark:hover:text-purple-400 transition-colors leading-tight">
                    {lead.company.name}
                  </div>
                  {lead.company.website && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-normal">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[160px]">{lead.company.website}</span>
                    </div>
                  )}
                </td>

                {/* Contact Person & Designation */}
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-800 dark:text-slate-200 text-xs leading-tight">
                    {lead.contact.name}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[150px]">
                    {lead.contact.designation}
                  </div>
                </td>

                {/* Service */}
                <td className="py-3 px-3">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/70 dark:border-slate-700 truncate max-w-[160px]">
                    {lead.service}
                  </span>
                </td>

                {/* Lead Source */}
                <td className="py-3 px-2.5 whitespace-nowrap text-[11.5px] text-slate-600 dark:text-slate-300">
                  {lead.source}
                </td>

                {/* Lead Score */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <LeadScoreBadge score={lead.score} />
                </td>

                {/* Status */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <LeadStatusBadge status={lead.status} />
                </td>

                {/* Priority */}
                <td className="py-3 px-2.5 whitespace-nowrap">
                  <LeadPriorityBadge priority={lead.priority} />
                </td>

                {/* Assigned To */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#5B4DB7] dark:text-purple-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {lead.assignedEmployee.avatar}
                    </div>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                      {lead.assignedEmployee.name}
                    </span>
                  </div>
                </td>

                {/* Next Follow-up */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {lead.nextFollowUp ? (
                    <div
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                        lead.nextFollowUp.isOverdue
                          ? 'text-rose-600 dark:text-rose-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {lead.nextFollowUp.isOverdue ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                      <span>{lead.nextFollowUp.displayString}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] italic">Not scheduled</span>
                  )}
                </td>

                {/* Actions */}
                <td
                  className="py-3 pr-4 pl-2 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LeadActionMenu lead={lead} onAction={onAction} />
                </td>
              </tr>
            );
          })}

          {leads.length === 0 && (
            <tr>
              <td colSpan={12} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                No leads found matching current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
