import { Component, inject, input, output } from '@angular/core';
import { AppUser } from '../../../core/models/user-profile';
import { ProfileViewService } from '../../../core/services/profile-view.service';
import { PresenceService } from '../../../core/services/presence.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';

/**
 * Channel members with "Mitglieder hinzufügen" at the end (Figma 43. Members). A click on a member opens the profile card.
 */
@Component({
  selector: 'app-member-list',
  imports: [Avatar],
  templateUrl: './member-list.html',
  styleUrl: './member-list.scss',
})
export class MemberList {
  users = inject(UserService);
  profiles = inject(ProfileViewService);
  presence = inject(PresenceService);

  readonly members = input.required<AppUser[]>();
  readonly add = output<void>();
}
