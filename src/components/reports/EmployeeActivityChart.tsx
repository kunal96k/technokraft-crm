import React, { useState, useMemo } from 'react';
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
import { ActivityDayTrend, EmployeePerformanceRecord } from '../../types/reports';
import { Activity } from 'lucide-react';

interface EmployeeActivityChartProps {
  trendData?: ActivityDayTrend[];
  employeeName?: string;
  employees?: EmployeePerformanceRecord[];
}

type ActivityFilter = 'All' | 'Calls' | 'Emails' | 'Follow-ups' | 'Meetings' | 'Tasks';

export const EmployeeActivityChart: React.FC<EmployeeActivityChartProps> = ({
  trendData: propTrendData,
  employeeName: propEmployeeName,
  employees,
}) => {
  const [filter, setFilter] = useState<ActivityFilter>('All');

  // Derive active employee name & trend data
  const { chartData, displayName } = useMemo(() => {
    if (propTrendData && propTrendData.length > 0) {
      return { chartData: propTrendData, displayName: propEmployeeName || 'Employee' };
    }

    if (employees && employees.length > 0) {
      if (propEmployeeName && propEmployeeName !== 'All Employees') {
        const matched = employees.find((e) => e.name === propEmployeeName);
        if (matched && matched.dailyActivityTrend) {
          return { chartData: matched.dailyActivityTrend, displayName: matched.name };
        }
      }

      // Aggregate across all employees by day
      const dayMap = new Map<string, ActivityDayTrend>();
      employees.forEach((emp) => {
        (emp.dailyActivityTrend || []).forEach((day) => {
          const key = day.date || day.dayLabel;
          const existing = dayMap.get(key);
          if (existing) {
            existing.calls += day.calls || 0;
            existing.emails += day.emails || 0;
            existing.followUps += day.followUps || 0;
            existing.meetings += day.meetings || 0;
            existing.tasks += day.tasks || 0;
            existing.total += day.total || 0;
          } else {
            dayMap.set(key, { ...day });
          }
        });
      });

      return {
        chartData: Array.from(dayMap.values()),
        displayName: 'All Sales Reps',
      };
    }

    return { chartData: [], displayName: propEmployeeName || 'Team' };
  }, [propTrendData, propEmployeeName, employees]);

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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Card Header & Filter Tabs */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Activity Velocity Trend
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Operational activity distribution over the last 7 days for{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{displayName}</span>
            </p>
          </div>
        </div>

        {/* Filter Pills - Responsive wrap without horizontal scrollbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl">
          {filterOptions.map((opt) => {
            const isSelected = filter === opt;
            const barColor = getBarColor(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className={`flex-1 sm:flex-initial min-w-max px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-[#5B4DB7] dark:text-purple-300 font-semibold shadow-xs ring-1 ring-slate-200/80 dark:ring-slate-700/80'
                    : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: barColor }}
                />
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        {!chartData || chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
            No activity logged during this time period.
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          {filter === 'All' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        )}
      </div>
    </div>
  );
};
