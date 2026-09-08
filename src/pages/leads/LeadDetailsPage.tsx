import React, { useState } from 'react';
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
} from 'lucide-react';
import { MOCK_LEADS } from '../../data/mockLeads';
import { LeadStatusBadge } from '../../components/leads/LeadStatusBadge';
import { LeadPriorityBadge } from '../../components/leads/LeadPriorityBadge';
import { LeadScoreBadge } from '../../components/leads/LeadScoreBadge';
import { LeadStageStepper } from '../../components/leads/LeadStageStepper';
import { LeadStatus } from '../../types/leads';
import { CallRecord } from '../../types/calls';
import { getStoredCalls, saveStoredCalls } from '../../data/mockCalls';
import { CallStatusBadge } from '../../components/communication/calls/CallStatusBadge';
import { CallResultBadge } from '../../components/communication/calls/CallResultBadge';
import { CallTypeBadge } from '../../components/communication/calls/CallTypeBadge';
import { LogCallModal } from '../../components/communication/calls/LogCallModal';

export const LeadDetailsPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();

  // Find lead by id or leadCode, fallback to first lead
  const lead = MOCK_LEADS.find((l) => l.id === leadId || l.leadCode === leadId) || MOCK_LEADS[0];

  const [activeTab, setActiveTab] = useState<
    'overview' | 'activities' | 'followups' | 'emails' | 'calls' | 'requirements'
  >('overview');
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Stored calls for this lead
  const [callsList, setCallsList] = useState<CallRecord[]>(() => getStoredCalls());
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);

  // Filter calls for this lead
  const leadCalls = callsList.filter(
    (c) => c.leadId === lead.id || c.leadCode === lead.leadCode
  );

  // New Note state in Activity tab
  const [newNote, setNewNote] = useState('');

  const triggerNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

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

      {/* Simulated Feedback Notice */}
      {feedbackNotice && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[#5B4DB7] dark:text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackNotice}</span>
        </div>
      )}

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
              {lead.company.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {lead.company.website && (
                <a
                  href={`https://${lead.company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#5B4DB7] dark:hover:text-purple-400"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{lead.company.website}</span>
                </a>
              )}
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{lead.company.industry}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>
                  {lead.company.city}, {lead.company.state}
                </span>
              </span>
            </div>
          </div>

          {/* Right: Assigned & Fast Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 lg:pt-0">
            {/* Lead Owner Pill */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 text-xs font-bold flex items-center justify-center">
                {lead.assignedEmployee.avatar}
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 leading-none">
                  Lead Owner
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight mt-0.5">
                  {lead.assignedEmployee.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{lead.assignedEmployee.role}</p>
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
                onClick={() => triggerNotice(`Opening email thread to ${lead.contact.email}`)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100/80 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => triggerNotice(`Scheduling follow-up for ${lead.company.name}`)}
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
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Created By:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.createdBy.name}</span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block">{lead.createdBy.date}</span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Assigned BA:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {lead.assignedBA ? lead.assignedBA.name : 'Unassigned'}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block">
              {lead.assignedBA ? lead.assignedBA.role : 'Pending'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Primary Service:</span>
            <span className="font-semibold text-[#5B4DB7] dark:text-purple-400">{lead.service}</span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Source: {lead.source}</span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Next Follow-up:</span>
            <span
              className={`font-semibold ${
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
        onSelectStage={(newSt) => {
          setCurrentStatus(newSt);
          triggerNotice(`Lead stage updated to ${newSt}`);
        }}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-0.5">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'activities', label: `Activity Timeline (${lead.activities.length})` },
          { id: 'followups', label: `Follow-ups (${lead.followUps.length})` },
          { id: 'emails', label: 'Email History' },
          { id: 'calls', label: `Calls (${leadCalls.length})` },
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
                <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{lead.company.name}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Website</dt>
                <dd className="font-medium text-[#5B4DB7] dark:text-purple-400 mt-0.5">{lead.company.website}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Industry</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.company.industry}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Company Size</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.company.companySize}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Location</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {lead.company.city}, {lead.company.state}, {lead.company.country}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">LinkedIn</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="truncate">{lead.company.linkedIn || 'N/A'}</span>
                </dd>
              </div>
            </dl>

            {lead.company.description && (
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
                <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">{lead.contact.name}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Designation</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.contact.designation}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Email Address</dt>
                <dd className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.contact.email}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Primary Phone</dt>
                <dd className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{lead.contact.phone}</dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Alternate Phone</dt>
                <dd className="font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                  {lead.contact.alternatePhone || 'None'}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 dark:text-slate-500 text-[11px]">Contact LinkedIn</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="truncate">{lead.contact.linkedIn || 'N/A'}</span>
                </dd>
              </div>
            </dl>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerNotice(`Calling ${lead.contact.name}`)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-[#5B4DB7] dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Call Directly</span>
              </button>
              <button
                type="button"
                onClick={() => triggerNotice(`Email drafted to ${lead.contact.email}`)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-[#5B4DB7] dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Send Email</span>
              </button>
            </div>
          </div>

          {/* Card 3: Business Requirement & Scope */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <span>Business Requirement Summary</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 font-semibold text-xs">
                {lead.service}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Project Requirement:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    {lead.requirement.summary}
                  </p>
                </div>

                {lead.requirement.problemStatement && (
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Current Problem Statement:</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-xs leading-relaxed bg-slate-50/60 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      {lead.requirement.problemStatement}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">Budget Range</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{lead.requirement.budgetRange}</p>
                </div>

                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">Expected Timeline</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{lead.requirement.expectedTimeline}</p>
                </div>

                {lead.requirement.numberOfUsers && (
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">Target User Base</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{lead.requirement.numberOfUsers}</p>
                  </div>
                )}

                {lead.requirement.currentTech && (
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">Current Tech Stack</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{lead.requirement.currentTech}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVITY TIMELINE */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          {/* Add Activity Quick Note Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Log Quick Note / Call Outcome</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g. Spoke with Nikita Patil. Will send revised NDA tomorrow morning..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (newNote.trim()) {
                    triggerNotice('Activity note added to timeline');
                    setNewNote('');
                  }
                }}
                className="px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log Note</span>
              </button>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
              <span>Chronological Activity History</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {lead.activities.map((act) => {
                let badgeColor = 'bg-blue-500';
                if (act.activityType === 'CALL') badgeColor = 'bg-emerald-500';
                if (act.activityType === 'EMAIL') badgeColor = 'bg-sky-500';
                if (act.activityType === 'STATUS_CHANGE') badgeColor = 'bg-purple-600';

                return (
                  <div key={act.id} className="relative">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${badgeColor}`}
                    />

                    <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{act.title}</span>
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

                      <p className="text-slate-700 dark:text-slate-300 mt-1">{act.notes}</p>

                      <div className="pt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        Logged by: <strong className="text-slate-600 dark:text-slate-300">{act.employeeName}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
              <span>Scheduled Follow-ups & Reminders</span>
            </h3>
            <button
              type="button"
              onClick={() => triggerNotice('Schedule follow-up dialog opened')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>+ Schedule Follow-up</span>
            </button>
          </div>

          {lead.followUps.length > 0 ? (
            <div className="space-y-3">
              {lead.followUps.map((fup) => (
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
                    <button
                      type="button"
                      onClick={() => triggerNotice(`Marked follow-up as completed`)}
                      className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-300 dark:border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No follow-ups currently scheduled for this lead.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EMAILS */}
      {activeTab === 'emails' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
              <span>Email Communication Thread</span>
            </h3>
            <button
              type="button"
              onClick={() => triggerNotice(`Drafting new email to ${lead.contact.email}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send New Email</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-white">
                  Re: Custom Software Architecture & TechnoKraft Case Studies
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">Today, 02:30 PM</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Dear {lead.contact.name}, Thank you for your time on our discovery call today. Attached is the preliminary architecture overview and similar cloud orchestration case studies delivered by TechnoKraft Services.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500">
                From: kunal.patil@technokraft.com → To: {lead.contact.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CALLS */}
      {activeTab === 'calls' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
              <span>Lead Call History & Logs</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsLogCallModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] dark:bg-purple-600 dark:hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+ Log Call</span>
            </button>
          </div>

          {leadCalls.length > 0 ? (
            <div className="space-y-3">
              {leadCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">
                        {call.date} • {call.time}
                      </span>
                      <CallTypeBadge type={call.type} />
                      {call.duration && call.duration !== '0m 00s' && (
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {call.duration}
                        </span>
                      )}
                      <CallResultBadge result={call.result} />
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      {call.notes || 'No detailed conversation notes logged.'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>
                        Called by: <strong className="text-slate-700 dark:text-slate-300">{call.employeeName}</strong>
                      </span>
                      {call.nextFollowUp && (
                        <span className="text-[#5B4DB7] dark:text-purple-400 font-medium">
                          Next Follow-up: {call.nextFollowUp.date} at {call.nextFollowUp.time}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/communication/calls/${call.id}`)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#5B4DB7] dark:hover:border-purple-400 hover:text-[#5B4DB7] dark:hover:text-purple-300 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
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
        </div>
      )}

      {/* TAB 6: REQUIREMENTS & ATTACHMENTS */}
      {activeTab === 'requirements' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
            <span>Attached Documents & RFP Specifications</span>
          </h3>

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

                  <button
                    type="button"
                    onClick={() => triggerNotice(`Downloading ${att.name}`)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No attachments uploaded for this lead yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log Call Modal */}
      <LogCallModal
        isOpen={isLogCallModalOpen}
        onClose={() => setIsLogCallModalOpen(false)}
        initialLead={lead}
        onSaveCall={(newCall) => {
          const updated = [newCall, ...callsList];
          setCallsList(updated);
          saveStoredCalls(updated);
          triggerNotice(`Call record logged for ${lead.company.name}`);
        }}
      />
    </div>
  );
};
