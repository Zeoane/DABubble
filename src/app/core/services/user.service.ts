import { EnvironmentInjector, Injectable, computed, inject, runInInjectionContext } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { AppUser } from '../models/user-profile';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  readonly uid = toSignal(this.auth.user$.pipe(map((user) => user?.uid ?? null)), {
    initialValue: null,
  });

  readonly users = toSignal(
    this.auth.user$.pipe(switchMap((user) => (user ? this.watchUsers() : of([])))),
    { initialValue: [] as AppUser[] },
  );

  readonly currentUser = computed(() => this.users().find((user) => user.uid === this.uid()) ?? null);

  readonly contacts = computed(() => sortContacts(this.users(), this.uid()));


  /**
   * Streams "users"; after logging out the listener ends with an empty list.
   */
  private watchUsers(): Observable<AppUser[]> {
    const data$ = runInInjectionContext(this.injector, () =>
      collectionData(collection(this.firestore, 'users'), { idField: 'uid' }),
    );
    return (data$ as Observable<AppUser[]>).pipe(catchError(() => of([])));
  }
}


/**
 * Own profile first, then everyone else by name. Guests (no email) only see themselves.
 */
function sortContacts(users: AppUser[], uid: string | null): AppUser[] {
  const me = users.filter((user) => user.uid === uid);
  const others = users
    .filter((user) => user.uid !== uid && user.email)
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  return [...me, ...others];
}
