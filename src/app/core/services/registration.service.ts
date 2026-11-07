import { Injectable, signal } from '@angular/core';

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  readonly data = signal<RegistrationData | null>(null);
  readonly avatar = signal<string | null>(null);
  readonly takenEmail = signal<string | null>(null);

  readonly avatars = [1, 2, 3, 4, 5, 6].map((n) => `img/avatars/avatar-${n}.svg`);


  /** Keeps the form data of step 1 until the avatar is chosen. */
  saveData(data: RegistrationData): void {
    this.data.set(data);
  }


  /** Remembers the chosen avatar. */
  selectAvatar(path: string): void {
    this.avatar.set(path);
  }


  /** Forgets all data of the sign-up. */
  reset(): void {
    this.data.set(null);
    this.avatar.set(null);
    this.takenEmail.set(null);
  }
}
