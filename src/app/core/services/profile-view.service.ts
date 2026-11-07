import { Injectable, computed, inject, signal } from '@angular/core';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ProfileViewService {
  private users = inject(UserService);
  private openUid = signal<string | null>(null);

  readonly shown = computed(() => this.users.users().find((user) => user.uid === this.openUid()) ?? null);


  /** Shows the profile card of this member. */
  open(uid: string): void {
    this.openUid.set(uid);
  }


  /** Closes the profile card. */
  close(): void {
    this.openUid.set(null);
  }
}
