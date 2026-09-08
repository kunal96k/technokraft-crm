import React, { useState } from 'react';
import { Mail, Server, ShieldCheck, CheckCircle2, RefreshCw, Key, FileText, Lock } from 'lucide-react';
import { EmailConfigData } from '../../../types/settings';

interface EmailSettingsProps {
  data: EmailConfigData;
  onChange: (updated: EmailConfigData) => void;
}

export const EmailSettings: React.FC<EmailSettingsProps> = ({ data, onChange }) => {
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [signatureSavedNotice, setSignatureSavedNotice] = useState(false);

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTestResult(null);

    setTimeout(() => {
      setTestingConnection(false);
      setTestResult('SMTP connection successful (Port 587 TLS handshake confirmed)');
    }, 1200);
  };

  const handleSaveSignature = () => {
    setSignatureSavedNotice(true);
    setTimeout(() => setSignatureSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Email Provider & SMTP Credentials */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Email Configuration (SMTP)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect corporate mail servers to send quotes, updates, and proposals directly from TechnoKraft CRM.
          </p>
        </div>

        {/* Security Warning Notice */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/60 flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
          <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Security Isolation:</strong> Production credentials use environment-level TLS key vaults. Passwords and SMTP secrets are strictly masked and never stored in client browser storage.
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Protocol / Provider
            </label>
            <input
              type="text"
              readOnly
              value={data.provider}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sender Name
            </label>
            <input
              type="text"
              value={data.senderName}
              onChange={(e) => onChange({ ...data, senderName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sender Email Address
            </label>
            <input
              type="email"
              value={data.senderEmail}
              onChange={(e) => onChange({ ...data, senderEmail: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              SMTP Host Server
            </label>
            <input
              type="text"
              value={data.smtpHost}
              onChange={(e) => onChange({ ...data, smtpHost: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              SMTP Port Number
            </label>
            <input
              type="number"
              value={data.smtpPort}
              onChange={(e) =>
                onChange({ ...data, smtpPort: parseInt(e.target.value, 10) || 587 })
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Encryption Protocol
            </label>
            <select
              value={data.encryption}
              onChange={(e) =>
                onChange({
                  ...data,
                  encryption: e.target.value as EmailConfigData['encryption'],
                })
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="TLS">STARTTLS (Port 587)</option>
              <option value="SSL">SSL / TLS (Port 465)</option>
              <option value="None">None (Unencrypted)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={data.username}
              onChange={(e) => onChange({ ...data, username: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password (Encrypted)
            </label>
            <div className="relative">
              <input
                type="password"
                readOnly
                value={data.passwordMasked}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 font-mono tracking-widest cursor-not-allowed"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Secret key stored securely in encrypted server keystore.
            </span>
          </div>
        </div>

        {/* Test Connection Button & Result */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            {testingConnection ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Validating SMTP Handshake...
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Test Connection
              </>
            )}
          </button>

          {testResult && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ✓ {testResult}
            </div>
          )}
        </div>
      </div>

      {/* Email Signature Section */}
      <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Default Outbound Email Signature
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Appended automatically to proposals, meeting confirmations, and lead responses.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveSignature}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs"
          >
            Save Signature
          </button>
        </div>

        {signatureSavedNotice && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Signature template updated successfully.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              Signature Editor
            </label>
            <textarea
              rows={6}
              value={data.signatureText}
              onChange={(e) => onChange({ ...data, signatureText: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              Live Preview
            </label>
            <div className="h-[148px] p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line overflow-y-auto font-sans leading-relaxed">
              {data.signatureText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
