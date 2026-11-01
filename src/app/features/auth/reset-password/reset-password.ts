import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LegalLinks } from '../../../shared/components/legal-links/legal-links';
import { Logo } from '../../../shared/components/logo/logo';
import { Toast } from '../../../shared/components/toast/toast';

const TOAST_DURATION = 1500;
const LINK_ERROR = '*Der Link ist ungültig oder abgelaufen. Bitte fordern Sie eine neue E-Mail an.';

type PasswordField = 'password' | 'confirm';

/**
 * Opened from the reset mail; the link carries the one-time "oobCode".
 */
@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, Logo, LegalLinks, Toast],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private code = inject(ActivatedRoute).snapshot.queryParamMap.get('oobCode') ?? '';

  form = this.formBuilder.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  loading = signal(false);
  changed = signal(false);
  linkError = signal<string | null>(null);


  constructor() {
    this.auth.verifyResetCode(this.code).catch(() => this.linkError.set(LINK_ERROR));
  }


  showError(field: PasswordField): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }


  hasError(field: PasswordField, error: string): boolean {
    return this.form.controls[field].hasError(error);
  }


  /**
   * The mismatch hint appears once the second field has been left.
   */
  showMismatch(): boolean {
    return this.form.hasError('mismatch') && this.form.controls.confirm.touched;
  }


  /**
   * Saves the new password, then sends the user back to the login.
   */
  async changePassword(): Promise<void> {
    if (this.form.invalid || this.loading() || this.linkError()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    try {
      await this.auth.resetPassword(this.code, this.form.getRawValue().password);
      this.changed.set(true);
      setTimeout(() => this.router.navigate(['/']), TOAST_DURATION);
    } catch {
      this.loading.set(false);
      this.linkError.set(LINK_ERROR);
    }
  }
}


function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const { password, confirm } = group.value;
  return confirm && password !== confirm ? { mismatch: true } : null;
}
