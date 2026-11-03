import { Component, ElementRef, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { ChannelService } from '../../../core/services/channel.service';
import { UserService } from '../../../core/services/user.service';
import { MentionTrigger, findTrigger } from '../../../core/utils/mentions';
import { EmojiPicker } from '../emoji-picker/emoji-picker';
import { MentionList, MentionOption } from '../mention-list/mention-list';

const LIST_KEYS = ['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'];

/**
 * Text field with emoji, "@" and send button (Figma 61. Message box main).
 * Enter sends, Shift+Enter starts a new line. Typing "@" suggests people,
 * "#" suggests channels (Figma "Tagging person").
 */
@Component({
  selector: 'app-message-box',
  imports: [EmojiPicker, MentionList],
  templateUrl: './message-box.html',
  styleUrl: './message-box.scss',
})
export class MessageBox {
  private users = inject(UserService);
  private channels = inject(ChannelService);

  readonly placeholder = input('Nachricht schreiben');
  /** Changes when another chat opens; the field then gets the focus again. */
  readonly focusKey = input<string>('');
  readonly busy = input(false);
  readonly sent = output<string>();

  text = signal('');
  picking = signal(false);
  trigger = signal<MentionTrigger | null>(null);
  active = signal(0);
  private field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');

  options = computed<MentionOption[]>(() => {
    const trigger = this.trigger();
    if (!trigger) return [];
    const query = trigger.query.toLowerCase();
    const all = trigger.char === '@' ? this.people() : this.channelOptions();
    return all.filter((option) => option.value.toLowerCase().includes(query));
  });

  constructor() {
    effect(() => {
      this.focusKey();
      this.text.set('');
      this.trigger.set(null);
      this.field().nativeElement.focus();
    });
  }


  canSend(): boolean {
    return !this.busy() && this.text().trim().length > 0;
  }


  onInput(): void {
    const field = this.field().nativeElement;
    this.text.set(field.value);
    this.trigger.set(findTrigger(field.value, field.selectionStart ?? field.value.length));
    this.active.set(0);
  }


  onKeydown(event: KeyboardEvent): void {
    if (this.trigger() && LIST_KEYS.includes(event.key)) return this.onListKey(event);
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    this.send();
  }


  /** Replaces the typed "@So" with "@Sofia Müller ". */
  pick(option: MentionOption): void {
    const trigger = this.trigger();
    if (!trigger) return;
    const cursor = trigger.start + 1 + trigger.query.length;
    this.replace(trigger.start, cursor, trigger.char + option.value + ' ');
    this.trigger.set(null);
  }


  /**
   * The "@" button: starts a mention at the cursor. A second click closes the
   * list again and takes back the "@" if nothing was typed after it.
   */
  toggleMention(): void {
    const trigger = this.trigger();
    if (!trigger) return this.startMention();
    if (!trigger.query) this.replace(trigger.start, trigger.start + 1, '');
    this.trigger.set(null);
  }


  private startMention(): void {
    const field = this.field().nativeElement;
    const start = field.selectionStart ?? this.text().length;
    const before = this.text().slice(0, start);
    this.replace(start, field.selectionEnd ?? start, before && !/\s$/.test(before) ? ' @' : '@');
    this.onInput();
  }


  /** Puts the emoji where the cursor is and keeps typing there. */
  insertEmoji(emoji: string): void {
    const field = this.field().nativeElement;
    const start = field.selectionStart ?? this.text().length;
    this.replace(start, field.selectionEnd ?? start, emoji);
    this.picking.set(false);
  }


  send(): void {
    if (!this.canSend()) return;
    this.sent.emit(this.text().trim());
    this.text.set('');
    this.trigger.set(null);
    this.field().nativeElement.focus();
  }


  private onListKey(event: KeyboardEvent): void {
    event.preventDefault();
    const count = this.options().length;
    if (event.key === 'Escape') this.trigger.set(null);
    else if (event.key === 'ArrowDown') this.active.update((index) => (index + 1) % Math.max(count, 1));
    else if (event.key === 'ArrowUp') this.active.update((index) => (index - 1 + count) % Math.max(count, 1));
    else if (count) this.pick(this.options()[this.active()]);
    else this.trigger.set(null);
  }


  /** Replaces text[start, end) and puts the cursor behind the new text. */
  private replace(start: number, end: number, insert: string): void {
    const field = this.field().nativeElement;
    const text = this.text();
    this.text.set(text.slice(0, start) + insert + text.slice(end));
    field.value = this.text();
    field.focus();
    const cursor = start + insert.length;
    field.setSelectionRange(cursor, cursor);
  }


  /** Everyone, yourself first as in the menu. */
  private people(): MentionOption[] {
    const me = this.users.uid();
    const sorted = [...this.users.users()].sort((a, b) => Number(b.uid === me) - Number(a.uid === me));
    return sorted.map((user) => ({
      id: user.uid,
      value: user.name,
      label: user.uid === me ? user.name + ' (Du)' : user.name,
      avatar: user.avatar,
    }));
  }


  private channelOptions(): MentionOption[] {
    return this.channels.mine().map((channel) => ({ id: channel.id, value: channel.name, label: channel.name }));
  }
}
