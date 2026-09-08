import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  moduleName: string;
  description: string;
  category: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  moduleName,
  description,
  category,
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={moduleName}
        description={description}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New {moduleName.replace(/s\b/, '')}</span>
            </button>
          </div>
        }
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-xs text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center mx-auto">
            <span className="text-xl font-bold">{moduleName.charAt(0)}</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{moduleName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/80 dark:border-slate-800 text-left text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Category:</span>
              <span className="px-2 py-0.5 rounded bg-purple-100/60 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
                {category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Shell Container:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active & Responsive</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Data Module:</span>
              <span className="text-slate-500 dark:text-slate-400">Awaiting CRM business logic implementation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
