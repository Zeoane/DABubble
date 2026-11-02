import { Injectable, signal } from '@angular/core';

/** Emojis to pick from, in messages and as reactions (the first four are from Figma). */
export const EMOJIS = [
  '🚀', '✅', '🤓', '🙌', '👍', '❤️', '😀', '😂',
  '😊', '😍', '🤔', '😮', '😢', '😡', '👏', '🙏',
  '🎉', '🔥', '💯', '👀', '💡', '☕', '👋', '🤝',
];

const STORAGE_KEY = 'dabubble-recent-emojis';
const DEFAULT_RECENT = ['✅', '👍'];

/**
 * The two emojis used last for reactions (Figma reaction bar: check mark and thumbs up
 * until something else was used). Kept in this browser.
 */
@Injectable({ providedIn: 'root' })
export class RecentEmojisService {
  readonly recent = signal<string[]>(load());


  use(emoji: string): void {
    const next = [emoji, ...this.recent().filter((e) => e !== emoji)].slice(0, 2);
    this.recent.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode: the choice simply is not remembered.
    }
  }
}


function load(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return Array.isArray(saved) && saved.length === 2 ? saved : DEFAULT_RECENT;
  } catch {
    return DEFAULT_RECENT;
  }
}
