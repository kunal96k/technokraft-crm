import React, { useState, useEffect } from 'react';
import { CallRecord } from '../../../types/calls';
import { Lead } from '../../../types/leads';
import { EmployeeSelect } from '../../common/EmployeeSelect';
import { LeadSearchSelect } from '../../common/LeadSearchSelect';
import {
  X,
  Search,
  Calendar,
  Clock,
  User,
  Building2,
  Bell,
  CheckCircle2,
  ChevronDown,
  PhoneCall,
} from 'lucide-react';

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleCall: (call: CallRecord) => void;
  initialLead?: Lead | null;
}

export const ScheduleCallModal: React.FC<ScheduleCallModalProps> = ({
  isOpen,
  onClose,
  onScheduleCall,
  initialLead,
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(initialLead || null);
  const [contactName, setContactName] = useState(initialLead?.contact?.name || '');
  const [contactPhone, setContactPhone] = useState(initialLead?.contact?.phone || '');
  const [date, setDate] = useState('2026-09-09');
  const [time, setTime] = useState('11:00 AM');
  const [assignedEmployee, setAssignedEmployee] = useState(initialLead?.assignedEmployee?.name || '');
  const [purpose, setPurpose] = useState('Discuss proposal');
  const [reminder, setReminder] = useState('15 minutes before');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      if (lead.assignedEmployee?.name) {
        setAssignedEmployee(lead.assignedEmployee.name);
      }
    } else {
      setContactName('');
      setContactPhone('');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) {
      setErrorMessage('Please select a lead to schedule a call with.');
      return;
    }
    if (!contactName.trim()) {
      setErrorMessage('Contact name is required.');
      return;
    }

    const scheduledCall: CallRecord = {
      id: `call-sched-${Date.now()}`,
      callCode: `CALL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      leadId: selectedLead.id,
      leadCode: selectedLead.leadCode,
      companyName: selectedLead.company.name,
      contactId: `ct-${Date.now()}`,
      contactName,
      contactDesignation: selectedLead.contact.designation,
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
      type: 'outbound',
      status: 'scheduled',
      date: '09 Sep 2026',
      time,
      duration: '0m 00s',
      durationSeconds: 0,
      purpose,
      reminder,
      notes: notes || `Scheduled discovery call to ${purpose.toLowerCase()}.`,
      service: selectedLead.service,
      leadStatus: selectedLead.status,
      leadScore: selectedLead.score,
      recordingAvailable: false,
      createdAt: new Date().toISOString(),
    };

    onScheduleCall(scheduledCall);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/60 sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Schedule Upcoming Call</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Plan a future outbound or client check-in call</p>
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

        {/* Form Body */}
        <form id="schedule-call-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-medium text-xs">
              {errorMessage}
            </div>
          )}

          {/* Lead Selector */}
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

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                placeholder="Nikita Patil"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                placeholder="+91 98230 45612"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="11:00 AM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>
          </div>

          {/* Assigned Employee & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Employee</label>
              <EmployeeSelect
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                placeholder="Select Assigned Employee"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Discuss proposal"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Reminder</span>
            </label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            >
              <option value="15 minutes before">15 minutes before</option>
              <option value="30 minutes before">30 minutes before</option>
              <option value="1 hour before">1 hour before</option>
              <option value="1 day before">1 day before</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Call Agenda</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Review commercial terms, milestone breakdown, and timeline..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />
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
            form="schedule-call-form"
            className="px-6 py-2.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs rounded-xl font-semibold shadow-md min-h-[42px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Schedule Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
