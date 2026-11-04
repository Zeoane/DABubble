import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileViewService } from '../../../core/services/profile-view.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';

/**
 * Profile card of another member (Figma 65. Profile view other users): picture,
 * name, e-mail and "Nachricht", which opens the direct chat with them.
 */
@Component({
  selector: 'app-member-profile',
  imports: [Avatar],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.scss',
  host: { '(document:keydown.escape)': 'profiles.close()' },
})
export class MemberProfile {
  profiles = inject(ProfileViewService);
  users = inject(UserService);
  private router = inject(Router);


  writeTo(uid: string): void {
    this.profiles.close();
    this.router.navigate(['/workspace/dm', uid]);
  }
}
