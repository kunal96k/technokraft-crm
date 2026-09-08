import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ChevronDown,
  UserPlus,
  Building2,
  Contact,
  CalendarPlus,
  CheckSquare,
  CalendarCheck,
} from 'lucide-react';

interface QuickAddOption {
  id: string;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_ADD_OPTIONS: QuickAddOption[] = [
  { id: 'lead', label: 'Add Lead', category: 'CRM', icon: UserPlus },
  { id: 'company', label: 'Add Company', category: 'CRM', icon: Building2 },
  { id: 'contact', label: 'Add Contact', category: 'CRM', icon: Contact },
  { id: 'followup', label: 'Create Follow-up', category: 'Activity', icon: CalendarPlus },
  { id: 'task', label: 'Create Task', category: 'Activity', icon: CheckSquare },
  { id: 'meeting', label: 'Schedule Meeting', category: 'Activity', icon: CalendarCheck },
];

export const QuickAddDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (option: QuickAddOption) => {
    setIsOpen(false);
    if (option.id === 'lead') {
      navigate('/leads/add');
    } else if (option.id === 'followup' || option.id === 'task' || option.id === 'meeting') {
      navigate('/follow-ups');
    } else {
      navigate('/leads');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Quick Add"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-[13px] font-medium rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 min-h-[38px]"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span className="hidden sm:inline">Add</span>
        <ChevronDown className="w-3.5 h-3.5 text-white/80" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Actions
          </div>
          <div className="py-1">
            {QUICK_ADD_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-[#5B4DB7] transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-purple-50 text-[#5B4DB7] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
