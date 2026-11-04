import { Injectable } from '@angular/core';

/**
 * Remembers whether the intro already ran, so it only plays once per visit.
 */
@Injectable({ providedIn: 'root' })
export class IntroService {
  private played = false;


  /**
   * True only on the first call, and never when the user prefers reduced motion.
   */
  shouldPlay(): boolean {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const play = !this.played && !reduced;
    this.played = true;
    return play;
  }
}
