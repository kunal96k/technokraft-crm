import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyAttendanceRecord } from '../types/employees';
import { TECHNOKRAFT_LOGO_BASE64 } from '../assets/brandLogoBase64';

export interface ReportMetadata {
  dateRangeLabel: string;
  startDate: string;
  endDate: string;
  statusFilter: string;
  accountStatusFilter?: string;
  departmentFilter?: string;
  generatedBy?: string;
  generatedAt?: string;
}

export interface ReportSummaryStats {
  total: number;
  present: number;
  late: number;
  halfDay: number;
  absent: number;
  onLeave: number;
  attendanceRate: number;
}

export const COMPANY_DETAILS = {
  name: 'TechnoKraft Services LLP',
  address: "3rd Floor, Kanchwala Avenue, Above Viju's Dabeli, Thatte Nagar Marg, College Road, Nashik, Maharashtra 422005",
  mobile: '+91 93701 74424',
  email: 'info@technokraftservices.com',
  website: 'https://crm.technokraftservices.com',
};

/**
 * Builds a styled SheetJS workbook for attendance records
 */
export function buildAttendanceWorkbook(
  records: DailyAttendanceRecord[],
  metadata: ReportMetadata
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Prepare Header rows
  const generatedTimestamp = metadata.generatedAt || new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const headerRows = [
    [COMPANY_DETAILS.name],
    ['OFFICIAL ATTENDANCE & TELEMETRY REPORT'],
    [`Report Period: ${metadata.dateRangeLabel} (${metadata.startDate} to ${metadata.endDate})`],
    [
      `Account Filter: ${metadata.accountStatusFilter || 'Active'} | Attendance Status Filter: ${metadata.statusFilter} | Total Records: ${records.length} | Generated: ${generatedTimestamp}`,
    ],
    [], // Blank spacing row
    [
      'S.No',
      'Date',
      'Employee Code',
      'Employee Name',
      'Department',
      'Designation / Role',
      'Account Status',
      'Shift Schedule',
      'Punch In Time',
      'Punch Out Time',
      'Working Hours',
      'Break Duration',
      'Attendance Status',
      'Operational Status',
    ],
  ];

  // 2. Prepare Data rows
  const dataRows = records.map((rec, index) => {
    const shift =
      rec.shiftStartTime && rec.shiftEndTime
        ? `${rec.shiftStartTime} - ${rec.shiftEndTime}`
        : '10:00 AM - 07:00 PM';

    return [
      index + 1,
      rec.date || '—',
      rec.employeeCode || '—',
      rec.employeeName || '—',
      rec.department || 'General',
      rec.employeeRole || 'Employee',
      rec.employeeStatus || 'Active',
      shift,
      rec.loginTime || '—',
      rec.logoutTime || '—',
      rec.workingHours || '0h 00m',
      rec.breakTime || '0m',
      rec.status || 'Present',
      rec.workStatus || 'Active',
    ];
  });

  const allRows = [...headerRows, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // 3. Define responsive column widths
  ws['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 13 }, // Date
    { wch: 15 }, // Emp Code
    { wch: 22 }, // Emp Name
    { wch: 18 }, // Department
    { wch: 20 }, // Designation
    { wch: 16 }, // Account Status
    { wch: 24 }, // Shift Schedule
    { wch: 16 }, // Punch In
    { wch: 16 }, // Punch Out
    { wch: 15 }, // Working Hours
    { wch: 15 }, // Break Duration
    { wch: 18 }, // Attendance Status
    { wch: 18 }, // Operational Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
  return wb;
}

/**
 * Trigger immediate client-side download of the Excel file
 */
export function downloadAttendanceExcel(
  records: DailyAttendanceRecord[],
  metadata: ReportMetadata
): void {
  const wb = buildAttendanceWorkbook(records, metadata);
  const cleanDate = metadata.startDate === metadata.endDate
    ? metadata.startDate
    : `${metadata.startDate}_to_${metadata.endDate}`;
  const fileName = `attendance_report_${cleanDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Generate in-memory Base64 string of the Excel file for backend email attachment
 */
export function getAttendanceExcelBase64(
  records: DailyAttendanceRecord[],
  metadata: ReportMetadata
): string {
  const wb = buildAttendanceWorkbook(records, metadata);
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  return excelBuffer;
}

/**
 * Generate branded PDF with corporate header, summary metric boxes and clean autoTable grid
 */
export function generateAttendancePdf(
  records: DailyAttendanceRecord[],
  summary: ReportSummaryStats,
  metadata: ReportMetadata
): void {
  // Landscape A4 orientation: 297mm width x 210mm height
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Corporate Header Background Bar
  doc.setFillColor(91, 77, 183); // #5B4DB7 Brand Purple
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Try adding Brand Logo
  let logoOffset = margin;
  try {
    if (TECHNOKRAFT_LOGO_BASE64) {
      doc.addImage(TECHNOKRAFT_LOGO_BASE64, 'PNG', margin, 9, 32, 11);
      logoOffset = margin + 35;
    }
  } catch (err) {
    console.debug('[PDF] Could not render base64 logo:', err);
  }

  // Company Name & Report Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(COMPANY_DETAILS.name, logoOffset, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(
    `${COMPANY_DETAILS.address} | Tel: ${COMPANY_DETAILS.mobile} | Email: ${COMPANY_DETAILS.email}`,
    logoOffset,
    18.5
  );

  // Report Title & Metadata (Right-aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(91, 77, 183); // #5B4DB7
  doc.text('ATTENDANCE REPORT', pageWidth - margin, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Period: ${metadata.dateRangeLabel}`, pageWidth - margin, 17.5, { align: 'right' });
  doc.text(
    `Account: ${metadata.accountStatusFilter || 'Active'} | Status: ${metadata.statusFilter} | Generated: ${metadata.generatedAt || new Date().toLocaleDateString('en-IN')}`,
    pageWidth - margin,
    21.5,
    { align: 'right' }
  );

  // Subtle separator line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, 25, pageWidth - margin, 25);

  // 2. Summary Metric Badges Box
  const summaryY = 28;
  const cardWidth = (pageWidth - margin * 2 - 20) / 5;
  const cardHeight = 13;

  const summaryCards = [
    { label: 'TOTAL LOGGED', value: String(summary.total), color: [79, 70, 229], bg: [238, 242, 255] },      // Indigo
    { label: 'PRESENT', value: String(summary.present), color: [16, 185, 129], bg: [236, 253, 245] },          // Emerald
    { label: 'LATE ARRIVALS', value: String(summary.late), color: [245, 158, 11], bg: [254, 243, 199] },       // Amber
    { label: 'HALF DAY', value: String(summary.halfDay), color: [99, 102, 241], bg: [238, 242, 255] },         // Indigo
    { label: 'ABSENT', value: String(summary.absent), color: [239, 68, 68], bg: [254, 242, 242] },             // Rose
  ];

  summaryCards.forEach((card, idx) => {
    const cardX = margin + idx * (cardWidth + 5);

    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.roundedRect(cardX, summaryY, cardWidth, cardHeight, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.label, cardX + cardWidth / 2, summaryY + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(card.value, cardX + cardWidth / 2, summaryY + 10.5, { align: 'center' });
  });

  // 3. Tabular Attendance Grid
  const tableHeaders = [
    'S.N',
    'Date',
    'Emp Code',
    'Name',
    'Department',
    'Role',
    'Account',
    'Shift',
    'Punch In',
    'Punch Out',
    'Working',
    'Break',
    'Status',
  ];

  const tableBody = records.map((rec, i) => [
    i + 1,
    rec.date || '—',
    rec.employeeCode || '—',
    rec.employeeName || '—',
    rec.department || 'General',
    rec.employeeRole || '—',
    rec.employeeStatus || 'Active',
    rec.shiftStartTime && rec.shiftEndTime ? `${rec.shiftStartTime}-${rec.shiftEndTime}` : '10AM-7PM',
    rec.loginTime || '—',
    rec.logoutTime || '—',
    rec.workingHours || '0h 00m',
    rec.breakTime || '0m',
    rec.status || 'Present',
  ]);

  autoTable(doc, {
    startY: summaryY + cardHeight + 4,
    head: [tableHeaders],
    body: tableBody,
    margin: { left: margin, right: margin, bottom: 14 },
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      font: 'helvetica',
      textColor: [51, 65, 85], // slate-700
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [91, 77, 183], // #5B4DB7
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },  // S.No
      1: { cellWidth: 18 },                  // Date
      2: { cellWidth: 18 },                  // Emp Code
      3: { cellWidth: 32, fontStyle: 'bold' }, // Name
      4: { cellWidth: 22 },                  // Department
      5: { cellWidth: 22 },                  // Role
      6: { cellWidth: 16, halign: 'center' }, // Account Status
      7: { cellWidth: 24 },                  // Shift
      8: { cellWidth: 18 },                  // Punch In
      9: { cellWidth: 18 },                  // Punch Out
      10: { cellWidth: 16, halign: 'center' }, // Working
      11: { cellWidth: 15, halign: 'center' }, // Break
      12: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }, // Status
    },
    didParseCell: (data) => {
      // Highlight Attendance Status cell
      if (data.section === 'body' && data.column.index === 12) {
        const statusVal = String(data.cell.raw).trim();
        if (statusVal === 'Late') {
          data.cell.styles.textColor = [180, 83, 9]; // amber-700
          data.cell.styles.fillColor = [254, 243, 199]; // amber-100
        } else if (statusVal === 'Present') {
          data.cell.styles.textColor = [4, 120, 87]; // emerald-700
          data.cell.styles.fillColor = [209, 250, 229]; // emerald-100
        } else if (statusVal === 'Half Day') {
          data.cell.styles.textColor = [67, 56, 202]; // indigo-700
          data.cell.styles.fillColor = [224, 231, 255]; // indigo-100
        } else if (statusVal === 'Absent') {
          data.cell.styles.textColor = [185, 28, 28]; // rose-700
          data.cell.styles.fillColor = [254, 226, 226]; // rose-100
        }
      }
    },
    didDrawPage: (data) => {
      // Page Numbering Footer on every page
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()} • Confidential Corporate Attendance Record • © 2026 TechnoKraft Services LLP`;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(str, pageWidth / 2, pageHeight - 6, { align: 'center' });
    },
  });

  const cleanDate = metadata.startDate === metadata.endDate
    ? metadata.startDate
    : `${metadata.startDate}_to_${metadata.endDate}`;
  const fileName = `attendance_report_${cleanDate}.pdf`;
  doc.save(fileName);
}
