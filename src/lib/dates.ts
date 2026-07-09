/** Local-date helpers — avoid UTC day shifts from toISOString(). */

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Format a Date as local yyyy-MM-dd */
export function toLocalDateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Parse yyyy-MM-dd as local calendar day (noon to avoid DST edge cases). */
export function parseLocalDateKey(dateKey: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!m) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  return new Date(y, mo, day, 12, 0, 0, 0);
}

/** Inclusive local-day range for DB queries on DateTime columns. */
export function localDayRange(dateKey: string): { start: Date; end: Date } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!m) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  return {
    start: new Date(y, mo, day, 0, 0, 0, 0),
    end: new Date(y, mo, day, 23, 59, 59, 999),
  };
}

export function isValidDateKey(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  try {
    parseLocalDateKey(value);
    return true;
  } catch {
    return false;
  }
}

export function addDaysToKey(dateKey: string, days: number): string {
  const d = parseLocalDateKey(dateKey);
  d.setDate(d.getDate() + days);
  return toLocalDateKey(d);
}
