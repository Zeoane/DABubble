import { Component, ElementRef, afterNextRender, input, output, signal, viewChild } from '@angular/core';
import { EmojiPicker } from '../emoji-picker/emoji-picker';

/**
 * Editing an own message in place (Figma 13. Desktop edit message view,
 * 48. Messages main chat "Edit message"): text field, emoji, "Abbrechen" and "Speichern".
 * Enter saves, Shift+Enter starts a new line, Escape cancels.
 */
@Component({
  selector: 'app-message-edit',
  imports: [EmojiPicker],
  templateUrl: './message-edit.html',
  styleUrl: './message-edit.scss',
})
export class MessageEdit {
  /** Text the message has now. */
  readonly initial = input.required<string>();
  readonly saved = output<string>();
  readonly cancelled = output<void>();

  text = signal('');
  picking = signal(false);
  private field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');

  constructor() {
    afterNextRender(() => {
      this.text.set(this.initial());
      const field = this.field().nativeElement;
      field.value = this.initial();
      field.focus();
      field.setSelectionRange(field.value.length, field.value.length);
    });
  }


  canSave(): boolean {
    return this.text().trim().length > 0;
  }


  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.picking()) {
      event.preventDefault();
      this.cancelled.emit();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.save();
    }
  }


  /** Puts the emoji where the cursor is. */
  insertEmoji(emoji: string): void {
    const field = this.field().nativeElement;
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? start;
    field.value = field.value.slice(0, start) + emoji + field.value.slice(end);
    this.text.set(field.value);
    this.picking.set(false);
    field.focus();
    field.setSelectionRange(start + emoji.length, start + emoji.length);
  }


  /** Unchanged text only closes the editor. */
  save(): void {
    if (!this.canSave()) return;
    const text = this.text().trim();
    if (text === this.initial().trim()) this.cancelled.emit();
    else this.saved.emit(text);
  }
}
