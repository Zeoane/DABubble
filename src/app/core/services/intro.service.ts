import { Injectable } from '@angular/core';

const PLAYED_KEY = 'dabubble-intro-played';

@Injectable({ providedIn: 'root' })
export class IntroService {
  private played = this.readPlayed();


  /**
   * True only on the first call in this browser tab (reloads included),
   * and never when the user prefers reduced motion.
   */
  shouldPlay(): boolean {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const play = !this.played && !reduced;
    this.played = true;
    this.savePlayed();
    return play;
  }


  /** Reads whether the intro already ran in this tab before a reload. */
  private readPlayed(): boolean {
    try {
      return sessionStorage.getItem(PLAYED_KEY) === '1';
    } catch {
      return false;
    }
  }


  /** Remembers for this tab that the intro already ran. */
  private savePlayed(): void {
    try {
      sessionStorage.setItem(PLAYED_KEY, '1');
    } catch {
      return;
    }
  }
}
