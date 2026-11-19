import React, { useState, useEffect } from 'react';
import {
  X,
  BellRing,
  Check,
  Plus,
  Trash2,
  Mail,
  ShieldAlert,
  ShieldOff,
  UserCheck,
  UserX,
  HelpCircle,
  Users,
  Send,
  Sparkles,
  User,
  Phone,
  Building2,
  Eye,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { Employee, AttendanceAlertSettings } from '../../types/employees';
import {
  fetchAttendanceAlertSettings,
  updateAttendanceAlertSettings,
  sendTestAlertEmail,
} from '../../services/attendanceService';
import { EmployeeSelect } from '../common/EmployeeSelect';
import { EmployeeAvatar } from '../common/EmployeeAvatar';
import { useActiveEmployees } from '../../hooks/useActiveEmployees';
import { useToast } from '../../context/ToastContext';
import {
  buildDailyLateNoticeEmailHtml,
  buildTerminationWarningEmailHtml,
  buildOfficialTerminationEmailHtml,
} from '../../utils/disciplinaryEmailTemplates';

interface AttendanceAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: AttendanceAlertSettings) => void;
}

export const AttendanceAlertSettingsModal: React.FC<AttendanceAlertSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const { toast } = useToast();
  // Hook guaranteeing only active, non-deleted employees are retrieved
  const { employees: activeEmployees } = useActiveEmployees();

  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [maxLates, setMaxLates] = useState<number>(4);
  const [superAdminEmail, setSuperAdminEmail] = useState<string>('kunalpatil192001@gmail.com');
  const [extraRecipients, setExtraRecipients] = useState<string[]>([]);
  const [newRecipientInput, setNewRecipientInput] = useState<string>('');
  const [hrName, setHrName] = useState<string>('HR Department');
  const [hrEmail, setHrEmail] = useState<string>('hr@technokraftservices.com');
  const [hrPhone, setHrPhone] = useState<string>('+91 98765 43210');

  // Exclusion Rules State (Skip automated late emails)
  const [excludedRoles, setExcludedRoles] = useState<string[]>(['System Administrator']);
  const [newRoleInput, setNewRoleInput] = useState<string>('');
  const [excludedEmployeeIds, setExcludedEmployeeIds] = useState<string[]>([]);
  const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState<Employee | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const [previewTemplate, setPreviewTemplate] = useState<'late' | 'warning' | 'termination' | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile');

  const getPreviewHtml = (): string => {
    const hrContact = {
      hrName: hrName.trim() || 'HR Department',
      hrEmail: hrEmail.trim() || 'hr@technokraftservices.com',
      hrPhone: hrPhone.trim() || '+91 98765 43210',
    };

    if (previewTemplate === 'late') {
      return buildDailyLateNoticeEmailHtml(
        {
          name: 'Amol Patil',
          employeeCode: 'EMP-0062',
          role: 'Sales Executive',
          department: 'Sales',
          email: 'amol.patil@technokraftservices.com',
        },
        {
          date: new Date().toLocaleDateString('en-GB'),
          loginTime: '10:45 AM',
          shiftStartTime: '10:00 AM',
          shiftEndTime: '07:00 PM',
        },
        1,
        Math.max(1, maxLates),
        hrContact
      );
    }

    if (previewTemplate === 'warning') {
      return buildTerminationWarningEmailHtml(
        {
          name: 'Amol Patil',
          employeeCode: 'EMP-0062',
          role: 'Sales Executive',
          employmentType: 'Full-Time',
          department: 'Sales',
          email: 'amol.patil@technokraftservices.com',
        },
        {
          date: new Date().toLocaleDateString('en-GB'),
          loginTime: '10:52 AM',
        },
        Math.max(1, maxLates),
        Math.max(1, maxLates),
        'Repeated tardiness past grace period without prior written approval from reporting head.',
        hrContact
      );
    }

    if (previewTemplate === 'termination') {
      return buildOfficialTerminationEmailHtml(
        {
          name: 'Amol Patil',
          employeeCode: 'EMP-0062',
          role: 'Sales Executive',
          department: 'Sales',
          email: 'amol.patil@technokraftservices.com',
        },
        'Unsatisfactory attendance compliance following final written warning notice.',
        new Date().toLocaleDateString('en-GB'),
        'Please return your company laptop, biometric RFID card, and deliver sprint handover to Project Lead by 5:00 PM.',
        hrContact
      );
    }

    return '';
  };

  // Load existing settings when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);

    fetchAttendanceAlertSettings()
      .then((settings) => {
        setIsEnabled(Boolean(settings.isAutoEmailEnabled));
        setMaxLates(settings.maxLatesPerMonth ?? 4);
        setSuperAdminEmail(settings.superAdminEmail || 'kunalpatil192001@gmail.com');
        setExtraRecipients(settings.extraRecipientsList || []);
        setHrName(settings.hrName || 'HR Department');
        setHrEmail(settings.hrEmail || 'hr@technokraftservices.com');
        setHrPhone(settings.hrPhone || '+91 98765 43210');

        // Populate Excluded Roles (Defaults to System Administrator)
        if (settings.excludedRolesList && settings.excludedRolesList.length > 0) {
          setExcludedRoles(settings.excludedRolesList);
        } else if (settings.excludedRoles && settings.excludedRoles.trim()) {
          setExcludedRoles(
            settings.excludedRoles
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          );
        } else {
          setExcludedRoles(['System Administrator']);
        }

        // Populate Excluded Employee IDs
        if (settings.excludedEmployeeIdsList && settings.excludedEmployeeIdsList.length > 0) {
          setExcludedEmployeeIds(settings.excludedEmployeeIdsList);
        } else if (settings.excludedEmployeeIds && settings.excludedEmployeeIds.trim()) {
          setExcludedEmployeeIds(
            settings.excludedEmployeeIds
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          );
        } else {
          setExcludedEmployeeIds([]);
        }
      })
      .catch((err) => {
        console.error('[AttendanceAlertSettings] Load failed:', err);
        toast.warning('Could not load current settings from server. You can still modify and save.', 'Load Warning');
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddExcludedRole = () => {
    const role = newRoleInput.trim();
    if (!role) return;

    if (excludedRoles.some((r) => r.toLowerCase() === role.toLowerCase())) {
      toast.warning(`Role "${role}" is already in the exclusion list.`, 'Duplicate Role');
      return;
    }

    setExcludedRoles([...excludedRoles, role]);
    setNewRoleInput('');
  };

  const handleRemoveExcludedRole = (roleToRemove: string) => {
    setExcludedRoles(excludedRoles.filter((r) => r.toLowerCase() !== roleToRemove.toLowerCase()));
  };

  const handleAddExcludedEmployee = () => {
    if (!selectedEmployeeToAdd || !selectedEmployeeToAdd.id) {
      toast.warning('Please search and select an active employee first.', 'Selection Required');
      return;
    }

    const empIdStr = String(selectedEmployeeToAdd.id);
    const empCodeStr = selectedEmployeeToAdd.employeeCode?.trim();

    if (
      excludedEmployeeIds.some(
        (id) => String(id) === empIdStr || (empCodeStr && id.toLowerCase() === empCodeStr.toLowerCase())
      )
    ) {
      toast.warning(`"${selectedEmployeeToAdd.name}" is already in the exclusion list.`, 'Already Excluded');
      return;
    }

    setExcludedEmployeeIds([...excludedEmployeeIds, empIdStr]);
    setSelectedEmployeeToAdd(null);
    toast.success(`Exempted "${selectedEmployeeToAdd.name}" from automated late emails.`, 'Employee Added');
  };

  const handleRemoveExcludedEmployee = (idToRemove: string) => {
    setExcludedEmployeeIds(excludedEmployeeIds.filter((id) => String(id) !== String(idToRemove)));
  };

  const handleAddRecipient = () => {
    const email = newRecipientInput.trim().toLowerCase();
    if (!email) return;

    // Simple email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning('Please enter a valid email address.', 'Invalid Email');
      return;
    }

    if (extraRecipients.includes(email) || email === superAdminEmail.toLowerCase()) {
      toast.warning('This email is already in the recipient or CC list.', 'Duplicate Email');
      return;
    }

    setExtraRecipients([...extraRecipients, email]);
    setNewRecipientInput('');
  };

  const handleRemoveRecipient = (emailToRemove: string) => {
    setExtraRecipients(extraRecipients.filter((email) => email !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: Partial<AttendanceAlertSettings> = {
        isAutoEmailEnabled: isEnabled,
        maxLatesPerMonth: Math.max(1, maxLates),
        superAdminEmail: superAdminEmail.trim() || 'kunalpatil192001@gmail.com',
        extraRecipientsList: extraRecipients,
        hrName: hrName.trim() || 'HR Department',
        hrEmail: hrEmail.trim() || 'hr@technokraftservices.com',
        hrPhone: hrPhone.trim() || '+91 98765 43210',
        excludedRoles: excludedRoles.join(','),
        excludedRolesList: excludedRoles,
        excludedEmployeeIds: excludedEmployeeIds.join(','),
        excludedEmployeeIdsList: excludedEmployeeIds,
      };

      const saved = await updateAttendanceAlertSettings(payload);
      toast.success('Attendance alert rules, exclusions & contact details saved successfully.', 'Rules Saved');
      onSaved?.(saved);
      onClose();
    } catch (err: any) {
      console.error('[AttendanceAlertSettings] Save error:', err);
      toast.error(err?.message || 'Failed to save attendance alert settings.', 'Save Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    try {
      const target = superAdminEmail.trim() || 'kunalpatil192001@gmail.com';
      const res = await sendTestAlertEmail(target);
      toast.success(res.message || `Test late email dispatched to ${target}`, 'Test Email Sent');
    } catch (err: any) {
      console.error('[AttendanceAlertSettings] Test email error:', err);
      toast.error(err?.message || 'Failed to send test email via SMTP server.', 'Email Delivery Failed');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Attendance Late & Disciplinary Alert Rules
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure automated late punch notices, 4th late termination warnings & CC recipients
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
            {/* 1. Master Toggle Switch */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Automated Late Warning Emails
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isEnabled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  When enabled, employees & interns automatically receive daily late intimation notices upon punch-in, and an automated Warning of Termination when monthly limit is reached.
                </p>
              </div>

              {/* Toggle switch input */}
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] ${
                  isEnabled ? 'bg-[#5B4DB7]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2. Monthly Late Threshold Setting */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  Monthly Late Allowance Threshold
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                  Default: 4 per calendar month
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={maxLates}
                  onChange={(e) => setMaxLates(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
                <span className="text-slate-600 dark:text-slate-400 text-xs">
                  lates in a month triggers <strong>Notice of Warning of Termination</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Lates #1 through #{maxLates - 1} send the <strong>Daily Late Notice</strong>. On the #{maxLates} late mark, <strong>Template 2: Warning of Termination</strong> is automatically escalated.
              </p>
            </div>

            {/* 3. Automated Late Email Exclusion Rules (Skip automated late notice emails) */}
            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200/90 dark:border-purple-800/60 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#5B4DB7]/10 dark:bg-purple-900/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
                    <ShieldOff className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      Late Email Exclusion Rules
                    </span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold ml-2">
                      (Skip Automated Late Notices)
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Employees matching the exempt <strong>Designations / Roles</strong> below, or individually added staff members, will be <strong>skipped</strong> from receiving automated late punch emails.
              </p>

              {/* A. Role / Designation Exclusions (Prefilled with System Administrator) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Exempt Designations / Roles</span>
                  <span className="text-[10px] text-[#5B4DB7] dark:text-purple-300 font-semibold">
                    Prefilled Default: System Administrator
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRoleInput}
                    onChange={(e) => setNewRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddExcludedRole();
                      }
                    }}
                    placeholder="Enter designation / role (e.g. System Administrator, Director)"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                  <button
                    type="button"
                    onClick={handleAddExcludedRole}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#5B4DB7] hover:bg-[#4d409e] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>

                {/* Excluded Roles Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px] p-2 bg-white/70 dark:bg-slate-900/40 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  {excludedRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[#5B4DB7] dark:text-purple-300 rounded-lg text-xs font-semibold shadow-2xs"
                    >
                      <ShieldOff className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExcludedRole(role)}
                        className="text-slate-400 hover:text-rose-500 rounded p-0.5 transition-colors cursor-pointer"
                        title="Remove role from exclusion"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {excludedRoles.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">No roles excluded. Enter a role name above to exclude.</span>
                  )}
                </div>
              </div>

              {/* B. Specific Employee Exclusions with Typeahead Search (Only Active Employees) */}
              <div className="space-y-2 pt-2.5 border-t border-purple-200/60 dark:border-purple-900/40">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Exempt Specific Active Employees</span>
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {excludedEmployeeIds.length} Active Employee(s) Exempted
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Search and type ahead to select active employees (only active staff are listed; inactive/suspended accounts are excluded).
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <EmployeeSelect
                      value={selectedEmployeeToAdd ? String(selectedEmployeeToAdd.id) : ''}
                      valueField="id"
                      onSelectEmployee={(emp) => setSelectedEmployeeToAdd(emp)}
                      placeholder="Type ahead to search active employees by name, code, or role..."
                      showCodeInLabel={true}
                      showRoleInLabel={true}
                      allowEmpty={true}
                      showAllOption="-- Select an active employee --"
                      align="full"
                      className="w-full text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExcludedEmployee}
                    disabled={!selectedEmployeeToAdd}
                    className="inline-flex items-center gap-1 px-3.5 py-2.5 bg-[#5B4DB7] hover:bg-[#4d409e] text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-xs"
                    title={selectedEmployeeToAdd ? `Add ${selectedEmployeeToAdd.name}` : 'Select an employee to add'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Employee</span>
                  </button>
                </div>

                {/* Excluded Employees Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1 min-h-[36px] p-2 bg-white/80 dark:bg-slate-900/40 rounded-xl border border-purple-100 dark:border-purple-900/30">
                  {excludedEmployeeIds.map((empId) => {
                    const matchedEmp = activeEmployees.find(
                      (e) =>
                        String(e.id) === String(empId) ||
                        (e.employeeCode && e.employeeCode.toLowerCase() === empId.toLowerCase())
                    );
                    const displayName = matchedEmp
                      ? `${matchedEmp.name} (${matchedEmp.employeeCode || `ID:${empId}`})`
                      : `Employee ID: ${empId}`;
                    const displayRole = matchedEmp?.role || matchedEmp?.department || '';

                    return (
                      <span
                        key={empId}
                        className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium shadow-2xs group"
                      >
                        {matchedEmp ? (
                          <EmployeeAvatar employee={matchedEmp} size="xs" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        <div className="flex flex-col text-left">
                          <span className="font-semibold leading-tight">{displayName}</span>
                          {displayRole && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                              {displayRole}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExcludedEmployee(empId)}
                          className="text-slate-400 hover:text-rose-500 rounded p-1 transition-colors cursor-pointer ml-1"
                          title="Remove employee from exclusion"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  {excludedEmployeeIds.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic py-1 px-1">
                      No specific employees exempted. Use the typeahead search above to add active staff members.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Primary Super Admin Recipient */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#5B4DB7]" />
                Primary Super Administrator Recipient
              </label>
              <input
                type="email"
                value={superAdminEmail}
                onChange={(e) => setSuperAdminEmail(e.target.value)}
                placeholder="kunalpatil192001@gmail.com"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Always receives carbon-copy (CC) of all automated late notices and termination warnings.
              </p>
            </div>

            {/* 4. Dynamic Extra People / CC Recipients */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  Additional CC Notification Recipients
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {extraRecipients.length} Person(s) Added
                </span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                Add HR managers, college coordinators, or team leads to be dynamically copied on all late & termination emails.
              </p>

              {/* Add Input & Button */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newRecipientInput}
                  onChange={(e) => setNewRecipientInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. hr@technokraftservices.com"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
                <button
                  type="button"
                  onClick={handleAddRecipient}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-[#5B4DB7] dark:text-purple-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Person</span>
                </button>
              </div>

              {/* Tag Chips for Added Recipients */}
              <div className="mt-3 flex flex-wrap gap-2 min-h-[36px] p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                {extraRecipients.length === 0 ? (
                  <span className="text-[11px] text-slate-400 italic flex items-center gap-1.5 py-0.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    No additional CC recipients configured. Enter an email above and click Add Person.
                  </span>
                ) : (
                  extraRecipients.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium shadow-2xs group"
                    >
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-slate-400 hover:text-rose-500 rounded p-0.5 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 5. HR Department Contact Desk (Used in all Email Templates) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                HR Department Contact Details (Included in All Email Templates)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                These contact details are automatically formatted into the assistance & regularization card in all 3 disciplinary email templates.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#5B4DB7]" />
                    HR Coordinator / Name
                  </label>
                  <input
                    type="text"
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                    placeholder="e.g. HR Department"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#5B4DB7]" />
                    HR Official Email
                  </label>
                  <input
                    type="email"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    placeholder="e.g. hr@technokraftservices.com"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#5B4DB7]" />
                    HR Contact No. / Helpline
                  </label>
                  <input
                    type="text"
                    value={hrPhone}
                    onChange={(e) => setHrPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>
              </div>
            </div>

            {/* Template Summary Cards with Interactive Live Previews */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Active Disciplinary Email Templates
                </span>
                <span className="text-[10px] text-slate-400">Click card to preview live layout</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div
                  onClick={() => setPreviewTemplate('late')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-[#5B4DB7]/60 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">1. Daily Late Notice</div>
                    <span className="text-[10px] text-[#5B4DB7] dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> Preview
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Fires on late punch. Shows shift start, recorded time & monthly ratio.</div>
                </div>

                <div
                  onClick={() => setPreviewTemplate('warning')}
                  className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="font-bold text-amber-800 dark:text-amber-300">2. 4th Late Escalation</div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold group-hover:underline flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> Preview
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">Warning of termination when limit {maxLates} reached. 24h explanation required.</div>
                </div>

                <div
                  onClick={() => setPreviewTemplate('termination')}
                  className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="font-bold text-rose-800 dark:text-rose-300">3. Official Termination</div>
                    <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold group-hover:underline flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> Preview
                    </span>
                  </div>
                  <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5">Triggered via Employee directory action button with custom reason & exit checklist.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed Pinned Actions */}
          <div className="flex-shrink-0 px-6 py-3.5 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTest || isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl transition-colors border border-purple-200 dark:border-purple-800 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTest ? 'Sending Test...' : 'Send Test Alert Email'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Saving Rules...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Interactive Email Template Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white dark:bg-[#0F172A] w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh] max-h-[850px] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Device Switcher + Close */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {previewTemplate === 'late'
                      ? 'Template 1: Daily Late Punch-in Intimation'
                      : previewTemplate === 'warning'
                      ? 'Template 2: Notice of Warning of Termination (4th Late)'
                      : 'Template 3: Official Notice of Termination'}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Live HTML preview styled with TechnoKraft brand identity &amp; mobile responsiveness
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewport switch: Mobile vs Desktop */}
                <div className="flex items-center p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (380px)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop (620px)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live Preview Container */}
            <div className="flex-1 bg-slate-100 dark:bg-[#070D18] p-4 overflow-y-auto flex items-start justify-center">
              <div
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 w-full ${
                  previewDevice === 'mobile' ? 'max-w-[400px]' : 'max-w-[640px]'
                }`}
              >
                <div
                  className="email-preview-frame"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              </div>
            </div>

            {/* Preview Footer note */}
            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <span>Dynamic HR Desk: <strong>{hrName}</strong> &bull; {hrEmail} &bull; {hrPhone}</span>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors cursor-pointer text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
