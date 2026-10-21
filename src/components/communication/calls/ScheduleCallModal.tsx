import React, { useState, useEffect } from 'react';
import { CallRecord } from '../../../types/calls';
import { Lead } from '../../../types/leads';
import { EmployeeSelect } from '../../common/EmployeeSelect';
import { LeadSearchSelect } from '../../common/LeadSearchSelect';
import { useAuth } from '../../../context/AuthContext';
import { findCachedEmployee } from '../../../services/employeeService';
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

// Helper to convert 24-hr time (HH:mm) to 12-hr AM/PM format
function formatTo12Hour(timeStr: string): string {
  if (!timeStr) return '';
  if (/am|pm/i.test(timeStr)) return timeStr;
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }
  return timeStr;
}

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleCall: (call: CallRecord) => void;
  initialLead?: Lead | null;
  callToEdit?: CallRecord | null;
}

export const ScheduleCallModal: React.FC<ScheduleCallModalProps> = ({
  isOpen,
  onClose,
  onScheduleCall,
  initialLead,
  callToEdit,
}) => {
  const { user: authUser } = useAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(initialLead || null);
  const [contactName, setContactName] = useState(initialLead?.contact?.name || '');
  const [contactPhone, setContactPhone] = useState(initialLead?.contact?.phone || '');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('11:00');
  const [assignedEmployee, setAssignedEmployee] = useState(initialLead?.assignedEmployee?.name || authUser?.name || '');
  const [purpose, setPurpose] = useState('Discuss proposal');
  const [reminder, setReminder] = useState('15 minutes before');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (callToEdit) {
      setContactName(callToEdit.contactName || '');
      setContactPhone(callToEdit.contactPhone || '');
      setAssignedEmployee(callToEdit.employeeName || '');
      setPurpose(callToEdit.purpose || 'Discuss proposal');
      setReminder(callToEdit.reminder || '15 minutes before');
      setNotes(callToEdit.notes || '');

      // Parse date to YYYY-MM-DD
      if (callToEdit.date) {
        const parsed = new Date(callToEdit.date);
        if (!isNaN(parsed.getTime())) {
          setDate(parsed.toISOString().split('T')[0]);
        }
      }

      // Parse time to HH:mm (24h)
      if (callToEdit.time) {
        const timeMatch = callToEdit.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = timeMatch[2];
          const ap = timeMatch[3];
          if (ap) {
            if (ap.toUpperCase() === 'PM' && h < 12) h += 12;
            if (ap.toUpperCase() === 'AM' && h === 12) h = 0;
          }
          setTime(`${h.toString().padStart(2, '0')}:${m}`);
        }
      }

      setSelectedLead({
        id: callToEdit.leadId,
        leadCode: callToEdit.leadCode,
        company: { name: callToEdit.companyName },
        contact: {
          name: callToEdit.contactName,
          phone: callToEdit.contactPhone,
          designation: callToEdit.contactDesignation,
          email: callToEdit.contactEmail,
        },
      } as any);
    } else if (initialLead) {
      applyLead(initialLead);
    }
  }, [callToEdit, initialLead]);

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
      id: callToEdit ? callToEdit.id : `call-sched-${Date.now()}`,
      callCode: callToEdit ? callToEdit.callCode : `CALL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      leadId: selectedLead.id,
      leadCode: selectedLead.leadCode,
      companyName: selectedLead.company.name,
      contactId: callToEdit?.contactId || `ct-${Date.now()}`,
      contactName,
      contactDesignation: selectedLead.contact.designation || callToEdit?.contactDesignation,
      contactPhone: contactPhone || selectedLead.contact.phone,
      contactEmail: selectedLead.contact.email || callToEdit?.contactEmail,
      employeeId: (authUser && authUser.name === assignedEmployee) ? authUser.id : (findCachedEmployee(assignedEmployee)?.id ? String(findCachedEmployee(assignedEmployee)?.id) : (callToEdit?.employeeId || 'emp-1')),
      employeeName: assignedEmployee,
      employeeRole:
        (authUser && authUser.name === assignedEmployee ? authUser.role : findCachedEmployee(assignedEmployee)?.role) ||
        findCachedEmployee(assignedEmployee)?.accessRole ||
        callToEdit?.employeeRole ||
        'Sales Executive',
      employeeAvatar:
        (authUser && authUser.name === assignedEmployee && authUser.profilePhoto)
          ? authUser.profilePhoto
          : (findCachedEmployee(assignedEmployee)?.profilePhoto ||
             (authUser && authUser.name === assignedEmployee ? authUser.avatar : findCachedEmployee(assignedEmployee)?.avatar) ||
             (assignedEmployee ? assignedEmployee.split(' ').map((n) => n[0]).join('') : callToEdit?.employeeAvatar || 'SR')),
      employeeProfilePhoto:
        (authUser && authUser.name === assignedEmployee ? authUser.profilePhoto : undefined) ||
        findCachedEmployee(assignedEmployee)?.profilePhoto ||
        callToEdit?.employeeProfilePhoto,
      employeeEmail:
        (authUser && authUser.name === assignedEmployee ? authUser.email : undefined) ||
        findCachedEmployee(assignedEmployee)?.email ||
        callToEdit?.employeeEmail,
      type: callToEdit?.type || 'outbound',
      status: 'scheduled',
      date: date
        ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: formatTo12Hour(time) || time,
      duration: callToEdit?.duration || '0m 00s',
      durationSeconds: callToEdit?.durationSeconds || 0,
      purpose,
      reminder,
      notes: notes || `Scheduled discovery call to ${purpose.toLowerCase()}.`,
      service: selectedLead.service || callToEdit?.service,
      leadStatus: selectedLead.status || callToEdit?.leadStatus,
      leadScore: selectedLead.score || callToEdit?.leadScore,
      recordingAvailable: callToEdit?.recordingAvailable ?? false,
      createdAt: callToEdit?.createdAt || new Date().toISOString(),
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
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {callToEdit ? 'Edit Scheduled Call' : 'Schedule Upcoming Call'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {callToEdit ? 'Update scheduled date, time, representative, or agenda' : 'Plan a future outbound or client check-in call'}
              </p>
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
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  placeholder="Enter client contact name"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <div className="relative">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  placeholder="Enter client phone number"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Call Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Call Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
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
                placeholder="Enter call purpose / objective"
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
              placeholder="Enter scheduled agenda, requirements, and talking points..."
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
            <span>{callToEdit ? 'Save Changes' : 'Schedule Call'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
