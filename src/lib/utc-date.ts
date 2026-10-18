export function utcDateOf(moment: Date): string {
  return moment.toISOString().slice(0, 10);
}

export function nextUtcMidnight(moment: Date): Date {
  return new Date(Date.UTC(moment.getUTCFullYear(), moment.getUTCMonth(), moment.getUTCDate() + 1));
}
