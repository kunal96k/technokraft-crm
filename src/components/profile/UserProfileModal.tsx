import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  Calendar,
  Clock,
  LogIn,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Edit3,
  Save,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { buildSafeApiUrl } from '../../utils/urlUtils';
import { useLiveWorkingTime } from '../../utils/workingHoursUtils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, uploadProfilePhoto, updateProfile, refreshUser } = useAuth();
  const liveWorking = useLiveWorkingTime(user, 5000);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Editable Form State
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  // Sync state whenever user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      handleRefreshData();
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setPersonalEmail(user.personalEmail || '');
      setGender(user.gender || 'Male');
      setDateOfBirth(user.dateOfBirth || '');
      setImageLoadError(false);
    }
  }, [user]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } catch (e) {
      console.warn('Could not refresh profile live:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isOpen || !user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'TK';

  // Photo URL resolution
  const photoUrl = user.profilePhoto
    ? buildSafeApiUrl(user.profilePhoto)
    : user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/api'))
    ? buildSafeApiUrl(user.avatar)
    : null;

  // Handle Photo Upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: 'Profile image size exceeds 5MB limit. Please choose a smaller image.',
      });
      return;
    }

    setIsUploadingPhoto(true);
    setNotification(null);
    setImageLoadError(false);

    try {
      await uploadProfilePhoto(file);
      setNotification({
        type: 'success',
        message: 'Profile image uploaded and saved to server storage successfully!',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to upload profile photo to server.',
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Saving Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      await updateProfile({
        name,
        firstName,
        lastName,
        phone,
        personalEmail,
        gender,
        dateOfBirth,
      });

      setIsEditing(false);
      setNotification({
        type: 'success',
        message: 'Profile details updated successfully!',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to update profile information.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSaving && !isUploadingPhoto) {
      onClose();
    }
  };

  // Live formatted timestamps
  const lastLoginFormatted = user.lastLoginAt || user.loginTime || 'Active In Session';
  const lastLogoutFormatted = user.lastLogoutAt || user.logoutTime || 'In Session / Live Active';

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="User Profile Details"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden text-slate-900 dark:text-slate-100 my-auto animate-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-[#5B4DB7] via-[#7566d8] to-[#917fe6] relative px-6 pt-4 pb-0 flex items-start justify-between">
            <div className="flex items-center gap-2 text-white/90 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>User Profile Details</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRefreshData}
                disabled={isRefreshing}
                title="Refresh live profile timestamps"
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Overview Bar */}
          <div className="px-6 pb-4 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 min-w-0">
              {/* Avatar with Camera Upload Overlay */}
              <div className="relative group shrink-0 -mt-14 z-10">
                <div className="w-24 h-24 rounded-2xl ring-4 ring-white dark:ring-[#1E293B] shadow-xl overflow-hidden bg-[#5B4DB7] flex items-center justify-center text-white text-2xl font-bold">
                  {photoUrl && !imageLoadError ? (
                    <img
                      src={photoUrl}
                      alt={user.name}
                      onError={() => setImageLoadError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}

                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  title="Upload profile picture to server folder"
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-[#5B4DB7] hover:bg-[#4a3ea3] text-white rounded-xl shadow-md ring-2 ring-white dark:ring-[#1E293B] transition-transform active:scale-90 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>

              {/* Name & Role */}
              <div className="pt-2 sm:pt-3 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {user.accessRole || user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  @{user.username} • {user.department || 'Management'}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {user.workStatus || 'Active & Working'} • <span className="font-mono">{liveWorking.formatted}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ID: <span className="font-mono font-medium text-slate-600 dark:text-slate-300">{user.employeeCode || user.id}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-end pt-2 sm:pt-0 shrink-0">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                Reset Password
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer ${
                  isEditing
                    ? 'bg-slate-600 hover:bg-slate-700'
                    : 'bg-[#5B4DB7] hover:bg-[#4d409d]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Notifications */}
          {notification && (
            <div className="px-6 pt-4">
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs animate-in fade-in ${
                  notification.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{notification.message}</span>
              </div>
            </div>
          )}

          {/* MAIN BODY */}
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* LIVE LOGIN & LOGOUT TIMESTAMPS CARDS (Requested by User) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Live Recorded Sessions & Timestamps
                </span>
                <span className="text-[10px] text-[#5B4DB7] dark:text-purple-400 font-medium">
                  Updated Live Every Session
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Last Login Time */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                      Last Login Time
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {lastLoginFormatted}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Session authenticated & recorded
                    </p>
                  </div>
                </div>

                {/* Last Logout Time */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-indigo-800 dark:text-indigo-300">
                      Last Logout Time
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {lastLogoutFormatted}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Updated automatically upon sign-out
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* EDITABLE OR DISPLAY DETAILS */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Display Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Personal Email
                    </label>
                    <input
                      type="email"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      placeholder="personal@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Corporate Email (Company Managed)
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl text-white bg-[#5B4DB7] hover:bg-[#4d409d] shadow-xs cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* READ-ONLY INFORMATION CARDS */
              <div className="space-y-4">
                {/* Contact & Personal Information */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Contact & Identification
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Corporate Email */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-[#5B4DB7] shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Corporate Email</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Phone Number</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user.phone || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Personal Email */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Personal Email</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user.personalEmail || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Date of Birth & Gender */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Gender & DOB</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {user.gender || 'Not specified'} {user.dateOfBirth ? `• ${user.dateOfBirth}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employment & Organization */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Department & Role */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Department</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {user.department || 'Management'}
                        </p>
                      </div>
                    </div>

                    {/* Joining Date */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Joining Date</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {user.joiningDate || '2024-01-01'}
                        </p>
                      </div>
                    </div>

                    {/* Today Attendance */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Today Attendance Status</p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                          {user.todayAttendanceStatus || 'Present / Active'}
                        </p>
                      </div>
                    </div>

                    {/* Working Time */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Today Working Hours</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate font-mono">
                          {liveWorking.formatted}
                        </p>
                      </div>
                    </div>

                    {/* Shift Schedule */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-3 sm:col-span-2">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400">Assigned Shift Schedule</p>
                          <p className="font-semibold text-purple-700 dark:text-purple-300 font-mono text-xs">
                            {user.shiftStartTime || '10:00 AM'} – {user.shiftEndTime || '04:00 PM'}
                          </p>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                          15m Late Grace Period
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px] text-slate-400">
              TechnoKraft CRM • Authenticated Session
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
    </div>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}

      {/* Embedded Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setNotification({
            type: 'success',
            message: 'Password successfully changed and updated in database.',
          });
          setTimeout(() => setNotification(null), 4000);
        }}
      />
    </>
  );
};
