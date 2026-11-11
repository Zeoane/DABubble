import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Channel } from '../../../core/models/channel';
import { ChannelService } from '../../../core/services/channel.service';
import { MessageService } from '../../../core/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { formatDate, isSameDay } from '../../../core/utils/dates';
import { AddMembers } from '../add-members/add-members';
import { ChannelEdit } from '../channel-edit/channel-edit';
import { ChannelMembers } from '../channel-members/channel-members';
import { MessageBox } from '../message-box/message-box';
import { MessageList } from '../message-list/message-list';

const PREVIEW_MEMBERS = 3;

@Component({
  selector: 'app-channel-view',
  imports: [ChannelEdit, ChannelMembers, AddMembers, MessageList, MessageBox],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.scss',
})
export class ChannelView {
  private channels = inject(ChannelService);
  private users = inject(UserService);
  private messages = inject(MessageService);

  readonly id = input.required<string>();

  loaded = this.channels.loaded;
  channel = computed(() => this.channels.byId(this.id()));

  members = computed(() => {
    const ids = this.channel()?.members ?? [];
    return this.users.users().filter((user) => ids.includes(user.uid));
  });

  preview = computed(() => this.members().slice(0, PREVIEW_MEMBERS));

  panel = signal<'edit' | 'members' | 'add' | null>(null);
  sending = signal(false);
  sendFailed = signal(false);

  /** Closes popups and errors when another channel opens. */
  constructor() {
    effect(() => {
      this.id();
      this.panel.set(null);
      this.sendFailed.set(false);
    });
  }


  /**
   * Sends a message; on failure the error text stays until the next try.
   */
  async send(chatPath: string, text: string): Promise<void> {
    this.sending.set(true);
    this.sendFailed.set(false);
    try {
      await this.messages.send(chatPath, text);
    } catch {
      this.sendFailed.set(true);
    } finally {
      this.sending.set(false);
    }
  }


  /** "Du hast diesen Channel heute erstellt." or "Noah Braun hat … am 14. Januar erstellt." */
  createdText(channel: Channel): string {
    const creator = channel.createdBy === this.users.uid() ? 'Du hast' : `${this.creatorName(channel)} hat`;
    const date = channel.createdAt?.toDate() ?? new Date();
    const when = isSameDay(date, new Date()) ? 'heute' : 'am ' + formatDate(date, false);
    return `${creator} diesen Channel ${when} erstellt. Das ist der Anfang des Channels`;
  }


  /** Name of the member who created the channel. */
  private creatorName(channel: Channel): string {
    return this.users.users().find((user) => user.uid === channel.createdBy)?.name ?? 'Jemand';
  }
}
