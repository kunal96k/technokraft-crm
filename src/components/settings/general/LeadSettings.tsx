import React, { useState } from 'react';
import {
  Filter,
  Plus,
  Edit2,
  Trash2,
  Lock,
  CheckCircle2,
  XCircle,
  Tag,
  Share2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { LeadStatusConfig, LeadSourceConfig, LeadPriorityConfig } from '../../../types/settings';

interface LeadSettingsProps {
  statuses: LeadStatusConfig[];
  sources: LeadSourceConfig[];
  onUpdateStatuses: (statuses: LeadStatusConfig[]) => void;
  onUpdateSources: (sources: LeadSourceConfig[]) => void;
}

export const LeadSettings: React.FC<LeadSettingsProps> = ({
  statuses,
  sources,
  onUpdateStatuses,
  onUpdateSources,
}) => {
  // Add Status modal state
  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusDesc, setNewStatusDesc] = useState('');

  // Add Source modal state
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  // Editing Source modal state
  const [editingSource, setEditingSource] = useState<LeadSourceConfig | null>(null);

  // Status toggle
  const handleToggleStatus = (id: string) => {
    const updated = statuses.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    onUpdateStatuses(updated);
  };

  // Add new status
  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) return;

    const newStatus: LeadStatusConfig = {
      id: `ls-${Date.now()}`,
      name: newStatusName.trim(),
      description: newStatusDesc.trim() || 'Custom sales pipeline milestone',
      active: true,
      order: statuses.length + 1,
      isSystem: false,
      color: 'purple',
    };

    onUpdateStatuses([...statuses, newStatus]);
    setNewStatusName('');
    setNewStatusDesc('');
    setIsAddStatusOpen(false);
  };

  // Toggle Source active
  const handleToggleSource = (id: string) => {
    const updated = sources.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    onUpdateSources(updated);
  };

  // Add Source
  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    const newSrc: LeadSourceConfig = {
      id: `src-${Date.now()}`,
      name: newSourceName.trim(),
      active: true,
      isSystem: false,
    };

    onUpdateSources([...sources, newSrc]);
    setNewSourceName('');
    setIsAddSourceOpen(false);
  };

  // Edit Source
  const handleSaveEditSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource || !editingSource.name.trim()) return;

    const updated = sources.map((s) =>
      s.id === editingSource.id ? editingSource : s
    );
    onUpdateSources(updated);
    setEditingSource(null);
  };

  return (
    <div className="space-y-8">
      {/* Lead Statuses Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Lead Statuses
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defines lead progression through the outreach and qualifying lifecycle.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddStatusOpen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Status
          </button>
        </div>

        {/* Lead Status Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-16">Order</th>
                <th className="py-2.5 px-4">Status Name</th>
                <th className="py-2.5 px-4">Lifecycle Description</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {statuses.map((st, idx) => (
                <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {st.name}
                      </span>
                      {st.isSystem && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          System
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                    {st.description}
                  </td>
                  <td className="py-2.5 px-3">
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
                  <td className="py-2.5 px-3 text-right">
                    {st.isSystem ? (
                      <span
                        title="System statuses with active CRM history cannot be disabled or removed"
                        className="inline-flex items-center gap-1 text-[10px] text-slate-400"
                      >
                        <Lock className="w-3 h-3" /> Core Status
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(st.id)}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          st.active
                            ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
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

      {/* Lead Sources Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Lead Inbound Sources
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Channels attribution for marketing campaigns, outbound B2B telecalling, and partner directories.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddSourceOpen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Source
          </button>
        </div>

        {/* Lead Sources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 shadow-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    src.active ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                <span
                  className={`text-xs font-medium truncate ${
                    src.active
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400 line-through'
                  }`}
                >
                  {src.name}
                </span>
                {src.isSystem && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
                    System
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingSource(src)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Source"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSource(src.id)}
                  className={`p-1 rounded text-xs transition-colors ${
                    src.active
                      ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                  title={src.active ? 'Deactivate Source' : 'Reactivate Source'}
                >
                  {src.active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Priority Levels (Read-only / Config summary) */}
      <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Lead Priority Classifications
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard urgency tiers used by sales executives and follow-up alert engines.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Low
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5">Routine follow-up schedule (7+ days)</p>
          </div>
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Medium
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5">Standard cadence (2-3 business days)</p>
          </div>
          <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              High
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5">Priority prospect (contact within 24h)</p>
          </div>
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              Urgent
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5">Immediate executive attention required</p>
          </div>
        </div>
      </div>

      {/* Add Status Modal */}
      {isAddStatusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Add New Lead Status
            </h4>
            <form onSubmit={handleAddStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status Title *
                </label>
                <input
                  type="text"
                  required
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder="e.g. Demonstration Scheduled"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lifecycle Description
                </label>
                <textarea
                  rows={2}
                  value={newStatusDesc}
                  onChange={(e) => setNewStatusDesc(e.target.value)}
                  placeholder="When should sales reps select this status..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStatusOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
                >
                  Add Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Source Modal */}
      {isAddSourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Add New Lead Inbound Source
            </h4>
            <form onSubmit={handleAddSource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. Tech Expo 2026 / Trade India"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSourceOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
                >
                  Add Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Source Modal */}
      {editingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Edit Lead Source
            </h4>
            <form onSubmit={handleSaveEditSource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingSource.name}
                  onChange={(e) =>
                    setEditingSource({ ...editingSource, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSource(null)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
