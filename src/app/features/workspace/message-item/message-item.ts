import { Component, computed, inject, input, signal } from '@angular/core';
import { Message } from '../../../core/models/message';
import { AppUser } from '../../../core/models/user-profile';
import { MessageService } from '../../../core/services/message.service';
import { RecentEmojisService } from '../../../core/services/recent-emojis.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { EmojiPicker } from '../emoji-picker/emoji-picker';
import { MessageReactions } from '../message-reactions/message-reactions';

/**
 * One message: others on the left in a light bubble, own messages on the right in purple
 * (Figma 48. Messages main chat). On hover a reaction bar with the two last used emojis.
 */
@Component({
  selector: 'app-message-item',
  imports: [Avatar, EmojiPicker, MessageReactions],
  templateUrl: './message-item.html',
  styleUrl: './message-item.scss',
  host: { '[class.own]': 'own()', '[class.picking]': 'picking()' },
})
export class MessageItem {
  private messages = inject(MessageService);
  private users = inject(UserService);
  recent = inject(RecentEmojisService);

  readonly message = input.required<Message>();
  readonly chatPath = input.required<string>();
  readonly author = input<AppUser>();
  readonly own = input(false);

  picking = signal(false);

  name = computed(() => this.author()?.name ?? 'Unbekannt');
  avatar = computed(() => this.author()?.avatar ?? 'img/avatars/avatar-1.svg');

  /** "14:25 Uhr" */
  time = computed(() => {
    const date = this.message().createdAt?.toDate() ?? new Date();
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
  });


  /** Adds the emoji, or takes the own reaction back if it is already there. */
  toggle(emoji: string): void {
    this.picking.set(false);
    const mine = this.message().reactions?.[emoji]?.includes(this.users.uid() ?? '') ?? false;
    if (!mine) this.recent.use(emoji);
    this.messages.react(this.chatPath(), this.message().id, emoji, !mine).catch(() => undefined);
  }
}
