import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MessageService } from '../../../core/services/message.service';
import { ProfileViewService } from '../../../core/services/profile-view.service';
import { PresenceService } from '../../../core/services/presence.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { MessageBox } from '../message-box/message-box';
import { MessageList } from '../message-list/message-list';

@Component({
  selector: 'app-direct-view',
  imports: [Avatar, MessageList, MessageBox],
  templateUrl: './direct-view.html',
  styleUrl: './direct-view.scss',
})
export class DirectView {
  private users = inject(UserService);
  private messages = inject(MessageService);
  profiles = inject(ProfileViewService);
  presence = inject(PresenceService);

  readonly uid = input.required<string>();

  contact = computed(() => this.users.users().find((user) => user.uid === this.uid()));
  isMe = computed(() => this.uid() === this.users.uid());
  usersLoaded = computed(() => this.users.users().length > 0);

  path = computed(() => {
    const me = this.users.uid();
    return me ? this.messages.directPath(me, this.uid()) : null;
  });

  sending = signal(false);
  sendFailed = signal(false);

  /** Hides an old send error when another chat opens. */
  constructor() {
    effect(() => {
      this.uid();
      this.sendFailed.set(false);
    });
  }


  /** Sends a message; on failure the error text stays until the next try. */
  async send(path: string, text: string): Promise<void> {
    this.sending.set(true);
    this.sendFailed.set(false);
    try {
      await this.messages.send(path, text);
    } catch {
      this.sendFailed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}
