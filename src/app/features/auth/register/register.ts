import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from '../../../core/services/registration.service';
import { emailMessage, passwordProblem, passwordRule } from '../../../core/validators/form-errors';
import { EMAIL_PATTERN, NAME_PATTERN } from '../../../core/validators/patterns';
import { LegalLinks } from '../../../shared/components/legal-links/legal-links';
import { Logo } from '../../../shared/components/logo/logo';

type RegisterField = 'name' | 'email' | 'password' | 'privacy';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Logo, LegalLinks],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private registration = inject(RegistrationService);

  private emailNotTaken: ValidatorFn = (control: AbstractControl) =>
    control.value === this.registration.takenEmail() ? { taken: true } : null;


  registerForm = this.formBuilder.nonNullable.group({
    name: [this.registration.data()?.name ?? '', [Validators.required, Validators.pattern(NAME_PATTERN)]],
    email: [this.registration.data()?.email ?? '', [Validators.required, Validators.pattern(EMAIL_PATTERN), this.emailNotTaken]],
    password: [this.registration.data()?.password ?? '', passwordRule],
    privacy: [this.registration.data() !== null, Validators.requiredTrue],
  });

  readonly emailMessage = emailMessage;
  readonly passwordProblem = passwordProblem;


  /** Shows the error at once if the e-mail turned out to be taken. */
  constructor() {
    if (this.registration.takenEmail()) {
      this.registerForm.controls.email.markAsTouched();
    }
  }


  /**
   * Shows the error of a field only after the user has left it.
   */
  showError(field: RegisterField): boolean {
    const control = this.registerForm.controls[field];
    return control.invalid && control.touched;
  }


  /** Shows the password rule while typing or after leaving the field. */
  showPasswordHint(): boolean {
    const control = this.registerForm.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }


  /**
   * Tells which rule a field breaks, e.g. empty or too short.
   */
  hasError(field: RegisterField, error: string): boolean {
    return this.registerForm.controls[field].hasError(error);
  }


  /** Ticks or unticks the privacy policy checkbox. */
  togglePrivacy(): void {
    const control = this.registerForm.controls.privacy;
    control.setValue(!control.value);
    control.markAsTouched();
  }


  /**
   * Keeps the entered data and moves on to the avatar step.
   */
  continue(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.registerForm.getRawValue();
    this.registration.saveData({ name: name.trim(), email, password });
    this.router.navigate(['/registrierung/avatar']);
  }
}
