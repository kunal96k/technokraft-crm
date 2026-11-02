import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render exception:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[340px] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {this.props.fallbackTitle || 'Something went wrong while rendering this view'}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              {this.props.fallbackMessage ||
                'A temporary display error occurred. You can retry rendering or navigate back to the dashboard safely.'}
            </p>

            {this.state.error && (
              <details className="text-left text-[11px] bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 mb-5 text-rose-600 dark:text-rose-400 font-mono overflow-auto max-h-36">
                <summary className="cursor-pointer font-sans font-bold text-slate-700 dark:text-slate-300 select-none mb-1">
                  Technical Details
                </summary>
                <p className="font-semibold">{this.state.error.toString()}</p>
              </details>
            )}

            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <span>Reload Page</span>
              </button>

              <a
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

