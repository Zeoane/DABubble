import { Component, input, output } from '@angular/core';
import { AppUser } from '../../../core/models/user-profile';
import { MemberList } from '../member-list/member-list';

/**
 * Members popup under the member faces (Figma 43. Members, desktop).
 */
@Component({
  selector: 'app-channel-members',
  imports: [MemberList],
  template: `
    <div class="backdrop" (click)="closed.emit()"></div>
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="members-title">
      <header>
        <h2 id="members-title">Mitglieder</h2>
        <button type="button" class="close" aria-label="Schließen" (click)="closed.emit()">
          <span class="icon icon-close" aria-hidden="true"></span>
        </button>
      </header>
      <app-member-list [members]="members()" (add)="addMembers.emit()" />
    </section>
  `,
  styleUrl: './channel-members.scss',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class ChannelMembers {
  readonly members = input.required<AppUser[]>();
  readonly closed = output<void>();
  readonly addMembers = output<void>();
}
