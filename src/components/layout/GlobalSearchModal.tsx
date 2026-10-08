import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Users,
  Building,
  Mail,
  Calendar,
  ArrowRight,
  CornerDownLeft,
  Briefcase,
  FileText,
} from 'lucide-react';
import { fetchOpportunities } from '../../services/opportunityService';
import { fetchProposals } from '../../services/proposalService';
import { fetchLeads } from '../../services/leadService';
import { fetchEmployees } from '../../services/employeeService';
import { formatCurrencyINR } from '../../utils/currencyFormatters';
import { OpportunityRecord, ProposalRecord } from '../../types/opportunities';
import { Lead } from '../../types/leads';
import { Employee } from '../../types/employees';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: 'Reports' | 'Leads' | 'Opportunities' | 'Proposals' | 'Companies' | 'Contacts' | 'Employees';
  subtitle: string;
  path: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOpportunities({ size: 50 }).then((res) => setOpportunities(res.content || [])).catch(() => {});
      fetchProposals({ size: 50 }).then((res) => setProposals(res.content || [])).catch(() => {});
      fetchLeads({ size: 50 }).then((res) => setLeads(res.content || [])).catch(() => {});
      fetchEmployees({ size: 50 }).then((res) => setEmployees(res.content || [])).catch(() => {});
    }
  }, [isOpen]);

  const oppItems: SearchItem[] = opportunities.map((o) => ({
    id: `opp-${o.id}`,
    title: o.name,
    category: 'Opportunities',
    subtitle: `${o.companyName} • ${o.stage} • ${formatCurrencyINR(o.estimatedValue)}`,
    path: `/opportunities/${o.id}`,
  }));

  const propItems: SearchItem[] = proposals.map((p) => ({
    id: `prop-${p.id}`,
    title: `${p.proposalCode} - ${p.opportunityName}`,
    category: 'Proposals',
    subtitle: `${p.companyName} • ${p.status} • ${formatCurrencyINR(p.amount)}`,
    path: `/opportunities/proposals`,
  }));

  const leadItems: SearchItem[] = leads.map((l) => ({
    id: `lead-${l.id}`,
    title: l.company?.name || l.contact?.name || `Lead #${l.id}`,
    category: 'Leads',
    subtitle: `${l.contact?.name || ''} • ${l.service || 'IT Services'} • ${l.status || 'New'}`,
    path: `/leads/${l.id}`,
  }));

  const empItems: SearchItem[] = employees.map((e) => ({
    id: `emp-${e.id}`,
    title: e.name,
    category: 'Employees',
    subtitle: `${e.role || 'Staff'} • ${e.department || 'General'} • ${e.email || ''}`,
    path: `/reports/performance/${e.id}`,
  }));

  const navItems: SearchItem[] = [
    { id: 'rep-1', title: 'Performance Report', category: 'Reports', subtitle: 'Sales rep activities, targets & conversion rates', path: '/reports/performance' },
    { id: 'rep-2', title: 'CRM Analytics', category: 'Reports', subtitle: 'Lead source attribution, funnel, & pipeline forecast', path: '/reports/analytics' },
    { id: 'nav-emp', title: 'Employee Directory', category: 'Employees', subtitle: 'TechnoKraft staff, roles, workloads and targets', path: '/employees' },
    { id: 'nav-att', title: 'Attendance & Login Sessions', category: 'Employees', subtitle: 'Track rep working hours, punches and telemetry', path: '/employees/attendance' },
    { id: 'nav-fol', title: 'Follow-ups & Tasks', category: 'Reports', subtitle: 'Scheduled reminders, calls and client meetings', path: '/follow-ups' },
  ];

  const allSearchData = [...leadItems, ...oppItems, ...propItems, ...empItems, ...navItems];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedCategory('All');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Leads', 'Opportunities', 'Proposals', 'Employees', 'Reports'];

  const filteredItems = allSearchData.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      query.trim() === '' ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/50 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global CRM Search"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities, proposals, leads, employees..."
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-[15px] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 mr-2 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-slate-500 bg-white border border-slate-300 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-slate-100 overflow-x-auto text-xs no-scrollbar">
          <span className="text-slate-400 font-medium mr-1 select-none">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#5B4DB7] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onClose();
                  navigate(item.path);
                }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center flex-shrink-0">
                    {item.category === 'Opportunities' && <Briefcase className="w-4 h-4" />}
                    {item.category === 'Proposals' && <FileText className="w-4 h-4" />}
                    {item.category === 'Employees' && <Users className="w-4 h-4" />}
                    {item.category === 'Reports' && <Calendar className="w-4 h-4" />}
                    {item.category === 'Leads' && <Building className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#5B4DB7] transition-colors ml-2 flex-shrink-0" />
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Live CRM search across deals, quotes, and accounts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
              <CornerDownLeft className="w-3 h-3 inline" />
            </kbd>
            <span>to open</span>
          </div>
        </div>
      </div>
    </div>
  );
};
