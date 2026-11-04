import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ProfileDialog } from '../profile-dialog/profile-dialog';

/**
 * Name and avatar at the top right; opens "Profil" / "Log out"
 * (Figma 65. Profile menu, 64. Edit user and Log out).
 */
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

  open = signal(false);
  profileOpen = signal(false);


  toggle(): void {
    this.open.update((open) => !open);
  }


  close(): void {
    this.open.set(false);
  }


  showProfile(): void {
    this.close();
    this.profileOpen.set(true);
  }


  async logOut(): Promise<void> {
    this.close();
    await this.auth.logOut();
    this.router.navigate(['/']);
  }
}
