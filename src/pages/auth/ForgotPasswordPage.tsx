import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import * as authService from '../../services/authService';
import {
  KeyRound,
  Mail,
  User,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Sun,
  Moon,
  Copy,
  Check,
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';

export const ForgotPasswordPage: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    resetToken?: string;
    email?: string;
    username?: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const isDark = resolvedTheme === 'Dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrUsername.trim()) {
      const msg = 'Please enter your username or registered corporate email.';
      setErrorMessage(msg);
      toast.warning(msg, 'Required Field');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword({
        emailOrUsername: emailOrUsername.trim(),
      });

      setSuccessData(res);
      toast.success('Password recovery token generated successfully.', 'Recovery Email Sent');
    } catch (err: any) {
      console.error('[ForgotPassword] Error:', err);
      const msg = err.message || 'Failed to generate reset request.';
      setErrorMessage(msg);
      toast.error(msg, 'Request Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (successData?.resetToken) {
      navigator.clipboard.writeText(successData.resetToken);
      setCopiedToken(true);
      toast.info('Reset token copied to clipboard!', 'Copied');
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const handleQuickPreset = (identifier: string) => {
    setEmailOrUsername(identifier);
    setErrorMessage(null);
    toast.info(`Preset applied: ${identifier}`, 'Quick Preset');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-[#5B4DB7]/20 selection:text-[#5B4DB7]">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'Light' : 'Dark')}
          aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Left Column: Visual Showcase & Brand (Desktop >= 1024px) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative overflow-hidden bg-gradient-to-br from-[#1A1045] via-[#2D1B78] to-[#110A30] text-white p-10 xl:p-14 flex-col justify-between select-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="relative z-10">
          <BrandLogo collapsed={false} theme="dark" size="lg" />
        </div>

        {/* Middle Proposition */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Secure Identity & Recovery</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
            Account Recovery & Password Reset
          </h2>

          <p className="text-sm text-purple-100/80 leading-relaxed">
            Follow our verified security protocol to regain access to your TechnoKraft CRM account and personal pipeline workspace.
          </p>

          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2 text-xs text-purple-100/90">
            <div className="flex items-center gap-2 font-semibold text-white">
              <KeyRound className="w-4 h-4 text-[#5B4DB7]" />
              <span>How Password Reset Works</span>
            </div>
            <p className="text-[11px] text-purple-200/70">
              Enter your registered username or email. We generate a cryptographically signed 30-minute recovery token to securely set your new password.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-end text-xs text-purple-200/70 border-t border-white/10 pt-4">
          <span>&copy; {new Date().getFullYear()} TechnoKraft Services LLP</span>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-7">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-start pb-1">
              <BrandLogo collapsed={false} theme={isDark ? 'dark' : 'light'} size="md" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Forgot Password?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                No worries! Enter your username or email address and we'll generate your reset token.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Result View */}
          {successData ? (
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="font-bold text-sm">Recovery Token Generated</h3>
              </div>

              <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
                {successData.message}
              </p>

              {successData.resetToken && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-300 dark:border-emerald-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span>Your Reset Token</span>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="flex items-center gap-1 text-[#5B4DB7] dark:text-purple-300 hover:underline cursor-pointer"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-base font-bold text-purple-700 dark:text-purple-300 tracking-wider">
                    {successData.resetToken}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/reset-password?token=${encodeURIComponent(successData.resetToken || '')}`
                  )
                }
                className="w-full py-2.5 px-4 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Set New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-username"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Username or Corporate Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-username"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. kunall11 or kunalpatil192001@gmail.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] shadow-xs transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 px-4 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Reset Token...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Reset Token</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Presets */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Quick Test Presets
            </span>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickPreset('kunall11')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 font-medium hover:border-purple-400 cursor-pointer text-xs"
              >
                Super Admin (kunall11)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('kunal.patil')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 font-medium hover:border-indigo-400 cursor-pointer text-xs"
              >
                Sales Rep (kunal.patil)
              </button>
            </div>
          </div>

          {/* Back to Login Link */}
          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B4DB7] dark:text-purple-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
