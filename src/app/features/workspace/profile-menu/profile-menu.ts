import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PresenceService } from '../../../core/services/presence.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ProfileDialog } from '../profile-dialog/profile-dialog';

@Component({
  selector: 'app-profile-menu',
  imports: [Avatar, ProfileDialog],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class ProfileMenu {
  private auth = inject(AuthService);
  private router = inject(Router);
  users = inject(UserService);
  presence = inject(PresenceService);

  open = signal(false);
  profileOpen = signal(false);


  /** Opens or closes the menu. */
  toggle(): void {
    this.open.update((open) => !open);
  }


  /** Closes the menu. */
  close(): void {
    this.open.set(false);
  }


  /** Opens the own profile. */
  showProfile(): void {
    this.close();
    this.profileOpen.set(true);
  }


  /** Logs out and returns to the login page. */
  async logOut(): Promise<void> {
    this.close();
    await this.auth.logOut();
    this.router.navigate(['/']);
  }
}
