import React, { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import {
  Search,
  Building2,
  User,
  Phone,
  Mail,
  Check,
  ChevronDown,
  X,
  Loader2,
  Tag,
  AlertCircle,
  Database
} from 'lucide-react';
import { Lead } from '../../types/leads';
import { fetchLeads, fetchLeadById } from '../../services/leadService';

export interface LeadSearchSelectProps {
  value?: string | number;
  initialLead?: Lead | null;
  initialLeadName?: string;
  onChange: (leadId: string, lead: Lead | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  allowClear?: boolean;
  showMetaPreview?: boolean;
  className?: string;
  id?: string;
  autoFocus?: boolean;
}

// Helper to highlight matching text in search results
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim() || !text) return <span>{text}</span>;
  const q = query.trim();
  const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQ})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-purple-200 dark:bg-purple-900/80 text-purple-950 dark:text-purple-100 font-semibold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export const LeadSearchSelect: React.FC<LeadSearchSelectProps> = ({
  value,
  initialLead,
  initialLeadName,
  onChange,
  placeholder = 'Search by company, contact, email, phone, or lead code...',
  label,
  required = false,
  disabled = false,
  error,
  helperText,
  allowClear = true,
  showMetaPreview = false,
  className = '',
  id = 'lead-typeahead-select',
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(initialLead || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [totalMatches, setTotalMatches] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [, startTransition] = useTransition();

  // Sync initial lead or fetch lead details when value prop is passed as string/id
  useEffect(() => {
    if (initialLead) {
      setSelectedLead(initialLead);
      return;
    }

    if (!value || String(value).trim() === '') {
      setSelectedLead(null);
      return;
    }

    const valStr = String(value).trim();
    if (selectedLead && (String(selectedLead.id) === valStr || selectedLead.leadCode === valStr)) {
      return;
    }

    // Try finding in current search results first
    const existing = leads.find((l) => String(l.id) === valStr || l.leadCode === valStr);
    if (existing) {
      setSelectedLead(existing);
      return;
    }

    // Fetch single lead from backend
    let isMounted = true;
    fetchLeadById(valStr).then((res) => {
      if (isMounted && res) {
        setSelectedLead(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [value, initialLead, leads, selectedLead]);

  // Debounce user keystrokes (250ms delay) to prevent UI freezing & avoid backend flooding with 10K+ records
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query backend with debounced search term
  const queryBackend = useCallback(async (query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const res = await fetchLeads({
        search: query.trim() || undefined,
        size: 25,
        sortBy: 'id',
        sortDirection: 'desc',
      });

      if (!controller.signal.aborted) {
        startTransition(() => {
          setLeads(res.content || []);
          setTotalMatches(res.totalElements || 0);
          setSelectedIndex(res.content.length > 0 ? 0 : -1);
          setIsLoading(false);
        });
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch data whenever dropdown opens or debounced query updates
  useEffect(() => {
    if (isOpen) {
      queryBackend(debouncedQuery);
    }
  }, [isOpen, debouncedQuery, queryBackend]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation support (ArrowUp, ArrowDown, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < leads.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : leads.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < leads.length) {
        handleSelectLead(leads[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-lead-item]');
      const activeItem = items[selectedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    onChange(String(lead.id), lead);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLead(null);
    onChange('', null);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef} id={id}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Main Trigger & Typeahead Input Box */}
      <div className="relative">
        <div
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }}
          className={`w-full min-h-[42px] px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs ${
            disabled
              ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              : isOpen
              ? 'border-[#5B4DB7] dark:border-purple-500 ring-2 ring-[#5B4DB7]/20 dark:ring-purple-500/20'
              : error
              ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          {/* Selected Lead Badge or Search Placeholder */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Building2 className={`w-4 h-4 flex-shrink-0 ${selectedLead ? 'text-[#5B4DB7] dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`} />

            {selectedLead && !isOpen ? (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {selectedLead.company?.name || 'Unnamed Company'}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/50 flex-shrink-0">
                  {selectedLead.leadCode}
                </span>
                {selectedLead.contact?.name && (
                  <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    • {selectedLead.contact.name}
                  </span>
                )}
              </div>
            ) : initialLeadName && value && !isOpen ? (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {initialLeadName}
                </span>
              </div>
            ) : isOpen ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedLead ? `Currently: ${selectedLead.company?.name} (Type to search 10K+ leads...)` : placeholder}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  autoFocus={autoFocus || isOpen}
                />
              </div>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                {placeholder}
              </span>
            )}
          </div>

          {/* Right Action Icons (Clear, Loading, Chevron) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400 animate-spin" />
            )}

            {allowClear && selectedLead && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Clear selected client"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#5B4DB7]' : ''}`} />
          </div>
        </div>

        {/* Dropdown Floating Popover */}
        {isOpen && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-80 flex flex-col"
          >
            {/* Header / Stats Info Bar */}
            <div className="px-3.5 py-2 bg-slate-50/90 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                <span>
                  {debouncedQuery
                    ? `Found ${totalMatches} matching leads in database`
                    : `Recent Active Leads (${totalMatches > 0 ? totalMatches : leads.length} records available)`}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">↑↓ to navigate, Enter to select</span>
            </div>

            {/* Scrollable Results List */}
            <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
              {leads.length > 0 ? (
                leads.map((lead, idx) => {
                  const isSelected = selectedLead && String(selectedLead.id) === String(lead.id);
                  const isHighlighted = idx === selectedIndex;

                  return (
                    <div
                      key={lead.id}
                      data-lead-item
                      onClick={() => handleSelectLead(lead)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-3 py-2.5 rounded-xl cursor-pointer transition-colors flex items-start justify-between gap-3 text-xs ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80'
                          : isHighlighted
                          ? 'bg-slate-50 dark:bg-slate-800/80'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        {/* Company Name & Lead Code */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white leading-tight">
                            <HighlightMatch text={lead.company?.name || 'Unnamed Company'} query={debouncedQuery} />
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <HighlightMatch text={lead.leadCode} query={debouncedQuery} />
                          </span>
                          {lead.status && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {lead.status}
                            </span>
                          )}
                        </div>

                        {/* Contact Person & Designation */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300 flex-wrap">
                          {lead.contact?.name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <HighlightMatch text={lead.contact.name} query={debouncedQuery} />
                              {lead.contact.designation && <span className="text-slate-400">({lead.contact.designation})</span>}
                            </span>
                          )}
                          {lead.contact?.phone && (
                            <span className="flex items-center gap-1 font-mono text-slate-500 dark:text-slate-400">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <HighlightMatch text={lead.contact.phone} query={debouncedQuery} />
                            </span>
                          )}
                          {lead.contact?.email && (
                            <span className="hidden sm:flex items-center gap-1 font-mono text-slate-500 dark:text-slate-400">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <HighlightMatch text={lead.contact.email} query={debouncedQuery} />
                            </span>
                          )}
                        </div>

                        {/* Service Tag */}
                        {lead.service && (
                          <div className="flex items-center gap-1 text-[10px] text-purple-700 dark:text-purple-300">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{lead.service}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Checkmark / Score Indicator */}
                      <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        {typeof lead.score === 'number' && (
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-auto">
                            Score: <strong className="text-emerald-600 dark:text-emerald-400">{lead.score}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : isLoading ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 text-[#5B4DB7] animate-spin mx-auto" />
                  <p>Searching through 10,000+ CRM leads in database...</p>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No matching clients or leads found</p>
                  <p className="text-[11px]">
                    {debouncedQuery
                      ? `No records found matching "${debouncedQuery}". Try another keyword, email, or phone.`
                      : 'No leads available in the database yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error and Helper Text */}
      {error && (
        <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
      {!error && helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      {/* Auto-resolved Lead Meta Summary Card */}
      {showMetaPreview && selectedLead && (
        <div className="mt-2 p-3 bg-purple-50/60 dark:bg-slate-950/60 rounded-xl border border-purple-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-300 text-[11px] animate-in fade-in duration-150">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Contact Person:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {selectedLead.contact?.name || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Designation:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
              {selectedLead.contact?.designation || 'Stakeholder'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Interested Service:</span>
            <span className="font-semibold text-purple-700 dark:text-purple-300 truncate block">
              {selectedLead.service || 'Custom Software'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Score / Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {selectedLead.score ?? 50}/100 • {selectedLead.status || 'NEW'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
