import { useState, useEffect } from 'react';

/**
 * Robust parser for various timestamp formats returned by the backend:
 * - "12 Oct 2026, 01:47 PM" (DATETIME_DISPLAY_FORMATTER)
 * - "2026-10-12T13:47:00" (ISO)
 * - "01:47 PM" (Time only - assumes today)
 */
export function parseLoginTime(timeStr?: string | null): Date | null {
  if (!timeStr || timeStr === '—' || timeStr.trim() === '') return null;
  const str = timeStr.trim();

  // Try direct ISO Date parse
  const direct = new Date(str);
  if (!isNaN(direct.getTime()) && str.includes('-')) {
    return direct;
  }

  // Format: "12 Oct 2026, 01:47 PM" or "12 Oct 2026 01:47 PM"
  const fullMatch = str.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (fullMatch) {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const day = parseInt(fullMatch[1], 10);
    const month = months[fullMatch[2].toLowerCase()] ?? 0;
    const year = parseInt(fullMatch[3], 10);
    let hours = parseInt(fullMatch[4], 10);
    const minutes = parseInt(fullMatch[5], 10);
    const seconds = fullMatch[6] ? parseInt(fullMatch[6], 10) : 0;
    const ampm = fullMatch[7]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return new Date(year, month, day, hours, minutes, seconds);
  }

  // Format: "01:47 PM" or "13:47" (time-only on current day)
  const timeMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (timeMatch) {
    const now = new Date();
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    const ampm = timeMatch[4]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
  }

  return null;
}

/**
 * Parses duration strings like "1h 40m", "45m", "02:15", "1 hr 30 mins" into seconds.
 */
export function parseDurationToSeconds(durationStr?: string | null): number {
  if (!durationStr || durationStr === '—' || durationStr === '---' || durationStr.trim() === '') return 0;
  const str = durationStr.trim();

  let totalSecs = 0;
  const hMatch = str.match(/(\d+)\s*h(?:r|rs)?/i);
  const mMatch = str.match(/(\d+)\s*m(?:in|ins)?/i);
  const sMatch = str.match(/(\d+)\s*s(?:ec|ecs)?/i);

  if (hMatch || mMatch || sMatch) {
    if (hMatch) totalSecs += parseInt(hMatch[1], 10) * 3600;
    if (mMatch) totalSecs += parseInt(mMatch[1], 10) * 60;
    if (sMatch) totalSecs += parseInt(sMatch[1], 10);
    return totalSecs;
  }

  const colonMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (colonMatch) {
    const hrs = parseInt(colonMatch[1], 10);
    const mins = parseInt(colonMatch[2], 10);
    const secs = colonMatch[3] ? parseInt(colonMatch[3], 10) : 0;
    return hrs * 3600 + mins * 60 + secs;
  }

  return 0;
}

/**
 * Calculates live working duration between login time and now (or logout time),
 * seamlessly incorporating baseWorkingMinutes from previous sessions today.
 */
export function calculateWorkingDuration(
  loginTimeStr?: string | null,
  logoutTimeStr?: string | null,
  isWorking = true,
  fallbackDuration?: string | null,
  baseWorkingMinutes?: number | null
): {
  formatted: string;
  fullText: string;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const loginDate = parseLoginTime(loginTimeStr);

  // If user is not actively working
  if (!isWorking) {
    if (fallbackDuration && fallbackDuration !== '—' && fallbackDuration !== '---' && fallbackDuration.trim() !== '') {
      const fallbackSecs = parseDurationToSeconds(fallbackDuration);
      if (fallbackSecs > 0) {
        const hours = Math.floor(fallbackSecs / 3600);
        const minutes = Math.floor((fallbackSecs % 3600) / 60);
        const seconds = fallbackSecs % 60;
        return {
          formatted: `${hours}h ${String(minutes).padStart(2, '0')}m`,
          fullText: `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`,
          hours,
          minutes,
          seconds,
        };
      }
    }

    if (loginDate && logoutTimeStr) {
      const logoutDate = parseLoginTime(logoutTimeStr);
      if (logoutDate) {
        const diffMs = Math.max(0, logoutDate.getTime() - loginDate.getTime());
        const totalSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        return {
          formatted: `${hours}h ${String(minutes).padStart(2, '0')}m`,
          fullText: `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`,
          hours,
          minutes,
          seconds,
        };
      }
    }

    const fallback = fallbackDuration && fallbackDuration !== '—' && fallbackDuration.trim() !== ''
      ? fallbackDuration
      : '0h 00m';
    return {
      formatted: fallback,
      fullText: fallback,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  // Actively Working:
  let baseSeconds = 0;
  if (baseWorkingMinutes !== undefined && baseWorkingMinutes !== null && baseWorkingMinutes > 0) {
    baseSeconds = baseWorkingMinutes * 60;
  }

  let sessionSeconds = 0;
  if (loginDate) {
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - loginDate.getTime());
    sessionSeconds = Math.floor(diffMs / 1000);
  }

  let totalSeconds = baseSeconds + sessionSeconds;

  // Fallback check if baseWorkingMinutes was not provided but fallbackDuration is greater than current session alone
  if (baseSeconds === 0 && fallbackDuration) {
    const fallbackSecs = parseDurationToSeconds(fallbackDuration);
    if (fallbackSecs > totalSeconds) {
      totalSeconds = fallbackSecs;
    }
  }

  if (totalSeconds === 0 && fallbackDuration && fallbackDuration !== '—' && fallbackDuration.trim() !== '') {
    return {
      formatted: fallbackDuration,
      fullText: fallbackDuration,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${hours}h ${String(minutes).padStart(2, '0')}m`;
  const fullText = `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;

  return { formatted, fullText, hours, minutes, seconds };
}

/**
 * React hook that recalculates live working hours periodically
 */
export function useLiveWorkingTime(
  user?: {
    loginTime?: string | null;
    lastLoginAt?: string | null;
    logoutTime?: string | null;
    lastLogoutAt?: string | null;
    workStatus?: string | null;
    todayWorkingTime?: string | null;
    baseWorkingMinutes?: number | null;
  } | null,
  intervalMs = 15000
) {
  const isWorking = !user?.workStatus || user.workStatus.toLowerCase() === 'working';
  const loginRef = user?.lastLoginAt || user?.loginTime;
  const logoutRef = user?.lastLogoutAt || user?.logoutTime;

  const [workingTime, setWorkingTime] = useState(() =>
    calculateWorkingDuration(loginRef, logoutRef, isWorking, user?.todayWorkingTime, user?.baseWorkingMinutes)
  );

  useEffect(() => {
    const update = () => {
      setWorkingTime(calculateWorkingDuration(loginRef, logoutRef, isWorking, user?.todayWorkingTime, user?.baseWorkingMinutes));
    };
    update();

    if (!isWorking) return;

    const timer = setInterval(update, intervalMs);
    return () => clearInterval(timer);
  }, [loginRef, logoutRef, isWorking, user?.todayWorkingTime, user?.baseWorkingMinutes, intervalMs]);

  return workingTime;
}
