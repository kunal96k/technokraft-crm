/**
 * Utilities for Work Shift Schedule (Default: 10:00 AM – 04:00 PM with 15-min grace period)
 */

export const DEFAULT_SHIFT_START = '10:00 AM';
export const DEFAULT_SHIFT_END = '04:00 PM';
export const DEFAULT_SHIFT_START_INPUT = '10:00';
export const DEFAULT_SHIFT_END_INPUT = '16:00';
export const GRACE_PERIOD_MINUTES = 15;

/**
 * Converts a time string (e.g. "10:00 AM", "04:00 PM", "16:00", "10:00:00")
 * to HTML input[type="time"] format ("HH:mm").
 */
export function toInputTime(val?: string | null, fallback = '10:00'): string {
  if (!val || !val.trim()) return fallback;
  const raw = val.trim();

  // If already 24-hr format "HH:mm"
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;
  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw.substring(0, 5);

  // Match 12-hour format e.g. "10:00 AM" or "4:00 PM"
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = match[3]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  return fallback;
}

/**
 * Converts an input time string ("10:00", "16:00") to standardized 12-hour display format ("10:00 AM", "04:00 PM").
 */
export function toDisplayTime(val?: string | null, fallback = '10:00 AM'): string {
  if (!val || !val.trim()) return fallback;
  const raw = val.trim();

  // If already formatted with AM/PM
  if (/[AP]M/i.test(raw)) {
    return raw.replace(/([AP]M)/i, ' $1').replace(/\s+/g, ' ').trim().toUpperCase();
  }

  // Parse "HH:mm" or "HH:mm:ss"
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = hours >= 12 ? 'PM' : 'AM';

    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    return `${String(hours).padStart(2, '0')}:${minutes} ${meridiem}`;
  }

  return fallback;
}

/**
 * Formats a shift schedule display string e.g. "10:00 AM – 04:00 PM"
 */
export function formatShiftSchedule(startTime?: string | null, endTime?: string | null): string {
  const start = toDisplayTime(startTime, DEFAULT_SHIFT_START);
  const end = toDisplayTime(endTime, DEFAULT_SHIFT_END);
  return `${start} – ${end}`;
}

/**
 * Computes late threshold string (+15 mins from shift start), e.g. "10:15 AM"
 */
export function getLateCutoffDisplay(startTime?: string | null): string {
  const input = toInputTime(startTime, DEFAULT_SHIFT_START_INPUT);
  const [hStr, mStr] = input.split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10) + GRACE_PERIOD_MINUTES;

  if (m >= 60) {
    h = (h + Math.floor(m / 60)) % 24;
    m = m % 60;
  }

  return toDisplayTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, '10:15 AM');
}
