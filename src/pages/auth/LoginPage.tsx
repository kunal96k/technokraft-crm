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
      {/* Theme Toggle Button in top-right */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'Light' : 'Dark')}
          aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
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
          <BrandLogo collapsed={false} theme="dark" size="lg" />
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Secure Session Authentication</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
            Enterprise CRM & Employee Workspace
          </h2>

          <p className="text-sm text-purple-100/80 leading-relaxed">
            Manage full-cycle lead pipelines, client proposals, communication touchpoints, team performance quotas, and real-time attendance in one unified portal.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>RBAC Security</span>
              </div>
              <p className="text-[11px] text-purple-200/70">Role-level permissions & live audit trails</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold mb-1">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Real-Time Sync</span>
              </div>
              <p className="text-[11px] text-purple-200/70">Spring Boot backend with active session persistence</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="relative z-10 flex items-center justify-end text-xs text-purple-200/70 border-t border-white/10 pt-4">
          <span>&copy; {new Date().getFullYear()} TechnoKraft Services LLP</span>
        </div>
      </div>

      {/* Right Column: Login Form Container (100% Responsive) */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-7">
          {/* Form Header with Actual Brand Logo on all viewports */}
          <div className="space-y-6">
            <div className="flex items-center justify-start pb-1">
              <BrandLogo collapsed={false} theme={isDark ? 'dark' : 'light'} size="md" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Employee Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Enter your username or corporate email to access the CRM portal.
              </p>
            </div>
          </div>

          {/* Error Message Alert Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <User className="w-4 h-4" />
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] shadow-xs transition-colors"
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
                  className="text-[11px] font-medium text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] shadow-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  className="w-4 h-4 rounded text-[#5B4DB7] focus:ring-[#5B4DB7] border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">Keep me signed in (30 days)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 px-4 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credential Presets */}
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
                Quick Demo Accounts (1-Click Fill)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('kunall11', 'Kunal@11', 'Super Admin')}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 group-hover:underline">
                  Super Admin
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  kunall11 / Kunal@11
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kunal.patil', 'admin123', 'Sales Executive')}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 group-hover:underline">
                  Sales Executive
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  kunal.patil / admin123
                </div>
              </button>
            </div>
          </div>
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

