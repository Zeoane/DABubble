import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  FieldPath,
  Firestore,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  collectionData,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, catchError, of } from 'rxjs';
import { Message } from '../models/message';
import { UserService } from './user.service';

/**
 * Messages of a chat, oldest first. A chat is a channel ("channels/{id}") or a
 * direct conversation ("directMessages/{uidA_uidB}").
 */
@Injectable({ providedIn: 'root' })
export class MessageService {
  private firestore = inject(Firestore);
  private users = inject(UserService);
  private injector = inject(EnvironmentInjector);


  watch(chatPath: string): Observable<Message[]> {
    const messages$ = this.inContext(() => {
      const ref = collection(this.firestore, chatPath, 'messages');
      return collectionData(query(ref, orderBy('createdAt')), { idField: 'id' });
    });
    return (messages$ as Observable<Message[]>).pipe(catchError(() => of([])));
  }


  async send(chatPath: string, text: string): Promise<void> {
    const authorId = this.users.uid();
    if (!authorId) throw new Error('Nicht angemeldet');
    const data = { text: text.trim(), authorId, createdAt: serverTimestamp() };
    await this.inContext(() => addDoc(collection(this.firestore, chatPath, 'messages'), data));
  }


  /** Adds or removes the signed-in member's reaction with this emoji. */
  async react(chatPath: string, messageId: string, emoji: string, add: boolean): Promise<void> {
    const uid = this.users.uid();
    if (!uid) return;
    const change = add ? arrayUnion(uid) : arrayRemove(uid);
    await this.inContext(() =>
      updateDoc(doc(this.firestore, chatPath, 'messages', messageId), new FieldPath('reactions', emoji), change),
    );
  }


  /** Path of the direct chat between two members; the same for both sides. */
  directPath(uidA: string, uidB: string): string {
    return 'directMessages/' + [uidA, uidB].sort().join('_');
  }


  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}
