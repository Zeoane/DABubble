import { Injectable, signal } from '@angular/core';

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

/**
 * Keeps the sign-up data in memory between the form and the avatar step.
 */
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  readonly data = signal<RegistrationData | null>(null);
  readonly avatar = signal<string | null>(null);
  readonly emailTaken = signal(false);

  readonly avatars = [1, 2, 3, 4, 5, 6].map((n) => `img/avatars/avatar-${n}.svg`);


  saveData(data: RegistrationData): void {
    this.data.set(data);
    this.emailTaken.set(false);
  }


  selectAvatar(path: string): void {
    this.avatar.set(path);
  }


  reset(): void {
    this.data.set(null);
    this.avatar.set(null);
    this.emailTaken.set(false);
  }
}
