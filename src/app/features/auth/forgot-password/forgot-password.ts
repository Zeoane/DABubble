import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, authErrorCode } from '../../../core/services/auth.service';
import { emailMessage } from '../../../core/validators/form-errors';
import { EMAIL_PATTERN } from '../../../core/validators/patterns';
import { LegalLinks } from '../../../shared/components/legal-links/legal-links';
import { Logo } from '../../../shared/components/logo/logo';
import { Toast } from '../../../shared/components/toast/toast';

const TOAST_DURATION = 1500;

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, Logo, LegalLinks, Toast],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
  });

  readonly emailMessage = emailMessage;
  loading = signal(false);
  sent = signal(false);
  sendError = signal<string | null>(null);


  /** True if the e-mail field shows an error. */
  showError(): boolean {
    const control = this.form.controls.email;
    return control.invalid && control.touched;
  }


  /**
   * Asks Firebase for the reset mail, then shows the confirmation.
   */
  async send(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.sendError.set(null);
    try {
      await this.auth.sendPasswordReset(this.form.getRawValue().email);
      this.showSent();
    } catch (error) {
      this.loading.set(false);
      this.sendError.set(sendErrorMessage(authErrorCode(error)));
    }
  }


  /** Shows the confirmation and returns to the login afterwards. */
  private showSent(): void {
    this.sent.set(true);
    setTimeout(() => this.router.navigate(['/']), TOAST_DURATION);
  }
}


/** Error text for a failed reset mail. */
function sendErrorMessage(code: string): string {
  return code === 'auth/too-many-requests'
    ? '*Zu viele Versuche. Bitte versuchen Sie es später erneut.'
    : '*Die E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.';
}
