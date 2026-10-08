import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Sparkles,
  X,
  TrendingUp,
} from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'stage';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  stageName?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    stage: (stageName: string, leadCodeOrDetails?: string, duration?: number) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9) + Date.now();
      const newToast: ToastItem = { ...item, id };
      const duration = item.duration ?? (item.type === 'stage' ? 4500 : 3800);

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const toastHelpers = {
    success: (message: string, title: string = 'Success', duration?: number) =>
      showToast({ type: 'success', title, message, duration }),
    error: (message: string, title: string = 'Error', duration?: number) =>
      showToast({ type: 'error', title, message, duration }),
    info: (message: string, title: string = 'Information', duration?: number) =>
      showToast({ type: 'info', title, message, duration }),
    warning: (message: string, title: string = 'Warning', duration?: number) =>
      showToast({ type: 'warning', title, message, duration }),
    stage: (stageName: string, leadCodeOrDetails?: string, duration?: number) =>
      showToast({
        type: 'stage',
        title: `Lead stage updated to ${stageName}`,
        message: leadCodeOrDetails
          ? `${leadCodeOrDetails} successfully transitioned to ${stageName} stage.`
          : `Pipeline status updated to ${stageName} and logged to timeline.`,
        stageName,
        duration,
      }),
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, toast: toastHelpers }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismissToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Internal Toast Card Component with rich styling for both light and dark themes
const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const getStyles = () => {
    switch (toast.type) {
      case 'stage':
        return {
          cardBg:
            'bg-white/95 dark:bg-gradient-to-r dark:from-purple-950/90 dark:via-slate-900/95 dark:to-slate-900/95 text-slate-900 dark:text-white border-purple-300 dark:border-purple-500/40 shadow-xl shadow-purple-500/10',
          iconBg:
            'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-400/30',
          barColor:
            'bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500',
          titleColor: 'text-purple-950 dark:text-purple-200 font-bold',
          badgeStyle:
            'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/30 dark:text-purple-200 dark:border-purple-400/40',
          icon: <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-300 animate-pulse" />,
        };
      case 'success':
        return {
          cardBg:
            'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border-emerald-300 dark:border-emerald-500/30 shadow-xl shadow-emerald-500/10',
          iconBg:
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60',
          barColor: 'bg-emerald-500',
          titleColor: 'text-emerald-950 dark:text-emerald-300 font-bold',
          badgeStyle:
            'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/30 dark:text-emerald-200 dark:border-emerald-400/40',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        };
      case 'error':
        return {
          cardBg:
            'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border-rose-300 dark:border-rose-500/30 shadow-xl shadow-rose-500/10',
          iconBg:
            'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60',
          barColor: 'bg-rose-500',
          titleColor: 'text-rose-950 dark:text-rose-300 font-bold',
          badgeStyle:
            'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/30 dark:text-rose-200 dark:border-rose-400/40',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
        };
      case 'warning':
        return {
          cardBg:
            'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border-amber-300 dark:border-amber-500/30 shadow-xl shadow-amber-500/10',
          iconBg:
            'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60',
          barColor: 'bg-amber-500',
          titleColor: 'text-amber-950 dark:text-amber-300 font-bold',
          badgeStyle:
            'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/30 dark:text-amber-200 dark:border-amber-400/40',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        };
      case 'info':
      default:
        return {
          cardBg:
            'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 border-blue-300 dark:border-blue-500/30 shadow-xl shadow-blue-500/10',
          iconBg:
            'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60',
          barColor: 'bg-blue-500',
          titleColor: 'text-blue-950 dark:text-blue-300 font-bold',
          badgeStyle:
            'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/30 dark:text-blue-200 dark:border-blue-400/40',
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        };
    }
  };

  const style = getStyles();

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden backdrop-blur-md rounded-xl border shadow-xl transition-all duration-300 p-3.5 flex items-start gap-3 animate-in slide-in-from-top-3 fade-in duration-200 ${style.cardBg}`}
    >
      {/* Leading Icon */}
      <div className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center ${style.iconBg}`}>
        {style.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        {toast.title && (
          <div className="flex items-center gap-1.5 mb-0.5">
            {toast.type === 'stage' && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border ${style.badgeStyle}`}
              >
                <TrendingUp className="w-3 h-3 inline" /> STAGE
              </span>
            )}
            <h4 className={`text-xs ${style.titleColor} truncate`}>{toast.title}</h4>
          </div>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words font-medium">
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full ${style.barColor} animate-[toast-progress_4s_linear_forwards]`}
          style={{
            animationDuration: `${toast.duration ?? (toast.type === 'stage' ? 4500 : 3800)}ms`,
          }}
        />
      </div>
    </div>
  );
};
