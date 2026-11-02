import { Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';
import { EmojiPicker } from '../emoji-picker/emoji-picker';

/**
 * Text field with emoji button and send button (Figma 61. Message box main).
 * Enter sends, Shift+Enter starts a new line.
 */
@Component({
  selector: 'app-message-box',
  imports: [EmojiPicker],
  templateUrl: './message-box.html',
  styleUrl: './message-box.scss',
})
export class MessageBox {
  readonly placeholder = input('Nachricht schreiben');
  /** Changes when another chat opens; the field then gets the focus again. */
  readonly focusKey = input<string>('');
  readonly busy = input(false);
  readonly sent = output<string>();

  text = signal('');
  picking = signal(false);
  private field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');

  constructor() {
    effect(() => {
      this.focusKey();
      this.text.set('');
      this.field().nativeElement.focus();
    });
  }


  canSend(): boolean {
    return !this.busy() && this.text().trim().length > 0;
  }


  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    this.send();
  }


  /** Puts the emoji where the cursor is and keeps typing there. */
  insertEmoji(emoji: string): void {
    const field = this.field().nativeElement;
    const start = field.selectionStart ?? this.text().length;
    const end = field.selectionEnd ?? start;
    this.text.set(this.text().slice(0, start) + emoji + this.text().slice(end));
    this.picking.set(false);
    field.focus();
    setTimeout(() => field.setSelectionRange(start + emoji.length, start + emoji.length));
  }


  send(): void {
    if (!this.canSend()) return;
    this.sent.emit(this.text().trim());
    this.text.set('');
    this.field().nativeElement.focus();
  }
}
