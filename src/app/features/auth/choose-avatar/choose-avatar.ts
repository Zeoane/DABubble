import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, authErrorCode } from '../../../core/services/auth.service';
import { RegistrationService } from '../../../core/services/registration.service';
import { LegalLinks } from '../../../shared/components/legal-links/legal-links';
import { Logo } from '../../../shared/components/logo/logo';
import { Toast } from '../../../shared/components/toast/toast';

const TOAST_DURATION = 1500;

@Component({
  selector: 'app-choose-avatar',
  imports: [RouterLink, Logo, LegalLinks, Toast],
  templateUrl: './choose-avatar.html',
  styleUrl: './choose-avatar.scss',
})
export class ChooseAvatar {
  private router = inject(Router);
  private auth = inject(AuthService);
  registration = inject(RegistrationService);

  loading = signal(false);
  success = signal(false);
  failed = signal(false);


  constructor() {
    if (!this.registration.data()) {
      this.router.navigate(['/registrierung']);
    }
  }


  selectAvatar(path: string): void {
    this.registration.selectAvatar(path);
  }


  /**
   * Creates the Firebase account with the chosen avatar.
   */
  async finish(): Promise<void> {
    const data = this.registration.data();
    const avatar = this.registration.avatar();
    if (!data || !avatar || this.loading()) return;
    this.loading.set(true);
    this.failed.set(false);
    try {
      await this.auth.register(data, avatar);
      this.showSuccess();
    } catch (error) {
      this.handleError(error);
    }
  }


  /**
   * Shows the confirmation, then sends the user to the login.
   */
  private showSuccess(): void {
    this.success.set(true);
    setTimeout(async () => {
      await this.auth.logOut();
      this.registration.reset();
      this.router.navigate(['/']);
    }, TOAST_DURATION);
  }


  /**
   * A taken email is shown in the form, everything else below the button.
   */
  private handleError(error: unknown): void {
    this.loading.set(false);
    if (authErrorCode(error) === 'auth/email-already-in-use') {
      this.registration.takenEmail.set(this.registration.data()?.email ?? null);
      this.router.navigate(['/registrierung']);
      return;
    }
    this.failed.set(true);
  }
}
