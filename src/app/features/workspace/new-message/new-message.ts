import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChannelService } from '../../../core/services/channel.service';
import { MessageService } from '../../../core/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { MentionList, MentionOption } from '../mention-list/mention-list';
import { MessageBox } from '../message-box/message-box';

const LIST_KEYS = ['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'];

interface Recipient {
  kind: 'channel' | 'person';
  id: string;
  label: string;
}

@Component({
  selector: 'app-new-message',
  imports: [MentionList, MessageBox],
  templateUrl: './new-message.html',
  styleUrl: './new-message.scss',
})
export class NewMessage {
  private users = inject(UserService);
  private channels = inject(ChannelService);
  private messages = inject(MessageService);
  private router = inject(Router);

  query = signal('');
  recipient = signal<Recipient | null>(null);
  listOpen = signal(false);
  active = signal(0);
  sending = signal(false);
  error = signal('');

  searchesChannels = computed(() => this.query().trimStart().startsWith('#'));

  options = computed<MentionOption[]>(() => {
    const text = this.query().trim();
    if (!text || this.recipient()) return [];
    const term = text.replace(/^[#@]/, '').toLowerCase();
    return this.searchesChannels() ? this.channelOptions(term) : this.people(term);
  });

  showList = computed(() => this.listOpen() && !this.recipient() && this.query().trim().length > 0);


  /** Takes over the typed text and forgets an earlier recipient. */
  onInput(value: string): void {
    this.query.set(value);
    this.recipient.set(null);
    this.listOpen.set(true);
    this.active.set(0);
    this.error.set('');
  }


  /** Arrow keys, Enter, Tab and Escape inside the recipient list. */
  onKeydown(event: KeyboardEvent): void {
    if (!this.showList() || !LIST_KEYS.includes(event.key)) return;
    event.preventDefault();
    const count = this.options().length;
    if (event.key === 'Escape') this.listOpen.set(false);
    else if (event.key === 'ArrowDown') this.active.update((index) => (index + 1) % Math.max(count, 1));
    else if (event.key === 'ArrowUp') this.active.update((index) => (index - 1 + count) % Math.max(count, 1));
    else if (count) this.pick(this.options()[this.active()]);
  }


  /** Sets the chosen channel or person as recipient. */
  pick(option: MentionOption): void {
    const channel = this.searchesChannels();
    const label = (channel ? '#' : '@') + option.value;
    this.recipient.set({ kind: channel ? 'channel' : 'person', id: option.id, label });
    this.query.set(label);
    this.listOpen.set(false);
    this.error.set('');
  }


  /** Sends to the chosen channel or person and opens that chat. */
  async send(text: string): Promise<void> {
    const recipient = this.recipient();
    const me = this.users.uid();
    if (!recipient || !me) return this.error.set('*Bitte wähle zuerst einen Channel oder eine Person aus.');
    const chatPath = recipient.kind === 'channel' ? 'channels/' + recipient.id : this.messages.directPath(me, recipient.id);
    this.sending.set(true);
    try {
      await this.messages.send(chatPath, text);
      const route = recipient.kind === 'channel' ? '/workspace/channel' : '/workspace/dm';
      this.router.navigate([route, recipient.id]);
    } catch {
      this.error.set('*Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.');
    } finally {
      this.sending.set(false);
    }
  }


  /** Channels the member is in; only there can they write. */
  private channelOptions(term: string): MentionOption[] {
    return this.channels
      .mine()
      .filter((channel) => channel.name.toLowerCase().includes(term))
      .map((channel) => ({ id: channel.id, value: channel.name, label: channel.name }));
  }


  /** Everyone whose name or e-mail contains the term, yourself first as in the menu. */
  private people(term: string): MentionOption[] {
    const me = this.users.uid();
    return this.users
      .contacts()
      .filter((user) => user.name.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term))
      .map((user) => ({
        id: user.uid,
        value: user.name,
        label: user.uid === me ? user.name + ' (Du)' : user.name,
        avatar: user.avatar,
      }));
  }
}
