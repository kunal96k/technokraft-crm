import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  HelpCircle,
  Check,
  Building2,
  User,
  Mail,
  Phone,
  Sparkles,
  Info
} from 'lucide-react';
import { bulkImportLeads, checkDuplicateLead, CreateLeadPayload, BulkImportResponse } from '../../services/leadService';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';

interface ColumnMap {
  fileHeader: string;
  crmField: string;
  sampleValue: string;
}

interface ParsedRecord {
  raw: Record<string, string>;
  rowNum: number;
}

interface EvaluatedRecord {
  rowNum: number;
  status: 'VALID' | 'DUPLICATE' | 'INVALID';
  reason: string;
  payload?: CreateLeadPayload;
  display: {
    company: string;
    contact: string;
    email: string;
    phone: string;
    service: string;
    source: string;
    city: string;
  };
}

// Predefined available Lead CRM field targets
const CRM_FIELD_OPTIONS = [
  { group: 'Required Fields', options: [
    { value: 'company.name', label: 'Company Name *', required: true },
    { value: 'contact.name', label: 'Contact Person Name *', required: true },
    { value: 'contact.phone', label: 'Phone / Mobile *', required: true },
    { value: 'contact.email', label: 'Email Address *', required: true },
    { value: 'service', label: 'Interested Service *', required: true },
    { value: 'source', label: 'Lead Source *', required: true },
  ]},
  { group: 'Company Details', options: [
    { value: 'company.website', label: 'Company Website' },
    { value: 'company.industry', label: 'Industry / Sector' },
    { value: 'company.companySize', label: 'Company Size' },
    { value: 'company.city', label: 'City' },
    { value: 'company.state', label: 'State' },
    { value: 'company.country', label: 'Country' },
    { value: 'company.linkedIn', label: 'Company LinkedIn' },
    { value: 'company.description', label: 'Company Description' },
  ]},
  { group: 'Contact Details', options: [
    { value: 'contact.designation', label: 'Designation / Job Title' },
    { value: 'contact.alternatePhone', label: 'Alternate Phone' },
    { value: 'contact.linkedIn', label: 'Contact LinkedIn' },
  ]},
  { group: 'Requirement & Assignment', options: [
    { value: 'requirement.summary', label: 'Requirement Summary / Notes' },
    { value: 'requirement.budgetRange', label: 'Budget Range' },
    { value: 'requirement.expectedTimeline', label: 'Expected Timeline' },
    { value: 'requirement.problemStatement', label: 'Problem Statement' },
    { value: 'requirement.currentTech', label: 'Current Tech Stack' },
    { value: 'requirement.additionalNotes', label: 'Additional Notes' },
    { value: 'priority', label: 'Priority (LOW, MEDIUM, HIGH, URGENT)' },
    { value: 'score', label: 'Lead Score (0 - 100)' },
    { value: 'assignedEmployeeName', label: 'Assigned Sales Rep' },
    { value: 'assignedBAName', label: 'Assigned Business Analyst' },
  ]},
  { group: 'System', options: [
    { value: 'IGNORE', label: '[ Ignore Column ]' },
  ]}
];

// Default sample demo CSV data
const DEFAULT_DEMO_CSV = `Company Name,Website,Contact Person,Designation,Email Address,Phone Number,Service,Lead Source,City,Requirement Summary,Budget Range,Expected Timeline
Apex Industrial Robotics,https://apexrobotics.in,Nitin Gadre,VP Technology,nitin.gadre@apexrobotics.in,+91 98220 54321,Custom Software Development,LinkedIn,Pune,Needs automated factory monitoring IoT dashboard,₹15,00,000 - ₹25,00,000,3-4 Months
OmniTrade International,https://omnitrade.co.in,Rohit Khandelwal,Managing Director,rohit@omnitrade.co.in,+91 98900 12345,Web Development,Cold Calling,Mumbai,Modern B2B multi-vendor trading portal,₹8,00,000 - ₹12,00,000,2 Months
Zeta Healthcare Solutions,https://zetahealth.com,Dr. Shalini Roy,Director of Operations,shalini@zetahealth.com,+91 99220 88776,AI / ML Solutions,Referral,Bengaluru,Clinical diagnostic AI predictive model,₹20,00,000 - ₹35,00,000,6 Months
Nexus Logistics World,https://nexuslogistics.com,Vikas Mehta,Head of Supply Chain,vikas.mehta@nexuslogistics.com,+91 98450 67890,Mobile App Development,Website,Nashik,Fleet tracking mobile driver & dispatcher application,₹10,00,000 - ₹15,00,000,3 Months
FinEdge Capital Corp,https://finedgecap.com,Pooja Shenoy,AVP Digital Channels,pooja.shenoy@finedgecap.com,+91 98110 34567,Cloud & DevOps,Email Campaign,Hyderabad,AWS migration and Kubernetes CI/CD modernization,₹12,00,000 - ₹18,00,000,2-3 Months
AeroTech Dynamics,https://aerotechdynamics.in,Sameer Joshi,Senior Engineering Manager,sameer.joshi@aerotechdynamics.in,+91 97650 11223,Custom Software Development,Trade Show,Pune,Proprietary telemetry logging and analytics software,₹25,00,000 - ₹40,00,000,5 Months
Nova Retailers India,https://novaretail.in,Anita Sen,Chief Marketing Officer,anita.sen@novaretail.in,+91 98300 98765,Web Development,Direct / Import,Kolkata,Omnichannel ecommerce platform redesign,₹7,00,000 - ₹10,00,000,1.5 Months
GreenLeaf Agro Ventures,https://greenleafagro.in,Rameshwar Kulkarni,Founder & CEO,rameshwar@greenleafagro.in,+91 99700 44556,Digital Marketing,Organic Search,Nashik,B2B exports lead generation and SEO campaign,₹3,00,000 - ₹5,00,000,Ongoing
Sterling Diagnostics Labs,https://sterlingdiag.com,Meera Deshmukh,Head of IT,meera.d@sterlingdiag.com,+91 98221 66778,AI / ML Solutions,Partner Network,Pune,Pathology test automated reporting and OCR parsing,₹18,00,000 - ₹28,00,000,4 Months
Quantum Micro Electronics,https://quantummicro.io,Aditya Verma,Product VP,aditya.verma@quantummicro.io,+91 98990 22334,Custom Software Development,LinkedIn,Bengaluru,Hardware firmware integration dashboard,₹22,00,000 - ₹30,00,000,4-5 Months`;

// Helper: Parse CSV text correctly with quoted strings
function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let curVal = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const next = line[i + 1];

      if (c === '"') {
        if (inQuotes && next === '"') {
          curVal += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        values.push(curVal.trim());
        curVal = '';
      } else {
        curVal += c;
      }
    }
    values.push(curVal.trim());
    return values;
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let idx = 1; idx < lines.length; idx++) {
    const values = parseLine(lines[idx]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, hIdx) => {
      rowObj[h] = values[hIdx] || '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

// Helper: Smart auto-matcher from header name to Lead field
function autoMatchHeader(header: string): string {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (/^(company|companyname|org|organization|client|account)$/.test(h)) return 'company.name';
  if (/^(website|web|url|domain|companywebsite)$/.test(h)) return 'company.website';
  if (/^(contact|contactperson|contactname|person|name|fullname|leadname)$/.test(h)) return 'contact.name';
  if (/^(designation|jobtitle|title|role|position)$/.test(h)) return 'contact.designation';
  if (/^(email|emailaddress|mail|contactemail)$/.test(h)) return 'contact.email';
  if (/^(phone|mobile|phonenumber|mobilenumber|contactno|contactnumber|tel)$/.test(h)) return 'contact.phone';
  if (/^(altphone|alternatephone|secondaryphone)$/.test(h)) return 'contact.alternatePhone';
  if (/^(service|services|targetservice|interestedservice|offering|product)$/.test(h)) return 'service';
  if (/^(source|leadsource|channel|sourcechannel|origin)$/.test(h)) return 'source';
  if (/^(city|location|town|district)$/.test(h)) return 'company.city';
  if (/^(state|province|region)$/.test(h)) return 'company.state';
  if (/^(country|nation)$/.test(h)) return 'company.country';
  if (/^(industry|sector|vertical|domainindustry)$/.test(h)) return 'company.industry';
  if (/^(companysize|size|employees|teamcount)$/.test(h)) return 'company.companySize';
  if (/^(requirement|requirements|summary|projectsummary|notes|internalnotes|description|scope)$/.test(h)) return 'requirement.summary';
  if (/^(budget|budgetrange|estimatedbudget|cost)$/.test(h)) return 'requirement.budgetRange';
  if (/^(timeline|expectedtimeline|duration|deadline)$/.test(h)) return 'requirement.expectedTimeline';
  if (/^(problemstatement|problem)$/.test(h)) return 'requirement.problemStatement';
  if (/^(tech|technology|currenttech|stack)$/.test(h)) return 'requirement.currentTech';
  if (/^(priority|urgency)$/.test(h)) return 'priority';
  if (/^(score|leadscore)$/.test(h)) return 'score';
  if (/^(assignedto|salesrep|assignedemployee|executive)$/.test(h)) return 'assignedEmployeeName';
  if (/^(assignedba|ba|analyst)$/.test(h)) return 'assignedBAName';

  return 'IGNORE';
}

export const BulkImportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [uploadedFileName, setUploadedFileName] = useState<string>('TechnoKraft_Enterprise_Leads_Batch_Q3.csv');
  const [csvRawText, setCsvRawText] = useState<string>(DEFAULT_DEMO_CSV);
  const [parsedRows, setParsedRows] = useState<ParsedRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMap[]>([]);
  const [evaluatedRecords, setEvaluatedRecords] = useState<EvaluatedRecord[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Execution & Progress State
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isImportComplete, setIsImportComplete] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<BulkImportResponse | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'VALID' | 'DUPLICATE' | 'INVALID'>('ALL');
  const [previewSearch, setPreviewSearch] = useState<string>('');

  // Initial demo load on mount
  useEffect(() => {
    loadCsvContent(DEFAULT_DEMO_CSV, 'TechnoKraft_Enterprise_Leads_Demo.csv');
  }, []);

  const loadCsvContent = (content: string, fileName: string) => {
    setCsvRawText(content);
    setUploadedFileName(fileName);

    const { headers: parsedHeaders, rows } = parseCSV(content);
    setHeaders(parsedHeaders);

    const records: ParsedRecord[] = rows.map((r, i) => ({
      raw: r,
      rowNum: i + 1,
    }));
    setParsedRows(records);

    // Build initial mappings with smart auto-match
    const newMappings: ColumnMap[] = parsedHeaders.map((hdr) => {
      const sampleVal = rows.length > 0 ? (rows[0][hdr] || '') : '';
      return {
        fileHeader: hdr,
        crmField: autoMatchHeader(hdr),
        sampleValue: sampleVal,
      };
    });

    setMappings(newMappings);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        loadCsvContent(text, file.name);
        setCurrentStep(2);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([DEFAULT_DEMO_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TechnoKraft_Lead_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run Pre-Import Validation on parsed records
  const runValidation = async () => {
    setIsValidating(true);

    const fieldMap: Record<string, string> = {};
    mappings.forEach((m) => {
      if (m.crmField && m.crmField !== 'IGNORE') {
        fieldMap[m.crmField] = m.fileHeader;
      }
    });

    const evaluated: EvaluatedRecord[] = [];
    const seenEmailsInFile = new Set<string>();
    const seenCompaniesInFile = new Set<string>();

    for (const record of parsedRows) {
      const getVal = (fieldKey: string) => {
        const header = fieldMap[fieldKey];
        return header ? (record.raw[header] || '').trim() : '';
      };

      const companyName = getVal('company.name');
      const contactName = getVal('contact.name');
      const email = getVal('contact.email');
      const phone = getVal('contact.phone');
      const service = getVal('service') || 'Custom Software Development';
      const source = getVal('source') || 'Direct / Import';
      const city = getVal('company.city');

      const website = getVal('company.website');
      const industry = getVal('company.industry');
      const companySize = getVal('company.companySize');
      const state = getVal('company.state');
      const country = getVal('company.country') || 'India';
      const designation = getVal('contact.designation');
      const alternatePhone = getVal('contact.alternatePhone');
      const summary = getVal('requirement.summary');
      const budgetRange = getVal('requirement.budgetRange') || 'Flexible';
      const expectedTimeline = getVal('requirement.expectedTimeline') || 'To be determined';
      const problemStatement = getVal('requirement.problemStatement');
      const currentTech = getVal('requirement.currentTech');
      const additionalNotes = getVal('requirement.additionalNotes');
      const priority = getVal('priority') || 'MEDIUM';
      const rawScore = parseInt(getVal('score') || '50', 10);
      const score = isNaN(rawScore) ? 50 : rawScore;
      const assignedEmployeeName = getVal('assignedEmployeeName');
      const assignedBAName = getVal('assignedBAName');

      const displayObj = {
        company: companyName || '(Empty Company)',
        contact: contactName || '(Empty Contact)',
        email: email || '',
        phone: phone || '',
        service: service,
        source: source,
        city: city || 'Not specified',
      };

      // 1. Check Missing Required Fields
      const missingFields: string[] = [];
      if (!companyName) missingFields.push('Company Name');
      if (!contactName) missingFields.push('Contact Person');
      if (!email && !phone) missingFields.push('Email or Phone');

      if (missingFields.length > 0) {
        evaluated.push({
          rowNum: record.rowNum,
          status: 'INVALID',
          reason: `Missing required: ${missingFields.join(', ')}`,
          display: displayObj,
        });
        continue;
      }

      // 2. Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        evaluated.push({
          rowNum: record.rowNum,
          status: 'INVALID',
          reason: `Malformed email address: '${email}'`,
          display: displayObj,
        });
        continue;
      }

      // 3. Check for In-File Duplicates
      const normEmail = email.toLowerCase();
      const normCompany = companyName.toLowerCase();
      if ((normEmail && seenEmailsInFile.has(normEmail)) || seenCompaniesInFile.has(normCompany)) {
        evaluated.push({
          rowNum: record.rowNum,
          status: 'DUPLICATE',
          reason: `Duplicate row in current spreadsheet (${email || companyName})`,
          display: displayObj,
        });
        continue;
      }

      // 4. Construct valid lead payload
      const payload: CreateLeadPayload = {
        company: {
          name: companyName,
          website: website || undefined,
          industry: industry || undefined,
          companySize: companySize || undefined,
          city: city || undefined,
          state: state || undefined,
          country: country || undefined,
        },
        contact: {
          name: contactName,
          designation: designation || undefined,
          email: email,
          phone: phone,
          alternatePhone: alternatePhone || undefined,
        },
        requirement: {
          summary: summary || `Requirement discussion initiated for ${service}`,
          budgetRange: budgetRange,
          expectedTimeline: expectedTimeline,
          problemStatement: problemStatement || undefined,
          currentTech: currentTech || undefined,
          additionalNotes: additionalNotes || undefined,
        },
        service: service,
        source: source,
        status: 'NEW',
        priority: priority,
        score: score,
        assignedEmployeeName: assignedEmployeeName || undefined,
        assignedBAName: assignedBAName || undefined,
        createdByName: authUser?.name || 'Bulk Import Specialist',
        createdByEmail: authUser?.email || '',
        createdByRole: authUser?.accessRole || authUser?.role || 'Admin',
        updatedByName: authUser?.name || 'Bulk Import Specialist',
        updatedByEmail: authUser?.email || '',
        updatedByRole: authUser?.accessRole || authUser?.role || 'Admin',
      };

      if (normEmail) seenEmailsInFile.add(normEmail);
      seenCompaniesInFile.add(normCompany);

      evaluated.push({
        rowNum: record.rowNum,
        status: 'VALID',
        reason: 'All required fields verified',
        payload,
        display: displayObj,
      });
    }

    // Optional quick backend duplicate check for first 5 valid records
    for (const item of evaluated) {
      if (item.status === 'VALID' && item.payload) {
        try {
          const dupRes = await checkDuplicateLead(item.payload.contact.email, item.payload.company.name);
          if (dupRes.isDuplicate && dupRes.matchedLeads?.length > 0) {
            item.status = 'DUPLICATE';
            item.reason = `Matches existing CRM Lead (${dupRes.matchedLeads[0].leadCode || dupRes.matchedLeads[0].companyName})`;
          }
        } catch {}
      }
    }

    setEvaluatedRecords(evaluated);
    setIsValidating(false);
  };

  // Trigger validation when transitioning to Step 3
  const handleProceedToValidation = async () => {
    setCurrentStep(3);
    await runValidation();
  };

  // Download Error / Duplicate Report CSV
  const handleDownloadErrorReport = () => {
    const errorRows = evaluatedRecords.filter((r) => r.status !== 'VALID');
    if (errorRows.length === 0) {
      alert('All records are 100% valid! No errors to download.');
      return;
    }

    const csvLines = [
      'Row Number,Status,Validation Reason,Company Name,Contact Person,Email,Phone,Service',
      ...errorRows.map((r) =>
        `"${r.rowNum}","${r.status}","${r.reason.replace(/"/g, '""')}","${r.display.company.replace(/"/g, '""')}","${r.display.contact.replace(/"/g, '""')}","${r.display.email}","${r.display.phone}","${r.display.service}"`
      ),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TechnoKraft_Import_Validation_Issues.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Execute Bulk Import via real backend API
  const handleStartImport = async () => {
    const validPayloads = evaluatedRecords
      .filter((r) => r.status === 'VALID' && r.payload)
      .map((r) => r.payload!);

    if (validPayloads.length === 0) {
      alert('No valid lead records available to import.');
      return;
    }

    setIsImporting(true);
    try {
      const response = await bulkImportLeads(validPayloads);
      setImportResult(response);
      setIsImportComplete(true);

      // Dispatch global update event so lead tables, summaries, and Kanban immediately refresh
      window.dispatchEvent(new CustomEvent('crm-leads-updated'));
    } catch (err) {
      console.error('Failed to execute bulk import:', err);
      setImportResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to connect to backend bulk import service.',
        totalRecords: validPayloads.length,
        importedCount: 0,
        duplicateCount: 0,
        errorCount: validPayloads.length,
        errors: [err instanceof Error ? err.message : 'Network error communicating with server.'],
      });
      setIsImportComplete(true);
    } finally {
      setIsImporting(false);
    }
  };

  // Validation Counters
  const validCount = useMemo(() => evaluatedRecords.filter((r) => r.status === 'VALID').length, [evaluatedRecords]);
  const duplicateCount = useMemo(() => evaluatedRecords.filter((r) => r.status === 'DUPLICATE').length, [evaluatedRecords]);
  const invalidCount = useMemo(() => evaluatedRecords.filter((r) => r.status === 'INVALID').length, [evaluatedRecords]);
  const totalCount = evaluatedRecords.length;

  // Filtered preview rows
  const filteredPreviewRecords = useMemo(() => {
    return evaluatedRecords.filter((r) => {
      if (previewFilter !== 'ALL' && r.status !== previewFilter) return false;
      if (previewSearch.trim()) {
        const query = previewSearch.toLowerCase();
        return (
          r.display.company.toLowerCase().includes(query) ||
          r.display.contact.toLowerCase().includes(query) ||
          r.display.email.toLowerCase().includes(query) ||
          r.display.phone.toLowerCase().includes(query) ||
          r.display.service.toLowerCase().includes(query) ||
          r.reason.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [evaluatedRecords, previewFilter, previewSearch]);

  const stepsList = [
    { num: 1, label: 'Upload File' },
    { num: 2, label: 'Map Columns' },
    { num: 3, label: 'Validation' },
    { num: 4, label: 'Preview' },
    { num: 5, label: 'Execute Import' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Import Leads"
        description="Batch import prospective B2B client records into TechnoKraft CRM from Excel or CSV files."
        actions={
          <Link
            to="/leads"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Back to Leads</span>
          </Link>
        }
      />

      {/* Step Indicator Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {stepsList.map((step) => {
            const isCompleted = step.num < currentStep || isImportComplete;
            const isCurrent = step.num === currentStep && !isImportComplete;

            return (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#5B4DB7] text-white ring-4 ring-purple-100 dark:ring-purple-950/60'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrent
                        ? 'text-[#5B4DB7] dark:text-purple-300'
                        : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {step.num < stepsList.length && (
                  <div
                    className={`h-0.5 flex-1 min-w-[20px] max-w-[60px] mx-1 transition-colors ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: FILE UPLOAD */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Upload Leads Spreadsheet</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag and drop your lead database (.csv, .xlsx, .xls) or download our standardized template
            </p>
          </div>

          <input
            id="bulk-import-file-input"
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => document.getElementById('bulk-import-file-input')?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#5B4DB7] dark:hover:border-purple-400 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer group"
          >
            <div className="max-w-xs mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Drag & drop CSV or Excel file here
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">or click to browse from your device</p>
              </div>
              <span className="inline-block px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-mono text-slate-600 dark:text-slate-300">
                Supported: .csv, .xlsx, .xls (Up to 50 MB)
              </span>
            </div>
          </div>

          {/* Current Loaded File Details & Quick Action */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 rounded-lg">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{uploadedFileName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {parsedRows.length} records detected with {headers.length} columns
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadCsvContent(DEFAULT_DEMO_CSV, 'TechnoKraft_Enterprise_Leads_Demo.csv')}
              className="px-2.5 py-1.5 text-xs text-[#5B4DB7] dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg font-medium transition-colors"
            >
              Reset to Demo Dataset
            </button>
          </div>

          {/* Sample template download button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Need the standardized TechnoKraft columns?</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold shadow-2xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Download Sample Template (CSV)</span>
            </button>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span>Continue to Column Mapping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MAP COLUMNS */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Map File Columns to CRM Fields</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Match spreadsheet columns from <strong className="text-slate-800 dark:text-slate-200">{uploadedFileName}</strong> to legitimate Lead CRM module fields.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                {mappings.filter((m) => m.crmField !== 'IGNORE').length}/{mappings.length} Columns Mapped
              </span>
            </div>
          </div>

          {/* Quick instructions banner */}
          <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 rounded-xl flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
            <Sparkles className="w-4 h-4 text-[#5B4DB7] dark:text-purple-300 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Smart Column Auto-Detection Active</p>
              <p className="text-[11px] text-purple-700 dark:text-purple-300">
                Fields marked with <span className="font-bold text-rose-600 dark:text-rose-400">*</span> are mandatory for lead creation (<code className="bg-purple-100 dark:bg-purple-900/60 px-1 py-0.5 rounded text-[10px]">Company Name</code>, <code className="bg-purple-100 dark:bg-purple-900/60 px-1 py-0.5 rounded text-[10px]">Contact Person</code>, and at least one communication channel <code className="bg-purple-100 dark:bg-purple-900/60 px-1 py-0.5 rounded text-[10px]">Email/Phone</code>).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Spreadsheet Header</th>
                  <th className="py-2.5 px-3 font-semibold">Sample Value (Row 1)</th>
                  <th className="py-2.5 px-3 font-semibold">Destination CRM Field</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {mappings.map((map, idx) => {
                  const isIgnored = map.crmField === 'IGNORE';
                  const isRequiredField = ['company.name', 'contact.name', 'contact.email', 'contact.phone', 'service', 'source'].includes(map.crmField);

                  return (
                    <tr key={idx} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${isIgnored ? 'opacity-60 bg-slate-50/30' : ''}`}>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {map.fileHeader}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 italic truncate max-w-[200px]">
                        {map.sampleValue || <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={map.crmField}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMappings((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, crmField: val } : m))
                            );
                          }}
                          className={`w-full max-w-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                            isRequiredField
                              ? 'border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200'
                              : isIgnored
                              ? 'border-slate-200 dark:border-slate-700 text-slate-400'
                              : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {CRM_FIELD_OPTIONS.map((grp) => (
                            <optgroup key={grp.group} label={grp.group}>
                              {grp.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleProceedToValidation}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <span>Validate Dataset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: VALIDATION STATS */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pre-Import Validation Statistics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quality & integrity verification performed across all {totalCount} records in <strong className="text-slate-800 dark:text-slate-200">{uploadedFileName}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={runValidation}
              disabled={isValidating}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin text-[#5B4DB7]' : 'text-slate-500'}`} />
              <span>Re-run Validation</span>
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left">
              <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Total Records</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">From spreadsheet</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Valid Leads</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{validCount}</p>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 block">
                Ready to import ({totalCount > 0 ? Math.round((validCount / totalCount) * 100) : 0}%)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-300">Duplicates</span>
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">{duplicateCount}</p>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 block">Skipped automatically</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-rose-800 dark:text-rose-300">Invalid</span>
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-rose-900 dark:text-rose-200 mt-1">{invalidCount}</p>
              <span className="text-[11px] text-rose-700 dark:text-rose-400 mt-1 block">Missing required data</span>
            </div>
          </div>

          {/* Validation Status summary banner */}
          {invalidCount > 0 || duplicateCount > 0 ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {duplicateCount + invalidCount} Flagged Rows Identified
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Download an exact report with row numbers, raw values, and failure descriptions.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadErrorReport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold shadow-2xs whitespace-nowrap cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Download Error & Duplicate Report (CSV)</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold">Perfect Dataset Verification</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  All {validCount} rows passed schema and duplicate checks cleanly with no errors.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <span>Preview Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PREVIEW RECORDS */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Preview & Verify Lead Records</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect parsed lead records, communication details, and validation statuses
              </p>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-950/60 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    previewFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFilter('VALID')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    previewFilter === 'VALID'
                      ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Valid ({validCount})
                </button>
                {duplicateCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('DUPLICATE')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      previewFilter === 'DUPLICATE'
                        ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Duplicates ({duplicateCount})
                  </button>
                )}
                {invalidCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('INVALID')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      previewFilter === 'INVALID'
                        ? 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Invalid ({invalidCount})
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter preview..."
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] w-36 sm:w-44"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 font-semibold w-12">#</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Company</th>
                  <th className="py-2.5 px-3 font-semibold">Contact Person</th>
                  <th className="py-2.5 px-3 font-semibold">Email</th>
                  <th className="py-2.5 px-3 font-semibold">Phone</th>
                  <th className="py-2.5 px-3 font-semibold">Service</th>
                  <th className="py-2.5 px-3 font-semibold">City</th>
                  <th className="py-2.5 px-3 font-semibold">Validation Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPreviewRecords.length > 0 ? (
                  filteredPreviewRecords.map((rec) => (
                    <tr key={rec.rowNum} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{rec.rowNum}</td>
                      <td className="py-2.5 px-3">
                        {rec.status === 'VALID' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Valid ✓
                          </span>
                        )}
                        {rec.status === 'DUPLICATE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Duplicate ⚠
                          </span>
                        )}
                        {rec.status === 'INVALID' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Invalid ✕
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                        {rec.display.company}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                        {rec.display.contact}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                        {rec.display.email || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                        {rec.display.phone || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                        {rec.display.service}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {rec.display.city}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px]">
                        {rec.reason}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No records matched the current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              disabled={validCount === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Ready for Final Import ({validCount} Leads)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRM & EXECUTE */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-8 shadow-2xs space-y-6 text-center max-w-xl mx-auto">
          {!isImportComplete ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center mx-auto shadow-xs">
                <FileText className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ready to Import {validCount} Valid Leads
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  These verified records will be created in the TechnoKraft MySQL database with status{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">NEW</strong>, assigned sequential lead codes, and integrated into your active CRM pipeline.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Source Spreadsheet:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[240px]">{uploadedFileName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Valid Leads to Insert:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{validCount} leads</span>
                </div>
                {duplicateCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Duplicates to Skip:</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">{duplicateCount} leads</span>
                  </div>
                )}
                {invalidCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Invalid Rows to Skip:</span>
                    <span className="font-semibold text-rose-700 dark:text-rose-400">{invalidCount} rows</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartImport}
                  disabled={isImporting || validCount === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Importing records to database...</span>
                    </>
                  ) : (
                    <span>Execute Import ({validCount} Leads)</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Dynamic status feedback based on actual database result */}
              {(importResult?.importedCount ?? 0) === 0 ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto animate-in zoom-in-75 duration-200 shadow-xs">
                    <XCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">Import Failed (0 Leads Saved)</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Leads remained at 0 records in database. None of the submitted records were saved due to validation errors or server rejections.
                    </p>
                  </div>
                </>
              ) : (importResult?.errorCount ?? 0) > 0 ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto animate-in zoom-in-75 duration-200 shadow-xs">
                    <AlertTriangle className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400">Partially Imported ({importResult?.importedCount} Leads Saved)</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {importResult?.importedCount} leads were successfully saved in MySQL, but {importResult?.errorCount} rows had issues and were skipped.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in-75 duration-200 shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Leads Imported Successfully!</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {importResult?.importedCount} new prospective B2B client leads have been saved in MySQL and added to your CRM pipeline.
                    </p>
                  </div>
                </>
              )}

              {/* Execution Stats Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Successfully Imported:</span>
                  <span className={`font-bold ${(importResult?.importedCount ?? 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {importResult?.importedCount ?? 0} leads
                  </span>
                </div>
                {importResult && importResult.duplicateCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Duplicate Records Skipped:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {importResult.duplicateCount} records
                    </span>
                  </div>
                )}
                {importResult && importResult.errorCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Rows with Errors:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {importResult.errorCount} rows
                    </span>
                  </div>
                )}
              </div>

              {/* Error messages log if any */}
              {importResult?.errors && importResult.errors.length > 0 && (
                <div className="text-left space-y-1.5">
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Error Log & Validation Reasons:
                  </p>
                  <div className="bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1 text-xs text-rose-800 dark:text-rose-300">
                    {importResult.errors.map((err, errIdx) => (
                      <div key={errIdx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                        <span className="font-mono text-rose-500 flex-shrink-0">•</span>
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportComplete(false);
                    setImportResult(null);
                    setCurrentStep(1);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Import Another File
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/leads')}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <span>View Leads List</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
