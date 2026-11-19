import React, { useState, useEffect } from 'react';
import {
  X,
  BellRing,
  Check,
  Plus,
  Trash2,
  Mail,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  Users,
  Send,
  Sparkles,
  User,
  Phone,
  Building2,
} from 'lucide-react';
import { AttendanceAlertSettings } from '../../types/employees';
import {
  fetchAttendanceAlertSettings,
  updateAttendanceAlertSettings,
  sendTestAlertEmail,
} from '../../services/attendanceService';

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
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [maxLates, setMaxLates] = useState<number>(4);
  const [superAdminEmail, setSuperAdminEmail] = useState<string>('kunalpatil192001@gmail.com');
  const [extraRecipients, setExtraRecipients] = useState<string[]>([]);
  const [newRecipientInput, setNewRecipientInput] = useState<string>('');
  const [hrName, setHrName] = useState<string>('HR Department');
  const [hrEmail, setHrEmail] = useState<string>('hr@technokraftservices.com');
  const [hrPhone, setHrPhone] = useState<string>('+91 98765 43210');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  // Load existing settings when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setInputError(null);
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
      })
      .catch((err) => {
        console.error('[AttendanceAlertSettings] Load failed:', err);
        setError('Could not load current settings. You can still modify and save.');
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddRecipient = () => {
    setInputError(null);
    const email = newRecipientInput.trim().toLowerCase();
    if (!email) return;

    // Simple email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setInputError('Please enter a valid email address.');
      return;
    }

    if (extraRecipients.includes(email) || email === superAdminEmail.toLowerCase()) {
      setInputError('This email is already in the recipient or CC list.');
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
    setError(null);
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
      };

      const saved = await updateAttendanceAlertSettings(payload);
      onSaved?.(saved);
      onClose();
    } catch (err: any) {
      console.error('[AttendanceAlertSettings] Save error:', err);
      setError(err?.message || 'Failed to save attendance alert settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestFeedback(null);
    setError(null);
    setIsSendingTest(true);
    try {
      const target = superAdminEmail.trim() || 'kunalpatil192001@gmail.com';
      const res = await sendTestAlertEmail(target);
      setTestFeedback({ success: true, message: res.message || `Test late email sent to ${target}` });
    } catch (err: any) {
      console.error('[AttendanceAlertSettings] Test email error:', err);
      setTestFeedback({ success: false, message: err?.message || 'Failed to send test email via SMTP.' });
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
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

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

              {inputError && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {inputError}
                </p>
              )}

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

            {/* Template Summary Cards */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Active Email Disciplinary Templates
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="font-bold text-slate-800 dark:text-slate-200">1. Daily Late Notice</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Fires on late punch. Shows shift start, recorded time & monthly ratio.</div>
                </div>
                <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
                  <div className="font-bold text-amber-800 dark:text-amber-300">2. 4th Late Escalation</div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">Warning of termination when limit {maxLates} reached. 24h explanation required.</div>
                </div>
                <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
                  <div className="font-bold text-rose-800 dark:text-rose-300">3. Official Termination</div>
                  <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5">Triggered via Employee directory action button with custom reason & exit checklist.</div>
                </div>
              </div>
            </div>
          </div>

          {testFeedback && (
            <div
              className={`mx-6 mb-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testFeedback.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {testFeedback.success ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span className="flex-1">{testFeedback.message}</span>
            </div>
          )}

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
    </div>
  );
};
