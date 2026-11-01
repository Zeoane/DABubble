import { Location } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';

/**
 * Frame for Impressum and Datenschutz: logo, back button, title, content.
 */
@Component({
  selector: 'app-legal-page',
  imports: [Logo],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss',
})
export class LegalPage {
  private location = inject(Location);
  private router = inject(Router);

  readonly title = input.required<string>();
  readonly card = input(false);


  /**
   * Returns to the previous page, or to the login when the page was opened directly.
   */
  goBack(): void {
    if (history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
