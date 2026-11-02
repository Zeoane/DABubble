import { EnvironmentInjector, Injectable, computed, inject, runInInjectionContext } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, addDoc, collection, collectionData, serverTimestamp } from '@angular/fire/firestore';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Channel } from '../models/channel';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

/**
 * Channels from Firestore: all of them (for the duplicate check) and the ones
 * the signed-in member belongs to (for the menu).
 */
@Injectable({ providedIn: 'root' })
export class ChannelService {
  private auth = inject(AuthService);
  private users = inject(UserService);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  private readonly state = toSignal(
    this.auth.user$.pipe(switchMap((user) => (user ? this.watchChannels() : of(null)))),
    { initialValue: null },
  );

  /** False until the first list arrived from Firestore. */
  readonly loaded = computed(() => this.state() !== null);

  readonly all = computed(() => this.state() ?? []);

  readonly mine = computed(() => {
    const uid = this.users.uid();
    return this.all()
      .filter((channel) => uid && channel.members.includes(uid))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  });


  byId(id: string): Channel | undefined {
    return this.all().find((channel) => channel.id === id);
  }


  /**
   * Channel names are unique, ignoring upper/lower case.
   */
  isNameTaken(name: string): boolean {
    const wanted = normalizeName(name).toLowerCase();
    return this.all().some((channel) => channel.name.toLowerCase() === wanted);
  }


  /**
   * Creates the channel with the creator as first member; returns its id.
   */
  async create(name: string, description: string, memberIds: string[]): Promise<string> {
    const uid = this.users.uid();
    if (!uid) throw new Error('Nicht angemeldet');
    const data = {
      name: normalizeName(name),
      description: description.trim(),
      createdBy: uid,
      createdAt: serverTimestamp(),
      members: [...new Set([uid, ...memberIds])],
    };
    const ref = await this.inContext(() => addDoc(collection(this.firestore, 'channels'), data));
    return ref.id;
  }


  private watchChannels(): Observable<Channel[]> {
    const data$ = this.inContext(() =>
      collectionData(collection(this.firestore, 'channels'), { idField: 'id' }),
    );
    return (data$ as Observable<Channel[]>).pipe(
      map((channels) => channels.map(withDefaults)),
      catchError(() => of([])),
    );
  }


  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}


/** "#Marketing " → "Marketing" */
export function normalizeName(name: string): string {
  return name.trim().replace(/^#+\s*/, '');
}


function withDefaults(channel: Channel): Channel {
  return { ...channel, description: channel.description ?? '', members: channel.members ?? [] };
}
