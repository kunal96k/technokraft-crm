import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ActivityDayTrend } from '../../types/reports';
import { Activity } from 'lucide-react';

interface EmployeeActivityChartProps {
  trendData: ActivityDayTrend[];
  employeeName: string;
}

type ActivityFilter = 'All' | 'Calls' | 'Emails' | 'Follow-ups' | 'Meetings' | 'Tasks';

export const EmployeeActivityChart: React.FC<EmployeeActivityChartProps> = ({
  trendData,
  employeeName,
}) => {
  const [filter, setFilter] = useState<ActivityFilter>('All');

  const getMetricKey = (f: ActivityFilter) => {
    switch (f) {
      case 'Calls':
        return 'calls';
      case 'Emails':
        return 'emails';
      case 'Follow-ups':
        return 'followUps';
      case 'Meetings':
        return 'meetings';
      case 'Tasks':
        return 'tasks';
      default:
        return 'total';
    }
  };

  const getBarColor = (f: ActivityFilter) => {
    switch (f) {
      case 'Calls':
        return '#4F46E5'; // Indigo
      case 'Emails':
        return '#0284C7'; // Sky
      case 'Follow-ups':
        return '#9333EA'; // Purple
      case 'Meetings':
        return '#10B981'; // Emerald
      case 'Tasks':
        return '#F59E0B'; // Amber
      default:
        return '#5B4DB7'; // TechnoKraft primary
    }
  };

  const filterOptions: ActivityFilter[] = [
    'All',
    'Calls',
    'Emails',
    'Follow-ups',
    'Meetings',
    'Tasks',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Daily Activity Velocity Trend
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational activity distribution over the last 7 days for {employeeName}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs overflow-x-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filter === opt
                  ? 'bg-white text-[#5B4DB7] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {filter === 'All' ? (
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
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
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="calls" name="Calls" fill="#4F46E5" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="emails" name="Emails" fill="#0284C7" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="followUps" name="Follow-ups" fill="#9333EA" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="meetings" name="Meetings" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="tasks" name="Tasks" fill="#F59E0B" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
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
              <Bar
                dataKey={getMetricKey(filter)}
                name={filter}
                fill={getBarColor(filter)}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
