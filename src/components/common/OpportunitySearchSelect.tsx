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
  Database,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { OpportunityRecord } from '../../types/opportunities';
import { fetchOpportunities, fetchOpportunityById } from '../../services/opportunityService';
import { formatCurrencyINR } from '../../utils/currencyFormatters';
import { OpportunityStageBadge } from '../opportunities/OpportunityStageBadge';

export interface OpportunitySearchSelectProps {
  value?: string | number;
  initialOpportunity?: OpportunityRecord | null;
  onChange: (opportunityId: string, opportunity: OpportunityRecord | null) => void;
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
          <mark
            key={i}
            className="bg-purple-200 dark:bg-purple-900/80 text-purple-950 dark:text-purple-100 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export const OpportunitySearchSelect: React.FC<OpportunitySearchSelectProps> = ({
  value,
  initialOpportunity,
  onChange,
  placeholder = 'Search opportunities by deal title, company, contact, or code...',
  label,
  required = false,
  disabled = false,
  error,
  helperText,
  allowClear = true,
  showMetaPreview = true,
  className = '',
  id = 'opportunity-typeahead-select',
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<OpportunityRecord | null>(initialOpportunity || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [totalMatches, setTotalMatches] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [, startTransition] = useTransition();

  // Sync initial opportunity or fetch when value prop changes
  useEffect(() => {
    if (initialOpportunity) {
      setSelectedOpp(initialOpportunity);
      return;
    }

    if (!value || String(value).trim() === '') {
      setSelectedOpp(null);
      return;
    }

    const valStr = String(value).trim();
    if (selectedOpp && (String(selectedOpp.id) === valStr || selectedOpp.opportunityCode === valStr)) {
      return;
    }

    const existing = opportunities.find((o) => String(o.id) === valStr || o.opportunityCode === valStr);
    if (existing) {
      setSelectedOpp(existing);
      return;
    }

    let isMounted = true;
    fetchOpportunityById(valStr)
      .then((res) => {
        if (isMounted && res) {
          setSelectedOpp(res);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [value, initialOpportunity, opportunities, selectedOpp]);

  // Debounce keystrokes (250ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query backend
  const queryBackend = useCallback(async (query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const res = await fetchOpportunities({
        search: query.trim() || undefined,
        size: 25,
        sortBy: 'id',
        sortDirection: 'desc',
      });

      if (!controller.signal.aborted) {
        startTransition(() => {
          setOpportunities(res.content || []);
          setTotalMatches(res.totalElements || 0);
          setSelectedIndex(res.content.length > 0 ? 0 : -1);
          setIsLoading(false);
        });
      }
    } catch {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch data whenever dropdown opens or query updates
  useEffect(() => {
    if (isOpen) {
      queryBackend(debouncedQuery);
    }
  }, [isOpen, debouncedQuery, queryBackend]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
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
      setSelectedIndex((prev) => (prev < opportunities.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : opportunities.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < opportunities.length) {
        handleSelectOpportunity(opportunities[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-opp-item]');
      const activeItem = items[selectedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectOpportunity = (opp: OpportunityRecord) => {
    setSelectedOpp(opp);
    onChange(String(opp.id), opp);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOpp(null);
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
          {/* Selected Opportunity Badge or Search Input */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <TrendingUp
              className={`w-4 h-4 flex-shrink-0 ${
                selectedOpp ? 'text-[#5B4DB7] dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            />

            {selectedOpp && !isOpen ? (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {selectedOpp.name}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/50 flex-shrink-0">
                  {selectedOpp.opportunityCode}
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  • {selectedOpp.companyName}
                </span>
                <span className="font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300 ml-auto flex-shrink-0">
                  {formatCurrencyINR(selectedOpp.estimatedValue)}
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
                  placeholder={
                    selectedOpp
                      ? `Currently: ${selectedOpp.name} (Type to search deals...)`
                      : placeholder
                  }
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

            {allowClear && selectedOpp && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Clear selected deal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <ChevronDown
              className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#5B4DB7]' : ''
              }`}
            />
          </div>
        </div>

        {/* Dropdown Floating Popover */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-80 flex flex-col">
            {/* Header Info Bar */}
            <div className="px-3.5 py-2 bg-slate-50/90 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                <span>
                  {debouncedQuery
                    ? `Found ${totalMatches} matching opportunities`
                    : `Active Pipeline Deals (${totalMatches > 0 ? totalMatches : opportunities.length} available)`}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">↑↓ to navigate, Enter to select</span>
            </div>

            {/* Scrollable Results List */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1"
            >
              {opportunities.length > 0 ? (
                opportunities.map((opp, idx) => {
                  const isSelected = selectedOpp && String(selectedOpp.id) === String(opp.id);
                  const isHighlighted = idx === selectedIndex;

                  return (
                    <div
                      key={opp.id}
                      data-opp-item
                      onClick={() => handleSelectOpportunity(opp)}
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
                        {/* Deal Name & Code & Stage */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white leading-tight">
                            <HighlightMatch text={opp.name} query={debouncedQuery} />
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <HighlightMatch text={opp.opportunityCode} query={debouncedQuery} />
                          </span>
                          <OpportunityStageBadge stage={opp.stage} />
                        </div>

                        {/* Company & Contact */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <HighlightMatch text={opp.companyName} query={debouncedQuery} />
                          </span>
                          {opp.contactName && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <User className="w-3 h-3 text-slate-400" />
                              <HighlightMatch text={opp.contactName} query={debouncedQuery} />
                            </span>
                          )}
                          {opp.service && (
                            <div className="flex items-center gap-1 text-[10px] text-purple-700 dark:text-purple-300">
                              <Tag className="w-2.5 h-2.5" />
                              <span>{opp.service}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Value & Selection */}
                      <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : null}
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white mt-auto">
                          {formatCurrencyINR(opp.estimatedValue)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : isLoading ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 text-[#5B4DB7] animate-spin mx-auto" />
                  <p>Searching active opportunities in pipeline...</p>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No matching opportunities found
                  </p>
                  <p className="text-[11px]">
                    {debouncedQuery
                      ? `No deals found matching "${debouncedQuery}". Try searching by client name or lead code.`
                      : 'No opportunities available in the active pipeline.'}
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

      {/* Auto-resolved Opportunity Meta Summary Card */}
      {showMetaPreview && selectedOpp && (
        <div className="mt-2 p-3 bg-purple-50/60 dark:bg-slate-950/60 rounded-xl border border-purple-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-300 text-[11px] animate-in fade-in duration-150">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Company:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {selectedOpp.companyName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Contact Person:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
              {selectedOpp.contactName || 'Primary Contact'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Deal Value:</span>
            <span className="font-bold text-[#5B4DB7] dark:text-purple-300 font-mono truncate block">
              {formatCurrencyINR(selectedOpp.estimatedValue)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Pipeline Stage:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {selectedOpp.stage} ({selectedOpp.probability}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
