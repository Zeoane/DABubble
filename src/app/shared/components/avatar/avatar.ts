import { Component, input, linkedSignal } from '@angular/core';
import { OnlineStatus } from '../../../core/services/presence.service';

const FALLBACK = 'img/avatars/avatar-1.svg';

/**
 * Round profile picture with the status dot: green when online, gray when away, none when offline.
 */
@Component({
  selector: 'app-avatar',
  template: `
    <img [src]="image()" alt="" referrerpolicy="no-referrer" (error)="useFallback()" />
    @if (status() !== 'offline') {
      <span class="online" [class.away]="status() === 'away'"></span>
    }
  `,
  styleUrl: './avatar.scss',
  host: { '[style.--size.px]': 'size()' },
})
export class Avatar {
  readonly src = input.required<string>();
  readonly size = input(50);
  readonly status = input<OnlineStatus>('offline');

  /** Shown picture; falls back to a default avatar if e.g. a Google photo cannot load. */
  readonly image = linkedSignal(() => this.src());


  useFallback(): void {
    this.image.set(FALLBACK);
  }
}
