import { useState, useEffect } from 'react';

export const INDIAN_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's date string in 'YYYY-MM-DD' formatted strictly in Indian Standard Time (Asia/Kolkata).
 */
export function getTodayIST_YYYYMMDD(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // en-CA produces YYYY-MM-DD
}

/**
 * Returns tomorrow's date string in 'YYYY-MM-DD' formatted strictly in Indian Standard Time.
 */
export function getTomorrowIST_YYYYMMDD(): string {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

/**
 * React Hook that provides live, ticking Indian Standard Time (IST) clock and calendar date.
 */
export function useLiveISTClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fullDateString = now.toLocaleDateString('en-IN', {
    timeZone: INDIAN_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const shortDateString = now.toLocaleDateString('en-IN', {
    timeZone: INDIAN_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timeString = now.toLocaleTimeString('en-IN', {
    timeZone: INDIAN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const timeWithSeconds = now.toLocaleTimeString('en-IN', {
    timeZone: INDIAN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return {
    fullDateString,
    shortDateString,
    timeString,
    timeWithSeconds,
    rawDate: now,
  };
}

/**
 * Formats any date input into Indian date display (e.g. "03 Oct 2026" or "Saturday, 3 October 2026")
 */
export function formatISTDate(
  dateInput?: string | Date | null,
  format: 'short' | 'long' | 'medium' = 'medium'
): string {
  if (!dateInput) return '';

  let dateObj: Date;
  if (typeof dateInput === 'string') {
    const clean = dateInput.trim();
    if (!clean) return '';
    const lower = clean.toLowerCase();
    if (lower === 'today') return 'Today';
    if (lower === 'tomorrow') return 'Tomorrow';
    if (lower === 'yesterday') return 'Yesterday';

    // Parse YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
      const parts = clean.substring(0, 10).split('-').map(Number);
      dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      dateObj = new Date(clean);
    }
  } else {
    dateObj = dateInput;
  }

  if (isNaN(dateObj.getTime())) return String(dateInput);

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-IN', {
      timeZone: INDIAN_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('en-IN', {
      timeZone: INDIAN_TIMEZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Medium (default): "03 Oct 2026"
  return dateObj.toLocaleDateString('en-IN', {
    timeZone: INDIAN_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats time string or 24-hour time to Indian Standard 12-hour format with AM/PM (e.g. "04:30 PM")
 */
export function formatISTTime(timeStr?: string | null): string {
  if (!timeStr || !timeStr.trim()) return '11:00 AM';
  const clean = timeStr.trim().toUpperCase();

  // If already in 12h format with AM/PM (e.g., "11:00 AM" or "4:30 PM")
  const match12 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (match12) {
    const hours = match12[1].padStart(2, '0');
    const mins = match12[2];
    const ampm = match12[3].toUpperCase();
    return `${hours}:${mins} ${ampm}`;
  }

  // If in 24h format (e.g., "16:30" or "09:15:00")
  const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    let hours = parseInt(match24[1], 10);
    const mins = match24[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${mins} ${ampm}`;
  }

  return timeStr;
}

/**
 * Human-friendly relative date display: "Today", "Tomorrow", "Yesterday", or "03 Oct 2026" in IST.
 */
export function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return '';
  const clean = dateStr.trim();
  const lower = clean.toLowerCase();

  if (lower === 'today') return 'Today';
  if (lower === 'tomorrow') return 'Tomorrow';
  if (lower === 'yesterday') return 'Yesterday';

  const todayIST = getTodayIST_YYYYMMDD();
  const tomorrowIST = getTomorrowIST_YYYYMMDD();

  let iso = clean;
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    iso = clean.substring(0, 10);
  }

  if (iso === todayIST) return 'Today';
  if (iso === tomorrowIST) return 'Tomorrow';

  return formatISTDate(clean, 'medium');
}
