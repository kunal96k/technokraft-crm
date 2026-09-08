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
import { getStoredOpportunities, getStoredProposals, formatCurrencyINR } from '../../data/mockOpportunities';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchMockItem {
  id: string;
  title: string;
  category: 'Reports' | 'Leads' | 'Opportunities' | 'Proposals' | 'Companies' | 'Contacts' | 'Tasks';
  subtitle: string;
  path: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  const opportunities = getStoredOpportunities();
  const proposals = getStoredProposals();

  const oppItems: SearchMockItem[] = opportunities.map((o) => ({
    id: `opp-${o.id}`,
    title: o.name,
    category: 'Opportunities',
    subtitle: `${o.companyName} • ${o.stage} • ${formatCurrencyINR(o.estimatedValue)}`,
    path: `/opportunities/${o.id}`,
  }));

  const propItems: SearchMockItem[] = proposals.map((p) => ({
    id: `prop-${p.id}`,
    title: `${p.proposalCode} - ${p.opportunityName}`,
    category: 'Proposals',
    subtitle: `${p.companyName} • ${p.status} • ${formatCurrencyINR(p.amount)}`,
    path: `/opportunities/proposals`,
  }));

  const staticItems: SearchMockItem[] = [
    { id: 'rep-1', title: 'Performance Report', category: 'Reports', subtitle: 'Sales rep activities, targets & conversion rates', path: '/reports/performance' },
    { id: 'rep-2', title: 'CRM Analytics', category: 'Reports', subtitle: 'Lead source attribution, funnel, & pipeline forecast', path: '/reports/analytics' },
    { id: 'rep-3', title: 'Rahul Patil - Performance Record', category: 'Reports', subtitle: 'Sales Executive • 92% Target Achievement', path: '/reports/performance/emp-01' },
    { id: 'rep-4', title: 'Priya Shah - Performance Record', category: 'Reports', subtitle: 'Senior Business Development • 89% Target Achievement', path: '/reports/performance/emp-02' },
    { id: 'emp-dir', title: 'Employee Directory', category: 'Contacts', subtitle: 'TechnoKraft staff, roles, workloads and targets', path: '/employees' },
    { id: 'att-dir', title: 'Attendance & Login Sessions', category: 'Tasks', subtitle: 'Track rep working hours, punches and telemetry', path: '/employees/attendance' },
    { id: '1', title: 'ABC Technologies', category: 'Companies', subtitle: 'Cloud Migration & IT Services • Delhi', path: '/leads' },
    { id: '2', title: 'Rahul Patil', category: 'Contacts', subtitle: 'VP of Technology at ABC Tech • rahul@abctech.com', path: '/leads' },
    { id: '3', title: 'XYZ Solutions Ltd', category: 'Companies', subtitle: 'Enterprise Software Client • Mumbai', path: '/leads' },
    { id: '4', title: 'Priya Sharma', category: 'Contacts', subtitle: 'Procurement Lead • priya@xyz.com', path: '/leads' },
    { id: '5', title: 'Follow-up Call with Global IT Services', category: 'Tasks', subtitle: 'Due Today at 02:30 PM • High Priority', path: '/follow-ups' },
    { id: '7', title: 'Sneha Kulkarni', category: 'Contacts', subtitle: 'Account Executive • TechnoKraft Pune', path: '/employees' },
  ];

  const allSearchData = [...oppItems, ...propItems, ...staticItems];

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

  const categories = ['All', 'Reports', 'Opportunities', 'Proposals', 'Leads', 'Companies', 'Contacts', 'Tasks'];

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
            placeholder="Search opportunities, proposals, leads, companies..."
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
                    {item.category === 'Companies' && <Building className="w-4 h-4" />}
                    {item.category === 'Contacts' && <Users className="w-4 h-4" />}
                    {item.category === 'Tasks' && <Calendar className="w-4 h-4" />}
                    {item.category === 'Leads' && <Mail className="w-4 h-4" />}
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
