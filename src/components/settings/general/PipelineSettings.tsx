import React from 'react';
import { Kanban, Percent, Lock, Info, Plus } from 'lucide-react';
import { PipelineStageConfig } from '../../../types/settings';

interface PipelineSettingsProps {
  stages: PipelineStageConfig[];
  onChange: (updatedStages: PipelineStageConfig[]) => void;
}

export const PipelineSettings: React.FC<PipelineSettingsProps> = ({ stages, onChange }) => {
  const handleProbabilityChange = (id: string, prob: number) => {
    const clamped = Math.max(0, Math.min(100, prob || 0));
    const updated = stages.map((s) =>
      s.id === id ? { ...s, probability: clamped } : s
    );
    onChange(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = stages.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Kanban className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Opportunity Pipeline Stages
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure stage definitions and automatic deal win-probability percentages for weighted revenue forecasting.
        </p>
      </div>

      {/* Probability Rule Explanation Banner */}
      <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-semibold text-purple-900 dark:text-purple-200 block">
            Weighted Forecasting Principle
          </span>
          <p className="text-purple-700/90 dark:text-purple-300 leading-relaxed text-[11px]">
            Advancing an opportunity through stages dynamically recalibrates its win probability (e.g. <strong>Qualified (40%)</strong> → <strong>Proposal (65%)</strong> → <strong>Negotiation (80%)</strong> → <strong>Won (100%)</strong>). This automatically computes forecasted revenue across sales rep quotas.
          </p>
        </div>
      </div>

      {/* Stages Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 w-16">Seq</th>
              <th className="py-2.5 px-4">Stage Name</th>
              <th className="py-2.5 px-4 w-44">Win Probability</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {stages.map((st, idx) => (
              <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                  #{idx + 1}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <span>{st.name}</span>
                    {st.isSystem && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        System Stage
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={st.name === 'Won' || st.name === 'Lost'}
                      value={st.probability}
                      onChange={(e) =>
                        handleProbabilityChange(st.id, parseInt(e.target.value, 10))
                      }
                      className={`w-16 px-2 py-1 rounded-lg border text-center font-mono text-xs font-bold ${
                        st.name === 'Won'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800'
                          : st.name === 'Lost'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:border-rose-800'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}
                    />
                    <span className="font-semibold text-slate-500">%</span>

                    {/* Visual mini bar */}
                    <div className="hidden sm:block flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          st.probability === 100
                            ? 'bg-emerald-500'
                            : st.probability === 0
                            ? 'bg-rose-400'
                            : 'bg-purple-600'
                        }`}
                        style={{ width: `${st.probability}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                      st.active ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        st.active ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {st.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  {st.isSystem ? (
                    <span
                      title="Core stages required for win/loss calculation"
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400"
                    >
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleActive(st.id)}
                      className="text-xs text-slate-500 hover:text-purple-600"
                    >
                      {st.active ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
