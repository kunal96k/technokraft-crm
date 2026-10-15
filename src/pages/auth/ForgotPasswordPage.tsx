import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Loader2,
  Sparkles,
  Sun,
  Moon,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';

type ResetStep = 'IDENTIFIER' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export const ForgotPasswordPage: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<ResetStep>('IDENTIFIER');

  // Form State
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [emailMasked, setEmailMasked] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const isDark = resolvedTheme === 'Dark';

  // Cooldown timer for OTP Resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-redirect countdown on Success
  useEffect(() => {
    if (currentStep !== 'SUCCESS') return;
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep, navigate]);

  // Password Policy Checks
  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // -----------------------------------------------------------------
  // Step 1: Submit Username or Corporate Email (Strict Super Admin)
  // -----------------------------------------------------------------
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    const identifier = emailOrUsername.trim();
    if (!identifier) {
      const msg = 'Please enter your Super Admin username or corporate email.';
      setErrorMessage(msg);
      toast.warning(msg, 'Required Field');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword({
        emailOrUsername: identifier,
      });

      setEmailMasked(res.emailMasked || 'your registered corporate email');
      setResendCooldown(60); // 60 seconds cooldown
      setCurrentStep('OTP');
      toast.success(
        res.message || 'Verification OTP sent to your registered Super Admin email.',
        'OTP Dispatched'
      );
    } catch (err: any) {
      console.error('[ForgotPassword] Request error:', err);
      const msg =
        err.message ||
        'Password recovery is strictly restricted to Super Admin accounts.';
      setErrorMessage(msg);
      toast.error(msg, 'Access Denied');
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Step 2: Verify 6-digit OTP Code
  // -----------------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      const msg = 'Please enter the 6-digit verification OTP received on your email.';
      setErrorMessage(msg);
      toast.warning(msg, 'OTP Required');
      return;
    }

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      const msg = 'OTP must be exactly a 6-digit numeric code.';
      setErrorMessage(msg);
      toast.warning(msg, 'Invalid OTP Format');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyOtp({
        emailOrUsername: emailOrUsername.trim(),
        otp: cleanOtp,
      });

      if (res.valid) {
        setCurrentStep('NEW_PASSWORD');
        toast.success(
          'OTP verified successfully! Please set your new secure password.',
          'Identity Verified'
        );
      } else {
        const msg = res.message || 'Invalid or expired OTP code.';
        setErrorMessage(msg);
        toast.error(msg, 'Verification Failed');
      }
    } catch (err: any) {
      console.error('[ForgotPassword] OTP Verify Error:', err);
      const msg = err.message || 'Invalid or expired verification OTP.';
      setErrorMessage(msg);
      toast.error(msg, 'Verification Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Helper
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword({
        emailOrUsername: emailOrUsername.trim(),
      });
      setResendCooldown(60);
      toast.info(res.message || 'New OTP has been sent to your email.', 'OTP Resent');
    } catch (err: any) {
      const msg = err.message || 'Failed to resend OTP. Please try again.';
      setErrorMessage(msg);
      toast.error(msg, 'Resend Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Step 3: Set & Confirm New Password
  // -----------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    if (!hasMinLength) {
      const msg = 'New password must be at least 6 characters long.';
      setWarningMessage(msg);
      toast.warning(msg, 'Password Policy');
      return;
    }

    if (!isPasswordMatch) {
      const msg = 'New password and confirm password do not match.';
      setWarningMessage(msg);
      toast.warning(msg, 'Password Mismatch');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        token: otp.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
        emailOrUsername: emailOrUsername.trim(),
      });

      setCurrentStep('SUCCESS');
      toast.success(
        res.message || 'Super Admin password reset successfully!',
        'Reset Complete'
      );
    } catch (err: any) {
      console.error('[ForgotPassword] Reset Password Error:', err);
      const msg = err.message || 'Failed to reset password. OTP may have expired.';
      setErrorMessage(msg);
      toast.error(msg, 'Reset Failed');
    } finally {
      setIsLoading(false);
    }
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
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Super Admin Security Protocol
            </span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
            Master Account Password Recovery
          </h2>

          <p className="text-sm text-purple-100/80 leading-relaxed">
            Password self-recovery on TechnoKraft CRM is strictly reserved for the <strong>Super Admin</strong> role via verified two-step email OTP authorization.
          </p>

          {/* Stepper overview */}
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 space-y-3 text-xs text-purple-100/90">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 'IDENTIFIER' ? 'bg-[#5B4DB7] text-white ring-2 ring-purple-300' : 'bg-emerald-500 text-white'
                }`}
              >
                1
              </span>
              <span className={currentStep === 'IDENTIFIER' ? 'font-bold text-white' : 'text-purple-200/80'}>
                Super Admin Role Verification
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 'OTP'
                    ? 'bg-[#5B4DB7] text-white ring-2 ring-purple-300'
                    : currentStep === 'NEW_PASSWORD' || currentStep === 'SUCCESS'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/20 text-purple-300'
                }`}
              >
                2
              </span>
              <span className={currentStep === 'OTP' ? 'font-bold text-white' : 'text-purple-200/80'}>
                6-Digit Email OTP Verification
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 'NEW_PASSWORD'
                    ? 'bg-[#5B4DB7] text-white ring-2 ring-purple-300'
                    : currentStep === 'SUCCESS'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/20 text-purple-300'
                }`}
              >
                3
              </span>
              <span className={currentStep === 'NEW_PASSWORD' ? 'font-bold text-white' : 'text-purple-200/80'}>
                Password Reset & Security Update
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-between text-xs text-purple-200/70 border-t border-white/10 pt-4">
          <span>&copy; {new Date().getFullYear()} TechnoKraft Services LLP</span>
          <span className="font-semibold text-emerald-300">Protected by 256-Bit SSL</span>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-7">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <BrandLogo collapsed={false} theme={isDark ? 'dark' : 'light'} size="md" />
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Super Admin Only
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {currentStep === 'IDENTIFIER' && 'Forgot Password'}
                {currentStep === 'OTP' && 'Verify Email OTP'}
                {currentStep === 'NEW_PASSWORD' && 'Set New Password'}
                {currentStep === 'SUCCESS' && 'Password Updated!'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {currentStep === 'IDENTIFIER' &&
                  'Enter your username or corporate email. Only verified Super Admin accounts can self-recover passwords.'}
                {currentStep === 'OTP' &&
                  `We have dispatched a single-use 6-digit OTP code to ${emailMasked || 'your registered corporate email'}.`}
                {currentStep === 'NEW_PASSWORD' &&
                  'Your identity is verified. Please enter and confirm your new secure Super Admin password.'}
                {currentStep === 'SUCCESS' &&
                  'Your master account credentials have been successfully updated.'}
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

          {/* Warning Banner */}
          {warningMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 font-medium leading-relaxed">{warningMessage}</div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: Enter Username or Corporate Email */}
          {/* ========================================================= */}
          {currentStep === 'IDENTIFIER' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-username"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Username or Corporate Email <span className="text-rose-500">*</span>
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

              {/* Policy Callout */}
              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 text-[11px] text-purple-900 dark:text-purple-200 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Access Policy:</strong> Self-service password recovery is exclusive to the <strong>Super Admin</strong> role. Non-admin staff members must contact the Super Admin to receive password resets.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 px-4 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Role & Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2: Enter & Verify 6-Digit Email OTP */}
          {/* ========================================================= */}
          {currentStep === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Super Admin Account Verified</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  OTP sent to: <strong>{emailMasked}</strong>. Code expires in 15 minutes.
                </p>
              </div>

              <div>
                <label
                  htmlFor="otp-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Enter 6-Digit Verification OTP <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="otp-input"
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3.5 py-3 font-mono text-center tracking-[8px] text-lg font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-purple-700 dark:text-purple-300 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('IDENTIFIER');
                    setErrorMessage(null);
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  Change Username/Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="font-semibold text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.trim().length !== 6}
                className="w-full py-2.5 sm:py-3 px-4 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 3: Set & Confirm New Password */}
          {/* ========================================================= */}
          {currentStep === 'NEW_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <span
                    className={`text-[11px] mt-1.5 flex items-center gap-1 font-medium ${
                      isPasswordMatch
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isPasswordMatch ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Password Policy Checklist */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px]">
                <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Password Requirements:
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span className={hasMinLength ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      hasUppercase ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span className={hasUppercase ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                    Contains uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      hasNumber ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span className={hasNumber ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                    Contains number
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !hasMinLength || !isPasswordMatch}
                className="w-full py-2.5 sm:py-3 px-4 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password & Secure Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 4: Success View */}
          {/* ========================================================= */}
          {currentStep === 'SUCCESS' && (
            <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  Password Reset Successfully!
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Your Super Admin credentials have been updated securely. You can now access the CRM with your new password.
                </p>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Redirecting to login in <strong>{redirectCountdown}</strong> seconds...
              </p>

              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-2.5 px-4 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          {currentStep !== 'SUCCESS' && (
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B4DB7] dark:text-purple-400 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
