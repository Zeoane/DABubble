import { Component, computed, input } from '@angular/core';
import { Message } from '../../../core/models/message';
import { AppUser } from '../../../core/models/user-profile';
import { Avatar } from '../../../shared/components/avatar/avatar';

/**
 * One message: others on the left in a light bubble, own messages on the right in purple
 * (Figma 48. Messages main chat).
 */
@Component({
  selector: 'app-message-item',
  imports: [Avatar],
  templateUrl: './message-item.html',
  styleUrl: './message-item.scss',
  host: { '[class.own]': 'own()' },
})
export class MessageItem {
  readonly message = input.required<Message>();
  readonly author = input<AppUser>();
  readonly own = input(false);

  name = computed(() => this.author()?.name ?? 'Unbekannt');
  avatar = computed(() => this.author()?.avatar ?? 'img/avatars/avatar-1.svg');

  /** "14:25 Uhr" */
  time = computed(() => {
    const date = this.message().createdAt?.toDate() ?? new Date();
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
  });
}
