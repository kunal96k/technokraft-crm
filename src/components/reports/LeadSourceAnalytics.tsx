import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { LeadSourceStat } from '../../types/reports';
import {
  Share2,
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { formatLakhsINR } from '../../utils/currencyFormatters';

interface LeadSourceAnalyticsProps {
  sources: LeadSourceStat[];
}

type SortField =
  | 'source'
  | 'leads'
  | 'percentage'
  | 'interested'
  | 'qualified'
  | 'won'
  | 'revenue'
  | 'conversionRate';

export const LeadSourceAnalytics: React.FC<LeadSourceAnalyticsProps> = ({ sources }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('leads');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalLeads = useMemo(
    () => (sources || []).reduce((sum, s) => sum + s.leads, 0),
    [sources]
  );

  const chartData = useMemo(
    () =>
      (sources || []).map((s) => ({
        name: s.source,
        value: s.leads,
        percentage: s.percentage,
        color: s.color,
      })),
    [sources]
  );

  // Search and Sort
  const filteredAndSortedSources = useMemo(() => {
    if (!sources) return [];

    let list = sources.filter((s) =>
      s.source.toLowerCase().includes(searchTerm.toLowerCase().trim())
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
  }, [sources, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalItems = filteredAndSortedSources.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedSources = filteredAndSortedSources.slice(
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

  if (!sources || sources.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 font-medium h-full flex items-center justify-center">
        No lead sources recorded for the selected filter.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Lead Source Attribution & Quality
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Volume generation vs downstream commercial conversions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-mono">
              {totalLeads} Total Leads
            </span>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="w-full h-56 sm:h-64 my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-800 dark:border-slate-700">
                        <div className="font-semibold">{data.name}</div>
                        <div className="text-slate-300 font-mono mt-0.5">
                          {data.value} leads ({data.percentage}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Search & Results Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 pb-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search source channel..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
            />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono self-end sm:self-center">
            {totalItems} channel{totalItems === 1 ? '' : 's'} recorded
          </div>
        </div>

        {/* Mobile View: Responsive Card Layout (block md:hidden) */}
        <div className="block md:hidden space-y-3">
          {paginatedSources.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No matching lead sources found.
            </div>
          ) : (
            paginatedSources.map((src) => (
              <div
                key={src.source}
                className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: src.color }}
                    />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {src.source}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0">
                    {src.leads} Leads ({src.percentage}%)
                  </span>
                </div>

                {/* 2x2 Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Interested</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {src.interested}
                    </span>
                  </div>
                  <div className="bg-purple-50/60 dark:bg-purple-950/30 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40">
                    <span className="text-[10px] text-[#5B4DB7] dark:text-purple-300 block font-semibold">
                      Qualified
                    </span>
                    <span className="font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                      {src.qualified}
                    </span>
                  </div>
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold">
                      Deals Won
                    </span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {src.won}
                    </span>
                  </div>
                </div>

                {/* Financial & Conversion Footer */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <span>Revenue:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {src.revenue > 0 ? formatLakhsINR(src.revenue) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                    <span>Conv. Rate:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {src.conversionRate}%
                    </span>
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
                  onClick={() => handleSort('source')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center">
                    <span>Lead Source</span>
                    {renderSortIndicator('source')}
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
                  onClick={() => handleSort('percentage')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end">
                    <span>Share %</span>
                    {renderSortIndicator('percentage')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('interested')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end">
                    <span>Interested</span>
                    {renderSortIndicator('interested')}
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
                  onClick={() => handleSort('won')}
                  className="py-2.5 px-2 text-right font-bold text-slate-900 dark:text-white cursor-pointer hover:text-[#5B4DB7]"
                >
                  <div className="flex items-center justify-end">
                    <span>Won</span>
                    {renderSortIndicator('won')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('revenue')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end">
                    <span>Revenue</span>
                    {renderSortIndicator('revenue')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('conversionRate')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end">
                    <span>Conv. %</span>
                    {renderSortIndicator('conversionRate')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedSources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No matching lead sources found.
                  </td>
                </tr>
              ) : (
                paginatedSources.map((src) => (
                  <tr
                    key={src.source}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: src.color }}
                        />
                        <span>{src.source}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                      {src.leads}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-500 dark:text-slate-400">
                      {src.percentage}%
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                      {src.interested}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-[#5B4DB7] dark:text-purple-300 font-semibold">
                      {src.qualified}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {src.won}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-600 dark:text-slate-400">
                      {src.revenue > 0 ? formatLakhsINR(src.revenue) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {src.conversionRate}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls (Default 10/page with page size selector) */}
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
            {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} sources
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
