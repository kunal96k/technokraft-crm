import React from 'react';
import { Bell, Mail, AppWindow, Check } from 'lucide-react';
import { NotificationTypePreference } from '../../../types/settings';

interface NotificationSettingsProps {
  notifications: NotificationTypePreference[];
  onChange: (updated: NotificationTypePreference[]) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
  onChange,
}) => {
  const handleToggle = (id: string, channel: 'email' | 'inApp') => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, [channel]: !n[channel] } : n
    );
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Notification Preferences
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Fine-tune event notifications across in-app bell alerts and company email dispatches.
        </p>
      </div>

      {/* Table / Matrix of notifications */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Event Trigger</th>
              <th className="py-3 px-4 text-center w-28">In-App Alert</th>
              <th className="py-3 px-4 text-center w-28">Email Digest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {notifications.map((notif) => (
              <tr key={notif.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {notif.name}
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {notif.description}
                    </p>
                  </div>
                </td>

                {/* In-App Toggle */}
                <td className="py-3 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notif.inApp}
                      onChange={() => handleToggle(notif.id, 'inApp')}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </td>

                {/* Email Toggle */}
                <td className="py-3 px-4 text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notif.email}
                      onChange={() => handleToggle(notif.id, 'email')}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
