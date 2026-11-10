import { EnvironmentInjector, Injectable, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Firestore, doc, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { AppUser } from '../models/user-profile';
import { UserService } from './user.service';

export type OnlineStatus = 'online' | 'away' | 'offline';

const HEARTBEAT_MS = 60_000;
const OFFLINE_AFTER_MS = 150_000;

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private users = inject(UserService);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  private now = signal(Date.now());
  private started = false;


  /** Starts reporting the own status; called once by the workspace. */
  start(): void {
    if (this.started) return;
    this.started = true;
    setInterval(() => this.report(), HEARTBEAT_MS);
    setInterval(() => this.now.set(Date.now()), 30_000);
    document.addEventListener('visibilitychange', () => this.report());
    runInInjectionContext(this.injector, () => effect(() => this.users.uid() && this.report()));
  }


  /** Current status of a member: online, away or offline. */
  statusOf(user: AppUser | null | undefined): OnlineStatus {
    if (user && user.uid === this.users.uid()) return 'online';
    if (!user || user.presence === 'offline' || !user.lastActive) return 'offline';
    if (this.now() - user.lastActive.toMillis() > OFFLINE_AFTER_MS) return 'offline';
    return user.presence ?? 'offline';
  }


  /** "Aktiv", "Abwesend" or "Offline", as in the profile card. */
  labelOf(user: AppUser | null | undefined): string {
    return { online: 'Aktiv', away: 'Abwesend', offline: 'Offline' }[this.statusOf(user)];
  }


  /** Saves the own status and time stamp in the profile. */
  private report(): void {
    const uid = this.users.uid();
    if (!uid) return;
    const presence = document.visibilityState === 'visible' ? 'online' : 'away';
    runInInjectionContext(this.injector, () =>
      updateDoc(doc(this.firestore, 'users', uid), { presence, lastActive: serverTimestamp() }),
    ).catch(() => undefined);
  }
}
