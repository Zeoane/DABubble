import { Component, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { Message } from '../../../core/models/message';
import { ChannelService } from '../../../core/services/channel.service';
import { MessageService } from '../../../core/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { MessageBox } from '../message-box/message-box';
import { MessageItem } from '../message-item/message-item';

export interface ThreadTarget {
  kind: 'channel' | 'dm';
  /** Channel id, or the uid of the other member in a direct chat. */
  chatId: string;
  messageId: string;
}

/**
 * Thread next to the chat (Figma 06 "Secondary chat", mobile 08): the message,
 * "x Antworten", the answers and a box to answer.
 */
@Component({
  selector: 'app-thread-view',
  imports: [MessageItem, MessageBox],
  templateUrl: './thread-view.html',
  styleUrl: './thread-view.scss',
})
export class ThreadView {
  private router = inject(Router);
  private channels = inject(ChannelService);
  private messages = inject(MessageService);
  users = inject(UserService);

  readonly target = input.required<ThreadTarget>();
  private scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  chatPath = computed(() => this.pathOf(this.target()));
  listPath = computed(() => this.chatPath() + '/messages');
  repliesPath = computed(() => this.listPath() + '/' + this.target().messageId + '/replies');

  message = toSignal(
    toObservable(computed(() => [this.listPath(), this.target().messageId] as const)).pipe(
      switchMap(([list, id]) => this.messages.watchOne(list, id).pipe(map((message) => ({ message })))),
    ),
  );

  replies = toSignal(toObservable(this.repliesPath).pipe(switchMap((path) => this.messages.watch(path))), {
    initialValue: [] as Message[],
  });

  /** "# Entwicklerteam" in a channel, the other member's name in a direct chat. */
  subtitle = computed(() => {
    const { kind, chatId } = this.target();
    if (kind === 'channel') return this.channels.byId(chatId)?.name ?? '';
    return this.users.users().find((user) => user.uid === chatId)?.name ?? '';
  });

  count = computed(() => (this.replies().length === 1 ? '1 Antwort' : this.replies().length + ' Antworten'));
  sending = signal(false);
  sendFailed = signal(false);

  constructor() {
    effect(() => {
      this.replies();
      const element = this.scroller()?.nativeElement;
      if (element) setTimeout(() => (element.scrollTop = element.scrollHeight));
    });
    effect(() => {
      this.target();
      this.sendFailed.set(false);
    });
  }


  author(message: Message) {
    return this.users.users().find((user) => user.uid === message.authorId);
  }


  async send(text: string): Promise<void> {
    this.sending.set(true);
    this.sendFailed.set(false);
    try {
      await this.messages.reply(this.chatPath(), this.target().messageId, text);
    } catch {
      this.sendFailed.set(true);
    }
    this.sending.set(false);
  }


  close(): void {
    this.router.navigateByUrl(this.router.url.split('?')[0]);
  }


  private pathOf({ kind, chatId }: ThreadTarget): string {
    if (kind === 'channel') return 'channels/' + chatId;
    return this.messages.directPath(this.users.uid() ?? '', chatId);
  }
}
