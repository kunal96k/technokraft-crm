import React, { useState, useEffect } from 'react';
import { CallRecord, CallType, CallResult, NextActionType } from '../../../types/calls';
import { MOCK_LEADS } from '../../../data/mockLeads';
import { Lead } from '../../../types/leads';
import {
  X,
  Search,
  Phone,
  Building2,
  Calendar,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  Send,
  CalendarPlus,
  Mail,
  ChevronDown,
} from 'lucide-react';

interface LogCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCall: (call: CallRecord) => void;
  initialLead?: Lead | null;
  onTriggerOpportunityModal?: (lead: Lead, callData: Partial<CallRecord>) => void;
}

export const LogCallModal: React.FC<LogCallModalProps> = ({
  isOpen,
  onClose,
  onSaveCall,
  initialLead,
  onTriggerOpportunityModal,
}) => {
  // Lead selection
  const [leadSearch, setLeadSearch] = useState('');
  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(initialLead || null);

  // Form fields
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [callType, setCallType] = useState<CallType>('outbound');
  const [date, setDate] = useState('2026-09-07');
  const [time, setTime] = useState('11:30 AM');
  const [durationMinutes, setDurationMinutes] = useState('12');
  const [durationSeconds, setDurationSeconds] = useState('34');
  const [result, setResult] = useState<CallResult>('Interested');
  const [notes, setNotes] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState('Kunal Patil');

  // Next action
  const [nextAction, setNextAction] = useState<NextActionType>('none');
  const [followUpDate, setFollowUpDate] = useState('2026-09-09');
  const [followUpTime, setFollowUpTime] = useState('11:00 AM');
  const [followUpType, setFollowUpType] = useState<'Call' | 'Email' | 'Meeting' | 'Demo' | 'Document'>('Email');
  const [followUpAssignedTo, setFollowUpAssignedTo] = useState('Kunal Patil');

  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  // Populate from initialLead or MOCK_LEADS default
  useEffect(() => {
    if (initialLead) {
      applyLead(initialLead);
    } else if (!selectedLead && MOCK_LEADS.length > 0) {
      applyLead(MOCK_LEADS[0]);
    }
  }, [initialLead]);

  const applyLead = (lead: Lead) => {
    setSelectedLead(lead);
    setContactName(lead.contact.name);
    setContactPhone(lead.contact.phone);
    setContactDesignation(lead.contact.designation);
    setAssignedEmployee(lead.assignedEmployee.name);
    setFollowUpAssignedTo(lead.assignedEmployee.name);
    setIsLeadDropdownOpen(false);
    setLeadSearch('');
  };

  if (!isOpen) return null;

  const filteredLeads = MOCK_LEADS.filter(
    (l) =>
      l.company.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.leadCode.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.contact.name.toLowerCase().includes(leadSearch.toLowerCase())
  );

  const isOpportunityEligible =
    result === 'Requirement Received' || result === 'Proposal Requested';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) {
      setErrorMessage('Please select a related CRM lead.');
      return;
    }
    if (!contactName.trim()) {
      setErrorMessage('Contact person is required.');
      return;
    }

    const durMin = parseInt(durationMinutes, 10) || 0;
    const durSec = parseInt(durationSeconds, 10) || 0;
    const formattedDuration = `${durMin}m ${durSec.toString().padStart(2, '0')}s`;
    const totalDurationSeconds = durMin * 60 + durSec;

    const newCall: CallRecord = {
      id: `call-${Date.now()}`,
      callCode: `CALL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      leadId: selectedLead.id,
      leadCode: selectedLead.leadCode,
      companyName: selectedLead.company.name,
      contactId: `ct-${Date.now()}`,
      contactName,
      contactDesignation: contactDesignation || 'Stakeholder',
      contactPhone: contactPhone || selectedLead.contact.phone,
      contactEmail: selectedLead.contact.email,
      employeeId: 'emp-1',
      employeeName: assignedEmployee,
      employeeRole:
        assignedEmployee === 'Kunal Patil'
          ? 'Sales Manager'
          : assignedEmployee === 'Shruti Raundal'
          ? 'Senior Sales Executive'
          : 'Business Analyst',
      employeeAvatar: assignedEmployee
        .split(' ')
        .map((n) => n[0])
        .join(''),
      type: callType,
      status: 'completed',
      date: '07 Sep 2026',
      time,
      duration: formattedDuration,
      durationSeconds: totalDurationSeconds,
      result,
      notes,
      nextAction,
      nextFollowUp:
        nextAction === 'followup'
          ? {
              date: followUpDate,
              time: followUpTime,
              type: followUpType,
              assignedTo: followUpAssignedTo,
            }
          : undefined,
      service: selectedLead.service,
      leadStatus: selectedLead.status,
      leadScore: selectedLead.score,
      opportunityCreated: false,
      recordingAvailable: false,
      createdAt: new Date().toISOString(),
    };

    onSaveCall(newCall);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card / Mobile Sheet */}
      <div className="relative w-full max-w-2xl bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50 sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Log Call Record</h3>
              <p className="text-xs text-slate-500">Record call details, outcome, and follow-up</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium text-xs">
              {errorMessage}
            </div>
          )}

          {/* 1. RELATED LEAD (CRITICAL REQUIREMENT) */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900 text-xs">
              Related Lead <span className="text-rose-500">*</span>
            </label>

            {/* Lead Search Picker Dropdown */}
            <div className="relative">
              <div
                onClick={() => setIsLeadDropdownOpen(!isLeadDropdownOpen)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-400 min-h-[44px]"
              >
                {selectedLead ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#5B4DB7]" />
                    <span className="font-bold text-slate-900">{selectedLead.company.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      ({selectedLead.leadCode})
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">Search or select a lead...</span>
                )}
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {isLeadDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-100">
                  <div className="p-2 sticky top-0 bg-white border-b border-slate-100">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={leadSearch}
                        onChange={(e) => setLeadSearch(e.target.value)}
                        placeholder="Search by company, code, contact..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        autoFocus
                      />
                    </div>
                  </div>
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => applyLead(lead)}
                      className="p-2.5 hover:bg-purple-50/50 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{lead.company.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {lead.contact.name} • {lead.contact.designation}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-slate-400 block">
                          {lead.leadCode}
                        </span>
                        <span className="text-[10px] font-semibold text-[#5B4DB7]">
                          Score: {lead.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Lead Meta Box */}
            {selectedLead && (
              <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Contact</span>
                  <span className="font-bold text-slate-800">{selectedLead.contact.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Designation</span>
                  <span className="font-semibold text-slate-700">
                    {selectedLead.contact.designation}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Service</span>
                  <span className="font-semibold text-slate-700 line-clamp-1">
                    {selectedLead.service}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Lead Status & Score</span>
                  <span className="font-bold text-[#5B4DB7]">
                    {selectedLead.status} • {selectedLead.score}/100
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. CONTACT PERSON & PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Person <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs min-h-[44px]"
                  placeholder="e.g. Nikita Patil"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono min-h-[44px]"
                  placeholder="+91 98230 45612"
                />
              </div>
            </div>
          </div>

          {/* 3. CALL DIRECTION, DATE, TIME, DURATION */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Call Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={callType}
                onChange={(e) => setCallType(e.target.value as CallType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium min-h-[44px]"
              >
                <option value="outbound">Outbound (We Called)</option>
                <option value="inbound">Inbound (They Called)</option>
                <option value="missed">Missed Call</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="11:30 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-center min-h-[44px]"
                />
                <span className="text-slate-400 font-bold">m</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  placeholder="Sec"
                  className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-center min-h-[44px]"
                />
                <span className="text-slate-400 font-bold">s</span>
              </div>
            </div>
          </div>

          {/* 4. CALL RESULT & EMPLOYEE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">
                Call Result <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={result}
                onChange={(e) => setResult(e.target.value as CallResult)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-[#5B4DB7] min-h-[44px] focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="Interested">Interested</option>
                <option value="Requirement Received">Requirement Received ✦</option>
                <option value="Proposal Requested">Proposal Requested ✦</option>
                <option value="Meeting Requested">Meeting Requested</option>
                <option value="Callback Required">Callback Required</option>
                <option value="Not Interested">Not Interested</option>
                <option value="No Response">No Response</option>
                <option value="Busy">Busy</option>
                <option value="Wrong Number">Wrong Number</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Called By (Employee)</label>
              <select
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium min-h-[44px]"
              >
                <option value="Kunal Patil">Kunal Patil (Sales Manager)</option>
                <option value="Shruti Raundal">Shruti Raundal (Senior Sales Executive)</option>
                <option value="Pranav Jejurkar">Pranav Jejurkar (Business Analyst)</option>
                <option value="Ankush Pandit">Ankush Pandit (Sales Executive)</option>
                <option value="Rohan Patil">Rohan Patil (Enterprise BDM)</option>
              </select>
            </div>
          </div>

          {/* OPPORTUNITY NOTICE BANNER */}
          {isOpportunityEligible && (
            <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs text-amber-900 font-medium">
                  High-intent call result! You can spawn an Opportunity from this requirement.
                </span>
              </div>
              {onTriggerOpportunityModal && selectedLead && (
                <button
                  type="button"
                  onClick={() =>
                    onTriggerOpportunityModal(selectedLead, {
                      contactName,
                      result,
                      notes,
                      service: selectedLead.service,
                    })
                  }
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 min-h-[36px]"
                >
                  Create Opportunity
                </button>
              )}
            </div>
          )}

          {/* 5. NOTES */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Call Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer is interested in ERP solution. Requested proposal by tomorrow..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />
          </div>

          {/* 6. NEXT ACTION (CONNECTS CALLS -> FOLLOW-UPS) */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Next Action</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'none' as NextActionType, label: 'No next action' },
                  { id: 'followup' as NextActionType, label: 'Create Follow-up' },
                  { id: 'meeting' as NextActionType, label: 'Schedule Meeting' },
                  { id: 'email' as NextActionType, label: 'Send Email' },
                ].map((act) => (
                  <label
                    key={act.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer min-h-[44px] ${
                      nextAction === act.id
                        ? 'border-[#5B4DB7] bg-purple-50 text-[#5B4DB7] font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="nextAction"
                      value={act.id}
                      checked={nextAction === act.id}
                      onChange={() => setNextAction(act.id)}
                      className="text-[#5B4DB7] focus:ring-[#5B4DB7]"
                    />
                    <span>{act.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Follow-up subfields if 'Create Follow-up' selected */}
            {nextAction === 'followup' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <CalendarPlus className="w-3.5 h-3.5 text-[#5B4DB7]" />
                  <span>Scheduled Follow-up Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Time</label>
                    <input
                      type="text"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      placeholder="11:00 AM"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Type</label>
                    <select
                      value={followUpType}
                      onChange={(e) =>
                        setFollowUpType(
                          e.target.value as 'Call' | 'Email' | 'Meeting' | 'Demo' | 'Document'
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs min-h-[44px]"
                    >
                      <option value="Email">Email Follow-up</option>
                      <option value="Call">Call Follow-up</option>
                      <option value="Meeting">Client Meeting</option>
                      <option value="Demo">Technical Demo</option>
                      <option value="Document">Send Proposal / SOW</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Assigned To
                    </label>
                    <select
                      value={followUpAssignedTo}
                      onChange={(e) => setFollowUpAssignedTo(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs min-h-[44px]"
                    >
                      <option value="Kunal Patil">Kunal Patil</option>
                      <option value="Shruti Raundal">Shruti Raundal</option>
                      <option value="Pranav Jejurkar">Pranav Jejurkar</option>
                      <option value="Ankush Pandit">Ankush Pandit</option>
                      <option value="Rohan Patil">Rohan Patil</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom actions (At least 44px tall for touch target compliance) */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 min-h-[44px] flex items-center justify-center cursor-pointer order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-xl font-semibold shadow-md min-h-[44px] flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Call</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
