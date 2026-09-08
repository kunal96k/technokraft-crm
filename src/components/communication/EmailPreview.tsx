import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Building,
  User,
  Calendar,
  Clock,
  Paperclip,
  Reply,
  Forward,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  CalendarPlus,
  Download,
  AlertCircle,
} from 'lucide-react';
import { EmailRecord } from '../../types/communication';
import { CommunicationStatusBadge } from './CommunicationStatusBadge';

interface EmailPreviewProps {
  email: EmailRecord | null;
  onBackMobile?: () => void;
  onReply?: (email: EmailRecord) => void;
  onResend?: (email: EmailRecord) => void;
  className?: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  email,
  onBackMobile,
  onReply,
  onResend,
  className = '',
}) => {
  const navigate = useNavigate();

  if (!email) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 ${className}`}>
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700 mb-1">No Email Selected</h4>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Select an email thread from the list on the left to review communication details and recipient responses.
        </p>
      </div>
    );
  }

  const { tracking } = email;

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs ${className}`}>
      {/* Top Header Bar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {onBackMobile && (
            <button
              type="button"
              onClick={onBackMobile}
              className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Back to email list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {email.subject}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Ref: {email.leadCode}</span>
              <span>•</span>
              <span className="truncate">{email.companyName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <CommunicationStatusBadge status={email.status} type="email" />

          {/* View Lead Button */}
          <button
            type="button"
            onClick={() => navigate(`/leads/${email.leadId}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title="Open lead details"
          >
            <span>View Lead</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Delivery Tracking Step Bar */}
      <div className="px-4 py-2.5 bg-slate-50/40 border-b border-slate-100 flex items-center justify-between text-[11px] overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-4 sm:gap-6 min-w-max">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                tracking.sent ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
            <span className={tracking.sent ? 'font-semibold text-slate-700' : 'text-slate-400'}>
              Sent {tracking.sent && '✓'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                tracking.delivered ? 'bg-teal-500' : 'bg-slate-300'
              }`}
            />
            <span className={tracking.delivered ? 'font-semibold text-slate-700' : 'text-slate-400'}>
              Delivered {tracking.delivered && '✓'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                tracking.opened ? 'bg-[#5B4DB7]' : 'bg-slate-300'
              }`}
            />
            <span className={tracking.opened ? 'font-semibold text-slate-700' : 'text-slate-400'}>
              Opened {tracking.opened && '✓'}
            </span>
            {tracking.openedAt && (
              <span className="text-[10px] text-slate-400">({tracking.openedAt})</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                tracking.replied ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            />
            <span className={tracking.replied ? 'font-semibold text-slate-700' : 'text-slate-400'}>
              Replied {tracking.replied && '✓'}
            </span>
            {tracking.repliedAt && (
              <span className="text-[10px] text-slate-400">({tracking.repliedAt})</span>
            )}
          </div>
        </div>

        {email.scheduledFor && (
          <div className="text-amber-700 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Scheduled for {email.scheduledFor}</span>
          </div>
        )}
      </div>

      {/* Recipient Details & Sender Box */}
      <div className="p-4 border-b border-slate-100 bg-white space-y-2 text-xs text-slate-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <span className="font-semibold text-slate-800">To: </span>
            <span className="text-slate-900 font-medium">{email.recipientName}</span>
            <span className="text-slate-500"> &lt;{email.recipientEmail}&gt;</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {email.date}, {email.time}
          </div>
        </div>

        {email.cc && email.cc.length > 0 && (
          <div>
            <span className="font-semibold text-slate-700">CC: </span>
            <span className="text-slate-500">{email.cc.join(', ')}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1 text-slate-500">
          <div className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Company: </span>
            <strong className="text-slate-700 font-semibold">{email.companyName}</strong>
          </div>

          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Sent by: </span>
            <strong className="text-slate-700 font-semibold">{email.senderName}</strong>
            <span className="text-slate-400">&lt;{email.senderEmail}&gt;</span>
          </div>
        </div>

        {email.errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>Delivery Error: {email.errorMessage}</span>
          </div>
        )}
      </div>

      {/* Main Email Body */}
      <div className="flex-1 p-5 overflow-y-auto text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
        {email.body}
      </div>

      {/* Attachments Section */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Paperclip className="w-3.5 h-3.5 text-slate-500" />
            <span>Attachments ({email.attachments.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs hover:border-[#5B4DB7]/40 transition-colors"
              >
                <span className="font-medium text-slate-800 truncate max-w-[180px]">
                  {att.name}
                </span>
                <span className="text-[10px] text-slate-400">({att.size})</span>
                <button
                  type="button"
                  onClick={() => alert(`Downloading ${att.name}...`)}
                  className="text-slate-400 hover:text-[#5B4DB7] p-0.5 ml-1"
                  title="Download attachment"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReply?.(email)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          <button
            type="button"
            onClick={() => onReply?.(email)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Forward className="w-3.5 h-3.5" />
            <span>Forward</span>
          </button>

          <button
            type="button"
            onClick={() => onResend?.(email)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Resend</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/follow-ups')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5B4DB7] bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>Schedule Follow-up</span>
        </button>
      </div>
    </div>
  );
};
