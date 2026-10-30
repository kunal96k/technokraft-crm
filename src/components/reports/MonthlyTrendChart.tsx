import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MonthlyTrendStat } from '../../types/reports';
import { Calendar } from 'lucide-react';

interface MonthlyTrendChartProps {
  data: MonthlyTrendStat[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 font-medium h-full flex items-center justify-center">
        No monthly progression data recorded for the selected filter.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Progression Trend (Last 6 Months)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Leads Generated vs Qualified vs Won Deals trajectory
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-mono self-start sm:self-auto">
            6 Months Trajectory
          </span>
        </div>

        <div className="w-full h-64 sm:h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="leadsGenerated"
                name="Leads Generated"
                stroke="#4F46E5"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#4F46E5' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="qualified"
                name="Qualified Leads"
                stroke="#9333EA"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#9333EA' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="won"
                name="Won Deals"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10B981' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Cohorts tracked: <strong className="font-mono text-slate-700 dark:text-slate-300">{data.length} consecutive months</strong></span>
        <span>Lead trajectory: <strong className="font-mono text-indigo-600 dark:text-indigo-400">Live DB telemetry</strong></span>
      </div>
    </div>
  );
};
