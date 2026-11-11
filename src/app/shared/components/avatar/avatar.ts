import { Component, input, linkedSignal } from '@angular/core';
import { OnlineStatus } from '../../../core/services/presence.service';

const FALLBACK = 'img/avatars/avatar-1.svg';

@Component({
  selector: 'app-avatar',
  template: `
    <img [src]="image()" alt="" referrerpolicy="no-referrer" (error)="useFallback()" />
    @if (status(); as status) {
      <span class="status" [class.online]="status === 'online'"></span>
    }
  `,
  styleUrl: './avatar.scss',
  host: { '[style.--size.px]': 'size()' },
})
export class Avatar {
  readonly src = input.required<string>();
  readonly size = input(50);
  readonly status = input<OnlineStatus | null>(null);

  readonly image = linkedSignal(() => this.src());


  /** Shows the default avatar when the picture cannot be loaded. */
  useFallback(): void {
    this.image.set(FALLBACK);
  }
}
