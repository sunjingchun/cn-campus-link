import { copy, fill } from "@/lib/copy";
import { t, type Locale } from "@/lib/locale";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(timestamp: number, locale: Locale, now = Date.now()): string {
  const delta = Math.max(0, now - timestamp);
  if (delta < MINUTE) return t(copy.justNow, locale);
  if (delta < HOUR) return fill(copy.minutesAgo, locale, { n: Math.floor(delta / MINUTE) });
  if (delta < DAY) return fill(copy.hoursAgo, locale, { n: Math.floor(delta / HOUR) });
  if (delta < 2 * DAY) return t(copy.yesterday, locale);
  if (delta < 30 * DAY) return fill(copy.daysAgo, locale, { n: Math.floor(delta / DAY) });
  const months = Math.floor(delta / (30 * DAY));
  if (months < 12) return fill(copy.monthsAgo, locale, { n: months });
  return fill(copy.yearsAgo, locale, { n: Math.floor(delta / (365 * DAY)) });
}
