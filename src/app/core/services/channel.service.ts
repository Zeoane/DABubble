import { EnvironmentInjector, Injectable, computed, inject, runInInjectionContext } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  collectionData,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Channel } from '../models/channel';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

const GENERAL_ID = 'allgemein';
const GENERAL_CHANNEL = {
  name: 'Allgemein',
  description: 'Hier treffen sich alle Mitglieder von DABubble.',
};

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

  readonly loaded = computed(() => this.state() !== null);

  readonly all = computed(() => this.state() ?? []);

  readonly mine = computed(() => {
    const uid = this.users.uid();
    return this.all()
      .filter((channel) => uid && channel.members.includes(uid))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  });


  /** The channel with this id, if it exists. */
  byId(id: string): Channel | undefined {
    return this.all().find((channel) => channel.id === id);
  }


  /**
   * Channel names are unique, ignoring upper/lower case.
   */
  isNameTaken(name: string, exceptId?: string): boolean {
    const wanted = normalizeName(name).toLowerCase();
    return this.all().some((channel) => channel.id !== exceptId && channel.name.toLowerCase() === wanted);
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


  /** Saves a new channel name. */
  rename(id: string, name: string): Promise<void> {
    return this.change(id, { name: normalizeName(name) });
  }


  /** Saves a new channel description. */
  describe(id: string, description: string): Promise<void> {
    return this.change(id, { description: description.trim() });
  }


  /** Adds members to the channel; existing ones are kept. */
  addMembers(id: string, memberIds: string[]): Promise<void> {
    return this.change(id, { members: arrayUnion(...memberIds) });
  }


  /**
   * Puts the signed-in member into the channel "Allgemein" that everyone shares;
   * the first member creates it. Returns the channel id.
   */
  async joinGeneral(uid = this.users.uid()): Promise<string> {
    if (!uid) return GENERAL_ID;
    const general = await this.inContext(() => getDoc(doc(this.firestore, 'channels', GENERAL_ID)));
    if (general.exists()) {
      if (!(general.get('members') ?? []).includes(uid)) await this.addMembers(GENERAL_ID, [uid]);
      return GENERAL_ID;
    }
    const data = { ...GENERAL_CHANNEL, createdBy: uid, createdAt: serverTimestamp(), members: [uid] };
    await this.inContext(() => setDoc(doc(this.firestore, 'channels', GENERAL_ID), data));
    return GENERAL_ID;
  }


  /** Removes the signed-in member from the channel. */
  leave(id: string): Promise<void> {
    return this.change(id, { members: arrayRemove(this.users.uid()) });
  }


  /** Updates fields of the channel document. */
  private change(id: string, data: Record<string, unknown>): Promise<void> {
    return this.inContext(() => updateDoc(doc(this.firestore, 'channels', id), data));
  }


  /** Streams all channels; an error ends in an empty list. */
  private watchChannels(): Observable<Channel[]> {
    const data$ = this.inContext(() =>
      collectionData(collection(this.firestore, 'channels'), { idField: 'id' }),
    );
    return (data$ as Observable<Channel[]>).pipe(
      map((channels) => channels.map(withDefaults)),
      catchError(() => of([])),
    );
  }


  /** Runs Firestore calls inside the injection context AngularFire needs. */
  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}


/** "#Marketing " → "Marketing" */
export function normalizeName(name: string): string {
  return name.trim().replace(/^#+\s*/, '');
}


/** Fills in fields that older channel documents may lack. */
function withDefaults(channel: Channel): Channel {
  return { ...channel, description: channel.description ?? '', members: channel.members ?? [] };
}
