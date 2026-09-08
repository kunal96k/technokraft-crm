import React from 'react';
import {
  Plus,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Search,
  Users,
  Bell,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MeetingTable } from '../../components/followups/meetings/MeetingTable';
import { CreateMeetingModal } from '../../components/followups/meetings/CreateMeetingModal';
import { CompleteMeetingModal } from '../../components/followups/meetings/CompleteMeetingModal';
import { MeetingDetailsModal } from '../../components/followups/meetings/MeetingDetailsModal';
import { MOCK_MEETINGS } from '../../data/mockFollowUps';
import {
  MeetingRecord,
  MeetingStatus,
  MeetingType,
  MeetingOutcome,
  FollowUpType,
} from '../../types/followUps';

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = React.useState<MeetingRecord[]>(MOCK_MEETINGS);
  const [activeTab, setActiveTab] = React.useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [completeTarget, setCompleteTarget] = React.useState<MeetingRecord | null>(null);
  const [detailTarget, setDetailTarget] = React.useState<MeetingRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateMeeting = (newMeetingData: Omit<MeetingRecord, 'id'>) => {
    const newMeeting: MeetingRecord = {
      ...newMeetingData,
      id: `mtg-${Date.now()}`,
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    showToast(`Scheduled meeting: "${newMeeting.title}".`);
  };

  const handleCompleteMeeting = (
    meetingId: string,
    outcome: MeetingOutcome,
    outcomeNotes: string,
    nextFollowUp?: {
      type: FollowUpType;
      purpose: string;
      date: string;
      time: string;
      notes?: string;
    }
  ) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              status: 'Completed',
              outcome,
              outcomeNotes,
            }
          : m
      )
    );

    if (nextFollowUp) {
      showToast(
        `Meeting completed and follow-up scheduled for ${nextFollowUp.date}.`
      );
    } else {
      showToast('Meeting outcome recorded.');
    }
  };

  const handleCancelMeeting = (meetingId: string) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, status: 'Cancelled' } : m))
    );
    showToast('Meeting cancelled.');
  };

  // Metrics
  const todayCount = meetings.filter((m) => m.date === '2026-09-07').length;
  const upcomingCount = meetings.filter(
    (m) => m.date > '2026-09-07' && m.status !== 'Completed' && m.status !== 'Cancelled'
  ).length;
  const completedCount = meetings.filter((m) => m.status === 'Completed').length;
  const onlineCount = meetings.filter((m) => m.location === 'Online').length;

  // Filtered
  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'today' && m.date !== '2026-09-07') return false;
    if (activeTab === 'upcoming' && (m.date <= '2026-09-07' || m.status === 'Completed')) return false;
    if (activeTab === 'completed' && m.status !== 'Completed') return false;

    if (typeFilter !== 'ALL' && m.meetingType !== typeFilter) return false;
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCompany = m.companyName.toLowerCase().includes(q);
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchContact = m.contactName.toLowerCase().includes(q);
      const matchHost = m.assignedEmployee.toLowerCase().includes(q);
      if (!matchCompany && !matchTitle && !matchContact && !matchHost) return false;
    }

    return true;
  });

  return (
    <div id="crm-meetings-page" className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-top-2 duration-200">
          <Bell className="w-4 h-4 text-[#5B4DB7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Meetings"
        description="Schedule, conduct, and record client discussions, demos, and minutes of meeting."
        showDateBadge={true}
        actions={
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        }
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Sessions</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{todayCount}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Upcoming</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{upcomingCount}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Video Calls</span>
            <Video className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{onlineCount}</div>
        </div>
      </div>

      {/* Toolbar & Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
          {[
            { key: 'all', label: 'All Meetings' },
            { key: 'today', label: "Today's Schedule" },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-purple-50 text-[#5B4DB7]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter inputs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, agenda, attendee, or host..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Meeting Types</option>
              <option value="Discovery Call">Discovery Call</option>
              <option value="Requirement Discussion">Requirement Discussion</option>
              <option value="Technical Discussion">Technical Discussion</option>
              <option value="Demo">Demo</option>
              <option value="Proposal Discussion">Proposal Discussion</option>
              <option value="Negotiation">Negotiation</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {(typeFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-purple-700 hover:underline text-xs font-semibold px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Table */}
      <MeetingTable
        meetings={filteredMeetings}
        onOpenDetails={setDetailTarget}
        onOpenComplete={setCompleteTarget}
        onCancelMeeting={handleCancelMeeting}
      />

      {/* Modals */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMeeting}
      />

      <CompleteMeetingModal
        isOpen={Boolean(completeTarget)}
        meeting={completeTarget}
        onClose={() => setCompleteTarget(null)}
        onComplete={handleCompleteMeeting}
      />

      <MeetingDetailsModal
        isOpen={Boolean(detailTarget)}
        meeting={detailTarget}
        onClose={() => setDetailTarget(null)}
        onOpenComplete={(m) => {
          setDetailTarget(null);
          setCompleteTarget(m);
        }}
        onCancelMeeting={handleCancelMeeting}
      />
    </div>
  );
};
