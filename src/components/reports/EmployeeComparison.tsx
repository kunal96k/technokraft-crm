import React, { useState, useRef, useEffect } from 'react';
import { GitCompare, Search, X, UserPlus, Check } from 'lucide-react';
import { EmployeePerformanceRecord } from '../../types/reports';
import { formatLakhsINR } from '../../utils/currencyFormatters';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

interface EmployeeComparisonProps {
  employees: EmployeePerformanceRecord[];
}

export const EmployeeComparison: React.FC<EmployeeComparisonProps> = ({ employees }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    employees && employees.length > 0 ? employees.slice(0, Math.min(2, employees.length)).map((e) => e.id) : []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!employees || employees.length === 0) {
    return null;
  }

  const removeEmployee = (id: string) => {
    if (selectedIds.length > 1) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const addEmployee = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
      setSearchQuery('');
      setIsDropdownOpen(false);
    }
  };

  const comparedList = employees.filter((e) => selectedIds.includes(e.id));

  // Filtered candidate list for typeahead
  const filteredCandidates = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.role && emp.role.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header & Rep Selection Typeahead */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Direct Head-to-Head Comparison
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 font-semibold border border-purple-200/60 dark:border-purple-800/60">
                {selectedIds.length}/4 selected
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Benchmark up to 4 representatives side-by-side using typeahead search
            </p>
          </div>
        </div>

        {/* Selected Chips + Typeahead Search Input */}
        <div className="flex flex-wrap items-center gap-2" ref={dropdownRef}>
          {/* Selected Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {comparedList.map((emp) => (
              <div
                key={emp.id}
                className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-[#5B4DB7] text-white text-xs font-semibold shadow-2xs group transition-all"
              >
                <EmployeeAvatar
                  name={emp.name}
                  avatar={emp.avatar}
                  profilePhoto={emp.profilePhoto}
                  size="xs"
                />
                <span className="truncate max-w-[110px]">{emp.name}</span>
                {selectedIds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmployee(emp.id)}
                    className="p-0.5 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Typeahead Dropdown */}
          <div className="relative">
            {selectedIds.length < 4 ? (
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search to add (max 4)..."
                  className="w-48 sm:w-56 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
            ) : (
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg">
                Maximum 4 selected
              </span>
            )}

            {isDropdownOpen && selectedIds.length < 4 && (
              <div className="absolute right-0 mt-1 w-64 max-h-56 overflow-y-auto rounded-xl bg-white dark:bg-slate-850 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCandidates.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No employees matching "{searchQuery}"
                  </div>
                ) : (
                  filteredCandidates.map((emp) => {
                    const isAlreadySelected = selectedIds.includes(emp.id);
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        disabled={isAlreadySelected}
                        onClick={() => addEmployee(emp.id)}
                        className={`w-full flex items-center justify-between gap-2 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          isAlreadySelected
                            ? 'opacity-40 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/30'
                            : 'hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <EmployeeAvatar
                            name={emp.name}
                            avatar={emp.avatar}
                            profilePhoto={emp.profilePhoto}
                            size="xs"
                          />
                          <div className="min-w-0 truncate">
                            <div className="font-semibold truncate">{emp.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{emp.role}</div>
                          </div>
                        </div>

                        {isAlreadySelected ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-300 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View: Responsive Card Layout (block sm:hidden) */}
      <div className="block sm:hidden space-y-3">
        {comparedList.map((emp) => (
          <div
            key={emp.id}
            className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <EmployeeAvatar
                  name={emp.name}
                  avatar={emp.avatar}
                  profilePhoto={emp.profilePhoto}
                  size="sm"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{emp.name}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{emp.role}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                {emp.targetAchievementRate}% Quota
              </span>
            </div>

            {/* 3x2 Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Leads</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {emp.leadsAssigned}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Calls</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {emp.calls}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Follow-ups</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {emp.followUps}
                </span>
              </div>
              <div className="bg-purple-50/60 dark:bg-purple-950/30 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] text-[#5B4DB7] dark:text-purple-300 block font-semibold">
                  Qualified
                </span>
                <span className="font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                  {emp.qualified}
                </span>
              </div>
              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-100 dark:border-amber-900/40">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">
                  Proposals
                </span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {emp.proposals}
                </span>
              </div>
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold">
                  Won Deals
                </span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {emp.won}
                </span>
              </div>
            </div>

            {/* Pipeline & Revenue Footer */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div className="text-slate-600 dark:text-slate-400">
                Pipeline: <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatLakhsINR(emp.pipelineValue)}</span>
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                Won: <span className="font-mono font-bold">{formatLakhsINR(emp.wonValue)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Comparative Matrix Table (hidden sm:block) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2.5 px-3">Metric</th>
              {comparedList.map((emp) => (
                <th key={emp.id} className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-200">
                  <div className="flex items-center justify-end gap-1.5">
                    <EmployeeAvatar name={emp.name} avatar={emp.avatar} profilePhoto={emp.profilePhoto} size="xs" />
                    <span>{emp.name}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 font-normal lowercase">{emp.role}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Leads Assigned</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                  {emp.leadsAssigned}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Outbound Calls</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                  {emp.calls}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Follow-ups Completed</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                  {emp.followUps}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Qualified Leads</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                  {emp.qualified}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Proposals Sent</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-amber-700 dark:text-amber-400 font-semibold">
                  {emp.proposals}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-bold">Won Deals</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {emp.won}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Pipeline Value</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-white">
                  {formatLakhsINR(emp.pipelineValue)}
                </td>
              ))}
            </tr>
            <tr className="bg-purple-50/30 dark:bg-purple-950/20 font-bold">
              <td className="py-2.5 px-3 text-[#5B4DB7] dark:text-purple-300">Quota Achievement</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                  {emp.targetAchievementRate}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
