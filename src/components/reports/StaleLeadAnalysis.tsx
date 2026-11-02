import React, { useState } from 'react';
import { Clock, AlertTriangle, ArrowRight, X, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StaleLeadStat } from '../../types/reports';

interface StaleLeadAnalysisProps {
  stats: StaleLeadStat[];
}

export const StaleLeadAnalysis: React.FC<StaleLeadAnalysisProps> = ({ stats }) => {
  const [selectedBracket, setSelectedBracket] = useState<StaleLeadStat | null>(null);
  const [modalSearch, setModalSearch] = useState('');

  if (!stats || stats.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 font-medium h-full flex items-center justify-center">
        No stale lead records for the selected filter.
      </div>
    );
  }

  const totalStale = stats.reduce((acc, s) => acc + s.count, 0);

  const filteredModalLeads = (selectedBracket?.leadsSample || []).filter((l) => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase().trim();
    return (
      l.companyName.toLowerCase().includes(q) ||
      l.leadCode.toLowerCase().includes(q) ||
      l.ownerName.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Stale Leads & Inactivity Risk
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Uncontacted accounts requiring supervisor re-engagement
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                {totalStale} Stale
              </span>
              <Link
                to="/leads"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#5B4DB7] dark:text-purple-300 hover:text-[#4E41A2] bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
              >
                <span>View Leads</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
            {stats.map((item) => {
              const badgeColor =
                item.duration === '30+ Days'
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:border-rose-400'
                  : item.duration === '14+ Days'
                  ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 hover:border-rose-300'
                  : item.duration === '7+ Days'
                  ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:border-amber-300'
                  : 'border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 hover:border-blue-300';

              const countColor =
                item.duration === '30+ Days' || item.duration === '14+ Days'
                  ? 'text-rose-700 dark:text-rose-400'
                  : item.duration === '7+ Days'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-blue-700 dark:text-blue-400';

              return (
                <div
                  key={item.duration}
                  onClick={() => {
                    setSelectedBracket(item);
                    setModalSearch('');
                  }}
                  className={`border rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:shadow-md ${badgeColor}`}
                  title="Click to view full stale leads list"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{item.duration} Inactive</span>
                      <AlertTriangle className="w-3.5 h-3.5 opacity-75" />
                    </div>
                    <div className={`text-xl sm:text-2xl font-bold font-mono my-1.5 ${countColor}`}>
                      {item.count}{' '}
                      <span className="text-xs font-normal text-slate-600 dark:text-slate-400">leads</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-snug">
                      {item.description}
                    </p>
                  </div>

                  {/* Sample leads list */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
                    {(item.leadsSample || []).slice(0, 2).map((lead) => (
                      <div
                        key={lead.leadCode}
                        className="text-[10px] flex justify-between text-slate-700 dark:text-slate-300"
                      >
                        <span className="font-semibold truncate max-w-[110px]">{lead.companyName}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {lead.daysInactive}d ago
                        </span>
                      </div>
                    ))}
                    <div className="text-[10px] font-semibold text-[#5B4DB7] dark:text-purple-300 pt-1 flex items-center gap-1">
                      <span>View all {item.count} leads</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Inactivity SLA: <strong>Follow-up within 48h</strong></span>
          <span>Uncontacted backlog: <strong className="font-mono text-amber-700 dark:text-amber-400">{totalStale} leads</strong></span>
        </div>
      </div>

      {/* Interactive Stale Leads Breakdown Modal */}
      {selectedBracket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedBracket.duration} Inactive Leads</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {selectedBracket.count} Total
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedBracket.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBracket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Filter Inside Modal */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Filter by company, lead code or representative..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Modal Body: Leads Table / List */}
            <div className="overflow-y-auto p-4 space-y-2">
              {filteredModalLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  {modalSearch.trim()
                    ? `No leads matching "${modalSearch}" in this bracket.`
                    : 'No leads currently in this inactivity bracket.'}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredModalLeads.map((lead) => (
                    <div
                      key={lead.leadCode}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {lead.companyName}
                          </span>
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {lead.leadCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
                          <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{lead.ownerName}</strong></span>
                          <span>Last Activity: <strong className="font-mono text-slate-700 dark:text-slate-300">{lead.lastContactDate}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
                          {lead.daysInactive} days inactive
                        </span>
                        <Link
                          to={`/leads?search=${encodeURIComponent(lead.leadCode)}`}
                          onClick={() => setSelectedBracket(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                          title="Open lead details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {filteredModalLeads.length} of {selectedBracket.count} records
              </span>
              <button
                type="button"
                onClick={() => setSelectedBracket(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
