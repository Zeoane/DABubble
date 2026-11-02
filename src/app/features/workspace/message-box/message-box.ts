import { Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';

/**
 * Text field with send button (Figma 61. Message box main).
 * Enter sends, Shift+Enter starts a new line.
 */
@Component({
  selector: 'app-message-box',
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


  send(): void {
    if (!this.canSend()) return;
    this.sent.emit(this.text().trim());
    this.text.set('');
    this.field().nativeElement.focus();
  }
}
