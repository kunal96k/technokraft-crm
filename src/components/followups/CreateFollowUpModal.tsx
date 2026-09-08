import React from 'react';
import { X, Calendar, Clock, AlertCircle, Sparkles, Building2, User } from 'lucide-react';
import {
  FollowUpRecord,
  FollowUpType,
  FollowUpPriority,
} from '../../types/followUps';
import { MOCK_LEADS } from '../../data/mockLeads';

interface CreateFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newFollowUp: Omit<FollowUpRecord, 'id' | 'createdAt'>) => void;
  preselectedLeadId?: string;
}

export const CreateFollowUpModal: React.FC<CreateFollowUpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedLeadId,
}) => {
  const [leadId, setLeadId] = React.useState(preselectedLeadId || MOCK_LEADS[0]?.id || '');
  const [type, setType] = React.useState<FollowUpType>('Call');
  const [purpose, setPurpose] = React.useState('');
  const [date, setDate] = React.useState('2026-09-07');
  const [time, setTime] = React.useState('04:30 PM');
  const [assignedTo, setAssignedTo] = React.useState('Kunal Patil');
  const [priority, setPriority] = React.useState<FollowUpPriority>('HIGH');
  const [reminder, setReminder] = React.useState('15 minutes before');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (preselectedLeadId) {
      setLeadId(preselectedLeadId);
    }
  }, [preselectedLeadId]);

  if (!isOpen) return null;

  const selectedLead = MOCK_LEADS.find((l) => l.id === leadId);

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
      time,
      assignedTo,
      assignedAvatar: assignedTo.split(' ').map((n) => n[0]).join('').toUpperCase(),
      priority,
      status: 'PENDING',
      reminder,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        id="create-followup-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Schedule New Follow-up
            </h3>
            <p className="text-xs text-slate-500">
              Set customer callback, email checkpoint, or demo reminder with automatic SLA tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Lead Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Related Lead / Customer *
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              required
            >
              {MOCK_LEADS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company.name} ({l.leadCode}) — {l.contact.name}
                </option>
              ))}
            </select>

            {/* Auto-resolved Lead Meta Card */}
            {selectedLead && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Contact:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {selectedLead.contact.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Designation:</span>
                  <span className="font-medium text-slate-700 truncate block">
                    {selectedLead.contact.designation || 'Key Decision Maker'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Service:</span>
                  <span className="font-medium text-purple-700 truncate block">
                    {selectedLead.service}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Score:</span>
                  <span className="font-bold text-emerald-600">
                    {selectedLead.score} / 100
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Follow-up Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Follow-up Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FollowUpType)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
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
              <label className="block font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as FollowUpPriority)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
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
              <label className="font-semibold text-slate-700">
                Purpose / Goal *
              </label>
              <span className="text-[10px] text-slate-400">
                Choose a preset or type custom
              </span>
            </div>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Discuss technical proposal and timeline"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              required
            />
            {/* Presets chips */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {purposePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPurpose(preset)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 transition-colors truncate max-w-xs"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Time *
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 04:00 PM"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>
          </div>

          {/* Assigned Rep & Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Employee *
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              >
                <option value="Kunal Patil">Kunal Patil (Sales Manager)</option>
                <option value="Shruti Raundal">Shruti Raundal (Sales Executive)</option>
                <option value="Pranav Jejurkar">Pranav Jejurkar (Business Analyst)</option>
                <option value="Ankush Pandit">Ankush Pandit (Tech Lead)</option>
                <option value="Rohan Patil">Rohan Patil (Sales Executive)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notification Reminder
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
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
            <label className="block font-semibold text-slate-700 mb-1">
              Internal Notes / Context (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Previous objections, attendees, or specific topics to raise..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4d3fa5] rounded-lg shadow-xs transition-colors"
            >
              Create Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
