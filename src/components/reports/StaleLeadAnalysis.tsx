import React from 'react';
import { Clock, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StaleLeadStat } from '../../types/reports';

interface StaleLeadAnalysisProps {
  stats: StaleLeadStat[];
}

export const StaleLeadAnalysis: React.FC<StaleLeadAnalysisProps> = ({ stats }) => {
  const totalStale = stats.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Stale Leads & Inactivity Risk</h3>
            <p className="text-[11px] text-slate-500">Uncontacted accounts requiring immediate supervisor intervention</p>
          </div>
        </div>

        <Link
          to="/leads"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#5B4DB7] hover:text-[#4E41A2] bg-purple-50 hover:bg-purple-100 transition-colors"
        >
          <span>View Leads</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((item) => {
          const badgeColor =
            item.duration === '14+ Days'
              ? 'border-rose-200 bg-rose-50/70 text-rose-800'
              : item.duration === '7+ Days'
              ? 'border-amber-200 bg-amber-50/70 text-amber-800'
              : 'border-blue-200 bg-blue-50/70 text-blue-800';

          const countColor =
            item.duration === '14+ Days'
              ? 'text-rose-700'
              : item.duration === '7+ Days'
              ? 'text-amber-700'
              : 'text-blue-700';

          return (
            <div
              key={item.duration}
              className={`border rounded-xl p-3.5 flex flex-col justify-between ${badgeColor}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{item.duration} Inactive</span>
                  <AlertTriangle className="w-3.5 h-3.5 opacity-75" />
                </div>
                <div className={`text-2xl font-bold font-mono my-2 ${countColor}`}>
                  {item.count} <span className="text-xs font-normal text-slate-600">leads</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {item.description}
                </p>
              </div>

              {/* Sample leads list */}
              <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1">
                {item.leadsSample.slice(0, 2).map((lead) => (
                  <div key={lead.leadCode} className="text-[10px] flex justify-between text-slate-700">
                    <span className="font-semibold truncate max-w-[140px]">{lead.companyName}</span>
                    <span className="font-mono text-slate-500">{lead.daysInactive}d ago</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
