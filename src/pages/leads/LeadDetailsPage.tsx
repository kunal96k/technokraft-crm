import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  CalendarPlus,
  Edit,
  Globe,
  Building2,
  MapPin,
  Linkedin,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  Layers,
  Send,
  Download,
  AlertCircle,
  Loader2,
  Trash2,
  UploadCloud,
  Paperclip,
} from 'lucide-react';
import { LeadStatusBadge } from '../../components/leads/LeadStatusBadge';
import { LeadPriorityBadge } from '../../components/leads/LeadPriorityBadge';
import { LeadScoreBadge } from '../../components/leads/LeadScoreBadge';
import { LeadStageStepper } from '../../components/leads/LeadStageStepper';
import { Lead, LeadStatus, LeadActivity } from '../../types/leads';
import { CallRecord } from '../../types/calls';
import { CallStatusBadge } from '../../components/communication/calls/CallStatusBadge';
import { CallResultBadge } from '../../components/communication/calls/CallResultBadge';
import { CallTypeBadge } from '../../components/communication/calls/CallTypeBadge';
import { LogCallModal } from '../../components/communication/calls/LogCallModal';
import { EmailComposerModal } from '../../components/communication/EmailComposerModal';
import { CreateFollowUpModal } from '../../components/followups/CreateFollowUpModal';
import { ActivityDetailsModal } from '../../components/leads/ActivityDetailsModal';
import { EmailRecord } from '../../types/communication';
import { logCallApi } from '../../services/callService';
import { useToast } from '../../context/ToastContext';
import {
  fetchLeadById,
  updateLeadStatus,
  deleteLead,
  addLeadActivity,
  scheduleLeadFollowUp,
  completeLeadFollowUp,
  deleteLeadFollowUp,
  fetchLeadActivities,
  uploadAttachment,
  deleteAttachment,
} from '../../services/leadService';
import { getInitials, getAvatarColor } from '../../utils/avatarUtils';

export const LeadDetailsPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>('NEW');

  // Server-side paginated activities state (25 timeline logs per page)
  const [paginatedActivities, setPaginatedActivities] = useState<LeadActivity[]>([]);
  const [activityPage, setActivityPage] = useState<number>(0);
  const [activityPageSize, setActivityPageSize] = useState<number>(25);
  const [activityTotalPages, setActivityTotalPages] = useState<number>(1);
  const [activityTotalCount, setActivityTotalCount] = useState<number>(0);
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const [isActivitiesLoading, setIsActivitiesLoading] = useState<boolean>(false);
  const [selectedActivityForModal, setSelectedActivityForModal] = useState<LeadActivity | null>(null);

  // Sub-tabs pagination state (25 records per page)
  const [followUpsPage, setFollowUpsPage] = useState<number>(0);
  const [emailsPage, setEmailsPage] = useState<number>(0);
  const [callsPage, setCallsPage] = useState<number>(0);
  const PAGE_SIZE_25 = 25;

  const loadActivities = async (page = activityPage, filter = activityFilter, size = activityPageSize) => {
    const identifier = lead?.id ? String(lead.id) : leadId;
    if (!identifier) return;
    setIsActivitiesLoading(true);
    try {
      const res = await fetchLeadActivities(identifier, { page, size, type: filter });
      setPaginatedActivities(res.content || []);
      const totalCount = res.totalElements ?? (res.content?.length || 0);
      setActivityTotalCount(totalCount);
      setActivityTotalPages(res.totalPages || Math.max(1, Math.ceil(totalCount / size)));
      setActivityPage(res.number ?? page);
    } catch (err) {
      console.error('Failed to load lead activities:', err);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const reloadLeadData = async (idToLoad = leadId) => {
    if (!idToLoad) return;
    try {
      const data = await fetchLeadById(idToLoad);
      setLead(data);
      if (data) {
        setCurrentStatus(data.status);
        const initialCount = data.activities?.length || 0;
        if (initialCount > 0) {
          setActivityTotalCount(initialCount);
          setActivityTotalPages(Math.max(1, Math.ceil(initialCount / activityPageSize)));
        }
      }
    } catch (err) {
      console.error('Failed to reload lead from database:', err);
    }
  };

  useEffect(() => {
    if (!leadId) return;
    setIsLoading(true);
    reloadLeadData(leadId).finally(() => {
      setIsLoading(false);
    });

    const handleSync = () => {
      reloadLeadData(leadId);
    };

    window.addEventListener('crm-opportunities-updated', handleSync);
    window.addEventListener('crm-proposals-updated', handleSync);
    window.addEventListener('crm-stage-synced', handleSync);

    return () => {
      window.removeEventListener('crm-opportunities-updated', handleSync);
      window.removeEventListener('crm-proposals-updated', handleSync);
      window.removeEventListener('crm-stage-synced', handleSync);
    };
  }, [leadId]);

  useEffect(() => {
    if (leadId) {
      loadActivities(activityPage, activityFilter, activityPageSize);
    }
  }, [leadId, activityPage, activityFilter, activityPageSize]);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'activities' | 'followups' | 'emails' | 'calls' | 'requirements'
  >('overview');

  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isUploadingLeadFile, setIsUploadingLeadFile] = useState(false);
  const leadFileInputRef = React.useRef<HTMLInputElement>(null);

  // Real database calls & emails for this lead
  const allActivities = useMemo(() => lead?.activities || [], [lead?.activities]);

  const leadCalls = useMemo(() => {
    return allActivities.filter((c) => c.activityType?.toUpperCase() === 'CALL');
  }, [allActivities]);

  const leadEmails = useMemo(() => {
    return allActivities.filter((a) => a.activityType?.toUpperCase() === 'EMAIL');
  }, [allActivities]);

  const totalActivityCount = useMemo(() => {
    if (activityTotalCount > 0) return activityTotalCount;
    if (allActivities.length > 0) return allActivities.length;
    return 0;
  }, [activityTotalCount, allActivities]);

  const followUpsCount = lead?.followUps?.length || 0;
  const emailsCount = leadEmails.length;
  const callsCount = leadCalls.length;

  // New Note state in Activity tab
  const [newNote, setNewNote] = useState('');
  const [isLoggingNote, setIsLoggingNote] = useState(false);

  const handleLogNote = async () => {
    if (!newNote.trim() || !lead) return;
    setIsLoggingNote(true);
    try {
      const updated = await addLeadActivity(lead.id, {
        activityType: 'NOTE',
        title: 'Quick Note',
        notes: newNote.trim(),
        employeeName: lead.assignedEmployee?.name || 'CRM User',
      });

      if (updated) {
        setLead(updated);
        loadActivities(0, activityFilter);
        toast.success('Note saved to database timeline', 'Note Added');
        setNewNote('');
        window.dispatchEvent(new Event('crm-leads-updated'));
      } else {
        toast.error('Could not save note to database');
      }
    } catch (err) {
      console.error('Failed to log note:', err);
      toast.error('Error saving note to database');
    } finally {
      setIsLoggingNote(false);
    }
  };

  const handleSendEmail = async (emailData: EmailRecord) => {
    if (!lead) return;
    try {
      const refreshed = await fetchLeadById(String(lead.id));
      if (refreshed) {
        setLead(refreshed);
      }
      loadActivities(0, activityFilter);
    } catch (err) {
      console.error('Failed to reload activities after email send:', err);
    }
    setIsEmailComposerOpen(false);
  };

  const handleCreateFollowUp = async (fu: any) => {
    if (!lead) return;
    try {
      const updated = await scheduleLeadFollowUp(lead.id, {
        date: fu.date,
        time: fu.time,
        type: fu.type,
        assignedTo: fu.assignedTo || lead.assignedEmployee?.name || 'Current User',
        notes: fu.purpose + (fu.notes ? ': ' + fu.notes : ''),
      });
      if (updated) {
        setLead(updated);
        loadActivities(0, activityFilter);
        toast.success(`Follow-up scheduled for ${fu.date} at ${fu.time}`, 'Follow-up Scheduled');
        window.dispatchEvent(new Event('crm-leads-updated'));
      } else {
        toast.error('Could not save follow-up to database');
      }
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
      toast.error('Error scheduling follow-up');
    }
    setIsFollowUpModalOpen(false);
  };

  const handleCompleteFollowUp = async (followUpId: string | number) => {
    if (!lead) return;
    try {
      const updated = await completeLeadFollowUp(lead.id, followUpId);
      if (updated) {
        setLead(updated);
        loadActivities(0, activityFilter);
        toast.success('Follow-up marked as completed & saved to timeline', 'Follow-up Completed');
        window.dispatchEvent(new Event('crm-leads-updated'));
      } else {
        toast.error('Could not complete follow-up in database');
      }
    } catch (err) {
      console.error('Failed to complete follow-up:', err);
      toast.error('Error completing follow-up');
    }
  };

  const handleDeleteFollowUp = async (followUpId: string | number) => {
    if (!lead) return;
    try {
      const updated = await deleteLeadFollowUp(lead.id, followUpId);
      if (updated) {
        setLead(updated);
        loadActivities(0, activityFilter);
        toast.success('Follow-up deleted successfully', 'Follow-up Removed');
        window.dispatchEvent(new Event('crm-leads-updated'));
      } else {
        toast.error('Could not delete follow-up from database');
      }
    } catch (err) {
      console.error('Failed to delete follow-up:', err);
      toast.error('Error deleting follow-up');
    }
  };

  const handleSaveCall = async (newCall: CallRecord) => {
    try {
      await logCallApi(newCall);
    } catch (e) {
      console.error('Failed to save call to backend database:', e);
    }

    if (lead) {
      try {
        const callTypeLabel = newCall.type === 'outbound' ? 'Outbound Call' : newCall.type === 'inbound' ? 'Inbound Call' : 'Missed Call';
        let updatedLead = await addLeadActivity(lead.id, {
          activityType: 'CALL',
          title: `${callTypeLabel} - ${newCall.result}`,
          result: newCall.result,
          notes: newCall.notes || `Call with ${newCall.contactName} (${newCall.contactPhone})`,
          employeeName: newCall.employeeName || lead.assignedEmployee?.name || 'Current User',
          employeeAvatar: newCall.employeeAvatar,
          date: newCall.date,
          time: newCall.time,
        });

        if (newCall.nextAction === 'followup' && newCall.nextFollowUp) {
          const withFollowUp = await scheduleLeadFollowUp(lead.id, {
            date: newCall.nextFollowUp.date,
            time: newCall.nextFollowUp.time,
            type: newCall.nextFollowUp.type,
            assignedTo: newCall.nextFollowUp.assignedTo || lead.assignedEmployee?.name || 'Current User',
            notes: `Follow-up from call (${newCall.result}): ${newCall.notes || ''}`.trim(),
          });
          if (withFollowUp) {
            updatedLead = withFollowUp;
          }
        }

        if (updatedLead) {
          setLead(updatedLead);
          loadActivities(0, activityFilter);
          window.dispatchEvent(new Event('crm-leads-updated'));
        }
      } catch (err) {
        console.error('Failed to log call activity:', err);
      }
    }
    toast.success(`Call record logged for ${lead?.company?.name || 'lead'}`, 'Call Logged');
    setIsLogCallModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading lead details from database...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Lead Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">Could not find a lead matching ID: {leadId}</p>
        <Link
          to="/leads"
          className="mt-4 inline-block px-3.5 py-2 rounded-lg bg-[#5B4DB7] text-white text-xs font-semibold"
        >
          Return to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Leads</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <span>Leads</span>
          <span>/</span>
          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{lead.leadCode}</span>
        </div>
      </div>

      {/* Lead Details Master Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 dark:border-slate-800 pb-5">
          {/* Left: Company & Lead identity */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {lead.leadCode}
              </span>
              <LeadStatusBadge status={currentStatus} />
              <LeadPriorityBadge priority={lead.priority} />
              <LeadScoreBadge score={lead.score} showLabel={true} />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {lead.company?.name || 'Unnamed Lead'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {lead.company?.website && (
                <a
                  href={`https://${lead.company.website.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#5B4DB7] dark:hover:text-purple-400"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{lead.company.website}</span>
                </a>
              )}
              {lead.company?.industry && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{lead.company.industry}</span>
                  </span>
                </>
              )}
              {(lead.company?.city || lead.company?.state || lead.company?.country) && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>
                      {[lead.company?.city, lead.company?.state, lead.company?.country].filter(Boolean).join(', ')}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Assigned & Fast Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 lg:pt-0">
            {/* Lead Owner Pill */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              {(() => {
                const empName = lead.assignedEmployee?.name || 'Unassigned';
                const initials = getInitials(empName, lead.assignedEmployee?.avatar);
                const colors = getAvatarColor(empName);
                return (
                  <div
                    className={`w-8 h-8 rounded-full ${colors.bg} ${colors.text} ${colors.border} border text-xs font-bold flex items-center justify-center shadow-2xs`}
                  >
                    {initials}
                  </div>
                );
              })()}
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 leading-none">
                  Lead Owner
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight mt-0.5">
                  {lead.assignedEmployee?.name || 'Unassigned'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{lead.assignedEmployee?.role || 'Sales Executive'}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsLogCallModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Call</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEmailComposerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100/80 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100/80 dark:hover:bg-purple-900/60 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Follow-up</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/leads/add?edit=${lead.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lead Ownership Quick Bar */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Created By:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate" title={lead.createdBy?.name || 'System Admin'}>
              {lead.createdBy?.name || 'System Admin'}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono block truncate">
              {lead.createdBy?.timestamp || lead.createdAt || lead.createdBy?.date || ''}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Last Updated By:</span>
            <span className="font-semibold text-purple-700 dark:text-purple-300 block truncate" title={lead.updatedBy?.name || lead.createdBy?.name || 'Admin'}>
              {lead.updatedBy?.name || lead.createdBy?.name || 'Admin'}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono block truncate">
              {lead.updatedBy?.timestamp || lead.updatedAt || lead.updatedBy?.date || ''}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Assigned BA:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
              {lead.assignedBA ? lead.assignedBA.name : 'Unassigned'}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block truncate">
              {lead.assignedBA ? lead.assignedBA.role : 'Pending'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Primary Service:</span>
            <span className="font-semibold text-[#5B4DB7] dark:text-purple-400 block truncate">{lead.service}</span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block truncate">Source: {lead.source}</span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Next Follow-up:</span>
            <span
              className={`font-semibold block truncate ${
                lead.nextFollowUp?.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {lead.nextFollowUp ? lead.nextFollowUp.displayString : 'Not Scheduled'}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block">
              {lead.nextFollowUp?.isOverdue ? 'Action Needed' : 'Upcoming'}
            </span>
          </div>
        </div>
      </div>

      {/* Lifecycle Stage Indicator */}
      <LeadStageStepper
        currentStatus={currentStatus}
        onSelectStage={async (newSt) => {
          if (!lead) return;
          try {
            const updated = await updateLeadStatus(lead.id, newSt, `Stage updated to ${newSt}`);
            if (updated) {
              setLead(updated);
              setCurrentStatus(updated.status);
              toast.stage(newSt, `${lead.leadCode} (${lead.company?.name || 'Lead'})`);
              window.dispatchEvent(new Event('crm-leads-updated'));
              window.dispatchEvent(new Event('crm-opportunities-updated'));
              window.dispatchEvent(new Event('crm-proposals-updated'));
              window.dispatchEvent(new Event('crm-stage-synced'));
            } else {
              toast.error(`Failed to update stage to ${newSt}`);
            }
          } catch (err) {
            console.error('Error updating stage:', err);
            toast.error('Error updating stage');
          }
        }}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'activities', label: `Activity Timeline (${totalActivityCount})` },
          { id: 'followups', label: `Follow-ups (${followUpsCount})` },
          { id: 'emails', label: `Email History (${emailsCount})` },
          { id: 'calls', label: `Calls (${callsCount})` },
          { id: 'requirements', label: 'Requirements & Scope' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#5B4DB7] dark:border-purple-400 text-[#5B4DB7] dark:text-purple-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Company Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <span>Company Information</span>
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">B2B Profile</span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Company Name</dt>
                <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{lead.company?.name || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Website</dt>
                <dd className="font-medium text-[#5B4DB7] dark:text-purple-400 mt-0.5">{lead.company?.website || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Industry</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.company?.industry || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Company Size</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.company?.companySize || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Location</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {[lead.company?.city, lead.company?.state, lead.company?.country].filter(Boolean).join(', ') || 'N/A'}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">LinkedIn</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="truncate">{lead.company?.linkedIn || 'N/A'}</span>
                </dd>
              </div>
            </dl>

            {lead.company?.description && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-1">Company Description:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {lead.company.description}
                </p>
              </div>
            )}
          </div>

          {/* Card 2: Contact Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <span>Contact Person Information</span>
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Primary Stakeholder</span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Contact Person</dt>
                <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{lead.contact?.name || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Designation</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.contact?.designation || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Email Address</dt>
                <dd className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.contact?.email || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Primary Phone</dt>
                <dd className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.contact?.phone || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Alternate Phone</dt>
                <dd className="font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                  {lead.contact?.alternatePhone || 'None'}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Preferred Channel</dt>
                <dd className="font-medium text-[#5B4DB7] dark:text-purple-400 mt-0.5">
                  {lead.contact?.preferredChannel || 'Any'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Card 3: Qualification & Lead Scoring */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <span>Qualification & Scoring</span>
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">AI Readiness</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Lead Health Score:</span>
                <LeadScoreBadge score={lead.score} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sales Priority:</span>
                <LeadPriorityBadge priority={lead.priority} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Lifecycle Status:</span>
                <LeadStatusBadge status={lead.status} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Lead Source Channel:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.source}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Service & Commercial Scope */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <span>Service & Commercial Scope</span>
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Commercials</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">Primary Service Requested</span>
                <p className="font-bold text-[#5B4DB7] dark:text-purple-400 text-sm mt-0.5">{lead.service}</p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">Requirement Summary</span>
                <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 bg-slate-50 dark:bg-slate-950/60 p-2 rounded border border-slate-100 dark:border-slate-800">
                  {lead.requirement?.summary || 'No summary specified.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">Budget Range</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{lead.requirement?.budgetRange || 'Flexible'}</p>
                </div>

                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">Target Timeline</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{lead.requirement?.expectedTimeline || 'TBD'}</p>
                </div>

                {lead.requirement?.numberOfUsers && (
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">Target User Base</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{lead.requirement.numberOfUsers}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Lead Ownership & Complete Audit Trail */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <span>Lead Ownership & Audit Trail</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Security & Tracking</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {/* Created By Block */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">Created By</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{lead.createdBy?.name || 'System Admin'}</p>
                {lead.createdBy?.role && (
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">{lead.createdBy.role}</p>
                )}
                {lead.createdBy?.email && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{lead.createdBy.email}</p>
                )}
                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Timestamp: </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {lead.createdBy?.timestamp || lead.createdAt || lead.createdBy?.date || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Updated By Block */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">Last Modified By</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{lead.updatedBy?.name || lead.createdBy?.name || 'Admin'}</p>
                {lead.updatedBy?.role && (
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">{lead.updatedBy.role}</p>
                )}
                {lead.updatedBy?.email && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{lead.updatedBy.email}</p>
                )}
                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Timestamp: </span>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">
                    {lead.updatedBy?.timestamp || lead.updatedAt || lead.updatedBy?.date || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Assigned Sales Employee */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">Assigned Sales Executive</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{lead.assignedEmployee?.name || 'Unassigned'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{lead.assignedEmployee?.role || 'Sales Executive'}</p>
                {lead.assignedEmployee?.email && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{lead.assignedEmployee.email}</p>
                )}
              </div>

              {/* Assigned BA */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">Assigned Business Analyst</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{lead.assignedBA?.name || 'Unassigned'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{lead.assignedBA?.role || 'Pending Assignment'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVITY TIMELINE */}
      {activeTab === 'activities' && (() => {
        const effectiveTotalCount = activityTotalCount > 0
          ? activityTotalCount
          : (allActivities.length > 0
              ? (activityFilter === 'ALL'
                  ? allActivities.length
                  : allActivities.filter((a) => a.activityType?.toUpperCase() === activityFilter.toUpperCase()).length)
              : 0);

        const effectiveTotalPages = Math.max(1, Math.ceil(effectiveTotalCount / activityPageSize));

        const displayActivities = paginatedActivities.length > 0
          ? paginatedActivities
          : (allActivities.length > 0
              ? (() => {
                  let filtered = allActivities;
                  if (activityFilter !== 'ALL') {
                    filtered = filtered.filter((a) => a.activityType?.toUpperCase() === activityFilter.toUpperCase());
                  }
                  const start = activityPage * activityPageSize;
                  return filtered.slice(start, start + activityPageSize);
                })()
              : []);

        return (
          <div className="space-y-4">
            {/* Add Activity Quick Note Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Log Quick Note / Call Outcome</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLogNote();
                    }
                  }}
                  disabled={isLoggingNote}
                  placeholder="e.g. Spoke with client. Will send revised proposal tomorrow morning..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={isLoggingNote || !newNote.trim()}
                  onClick={handleLogNote}
                  className="px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isLoggingNote ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Log Note</span>
                </button>
              </div>
            </div>

            {/* Timeline Feed Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Clock className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Chronological Activity Timeline
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                    {effectiveTotalCount} Records
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {activityPageSize} / page
                  </span>
                </div>

                {/* Activity Type Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'CALL', label: 'Calls' },
                    { id: 'EMAIL', label: 'Emails' },
                    { id: 'NOTE', label: 'Notes' },
                    { id: 'STATUS_CHANGE', label: 'Stage Changes' },
                    { id: 'FOLLOWUP', label: 'Follow-ups' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setActivityFilter(f.id);
                        setActivityPage(0);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        activityFilter === f.id
                          ? 'bg-[#5B4DB7] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {isActivitiesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5B4DB7]" />
                  <span>Loading activities from database...</span>
                </div>
              ) : displayActivities.length > 0 ? (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {displayActivities.map((act) => {
                    let badgeColor = 'bg-blue-500';
                    if (act.activityType === 'CALL') badgeColor = 'bg-emerald-500';
                    if (act.activityType === 'EMAIL') badgeColor = 'bg-sky-500';
                    if (act.activityType === 'STATUS_CHANGE') badgeColor = 'bg-purple-600';
                    if (act.activityType === 'NOTE') badgeColor = 'bg-amber-500';
                    if (act.activityType === 'FOLLOWUP') badgeColor = 'bg-pink-500';

                    return (
                      <div
                        key={act.id}
                        onClick={() => setSelectedActivityForModal(act)}
                        className="relative cursor-pointer group"
                      >
                        {/* Timeline Node Dot */}
                        <div
                          className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-xs group-hover:scale-110 transition-transform ${badgeColor}`}
                        />

                        <div className="bg-slate-50 dark:bg-slate-950/60 group-hover:bg-purple-50/50 dark:group-hover:bg-purple-950/30 group-hover:border-purple-300 dark:group-hover:border-purple-700/60 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs space-y-2 transition-all shadow-2xs hover:shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#5B4DB7] dark:group-hover:text-purple-300 transition-colors">
                                {act.title}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {act.activityType}
                              </span>
                              {act.result && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100/70 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                                  {act.result}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              {act.date} • {act.time}
                            </span>
                          </div>

                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-3">
                            {act.notes || 'No detailed conversation notes logged.'}
                          </p>

                          <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                            <span>
                              Logged by: <strong className="text-slate-700 dark:text-slate-200">{act.employeeName || 'CRM User'}</strong>
                            </span>
                            <span className="text-[#5B4DB7] dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-1">
                              <span>View Full Note & Details</span>
                              <span>→</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No activities recorded in database for filter: <strong className="text-slate-600 dark:text-slate-300">{activityFilter}</strong>
                </div>
              )}

              {/* Server-side Pagination Bar (25 timeline logs per page) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 flex-wrap">
                  <span>
                    Showing{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {effectiveTotalCount === 0 ? 0 : activityPage * activityPageSize + 1}
                    </strong>
                    {' - '}
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {Math.min(effectiveTotalCount, (activityPage + 1) * activityPageSize)}
                    </strong>
                    {' of '}
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {effectiveTotalCount}
                    </strong>{' '}
                    logs
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">Per page:</span>
                    <select
                      value={activityPageSize}
                      onChange={(e) => {
                        const newSize = Number(e.target.value);
                        setActivityPageSize(newSize);
                        setActivityPage(0);
                      }}
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
                    >
                      <option value={25}>25 logs</option>
                      <option value={50}>50 logs</option>
                      <option value={100}>100 logs</option>
                    </select>
                  </div>
                </div>

                {effectiveTotalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={activityPage === 0 || isActivitiesLoading}
                      onClick={() => setActivityPage((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      ← Previous
                    </button>

                    {Array.from({ length: effectiveTotalPages }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={isActivitiesLoading}
                        onClick={() => setActivityPage(i)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          activityPage === i
                            ? 'bg-[#5B4DB7] text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={activityPage >= effectiveTotalPages - 1 || isActivitiesLoading}
                      onClick={() => setActivityPage((prev) => Math.min(effectiveTotalPages - 1, prev + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 3: FOLLOW-UPS */}
      {activeTab === 'followups' && (() => {
        const followUpsList = lead.followUps || [];
        const followUpsTotalPages = Math.max(1, Math.ceil(followUpsList.length / PAGE_SIZE_25));
        const paginatedFollowUps = followUpsList.slice(
          followUpsPage * PAGE_SIZE_25,
          (followUpsPage + 1) * PAGE_SIZE_25
        );

        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Scheduled Follow-ups & Reminders
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                  {followUpsList.length} Records
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Schedule Follow-up</span>
              </button>
            </div>

            {paginatedFollowUps.length > 0 ? (
              <div className="space-y-3">
                {paginatedFollowUps.map((fup) => (
                  <div
                    key={fup.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 font-bold text-[10px] uppercase">
                          {fup.type}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {fup.date} at {fup.time}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {fup.status}
                        </span>
                      </div>
                      {fup.notes && <p className="text-slate-600 dark:text-slate-300 text-xs">{fup.notes}</p>}
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                        Assigned to: {fup.assignedTo}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {fup.status?.toLowerCase() === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCompleteFollowUp(fup.id)}
                          className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-300 dark:border-slate-700 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Mark Complete</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteFollowUp(fup.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete follow-up"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <p>No follow-ups currently scheduled for this lead.</p>
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Schedule First Follow-up</span>
                </button>
              </div>
            )}

            {/* Pagination for follow-ups */}
            {followUpsList.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {followUpsList.length === 0 ? 0 : followUpsPage * PAGE_SIZE_25 + 1}
                  </strong>
                  {' - '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {Math.min(followUpsList.length, (followUpsPage + 1) * PAGE_SIZE_25)}
                  </strong>
                  {' of '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {followUpsList.length}
                  </strong>{' '}
                  follow-ups
                </span>

                {followUpsTotalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={followUpsPage === 0}
                      onClick={() => setFollowUpsPage((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: followUpsTotalPages }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFollowUpsPage(i)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          followUpsPage === i
                            ? 'bg-[#5B4DB7] text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={followUpsPage >= followUpsTotalPages - 1}
                      onClick={() => setFollowUpsPage((prev) => Math.min(followUpsTotalPages - 1, prev + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 4: EMAILS */}
      {activeTab === 'emails' && (() => {
        const emailsTotalPages = Math.max(1, Math.ceil(leadEmails.length / PAGE_SIZE_25));
        const paginatedEmails = leadEmails.slice(
          emailsPage * PAGE_SIZE_25,
          (emailsPage + 1) * PAGE_SIZE_25
        );

        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Email Communication Thread
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                  {leadEmails.length} Records
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailComposerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send New Email</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {paginatedEmails.length > 0 ? (
                paginatedEmails.map((em) => (
                  <div
                    key={em.id}
                    onClick={() => setSelectedActivityForModal(em)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors space-y-2 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-white group-hover:text-[#5B4DB7] dark:group-hover:text-purple-300 transition-colors">
                        {em.title}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                        {em.date} • {em.time}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3">{em.notes}</p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>Logged by: <strong className="text-slate-600 dark:text-slate-300">{em.employeeName}</strong></span>
                      <span className="text-[#5B4DB7] dark:text-purple-400 font-medium group-hover:underline">View details →</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                  <p>No email messages dispatched to {lead.contact?.email || 'this contact'} yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsEmailComposerOpen(true)}
                    className="px-3.5 py-1.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Compose First Email</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pagination for emails */}
            {leadEmails.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {leadEmails.length === 0 ? 0 : emailsPage * PAGE_SIZE_25 + 1}
                  </strong>
                  {' - '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {Math.min(leadEmails.length, (emailsPage + 1) * PAGE_SIZE_25)}
                  </strong>
                  {' of '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {leadEmails.length}
                  </strong>{' '}
                  emails
                </span>

                {emailsTotalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={emailsPage === 0}
                      onClick={() => setEmailsPage((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: emailsTotalPages }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEmailsPage(i)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          emailsPage === i
                            ? 'bg-[#5B4DB7] text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={emailsPage >= emailsTotalPages - 1}
                      onClick={() => setEmailsPage((prev) => Math.min(emailsTotalPages - 1, prev + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 5: CALLS */}
      {activeTab === 'calls' && (() => {
        const callsTotalPages = Math.max(1, Math.ceil(leadCalls.length / PAGE_SIZE_25));
        const paginatedCalls = leadCalls.slice(
          callsPage * PAGE_SIZE_25,
          (callsPage + 1) * PAGE_SIZE_25
        );

        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Lead Call History & Logs
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                  {leadCalls.length} Records
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLogCallModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Log Call</span>
              </button>
            </div>

            {paginatedCalls.length > 0 ? (
              <div className="space-y-3">
                {paginatedCalls.map((call) => (
                  <div
                    key={call.id}
                    onClick={() => setSelectedActivityForModal(call)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white font-mono">
                          {call.date} • {call.time}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          CALL
                        </span>
                        {call.result && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100/70 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                            {call.result}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2">
                        {call.notes || 'No detailed conversation notes logged.'}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>
                          Called by: <strong className="text-slate-700 dark:text-slate-300">{call.employeeName}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedActivityForModal(call);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 group-hover:border-[#5B4DB7] dark:group-hover:border-purple-400 group-hover:text-[#5B4DB7] dark:group-hover:text-purple-300 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <p>No call logs recorded for this lead yet.</p>
                <button
                  type="button"
                  onClick={() => setIsLogCallModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#5B4DB7] dark:bg-purple-600 text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Log First Call</span>
                </button>
              </div>
            )}

            {/* Pagination for calls */}
            {leadCalls.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {leadCalls.length === 0 ? 0 : callsPage * PAGE_SIZE_25 + 1}
                  </strong>
                  {' - '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {Math.min(leadCalls.length, (callsPage + 1) * PAGE_SIZE_25)}
                  </strong>
                  {' of '}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {leadCalls.length}
                  </strong>{' '}
                  calls
                </span>

                {callsTotalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={callsPage === 0}
                      onClick={() => setCallsPage((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: callsTotalPages }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCallsPage(i)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          callsPage === i
                            ? 'bg-[#5B4DB7] text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={callsPage >= callsTotalPages - 1}
                      onClick={() => setCallsPage((prev) => Math.min(callsTotalPages - 1, prev + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 6: REQUIREMENTS & ATTACHMENTS */}
      {activeTab === 'requirements' && (
        <div className="space-y-5">
          {/* Detailed Requirement Spec Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <span>Business Requirement Specification</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 font-semibold text-xs border border-purple-200/60 dark:border-purple-800/60">
                {lead.service}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block font-medium">Requirement Summary:</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 font-medium">
                  {lead.requirement?.summary || 'Requirement details pending discussion.'}
                </p>
              </div>

              {lead.requirement?.problemStatement && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block font-medium">Problem Statement:</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/60 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {lead.requirement.problemStatement}
                  </p>
                </div>
              )}

              {lead.requirement?.additionalNotes && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block font-medium">Additional Notes & Scope Remarks:</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/60 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    {lead.requirement.additionalNotes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Budget</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{lead.requirement?.budgetRange || 'Flexible'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Timeline</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{lead.requirement?.expectedTimeline || 'To be determined'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">User Base</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">{lead.requirement?.numberOfUsers || 'Not specified'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Tech Stack</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] truncate block">{lead.requirement?.currentTech || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attached Documents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <span>Attached Documents & RFP Specifications</span>
              </h3>

              <div className="flex items-center gap-2">
                <input
                  ref={leadFileInputRef}
                  type="file"
                  multiple
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setIsUploadingLeadFile(true);
                      try {
                        for (let i = 0; i < e.target.files.length; i++) {
                          const file = e.target.files[i];
                          const res = await uploadAttachment(file, String(lead.id));
                          if (res.success) {
                            toast.success(`Uploaded "${file.name}" to project storage & database.`, 'Document Saved');
                          } else {
                            toast.error(`Could not upload "${file.name}"`);
                          }
                        }
                        if (leadId) reloadLeadData(leadId);
                      } catch {
                        toast.error('Upload failed');
                      } finally {
                        setIsUploadingLeadFile(false);
                        e.target.value = '';
                      }
                    }
                  }}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.csv,.txt"
                />

                <button
                  type="button"
                  disabled={isUploadingLeadFile}
                  onClick={() => leadFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isUploadingLeadFile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lead.attachments && lead.attachments.length > 0 ? (
                lead.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 font-bold text-[10px] flex items-center justify-center">
                        {att.type}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                          {att.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {att.size} • {att.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={att.downloadUrl || `/api/attachments/${String(att.id).replace(/^att-/, '')}/download`}
                        download={att.name}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`Delete attachment ${att.name}?`)) {
                            const ok = await deleteAttachment(att.id);
                            if (ok) {
                              toast.success(`Removed attachment ${att.name}`);
                              if (leadId) reloadLeadData(leadId);
                            } else {
                              toast.error(`Failed to delete ${att.name}`);
                            }
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No attachments uploaded for this lead yet. Click "Upload Document" above to attach RFP or client briefs.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Log Call Modal */}
      <LogCallModal
        isOpen={isLogCallModalOpen}
        onClose={() => setIsLogCallModalOpen(false)}
        initialLead={lead}
        onSaveCall={handleSaveCall}
      />

      {/* Email Composer Modal */}
      <EmailComposerModal
        isOpen={isEmailComposerOpen}
        onClose={() => setIsEmailComposerOpen(false)}
        onSendEmail={handleSendEmail}
        initialLead={lead}
        defaultLeadId={lead.id}
        defaultRecipientEmail={lead.contact?.email || ''}
        defaultSubject={`TechnoKraft Services - Requirement Discussion for ${lead.company?.name || 'your team'}`}
      />

      {/* Create Follow-Up Modal */}
      <CreateFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSubmit={handleCreateFollowUp}
        preselectedLeadId={lead.id}
      />

      {/* Activity / Call Details View Modal */}
      <ActivityDetailsModal
        isOpen={!!selectedActivityForModal}
        onClose={() => setSelectedActivityForModal(null)}
        activity={selectedActivityForModal}
        lead={lead}
        onLogCall={() => setIsLogCallModalOpen(true)}
        onLogFollowUp={() => setIsFollowUpModalOpen(true)}
        onSendEmail={() => setIsEmailComposerOpen(true)}
      />
    </div>
  );
};
