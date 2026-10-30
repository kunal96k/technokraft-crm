import React, { useState, useContext, useEffect } from 'react';
import { buildSafeApiUrl } from '../../utils/urlUtils';
import { AuthContext } from '../../context/AuthContext';
import { findCachedEmployee, getCachedActiveEmployees, fetchActiveEmployees } from '../../services/employeeService';

export interface EmployeeAvatarProps {
  name: string;
  avatar?: string | null;
  profilePhoto?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRing?: boolean;
  isClient?: boolean;
}

const sizeClasses: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', {
  box: string;
  text: string;
  img: string;
}> = {
  xs: { box: 'w-5 h-5 text-[9px]', text: 'text-[9px]', img: 'w-5 h-5' },
  sm: { box: 'w-7 h-7 text-[10px]', text: 'text-[10px]', img: 'w-7 h-7' },
  md: { box: 'w-9 h-9 text-xs', text: 'text-xs', img: 'w-9 h-9' },
  lg: { box: 'w-11 h-11 text-sm', text: 'text-sm', img: 'w-11 h-11' },
  xl: { box: 'w-14 h-14 text-base', text: 'text-base', img: 'w-14 h-14' },
};

/**
 * Validates whether an avatar/photo URL represents an authentic image uploaded to our server.
 * (e.g. /api/auth/profile-photo/..., /api/employees/.../photo, /uploads/..., data:image, blob:, localhost:8080)
 * Strictly excludes random/mock external images (like Unsplash, randomuser.me, ui-avatars.com, etc.).
 */
export const isServerUploadedPhoto = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Never treat external avatar generators or external mock image sites as uploaded photos
  if (
    trimmed.includes('ui-avatars.com') ||
    trimmed.includes('unsplash.com') ||
    trimmed.includes('randomuser.me') ||
    trimmed.includes('pravatar.cc') ||
    trimmed.includes('dicebear.com') ||
    trimmed.includes('robohash.org')
  ) {
    return false;
  }

  // Relative API routes on our backend server
  if (
    trimmed.startsWith('/api/auth/profile-photo') ||
    trimmed.startsWith('api/auth/profile-photo') ||
    trimmed.startsWith('/api/employees') ||
    trimmed.startsWith('api/employees') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('uploads/')
  ) {
    return true;
  }

  // Local file picker data/blob URLs from employee edit modal
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) return true;

  // Absolute URLs pointing to our backend server
  try {
    const parsed = new URL(trimmed, window.location.origin);
    const isOurHost =
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === window.location.hostname;

    const isServerUploadPath =
      parsed.pathname.includes('/profile-photo') ||
      parsed.pathname.includes('/uploads/') ||
      (parsed.pathname.startsWith('/api/') && parsed.pathname.includes('/photo'));

    if (isOurHost && (isServerUploadPath || (parsed.port === '8080' && isServerUploadPath))) {
      return true;
    }
  } catch {}

  return false;
};

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  name,
  avatar,
  profilePhoto,
  email,
  size = 'sm',
  className = '',
  showRing = false,
  isClient = false,
}) => {
  const [photoError, setPhotoError] = useState(false);
  const [apiAvatarError, setApiAvatarError] = useState(false);
  const [, setDirectoryVersion] = useState(0);
  const authContext = useContext(AuthContext);
  const authUser = authContext?.user;

  useEffect(() => {
    if (!isClient && getCachedActiveEmployees().length === 0) {
      fetchActiveEmployees().then(() => setDirectoryVersion((v) => v + 1));
    }
    const onUpdate = () => setDirectoryVersion((v) => v + 1);
    window.addEventListener('crm-employees-updated', onUpdate);
    return () => window.removeEventListener('crm-employees-updated', onUpdate);
  }, [isClient]);

  // Compute initials fallback
  const getInitials = (n: string) => {
    if (!n || !n.trim()) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const trimmedName = (name || '').trim();
  const sizeCfg = sizeClasses[size] || sizeClasses.sm;

  // Reset error states if name or candidate changes
  useEffect(() => {
    setPhotoError(false);
    setApiAvatarError(false);
  }, [profilePhoto, avatar, name, isClient]);

  // =========================================================================
  // 1. CLIENT HANDLING:
  // For clients, remove dynamically rendered image profile and ONLY use their
  // API avatar as per name (ui-avatars.com based on client name).
  // =========================================================================
  if (isClient) {
    const safeClientName = encodeURIComponent(trimmedName || 'Client');
    // High-contrast clean API avatar for clients
    const clientApiAvatarUrl = `https://ui-avatars.com/api/?name=${safeClientName}&background=0284C7&color=ffffff&bold=true&size=128`;
    const clientInitials = getInitials(trimmedName);
    const clientRingClass = showRing
      ? 'ring-2 ring-sky-200 dark:ring-sky-900/60 shadow-xs'
      : '';

    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden bg-sky-600 text-white font-bold select-none ${sizeCfg.box} ${clientRingClass} ${className}`}
        title={name || 'Client'}
      >
        {!apiAvatarError ? (
          <img
            src={clientApiAvatarUrl}
            alt={name || 'Client'}
            className={`w-full h-full object-cover rounded-full ${sizeCfg.img}`}
            onError={() => setApiAvatarError(true)}
            loading="lazy"
          />
        ) : (
          <span className={`${sizeCfg.text} uppercase font-semibold tracking-wider`}>
            {clientInitials}
          </span>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. EMPLOYEE / USER HANDLING:
  // For employees/users, only use image avatar if an image is uploaded in our
  // server; otherwise show the API avatar as per our employee or user name.
  // =========================================================================
  let effectivePhoto = profilePhoto;
  let effectiveAvatar = avatar;

  const qName = trimmedName.toLowerCase();
  const qEmail = (email || '').trim().toLowerCase();

  // Check if matches currently logged-in user
  if (authUser) {
    const authUserName = (authUser.name || '').trim().toLowerCase();
    const authUserEmail = (authUser.email || '').trim().toLowerCase();
    const authUserUsername = (authUser.username || '').trim().toLowerCase();

    const isMatch =
      (qName && (qName === authUserName || qName === authUserUsername)) ||
      (qEmail && qEmail === authUserEmail);

    if (isMatch) {
      if (!effectivePhoto && authUser.profilePhoto) {
        effectivePhoto = authUser.profilePhoto;
      }
      if (!effectiveAvatar && authUser.avatar) {
        effectiveAvatar = authUser.avatar;
      }
    }
  }

  // Check cached employee directory
  if (!effectivePhoto && (trimmedName || qEmail)) {
    const cached = findCachedEmployee(trimmedName) || (qEmail ? findCachedEmployee(qEmail) : undefined);
    if (cached) {
      if (!effectivePhoto && cached.profilePhoto) {
        effectivePhoto = cached.profilePhoto;
      }
      if (!effectiveAvatar && cached.avatar) {
        effectiveAvatar = cached.avatar;
      }
    }
  }

  // If avatar prop is a server-uploaded URL, treat as photo
  if (
    !effectivePhoto &&
    effectiveAvatar &&
    isServerUploadedPhoto(effectiveAvatar)
  ) {
    effectivePhoto = effectiveAvatar;
  }

  // Strictly check if photo is uploaded in our server
  const hasServerUploadedPhoto = isServerUploadedPhoto(effectivePhoto);

  // Original profile photo ONLY if uploaded in our server and no load error
  const originalPhotoUrl =
    hasServerUploadedPhoto && !photoError ? buildSafeApiUrl(effectivePhoto!) : null;

  // Default API avatar as per our employee or user name
  const safeName = encodeURIComponent(trimmedName || 'Employee');
  const defaultApiAvatarUrl = `https://ui-avatars.com/api/?name=${safeName}&background=5B4DB7&color=ffffff&bold=true&size=128`;

  const initials =
    effectiveAvatar &&
    effectiveAvatar.trim().length > 0 &&
    !effectiveAvatar.startsWith('http') &&
    !effectiveAvatar.startsWith('/api')
      ? effectiveAvatar
      : getInitials(name);

  const ringClass = showRing
    ? 'ring-2 ring-purple-200 dark:ring-purple-900/60 shadow-xs'
    : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden bg-[#5B4DB7] text-white font-bold select-none ${sizeCfg.box} ${ringClass} ${className}`}
      title={name || 'User'}
    >
      {originalPhotoUrl ? (
        <img
          src={originalPhotoUrl}
          alt={name || 'User'}
          className={`w-full h-full object-cover rounded-full ${sizeCfg.img}`}
          onError={() => setPhotoError(true)}
          loading="lazy"
        />
      ) : !apiAvatarError ? (
        <img
          src={defaultApiAvatarUrl}
          alt={name || 'User'}
          className={`w-full h-full object-cover rounded-full ${sizeCfg.img}`}
          onError={() => setApiAvatarError(true)}
          loading="lazy"
        />
      ) : (
        <span className={`${sizeCfg.text} uppercase font-semibold tracking-wider`}>
          {initials}
        </span>
      )}
    </div>
  );
};
