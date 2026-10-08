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
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MeetingTable } from '../../components/followups/meetings/MeetingTable';
import { CreateMeetingModal } from '../../components/followups/meetings/CreateMeetingModal';
import { CompleteMeetingModal } from '../../components/followups/meetings/CompleteMeetingModal';
import { MeetingDetailsModal } from '../../components/followups/meetings/MeetingDetailsModal';
import { useAuth } from '../../context/AuthContext';
import { useActiveEmployees } from '../../hooks/useActiveEmployees';
import * as followUpService from '../../services/followUpService';
import {
  MeetingRecord,
  MeetingStatus,
  MeetingType,
  MeetingOutcome,
  MeetingLocation,
  FollowUpType,
  FollowUpRecord,
} from '../../types/followUps';
import { formatDisplayDate, formatISTTime } from '../../utils/dateUtils';

function mapFollowUpToMeeting(fu: FollowUpRecord): MeetingRecord {
  const isCompleted = fu.status === 'COMPLETED';
  const meetingType = (fu.type as MeetingType) || 'Requirement Discussion';
  const location = (fu.meetingLocation as MeetingLocation) || 'Online';

  return {
    id: fu.id,
    leadId: fu.leadId,
    leadCode: fu.leadCode,
    companyName: fu.companyName,
    contactName: fu.contactName,
    contactDesignation: fu.contactDesignation,
    contactPhone: fu.contactPhone,
    contactEmail: fu.contactEmail,
    title: fu.purpose || 'Client Discussion',
    meetingType,
    date: fu.date,
    startTime: formatISTTime(fu.time),
    endTime: '12:00 PM',
    assignedEmployee: fu.assignedTo,
    assignedAvatar: fu.assignedAvatar || fu.assignedTo.substring(0, 2).toUpperCase(),
    location,
    meetingLink: fu.meetingLink,
    description: fu.meetingAgenda || fu.purpose,
    notes: fu.notes,
    status: isCompleted ? 'Completed' : fu.status === 'CANCELLED' ? 'Cancelled' : 'Scheduled',
    outcome: (fu.outcome as MeetingOutcome) || (isCompleted ? 'Positive' : undefined),
    outcomeNotes: fu.completionNotes,
    completedAt: fu.completedAt,
  };
}

export const MeetingsPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const currentUserName = authUser?.name || 'Kunal Patil';
  const { employees: activeEmployees } = useActiveEmployees();

  const [meetings, setMeetings] = React.useState<MeetingRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [scope, setScope] = React.useState<'my' | 'team'>('my');
  const [activeTab, setActiveTab] = React.useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [hostFilter, setHostFilter] = React.useState<string>('ALL');
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

  const loadMeetings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const effectiveAssignee =
        scope === 'my'
          ? currentUserName
          : hostFilter !== 'ALL'
          ? hostFilter
          : undefined;

      const res = await followUpService.fetchFollowUps({
        assignedTo: effectiveAssignee,
        size: 200,
      });
      const raw = res.content || [];
      const mapped = raw.map(mapFollowUpToMeeting);
      setMeetings(mapped);
    } catch (err) {
      console.error('[MeetingsPage] Failed to fetch meetings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [scope, hostFilter, currentUserName]);

  React.useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);


  const handleCreateMeeting = async (newMeetingData: Omit<MeetingRecord, 'id'>) => {
    const created = await followUpService.createFollowUp({
      type: newMeetingData.meetingType || 'Meeting',
      purpose: newMeetingData.title,
      notes: newMeetingData.notes,
      meetingAgenda: newMeetingData.description,
      meetingLink: newMeetingData.meetingLink,
      meetingLocation: newMeetingData.location,
      date: newMeetingData.date,
      time: newMeetingData.startTime,
      assignedTo: newMeetingData.assignedEmployee,
      leadId: newMeetingData.leadId,
      leadCode: newMeetingData.leadCode,
      companyName: newMeetingData.companyName,
      contactName: newMeetingData.contactName,
      contactDesignation: newMeetingData.contactDesignation,
      contactPhone: newMeetingData.contactPhone,
      contactEmail: newMeetingData.contactEmail,
      status: 'PENDING',
    });

    if (created) {
      showToast(`Scheduled meeting: "${newMeetingData.title}".`);
    } else {
      showToast('Meeting scheduled successfully.');
    }
    await loadMeetings();
  };

  const handleCompleteMeeting = async (
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
    await followUpService.completeFollowUp(meetingId, outcomeNotes, outcome);

    if (nextFollowUp) {
      const current = meetings.find((m) => m.id === meetingId);
      await followUpService.createFollowUp({
        type: nextFollowUp.type,
        purpose: nextFollowUp.purpose,
        date: nextFollowUp.date,
        time: nextFollowUp.time,
        notes: nextFollowUp.notes,
        leadId: current?.leadId,
        leadCode: current?.leadCode,
        companyName: current?.companyName,
        contactName: current?.contactName,
        contactPhone: current?.contactPhone,
        contactEmail: current?.contactEmail,
        assignedTo: current?.assignedEmployee,
        status: 'PENDING',
      });
      showToast(`Meeting completed and follow-up scheduled for ${nextFollowUp.date}.`);
    } else {
      showToast('Meeting outcome recorded.');
    }
    await loadMeetings();
  };

  const handleCancelMeeting = async (meetingId: string) => {
    await followUpService.cancelFollowUp(meetingId);
    showToast('Meeting cancelled.');
    await loadMeetings();
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    await followUpService.deleteFollowUp(meetingId);
    showToast('Meeting record deleted permanently.');
    await loadMeetings();
  };

  // Metrics
  const todayStr = 'Today';
  const todayCount = meetings.filter((m) => m.date === todayStr || m.date === new Date().toISOString().split('T')[0]).length;
  const upcomingCount = meetings.filter((m) => m.status === 'Scheduled' || m.status === 'Confirmed').length;
  const completedCount = meetings.filter((m) => m.status === 'Completed').length;
  const onlineCount = meetings.filter((m) => m.location === 'Online').length;

  // Filtered
  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'today' && m.date !== todayStr && m.date !== new Date().toISOString().split('T')[0]) return false;
    if (activeTab === 'upcoming' && m.status === 'Completed') return false;
    if (activeTab === 'completed' && m.status !== 'Completed') return false;

    if (typeFilter !== 'ALL' && m.meetingType !== typeFilter) return false;
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCompany = m.companyName?.toLowerCase().includes(q);
      const matchTitle = m.title?.toLowerCase().includes(q);
      const matchContact = m.contactName?.toLowerCase().includes(q);
      const matchHost = m.assignedEmployee?.toLowerCase().includes(q);
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadMeetings()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Refresh live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Meeting</span>
            </button>
          </div>
        }
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Sessions</span>
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{todayCount}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Upcoming</span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{upcomingCount}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Video Calls</span>
            <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{onlineCount}</div>
        </div>
      </div>

      {/* Toolbar & Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs space-y-3">
        {/* Top Row: Scope switcher & count */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          {/* Scope switch pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => {
                setScope('my');
                setHostFilter('ALL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                scope === 'my'
                  ? 'bg-white dark:bg-slate-900 text-[#5B4DB7] dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
              <span>My Meetings ({currentUserName})</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('team')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                scope === 'team'
                  ? 'bg-white dark:bg-slate-900 text-[#5B4DB7] dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Overall Team</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredMeetings.length} {scope === 'my' ? 'personal' : 'team'} meeting(s)
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter inputs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, agenda, attendee, or host..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* If overall team scope, show host dropdown */}
            {scope === 'team' && (
              <select
                value={hostFilter}
                onChange={(e) => setHostFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">All Hosts</option>
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
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
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {(typeFilter !== 'ALL' || statusFilter !== 'ALL' || hostFilter !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('ALL');
                  setStatusFilter('ALL');
                  setHostFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-purple-700 dark:text-purple-400 hover:underline text-xs font-semibold px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Table or Loading */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin mx-auto mb-2" />
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Loading Live Meetings...</p>
        </div>
      ) : (
        <MeetingTable
          meetings={filteredMeetings}
          onOpenDetails={setDetailTarget}
          onOpenComplete={setCompleteTarget}
          onCancelMeeting={handleCancelMeeting}
          onDeleteMeeting={handleDeleteMeeting}
          onAction={() => setIsCreateModalOpen(true)}
          onResetFilters={() => {
            setTypeFilter('ALL');
            setStatusFilter('ALL');
            setSearchQuery('');
          }}
          hasFilters={typeFilter !== 'ALL' || statusFilter !== 'ALL' || Boolean(searchQuery)}
          tab={activeTab}
        />
      )}

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
        onDeleteMeeting={handleDeleteMeeting}
      />
    </div>
  );
};

