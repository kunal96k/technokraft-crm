import React from 'react';
import { Layers } from 'lucide-react';
import { ServiceStat } from '../../types/reports';
import { formatLakhsINR } from '../../data/mockReports';

interface ServiceAnalyticsProps {
  services: ServiceStat[];
}

export const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({ services }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Service Line & Offering Performance</h3>
            <p className="text-[11px] text-slate-500">Pipeline generation and closed revenue by domain</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400">IT Solutions</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
            <tr>
              <th className="py-2.5 px-3">Service Offering</th>
              <th className="py-2.5 px-2 text-right">Leads</th>
              <th className="py-2.5 px-2 text-right">Qualified</th>
              <th className="py-2.5 px-2 text-right">Opps</th>
              <th className="py-2.5 px-2 text-right">Proposals</th>
              <th className="py-2.5 px-2 text-right font-bold text-slate-900">Won</th>
              <th className="py-2.5 px-3 text-right">Pipeline Value</th>
              <th className="py-2.5 px-3 text-right font-bold text-emerald-800">Won Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {services.map((svc) => (
              <tr key={svc.service} className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  {svc.service}
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-700">{svc.leads}</td>
                <td className="py-2.5 px-2 text-right font-mono text-[#5B4DB7] font-semibold">
                  {svc.qualified}
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-700">{svc.opportunities}</td>
                <td className="py-2.5 px-2 text-right font-mono text-amber-700">{svc.proposals}</td>
                <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-700">
                  {svc.won}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-800 font-medium">
                  {formatLakhsINR(svc.pipelineValue)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                  {svc.wonValue > 0 ? formatLakhsINR(svc.wonValue) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
