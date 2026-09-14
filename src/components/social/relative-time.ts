const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(timestamp: number, now = Date.now()): string {
  const delta = Math.max(0, now - timestamp);
  if (delta < MINUTE) return "刚刚";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)} 分钟前`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)} 小时前`;
  if (delta < 2 * DAY) return "昨天";
  if (delta < 30 * DAY) return `${Math.floor(delta / DAY)} 天前`;
  const months = Math.floor(delta / (30 * DAY));
  if (months < 12) return `${months} 个月前`;
  return `${Math.floor(delta / (365 * DAY))} 年前`;
}
