import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Channel } from '../../../core/models/channel';
import { ChannelService } from '../../../core/services/channel.service';
import { UserService } from '../../../core/services/user.service';
import { AddMembers } from '../add-members/add-members';
import { ChannelEdit } from '../channel-edit/channel-edit';
import { ChannelMembers } from '../channel-members/channel-members';

const PREVIEW_MEMBERS = 3;

/**
 * Open channel: header with name and members, intro at the start of the channel
 * (Figma 10 – Desktop Office Team), plus the channel popups. Messages follow in the next step.
 */
@Component({
  selector: 'app-channel-view',
  imports: [ChannelEdit, ChannelMembers, AddMembers],
  templateUrl: './channel-view.html',
  styleUrl: './channel-view.scss',
})
export class ChannelView {
  private channels = inject(ChannelService);
  private users = inject(UserService);

  /** Route parameter ":id". */
  readonly id = input.required<string>();

  loaded = this.channels.loaded;
  channel = computed(() => this.channels.byId(this.id()));

  members = computed(() => {
    const ids = this.channel()?.members ?? [];
    return this.users.users().filter((user) => ids.includes(user.uid));
  });

  preview = computed(() => this.members().slice(0, PREVIEW_MEMBERS));

  /** Open popup: channel details, member list or "Leute hinzufügen". */
  panel = signal<'edit' | 'members' | 'add' | null>(null);

  constructor() {
    effect(() => {
      this.id();
      this.panel.set(null);
    });
  }


  /** "Du hast diesen Channel heute erstellt." or "Noah Braun hat … am 14. Januar erstellt." */
  createdText(channel: Channel): string {
    const creator = channel.createdBy === this.users.uid() ? 'Du hast' : `${this.creatorName(channel)} hat`;
    return `${creator} diesen Channel ${createdWhen(channel)} erstellt. Das ist der Anfang des Channels`;
  }


  private creatorName(channel: Channel): string {
    return this.users.users().find((user) => user.uid === channel.createdBy)?.name ?? 'Jemand';
  }
}


function createdWhen(channel: Channel): string {
  const date = channel.createdAt?.toDate() ?? new Date();
  if (date.toDateString() === new Date().toDateString()) return 'heute';
  return 'am ' + date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}
