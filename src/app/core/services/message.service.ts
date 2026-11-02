import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, orderBy, query, serverTimestamp } from '@angular/fire/firestore';
import { Observable, catchError, of } from 'rxjs';
import { Message } from '../models/message';
import { UserService } from './user.service';

/**
 * Messages of a channel, oldest first.
 */
@Injectable({ providedIn: 'root' })
export class MessageService {
  private firestore = inject(Firestore);
  private users = inject(UserService);
  private injector = inject(EnvironmentInjector);


  watch(channelId: string): Observable<Message[]> {
    const messages$ = this.inContext(() => {
      const ref = collection(this.firestore, 'channels', channelId, 'messages');
      return collectionData(query(ref, orderBy('createdAt')), { idField: 'id' });
    });
    return (messages$ as Observable<Message[]>).pipe(catchError(() => of([])));
  }


  async send(channelId: string, text: string): Promise<void> {
    const authorId = this.users.uid();
    if (!authorId) throw new Error('Nicht angemeldet');
    const data = { text: text.trim(), authorId, createdAt: serverTimestamp() };
    await this.inContext(() => addDoc(collection(this.firestore, 'channels', channelId, 'messages'), data));
  }


  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}
