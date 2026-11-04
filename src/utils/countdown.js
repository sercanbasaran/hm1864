// 10 January 2027 at midnight in Istanbul (UTC+03:00).
export const SELECTION_DATE = Date.parse('2027-01-10T00:00:00+03:00');
export function countdownParts(now) {
  const remaining = Math.max(0, Math.floor((SELECTION_DATE - now) / 1000));
  return { days: Math.floor(remaining / 86400), hours: Math.floor(remaining / 3600) % 24, minutes: Math.floor(remaining / 60) % 60, seconds: remaining % 60 };
}
