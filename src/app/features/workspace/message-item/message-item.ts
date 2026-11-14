import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '../../../core/models/message';
import { AppUser } from '../../../core/models/user-profile';
import { ChannelService } from '../../../core/services/channel.service';
import { MessageService } from '../../../core/services/message.service';
import { ProfileViewService } from '../../../core/services/profile-view.service';
import { RecentEmojisService } from '../../../core/services/recent-emojis.service';
import { UserService } from '../../../core/services/user.service';
import { splitMentions } from '../../../core/utils/mentions';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { EmojiPicker } from '../emoji-picker/emoji-picker';
import { MessageEdit } from '../message-edit/message-edit';
import { MessageReactions } from '../message-reactions/message-reactions';

@Component({
  selector: 'app-message-item',
  imports: [Avatar, EmojiPicker, MessageEdit, MessageReactions],
  templateUrl: './message-item.html',
  styleUrl: './message-item.scss',
  host: {
    '[class.own]': 'own()',
    '[class.picking]': 'picking() || menuOpen()',
    '[class.compact]': '!threadable()',
    '[class.editing]': 'editing()',
    '(document:keydown.escape)': 'menuOpen.set(false)',
  },
})
export class MessageItem {
  private messages = inject(MessageService);
  private users = inject(UserService);
  private router = inject(Router);
  private channels = inject(ChannelService);
  private profiles = inject(ProfileViewService);
  recent = inject(RecentEmojisService);

  readonly message = input.required<Message>();
  readonly listPath = input.required<string>();
  readonly author = input<AppUser>();
  readonly own = input(false);
  readonly threadable = input(true);

  picking = signal(false);
  menuOpen = signal(false);
  editing = signal(false);

  name = computed(() => this.author()?.name ?? 'Unbekannt');
  avatar = computed(() => this.author()?.avatar ?? 'img/avatars/avatar-1.svg');

  parts = computed(() => {
    const people = this.users.users().map((user) => '@' + user.name);
    const channels = this.channels.all().map((channel) => '#' + channel.name);
    return splitMentions(this.message().text, [...people, ...channels]);
  });

  time = computed(() => clock(this.message().createdAt?.toDate()) + ' Uhr');

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


  /** Closes the menu and shows the edit box. */
  startEdit(): void {
    this.menuOpen.set(false);
    this.editing.set(true);
  }


  /** Shows the new text right away; on an error the old one comes back from Firestore. */
  saveEdit(text: string): void {
    this.editing.set(false);
    this.messages.edit(this.listPath(), this.message().id, text).catch(() => undefined);
  }


  /** Profile card of the author (Figma 65. Profile view other users). */
  openProfile(): void {
    this.profiles.open(this.message().authorId);
  }


  /** "@Name" opens the profile card of the member, "#Channel" opens the channel. */
  openMention(token: string): void {
    const name = token.slice(1);
    if (token.startsWith('@')) {
      const user = this.users.users().find((member) => member.name === name);
      if (user) this.profiles.open(user.uid);
      return;
    }
    const channel = this.channels.all().find((entry) => entry.name === name);
    if (!channel) return;
    this.channels
      .join(channel.id)
      .then(() => this.router.navigate(['/workspace/channel', channel.id]))
      .catch(() => undefined);
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
