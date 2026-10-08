import React, { useState, useEffect } from 'react';
import { CallRecord, CallType, CallResult, NextActionType } from '../../../types/calls';
import { Lead } from '../../../types/leads';
import { EmployeeSelect } from '../../common/EmployeeSelect';
import { LeadSearchSelect } from '../../common/LeadSearchSelect';
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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(initialLead || null);

  // Form fields
  const [contactName, setContactName] = useState(initialLead?.contact?.name || '');
  const [contactPhone, setContactPhone] = useState(initialLead?.contact?.phone || '');
  const [contactDesignation, setContactDesignation] = useState(initialLead?.contact?.designation || '');
  const [callType, setCallType] = useState<CallType>('outbound');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [durationMinutes, setDurationMinutes] = useState('12');
  const [durationSeconds, setDurationSeconds] = useState('34');
  const [result, setResult] = useState<CallResult>('Interested');
  const [notes, setNotes] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState(initialLead?.assignedEmployee?.name || '');

  // Next action
  const [nextAction, setNextAction] = useState<NextActionType>('none');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [followUpTime, setFollowUpTime] = useState('11:00 AM');
  const [followUpType, setFollowUpType] = useState<'Call' | 'Email' | 'Meeting' | 'Demo' | 'Document'>('Email');
  const [followUpAssignedTo, setFollowUpAssignedTo] = useState(initialLead?.assignedEmployee?.name || '');

  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  // Populate from initialLead
  useEffect(() => {
    if (initialLead) {
      applyLead(initialLead);
    }
  }, [initialLead]);

  const applyLead = (lead: Lead | null) => {
    setSelectedLead(lead);
    if (lead) {
      setContactName(lead.contact?.name || '');
      setContactPhone(lead.contact?.phone || '');
      setContactDesignation(lead.contact?.designation || '');
      if (lead.assignedEmployee?.name) {
        setAssignedEmployee(lead.assignedEmployee.name);
        setFollowUpAssignedTo(lead.assignedEmployee.name);
      }
    } else {
      setContactName('');
      setContactPhone('');
      setContactDesignation('');
    }
  };

  if (!isOpen) return null;

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
      date: date
        ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time,
      duration: formattedDuration,
      durationSeconds: totalDurationSeconds,
      result,
      notes: notes.trim() || `Call conducted with ${contactName} (${contactPhone || selectedLead.contact.phone || 'No phone'}). Result: ${result}.`,
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
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/60 sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Log Call Record</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record call details, outcome, and follow-up</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="log-call-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-medium text-xs">
              {errorMessage}
            </div>
          )}

          {/* 1. RELATED LEAD (CRITICAL REQUIREMENT) */}
          <div>
            <LeadSearchSelect
              label="Select Client / Lead"
              required
              value={selectedLead ? selectedLead.id : ''}
              initialLead={selectedLead}
              onChange={(newId, leadObj) => applyLead(leadObj)}
              placeholder="Search by company, contact, phone, email, or lead code (10K+ leads)..."
              showMetaPreview={true}
            />
          </div>

          {/* 2. CONTACT PERSON & PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  placeholder="e.g. Nikita Patil"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  placeholder="+91 98230 45612"
                />
              </div>
            </div>
          </div>

          {/* 3. CALL DIRECTION, DATE, TIME, DURATION */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Call Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={callType}
                onChange={(e) => setCallType(e.target.value as CallType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              >
                <option value="outbound">Outbound (We Called)</option>
                <option value="inbound">Inbound (They Called)</option>
                <option value="missed">Missed Call</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="11:30 AM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-center text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
                <span className="text-slate-400 font-bold">m</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  placeholder="Sec"
                  className="w-1/2 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-center text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
                <span className="text-slate-400 font-bold">s</span>
              </div>
            </div>
          </div>

          {/* 4. CALL RESULT & EMPLOYEE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 dark:text-white mb-1">
                Call Result <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={result}
                onChange={(e) => setResult(e.target.value as CallResult)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-[#5B4DB7] dark:text-purple-300 min-h-[44px] focus:ring-2 focus:ring-[#5B4DB7]"
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Called By (Employee)</label>
              <EmployeeSelect
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                placeholder="Select Caller / Employee"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>
          </div>

          {/* OPPORTUNITY NOTICE BANNER */}
          {isOpportunityEligible && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/80 rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
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
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 min-h-[36px] transition-colors cursor-pointer"
                >
                  Create Opportunity
                </button>
              )}
            </div>
          )}

          {/* 5. NOTES */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Call Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer is interested in ERP solution. Requested proposal by tomorrow..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />
          </div>

          {/* 6. NEXT ACTION (CONNECTS CALLS -> FOLLOW-UPS) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <label className="block font-bold text-slate-900 dark:text-white mb-1">Next Action</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'none' as NextActionType, label: 'No next action' },
                  { id: 'followup' as NextActionType, label: 'Create Follow-up' },
                  { id: 'meeting' as NextActionType, label: 'Schedule Meeting' },
                  { id: 'email' as NextActionType, label: 'Send Email' },
                ].map((act) => (
                  <label
                    key={act.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer min-h-[44px] transition-colors ${
                      nextAction === act.id
                        ? 'border-[#5B4DB7] dark:border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
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
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <CalendarPlus className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                  <span>Scheduled Follow-up Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Time</label>
                    <input
                      type="text"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      placeholder="11:00 AM"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Type</label>
                    <select
                      value={followUpType}
                      onChange={(e) =>
                        setFollowUpType(
                          e.target.value as 'Call' | 'Email' | 'Meeting' | 'Demo' | 'Document'
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                    >
                      <option value="Email">Email Follow-up</option>
                      <option value="Call">Call Follow-up</option>
                      <option value="Meeting">Client Meeting</option>
                      <option value="Demo">Technical Demo</option>
                      <option value="Document">Send Proposal / SOW</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Assigned To
                    </label>
                    <EmployeeSelect
                      value={followUpAssignedTo}
                      onChange={(e) => setFollowUpAssignedTo(e.target.value)}
                      placeholder="Select Assigned Employee"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Fixed Pinned Bottom Actions */}
        <div className="p-4 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[42px] flex items-center justify-center cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="log-call-form"
            className="px-6 py-2.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs rounded-xl font-semibold shadow-md min-h-[42px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Log Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
