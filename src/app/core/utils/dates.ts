// German date texts for chats.

/** "Heute", "Gestern" or "Dienstag, 14. Januar" */
export function dayLabel(date: Date): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, new Date())) return 'Heute';
  if (isSameDay(date, yesterday)) return 'Gestern';
  return formatDate(date, true);
}


export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}


export function formatDate(date: Date, withWeekday: boolean): string {
  const year = date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric';
  const weekday = withWeekday ? 'long' : undefined;
  return date.toLocaleDateString('de-DE', { weekday, day: 'numeric', month: 'long', year });
}
