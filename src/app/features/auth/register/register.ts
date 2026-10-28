import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from '../../../core/services/registration.service';
import { LegalLinks } from '../../../shared/components/legal-links/legal-links';
import { Logo } from '../../../shared/components/logo/logo';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_PATTERN = /^\S+(\s+\S+)+$/;

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

  registerForm = this.formBuilder.nonNullable.group({
    name: [this.registration.data()?.name ?? '', [Validators.required, Validators.pattern(NAME_PATTERN)]],
    email: [this.registration.data()?.email ?? '', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: [this.registration.data()?.password ?? '', [Validators.required, Validators.minLength(8)]],
    privacy: [this.registration.data() !== null, Validators.requiredTrue],
  });


  constructor() {
    if (this.registration.emailTaken()) {
      this.registerForm.controls.email.setErrors({ taken: true });
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


  /**
   * Tells which rule a field breaks, e.g. empty or too short.
   */
  hasError(field: RegisterField, error: string): boolean {
    return this.registerForm.controls[field].hasError(error);
  }


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
