import { Component, input, linkedSignal } from '@angular/core';

const FALLBACK = 'img/avatars/avatar-1.svg';

/**
 * Round profile picture, optionally with the green online dot.
 */
@Component({
  selector: 'app-avatar',
  template: `
    <img [src]="image()" alt="" referrerpolicy="no-referrer" (error)="useFallback()" />
    @if (online()) {
      <span class="online"></span>
    }
  `,
  styleUrl: './avatar.scss',
  host: { '[style.--size.px]': 'size()' },
})
export class Avatar {
  readonly src = input.required<string>();
  readonly size = input(50);
  readonly online = input(false);

  /** Shown picture; falls back to a default avatar if e.g. a Google photo cannot load. */
  readonly image = linkedSignal(() => this.src());


  useFallback(): void {
    this.image.set(FALLBACK);
  }
}
