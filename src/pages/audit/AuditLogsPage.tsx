import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Eye,
  X,
  Copy,
  Check,
  SlidersHorizontal,
  Calendar,
  Layers,
  Activity,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AuditLogItem,
  AuditLogSearchParams,
  AuditLogSummaryData,
} from '../../types/auditLog';
import {
  fetchAuditLogs,
  fetchAuditLogSummary,
  exportAuditLogsToFile,
} from '../../services/auditLogService';

const MODULE_OPTIONS = [
  { value: 'all', label: 'All Modules' },
  { value: 'employees', label: 'Employees' },
  { value: 'auth', label: 'Authentication' },
  { value: 'leads', label: 'Leads' },
  { value: 'opportunities', label: 'Opportunities' },
  { value: 'communication', label: 'Communication' },
  { value: 'follow-ups', label: 'Follow-ups' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'settings', label: 'Settings' },
];

const ACTION_OPTIONS = [
  { value: 'all', label: 'All Actions' },
  { value: 'LOGIN', label: 'LOGIN' },
  { value: 'LOGOUT', label: 'LOGOUT' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'RESET_PASSWORD', label: 'RESET_PASSWORD' },
  { value: 'LOCK', label: 'LOCK' },
  { value: 'UNLOCK', label: 'UNLOCK' },
];

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All Severities' },
  { value: 'INFO', label: 'INFO' },
  { value: 'WARNING', label: 'WARNING' },
  { value: 'CRITICAL', label: 'CRITICAL' },
];

export const AuditLogsPage: React.FC = () => {
  // Data State
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [summary, setSummary] = useState<AuditLogSummaryData | null>(null);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters State
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedSuccess, setSelectedSuccess] = useState<'all' | 'true' | 'false'>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Pagination & Sorting State
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(50);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal / Detail Inspector State
  const [inspectedLog, setInspectedLog] = useState<AuditLogItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);

  // Load Summary
  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const data = await fetchAuditLogSummary();
      setSummary(data);
    } catch (err: any) {
      console.warn('[AuditLogsPage] Failed to fetch summary stats:', err.message);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  // Load Logs
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: AuditLogSearchParams = {
        search: searchQuery || undefined,
        module: selectedModule !== 'all' ? selectedModule : undefined,
        action: selectedAction !== 'all' ? selectedAction : undefined,
        severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
        success:
          selectedSuccess === 'true' ? true : selectedSuccess === 'false' ? false : undefined,
        fromDate: fromDate ? `${fromDate}T00:00:00` : undefined,
        toDate: toDate ? `${toDate}T23:59:59` : undefined,
        page,
        size: pageSize,
        sortBy,
        sortDirection,
      };

      const res = await fetchAuditLogs(params);
      setLogs(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.error('[AuditLogsPage] Fetch error:', err);
      setErrorMessage(err.message || 'Unable to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedModule,
    selectedAction,
    selectedSeverity,
    selectedSuccess,
    fromDate,
    toDate,
    page,
    pageSize,
    sortBy,
    sortDirection,
  ]);

  // Initial load
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handle Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearchQuery(searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedModule('all');
    setSelectedAction('all');
    setSelectedSeverity('all');
    setSelectedSuccess('all');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  // Quick Date Presets
  const setQuickDatePreset = (preset: 'today' | '7days' | '30days' | 'all') => {
    setPage(0);
    if (preset === 'all') {
      setFromDate('');
      setToDate('');
      return;
    }

    const now = new Date();
    const toStr = now.toISOString().split('T')[0];
    setToDate(toStr);

    if (preset === 'today') {
      setFromDate(toStr);
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(d.toISOString().split('T')[0]);
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setFromDate(d.toISOString().split('T')[0]);
    }
  };

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Formatting helpers
  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const formatRelativeTime = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const getActionBadgeColor = (action: string) => {
    const act = (action || '').toUpperCase();
    switch (act) {
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
      case 'UPDATE':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/60';
      case 'RESET_PASSWORD':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
      case 'LOCK':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60';
      case 'UNLOCK':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const sev = (severity || 'INFO').toUpperCase();
    if (sev === 'CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          CRITICAL
        </span>
      );
    }
    if (sev === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          WARNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        INFO
      </span>
    );
  };

  // JSON Pretty Print helper
  const renderJsonPretty = (jsonString?: string | null) => {
    if (!jsonString) return <span className="text-slate-400 italic text-xs">No payload captured</span>;
    try {
      const parsed = JSON.parse(jsonString);
      return (
        <pre className="text-[11px] font-mono text-slate-800 dark:text-slate-200 p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto leading-relaxed max-h-64">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return (
        <pre className="text-[11px] font-mono text-slate-800 dark:text-slate-200 p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto leading-relaxed">
          {jsonString}
        </pre>
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  System Audit Logs
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  SOC2 Compliance Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Immutable, real-time security trail recording user authentication, administrative updates, and module access events. Restricted to Super Admin.
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          {/* Live Refresh */}
          <button
            type="button"
            onClick={() => {
              loadLogs();
              loadSummary();
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh audit feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Logs</span>
            </button>

            {isExportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 py-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      exportAuditLogsToFile(logs, 'csv');
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export Page as CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportAuditLogsToFile(logs, 'json');
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-left"
                  >
                    <FileJson className="w-4 h-4 text-purple-600" />
                    <span>Export Page as JSON</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Events */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              Total Logged Events
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white leading-tight block">
              {isSummaryLoading ? '—' : (summary?.totalLogs ?? totalElements).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Last 24 Hours */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              Activity (Last 24h)
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white leading-tight block">
              {isSummaryLoading ? '—' : (summary?.logsLast24h ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              Critical (24h)
            </span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 leading-tight block">
              {isSummaryLoading ? '—' : (summary?.criticalLast24h ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Warnings */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              Warnings (24h)
            </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400 leading-tight block">
              {isSummaryLoading ? '—' : (summary?.warningLast24h ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Failed Operations */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              Failed (24h)
            </span>
            <span className="text-lg font-bold text-red-600 dark:text-red-400 leading-tight block">
              {isSummaryLoading ? '—' : (summary?.failedLast24h ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
        {/* Row 1: Search and Main Selects */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Free text search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by actor name, username, description, entity, or IP..."
              className="w-full text-xs pl-9 pr-16 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  setPage(0);
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#5B4DB7] text-white hover:bg-[#4d3fa5] transition-colors cursor-pointer"
            >
              Go
            </button>
          </form>

          {/* Module Select */}
          <div className="w-full sm:w-44">
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setPage(0);
              }}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Select */}
          <div className="w-full sm:w-40">
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(0);
              }}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Select */}
          <div className="w-full sm:w-36">
            <select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setPage(0);
              }}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Success Status Select */}
          <div className="w-full sm:w-36">
            <select
              value={selectedSuccess}
              onChange={(e) => {
                setSelectedSuccess(e.target.value as any);
                setPage(0);
              }}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="true">Success (2xx)</option>
              <option value="false">Failed Only</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date Range, Quick Presets & Clear */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Date range picker inputs */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium text-[11px]">Range:</span>
            </div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(0);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(0);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {/* Quick Presets & Clear */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setQuickDatePreset('today')}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setQuickDatePreset('7days')}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Last 7d
            </button>
            <button
              type="button"
              onClick={() => setQuickDatePreset('30days')}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Last 30d
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <strong className="font-semibold block">Failed to load audit logs</strong>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={loadLogs}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Logs Data Table Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table summary bar */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">
                {totalElements === 0 ? 0 : page * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">
                {Math.min((page + 1) * pageSize, totalElements)}
              </strong>{' '}
              of{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">
                {totalElements.toLocaleString()}
              </strong>{' '}
              events
            </span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10.5px]">
                Matching "{searchQuery}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action & Module</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-16 mt-1.5" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-20 mt-1.5" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-14" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-lg w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        No audit records found
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {searchQuery || selectedModule !== 'all' || selectedAction !== 'all'
                          ? 'No events match your current filter parameters. Try broadening your criteria.'
                          : 'As actions, logins, and mutations occur in the CRM, immutable audit entries will automatically appear here.'}
                      </p>
                      {(searchQuery || selectedModule !== 'all' || selectedAction !== 'all') && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((item) => {
                  const relative = formatRelativeTime(item.createdAt);
                  const exact = formatDateTime(item.createdAt);
                  const actorInitials = (item.actorName || 'SU')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setInspectedLog(item)}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {relative || exact}
                        </span>
                        <span className="text-[10.5px] text-slate-400 dark:text-slate-500 block font-mono">
                          {exact}
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                            {actorInitials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate">
                              {item.actorName || 'System'}
                            </span>
                            <span className="text-[10.5px] text-slate-400 dark:text-slate-500 block font-mono truncate">
                              @{item.actorUsername || 'system'}
                              {item.actorRole ? ` • ${item.actorRole}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action & Module */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${getActionBadgeColor(
                              item.action
                            )}`}
                          >
                            {item.action}
                          </span>
                          <span className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {item.module}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {item.description || '—'}
                        </p>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.entityType ? (
                          <div>
                            <span className="font-medium text-slate-800 dark:text-slate-200 block text-[11px]">
                              {item.entityLabel || item.entityType}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block">
                              {item.entityType} #{item.entityId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getSeverityBadge(item.severity)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.success ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Success
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium text-[11px]"
                            title={item.errorMessage || 'Operation failed'}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Failed {item.httpStatus ? `(${item.httpStatus})` : ''}
                          </span>
                        )}
                      </td>

                      {/* Action Details button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedLog(item);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                          title="Inspect full audit record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Page <strong className="text-slate-900 dark:text-white">{page + 1}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{Math.max(1, totalPages)}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            {/* First */}
            <button
              type="button"
              onClick={() => setPage(0)}
              disabled={page === 0 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            {/* Prev */}
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Current page indicator pill */}
            <span className="px-3 py-1 font-semibold text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 rounded-lg border border-purple-200 dark:border-purple-800">
              {page + 1}
            </span>

            {/* Next */}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Last */}
            <button
              type="button"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Inspector Drawer / Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Audit Record #{inspectedLog.id}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${getActionBadgeColor(
                        inspectedLog.action
                      )}`}
                    >
                      {inspectedLog.action}
                    </span>
                    {getSeverityBadge(inspectedLog.severity)}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {formatDateTime(inspectedLog.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(JSON.stringify(inspectedLog, null, 2), 'fullRecord')
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {copiedField === 'fullRecord' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedLog(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Description banner */}
              <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block mb-0.5 uppercase tracking-wider">
                  Event Description
                </span>
                <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-medium">
                  {inspectedLog.description || 'No descriptive payload'}
                </p>
              </div>

              {/* Grid: Actor, Entity, Network */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Actor Info */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Actor Information
                  </span>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Name:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {inspectedLog.actorName || 'System'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Username:</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400">
                      @{inspectedLog.actorUsername || 'system'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Role / ID:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {inspectedLog.actorRole || 'System'} (ID: {inspectedLog.actorId ?? 'N/A'})
                    </span>
                  </div>
                </div>

                {/* Entity Info */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Target Entity
                  </span>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Module:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold uppercase">
                      {inspectedLog.module}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Entity Type:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {inspectedLog.entityType || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Entity ID & Label:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">
                      {inspectedLog.entityLabel || inspectedLog.entityId || '—'}
                    </span>
                  </div>
                </div>

                {/* Network & HTTP */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Network & HTTP
                  </span>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">IP Address:</span>
                    <span className="font-mono text-slate-900 dark:text-white font-semibold">
                      {inspectedLog.ipAddress || '127.0.0.1'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">HTTP Status:</span>
                    <span
                      className={`font-mono font-semibold ${
                        inspectedLog.success ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {inspectedLog.httpStatus || (inspectedLog.success ? 200 : 500)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">User Agent:</span>
                    <span className="text-slate-600 dark:text-slate-400 truncate block font-mono text-[10px]" title={inspectedLog.userAgent || ''}>
                      {inspectedLog.userAgent || 'Browser Session'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Details (if present) */}
              {inspectedLog.errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider block mb-1">
                    Captured Error Exception
                  </span>
                  <pre className="text-[11px] font-mono whitespace-pre-wrap">
                    {inspectedLog.errorMessage}
                  </pre>
                </div>
              )}

              {/* Diff / Mutation Payloads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Old Values */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Previous State (Old Values)
                    </span>
                    {inspectedLog.oldValues && (
                      <button
                        type="button"
                        onClick={() => handleCopy(inspectedLog.oldValues || '', 'oldValues')}
                        className="text-[10.5px] text-purple-600 hover:underline inline-flex items-center gap-1"
                      >
                        {copiedField === 'oldValues' ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  {renderJsonPretty(inspectedLog.oldValues)}
                </div>

                {/* New Values */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Updated State (New Values)
                    </span>
                    {inspectedLog.newValues && (
                      <button
                        type="button"
                        onClick={() => handleCopy(inspectedLog.newValues || '', 'newValues')}
                        className="text-[10.5px] text-purple-600 hover:underline inline-flex items-center gap-1"
                      >
                        {copiedField === 'newValues' ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  {renderJsonPretty(inspectedLog.newValues)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuditLogsPage;
