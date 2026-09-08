import React from 'react';
import { FollowUpType } from '../../types/followUps';
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  ClipboardList,
  FileText,
  Clock,
} from 'lucide-react';

interface FollowUpTypeBadgeProps {
  type: FollowUpType;
  className?: string;
  showIconOnly?: boolean;
}

export const FollowUpTypeBadge: React.FC<FollowUpTypeBadgeProps> = ({
  type,
  className = '',
  showIconOnly = false,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'Call':
        return {
          icon: Phone,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
          label: 'Call',
        };
      case 'Email':
        return {
          icon: Mail,
          color: 'text-blue-700 bg-blue-50 border-blue-200/80',
          label: 'Email',
        };
      case 'WhatsApp':
        return {
          icon: MessageSquare,
          color: 'text-teal-700 bg-teal-50 border-teal-200/80',
          label: 'WhatsApp',
        };
      case 'Meeting':
        return {
          icon: Calendar,
          color: 'text-purple-700 bg-purple-50 border-purple-200/80',
          label: 'Meeting',
        };
      case 'Requirement Follow-up':
        return {
          icon: ClipboardList,
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200/80',
          label: 'Requirement',
        };
      case 'Proposal Follow-up':
        return {
          icon: FileText,
          color: 'text-amber-700 bg-amber-50 border-amber-200/80',
          label: 'Proposal',
        };
      case 'General Follow-up':
      default:
        return {
          icon: Clock,
          color: 'text-slate-700 bg-slate-100 border-slate-200',
          label: 'General',
        };
    }
  };

  const { icon: Icon, color, label } = getConfig();

  if (showIconOnly) {
    return (
      <span
        title={type}
        className={`inline-flex items-center justify-center p-1 rounded-md border ${color} ${className}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium ${color} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};
