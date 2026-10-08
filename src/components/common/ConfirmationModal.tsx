import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Trash2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  X,
  Loader2,
  CalendarX,
  Save,
} from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'warning' | 'primary' | 'success';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  iconType?: 'trash' | 'cancel-meeting' | 'warning' | 'save' | 'check';
  itemDetails?: {
    label?: string;
    value?: string;
  }[];
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  variant = 'danger',
  iconType,
  itemDetails,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const finalConfirmLabel = confirmLabel || confirmText || 'Confirm';
  const finalCancelLabel = cancelLabel || cancelText || 'Cancel';
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  // Determine icon & colors based on variant & iconType
  const renderIcon = () => {
    if (iconType === 'trash') {
      return <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
    if (iconType === 'cancel-meeting') {
      return <CalendarX className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
    if (iconType === 'save') {
      return <Save className="w-5 h-5 text-[#5B4DB7] dark:text-purple-400" />;
    }
    if (iconType === 'check') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }

    switch (variant) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'primary':
      default:
        return <HelpCircle className="w-5 h-5 text-[#5B4DB7] dark:text-purple-400" />;
    }
  };

  const getIconWrapperClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-100 dark:bg-red-950/60 border-red-200 dark:border-red-900/60';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/60';
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60';
      case 'primary':
      default:
        return 'bg-purple-100 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900/60';
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20';
      case 'primary':
      default:
        return 'bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white shadow-purple-500/20';
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getIconWrapperClasses()}`}
            >
              {renderIcon()}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h3
                id="confirm-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white leading-tight"
              >
                {title}
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {typeof message === 'string' ? <p>{message}</p> : message}
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Optional item details list */}
          {itemDetails && itemDetails.length > 0 && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
              {itemDetails.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{detail.label}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-right truncate max-w-[200px]">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {finalCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 ${getConfirmButtonClasses()}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{finalConfirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
