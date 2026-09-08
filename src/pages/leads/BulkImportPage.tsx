import React, { useState } from 'react';
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
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';

interface ColumnMap {
  fileHeader: string;
  crmField: string;
  sampleValue: string;
}

export const BulkImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [uploadedFileName, setUploadedFileName] = useState<string>('TechnoKraft_Enterprise_Leads_Batch_Q3.xlsx');
  const [isImporting, setIsImporting] = useState(false);
  const [isImportComplete, setIsImportComplete] = useState(false);

  // Column Mappings State
  const [mappings, setMappings] = useState<ColumnMap[]>([
    { fileHeader: 'Company_Name', crmField: 'company.name', sampleValue: 'Apex Industrial Robotics' },
    { fileHeader: 'Website', crmField: 'company.website', sampleValue: 'apexrobotics.in' },
    { fileHeader: 'Contact_Person', crmField: 'contact.name', sampleValue: 'Nitin Gadre' },
    { fileHeader: 'Designation', crmField: 'contact.designation', sampleValue: 'VP Technology' },
    { fileHeader: 'Email_Address', crmField: 'contact.email', sampleValue: 'nitin.gadre@apexrobotics.in' },
    { fileHeader: 'Mobile_Number', crmField: 'contact.phone', sampleValue: '+91 98220 54321' },
    { fileHeader: 'Target_Service', crmField: 'service', sampleValue: 'Custom Software Development' },
    { fileHeader: 'Source_Channel', crmField: 'source', sampleValue: 'LinkedIn' },
    { fileHeader: 'City', crmField: 'company.city', sampleValue: 'Pune' },
    { fileHeader: 'Internal_Notes', crmField: 'requirement.summary', sampleValue: 'Needs automated factory monitoring IoT dashboard' },
  ]);

  const previewRecords = [
    {
      company: 'Apex Industrial Robotics',
      contact: 'Nitin Gadre',
      email: 'nitin.gadre@apexrobotics.in',
      phone: '+91 98220 54321',
      service: 'Custom Software Development',
      source: 'LinkedIn',
      status: 'VALID',
      message: 'All fields verified',
    },
    {
      company: 'OmniTrade International',
      contact: 'Rohit Khandelwal',
      email: 'rohit@omnitrade.co.in',
      phone: '+91 98900 12345',
      service: 'Web Development',
      source: 'Cold Calling',
      status: 'VALID',
      message: 'All fields verified',
    },
    {
      company: 'ABC Technologies Pvt Ltd',
      contact: 'Rahul Sharma',
      email: 'rahul.sharma@abctechnologies.in',
      phone: '+91 98230 45612',
      service: 'Custom Software Development',
      source: 'LinkedIn',
      status: 'DUPLICATE',
      message: 'Matched existing lead LD-2026-00125',
    },
    {
      company: 'Delta Micro Systems',
      contact: '',
      email: 'invalid-email-format@',
      phone: '+91 97650 99887',
      service: 'Cloud / DevOps',
      source: 'Website',
      status: 'INVALID',
      message: 'Missing contact person and invalid email format',
    },
    {
      company: 'Zeta Healthcare Solutions',
      contact: 'Dr. Shalini Roy',
      email: 'shalini@zetahealth.com',
      phone: '+91 99220 88776',
      service: 'AI / ML Solutions',
      source: 'Referral',
      status: 'VALID',
      message: 'All fields verified',
    },
  ];

  const handleStartImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setIsImportComplete(true);
    }, 1500);
  };

  const stepsList = [
    { num: 1, label: 'Upload File' },
    { num: 2, label: 'Map Columns' },
    { num: 3, label: 'Validation' },
    { num: 4, label: 'Preview' },
    { num: 5, label: 'Execute Import' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Import Leads"
        description="Batch import prospective B2B client records into TechnoKraft CRM from Excel or CSV files."
        actions={
          <Link
            to="/leads"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Back to Leads</span>
          </Link>
        }
      />

      {/* Step Indicator Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {stepsList.map((step) => {
            const isCompleted = step.num < currentStep || isImportComplete;
            const isCurrent = step.num === currentStep && !isImportComplete;

            return (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-[#5B4DB7] text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrent ? 'text-[#5B4DB7]' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {step.num < stepsList.length && (
                  <div
                    className={`h-0.5 flex-1 min-w-[20px] max-w-[60px] mx-1 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
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
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold text-slate-900">Upload Leads Spreadsheet</h2>
            <p className="text-xs text-slate-500">
              Drag and drop your lead database or download our standardized template
            </p>
          </div>

          <div
            onClick={() => setCurrentStep(2)}
            className="border-2 border-dashed border-slate-300 hover:border-[#5B4DB7] bg-slate-50/60 hover:bg-purple-50/20 rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer group"
          >
            <div className="max-w-xs mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#5B4DB7] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Drag & drop CSV or Excel file here
                </p>
                <p className="text-xs text-slate-400 mt-1">or click to browse from your device</p>
              </div>
              <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-mono text-slate-600">
                Supported: .csv, .xlsx, .xls (Up to 50 MB)
              </span>
            </div>
          </div>

          {/* Sample template download button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-500">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Need the required column headers?</span>
            </div>
            <button
              type="button"
              onClick={() => alert('Sample template downloaded (TechnoKraft_Lead_Template.xlsx)')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Sample Template</span>
            </button>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold transition-colors"
            >
              <span>Continue to Column Mapping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MAP COLUMNS */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Map File Columns to CRM Fields</h2>
              <p className="text-xs text-slate-500">
                Matched columns from <strong className="text-slate-800">{uploadedFileName}</strong>
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Auto-mapped 10/10 columns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Spreadsheet Header</th>
                  <th className="py-2.5 px-3 font-semibold">Sample Value</th>
                  <th className="py-2.5 px-3 font-semibold">Destination CRM Field</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mappings.map((map, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {map.fileHeader}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 italic truncate max-w-[200px]">
                      {map.sampleValue}
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
                        className="w-full max-w-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                      >
                        <option value="company.name">Company Name *</option>
                        <option value="company.website">Website</option>
                        <option value="contact.name">Contact Person *</option>
                        <option value="contact.designation">Designation</option>
                        <option value="contact.email">Email Address *</option>
                        <option value="contact.phone">Phone / Mobile *</option>
                        <option value="service">Interested Service *</option>
                        <option value="source">Lead Source *</option>
                        <option value="company.city">City</option>
                        <option value="requirement.summary">Requirement Summary</option>
                        <option value="IGNORE">[ Ignore Column ]</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold"
            >
              <span>Validate Dataset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: VALIDATION STATS */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Pre-Import Validation Statistics</h2>
            <p className="text-xs text-slate-500">
              Quality check performed across 1,250 records in the uploaded spreadsheet
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Records</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">1,250</p>
              <span className="text-[11px] text-slate-500 mt-1 block">In spreadsheet</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-emerald-800">Valid Leads</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-1">1,190</p>
              <span className="text-[11px] text-emerald-700 mt-1 block">Ready for import (95.2%)</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-amber-800">Duplicates</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-900 mt-1">45</p>
              <span className="text-[11px] text-amber-700 mt-1 block">Existing company/phone</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-rose-800">Invalid</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-rose-900 mt-1">15</p>
              <span className="text-[11px] text-rose-700 mt-1 block">Missing required email/phone</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-slate-800">Download Detailed Error & Duplicate Report</p>
              <p className="text-slate-500 text-[11px]">
                Review the 60 flagged rows with exact validation failure reasons
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('Validation error report downloaded (TechnoKraft_Import_Errors.csv)')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Error Report (CSV)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold"
            >
              <span>Preview Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PREVIEW RECORDS */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Preview First 5 Records</h2>
              <p className="text-xs text-slate-500">Inspect parsed lead records and status validation tags</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              Showing sample 5 of 1,250
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Company</th>
                  <th className="py-2.5 px-3 font-semibold">Contact Person</th>
                  <th className="py-2.5 px-3 font-semibold">Email</th>
                  <th className="py-2.5 px-3 font-semibold">Phone</th>
                  <th className="py-2.5 px-3 font-semibold">Service</th>
                  <th className="py-2.5 px-3 font-semibold">Validation Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRecords.map((rec, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      {rec.status === 'VALID' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Valid ✓
                        </span>
                      )}
                      {rec.status === 'DUPLICATE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Duplicate ⚠
                        </span>
                      )}
                      {rec.status === 'INVALID' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Invalid ✕
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{rec.company}</td>
                    <td className="py-2.5 px-3">{rec.contact || <span className="text-slate-300 italic">Empty</span>}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{rec.email}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{rec.phone}</td>
                    <td className="py-2.5 px-3 text-slate-700">{rec.service}</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500">{rec.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold"
            >
              <span>Ready for Final Import</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRM & EXECUTE */}
      {currentStep === 5 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-8 shadow-2xs space-y-6 text-center max-w-xl mx-auto">
          {!isImportComplete ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#5B4DB7] flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Ready to Import 1,190 Valid Leads
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The validated records will be added to the TechnoKraft CRM Leads queue with status{' '}
                  <strong className="text-slate-800 font-semibold">NEW</strong> and assigned to your default team distribution workflow.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span>Source File:</span>
                  <span className="font-semibold text-slate-900">{uploadedFileName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Leads to Add:</span>
                  <span className="font-semibold text-emerald-700">1,190 leads</span>
                </div>
                <div className="flex justify-between">
                  <span>Duplicates to Skip:</span>
                  <span className="font-semibold text-amber-700">45 leads</span>
                </div>
                <div className="flex justify-between">
                  <span>Invalid Rows to Skip:</span>
                  <span className="font-semibold text-rose-700">15 rows</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartImport}
                  disabled={isImporting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Importing records...</span>
                    </>
                  ) : (
                    <span>Import 1,190 Leads</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in-75 duration-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Leads Imported Successfully!</h2>
                <p className="text-xs text-slate-500">
                  1,190 new leads have been added to your CRM pipeline.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportComplete(false);
                    setCurrentStep(1);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Import Another File
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/leads')}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold shadow-xs"
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
