import { Injectable, signal } from '@angular/core';

export const EMOJIS = [
  '🚀', '✅', '🤓', '🙌', '👍', '❤️', '😀', '😂',
  '😊', '😍', '🤔', '😮', '😢', '😡', '👏', '🙏',
  '🎉', '🔥', '💯', '👀', '💡', '☕', '👋', '🤝',
];

const STORAGE_KEY = 'dabubble-recent-emojis';
const DEFAULT_RECENT = ['✅', '👍'];

@Injectable({ providedIn: 'root' })
export class RecentEmojisService {
  readonly recent = signal<string[]>(load());


  /** Puts the emoji first in the list of the two last used ones and remembers it. */
  use(emoji: string): void {
    const next = [emoji, ...this.recent().filter((e) => e !== emoji)].slice(0, 2);
    this.recent.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      return;
    }
  }
}


/** Last used emojis from the browser storage, or the defaults. */
function load(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return Array.isArray(saved) && saved.length === 2 ? saved : DEFAULT_RECENT;
  } catch {
    return DEFAULT_RECENT;
  }
}
