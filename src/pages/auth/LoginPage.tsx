import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  KeyRound,
  ArrowRight,
  Sun,
  Moon,
  Laptop,
  TrendingUp,
  FileText,
  BarChart3,
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login, changePassword, isAuthenticated } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Force Password Reset state
  const [showForceResetModal, setShowForceResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Redirect if already authenticated
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Notify user if session ended due to Indian Time Zone End-of-Day auto-logout
  useEffect(() => {
    const reason = sessionStorage.getItem('tk_crm_logout_reason');
    if (reason === 'eod_auto_logout') {
      sessionStorage.removeItem('tk_crm_logout_reason');
      setErrorMessage('Your session was safely closed because the working day completed (11:59 PM Indian Standard Time). Please sign in again.');
      toast.info('Session auto-logged out at the end of the day (Asia/Kolkata).', 'Daily Auto-Logout');
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim()) {
      const msg = 'Please enter your username or corporate email.';
      setErrorMessage(msg);
      toast.warning(msg, 'Required Field');
      return;
    }
    if (!password) {
      const msg = 'Please enter your account password.';
      setErrorMessage(msg);
      toast.warning(msg, 'Required Field');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({
        usernameOrEmail: usernameOrEmail.trim(),
        password,
        rememberMe,
      });

      if (response.requirePasswordReset) {
        toast.info('Initial login detected. Please set your new secure password.', 'Password Reset Required');
        setShowForceResetModal(true);
      } else {
        toast.success(`Welcome back, ${response.user?.name || 'Super Admin'}! Access granted.`, 'Authentication Successful');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('[LoginPage] Login failed:', err);
      const errMsg = err.message || 'Invalid username or password.';
      setErrorMessage(errMsg);
      toast.error(errMsg, 'Login Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForcePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters.';
      setResetError(msg);
      toast.warning(msg, 'Password Policy');
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setResetError(msg);
      toast.warning(msg, 'Password Mismatch');
      return;
    }

    setIsResetting(true);
    try {
      await changePassword({
        oldPassword: password,
        newPassword,
        confirmPassword,
      });
      setShowForceResetModal(false);
      toast.success('Password updated successfully. Accessing CRM...', 'Password Changed');
      navigate(from, { replace: true });
    } catch (err: any) {
      const errMsg = err.message || 'Failed to update password.';
      setResetError(errMsg);
      toast.error(errMsg, 'Reset Failed');
    } finally {
      setIsResetting(false);
    }
  };

  // Quick Demo Account Click Handlers
  const handleQuickLogin = (user: string, pass: string, roleName: string) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setErrorMessage(null);
    toast.info(`${roleName} credentials filled: ${user}`, 'Quick Preset Applied');
  };

  const isDark = resolvedTheme === 'Dark';

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-[#5B4DB7]/20 selection:text-[#5B4DB7]">
      {/* Mobile Android Top App Bar (< sm) with Brand Logo and Theme Toggle */}
      <div className="sm:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shadow-2xs transition-colors">
        <BrandLogo collapsed={false} theme={isDark ? 'dark' : 'light'} size="sm" />
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'Light' : 'Dark')}
          aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all cursor-pointer"
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Desktop Floating Theme Toggle Button */}
      <div className="hidden sm:flex absolute top-4 right-4 z-30 items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'Light' : 'Dark')}
          aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Left Column: Visual Showcase & Actual Brand Logo (Desktop >= 1024px) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative overflow-hidden bg-gradient-to-br from-[#1A1045] via-[#2D1B78] to-[#110A30] text-white p-10 xl:p-14 flex-col justify-between select-none">
        {/* Decorative Background Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#5B4DB7]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Brand Logo with Exact Sidebar Style */}
        <div className="relative z-10">
          <div className="inline-flex pb-2.5 border-b-2 border-white/30 transition-colors">
            <BrandLogo collapsed={false} theme="dark" size="lg" />
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold tracking-wide">TechnoKraft Enterprise Workspace</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
            Driving B2B Sales, Client Proposals & Operations
          </h2>

          <p className="text-sm text-purple-100/85 leading-relaxed">
            Unified business intelligence platform engineered for TechnoKraft Services LLP — orchestrating end-to-end deal conversions, automated client quotations, multi-channel outreach, and team performance analytics.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pipeline & Deals</span>
              </div>
              <p className="text-[11px] text-purple-200/70">Full lifecycle lead tracking & stage progression</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold mb-1">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Proposals & Quotes</span>
              </div>
              <p className="text-[11px] text-purple-200/70">Instant PDF quotation generation & email dispatch</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold mb-1">
                <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Team Analytics</span>
              </div>
              <p className="text-[11px] text-purple-200/70">Real-time attendance, activity & quota KPIs</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-purple-300 shrink-0" />
                <span>Enterprise RBAC</span>
              </div>
              <p className="text-[11px] text-purple-200/70">Role-governed data access & secure audit logs</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="relative z-10 flex items-center justify-end text-xs text-purple-200/70 border-t border-white/10 pt-4">
          <span>
            &copy; {new Date().getFullYear()}{' '}
            <a
              href="https://www.technokraftservices.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-200 underline underline-offset-2 transition-colors font-medium"
            >
              TechnoKraft Services LLP
            </a>
            . All rights reserved.
          </span>
        </div>
      </div>

      {/* Right Column: Login Form Container (100% Responsive with Android Mobile UI) */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col items-center justify-center p-3.5 sm:p-8 lg:p-12 pt-16 sm:pt-8 min-h-screen">
        <div className="w-full max-w-md space-y-5 sm:space-y-6 max-sm:bg-white max-sm:dark:bg-[#111827] max-sm:rounded-3xl max-sm:p-5 max-sm:shadow-sm max-sm:border max-sm:border-slate-200/80 max-sm:dark:border-slate-800 transition-all">
          {/* Form Header with Actual Brand Logo (Bottom border matches logo width only) */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-start">
              <div className="inline-flex pb-2.5 border-b-2 border-slate-300 dark:border-slate-600 transition-colors">
                <BrandLogo collapsed={false} theme={isDark ? 'dark' : 'light'} size="md" />
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Employee Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your username or corporate email to access the CRM portal.
              </p>
            </div>
          </div>

          {/* Error Message Alert Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            {/* Username / Email Field */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Username or Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="e.g. admin or kunal.patil@technokraftservices.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full h-11.5 sm:h-11 pl-11 pr-3.5 bg-slate-50 dark:bg-slate-800/60 sm:bg-white sm:dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 sm:dark:border-slate-800 rounded-2xl sm:rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer active:opacity-80"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11.5 sm:h-11 pl-11 pr-11 bg-slate-50 dark:bg-slate-800/60 sm:bg-white sm:dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 sm:dark:border-slate-800 rounded-2xl sm:rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] shadow-2xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#5B4DB7] focus:ring-[#5B4DB7] border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">Keep me signed in (30 days)</span>
              </label>
            </div>

            {/* Android-style Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 py-3 px-4 bg-[#5B4DB7] hover:bg-[#4d3fa5] active:bg-[#433696] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-2xl sm:rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Copyright with Hyperlink */}
          <footer className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            <p>
              &copy; {new Date().getFullYear()}{' '}
              <a
                href="https://www.technokraftservices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#5B4DB7] dark:text-purple-400 hover:text-[#4d3fa5] dark:hover:text-purple-300 hover:underline transition-colors"
              >
                TechnoKraft Services LLP
              </a>
              . All rights reserved.
            </p>
          </footer>
        </div>
      </div>

      {/* Force Password Reset Modal (Shown when first-time login or admin forceReset=true) */}
      {showForceResetModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center mb-4 text-[#5B4DB7] dark:text-purple-400">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Password Reset Required
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your administrator has requested that you set a new secure password before proceeding into the CRM.
            </p>

            {resetError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {resetError}
              </div>
            )}

            <form onSubmit={handleForcePasswordReset} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-2.5 px-4 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save & Access CRM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

