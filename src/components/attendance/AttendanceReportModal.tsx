import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Mail,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  Send,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { DailyAttendanceRecord, Employee } from '../../types/employees';
import {
  fetchAttendanceRecords,
  fetchAttendanceAlertSettings,
} from '../../services/attendanceService';
import { fetchEmployees } from '../../services/employeeService';
import { sendB2BEmail } from '../../services/leadService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  downloadAttendanceExcel,
  getAttendanceExcelBase64,
  generateAttendancePdf,
  ReportMetadata,
  ReportSummaryStats,
  COMPANY_DETAILS,
} from '../../utils/attendanceReportGenerator';

interface AttendanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecords?: DailyAttendanceRecord[];
  employees?: Employee[];
}

type DatePreset = 'today' | 'month' | 'custom';

// Helper to format Date to YYYY-MM-DD
function formatDateToYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format Date for display
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({
  isOpen,
  onClose,
  initialRecords,
  employees: propEmployees,
}) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  // Date selection states (Default: Today)
  const todayStr = useMemo(() => formatDateToYYYYMMDD(new Date()), []);
  const monthStartStr = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return formatDateToYYYYMMDD(d);
  }, []);

  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>('Active'); // Default: Active only

  // Data state
  const [rawRecords, setRawRecords] = useState<DailyAttendanceRecord[]>([]);
  const [internalEmployees, setInternalEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Email panel states
  const [showEmailSection, setShowEmailSection] = useState<boolean>(false);
  const [recipientInput, setRecipientInput] = useState<string>('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [ccList, setCcList] = useState<string[]>([
    'kunalpatil192001@gmail.com',
    'hr@technokraftservices.com',
  ]);
  const [newCcInput, setNewCcInput] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailNote, setEmailNote] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  // Synchronize start & end dates when preset changes
  useEffect(() => {
    if (datePreset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (datePreset === 'month') {
      setStartDate(monthStartStr);
      setEndDate(todayStr);
    }
  }, [datePreset, todayStr, monthStartStr]);

  // Load employee roster for account status mapping
  useEffect(() => {
    if (!isOpen) return;

    if (propEmployees && propEmployees.length > 0) {
      setInternalEmployees(propEmployees);
    } else {
      fetchEmployees({ size: 200 })
        .then((res) => {
          setInternalEmployees(res.content || []);
        })
        .catch((err) => {
          console.debug('[ReportModal] Could not fetch employee roster for status map:', err);
        });
    }
  }, [isOpen, propEmployees]);

  // Build employee status lookup map
  const employeeStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    internalEmployees.forEach((emp) => {
      const st = emp.status || 'Active';
      if (emp.id) map.set(String(emp.id), st);
      if (emp.employeeCode) map.set(emp.employeeCode, st);
    });
    return map;
  }, [internalEmployees]);

  // Load HR / Super Admin emails on open
  useEffect(() => {
    if (!isOpen) return;

    fetchAttendanceAlertSettings()
      .then((settings) => {
        const ccs: string[] = [];
        if (settings.superAdminEmail) ccs.push(settings.superAdminEmail.trim());
        else ccs.push('kunalpatil192001@gmail.com');

        if (settings.hrEmail && !ccs.includes(settings.hrEmail.trim())) {
          ccs.push(settings.hrEmail.trim());
        }
        setCcList(ccs);
      })
      .catch((err) => {
        console.debug('[ReportModal] Could not fetch alert settings for CC:', err);
      });
  }, [isOpen]);

  // Load records whenever dates or attendance status filters change
  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        size: 200,
        page: 0,
      };

      if (datePreset === 'today') {
        params.datePreset = 'Today';
      } else if (datePreset === 'month') {
        params.datePreset = 'Month';
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        params.datePreset = 'Custom';
        params.startDate = startDate;
        params.endDate = endDate;
      }

      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }

      const res = await fetchAttendanceRecords(params);
      const fetchedContent = res.content || [];

      // If backend returns empty in mock / dev, fallback to filtered initialRecords if available
      if (fetchedContent.length === 0 && initialRecords && initialRecords.length > 0) {
        let filtered = [...initialRecords];
        if (statusFilter && statusFilter !== 'All') {
          filtered = filtered.filter((r) => r.status === statusFilter);
        }
        setRawRecords(filtered);
      } else {
        setRawRecords(fetchedContent);
      }
    } catch (err: any) {
      console.warn('[ReportModal] Error fetching attendance records:', err);
      // Fallback to initialRecords
      if (initialRecords && initialRecords.length > 0) {
        let filtered = [...initialRecords];
        if (statusFilter && statusFilter !== 'All') {
          filtered = filtered.filter((r) => r.status === statusFilter);
        }
        setRawRecords(filtered);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadReportData();
    }
  }, [isOpen, datePreset, startDate, endDate, statusFilter]);

  // Filter raw records by Staff Account Status (Active by default, Inactive, Suspended, All)
  const records: DailyAttendanceRecord[] = useMemo(() => {
    const list = rawRecords.map((r) => {
      const empStatus =
        employeeStatusMap.get(String(r.employeeId)) ||
        employeeStatusMap.get(r.employeeCode) ||
        r.employeeStatus ||
        'Active';
      return { ...r, employeeStatus: empStatus };
    });

    if (!accountStatusFilter || accountStatusFilter === 'All') {
      return list;
    }

    return list.filter((r) => {
      const st = (r.employeeStatus || 'Active').toLowerCase();
      const target = accountStatusFilter.toLowerCase();
      if (target === 'inactive') {
        return st === 'inactive' || st === 'deactivated';
      }
      return st === target;
    });
  }, [rawRecords, employeeStatusMap, accountStatusFilter]);

  // Compute live summary statistics
  const summaryStats: ReportSummaryStats = useMemo(() => {
    const total = records.length;
    let present = 0;
    let late = 0;
    let halfDay = 0;
    let absent = 0;
    let onLeave = 0;

    records.forEach((r) => {
      const st = r.status || 'Present';
      if (st === 'Present' || st === 'Early') present++;
      else if (st === 'Late') late++;
      else if (st === 'Half Day') halfDay++;
      else if (st === 'Absent') absent++;
      else if (st === 'Leave') onLeave++;
    });

    const activeCount = present + late + halfDay;
    const rate = total > 0 ? Math.round((activeCount / total) * 100) : 0;

    return {
      total,
      present,
      late,
      halfDay,
      absent,
      onLeave,
      attendanceRate: rate,
    };
  }, [records]);

  // Formatted date label for reports & subjects
  const dateRangeLabel = useMemo(() => {
    if (datePreset === 'today') {
      return `Today (${formatDateDisplay(todayStr)})`;
    }
    if (datePreset === 'month') {
      return `This Month (${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)})`;
    }
    if (startDate === endDate) {
      return formatDateDisplay(startDate);
    }
    return `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
  }, [datePreset, startDate, endDate, todayStr]);

  // Dynamic Subject update
  useEffect(() => {
    setEmailSubject(
      `[Attendance Report] TechnoKraft Services LLP — ${dateRangeLabel} (${records.length} Records)`
    );
  }, [dateRangeLabel, records.length]);

  if (!isOpen) return null;

  // Add Recipient Chip
  const handleAddRecipient = () => {
    const email = recipientInput.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning('Please enter a valid email address (e.g. name@company.com)', 'Invalid Email');
      return;
    }

    if (recipients.includes(email)) {
      toast.info('This email address is already added as a recipient.');
      setRecipientInput('');
      return;
    }

    setRecipients((prev) => [...prev, email]);
    setRecipientInput('');
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((e) => e !== email));
  };

  // Add CC Chip
  const handleAddCc = () => {
    const email = newCcInput.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning('Please enter a valid CC email address', 'Invalid Email');
      return;
    }

    if (ccList.includes(email)) {
      setNewCcInput('');
      return;
    }

    setCcList((prev) => [...prev, email]);
    setNewCcInput('');
  };

  const handleRemoveCc = (email: string) => {
    setCcList((prev) => prev.filter((e) => e !== email));
  };

  // Build Metadata Object
  const reportMetadata: ReportMetadata = {
    dateRangeLabel,
    startDate,
    endDate,
    statusFilter,
    accountStatusFilter,
    generatedBy: authUser?.name || 'CRM Administrator',
    generatedAt: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };

  // Actions
  const handleExportExcel = () => {
    if (records.length === 0) {
      toast.warning('No attendance records available for the selected filters to export.');
      return;
    }
    try {
      downloadAttendanceExcel(records, reportMetadata);
      toast.success(
        `Successfully generated and downloaded Excel attendance report (${records.length} records).`,
        'Excel Export Complete'
      );
    } catch (err: any) {
      console.error('[ReportModal] Excel export error:', err);
      toast.error('Failed to export Excel report. Please try again.', 'Export Error');
    }
  };

  const handleExportPdf = () => {
    if (records.length === 0) {
      toast.warning('No attendance records available for the selected filters to export.');
      return;
    }
    try {
      generateAttendancePdf(records, summaryStats, reportMetadata);
      toast.success(
        `Successfully generated and downloaded PDF attendance report (${records.length} records).`,
        'PDF Export Complete'
      );
    } catch (err: any) {
      console.error('[ReportModal] PDF export error:', err);
      toast.error('Failed to export PDF report. Please try again.', 'Export Error');
    }
  };

  const handleSendEmailReport = async () => {
    if (recipients.length === 0) {
      toast.warning('Please add at least one recipient email address to send the report.', 'Recipient Required');
      return;
    }
    if (records.length === 0) {
      toast.warning('There are no attendance records to attach for the selected filters.', 'No Records');
      return;
    }

    setIsSendingEmail(true);
    try {
      const excelBase64 = getAttendanceExcelBase64(records, reportMetadata);
      const cleanFileName = `attendance_report_${startDate === endDate ? startDate : `${startDate}_to_${endDate}`}.xlsx`;

      // Build structured HTML summary body
      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #5B4DB7; padding: 24px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">TechnoKraft Services LLP</h2>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Official Corporate Attendance & Telemetry Report</p>
          </div>
          
          <div style="padding: 24px;">
            <p style="font-size: 14px; line-height: 1.6; margin-top: 0;">Dear Management & HR Team,</p>
            <p style="font-size: 14px; line-height: 1.6;">
              Please find attached the official attendance report for <strong>${dateRangeLabel}</strong>.
            </p>

            ${emailNote
          ? `<div style="background: #f8fafc; border-left: 4px solid #5B4DB7; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #334155; border-radius: 4px;">
                    <strong>Sender Note:</strong><br />${emailNote.replace(/\n/g, '<br/>')}
                   </div>`
          : ''
        }

            <div style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <tr style="background: #f1f5f9; font-weight: 600; color: #475569;">
                  <th style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Filter / Metric</th>
                  <th style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: right;">Value</th>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">Staff Account Status</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #5B4DB7;">${accountStatusFilter === 'Active' ? 'Active Staff (Default)' : accountStatusFilter}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">Attendance Status Filter</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">${statusFilter}</td>
                </tr>
                <tr style="background: #fafafa;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">Total Records</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">${summaryStats.total}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #059669;">✔ Present</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #059669;">${summaryStats.present}</td>
                </tr>
                <tr style="background: #fafafa;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #d97706;">⏰ Late Arrivals</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #d97706;">${summaryStats.late}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #4f46e5;">⏳ Half Day</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #4f46e5;">${summaryStats.halfDay}</td>
                </tr>
                <tr style="background: #fafafa;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #dc2626;">✖ Absent</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #dc2626;">${summaryStats.absent}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #7c3aed;">🌴 On Leave</td>
                  <td style="padding: 10px 14px; text-align: right; font-weight: 700; color: #7c3aed;">${summaryStats.onLeave}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; color: #64748b;">
              The complete attendance sheet with punches, shifts, and working hours is attached as <strong>${cleanFileName}</strong>.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
            ${COMPANY_DETAILS.name} • ${COMPANY_DETAILS.address}<br />
            Mobile: ${COMPANY_DETAILS.mobile} • Email: ${COMPANY_DETAILS.email}<br />
            © 2026 TechnoKraft Services LLP. All rights reserved.
          </div>
        </div>
      `;

      const primaryRecipient = recipients[0];
      const additionalRecipients = recipients.slice(1);
      const combinedCc = [...ccList, ...additionalRecipients];

      const res = await sendB2BEmail({
        recipientEmail: primaryRecipient,
        subject: emailSubject,
        body: `TechnoKraft Services LLP Attendance Report for ${dateRangeLabel}. Attached: ${cleanFileName}`,
        htmlBody,
        cc: combinedCc,
        attachments: [
          {
            name: cleanFileName,
            fileName: cleanFileName,
            fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            fileSize: '50 KB',
            base64Content: excelBase64,
          },
        ],
      });

      if (res.success) {
        toast.success(
          `Attendance report successfully emailed to ${recipients.join(', ')} with ${cleanFileName} attached.`,
          'Report Dispatched'
        );
        setShowEmailSection(false);
      } else {
        throw new Error(res.error || res.message || 'Failed to dispatch email');
      }
    } catch (err: any) {
      console.error('[ReportModal] Send email error:', err);
      toast.error(
        err.message || 'Could not send the email report. Please check recipient addresses.',
        'Email Dispatch Failed'
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#1E293B] w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Attendance Telemetry & Reports
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Export & Email
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate custom date range summaries, export to Excel/PDF or email to management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 1. Date Range & Filters Box */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                Report Period & Date Filters
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                {dateRangeLabel}
              </span>
            </div>

            {/* Date Preset Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDatePreset('today')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${datePreset === 'today'
                  ? 'bg-[#5B4DB7] text-white border-[#5B4DB7] shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
              >
                <span>Today</span>
              </button>

              <button
                type="button"
                onClick={() => setDatePreset('month')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${datePreset === 'month'
                  ? 'bg-[#5B4DB7] text-white border-[#5B4DB7] shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
              >
                <span>This Month</span>
              </button>

              <button
                type="button"
                onClick={() => setDatePreset('custom')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${datePreset === 'custom'
                  ? 'bg-[#5B4DB7] text-white border-[#5B4DB7] shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
              >
                <span>Custom Range</span>
              </button>
            </div>

            {/* Custom Range Date Pickers */}
            {datePreset === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    FROM Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    max={todayStr}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value > endDate) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-[#5B4DB7] outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    TO Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={todayStr}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-[#5B4DB7] outline-hidden font-mono"
                  />
                </div>
              </div>
            )}

            {/* Staff Account Status Filter (Active by Default, Inactive, Suspended, All) */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
                  Staff Account Status Filter
                </label>
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  {accountStatusFilter === 'Active' ? 'Active Staff Only (Default)' : `${accountStatusFilter} Staff`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'Active', label: 'Active', tag: 'Default' },
                  { id: 'Inactive', label: 'Deactivated / Inactive' },
                  { id: 'Suspended', label: 'Suspended' },
                  { id: 'All', label: 'All Accounts' },
                ].map((item) => {
                  const isSelected = accountStatusFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAccountStatusFilter(item.id)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                        ? 'bg-[#5B4DB7] text-white border border-[#5B4DB7] font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                      <span>{item.label}</span>
                      {item.tag && !isSelected && (
                        <span className="text-[9px] opacity-75 bg-slate-100 dark:bg-slate-700 px-1 py-0.2 rounded">
                          {item.tag}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attendance Status Filter Selector */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Filter className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
                Attendance Status Filter
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'All', label: 'All Statuses' },
                  { id: 'Present', label: 'Present' },
                  { id: 'Late', label: 'Late' },
                  { id: 'Half Day', label: 'Half Day' },
                  { id: 'Absent', label: 'Absent' },
                  { id: 'Leave', label: 'On Leave' },
                ].map((item) => {
                  const isSelected = statusFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStatusFilter(item.id)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 border border-purple-300 dark:border-purple-600 font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Live Telemetry Preview Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Telemetry Breakdown</span>
              {isLoading ? (
                <span className="flex items-center gap-1 text-[#5B4DB7] dark:text-purple-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching records...
                </span>
              ) : (
                <span className="font-mono text-slate-500">
                  Showing {records.length} records matching filters
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {summaryStats.total}
                </span>
                <span className="text-[10px] text-slate-400">Records</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Present
                </span>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                  {summaryStats.present}
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400">
                  {summaryStats.total > 0 ? Math.round((summaryStats.present / summaryStats.total) * 100) : 0}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Late
                </span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-1">
                  {summaryStats.late}
                </span>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-400">
                  {summaryStats.total > 0 ? Math.round((summaryStats.late / summaryStats.total) * 100) : 0}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Half Day
                </span>
                <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-1">
                  {summaryStats.halfDay}
                </span>
                <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400">
                  {summaryStats.total > 0 ? Math.round((summaryStats.halfDay / summaryStats.total) * 100) : 0}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex flex-col col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  Absent
                </span>
                <span className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-1">
                  {summaryStats.absent}
                </span>
                <span className="text-[10px] text-rose-600/80 dark:text-rose-400">
                  {summaryStats.total > 0 ? Math.round((summaryStats.absent / summaryStats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* 3. Export & Email Action Toolbar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
              Generate & Export Actions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Excel Download Button */}
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isLoading || records.length === 0}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Download formatted .xlsx Excel report"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel (.xlsx)</span>
              </button>

              {/* PDF Download Button */}
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isLoading || records.length === 0}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Download formatted .pdf report with corporate branding"
              >
                <FileText className="w-4 h-4" />
                <span>Export PDF (.pdf)</span>
              </button>

              {/* Toggle Email Section Button */}
              <button
                type="button"
                onClick={() => setShowEmailSection(!showEmailSection)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer border ${showEmailSection
                  ? 'bg-[#5B4DB7] text-white border-[#5B4DB7]'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border-purple-200 dark:border-purple-800/50 hover:bg-purple-100'
                  }`}
                title="Send Excel report via email with CC to Super Admin and HR"
              >
                <Mail className="w-4 h-4" />
                <span>{showEmailSection ? 'Hide Email Panel' : 'Send via Email'}</span>
              </button>
            </div>
          </div>

          {/* 4. Send via Email Drawer / Panel */}
          {showEmailSection && (
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200/60 dark:border-purple-800/40">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Dispatch Report via Email (Excel Attachment)
                  </h3>
                </div>
                <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full">
                  Base64 XLSX Attached
                </span>
              </div>

              {/* Recipient(s) Chip Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  To Recipients <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter email (e.g. manager@technokraftservices.com)"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddRecipient();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-[#5B4DB7] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddRecipient}
                    className="px-3 py-1.5 bg-[#5B4DB7] hover:bg-[#4D3FA3] text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Recipient Chips */}
                {recipients.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {recipients.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(email)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">
                    No recipients added yet. Add at least one email address above.
                  </p>
                )}
              </div>

              {/* CC Chips (Default Super Admin & HR) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    CC Addresses (Pre-filled Default)
                  </label>
                  <span className="text-[10px] text-slate-400">Super Admin & HR auto-included</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Add additional CC..."
                    value={newCcInput}
                    onChange={(e) => setNewCcInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddCc();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-[#5B4DB7] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCc}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add CC</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ccList.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-100/70 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveCc(email)}
                        className="text-purple-500 hover:text-rose-600 cursor-pointer ml-1"
                        title="Remove CC"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-[#5B4DB7] outline-hidden"
                />
              </div>

              {/* Optional Custom Note */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Optional Note to Include in Email
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please review the updated attendance report for today's shifts..."
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/30 focus:border-[#5B4DB7] outline-hidden resize-none"
                />
              </div>

              {/* Dispatch Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSendEmailReport}
                  disabled={isSendingEmail || recipients.length === 0 || records.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B4DB7] to-[#7963E0] hover:from-[#4D3FA3] hover:to-[#6852D6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Email with Excel Attachment...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Excel Report to {recipients.length} Recipient(s)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            TechnoKraft Services LLP • Attendance Reports
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
