import { Location } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Logo } from '../../../shared/components/logo/logo';

@Component({
  selector: 'app-legal-page',
  imports: [Logo, Avatar, RouterLink],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss',
})
export class LegalPage {
  private location = inject(Location);
  private router = inject(Router);

  readonly title = input.required<string>();
  readonly card = input(false);

  readonly me = inject(UserService).currentUser;
  readonly home = computed(() => (this.me() ? '/workspace' : '/'));


  /**
   * Returns to the previous page, or to the start page when the page was opened directly.
   */
  goBack(): void {
    if (history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate([this.home()]);
    }
  }
}
