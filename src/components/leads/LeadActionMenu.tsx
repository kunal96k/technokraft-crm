import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Eye,
  Edit,
  CalendarPlus,
  PhoneCall,
  Mail,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { Lead } from '../../types/leads';

interface LeadActionMenuProps {
  lead: Lead;
  onAction?: (action: string, lead: Lead) => void;
}

export const LeadActionMenu: React.FC<LeadActionMenuProps> = ({ lead, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleItemClick = (actionName: string) => {
    setIsOpen(false);
    if (actionName === 'view') {
      navigate(`/leads/${lead.id}`);
      return;
    }
    if (onAction) {
      onAction(actionName, lead);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/30"
        aria-label="Lead actions"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">{lead.leadCode}</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{lead.company.name}</p>
          </div>

          <button
            type="button"
            onClick={() => handleItemClick('view')}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>View Lead</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('edit')}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Edit Lead</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('followup')}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Add Follow-up</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            type="button"
            onClick={() => handleItemClick('call')}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Call Contact</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('email')}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Send Email</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button
            type="button"
            onClick={() => handleItemClick('status')}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Change Status</span>
          </button>

          <button
            type="button"
            onClick={() => handleItemClick('assign')}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Assign Employee</span>
          </button>
        </div>
      )}
    </div>
  );
};
