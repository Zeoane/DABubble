/** "Heute", "Gestern" or "Dienstag, 14. Januar" */
export function dayLabel(date: Date): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, new Date())) return 'Heute';
  if (isSameDay(date, yesterday)) return 'Gestern';
  return formatDate(date, true);
}


/** True if both dates are on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}


/** German date such as "Dienstag, 14. Januar"; the year only if it is not the current one. */
export function formatDate(date: Date, withWeekday: boolean): string {
  const year = date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric';
  const weekday = withWeekday ? 'long' : undefined;
  return date.toLocaleDateString('de-DE', { weekday, day: 'numeric', month: 'long', year });
}
