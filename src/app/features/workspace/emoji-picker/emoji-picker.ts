import { Component, output } from '@angular/core';
import { EMOJIS } from '../../../core/services/recent-emojis.service';

@Component({
  selector: 'app-emoji-picker',
  template: `
    <div class="backdrop" (click)="closed.emit()"></div>
    <div class="grid" role="dialog" aria-label="Emoji auswählen">
      @for (emoji of emojis; track emoji) {
        <button type="button" class="emoji" [attr.aria-label]="emoji" (click)="picked.emit(emoji)">{{ emoji }}</button>
      }
    </div>
  `,
  styleUrl: './emoji-picker.scss',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class EmojiPicker {
  readonly emojis = EMOJIS;
  readonly picked = output<string>();
  readonly closed = output<void>();
}
