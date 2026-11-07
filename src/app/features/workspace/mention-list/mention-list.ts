import { Component, inject, input, output } from '@angular/core';
import { PresenceService } from '../../../core/services/presence.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';

export interface MentionOption {
  id: string;
  /** Inserted after "@" / "#". */
  value: string;
  /** Shown in the list, e.g. "Frederik Beck (Du)". */
  label: string;
  /** Avatar of a person; channels have none. */
  avatar?: string;
}

/**
 * Suggestions above the message box while typing "@" or "#"
 * (Figma "Tagging person", User searching menu).
 */
@Component({
  selector: 'app-mention-list',
  imports: [Avatar],
  template: `
    <ul class="list" role="listbox" [attr.aria-label]="channels() ? 'Channels' : 'Personen'">
      @for (option of options(); track option.id; let index = $index) {
        <li
          class="option"
          role="option"
          [class.active]="index === active()"
          [attr.aria-selected]="index === active()"
          (mousedown)="$event.preventDefault()"
          (click)="picked.emit(option)"
        >
          @if (option.avatar) {
            <app-avatar [src]="option.avatar" [status]="statusOf(option)" />
          } @else {
            <span class="icon icon-tag" aria-hidden="true"></span>
          }
          <span class="label">{{ option.label }}</span>
        </li>
      } @empty {
        <li class="empty">{{ channels() ? 'Kein Channel gefunden' : 'Niemand gefunden' }}</li>
      }
    </ul>
  `,
  styleUrl: './mention-list.scss',
})
export class MentionList {
  private users = inject(UserService);
  private presence = inject(PresenceService);

  readonly options = input.required<MentionOption[]>();
  readonly active = input(0);
  readonly channels = input(false);
  readonly picked = output<MentionOption>();


  /** Status dot of a person (the option id is their uid). */
  statusOf(option: MentionOption) {
    return this.presence.statusOf(this.users.users().find((user) => user.uid === option.id));
  }
}
