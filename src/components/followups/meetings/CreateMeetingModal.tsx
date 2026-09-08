import React from 'react';
import { X, Calendar, Clock, Video, MapPin, AlertCircle, Building2 } from 'lucide-react';
import {
  MeetingRecord,
  MeetingType,
  MeetingLocation,
} from '../../../types/followUps';
import { MOCK_LEADS } from '../../../data/mockLeads';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meeting: Omit<MeetingRecord, 'id'>) => void;
  preselectedLeadId?: string;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedLeadId,
}) => {
  const [leadId, setLeadId] = React.useState(preselectedLeadId || MOCK_LEADS[0]?.id || '');
  const [title, setTitle] = React.useState('');
  const [meetingType, setMeetingType] = React.useState<MeetingType>('Discovery Call');
  const [date, setDate] = React.useState('2026-09-08');
  const [startTime, setStartTime] = React.useState('11:00 AM');
  const [endTime, setEndTime] = React.useState('12:00 PM');
  const [assignedEmployee, setAssignedEmployee] = React.useState('Kunal Patil');
  const [location, setLocation] = React.useState<MeetingLocation>('Online');
  const [meetingLink, setMeetingLink] = React.useState('https://meet.google.com/tk-client-sync');
  const [description, setDescription] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (preselectedLeadId) setLeadId(preselectedLeadId);
  }, [preselectedLeadId]);

  if (!isOpen) return null;

  const selectedLead = MOCK_LEADS.find((l) => l.id === leadId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter meeting title.');
      return;
    }
    if (!selectedLead) {
      setError('Please select a lead.');
      return;
    }

    onSubmit({
      leadId: selectedLead.id,
      leadCode: selectedLead.leadCode,
      companyName: selectedLead.company.name,
      contactName: selectedLead.contact.name,
      contactDesignation: selectedLead.contact.designation,
      contactPhone: selectedLead.contact.phone,
      contactEmail: selectedLead.contact.email,
      title,
      meetingType,
      date,
      startTime,
      endTime,
      assignedEmployee,
      assignedAvatar: assignedEmployee.split(' ').map((n) => n[0]).join('').toUpperCase(),
      location,
      meetingLink: location === 'Online' ? meetingLink : undefined,
      description,
      notes,
      status: 'Scheduled',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        id="create-meeting-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-purple-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#5B4DB7] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Schedule Client Meeting
              </h3>
              <p className="text-xs text-slate-500">
                Discovery, technical architecture, product demo, or commercial negotiation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
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
              Select Client / Lead *
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              required
            >
              {MOCK_LEADS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company.name} ({l.leadCode}) — {l.contact.name}
                </option>
              ))}
            </select>
          </div>

          {/* Meeting Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Requirement Discussion & Architecture Walkthrough"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              required
            />
          </div>

          {/* Meeting Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Meeting Type *
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              >
                <option value="Discovery Call">Discovery Call</option>
                <option value="Requirement Discussion">Requirement Discussion</option>
                <option value="Technical Discussion">Technical Discussion</option>
                <option value="Demo">Product / POC Demo</option>
                <option value="Proposal Discussion">Proposal Discussion</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Internal Meeting">Internal Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Location *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as MeetingLocation)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              >
                <option value="Online">Online (Google Meet / Zoom)</option>
                <option value="Office">TechnoKraft Office</option>
                <option value="Client Location">Client Location / Site</option>
                <option value="Phone">Telephone Conference</option>
              </select>
            </div>
          </div>

          {/* If Online, Meeting link */}
          {location === 'Online' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Meeting URL / Video Link
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              />
            </div>
          )}

          {/* Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                Start Time *
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 11:00 AM"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                End Time *
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="e.g. 12:00 PM"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>
          </div>

          {/* Assigned Host */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Host / Assigned Employee *
            </label>
            <select
              value={assignedEmployee}
              onChange={(e) => setAssignedEmployee(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
            >
              <option value="Kunal Patil">Kunal Patil (Sales Manager)</option>
              <option value="Shruti Raundal">Shruti Raundal (Sales Executive)</option>
              <option value="Pranav Jejurkar">Pranav Jejurkar (Business Analyst)</option>
              <option value="Ankush Pandit">Ankush Pandit (Tech Lead)</option>
              <option value="Rohan Patil">Rohan Patil (Sales Executive)</option>
            </select>
          </div>

          {/* Agenda / Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Agenda & Topics to Discuss
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline presentation structure, attendees, and key goals..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4d3fa5] rounded-lg shadow-xs"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
