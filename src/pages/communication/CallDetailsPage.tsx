import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CallRecord } from '../../types/calls';
import { getStoredCalls, saveStoredCalls } from '../../data/mockCalls';
import { MOCK_LEADS } from '../../data/mockLeads';
import { CallStatusBadge } from '../../components/communication/calls/CallStatusBadge';
import { CallResultBadge } from '../../components/communication/calls/CallResultBadge';
import { CallTypeBadge } from '../../components/communication/calls/CallTypeBadge';
import { AddFollowUpModal } from '../../components/communication/calls/AddFollowUpModal';
import { CreateOpportunityModal } from '../../components/communication/calls/CreateOpportunityModal';
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  Clock,
  Calendar,
  CalendarPlus,
  ExternalLink,
  Edit2,
  Sparkles,
  FileText,
  MicOff,
  CheckCircle2,
  Layers,
  IndianRupee,
  MapPin,
  Globe,
} from 'lucide-react';

export const CallDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [call, setCall] = useState<CallRecord | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const loaded = getStoredCalls();
    setCalls(loaded);
    const found = loaded.find((c) => c.id === id || c.callCode === id);
    if (found) {
      setCall(found);
    } else if (loaded.length > 0) {
      setCall(loaded[0]);
    }
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  if (!call) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-700">Call record not found.</p>
        <button
          type="button"
          onClick={() => navigate('/communication/calls')}
          className="px-4 py-2 bg-[#5B4DB7] text-white rounded-lg text-xs font-semibold"
        >
          Back to Calls
        </button>
      </div>
    );
  }

  // Find linked lead
  const relatedLead = MOCK_LEADS.find((l) => l.id === call.leadId || l.leadCode === call.leadCode);

  const handleUpdateFollowUp = (updated: CallRecord) => {
    const updatedList = calls.map((c) => (c.id === updated.id ? updated : c));
    setCalls(updatedList);
    setCall(updated);
    saveStoredCalls(updatedList);
    showToast('Follow-up scheduled successfully!');
  };

  const handleOpportunityCreated = (name: string) => {
    const updated = { ...call, opportunityCreated: true };
    const updatedList = calls.map((c) => (c.id === call.id ? updated : c));
    setCalls(updatedList);
    setCall(updated);
    saveStoredCalls(updatedList);
    showToast(`Opportunity "${name}" created successfully!`);
  };

  const isOpportunityEligible =
    call.result === 'Requirement Received' || call.result === 'Proposal Requested';

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/communication/calls" className="hover:text-[#5B4DB7] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Calls</span>
          </Link>
          <span>/</span>
          <span className="font-mono text-slate-800 font-semibold">{call.callCode}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/communication/calls')}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        >
          ← Back to Call Logs
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {call.callCode}
              </span>
              <CallTypeBadge type={call.type} />
              <CallStatusBadge status={call.status} />
              <CallResultBadge result={call.result} />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#5B4DB7]" />
              <span>{call.companyName}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{call.contactName}</span>
                <span className="text-slate-400">({call.contactDesignation})</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-mono text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{call.contactPhone}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-mono text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {call.date} at {call.time}
                </span>
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors min-h-[44px]"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Add Follow-up</span>
            </button>

            {isOpportunityEligible && !call.opportunityCreated && (
              <button
                type="button"
                onClick={() => setIsOpportunityModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors min-h-[44px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Opportunity</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/leads/${call.leadId}`)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs min-h-[44px]"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span>Open Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Call Specific Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Call Metadata Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5B4DB7]" />
              <span>Call Session Metrics</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 text-[11px] block">Duration</span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {call.duration || '0m 00s'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 text-[11px] block">Call Direction</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {call.type} Call
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 text-[11px] block">Result</span>
                <span className="font-semibold text-slate-900">{call.result || 'Pending'}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 text-[11px] block">Called By</span>
                <span className="font-semibold text-slate-900">{call.employeeName}</span>
              </div>
            </div>

            {/* Recording Placeholder (as requested) */}
            <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MicOff className="w-4 h-4 text-slate-400" />
                <span>
                  Recording: <strong className="text-slate-700">Not Available</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 italic">
                (Telephony compliance mode enabled)
              </span>
            </div>
          </div>

          {/* Call Conversation Notes */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5B4DB7]" />
              <span>Notes & Discussion Summary</span>
            </h3>

            <div className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-xl text-xs text-slate-800 leading-relaxed">
              {call.notes ? (
                <p className="whitespace-pre-line">{call.notes}</p>
              ) : (
                <p className="text-slate-400 italic">No notes logged for this call.</p>
              )}
            </div>
          </div>

          {/* Next Action / Follow-up Section */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-[#5B4DB7]" />
                <span>Next Action & Follow-up</span>
              </h3>

              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(true)}
                className="text-xs text-[#5B4DB7] font-semibold hover:underline"
              >
                {call.nextFollowUp ? 'Reschedule' : '+ Set Follow-up'}
              </button>
            </div>

            {call.nextFollowUp ? (
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {call.nextFollowUp.type} Follow-up
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5B4DB7] text-white">
                      Scheduled
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Due date: <strong className="text-slate-800">{call.nextFollowUp.date}</strong> at{' '}
                    <span className="font-mono">{call.nextFollowUp.time}</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Assigned representative: <strong>{call.nextFollowUp.assignedTo}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-purple-200 text-[#5B4DB7] hover:bg-purple-100/50 rounded-lg font-semibold text-xs transition-colors self-start sm:self-auto"
                >
                  Update Details
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500 space-y-2">
                <p>No immediate follow-up scheduled for this call.</p>
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="px-3 py-1.5 bg-[#5B4DB7] text-white rounded-lg font-semibold text-xs hover:bg-[#4E41A2]"
                >
                  + Add Next Follow-up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Related CRM Lead Details */}
        <div className="space-y-5">
          {relatedLead ? (
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Connected CRM Lead
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{relatedLead.company.name}</h4>
                </div>
                <span className="font-mono text-xs font-bold text-[#5B4DB7] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {relatedLead.leadCode}
                </span>
              </div>

              {/* Lead Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 text-[11px] block">Lead Status</span>
                  <span className="font-bold text-slate-800">{relatedLead.status}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 text-[11px] block">Score</span>
                  <span className="font-bold text-[#5B4DB7]">{relatedLead.score} / 100</span>
                </div>
              </div>

              {/* Contact Snapshot */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold block uppercase tracking-wider">
                  Contact Person
                </span>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="font-bold text-slate-900">{relatedLead.contact.name}</div>
                  <div className="text-slate-500 text-[11px]">{relatedLead.contact.designation}</div>
                  <div className="text-slate-600 font-mono text-[11px] flex items-center gap-1.5 pt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{relatedLead.contact.phone}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{relatedLead.contact.email}</span>
                  </div>
                </div>
              </div>

              {/* Requirement Snippet */}
              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold block uppercase tracking-wider">
                  Requirement & Service
                </span>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">TechnoKraft Service</span>
                    <span className="font-semibold text-slate-800">{relatedLead.service}</span>
                  </div>
                  {relatedLead.requirement.budgetRange && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Budget Range</span>
                      <strong className="text-slate-900">{relatedLead.requirement.budgetRange}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Open Lead Button */}
              <button
                type="button"
                onClick={() => navigate(`/leads/${relatedLead.id}`)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors min-h-[44px]"
              >
                <span>View Full Lead Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-xs text-slate-500">
              <p>Direct lead profile not linked.</p>
            </div>
          )}

          {/* Caller Profile Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Caller Account
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-[#5B4DB7] font-bold text-sm flex items-center justify-center">
                {call.employeeAvatar}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{call.employeeName}</h4>
                <p className="text-[11px] text-slate-500">{call.employeeRole}</p>
                <p className="text-[10px] font-mono text-slate-400">TechnoKraft Services LLP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        call={call}
        onSuccess={handleUpdateFollowUp}
      />

      <CreateOpportunityModal
        isOpen={isOpportunityModalOpen}
        onClose={() => setIsOpportunityModalOpen(false)}
        call={call}
        onSuccess={handleOpportunityCreated}
      />
    </div>
  );
};
