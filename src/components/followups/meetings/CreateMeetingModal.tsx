import React from 'react';
import { X, Calendar, Clock, Video, MapPin, AlertCircle, Building2, User, Users } from 'lucide-react';
import {
  MeetingRecord,
  MeetingType,
  MeetingLocation,
} from '../../../types/followUps';
import { Lead } from '../../../types/leads';
import { EmployeeSelect } from '../../common/EmployeeSelect';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import { LeadSearchSelect } from '../../common/LeadSearchSelect';
import { getTodayIST_YYYYMMDD } from '../../../utils/dateUtils';

import { useAuth } from '../../../context/AuthContext';
import { findCachedEmployee } from '../../../services/employeeService';

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
  const { user } = useAuth();
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [leadId, setLeadId] = React.useState(preselectedLeadId || '');
  const [customCompany, setCustomCompany] = React.useState('');
  const [customContact, setCustomContact] = React.useState('');
  const [customDesignation, setCustomDesignation] = React.useState('');
  const [customPhone, setCustomPhone] = React.useState('');
  const [customEmail, setCustomEmail] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [meetingType, setMeetingType] = React.useState<MeetingType>('Discovery Call');
  const [date, setDate] = React.useState(() => getTodayIST_YYYYMMDD());
  const [startTime, setStartTime] = React.useState('11:00 AM');
  const [endTime, setEndTime] = React.useState('12:00 PM');
  const [assignedEmployee, setAssignedEmployee] = React.useState(() => user?.name || '');
  const [location, setLocation] = React.useState<MeetingLocation>('Online');
  const [meetingLink, setMeetingLink] = React.useState('https://meet.google.com/tk-client-sync');
  const [description, setDescription] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (preselectedLeadId) setLeadId(preselectedLeadId);
      if (user?.name) {
        setAssignedEmployee((prev) => prev || user.name);
      }
    } else {
      setError('');
      setTitle('');
      setDescription('');
      setNotes('');
      setCustomCompany('');
      setCustomContact('');
      setCustomDesignation('');
      setCustomPhone('');
      setCustomEmail('');
      setShowConfirmModal(false);
      if (user?.name) {
        setAssignedEmployee(user.name);
      }
    }
  }, [preselectedLeadId, isOpen, user?.name]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter meeting title.');
      return;
    }

    setError('');
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    const isAuth = user && user.name === assignedEmployee;
    const emp = findCachedEmployee(assignedEmployee);
    const assignedPhoto = isAuth ? user.profilePhoto : emp?.profilePhoto;
    const assignedEmail = isAuth ? user.email : emp?.email;
    const assignedAvatar = isAuth
      ? (user.profilePhoto || user.avatar)
      : (emp?.profilePhoto || emp?.avatar || (assignedEmployee ? assignedEmployee.split(' ').map((n) => n[0]).join('').toUpperCase() : 'ME'));

    const effectiveCompany = selectedLead
      ? selectedLead.company.name
      : (customCompany.trim() || 'Internal / Casual Event');
    const effectiveContact = selectedLead
      ? selectedLead.contact.name
      : (customContact.trim() || (assignedEmployee ? assignedEmployee : 'Internal Team'));
    const effectiveDesignation = selectedLead
      ? selectedLead.contact.designation
      : (customDesignation.trim() || 'Participant');
    const effectivePhone = selectedLead
      ? selectedLead.contact.phone
      : (customPhone.trim() || undefined);
    const effectiveEmail = selectedLead
      ? selectedLead.contact.email
      : (customEmail.trim() || undefined);

    onSubmit({
      leadId: selectedLead?.id,
      leadCode: selectedLead?.leadCode,
      companyName: effectiveCompany,
      contactName: effectiveContact,
      contactDesignation: effectiveDesignation,
      contactPhone: effectivePhone,
      contactEmail: effectiveEmail,
      title,
      meetingType,
      date,
      startTime,
      endTime,
      assignedEmployee,
      assignedEmail,
      assignedProfilePhoto: assignedPhoto,
      assignedAvatar,
      createdBy: user?.name,
      location,
      meetingLink: location === 'Online' ? meetingLink : undefined,
      description,
      notes,
      status: 'Scheduled',
    });

    setShowConfirmModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 py-6 sm:py-8 animate-in fade-in duration-150">
      <div
        id="create-meeting-modal"
        className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl flex flex-col max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-purple-50/70 dark:bg-purple-950/20 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Schedule Meeting
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Client discussion, team architecture sync, internal demo, or casual meeting.
              </p>
            </div>
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
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Lead Selection (Optional) */}
            <div>
              <LeadSearchSelect
                label="Select Client / Lead (Optional)"
                required={false}
                value={leadId}
                onChange={(newId, leadObj) => {
                  setLeadId(newId);
                  setSelectedLead(leadObj);
                }}
                placeholder="Search client/lead or leave empty for internal / casual meeting..."
                showMetaPreview={true}
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {selectedLead
                  ? `Associated with lead ${selectedLead.leadCode} (${selectedLead.company.name}).`
                  : 'Leave unselected for internal team syncs, casual catchups, vendor syncs, or other events.'}
              </p>
            </div>

            {/* If no Lead selected, optional custom entity & participant details */}
            {!selectedLead && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B4DB7] dark:text-purple-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Custom Organization & Attendee Details (Optional)
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Optional fields
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                      Meeting Entity / Organization
                    </label>
                    <input
                      type="text"
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      placeholder="e.g. Internal Tech Team, Design Board, AWS Vendor"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                      Attendee / Contact Person
                    </label>
                    <input
                      type="text"
                      value={customContact}
                      onChange={(e) => setCustomContact(e.target.value)}
                      placeholder="e.g. Team Members"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                      Attendee Designation / Role
                    </label>
                    <input
                      type="text"
                      value={customDesignation}
                      onChange={(e) => setCustomDesignation(e.target.value)}
                      placeholder="e.g. Solution Architect, Consultant"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                      Attendee Email / Phone
                    </label>
                    <input
                      type="text"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. team@company.com or phone"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Meeting Title */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Requirement Discussion & Architecture Walkthrough"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>

            {/* Meeting Type & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Type *
                </label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                >
                  <option value="Discovery Call">Discovery Call</option>
                  <option value="Requirement Discussion">Requirement Discussion</option>
                  <option value="Technical Discussion">Technical Discussion</option>
                  <option value="Demo">Product / POC Demo</option>
                  <option value="Proposal Discussion">Proposal Discussion</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Internal Meeting">Internal Meeting / Team Sync</option>
                  <option value="Casual Meeting">Casual Meeting / Coffee Chat</option>
                  <option value="Vendor / Partner Sync">Vendor / Partner Sync</option>
                  <option value="Other">Other Event</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location *
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as MeetingLocation)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting URL / Video Link
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                />
              </div>
            )}

            {/* Date & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  Start Time *
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="e.g. 11:00 AM"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time *
                </label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="e.g. 12:00 PM"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                  required
                />
              </div>
            </div>

            {/* Assigned Host */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Host / Assigned Employee *
              </label>
              <EmployeeSelect
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                placeholder="Select Host / Assigned Employee"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              />
            </div>

            {/* Agenda / Description */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agenda & Topics to Discuss
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline presentation structure, attendees, and key goals..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              />
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="flex-shrink-0 px-6 py-3.5 bg-slate-50/90 dark:bg-slate-950/60 backdrop-blur-xs border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4d3fa5] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal Before Saving / Scheduling */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm & Schedule Meeting"
        message={`Are you sure you want to schedule this ${meetingType} ${selectedLead ? `with ${selectedLead.company.name}` : `(${customCompany.trim() || 'Internal / Casual'})`
          }?`}
        confirmLabel="Confirm & Schedule"
        cancelLabel="Review Details"
        variant="primary"
        iconType="save"
        itemDetails={[
          {
            label: selectedLead ? 'Client / Company' : 'Organization / Entity',
            value: selectedLead?.company.name || customCompany.trim() || 'Internal / Casual Event',
          },
          {
            label: selectedLead ? 'Contact Person' : 'Attendee / Participant',
            value: selectedLead?.contact.name || customContact.trim() || assignedEmployee || 'Internal Team',
          },
          { label: 'Meeting Title', value: title },
          { label: 'Meeting Type', value: meetingType },
          { label: 'Date & Time', value: `${date} (${startTime} - ${endTime})` },
          { label: 'Location / Format', value: location },
          { label: 'Assigned Host', value: assignedEmployee || 'Unassigned' },
        ]}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
