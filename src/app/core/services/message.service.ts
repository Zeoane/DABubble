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
  docData,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable, catchError, map, of } from 'rxjs';
import { Message } from '../models/message';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private firestore = inject(Firestore);
  private users = inject(UserService);
  private injector = inject(EnvironmentInjector);


  /** Streams the messages of a list, oldest first; an error ends in an empty list. */
  watch(listPath: string): Observable<Message[]> {
    const messages$ = this.inContext(() => {
      const ref = collection(this.firestore, listPath);
      return collectionData(query(ref, orderBy('createdAt')), { idField: 'id' });
    });
    return (messages$ as Observable<Message[]>).pipe(catchError(() => of([])));
  }


  /** One message; undefined while it does not exist or cannot be read. */
  watchOne(listPath: string, messageId: string): Observable<Message | undefined> {
    const message$ = this.inContext(() => docData(doc(this.firestore, listPath, messageId), { idField: 'id' }));
    return (message$ as Observable<Message | undefined>).pipe(
      map((message) => (message?.authorId ? message : undefined)),
      catchError(() => of(undefined)),
    );
  }


  /** Sends a new message to the chat. */
  async send(chatPath: string, text: string): Promise<void> {
    const data = this.newMessage(text);
    await this.inContext(() => addDoc(collection(this.firestore, chatPath, 'messages'), data));
  }


  /** Saves the answer and counts it on the message, both or neither. */
  async reply(chatPath: string, messageId: string, text: string): Promise<void> {
    const data = this.newMessage(text);
    await this.inContext(() => {
      const message = doc(this.firestore, chatPath, 'messages', messageId);
      const batch = writeBatch(this.firestore);
      batch.set(doc(collection(message, 'replies')), data);
      batch.update(message, { replyCount: increment(1), lastReplyAt: serverTimestamp() });
      return batch.commit();
    });
  }


  /** Adds or removes the signed-in member's reaction with this emoji. */
  async react(listPath: string, messageId: string, emoji: string, add: boolean): Promise<void> {
    const uid = this.users.uid();
    if (!uid) return;
    const change = add ? arrayUnion(uid) : arrayRemove(uid);
    await this.inContext(() =>
      updateDoc(doc(this.firestore, listPath, messageId), new FieldPath('reactions', emoji), change),
    );
  }


  /** Changes the text of an own message or answer; the rules allow nothing else. */
  async edit(listPath: string, messageId: string, text: string): Promise<void> {
    await this.inContext(() => updateDoc(doc(this.firestore, listPath, messageId), { text: text.trim() }));
  }


  /** Path of the direct chat between two members; the same for both sides. */
  directPath(uidA: string, uidB: string): string {
    return 'directMessages/' + [uidA, uidB].sort().join('_');
  }


  /** Data of a new message from the signed-in member. */
  private newMessage(text: string) {
    const authorId = this.users.uid();
    if (!authorId) throw new Error('Nicht angemeldet');
    return { text: text.trim(), authorId, createdAt: serverTimestamp() };
  }


  /** Runs Firestore calls inside the injection context AngularFire needs. */
  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}
