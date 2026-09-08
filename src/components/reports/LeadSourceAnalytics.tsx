import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { LeadSourceStat } from '../../types/reports';
import { Share2 } from 'lucide-react';
import { formatLakhsINR } from '../../data/mockReports';

interface LeadSourceAnalyticsProps {
  sources: LeadSourceStat[];
}

export const LeadSourceAnalytics: React.FC<LeadSourceAnalyticsProps> = ({ sources }) => {
  const chartData = sources.map((s) => ({
    name: s.source,
    value: s.leads,
    percentage: s.percentage,
    color: s.color,
  }));

  const totalLeads = sources.reduce((sum, s) => sum + s.leads, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Lead Source Attribution & Quality</h3>
            <p className="text-[11px] text-slate-500">Volume generation vs downstream commercial conversions</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
          {totalLeads} Total Leads
        </span>
      </div>

      {/* Donut Chart */}
      <div className="w-full h-56 sm:h-64">
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
                    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-800">
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

      {/* Source Performance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
            <tr>
              <th className="py-2.5 px-3">Lead Source</th>
              <th className="py-2.5 px-2 text-right">Leads</th>
              <th className="py-2.5 px-2 text-right">Share %</th>
              <th className="py-2.5 px-2 text-right">Interested</th>
              <th className="py-2.5 px-2 text-right">Qualified</th>
              <th className="py-2.5 px-2 text-right font-bold text-slate-900">Won</th>
              <th className="py-2.5 px-2 text-right">Revenue</th>
              <th className="py-2.5 px-3 text-right">Conv. %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sources.map((src) => (
              <tr key={src.source} className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: src.color }}
                    />
                    <span>{src.source}</span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-700">{src.leads}</td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-500">{src.percentage}%</td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-700">{src.interested}</td>
                <td className="py-2.5 px-2 text-right font-mono text-[#5B4DB7] font-semibold">
                  {src.qualified}
                </td>
                <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-700">
                  {src.won}
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                  {src.revenue > 0 ? formatLakhsINR(src.revenue) : '—'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  {src.conversionRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
