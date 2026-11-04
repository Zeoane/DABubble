import { Injectable, computed, inject, signal } from '@angular/core';
import { UserService } from './user.service';

/**
 * Which member's profile card is open (Figma 65. Profile view other users).
 * Anyone can open it, e.g. a click on a name in a message or in the member list.
 */
@Injectable({ providedIn: 'root' })
export class ProfileViewService {
  private users = inject(UserService);
  private openUid = signal<string | null>(null);

  /** The member whose card is shown; live, so a new name or avatar shows at once. */
  readonly shown = computed(() => this.users.users().find((user) => user.uid === this.openUid()) ?? null);


  open(uid: string): void {
    this.openUid.set(uid);
  }


  close(): void {
    this.openUid.set(null);
  }
}
