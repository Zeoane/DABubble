import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, authErrorCode } from '../../../core/services/auth.service';
import { IntroService } from '../../../core/services/intro.service';
import { EMAIL_PATTERN } from '../../../core/validators/patterns';
import { LegalLinks } from '../../../shared/components/legal-links/legal-links';
import { Logo } from '../../../shared/components/logo/logo';
import { Intro } from '../intro/intro';

const LOGIN_ERRORS: Record<string, string> = {
  'auth/invalid-credential': '*Falsches Passwort oder E-Mail. Bitte noch einmal versuchen.',
  'auth/too-many-requests': '*Zu viele Versuche. Bitte versuchen Sie es später erneut.',
};
const DEFAULT_LOGIN_ERROR = '*Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es später erneut.';
const POPUP_CLOSED = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Logo, LegalLinks, Intro],
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

  showIntro = signal(inject(IntroService).shouldPlay());
  loading = signal(false);
  loginError = signal<string | null>(null);
  googleError = signal<string | null>(null);
  guestError = signal<string | null>(null);


  /** Hides the login error as soon as the user types again. */
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


  /**
   * Opens the Google popup; closing it on purpose shows no error.
   */
  async logInWithGoogle(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.googleError.set(null);
    try {
      await this.auth.logInWithGoogle();
      this.router.navigate(['/workspace']);
    } catch (error) {
      const code = authErrorCode(error);
      if (!POPUP_CLOSED.includes(code)) this.googleError.set(LOGIN_ERRORS[code] ?? DEFAULT_LOGIN_ERROR);
      this.loading.set(false);
    }
  }


  /**
   * Signs in as guest, without email or password.
   */
  async logInAsGuest(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.guestError.set(null);
    try {
      await this.auth.logInAsGuest();
      this.router.navigate(['/workspace']);
    } catch (error) {
      this.guestError.set(LOGIN_ERRORS[authErrorCode(error)] ?? DEFAULT_LOGIN_ERROR);
      this.loading.set(false);
    }
  }
}
