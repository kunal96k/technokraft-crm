import React, { useState, useMemo } from 'react';
import { Layers, Search, ArrowUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { ServiceStat } from '../../types/reports';
import { formatLakhsINR } from '../../utils/currencyFormatters';

interface ServiceAnalyticsProps {
  services: ServiceStat[];
}

type SortField =
  | 'service'
  | 'leads'
  | 'qualified'
  | 'opportunities'
  | 'proposals'
  | 'won'
  | 'pipelineValue'
  | 'wonValue';

export const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({ services }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('leads');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search and Sort
  const filteredAndSorted = useMemo(() => {
    if (!services) return [];

    let list = services.filter((s) =>
      s.service.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    list.sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB as string);
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      return sortOrder === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

    return list;
  }, [services, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedServices = filteredAndSorted.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 ml-1 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-[#5B4DB7] dark:text-purple-300 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#5B4DB7] dark:text-purple-300 ml-1 inline" />
    );
  };

  if (!services || services.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 font-medium h-full flex items-center justify-center">
        No service offering analytics recorded for the selected filter.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Service Line & Offering Performance
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pipeline generation and closed revenue by domain
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-mono self-start sm:self-auto">
            {totalItems} Services
          </span>
        </div>

        {/* Search & Counter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 pb-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search service domain..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono self-end sm:self-center">
            {totalItems} offering{totalItems === 1 ? '' : 's'} recorded
          </div>
        </div>

        {/* Mobile View: Responsive Card Layout (block md:hidden) */}
        <div className="block md:hidden space-y-3">
          {paginatedServices.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No matching service offerings found.
            </div>
          ) : (
            paginatedServices.map((svc) => (
              <div
                key={svc.service}
                className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#5B4DB7] shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {svc.service}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                    {svc.won} Won Deals
                  </span>
                </div>

                {/* 4-Item Metric Grid */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Leads</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {svc.leads}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-purple-600 dark:text-purple-300 block font-medium">
                      Qualified
                    </span>
                    <span className="font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                      {svc.qualified}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Opps</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {svc.opportunities}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                      Proposals
                    </span>
                    <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                      {svc.proposals}
                    </span>
                  </div>
                </div>

                {/* Pipeline & Revenue Footer */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-slate-600 dark:text-slate-400">
                    Pipeline: <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatLakhsINR(svc.pipelineValue)}</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Won Value: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{svc.wonValue > 0 ? formatLakhsINR(svc.wonValue) : '—'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Sortable Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 select-none">
              <tr>
                <th
                  onClick={() => handleSort('service')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center">
                    <span>Service Offering</span>
                    {renderSortIndicator('service')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('leads')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end">
                    <span>Leads</span>
                    {renderSortIndicator('leads')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('qualified')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end">
                    <span>Qualified</span>
                    {renderSortIndicator('qualified')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('opportunities')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end">
                    <span>Opps</span>
                    {renderSortIndicator('opportunities')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('proposals')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end">
                    <span>Proposals</span>
                    {renderSortIndicator('proposals')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('won')}
                  className="py-2.5 px-2 text-right font-bold text-slate-900 dark:text-white cursor-pointer hover:text-[#5B4DB7]"
                >
                  <div className="flex items-center justify-end">
                    <span>Won</span>
                    {renderSortIndicator('won')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('pipelineValue')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end">
                    <span>Pipeline Value</span>
                    {renderSortIndicator('pipelineValue')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('wonValue')}
                  className="py-2.5 px-3 text-right font-bold text-emerald-800 dark:text-emerald-400 cursor-pointer hover:text-emerald-600"
                >
                  <div className="flex items-center justify-end">
                    <span>Won Value</span>
                    {renderSortIndicator('wonValue')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedServices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No matching service offerings found.
                  </td>
                </tr>
              ) : (
                paginatedServices.map((svc) => (
                  <tr
                    key={svc.service}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {svc.service}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                      {svc.leads}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-[#5B4DB7] dark:text-purple-300 font-semibold">
                      {svc.qualified}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                      {svc.opportunities}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-amber-700 dark:text-amber-400">
                      {svc.proposals}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {svc.won}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200 font-medium">
                      {formatLakhsINR(svc.pipelineValue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {svc.wonValue > 0 ? formatLakhsINR(svc.wonValue) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>per page</span>
          <span className="hidden sm:inline font-mono">
            • Showing {totalItems > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} services
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={validPage === 1}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - validPage) <= 1)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              return (
                <React.Fragment key={p}>
                  {prev && p - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-md transition-colors ${
                      validPage === p
                        ? 'bg-[#5B4DB7] text-white shadow-2xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={validPage === totalPages}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
