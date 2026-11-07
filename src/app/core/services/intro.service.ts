import { Injectable } from '@angular/core';

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
