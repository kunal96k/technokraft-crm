import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Download,
  Eye,
  ExternalLink,
  Tag,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Loader2,
} from 'lucide-react';
import { Lead } from '../../types/leads';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadPriorityBadge } from './LeadPriorityBadge';
import { LeadScoreBadge } from './LeadScoreBadge';
import { viewAttachmentFile, downloadAttachmentFile } from '../../services/leadService';

interface ViewLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullLead?: (leadId: string) => void;
  onLeadUpdated?: (updatedLead: Lead) => void;
}

export const ViewLeadModal: React.FC<ViewLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
  onOpenFullLead,
  onLeadUpdated,
}) => {
  const [activeAttId, setActiveAttId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [leadData, setLeadData] = useState<Lead | null>(lead);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync and fetch full lead details on open to guarantee attachments are loaded
  React.useEffect(() => {
    if (isOpen && lead) {
      setLeadData(lead);
      let isMounted = true;
      import('../../services/leadService').then(({ fetchLeadById }) => {
        fetchLeadById(lead.id)
          .then((full) => {
            if (isMounted && full) {
              setLeadData(full);
            }
          })
          .catch((err) => {
            console.warn('[ViewLeadModal] Could not reload full lead:', err);
          });
      });
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, lead?.id]);

  if (!isOpen || !leadData) return null;

  const currentLead = leadData;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const { uploadAttachment, fetchLeadById } = await import('../../services/leadService');
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        await uploadAttachment(file, String(currentLead.id));
      }
      const refreshed = await fetchLeadById(currentLead.id);
      if (refreshed) {
        setLeadData(refreshed);
        if (onLeadUpdated) onLeadUpdated(refreshed);
      }
    } catch (err) {
      console.error('[ViewLeadModal] Upload failed:', err);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleViewFile = async (attId: string, name: string) => {
    try {
      setActiveAttId(attId);
      setIsProcessing(true);
      await viewAttachmentFile(attId, name);
    } catch (err) {
      console.error('Error viewing document:', err);
      alert('Opening file stream in new tab...');
      window.open(`/api/attachments/${String(attId).replace(/^att-/, '')}/download`, '_blank');
    } finally {
      setIsProcessing(false);
      setActiveAttId(null);
    }
  };

  const handleDownloadFile = async (attId: string, name: string) => {
    try {
      setActiveAttId(attId);
      setIsProcessing(true);
      await downloadAttachmentFile(attId, name);
    } catch (err) {
      console.error('Error downloading document:', err);
      // Direct browser fallback
      const link = document.createElement('a');
      link.href = `/api/attachments/${String(attId).replace(/^att-/, '')}/download`;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsProcessing(false);
      setActiveAttId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-1 bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 rounded-md border border-purple-200/60 dark:border-purple-800/60">
              {lead.leadCode}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {lead.company.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lead.service || 'TechnoKraft Professional IT Services'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LeadStatusBadge status={lead.status} size="sm" />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Top Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Priority</span>
              <div className="mt-0.5">
                <LeadPriorityBadge priority={lead.priority} size="sm" />
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Lead Score</span>
              <div className="mt-0.5">
                <LeadScoreBadge score={lead.score} size="sm" />
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Lead Source</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                {lead.source || 'Direct Outreach'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Assigned To</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                {lead.assignedEmployee?.name || 'Kunal Patil'}
              </span>
            </div>
          </div>

          {/* Company & Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Info */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <Building2 className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                <span>Company Overview</span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Industry:</span>
                  <span className="font-medium">{lead.company.industry || 'Information Technology'}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Location:</span>
                  <span className="font-medium">
                    {[lead.company.city, lead.company.state, lead.company.country].filter(Boolean).join(', ') || 'India'}
                  </span>
                </p>
                {lead.company.website && (
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Website:</span>
                    <a
                      href={lead.company.website.startsWith('http') ? lead.company.website : `https://${lead.company.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#5B4DB7] dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{lead.company.website}</span>
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Contact Person */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <User className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                <span>Point of Contact</span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{lead.contact.name}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Designation:</span>
                  <span className="font-medium">{lead.contact.designation || 'Key Decision Maker'}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Email:</span>
                  <a href={`mailto:${lead.contact.email}`} className="font-medium text-[#5B4DB7] dark:text-purple-400 hover:underline">
                    {lead.contact.email}
                  </a>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Phone:</span>
                  <a href={`tel:${lead.contact.phone}`} className="font-medium">
                    {lead.contact.phone}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Documents & Attachments Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Uploaded Documents & Attachments
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300">
                {lead.attachments?.length || 0} Files
              </span>
            </div>

            {lead.attachments && lead.attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {lead.attachments.map((att) => {
                  const isCurProcessing = isProcessing && activeAttId === String(att.id);
                  return (
                    <div
                      key={att.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/60 transition-all flex items-center justify-between gap-2 shadow-2xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-800/50">
                          {att.type || 'PDF'}
                        </div>
                        <div className="min-w-0">
                          <p
                            onClick={() => handleViewFile(String(att.id), att.name)}
                            className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs hover:text-[#5B4DB7] dark:hover:text-purple-300 cursor-pointer transition-colors"
                            title={`Preview ${att.name}`}
                          >
                            {att.name}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                            {att.size || 'Document'} {att.uploadedAt ? `• ${att.uploadedAt}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* View inline button */}
                        <button
                          type="button"
                          onClick={() => handleViewFile(String(att.id), att.name)}
                          disabled={isCurProcessing}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-colors cursor-pointer"
                          title="View / Preview Document"
                        >
                          {isCurProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5B4DB7]" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Download button */}
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(String(att.id), att.name)}
                          disabled={isCurProcessing}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-5 text-center text-slate-400 dark:text-slate-500 text-xs">
                No attachments or documents uploaded for this lead record.
              </div>
            )}
          </div>

          {/* Follow-up & Reminders Summary */}
          {lead.nextFollowUp && (
            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Scheduled Follow-up & Reminder</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    {lead.nextFollowUp.displayString || `${lead.nextFollowUp.date} at ${lead.nextFollowUp.time}`}
                  </p>
                </div>
              </div>

              {lead.nextFollowUp.isOverdue && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  Overdue
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenFullLead) onOpenFullLead(lead.id);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Open Full Lead Workspace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
