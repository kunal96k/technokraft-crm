import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Phone,
  Building2,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { MeetingRecord, MeetingStatus } from '../../../types/followUps';

interface MeetingTableProps {
  meetings: MeetingRecord[];
  onOpenDetails: (meeting: MeetingRecord) => void;
  onOpenComplete: (meeting: MeetingRecord) => void;
  onCancelMeeting: (meetingId: string) => void;
}

export const MeetingTable: React.FC<MeetingTableProps> = ({
  meetings,
  onOpenDetails,
  onOpenComplete,
  onCancelMeeting,
}) => {
  const getStatusBadge = (status: MeetingStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Completed
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Confirmed
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60">
            <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Scheduled
          </span>
        );
      case 'Cancelled':
      case 'No Show':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
          <tr>
            <th className="py-3 px-3 min-w-[140px]">Date & Time</th>
            <th className="py-3 px-3 min-w-[200px]">Company & Lead</th>
            <th className="py-3 px-3 min-w-[140px]">Contact Person</th>
            <th className="py-3 px-3 min-w-[140px]">Meeting Type</th>
            <th className="py-3 px-3 min-w-[130px]">Host / Rep</th>
            <th className="py-3 px-3 min-w-[120px]">Location</th>
            <th className="py-3 px-3 min-w-[100px]">Status</th>
            <th className="py-3 px-3 text-right min-w-[120px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {meetings.map((item) => {
            const isCompleted = item.status === 'Completed';

            return (
              <tr
                key={item.id}
                className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                  isCompleted ? 'bg-slate-50/30 dark:bg-slate-950/30' : ''
                }`}
              >
                {/* Date & Time */}
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.startTime} - {item.endTime}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{item.date}</span>
                  </div>
                </td>

                {/* Company & Title */}
                <td className="py-3 px-3">
                  <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    {item.leadCode}
                  </div>
                  <Link
                    to={`/leads/${item.leadId}`}
                    className="font-bold text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-400 flex items-center gap-1"
                  >
                    <span className="truncate">{item.companyName}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </Link>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate block mt-0.5">
                    {item.title}
                  </span>
                </td>

                {/* Contact */}
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.contactName}
                  </div>
                  {item.contactDesignation && (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {item.contactDesignation}
                    </div>
                  )}
                </td>

                {/* Meeting Type */}
                <td className="py-3 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/40">
                    {item.meetingType}
                  </span>
                </td>

                {/* Host */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-[#5B4DB7] dark:text-purple-300 text-[10px] font-bold flex items-center justify-center">
                      {item.assignedAvatar || item.assignedEmployee.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate text-slate-700 dark:text-slate-300">{item.assignedEmployee}</span>
                  </div>
                </td>

                {/* Location */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    {item.location === 'Online' ? (
                      <Video className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    ) : item.location === 'Phone' ? (
                      <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.location}</span>
                  </div>
                  {item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline block truncate mt-0.5"
                    >
                      Join Link
                    </a>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  {getStatusBadge(item.status)}
                </td>

                {/* Actions */}
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => onOpenComplete(item)}
                        className="px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                        title="Complete and log minutes"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenDetails(item)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="View Meeting Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
