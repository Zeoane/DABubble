import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, authErrorCode } from '../../../core/services/auth.service';
import { LegalLinks } from '../../../shared/components/legal-links/legal-links';
import { Logo } from '../../../shared/components/logo/logo';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LOGIN_ERRORS: Record<string, string> = {
  'auth/invalid-credential': '*Falsches Passwort oder E-Mail. Bitte noch einmal versuchen.',
  'auth/too-many-requests': '*Zu viele Versuche. Bitte versuchen Sie es später erneut.',
};
const DEFAULT_LOGIN_ERROR = '*Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es später erneut.';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Logo, LegalLinks],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', Validators.required],
  });

  loading = signal(false);
  loginError = signal<string | null>(null);


  constructor() {
    this.loginForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.loginError.set(null));
  }


  /**
   * Shows the error of a field only after the user has left it.
   */
  showError(field: 'email' | 'password'): boolean {
    const control = this.loginForm.controls[field];
    return control.invalid && control.touched;
  }


  /**
   * Signs the user in and opens the workspace.
   */
  async logIn(): Promise<void> {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.getRawValue();
    this.loading.set(true);
    try {
      await this.auth.logIn(email, password);
      this.router.navigate(['/workspace']);
    } catch (error) {
      this.loginError.set(LOGIN_ERRORS[authErrorCode(error)] ?? DEFAULT_LOGIN_ERROR);
      this.loading.set(false);
    }
  }
}
