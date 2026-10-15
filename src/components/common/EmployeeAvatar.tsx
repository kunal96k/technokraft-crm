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

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  name,
  avatar,
  profilePhoto,
  email,
  size = 'sm',
  className = '',
  showRing = false,
}) => {
  const [photoError, setPhotoError] = useState(false);
  const [apiAvatarError, setApiAvatarError] = useState(false);
  const [, setDirectoryVersion] = useState(0);

  useEffect(() => {
    if (getCachedActiveEmployees().length === 0) {
      fetchActiveEmployees().then(() => setDirectoryVersion((v) => v + 1));
    }
    const onUpdate = () => setDirectoryVersion((v) => v + 1);
    window.addEventListener('crm-employees-updated', onUpdate);
    return () => window.removeEventListener('crm-employees-updated', onUpdate);
  }, []);

  // Safely access auth context if available
  const authContext = useContext(AuthContext);
  const authUser = authContext?.user;

  // Resolve dynamic avatar as per logged in user or cached employee directory
  let effectivePhoto = profilePhoto;
  let effectiveAvatar = avatar;

  const trimmedName = (name || '').trim();
  const qName = trimmedName.toLowerCase();
  const qEmail = (email || '').trim().toLowerCase();

  // 1. Check if matches currently logged-in user
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

  // 2. If photo is still not resolved, check cached employee directory
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

  // If avatar prop is a URL (starts with http, /api, data:), treat as photo
  if (
    !effectivePhoto &&
    effectiveAvatar &&
    (effectiveAvatar.startsWith('http') ||
      effectiveAvatar.startsWith('/api') ||
      effectiveAvatar.startsWith('data:') ||
      effectiveAvatar.startsWith('blob:'))
  ) {
    effectivePhoto = effectiveAvatar;
  }

  // Reset error states if photo candidate changes
  useEffect(() => {
    setPhotoError(false);
    setApiAvatarError(false);
  }, [effectivePhoto, name]);

  // Compute initials fallback
  const getInitials = (n: string) => {
    if (!n || !n.trim()) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials =
    effectiveAvatar && effectiveAvatar.trim().length > 0 && !effectiveAvatar.startsWith('http') && !effectiveAvatar.startsWith('/api')
      ? effectiveAvatar
      : getInitials(name);

  // 1. Original profile photo (if present and no load error)
  const originalPhotoUrl =
    effectivePhoto && !photoError ? buildSafeApiUrl(effectivePhoto) : null;

  // 2. Default API avatar URL if no original photo or if photo load fails
  // By default, if user avatar does not exist, show its API avatar dynamically
  const safeName = encodeURIComponent(trimmedName || 'Employee');
  const defaultApiAvatarUrl = `https://ui-avatars.com/api/?name=${safeName}&background=5B4DB7&color=ffffff&bold=true&size=128`;

  const sizeCfg = sizeClasses[size] || sizeClasses.sm;
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
