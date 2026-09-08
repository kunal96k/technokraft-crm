import React, { useState } from 'react';
import { Download, Check, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem } from '../layout/Breadcrumb';

interface ReportHeaderProps {
  title: string;
  subtitle: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  onExport?: (format: 'PDF' | 'Excel' | 'CSV') => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onExport,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleExportClick = (format: 'PDF' | 'Excel' | 'CSV') => {
    setShowExportMenu(false);
    setCopiedFormat(format);
    if (onExport) {
      onExport(format);
    }
    setTimeout(() => setCopiedFormat(null), 3000);
  };

  return (
    <div id="report-header" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Breadcrumb customItems={breadcrumbs} className="mb-1" />
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-3xl">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-center">
        {actions}

        {/* Export Report Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            aria-label="Export Report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Export Format
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleExportClick('PDF')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-[#5B4DB7] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    <span>Executive Summary (PDF)</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportClick('Excel')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-[#5B4DB7] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Spreadsheet (.XLSX)</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportClick('CSV')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-[#5B4DB7] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>Raw Dataset (CSV)</span>
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
