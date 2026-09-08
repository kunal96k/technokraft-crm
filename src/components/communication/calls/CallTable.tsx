import React from 'react';
import { CallRecord } from '../../../types/calls';
import { CallStatusBadge } from './CallStatusBadge';
import { CallResultBadge } from './CallResultBadge';
import { CallTypeBadge } from './CallTypeBadge';
import { CallActionMenu } from './CallActionMenu';
import { PhoneCall, CalendarPlus, ExternalLink } from 'lucide-react';

interface CallTableProps {
  calls: CallRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  onView: (call: CallRecord) => void;
  onEdit: (call: CallRecord) => void;
  onAddFollowUp: (call: CallRecord) => void;
  onScheduleMeeting: (call: CallRecord) => void;
  onOpenLead: (leadId: string) => void;
  onCreateOpportunity?: (call: CallRecord) => void;
}

export const CallTable: React.FC<CallTableProps> = ({
  calls,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  isAllSelected,
  onView,
  onEdit,
  onAddFollowUp,
  onScheduleMeeting,
  onOpenLead,
  onCreateOpportunity,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3.5 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded text-[#5B4DB7] focus:ring-[#5B4DB7] border-slate-300 cursor-pointer"
                  aria-label="Select all calls"
                />
              </th>
              <th className="py-3.5 px-3">Date / Time</th>
              <th className="py-3.5 px-3">Company</th>
              <th className="py-3.5 px-3">Contact</th>
              <th className="py-3.5 px-3">Phone</th>
              <th className="py-3.5 px-3">Type</th>
              <th className="py-3.5 px-3">Duration</th>
              <th className="py-3.5 px-3">Result</th>
              <th className="py-3.5 px-3">Employee</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {calls.map((call) => {
              const isSelected = selectedIds.includes(call.id);

              return (
                <tr
                  key={call.id}
                  onClick={() => onView(call)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                    isSelected ? 'bg-purple-50/30' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td
                    className="py-3 pl-4 pr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(call.id)}
                      className="w-4 h-4 rounded text-[#5B4DB7] focus:ring-[#5B4DB7] border-slate-300 cursor-pointer"
                      aria-label={`Select call for ${call.companyName}`}
                    />
                  </td>

                  {/* Date/Time */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900 font-mono text-[11px]">
                      {call.date}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{call.time}</div>
                  </td>

                  {/* Company */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 group-hover:text-[#5B4DB7] transition-colors line-clamp-1 max-w-[180px]">
                      {call.companyName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <span>{call.leadCode}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLead(call.leadId);
                        }}
                        className="text-slate-400 hover:text-[#5B4DB7]"
                        title="Open Lead"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{call.contactName}</div>
                    <div className="text-[11px] text-slate-500">{call.contactDesignation}</div>
                  </td>

                  {/* Phone */}
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                    {call.contactPhone}
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <CallTypeBadge type={call.type} />
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                    {call.duration || '—'}
                  </td>

                  {/* Result */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <CallResultBadge result={call.result} />
                  </td>

                  {/* Employee */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-[#5B4DB7] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {call.employeeAvatar}
                      </div>
                      <span className="text-slate-700 font-medium">{call.employeeName}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <CallStatusBadge status={call.status} />
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 pr-4 pl-2 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onAddFollowUp(call)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#5B4DB7] hover:bg-purple-50 transition-colors"
                        title="Add Follow-up"
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </button>

                      <CallActionMenu
                        call={call}
                        onView={onView}
                        onEdit={onEdit}
                        onAddFollowUp={onAddFollowUp}
                        onScheduleMeeting={onScheduleMeeting}
                        onOpenLead={onOpenLead}
                        onCreateOpportunity={onCreateOpportunity}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
