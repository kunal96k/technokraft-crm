import React, { useState, useEffect } from 'react';
import { CallRecord } from '../../../types/calls';
import { MOCK_LEADS } from '../../../data/mockLeads';
import { Lead } from '../../../types/leads';
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
  const [leadSearch, setLeadSearch] = useState('');
  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(initialLead || null);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [date, setDate] = useState('2026-09-09');
  const [time, setTime] = useState('11:00 AM');
  const [assignedEmployee, setAssignedEmployee] = useState('Rahul Patil');
  const [purpose, setPurpose] = useState('Discuss proposal');
  const [reminder, setReminder] = useState('15 minutes before');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    setAssignedEmployee(lead.assignedEmployee.name);
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
        assignedEmployee === 'Rahul Patil'
          ? 'Sales Manager'
          : assignedEmployee === 'Priya Shah'
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
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50 sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Schedule Upcoming Call</h3>
              <p className="text-xs text-slate-500">Plan a future outbound or client check-in call</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium text-xs">
              {errorMessage}
            </div>
          )}

          {/* Lead Selector */}
          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Select Lead <span className="text-rose-500">*</span>
            </label>
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
                  <span className="text-slate-400">Choose lead...</span>
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
                        placeholder="Search leads..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        autoFocus
                      />
                    </div>
                  </div>
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => applyLead(lead)}
                      className="p-2.5 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{lead.company.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {lead.contact.name} • {lead.contact.designation}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{lead.leadCode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Person <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs min-h-[44px]"
                placeholder="Rahul Sharma"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono min-h-[44px]"
                placeholder="+91 98230 45612"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="11:00 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono min-h-[44px]"
              />
            </div>
          </div>

          {/* Assigned Employee & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Employee</label>
              <select
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium min-h-[44px]"
              >
                <option value="Rahul Patil">Rahul Patil (Sales Manager)</option>
                <option value="Priya Shah">Priya Shah (Senior Sales Executive)</option>
                <option value="Amit Mehta">Amit Mehta (Business Analyst)</option>
                <option value="Sneha Kulkarni">Sneha Kulkarni (Sales Executive)</option>
                <option value="Rohan Patil">Rohan Patil (Enterprise BDM)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Discuss proposal"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs min-h-[44px]"
              />
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>Reminder</span>
            </label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium min-h-[44px]"
            >
              <option value="15 minutes before">15 minutes before</option>
              <option value="30 minutes before">30 minutes before</option>
              <option value="1 hour before">1 hour before</option>
              <option value="1 day before">1 day before</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Call Agenda</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Review commercial terms, milestone breakdown, and timeline..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
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
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md min-h-[44px] flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Schedule Call</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
