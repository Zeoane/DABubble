import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
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
 * (Figma 48. Messages main chat). On hover a reaction bar with the two last used emojis
 * and, in the main chat, "Antworten" to open the thread (Figma 52B).
 */
@Component({
  selector: 'app-message-item',
  imports: [Avatar, EmojiPicker, MessageReactions],
  templateUrl: './message-item.html',
  styleUrl: './message-item.scss',
  host: { '[class.own]': 'own()', '[class.picking]': 'picking()', '[class.compact]': '!threadable()' },
})
export class MessageItem {
  private messages = inject(MessageService);
  private users = inject(UserService);
  private router = inject(Router);
  recent = inject(RecentEmojisService);

  readonly message = input.required<Message>();
  /** Collection the message is in, e.g. "channels/abc/messages". */
  readonly listPath = input.required<string>();
  readonly author = input<AppUser>();
  readonly own = input(false);
  /** False inside the thread: no "Antworten", narrower layout. */
  readonly threadable = input(true);

  picking = signal(false);

  name = computed(() => this.author()?.name ?? 'Unbekannt');
  avatar = computed(() => this.author()?.avatar ?? 'img/avatars/avatar-1.svg');

  /** "14:25 Uhr" */
  time = computed(() => clock(this.message().createdAt?.toDate()) + ' Uhr');

  /** "2 Antworten" / "1 Antwort" */
  replies = computed(() => {
    const count = this.message().replyCount ?? 0;
    return count === 1 ? '1 Antwort' : count + ' Antworten';
  });

  lastReply = computed(() => clock(this.message().lastReplyAt?.toDate()));


  /** Adds the emoji, or takes the own reaction back if it is already there. */
  toggle(emoji: string): void {
    this.picking.set(false);
    const mine = this.message().reactions?.[emoji]?.includes(this.users.uid() ?? '') ?? false;
    if (!mine) this.recent.use(emoji);
    this.messages.react(this.listPath(), this.message().id, emoji, !mine).catch(() => undefined);
  }


  /** Opens the thread next to the chat; the URL keeps it (?thread=id). */
  openThread(): void {
    const chatUrl = this.router.url.split('?')[0];
    this.router.navigate([chatUrl], { queryParams: { thread: this.message().id } });
  }
}


/** "14:25" */
function clock(date = new Date()): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}
