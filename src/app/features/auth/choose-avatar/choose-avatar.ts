import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from '../../../core/services/registration.service';
import { LegalLinks } from '../../../shared/components/legal-links/legal-links';
import { Logo } from '../../../shared/components/logo/logo';

@Component({
  selector: 'app-choose-avatar',
  imports: [RouterLink, Logo, LegalLinks],
  templateUrl: './choose-avatar.html',
  styleUrl: './choose-avatar.scss',
})
export class ChooseAvatar {
  private router = inject(Router);
  registration = inject(RegistrationService);


  constructor() {
    if (!this.registration.data()) {
      this.router.navigate(['/registrierung']);
    }
  }


  selectAvatar(path: string): void {
    this.registration.selectAvatar(path);
  }


  /**
   * Finishes the sign-up; the Firebase account follows in the next step.
   */
  finish(): void {
    if (!this.registration.avatar()) {
      return;
    }
  }
}
