import { EnvironmentInjector, Injectable, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Firestore, doc, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { AppUser } from '../models/user-profile';
import { UserService } from './user.service';

export type OnlineStatus = 'online' | 'away' | 'offline';

/** How often the own status is renewed while the app is open. */
const HEARTBEAT_MS = 60_000;
/** Without a sign of life for this long, a member counts as offline (closed tab, lost network). */
const OFFLINE_AFTER_MS = 150_000;

/**
 * Online status (Benutzeraccount, User Story 6): while the app is open, the own profile
 * gets "online" (tab in front) or "away" (tab in the background) and a time stamp every
 * minute. Others count as offline when the time stamp is too old or after logging out.
 */
@Injectable({ providedIn: 'root' })
export class PresenceService {
  private users = inject(UserService);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  /** Current time, renewed every 30 s, so old time stamps turn into "offline" on their own. */
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


  statusOf(user: AppUser | null | undefined): OnlineStatus {
    if (!user || user.presence === 'offline' || !user.lastActive) return 'offline';
    if (this.now() - user.lastActive.toMillis() > OFFLINE_AFTER_MS) return 'offline';
    return user.presence ?? 'offline';
  }


  /** "Aktiv", "Abwesend" or "Offline", as in the profile card. */
  labelOf(user: AppUser | null | undefined): string {
    return { online: 'Aktiv', away: 'Abwesend', offline: 'Offline' }[this.statusOf(user)];
  }


  private report(): void {
    const uid = this.users.uid();
    if (!uid) return;
    const presence = document.visibilityState === 'visible' ? 'online' : 'away';
    runInInjectionContext(this.injector, () =>
      updateDoc(doc(this.firestore, 'users', uid), { presence, lastActive: serverTimestamp() }),
    ).catch(() => undefined);
  }
}
