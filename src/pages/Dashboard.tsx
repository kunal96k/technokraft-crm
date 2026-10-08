import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import {
  Plus,
  Users,
  Target,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  RefreshCw,
  Layers,
  DollarSign,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { Lead, LeadSummaryData } from '../types/leads';
import { OpportunityRecord } from '../types/opportunities';
import { fetchLeads, fetchLeadSummary } from '../services/leadService';
import { fetchOpportunities } from '../services/opportunityService';
import { fetchFollowUps, fetchFollowUpStats } from '../services/followUpService';
import { LeadStatusBadge } from '../components/leads/LeadStatusBadge';
import { LeadPriorityBadge } from '../components/leads/LeadPriorityBadge';
import { formatCurrencyINR } from '../utils/currencyFormatters';
import { FollowUpRecord, FollowUpStats } from '../types/followUps';

interface LayoutContext {
  currentUser?: UserProfile;
  sidebarTheme?: 'dark' | 'light';
  setSidebarTheme?: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const outletCtx = useOutletContext<LayoutContext | null | undefined>();
  const [localSidebarTheme, setLocalSidebarTheme] = React.useState<'dark' | 'light'>('dark');

  const currentUser: UserProfile = outletCtx?.currentUser || {
    name: user?.name || 'Administrator',
    initials: user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD',
    email: user?.email || 'admin@technokraftservices.com',
    role: (user?.accessRole as UserRole) || 'Sales Manager',
    department: 'Management',
    avatarUrl: user?.avatar,
  };

  // Real Database State
  const [summary, setSummary] = useState<LeadSummaryData | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<FollowUpRecord[]>([]);
  const [followUpStats, setFollowUpStats] = useState<FollowUpStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, leadsRes, oppRes, fuRes, fuStatRes] = await Promise.all([
        fetchLeadSummary().catch(() => null),
        fetchLeads({ size: 6, sortBy: 'id', sortDirection: 'desc' }).catch(() => ({ content: [] })),
        fetchOpportunities({ size: 100 }).catch(() => ({ content: [] })),
        fetchFollowUps({ size: 5, tab: 'upcoming' }).catch(() => ({ content: [] })),
        fetchFollowUpStats().catch(() => null),
      ]);

      if (sumRes) setSummary(sumRes.summary || sumRes);
      if (leadsRes && leadsRes.content) setRecentLeads(leadsRes.content);
      if (oppRes && oppRes.content) setOpportunities(oppRes.content);
      if (fuRes && fuRes.content) setUpcomingFollowUps(fuRes.content);
      if (fuStatRes) setFollowUpStats(fuStatRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived metrics from real data
  const totalPipelineValue = opportunities.reduce((acc, opp) => acc + (opp.estimatedValue || 0), 0);
  const wonDealsCount = opportunities.filter((o) => o.stage === 'Won').length;
  const wonDealsValue = opportunities
    .filter((o) => o.stage === 'Won')
    .reduce((acc, o) => acc + (o.finalValue || o.estimatedValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Reusable Page Header */}
      <PageHeader
        title={`Welcome Back, ${currentUser.name}! 👋`}
        description="Here is the live real-time performance summary of your sales pipeline, deals, and activities."
        showDateBadge={true}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDashboardData}
              title="Refresh live metrics"
              className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#5B4DB7]' : ''}`} />
            </button>

            <Link
              to="/opportunities/pipeline"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span>Pipeline Board</span>
            </Link>

            <Link
              to="/leads/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Lead</span>
            </Link>
          </div>
        }
      />

      {/* 4 Primary Key Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inbound Leads */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Leads</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {(summary?.totalLeads ?? recentLeads.length).toLocaleString()}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {(summary?.newLeads ?? 0).toLocaleString()} New
              </span>
              <span>•</span>
              <span>{(summary?.qualifiedLeads ?? 0).toLocaleString()} Qualified</span>
            </div>
          </div>
        </div>

        {/* Active Pipeline Valuation */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Pipeline Value</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {formatCurrencyINR(totalPipelineValue)}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Across {opportunities.length} live commercial deals</span>
            </div>
          </div>
        </div>

        {/* Won Deals & Revenue */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Won Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrencyINR(wonDealsValue)}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{wonDealsCount} Deals Won</span>
              <span>•</span>
              <span>
                Conversion:{' '}
                {summary?.conversionRate ??
                  (summary?.totalLeads && summary.totalLeads > 0
                    ? Math.round((wonDealsCount / summary.totalLeads) * 100)
                    : 0)}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Scheduled Follow-ups */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Follow-ups</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {(followUpStats?.today ?? upcomingFollowUps.length).toLocaleString()}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{(followUpStats?.overdue ?? 0).toLocaleString()} overdue</span>
              <span>•</span>
              <span>{(followUpStats?.upcoming ?? 0).toLocaleString()} upcoming</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Recent Leads & Activity / Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Recent Leads Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Active Leads</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real database leads with latest qualification updates
              </p>
            </div>
            <Link
              to="/leads"
              className="text-xs text-[#5B4DB7] dark:text-purple-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>View All Leads</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentLeads.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No leads found in database</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Create your first lead or import via CSV</p>
                <Link
                  to="/leads/add"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5B4DB7] text-white rounded-lg text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Lead</span>
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse min-w-[580px]">
                <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Lead Code / Company</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <Link
                              to={`/leads/${lead.id}`}
                              className="font-mono font-bold text-[#5B4DB7] dark:text-purple-400 hover:underline block"
                            >
                              {lead.leadCode || `LD-${String(lead.id).padStart(4, '0')}`}
                            </Link>
                            <span className="font-semibold text-slate-900 dark:text-white truncate block max-w-[170px]">
                              {lead.company?.name || 'Company'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{lead.contact?.name || '—'}</div>
                        <div className="text-[11px] text-slate-400">{lead.contact?.designation || lead.contact?.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">{lead.service || 'Consulting'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <LeadStatusBadge status={lead.status} size="xs" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B4DB7] dark:text-purple-400 hover:underline"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Scheduled Follow-ups & Deals */}
        <div className="space-y-6">
          {/* Upcoming Schedule Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5B4DB7]" />
                <span>Upcoming Follow-ups</span>
              </h3>
              <Link to="/follow-ups" className="text-xs text-[#5B4DB7] font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="mt-3.5 space-y-3">
              {upcomingFollowUps.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No upcoming follow-ups scheduled for today.
                </div>
              ) : (
                upcomingFollowUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{fu.companyName || fu.contactName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-1">
                        {fu.note || `${fu.type} with ${fu.contactName}`}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 shrink-0">
                      {fu.time || fu.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Direct Navigation Links */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick Workspace Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/opportunities/proposals"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-[#5B4DB7]/40 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col gap-1 transition-all"
              >
                <FileText className="w-4 h-4 text-[#5B4DB7]" />
                <span>Proposals & Quotes</span>
              </Link>

              <Link
                to="/communication/emails"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-[#5B4DB7]/40 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col gap-1 transition-all"
              >
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Outbound Emails</span>
              </Link>

              <Link
                to="/communication/calls"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-[#5B4DB7]/40 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col gap-1 transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Logs</span>
              </Link>

              <Link
                to="/reports/performance"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-[#5B4DB7]/40 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col gap-1 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Analytics & KPI</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
