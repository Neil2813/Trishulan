const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export function getWeeklyStart(now = new Date()): Date {
  return new Date(now.getTime() - WEEK_IN_MS);
}

export function buildWeeklyTrend(timestamps: Date[]) {
  const counts = Array<number>(7).fill(0);
  for (const timestamp of timestamps) {
    counts[timestamp.getUTCDay()] += 1;
  }
  return DAY_NAMES.map((day, index) => ({ day, count: counts[index] }));
}
