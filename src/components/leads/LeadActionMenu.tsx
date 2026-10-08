import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  Trash2,
} from 'lucide-react';
import { Lead } from '../../types/leads';

interface LeadActionMenuProps {
  lead: Lead;
  onAction?: (action: string, lead: Lead) => void;
}

export const LeadActionMenu: React.FC<LeadActionMenuProps> = ({ lead, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 200; // width of dropdown
    const menuHeight = 330; // height of dropdown menu with 7 items

    // Check if there is enough space below the button in the viewport
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

    const top = shouldOpenUpwards ? rect.top - menuHeight : rect.bottom + 4;
    const left = Math.max(10, rect.right - menuWidth);

    setMenuStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 9999,
      width: `${menuWidth}px`,
    });
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleItemClick = (e: React.MouseEvent, actionName: string) => {
    e.stopPropagation();
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
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/30 cursor-pointer ${
          isOpen ? 'bg-slate-100 dark:bg-slate-800 text-[#5B4DB7] dark:text-purple-400 ring-2 ring-[#5B4DB7]/20' : ''
        }`}
        aria-label="Lead actions"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">{lead.leadCode}</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{lead.company.name}</p>
            </div>

            <button
              type="button"
              onClick={(e) => handleItemClick(e, 'view')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>View Lead</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleItemClick(e, 'edit')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Edit Lead</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleItemClick(e, 'followup')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Add Follow-up</span>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            <button
              type="button"
              onClick={(e) => handleItemClick(e, 'call')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Call Contact</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleItemClick(e, 'email')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Send Email</span>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            <button
              type="button"
              onClick={(e) => handleItemClick(e, 'status')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Change Status</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleItemClick(e, 'assign')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#5B4DB7] dark:hover:text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Assign Employee</span>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            <button
              type="button"
              onClick={(e) => handleItemClick(e, 'delete')}
              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete Lead</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};
