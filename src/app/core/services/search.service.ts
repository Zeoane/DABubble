import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { Message } from '../models/message';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { UserService } from './user.service';

export interface SearchChat {
  path: string;
  label: string;
  route: string[];
}

export interface SearchHit {
  message: Message;
  chat: SearchChat;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private users = inject(UserService);
  private channels = inject(ChannelService);
  private messages = inject(MessageService);

  readonly active = signal(false);

  readonly chats = computed<SearchChat[]>(() => {
    const me = this.users.uid();
    if (!me) return [];
    const channels = this.channels.mine().map((channel) => ({
      path: 'channels/' + channel.id,
      label: '#' + channel.name,
      route: ['/workspace/channel', channel.id],
    }));
    const direct = this.users.contacts().map((user) => ({
      path: this.messages.directPath(me, user.uid),
      label: user.uid === me ? user.name + ' (Du)' : user.name,
      route: ['/workspace/dm', user.uid],
    }));
    return [...channels, ...direct];
  });

  private watched = computed(() => (this.active() ? this.chats() : []), {
    equal: (a, b) => a.length === b.length && a.every((chat, i) => chat.path === b[i].path && chat.label === b[i].label),
  });

  private all = toSignal(
    toObservable(this.watched).pipe(
      switchMap((chats) =>
        chats.length
          ? combineLatest(
              chats.map((chat) =>
                this.messages.watch(chat.path + '/messages').pipe(map((list) => list.map((message) => ({ message, chat })))),
              ),
            )
          : of([]),
      ),
      map((lists) => lists.flat()),
    ),
    { initialValue: [] as SearchHit[] },
  );


  /** Messages containing all words of the term, newest first. */
  find(term: string, limit = 20): SearchHit[] {
    const words = term.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return this.all()
      .filter((hit) => words.every((word) => hit.message.text.toLowerCase().includes(word)))
      .sort((a, b) => (b.message.createdAt?.toMillis() ?? 0) - (a.message.createdAt?.toMillis() ?? 0))
      .slice(0, limit);
  }
}
