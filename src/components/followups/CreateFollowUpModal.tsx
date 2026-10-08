import React from 'react';
import { X, Calendar, Clock, AlertCircle, Sparkles, Building2, User } from 'lucide-react';
import {
  FollowUpRecord,
  FollowUpType,
  FollowUpPriority,
} from '../../types/followUps';
import { Lead } from '../../types/leads';
import { EmployeeSelect } from '../common/EmployeeSelect';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { LeadSearchSelect } from '../common/LeadSearchSelect';
import { getTodayIST_YYYYMMDD } from '../../utils/dateUtils';

interface CreateFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newFollowUp: Omit<FollowUpRecord, 'id' | 'createdAt'>) => void;
  preselectedLeadId?: string;
  preselectedDate?: string;
}

function formatTo24HourTime(timeStr: string): string {
  if (!timeStr) return '11:00';
  const match12 = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const ampm = match12[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  return timeStr;
}

export const CreateFollowUpModal: React.FC<CreateFollowUpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedLeadId,
  preselectedDate,
}) => {
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [leadId, setLeadId] = React.useState(preselectedLeadId || '');
  const [type, setType] = React.useState<FollowUpType>('Call');
  const [purpose, setPurpose] = React.useState('');
  const [date, setDate] = React.useState(() => preselectedDate || getTodayIST_YYYYMMDD());
  const [time, setTime] = React.useState('16:30');
  const [assignedTo, setAssignedTo] = React.useState('');
  const [priority, setPriority] = React.useState<FollowUpPriority>('HIGH');
  const [reminder, setReminder] = React.useState('15 minutes before');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);

  React.useEffect(() => {
    if (preselectedLeadId) {
      setLeadId(preselectedLeadId);
    }
    if (preselectedDate) {
      setDate(preselectedDate);
    }
  }, [preselectedLeadId, preselectedDate, isOpen]);

  if (!isOpen) return null;

  const purposePresets = [
    'Discuss ERP & cloud orchestration requirement specs',
    'Follow up on formal commercial quotation draft',
    'Confirm demo attendees from customer engineering team',
    'Review technical architecture feedback and timeline',
    'Routine weekly account status sync',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      setError('Please select a lead.');
      return;
    }
    if (!purpose.trim()) {
      setError('Please enter follow-up purpose.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    setError('');
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    const lead = selectedLead;
    if (!lead) return;

    onSubmit({
      leadId: lead.id,
      leadCode: lead.leadCode,
      companyName: lead.company.name,
      contactName: lead.contact.name,
      contactDesignation: lead.contact.designation,
      contactPhone: lead.contact.phone,
      contactEmail: lead.contact.email,
      service: lead.service,
      leadScore: lead.score,
      leadStatus: lead.status,
      type,
      purpose,
      date,
      time: formatTo24HourTime(time),
      assignedTo,
      assignedAvatar: assignedTo ? assignedTo.split(' ').map((n) => n[0]).join('').toUpperCase() : 'FU',
      priority,
      status: 'PENDING',
      reminder,
      notes,
    });

    setShowConfirmModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 py-6 sm:py-8 animate-in fade-in duration-150">
      <div
        id="create-followup-modal"
        className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl flex flex-col max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 backdrop-blur-xs z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Schedule New Follow-up
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set customer callback, email checkpoint, or demo reminder with automatic SLA tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

          {/* Lead Selection */}
          <div>
            <LeadSearchSelect
              label="Select Client / Lead"
              required
              value={leadId}
              onChange={(newId, leadObj) => {
                setLeadId(newId);
                setSelectedLead(leadObj);
              }}
              placeholder="Search by company, contact, phone, email, or lead code (10K+ leads)..."
              showMetaPreview={true}
            />
          </div>

          {/* Follow-up Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Follow-up Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FollowUpType)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Meeting">Meeting</option>
                <option value="Requirement Follow-up">Requirement Follow-up</option>
                <option value="Proposal Follow-up">Proposal Follow-up</option>
                <option value="General Follow-up">General Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as FollowUpPriority)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              >
                <option value="URGENT">Urgent (Immediate SLA)</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Purpose & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Purpose / Goal *
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Choose a preset or type custom
              </span>
            </div>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Discuss technical proposal and timeline"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              required
            />
            {/* Presets chips */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {purposePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPurpose(preset)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/50 hover:text-purple-700 dark:hover:text-purple-300 text-slate-600 dark:text-slate-300 transition-colors truncate max-w-xs"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>
          </div>

          {/* Assigned Rep & Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Employee *
              </label>
              <EmployeeSelect
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Select Employee / Unassigned"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notification Reminder
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              >
                <option value="No reminder">No reminder</option>
                <option value="5 minutes before">5 minutes before</option>
                <option value="15 minutes before">15 minutes before</option>
                <option value="30 minutes before">30 minutes before</option>
                <option value="1 hour before">1 hour before</option>
                <option value="1 day before">1 day before</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Notes / Context (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Previous objections, attendees, or specific topics to raise..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
            />
          </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="flex-shrink-0 px-6 py-3.5 bg-slate-50/90 dark:bg-slate-950/60 backdrop-blur-xs border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4d3fa5] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Create Follow-up
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal Before Saving Follow-up */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Follow-up Schedule"
        message={`Are you sure you want to schedule this ${type} with "${selectedLead?.company.name}"?`}
        confirmLabel="Confirm & Schedule"
        cancelLabel="Review Details"
        variant="primary"
        iconType="save"
        itemDetails={[
          { label: 'Company / Lead', value: selectedLead?.company.name },
          { label: 'Contact', value: selectedLead?.contact.name },
          { label: 'Follow-up Type', value: type },
          { label: 'Purpose', value: purpose },
          { label: 'Date & Time', value: `${date} at ${time}` },
          { label: 'Assigned To', value: assignedTo || 'Unassigned' },
          { label: 'Priority', value: priority },
        ]}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
