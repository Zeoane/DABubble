import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Logo } from '../../shared/components/logo/logo';

/**
 * Placeholder after login until the real workspace is built.
 */
@Component({
  selector: 'app-workspace',
  imports: [AsyncPipe, Logo],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {
  private auth = inject(AuthService);
  private router = inject(Router);

  user$ = this.auth.user$;


  async logOut(): Promise<void> {
    await this.auth.logOut();
    this.router.navigate(['/']);
  }
}
